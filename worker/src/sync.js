// Zustand als Zeilen {s, k, v}: Abgleich, Schreiben mit Rechteprüfung, Erstbefüllung
import { audit } from './auth.js';

const PAGE = 1000, MAX_OPS = 200, MAX_VALUE = 64 * 1024;
const SECTION = /^[a-zA-Z0-9]{1,24}(\.@?[\wÄÖÜäöüß \-]{1,40})?$/; // z. B. reg.qs, funk.Säge Metall, funk.@MBode
const LEAD_ONLY = new Set(['reg.gespr', 'carry', 'carryY', 'quali', 'home', 'cfg']); // home: Stammbereich je Person, cfg: Einstellungen der Teamleitung
const APPEND_ONLY = new Set(['log', 'fachlog']);

/** Persönlicher Kanal einer Person, wie in Flow 5: '@' + Name ohne Sonderzeichen */
export const pmKey = (name) => '@' + String(name).replace(/[^A-Za-z0-9]/g, '');
/** Wer darf diesen Abschnitt lesen? Persönliche Nachrichten nur Empfänger und Teamleitung, Personalgespräche nur Teamleitung. */
export function canRead(who, s) {
  if (who.role === 'lead') return true;
  if (s === 'reg.gespr') return false;
  if (s === 'fb') return false; // anonyme Rückmeldungen liest nur die Teamleitung
  if (s.startsWith('funk.@')) return s === 'funk.' + pmKey(who.name);
  return true;
}

/** Gesundheitsdaten: Krankmeldungen anderer sieht nur die Teamleitung, das Team sieht „Abwesend“ (Datenschutz, Art. 9 DSGVO). */
export function mask(who, s, v) {
  if (who.role === 'lead' || s !== 'vacs' || v == null) return v;
  try {
    const x = JSON.parse(v);
    if (x && x.type === 'Krank' && x.emp !== who.name) { const { note, grund, ...rest } = x; return JSON.stringify({ ...rest, type: 'Abwesend' }); }
  } catch { /* unverändert */ }
  return v;
}

/**
 * Darf diese Person diese Operation schreiben? Gibt null oder einen Ablehnungsgrund zurück.
 * Regeln liegen hier, im Server, und nicht nur in der Oberfläche.
 */
export function rule(who, op, current) {
  if (who.role === 'monitor') return 'Monitor ist nur lesend';
  if (!SECTION.test(op.s) || typeof op.k !== 'string' || !op.k || op.k.length > 120) return 'ungültiger Schlüssel';
  if (op.v != null && (typeof op.v !== 'string' || op.v.length > MAX_VALUE)) return 'Wert zu groß';
  if (op.v != null) { try { JSON.parse(op.v); } catch { return 'Wert ist kein JSON'; } }
  if (who.role === 'lead') return null;
  if (LEAD_ONLY.has(op.s)) return 'nur Teamleitung';
  if (op.s === 'fb') return 'Rückmeldungen nur über /api/feedback';
  if (op.s.startsWith('funk.@') && op.s !== 'funk.' + pmKey(who.name)) return 'persönliche Nachricht an andere nur durch die Teamleitung';
  if (APPEND_ONLY.has(op.s) && op.v == null) return 'Protokoll kann nicht gelöscht werden';
  if (op.s === 'vacs') {
    const next = op.v != null ? JSON.parse(op.v) : null, prev = current != null ? JSON.parse(current) : null;
    const own = (x) => !x || (x.emp === who.name && x.st === 'beantragt' && x.type !== 'Krank');
    if (!own(prev) || !own(next)) return 'Abwesenheiten anderer oder genehmigte Einträge ändert nur die Teamleitung';
  }
  return null;
}

export async function pull(db, since, who) {
  since = Math.max(0, parseInt(since, 10) || 0);
  const [r, cur, cnt] = await db.batch([
    db.prepare('SELECT s, k, v, seq FROM rows WHERE seq > ? ORDER BY seq LIMIT ?').bind(since, PAGE + 1),
    db.prepare("SELECT v FROM meta WHERE k = 'seq'"),
    db.prepare('SELECT COUNT(*) AS n FROM rows'),
  ]);
  const rows = r.results, more = rows.length > PAGE;
  if (more) rows.length = PAGE;
  const seq = more ? rows[rows.length - 1].seq : Math.max(since, cur.results[0]?.v || 0);
  // Nummernstand aus allen Zeilen, Inhalt nur aus den lesbaren: so bleibt der Abgleich lückenlos
  return { rows: rows.filter((r) => !who || canRead(who, r.s)).map(({ s, k, v }) => ({ s, k, v: who ? mask(who, s, v) : v })), seq, more, empty: cnt.results[0].n === 0 };
}

export async function push(db, who, body) {
  const ops = Array.isArray(body?.ops) ? body.ops : null;
  if (!ops) return { status: 400, body: { error: 'ops fehlt' } };
  if (ops.length > MAX_OPS) return { status: 413, body: { error: `Höchstens ${MAX_OPS} Änderungen je Aufruf` } };
  const ok = [], rej = [];
  for (const op of ops) {
    const cur = await db.prepare('SELECT v FROM rows WHERE s = ? AND k = ?').bind(String(op?.s), String(op?.k)).first();
    const why = rule(who, op || {}, cur ? cur.v : null);
    // Abgelehnt: gültigen Wert nur zurückgeben, wenn die Person ihn lesen darf
    if (why) { rej.push({ s: op?.s, k: op?.k, v: cur && canRead(who, String(op?.s)) ? mask(who, String(op?.s), cur.v) : null, why }); continue; }
    if ((cur ? cur.v : null) === (op.v ?? null)) continue;
    ok.push(op);
  }
  if (ok.length) {
    const now = Date.now(), st = [];
    for (const op of ok) {
      st.push(db.prepare("UPDATE meta SET v = v + 1 WHERE k = 'seq'"));
      st.push(db.prepare("INSERT INTO rows (s, k, v, seq, ts, by) VALUES (?, ?, ?, (SELECT v FROM meta WHERE k = 'seq'), ?, ?) ON CONFLICT (s, k) DO UPDATE SET v = excluded.v, seq = excluded.seq, ts = excluded.ts, by = excluded.by")
        .bind(op.s, op.k, op.v ?? null, op.s === 'fb' ? Date.parse(new Date(now).toISOString().slice(0, 10)) : now, op.s === 'fb' ? null : who.name));
    }
    await db.batch(st); // eine Transaktion: alles oder nichts, Nummern lückenlos
  }
  if (rej.length) await audit(db, who.name, 'abgelehnt', rej.map((r) => `${r.s}/${r.k}: ${r.why}`).join('; '));
  const seq = (await db.prepare("SELECT v FROM meta WHERE k = 'seq'").first()).v;
  return { status: 200, body: { ok: 1, seq, n: ok.length, rej: rej.map(({ s, k, v }) => ({ s, k, v })) } };
}
