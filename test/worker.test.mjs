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

test('Perplexity: ohne Schlüssel sauber abgeschaltet', async () => {
  const t = await loginAs(LEAD, 'notfall-123456');
  const r = await call('/api/ask', { token: t, body: { messages: [{ role: 'user', content: 'Test' }] } });
  assert.equal(r.status, 501);
});
