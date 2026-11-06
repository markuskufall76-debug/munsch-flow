// Anonyme Rückmeldung im Pilot
// Gespeichert im Abschnitt 'fb' ohne Namen (by = NULL), nur mit Datum (ohne Uhrzeit), lesen nur die Teamleitung.
// Gegen Missbrauch zählt der Server je Person und Tag mit (höchstens 10), ohne den Inhalt zu verknüpfen.
const CATS = ['stoert', 'fehlt', 'gut'];
const MAX_LEN = 1000, PER_DAY = 10;

export async function feedback(db, who, body) {
  if (who.role === 'monitor') return { status: 403, body: { error: 'Monitor ist nur lesend' } };
  const t = String(body?.t ?? '').trim(), cat = String(body?.cat ?? '');
  if (!t) return { status: 400, body: { error: 'Bitte einen Satz schreiben' } };
  if (t.length > MAX_LEN) return { status: 400, body: { error: `Höchstens ${MAX_LEN} Zeichen` } };
  if (!CATS.includes(cat)) return { status: 400, body: { error: 'Unbekannte Art' } };
  const day = new Date().toISOString().slice(0, 10), key = `fb:${day}:${who.name}`;
  const r = await db.prepare('SELECT n FROM attempts WHERE key = ?').bind(key).first();
  if (r && r.n >= PER_DAY) return { status: 429, body: { error: 'Für heute sind genug Rückmeldungen da. Danke!' } };
  await db.prepare('INSERT OR REPLACE INTO attempts (key, n, first, until) VALUES (?, ?, ?, 0)').bind(key, (r ? r.n : 0) + 1, Date.now()).run();
  const raw = new Uint8Array(9); crypto.getRandomValues(raw);
  const id = [...raw].map((b) => b.toString(36)).join('').slice(0, 12);
  const v = JSON.stringify({ id, t, cat, d: day });
  await db.batch([
    db.prepare("UPDATE meta SET v = v + 1 WHERE k = 'seq'"),
    // Zeitstempel nur auf den Tag genau, kein Name
    db.prepare("INSERT INTO rows (s, k, v, seq, ts, by) VALUES ('fb', ?, ?, (SELECT v FROM meta WHERE k = 'seq'), ?, NULL)").bind(id, v, Date.parse(day)),
  ]);
  return { status: 200, body: { ok: 1 } };
}
