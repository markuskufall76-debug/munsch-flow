// Fehlerberichte der Geräte (ohne Personendaten): Seite, Gerätetyp, Version, Fehlertext.
// Schreiben darf jede angemeldete Rolle (auch Monitor und Station), lesen und leeren nur die Teamleitung.
// Höchstens 60 Berichte je Gerät und Tag; es bleiben die letzten 300.
export const ERR_SCHEMA = 'CREATE TABLE IF NOT EXISTS errs (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, page TEXT, ver TEXT, dev TEXT, msg TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 1)';
const MAX_KEEP = 300, PER_DAY = 60;
const clip = (s, n) => String(s ?? '').replace(/[\u0000-\u001f]+/g, ' ').slice(0, n);

export async function errReport(db, who, body, ip) {
  const msg = clip(body?.msg, 600).trim();
  if (!msg) return { status: 400, body: { error: 'Kein Fehlertext' } };
  const day = new Date().toISOString().slice(0, 10), key = `err:${day}:${ip}`;
  const r = await db.prepare('SELECT n FROM attempts WHERE key = ?').bind(key).first();
  if (r && r.n >= PER_DAY) return { status: 200, body: { ok: 1, skipped: 1 } };
  await db.prepare('INSERT OR REPLACE INTO attempts (key, n, first, until) VALUES (?, ?, ?, 0)').bind(key, (r ? r.n : 0) + 1, Date.now()).run();
  const page = clip(body?.page, 40), ver = clip(body?.ver, 40), dev = clip(body?.dev, 60);
  // gleicher Fehler am gleichen Tag: nur zählen
  const same = await db.prepare('SELECT id FROM errs WHERE msg = ? AND page = ? AND ver = ? AND ts > ?').bind(msg, page, ver, Date.parse(day)).first();
  if (same) await db.prepare('UPDATE errs SET n = n + 1, ts = ? WHERE id = ?').bind(Date.now(), same.id).run();
  else await db.prepare('INSERT INTO errs (ts, page, ver, dev, msg) VALUES (?, ?, ?, ?, ?)').bind(Date.now(), page, ver, dev, msg).run();
  await db.prepare('DELETE FROM errs WHERE id NOT IN (SELECT id FROM errs ORDER BY id DESC LIMIT ?)').bind(MAX_KEEP).run();
  return { status: 200, body: { ok: 1 } };
}

export async function errList(db, who) {
  if (who.role !== 'lead') return { status: 403, body: { error: 'Nur Teamleitung' } };
  const r = await db.prepare('SELECT id, ts, page, ver, dev, msg, n FROM errs ORDER BY ts DESC LIMIT 100').all();
  return { status: 200, body: { errs: r.results || [] } };
}

export async function errClear(db, who) {
  if (who.role !== 'lead') return { status: 403, body: { error: 'Nur Teamleitung' } };
  await db.prepare('DELETE FROM errs').run();
  return { status: 200, body: { ok: 1 } };
}
