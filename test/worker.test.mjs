// API-Tests des Workers gegen SQLite (D1-Nachbildung). Voraussetzung: npm run build (erzeugt worker/src/generated).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { d1 } from './d1.mjs';

const { default: worker } = await import('../worker/src/index.js');
const { TEAM } = await import('../worker/src/generated/page.js');
const LEAD = TEAM.find((m) => m.lead).n, TEAMER = TEAM.find((m) => !m.lead && !m.station).n, OTHER = TEAM.filter((m) => !m.lead && !m.station)[1].n;

let env;
beforeEach(() => { env = { DB: d1(), PIN_LEAD: 'notfall-123456' }; });

async function call(path, { body, token, method, headers = {} } = {}) {
  const h = { 'content-type': 'application/json', 'cf-connecting-ip': '10.0.0.1', ...headers };
  if (token) h.authorization = 'Bearer ' + token;
  const r = await worker.fetch(new Request('https://zentrale.test' + path, { method: method || (body ? 'POST' : 'GET'), headers: h, body: body ? JSON.stringify(body) : undefined }), env);
  const ct = r.headers.get('content-type') || '';
  return { status: r.status, headers: r.headers, body: ct.includes('json') ? await r.json() : await r.text() };
}
const loginAs = async (name, pin) => (await call('/api/login', { body: { name, pin } })).body.token;
async function withPins() {
  const lead = await loginAs(LEAD, 'notfall-123456');
  for (const [n, p] of [[LEAD, 'leitung-1'], [TEAMER, 'team-001'], [OTHER, 'team-002']]) assert.equal((await call('/api/pin', { token: lead, body: { name: n, pin: p } })).status, 200);
  return { lead: await loginAs(LEAD, 'leitung-1'), team: await loginAs(TEAMER, 'team-001') };
}

test('Seite: ausgeliefert mit strikter CSP und Sicherheits-Headern', async () => {
  const r = await call('/');
  assert.equal(r.status, 200);
  assert.match(r.body, /window\.MF_SERVER=1/);
  const csp = r.headers.get('content-security-policy');
  assert.match(csp, /script-src 'self' 'sha256-/); // nur eigene Herkunft (Excel-Bibliothek) und per Hash bekannte Inline-Skripte assert.doesNotMatch(csp, /unsafe-inline'[^;]*script|script-src[^;]*unsafe/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
});

test('Anmeldung: Notfall-PIN nur für Teamleitung, nie für Team', async () => {
  assert.ok(await loginAs(LEAD, 'notfall-123456'));
  const r = await call('/api/login', { body: { name: TEAMER, pin: 'notfall-123456' } });
  assert.equal(r.status, 401); assert.match(r.body.error, /noch keine PIN/);
  assert.equal((await call('/api/login', { body: { name: 'Fremder', pin: '123456' } })).status, 400);
});

test('Anmeldung: persönliche PIN wird gehasht gespeichert, nie im Klartext', async () => {
  await withPins();
  const u = env.DB.raw.prepare('SELECT * FROM users WHERE name = ?').get(TEAMER);
  assert.equal(u.hash.length, 64); assert.ok(!JSON.stringify(u).includes('team-001'));
  assert.equal((await call('/api/me', { token: await loginAs(TEAMER, 'team-001') })).body.role, 'team');
});

test('Anmeldung: Sperre nach 5 Fehlversuchen', async () => {
  await withPins();
  for (let i = 0; i < 5; i++) assert.equal((await call('/api/login', { body: { name: TEAMER, pin: 'falsch-' + i } })).status, 401);
  const r = await call('/api/login', { body: { name: TEAMER, pin: 'team-001' } });
  assert.equal(r.status, 429); assert.match(r.body.error, /Fehlversuche/);
});

test('Sitzung: neue PIN meldet die Person auf allen Geräten ab', async () => {
  const { lead, team } = await withPins();
  assert.equal((await call('/api/me', { token: team })).status, 200);
  await call('/api/pin', { token: lead, body: { name: TEAMER, pin: 'team-neu-9' } });
  assert.equal((await call('/api/me', { token: team })).status, 401);
});

test('Sitzung: ohne Token kein Zugriff, Logout beendet die Sitzung', async () => {
  assert.equal((await call('/api/sync?since=0')).status, 401);
  const t = await loginAs(LEAD, 'notfall-123456');
  await call('/api/logout', { token: t, body: {} });
  assert.equal((await call('/api/me', { token: t })).status, 401);
});

test('Sync: Schreiben, fortlaufende Nummern, Abholen ab Stand, Löschen', async () => {
  const { lead, team } = await withPins();
  assert.equal((await call('/api/sync?since=0', { token: team })).body.empty, true);
  const p1 = await call('/api/push', { token: team, body: { ops: [{ s: 'fach', k: 'S5', v: '{"id":"S5","auf":"4821907"}' }, { s: 'reg.qs', k: 'q1', v: '{"id":"q1","st":0}' }] } });
  assert.equal(p1.body.n, 2); assert.equal(p1.body.seq, 2);
  const s0 = (await call('/api/sync?since=0', { token: lead })).body;
  assert.equal(s0.rows.length, 2); assert.equal(s0.seq, 2); assert.equal(s0.empty, false);
  await call('/api/push', { token: lead, body: { ops: [{ s: 'reg.qs', k: 'q1', v: null }] } });
  const s1 = (await call('/api/sync?since=2', { token: team })).body;
  assert.deepEqual(s1.rows, [{ s: 'reg.qs', k: 'q1', v: null }]); assert.equal(s1.seq, 3);
  assert.equal((await call('/api/push', { token: team, body: { ops: [{ s: 'fach', k: 'S5', v: '{"id":"S5","auf":"4821907"}' }] } })).body.n, 0, 'unveränderte Werte erzeugen keine neue Nummer');
});

test('Rechte: Team darf keine Personalgespräche, keine fremden Urlaube, kein Protokoll löschen', async () => {
  const { lead, team } = await withPins();
  const own = { id: 'v1', emp: TEAMER, type: 'Urlaub', d0: '2026-12-01', d1: '2026-12-02', st: 'beantragt' };
  const r = await call('/api/push', { token: team, body: { ops: [
    { s: 'reg.gespr', k: 'g1', v: '{"id":"g1"}' },
    { s: 'vacs', k: 'v2', v: JSON.stringify({ ...own, id: 'v2', emp: OTHER }) },
    { s: 'vacs', k: 'v3', v: JSON.stringify({ ...own, id: 'v3', st: 'genehmigt' }) },
    { s: 'vacs', k: 'v1', v: JSON.stringify(own) },
    { s: 'log', k: 'x', v: null },
  ] } });
  assert.equal(r.body.n, 1, 'nur der eigene Antrag geht durch');
  assert.deepEqual(r.body.rej.map((x) => x.k).sort(), ['g1', 'v2', 'v3', 'x']);
  const ok = await call('/api/push', { token: lead, body: { ops: [{ s: 'vacs', k: 'v1', v: JSON.stringify({ ...own, st: 'genehmigt' }) }] } });
  assert.equal(ok.body.n, 1, 'Teamleitung genehmigt');
  const back = await call('/api/push', { token: team, body: { ops: [{ s: 'vacs', k: 'v1', v: null }] } });
  assert.equal(back.body.rej.length, 1, 'genehmigter Urlaub kann vom Team nicht gelöscht werden');
  assert.equal(JSON.parse(back.body.rej[0].v).st, 'genehmigt', 'Ablehnung liefert den gültigen Wert zurück');
  const au = env.DB.raw.prepare("SELECT COUNT(*) AS n FROM audit WHERE ev = 'abgelehnt'").get();
  assert.ok(au.n >= 2);
});

test('Vertraulich: persönliche Nachrichten nur für Empfänger und Teamleitung, Gespräche nur für Teamleitung', async () => {
  const { lead, team } = await withPins();
  const other = await loginAs(OTHER, 'team-002');
  const pm = (n) => 'funk.@' + n.replace(/[^A-Za-z0-9]/g, '');
  const r = await call('/api/push', { token: lead, body: { ops: [
    { s: pm(TEAMER), k: '1|M. Thiel', v: JSON.stringify({ by: LEAD, t: 'Dein Urlaub wurde abgelehnt', ts: 1 }) },
    { s: 'reg.gespr', k: 'g1', v: JSON.stringify({ id: 'g1', ref: TEAMER, thema: 'Entwicklung', st: 0, ts: 1 }) },
  ] } });
  assert.equal(r.body.n, 2);
  const see = async (t) => (await call('/api/sync?since=0', { token: t })).body;
  const sT = await see(team), sO = await see(other), sL = await see(lead);
  assert.ok(sT.rows.some((x) => x.s === pm(TEAMER)), 'Empfänger sieht seine Nachricht');
  assert.ok(!sO.rows.some((x) => x.s.startsWith('funk.@')), 'andere sehen sie nicht');
  assert.ok(!sT.rows.some((x) => x.s === 'reg.gespr') && !sO.rows.some((x) => x.s === 'reg.gespr'), 'Gespräche nur Teamleitung');
  assert.ok(sL.rows.some((x) => x.s === 'reg.gespr') && sL.rows.some((x) => x.s === pm(TEAMER)));
  assert.equal(sO.seq, sL.seq, 'Nummernstand bleibt für alle gleich');
  const w = await call('/api/push', { token: other, body: { ops: [{ s: pm(TEAMER), k: 'x', v: '{"t":"Fake"}' }, { s: pm(OTHER), k: 'y', v: '{"t":"Antwort an die Leitung","by":"x","ts":2}' }] } });
  assert.equal(w.body.n, 1, 'nur in den eigenen Kanal');
  assert.equal(w.body.rej[0].v, null, 'Ablehnung verrät keinen fremden Inhalt');
});

test('Rechte: PINs setzen, PIN-Liste und Erstbefüllung nur für Teamleitung', async () => {
  const { team, lead } = await withPins();
  assert.equal((await call('/api/pin', { token: team, body: { name: OTHER, pin: 'hack-123456' } })).status, 403);
  assert.equal((await call('/api/users', { token: team })).status, 403);
  assert.equal((await call('/api/seed', { token: team })).status, 403);
  assert.deepEqual((await call('/api/users', { token: lead })).body.set.sort(), [LEAD, TEAMER, OTHER].sort());
  assert.ok((await call('/api/seed', { token: lead })).body.fach.length >= 204);
});

test('Schutz: fremde Herkunft, ungültige Daten und Übergrößen werden abgewiesen', async () => {
  const t = await loginAs(LEAD, 'notfall-123456');
  assert.equal((await call('/api/push', { token: t, body: { ops: [] }, headers: { origin: 'https://boese.example' } })).status, 403);
  assert.equal((await call('/api/push', { token: t, body: { ops: Array.from({ length: 201 }, (_, i) => ({ s: 'tz', k: 'k' + i, v: '1' })) } })).status, 413);
  const r = await call('/api/push', { token: t, body: { ops: [{ s: 'tz', k: 'a', v: 'kein json' }, { s: '../x', k: 'a', v: '1' }] } });
  assert.equal(r.body.rej.length, 2);
});

test('Excel-Bibliothek: vom Worker selbst ausgeliefert, aktuelle Version', async () => {
  const r = await call('/vendor/xlsx-0.20.3.js');
  assert.equal(r.status, 200); assert.match(r.headers.get('content-type'), /javascript/);
  assert.match(r.body.slice(0, 200), /SheetJS/); assert.match(r.body, /version:"0\.20\.3"|"0\.20\.3"/);
});

test('Installierbar: Manifest, Logo und Service Worker werden ausgeliefert', async () => {
  const m = await call('/manifest.webmanifest');
  assert.equal(m.status, 200); assert.equal(m.body.name, 'MUNSCH Flow'); assert.equal(m.body.display, 'standalone');
  const i = await call('/icon.svg'); assert.match(i.headers.get('content-type'), /svg/); assert.match(i.body, /^<svg xmlns=/);
  const w = await call('/sw.js'); assert.match(w.body, /mf-7-/); assert.match(w.body, /\/api\//, 'API wird nie gecacht');
  assert.match((await call('/')).headers.get('content-security-policy'), /worker-src 'self'/);
});

test('Perplexity: ohne Schlüssel sauber abgeschaltet', async () => {
  const t = await loginAs(LEAD, 'notfall-123456');
  const r = await call('/api/ask', { token: t, body: { messages: [{ role: 'user', content: 'Test' }] } });
  assert.equal(r.status, 501);
});

test('Anmeldekarte: nur Teamleitung stellt aus, Code nur als Hash, Scan meldet an, neue Karte macht alte ungültig', async () => {
  const { lead, team } = await withPins();
  assert.equal((await call('/api/badge', { token: team, body: { name: TEAMER } })).status, 403);
  assert.equal((await call('/api/badge', { token: lead, body: { name: LEAD } })).status, 400, 'Teamleitung bekommt keine Karte');
  const r = await call('/api/badge', { token: lead, body: { name: TEAMER } });
  assert.equal(r.status, 200); assert.match(r.body.code, /^MF-[A-Z2-7]{16}$/);
  const rows = (await env.DB.prepare('SELECT th FROM badges').all()).results;
  assert.equal(rows.length, 1); assert.notEqual(rows[0].th, r.body.code); assert.equal(rows[0].th.length, 64);
  const s = await call('/api/login', { body: { badge: r.body.code.toLowerCase() } });
  assert.equal(s.status, 200); assert.equal(s.body.name, TEAMER); assert.equal(s.body.role, 'team');
  assert.equal((await call('/api/me', { token: s.body.token })).body.name, TEAMER);
  const r2 = await call('/api/badge', { token: lead, body: { name: TEAMER } });
  assert.equal((await call('/api/login', { body: { badge: r.body.code } })).status, 401, 'alte Karte ungültig');
  assert.equal((await call('/api/login', { body: { badge: r2.body.code } })).status, 200);
  const list = await call('/api/badges', { token: lead });
  assert.equal(list.body.cards.length, 1); assert.equal(list.body.cards[0].name, TEAMER); assert.ok(list.body.cards[0].last > 0);
  assert.equal((await call('/api/badges', { token: team })).status, 403);
});

test('Anmeldekarte: Sperren meldet überall ab, unbekannte Karten werden je IP gesperrt', async () => {
  const { lead } = await withPins();
  const c = (await call('/api/badge', { token: lead, body: { name: TEAMER } })).body.code;
  const t = (await call('/api/login', { body: { badge: c } })).body.token;
  assert.equal((await call('/api/badge/revoke', { token: lead, body: { name: TEAMER } })).status, 200);
  assert.equal((await call('/api/me', { token: t })).status, 401, 'Sitzung beendet');
  assert.equal((await call('/api/login', { body: { badge: c } })).status, 401);
  const ip = { 'cf-connecting-ip': '10.9.9.9' };
  for (let i = 0; i < 20; i++) await call('/api/login', { body: { badge: 'MF-AAAAAAAAAAAAAAA' + (i % 2 ? 'A' : 'B') }, headers: ip });
  const c2 = (await call('/api/badge', { token: lead, body: { name: OTHER } })).body.code;
  assert.equal((await call('/api/login', { body: { badge: c2 }, headers: ip })).status, 429, 'nach 20 Fehlversuchen gesperrt, auch für gültige Karte');
  assert.equal((await call('/api/login', { body: { badge: c2 } })).status, 200, 'andere IP nicht betroffen');
});

test('Station: Scan nennt die Person nur dem Stations-Konto; Stammbereich setzt nur die Teamleitung', async () => {
  const { lead, team } = await withPins();
  const STATION = TEAM.find((m) => m.station).n;
  assert.equal((await call('/api/pin', { token: lead, body: { name: STATION, pin: 'station-01' } })).status, 200);
  const st = await loginAs(STATION, 'station-01');
  const c = (await call('/api/badge', { token: lead, body: { name: OTHER } })).body.code;
  const w = await call('/api/badge/who', { token: st, body: { code: c } });
  assert.equal(w.status, 200); assert.equal(w.body.name, OTHER);
  assert.equal((await call('/api/badge/who', { token: team, body: { code: c } })).status, 403);
  const op = { s: 'home', k: TEAMER, v: JSON.stringify('Säge Metall') };
  assert.equal((await call('/api/push', { token: team, body: { ops: [op] } })).body.rej.length, 1);
  assert.equal((await call('/api/push', { token: lead, body: { ops: [op] } })).body.n, 1);
});

test('Datensicherung: nur Teamleitung lädt herunter; nachts nach R2 mit 30 Tagen Vorrat, Protokoll nach 180 Tagen gelöscht', async () => {
  const { lead, team } = await withPins();
  await call('/api/push', { token: lead, body: { ops: [{ s: 'tz', k: '2026-10-01', v: JSON.stringify({ we_pak: 9 }) }] } });
  assert.equal((await call('/api/backup', { token: team })).status, 403);
  const b = await call('/api/backup', { token: lead });
  assert.equal(b.status, 200); assert.equal(b.body.app, 'MUNSCH Zentrale'); assert.ok(b.body.rows.some((r) => r.s === 'tz' && r.k === '2026-10-01'));
  const store = new Map();
  for (let i = 1; i <= 31; i++) store.set(`sicherung-2026-09-${String(i).padStart(2, '0')}.json`, '{}');
  env.BACKUP = { put: async (k, v) => store.set(k, v), list: async () => ({ objects: [...store.keys()].map((key) => ({ key })) }), delete: async (k) => store.delete(k) };
  await env.DB.prepare('INSERT INTO audit (ts, name, ev, detail) VALUES (?, ?, ?, ?)').bind(Date.now() - 200 * 864e5, 'x', 'alt', null).run();
  const waits = []; await worker.scheduled({}, env, { waitUntil: (p) => waits.push(p) }); await Promise.all(waits);
  assert.equal(store.size, 30, 'nur die letzten 30 Sicherungen');
  const today = [...store.keys()].sort().pop(); assert.match(today, /^sicherung-\d{4}-\d\d-\d\d\.json$/);
  assert.ok(JSON.parse(store.get(today)).rows.length >= 1);
  assert.equal((await env.DB.prepare("SELECT COUNT(*) AS n FROM audit WHERE ev = 'alt'").first()).n, 0);
});

test('Datenschutz: Krankmeldungen anderer sieht das Team nur als „Abwesend“, die Teamleitung vollständig; maskierte Daten überschreiben nichts', async () => {
  const { lead, team } = await withPins();
  const k = { id: 'k1', emp: OTHER, type: 'Krank', d0: '2026-11-02', d1: '2026-11-03', st: 'genehmigt', note: 'Grippe' };
  const own = { id: 'k2', emp: TEAMER, type: 'Krank', d0: '2026-11-04', d1: '2026-11-04', st: 'genehmigt' };
  await call('/api/push', { token: lead, body: { ops: [{ s: 'vacs', k: 'k1', v: JSON.stringify(k) }, { s: 'vacs', k: 'k2', v: JSON.stringify(own) }] } });
  const rows = (await call('/api/sync?since=0', { token: team })).body.rows.filter((r) => r.s === 'vacs');
  const seen = JSON.parse(rows.find((r) => r.k === 'k1').v);
  assert.equal(seen.type, 'Abwesend'); assert.equal(seen.note, undefined); assert.equal(seen.emp, OTHER);
  assert.equal(JSON.parse(rows.find((r) => r.k === 'k2').v).type, 'Krank', 'eigene Krankmeldung bleibt sichtbar');
  assert.equal(JSON.parse((await call('/api/sync?since=0', { token: lead })).body.rows.find((r) => r.k === 'k1').v).type, 'Krank');
  const back = await call('/api/push', { token: team, body: { ops: [{ s: 'vacs', k: 'k1', v: JSON.stringify(seen) }] } });
  assert.equal(back.body.n, 0); assert.equal(back.body.rej.length, 1, 'Team kann den Eintrag nicht überschreiben');
  assert.equal(JSON.parse(back.body.rej[0].v).type, 'Abwesend', 'auch die Ablehnung verrät nichts');
});
