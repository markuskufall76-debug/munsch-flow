// Zustand als Zeilen {s, k, v}: Abgleich, Schreiben mit Rechteprüfung, Erstbefüllung
import { audit } from './auth.js';

const PAGE = 1000, MAX_OPS = 200, MAX_VALUE = 64 * 1024;
const SECTION = /^[a-zA-Z0-9]{1,24}(\.[\wÄÖÜäöüß \-]{1,40})?$/;
const LEAD_ONLY = new Set(['reg.gespr', 'carry', 'carryY', 'quali']);
const APPEND_ONLY = new Set(['log', 'fachlog']);

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
  if (APPEND_ONLY.has(op.s) && op.v == null) return 'Protokoll kann nicht gelöscht werden';
  if (op.s === 'vacs') {
    const next = op.v != null ? JSON.parse(op.v) : null, prev = current != null ? JSON.parse(current) : null;
    const own = (x) => !x || (x.emp === who.name && x.st === 'beantragt' && x.type !== 'Krank');
    if (!own(prev) || !own(next)) return 'Abwesenheiten anderer oder genehmigte Einträge ändert nur die Teamleitung';
  }
  return null;
}

export async function pull(db, since) {
  since = Math.max(0, parseInt(since, 10) || 0);
  const [r, cur, cnt] = await db.batch([
    db.prepare('SELECT s, k, v, seq FROM rows WHERE seq > ? ORDER BY seq LIMIT ?').bind(since, PAGE + 1),
    db.prepare("SELECT v FROM meta WHERE k = 'seq'"),
    db.prepare('SELECT COUNT(*) AS n FROM rows'),
  ]);
  const rows = r.results, more = rows.length > PAGE;
  if (more) rows.length = PAGE;
  const seq = more ? rows[rows.length - 1].seq : Math.max(since, cur.results[0]?.v || 0);
  return { rows: rows.map(({ s, k, v }) => ({ s, k, v })), seq, more, empty: cnt.results[0].n === 0 };
}

export async function push(db, who, body) {
  const ops = Array.isArray(body?.ops) ? body.ops : null;
  if (!ops) return { status: 400, body: { error: 'ops fehlt' } };
  if (ops.length > MAX_OPS) return { status: 413, body: { error: `Höchstens ${MAX_OPS} Änderungen je Aufruf` } };
  const ok = [], rej = [];
  for (const op of ops) {
    const cur = await db.prepare('SELECT v FROM rows WHERE s = ? AND k = ?').bind(String(op?.s), String(op?.k)).first();
    const why = rule(who, op || {}, cur ? cur.v : null);
    if (why) { rej.push({ s: op?.s, k: op?.k, v: cur ? cur.v : null, why }); continue; }
    if ((cur ? cur.v : null) === (op.v ?? null)) continue;
    ok.push(op);
  }
  if (ok.length) {
    const now = Date.now(), st = [];
    for (const op of ok) {
      st.push(db.prepare("UPDATE meta SET v = v + 1 WHERE k = 'seq'"));
      st.push(db.prepare("INSERT INTO rows (s, k, v, seq, ts, by) VALUES (?, ?, ?, (SELECT v FROM meta WHERE k = 'seq'), ?, ?) ON CONFLICT (s, k) DO UPDATE SET v = excluded.v, seq = excluded.seq, ts = excluded.ts, by = excluded.by")
        .bind(op.s, op.k, op.v ?? null, now, who.name));
    }
    await db.batch(st); // eine Transaktion: alles oder nichts, Nummern lückenlos
  }
  if (rej.length) await audit(db, who.name, 'abgelehnt', rej.map((r) => `${r.s}/${r.k}: ${r.why}`).join('; '));
  const seq = (await db.prepare("SELECT v FROM meta WHERE k = 'seq'").first()).v;
  return { status: 200, body: { ok: 1, seq, n: ok.length, rej: rej.map(({ s, k, v }) => ({ s, k, v })) } };
}
