// Datensicherung und Aufbewahrung
// - GET /api/backup (Teamleitung): alle Zeilen als JSON-Datei
// - Nächtlich (Cron-Trigger): Sicherung in R2 (Bindung BACKUP, optional) und Aufräumen
//   Protokoll (audit) 180 Tage, Fehlversuche und abgelaufene Sitzungen sofort.
import { audit } from './auth.js';

export const KEEP_AUDIT_DAYS = 180;
export const KEEP_BACKUPS = 30;

async function rows(db) {
  const r = await db.prepare('SELECT s, k, v, ts, by FROM rows ORDER BY s, k').all();
  const seq = (await db.prepare("SELECT v FROM meta WHERE k = 'seq'").first())?.v || 0;
  return { app: 'MUNSCH Zentrale', format: 1, created: new Date().toISOString(), seq, count: r.results.length, rows: r.results };
}

export async function backupDownload(db, who, build) {
  if (who.role !== 'lead') return { status: 403, body: { error: 'Nur die Teamleitung' } };
  const b = await rows(db);
  b.build = build;
  await audit(db, who.name, 'sicherung', b.count + ' Zeilen');
  return { status: 200, body: b };
}

export async function prune(db, now = Date.now()) {
  await db.batch([
    db.prepare('DELETE FROM audit WHERE ts < ?').bind(now - KEEP_AUDIT_DAYS * 864e5),
    db.prepare('DELETE FROM attempts WHERE until < ? AND first < ?').bind(now, now - 864e5),
    db.prepare('DELETE FROM sessions WHERE seen < ?').bind(now - 30 * 864e5),
  ]);
}

/** Cron: Sicherung nach R2 (falls gebunden), ältere als 30 Tage löschen, dann aufräumen */
export async function nightly(env, build) {
  const db = env.DB;
  if (env.BACKUP) {
    const b = await rows(db); b.build = build;
    const day = b.created.slice(0, 10);
    await env.BACKUP.put(`sicherung-${day}.json`, JSON.stringify(b), { httpMetadata: { contentType: 'application/json' } });
    const list = await env.BACKUP.list({ prefix: 'sicherung-' });
    const old = list.objects.map((o) => o.key).sort().slice(0, -KEEP_BACKUPS);
    for (const k of old) await env.BACKUP.delete(k);
    await audit(db, null, 'sicherung_r2', `${b.count} Zeilen, ${day}`);
  }
  await prune(db);
}
