// Anmeldekarten für Handscanner
// Jede Person bekommt einen zufälligen Code (MF- + 16 Zeichen Base32, 80 Bit). Gespeichert wird nur sein SHA-256-Hash.
// Der Scanner tippt den Code wie eine Tastatur. Die Teamleitung meldet sich weiter nur mit PIN an.
import { sha256, member, roleOf, audit } from './auth.js';

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const LOCK = { ipMax: 20, window: 15 * 6e4 };
export const BADGE_RE = /^MF-[A-Z2-7]{16}$/;
export const norm = (c) => String(c ?? '').trim().toUpperCase();

function code() { const r = new Uint8Array(16); crypto.getRandomValues(r); return 'MF-' + [...r].map((b) => B32[b & 31]).join(''); }

async function blocked(db, ip, now) {
  const r = await db.prepare('SELECT until FROM attempts WHERE key = ?').bind('b:' + ip).first();
  return r && r.until > now ? r.until : 0;
}
async function miss(db, ip, now) {
  const k = 'b:' + ip, r = await db.prepare('SELECT n, first FROM attempts WHERE key = ?').bind(k).first();
  const fresh = !r || now - r.first > LOCK.window, n = fresh ? 1 : r.n + 1;
  await db.prepare('INSERT OR REPLACE INTO attempts (key, n, first, until) VALUES (?, ?, ?, ?)').bind(k, n, fresh ? now : r.first, n >= LOCK.ipMax ? now + LOCK.window : 0).run();
}

/** Karte prüfen: liefert {name} oder {status, error}. Zählt Fehlversuche je IP. */
async function resolve(db, raw, ip) {
  const now = Date.now(), c = norm(raw);
  if (await blocked(db, ip, now)) return { status: 429, error: 'Zu viele unbekannte Karten. Bitte später erneut scannen.' };
  if (!BADGE_RE.test(c)) { await miss(db, ip, now); return { status: 400, error: 'Das ist keine MUNSCH-Flow-Karte' }; }
  const r = await db.prepare('SELECT name FROM badges WHERE th = ?').bind(await sha256(c)).first();
  if (!r || !member(r.name)) { await miss(db, ip, now); return { status: 401, error: 'Karte unbekannt oder gesperrt' }; }
  await db.prepare('UPDATE badges SET last = ? WHERE name = ?').bind(now, r.name).run();
  return { name: r.name };
}

export async function badgeLogin(db, raw, ip) {
  const r = await resolve(db, raw, ip);
  if (r.error) { await audit(db, null, 'karte_fehler', ip); return { status: r.status, body: { error: r.error } }; }
  const m = member(r.name);
  if (m.lead) return { status: 403, body: { error: 'Die Teamleitung meldet sich mit PIN an' } };
  const tok = new Uint8Array(32); crypto.getRandomValues(tok);
  const token = btoa(String.fromCharCode(...tok)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), now = Date.now();
  const u = await db.prepare('SELECT ver FROM users WHERE name = ?').bind(r.name).first();
  await db.prepare('INSERT INTO sessions (th, name, role, ver, created, seen) VALUES (?, ?, ?, ?, ?, ?)').bind(await sha256(token), r.name, roleOf(m), u ? u.ver : 0, now, now).run();
  await audit(db, r.name, 'login', 'karte ' + ip);
  return { status: 200, body: { token, name: r.name, role: roleOf(m) } };
}

/** Station: wer hat gerade gescannt? Nur für das Stations-Konto. */
export async function badgeWho(db, who, raw, ip) {
  const m = member(who.name);
  if (!m || !m.station) return { status: 403, body: { error: 'Nur an der Station' } };
  const r = await resolve(db, raw, ip);
  return r.error ? { status: r.status, body: { error: r.error } } : { status: 200, body: { name: r.name } };
}

/** Teamleitung: Karte ausstellen (ersetzt eine alte), Code genau einmal zurück */
export async function badgeIssue(db, who, { name }) {
  if (who.role !== 'lead') return { status: 403, body: { error: 'Nur die Teamleitung stellt Karten aus' } };
  const m = member(name);
  if (!m || m.station || m.monitor) return { status: 400, body: { error: 'Unbekannter Name' } };
  if (m.lead) return { status: 400, body: { error: 'Die Teamleitung meldet sich mit PIN an' } };
  const c = code(), now = Date.now();
  await db.batch([
    db.prepare('DELETE FROM badges WHERE name = ?').bind(name),
    db.prepare('INSERT INTO badges (th, name, created, by, last) VALUES (?, ?, ?, ?, 0)').bind(await sha256(c), name, now, who.name),
  ]);
  await audit(db, who.name, 'karte_ausgestellt', name);
  return { status: 200, body: { name, code: c, created: now } };
}

/** Teamleitung: Karte sperren und alle Sitzungen der Person beenden (verlorene Karte) */
export async function badgeRevoke(db, who, { name }) {
  if (who.role !== 'lead') return { status: 403, body: { error: 'Nur die Teamleitung sperrt Karten' } };
  if (!member(name)) return { status: 400, body: { error: 'Unbekannter Name' } };
  await db.batch([db.prepare('DELETE FROM badges WHERE name = ?').bind(name), db.prepare('DELETE FROM sessions WHERE name = ?').bind(name)]);
  await audit(db, who.name, 'karte_gesperrt', name);
  return { status: 200, body: { ok: 1 } };
}

export async function badgeList(db, who) {
  if (who.role !== 'lead') return { status: 403, body: { error: 'Nur Teamleitung' } };
  const r = await db.prepare('SELECT name, created, last FROM badges').all();
  return { status: 200, body: { cards: r.results } };
}
