// Anmeldung, Sitzungen, PINs, Rollen
import { TEAM } from './generated/page.js';

const ITER = 100_000;                 // Obergrenze von PBKDF2 in Cloudflare Workers
const SESSION_IDLE = 30 * 864e5;      // Sitzung verfällt nach 30 Tagen ohne Nutzung
const LOCK = { max: 5, window: 15 * 6e4, ipMax: 30 };
const enc = new TextEncoder();

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function sha256(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }

async function pbkdf2(pin, saltHex, iter) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const salt = Uint8Array.from(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256));
}

/** Vergleich in konstanter Zeit, damit die Antwortzeit nichts über die PIN verrät */
export function same(a, b) {
  a = String(a ?? ''); b = String(b ?? '');
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}

export function member(name) { return TEAM.find((m) => m.n === name) || null; }
export function roleOf(m) { return m.monitor ? 'monitor' : m.lead ? 'lead' : 'team'; }

export async function audit(db, name, ev, detail) {
  await db.prepare('INSERT INTO audit (ts, name, ev, detail) VALUES (?, ?, ?, ?)').bind(Date.now(), name || null, ev, detail ? String(detail).slice(0, 500) : null).run();
}

async function locked(db, key, now) {
  const r = await db.prepare('SELECT n, first, until FROM attempts WHERE key = ?').bind(key).first();
  return r && r.until > now ? r.until : 0;
}
async function fail(db, key, max, now) {
  const r = await db.prepare('SELECT n, first FROM attempts WHERE key = ?').bind(key).first();
  const fresh = !r || now - r.first > LOCK.window;
  const n = fresh ? 1 : r.n + 1;
  const until = n >= max ? now + LOCK.window : 0;
  await db.prepare('INSERT OR REPLACE INTO attempts (key, n, first, until) VALUES (?, ?, ?, ?)').bind(key, n, fresh ? now : r.first, until).run();
}

export async function login(db, env, { name, pin }, ip) {
  const now = Date.now();
  const m = member(name);
  pin = String(pin ?? '');
  if (!m) return { status: 400, body: { error: 'Unbekannter Name' } };
  const kn = 'n:' + name, ki = 'ip:' + ip;
  const until = Math.max(await locked(db, kn, now), await locked(db, ki, now));
  if (until) return { status: 429, body: { error: `Zu viele Fehlversuche. Wieder möglich um ${new Date(until).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })}.` } };
  if (pin.length < 6) return { status: 400, body: { error: 'Die PIN hat mindestens 6 Zeichen' } };

  const u = await db.prepare('SELECT salt, hash, iter, ver FROM users WHERE name = ?').bind(name).first();
  let ok = false, how = 'pin';
  if (u) ok = same(await pbkdf2(pin, u.salt, u.iter), u.hash);
  if (!ok && m.lead && env.PIN_LEAD && same(pin, env.PIN_LEAD)) { ok = true; how = 'notfall'; }
  if (!ok && !u && !m.lead && env.ALLOW_SHARED === '1' && env.PIN_TEAM && same(pin, env.PIN_TEAM)) { ok = true; how = 'gruppe'; }

  if (!ok) {
    await fail(db, kn, LOCK.max, now); await fail(db, ki, LOCK.ipMax, now);
    await audit(db, name, 'login_fehler', ip);
    return { status: 401, body: { error: u || m.lead ? 'PIN stimmt nicht' : 'Für dich ist noch keine PIN gesetzt. Bitte an die Teamleitung wenden.' } };
  }
  await db.prepare('DELETE FROM attempts WHERE key = ?').bind(kn).run();
  const raw = new Uint8Array(32); crypto.getRandomValues(raw);
  const token = b64u(raw), role = roleOf(m);
  await db.prepare('INSERT INTO sessions (th, name, role, ver, created, seen) VALUES (?, ?, ?, ?, ?, ?)').bind(await sha256(token), name, role, u ? u.ver : 0, now, now).run();
  await audit(db, name, 'login', how + ' ' + ip);
  return { status: 200, body: { token, name, role } };
}

/** Liefert {name, role, th} für ein gültiges Bearer-Token, sonst null */
export async function session(db, request) {
  const h = request.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  if (token.length < 20) return null;
  const th = await sha256(token), now = Date.now();
  const s = await db.prepare('SELECT s.name, s.role, s.ver, s.seen, u.ver AS uver FROM sessions s LEFT JOIN users u ON u.name = s.name WHERE s.th = ?').bind(th).first();
  if (!s) return null;
  const stale = now - s.seen > SESSION_IDLE, revoked = s.uver != null && s.uver !== s.ver && s.ver !== 0;
  if (stale || revoked || !member(s.name)) { await db.prepare('DELETE FROM sessions WHERE th = ?').bind(th).run(); return null; }
  if (now - s.seen > 10 * 6e4) await db.prepare('UPDATE sessions SET seen = ? WHERE th = ?').bind(now, th).run();
  return { name: s.name, role: s.role, th };
}

export async function logout(db, who) { await db.prepare('DELETE FROM sessions WHERE th = ?').bind(who.th).run(); }

export async function setPin(db, who, { name, pin }) {
  if (who.role !== 'lead') return { status: 403, body: { error: 'Nur die Teamleitung setzt PINs' } };
  if (!member(name)) return { status: 400, body: { error: 'Unbekannter Name' } };
  pin = String(pin ?? '');
  if (pin.length < 6 || pin.length > 64) return { status: 400, body: { error: 'Die PIN braucht 6 bis 64 Zeichen' } };
  const salt = new Uint8Array(16); crypto.getRandomValues(salt);
  const saltHex = hex(salt), hash = await pbkdf2(pin, saltHex, ITER);
  const old = await db.prepare('SELECT ver FROM users WHERE name = ?').bind(name).first();
  const ver = (old ? old.ver : 0) + 1;
  await db.batch([
    db.prepare('INSERT OR REPLACE INTO users (name, salt, hash, iter, ver, ts) VALUES (?, ?, ?, ?, ?, ?)').bind(name, saltHex, hash, ITER, ver, Date.now()),
    // alle Geräte der Person abmelden – außer der Sitzung, in der die Teamleitung gerade ihre eigene PIN ändert
    db.prepare('DELETE FROM sessions WHERE name = ? AND th <> ?').bind(name, who.th),
    db.prepare('UPDATE sessions SET ver = ? WHERE th = ? AND name = ?').bind(ver, who.th, name),
  ]);
  await audit(db, who.name, 'pin_gesetzt', name);
  return { status: 200, body: { ok: 1 } };
}

export async function usersWithPin(db, who) {
  if (who.role !== 'lead') return { status: 403, body: { error: 'Nur Teamleitung' } };
  const r = await db.prepare('SELECT name FROM users').all();
  return { status: 200, body: { set: r.results.map((x) => x.name) } };
}
