// Ende-zu-Ende: echter Worker (lokal, SQLite) + echte Seite in zwei Browsern.
// Voraussetzung: npm run build und Playwright mit Chromium (in CI: npx playwright install chromium).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { start } from '../tools/dev.mjs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }

let srv, browser;
const today = new Date().toISOString().slice(0, 10);
before(async () => { srv = await start({ port: 0 }); browser = await chromium.launch(); });
after(async () => { await browser?.close(); await srv?.close(); });

async function open(name) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 820 }, reducedMotion: 'reduce' });
  await ctx.addInitScript((d) => { try { localStorage.setItem('mf6.intro', d); } catch {} }, today);
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', (e) => console.error('CSP verletzt: ' + e.violatedDirective + ' ' + e.blockedURI)));
  await page.goto(srv.url + '/');
  return page;
}
async function signIn(page, name, pin) {
  await page.click(`.pc[data-u="${name}"]`);
  await page.waitForSelector('#lpi', { state: 'attached' });
  await page.focus('#lpi');
  await page.keyboard.type(pin);
  await page.keyboard.press('Enter');
  try { await page.waitForSelector('#stage, #stn', { timeout: 15000 }); }
  catch (e) { throw new Error(`Anmeldung ${name} fehlgeschlagen: ${await page.evaluate(() => (document.querySelector('.toast')?.textContent || 'keine Meldung') + ' | SY ' + JSON.stringify({ tok: !!SY.tok, busy: SY.busy, ok: SY.ok, seq: SY.seq }) + ' | login=' + !!document.getElementById('login') + ' welcome=' + !!document.querySelector('.welcome'))} | Fehler: ${JSON.stringify(page.errors)}`); }
}
const api = async (path, token, body) => (await fetch(srv.url + path, { method: body ? 'POST' : 'GET', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token }, body: body && JSON.stringify(body) })).json();

test('Teamleitung startet die leere Zentrale, Team sieht Einlagerung live', async () => {
  const lead = await open();
  await signIn(lead, 'M. Thiel', 'notfall-123456');
  await lead.waitForFunction(() => window.SY && SY.ok && S.fach.length === 204, null, { timeout: 15000 });
  assert.match(await lead.textContent('#live'), /Live/);

  // Erstbefüllung ist in der Zentrale angekommen
  const tok = await lead.evaluate(() => SY.tok);
  const s = await api('/api/sync?since=0', tok);
  assert.equal(s.empty, false);
  assert.ok(s.rows.filter((r) => r.s === 'fach').length === 204);

  // PIN für eine Person aus dem Team über die Oberfläche setzen
  await lead.evaluate(() => go('adm'));
  await lead.click('[data-act="sypin"][data-n="M. Bode"]');
  await lead.fill('#npin', 'bode-123456');
  await lead.click('[data-act="sypin2"]');
  await lead.waitForFunction(() => /PIN für M\. Bode gesetzt/.test(document.querySelector('.toast')?.textContent || ''));

  // Team meldet sich in einem zweiten Browser an
  const team = await open();
  await signIn(team, 'M. Bode', 'bode-123456');
  await team.waitForFunction(() => SY.ok);
  assert.equal(await team.evaluate(() => isLead()), false);

  // Einlagern bei der Teamleitung
  await lead.evaluate(() => go('fach'));
  await lead.fill('#fscan', '48219071234');
  await lead.keyboard.press('Enter');
  await lead.waitForFunction(() => S.fach.some((f) => f.auf === '4821907'));
  await lead.waitForTimeout(1200); // Push nach 500 ms

  // ... erscheint beim Team nach dem nächsten Abgleich
  await team.evaluate(() => new Promise((ok) => syPull(ok)));
  assert.ok(await team.evaluate(() => S.fach.some((f) => f.auf === '4821907')));

  // Team stellt eigenen Urlaubsantrag, die Zentrale nimmt ihn an
  await team.evaluate(() => go('urlaub'));
  await team.click('[data-act="vq"][data-e="M. Bode"]');
  await team.click('[data-act="vadd"]');
  await team.waitForTimeout(1200);
  await lead.evaluate(() => new Promise((ok) => syPull(ok)));
  assert.ok(await lead.evaluate(() => S.vacs.some((v) => v.emp === 'M. Bode' && v.st === 'beantragt')));

  // Versuch, am Server vorbei einen fremden Urlaub zu genehmigen, wird abgewiesen und zurückgesetzt
  const ttok = await team.evaluate(() => SY.tok);
  const r = await api('/api/push', ttok, { ops: [{ s: 'vacs', k: 'fremd', v: JSON.stringify({ id: 'fremd', emp: 'K. Braun', type: 'Urlaub', d0: today, d1: today, st: 'genehmigt' }) }] });
  assert.equal(r.n, 0); assert.equal(r.rej.length, 1);

  assert.deepEqual(lead.errors, []); assert.deepEqual(team.errors, []);
});

test('Falsche PIN: Fehlermeldung, kein Zugang', async () => {
  const p = await open();
  await p.click('.pc[data-u="K. Braun"]');
  await p.focus('#lpi'); await p.keyboard.type('falsch-123'); await p.keyboard.press('Enter');
  await p.waitForFunction(() => document.querySelector('.toast'));
  assert.match(await p.textContent('.toast'), /keine PIN|PIN stimmt nicht/);
  assert.equal(await p.$('#stage'), null);
});

test('Umzug: Flow-5-Sicherung wird eingespielt und landet in der Zentrale', async () => {
  const lead = await open();
  await signIn(lead, 'M. Thiel', 'notfall-123456');
  await lead.waitForFunction(() => window.SY && SY.ok);
  // Sicherung wie aus Flow 5: kompletter Zustand als JSON
  const backup = await lead.evaluate(() => { const b = JSON.parse(JSON.stringify(newState())); b.fach[9].auf = '4999999'; b.fach[9].ts = Date.now(); b.reg.qs.push({ id: 'alt1', bereich: 'Säge', art: 'Störung', txt: 'aus Flow 5', min: 5, st: 0, ts: 1 }); return JSON.stringify(b); });
  await lead.evaluate(() => go('adm'));
  await lead.fill('#rsj', backup);
  await lead.click('[data-act="rsk"]');
  await lead.click('[data-act="mconf"]');
  await lead.waitForTimeout(2500);
  const tok = await lead.evaluate(() => SY.tok);
  const rows = (await api('/api/sync?since=0', tok)).rows;
  assert.equal(JSON.parse(rows.find((r) => r.s === 'fach' && r.k === 'S10').v).auf, '4999999');
  assert.ok(rows.some((r) => r.s === 'reg.qs' && r.k === 'alt1'));
  assert.deepEqual(lead.errors, []);
});

test('Shopfloor 06:45: Runde eröffnen, Ampel, Maßnahme, Abschluss – landet in der Zentrale', async () => {
  const lead = await open();
  await signIn(lead, 'M. Thiel', 'notfall-123456');
  await lead.waitForFunction(() => window.SY && SY.ok);
  await lead.evaluate(() => go('runde'));
  await lead.click('[data-act="rstart"]');
  await lead.waitForSelector('.sf-big'); // Anwesenheit
  for (let i = 0; i < 3; i++) await lead.click('[data-act="rnext"]'); // Anwesenheit, Termine, Sicherheit → Wareneingang
  assert.match(await lead.textContent('.sf-th h2'), /Wareneingang/);
  await lead.click('.sf-a.warn');
  await lead.fill('#mt', 'Palette am Tor 4 abholen');
  await lead.click('[data-act="addm"]');
  await lead.fill('#rn', 'Tor 4 blockiert');
  await lead.click('[data-act="rnext"]'); // Wareneingang besprochen
  await lead.evaluate(() => { S.ui.rp = 11; render(); });
  await lead.click('[data-act="rfin"]');
  await lead.waitForSelector('#modal textarea');
  const prot = await lead.inputValue('#modal textarea');
  assert.match(prot, /SHOPFLOOR 06:45/); assert.match(prot, /Wareneingang \[Achtung\] \[besprochen\]/); assert.match(prot, /Palette am Tor 4 abholen/); assert.match(prot, /Tor 4 blockiert/);
  await lead.waitForTimeout(1200);
  const rows = (await api('/api/sync?since=0', await lead.evaluate(() => SY.tok))).rows;
  const rd = JSON.parse(rows.find((r) => r.s === 'runde' && r.k === today).v);
  assert.ok(rd.t0 && rd.fin); assert.equal(rd.we.amp, 'y'); assert.equal(rd.we.note, 'Tor 4 blockiert');
  assert.ok(rows.some((r) => r.s === 'mass' && JSON.parse(r.v).txt === 'Palette am Tor 4 abholen'));
  assert.deepEqual(lead.errors, []);
});

test('Station: Tablet-Bedienung mit Personenwahl, Einlagern und Rückgängig', async () => {
  const lead = await open();
  await signIn(lead, 'M. Thiel', 'notfall-123456');
  await lead.waitForFunction(() => window.SY && SY.ok);
  await api('/api/pin', await lead.evaluate(() => SY.tok), { name: 'Station', pin: 'station-123456' });
  const st = await open();
  await signIn(st, 'Station', 'station-123456');
  await st.waitForSelector('#stn .st-grid', { timeout: 15000 });
  await st.click('[data-act="stgo"][data-s="fein"]');
  await st.click('[data-act="stpick"][data-u="J. Ehret"]');
  await st.fill('#stin', '47110001999');
  await st.keyboard.press('Enter');
  await st.waitForSelector('.st-done');
  assert.match(await st.textContent('.st-done h2'), /4711000 in S\d{3} eingelagert/);
  assert.ok(await st.evaluate(() => S.fach.some((f) => f.auf === '4711000') && S.fachlog[0].u === 'J. Ehret'), 'im Namen der gewählten Person');
  await st.click('[data-act="stundo"]');
  assert.ok(await st.evaluate(() => !S.fach.some((f) => f.auf === '4711000')), 'Rückgängig entfernt die Einlagerung');
  await st.click('[data-act="stgo"][data-s="milk"]');
  await st.click('.st-run[data-i="0"]');
  await st.waitForSelector('.st-done');
  await st.waitForTimeout(1200);
  const rows = (await api('/api/sync?since=0', await lead.evaluate(() => SY.tok))).rows;
  assert.ok(JSON.parse(rows.find((r) => r.s === 'milk' && r.k === today).v)['0'].s, 'Milkrun-Start ist in der Zentrale');
  assert.deepEqual(st.errors, []);
});

test('Excel-Import: echte Erfassungsdatei mit Vorschau, Übernahme und Ankunft in der Zentrale', async () => {
  const XLSX = require('@e965/xlsx');
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    [null, 'Wareneingang', null, 'Metallsäge', 'Störungen/Abw.'],
    ['Datum', 'geb. Pakete', 'geb. GB/Pal', 'heute gesägt', 'Säge'],
    [new Date(Date.UTC(2026, 10, 4, 0, 0)), 33, 12, 7, 1],
  ], { cellDates: true });
  XLSX.utils.book_append_sheet(wb, ws, 'Erfassung');
  const file = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const lead = await open();
  await signIn(lead, 'M. Thiel', 'notfall-123456');
  await lead.waitForFunction(() => window.SY && SY.ok);
  await lead.evaluate(() => go('imp'));
  await lead.setInputFiles('input[data-k="tz"]', { name: 'Tageszahlen_2026_Neu.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: file });
  await lead.waitForSelector('[data-act="impok"][data-k="tz"]', { timeout: 15000 });
  assert.match(await lead.textContent('#imr_tz'), /1 Tage, 4 Werte/);
  await lead.click('[data-act="impok"][data-k="tz"]');
  await lead.waitForTimeout(1200);
  const rows = (await api('/api/sync?since=0', await lead.evaluate(() => SY.tok))).rows;
  const d = JSON.parse(rows.find((r) => r.s === 'tz' && r.k === '2026-11-04').v);
  assert.deepEqual([d.we_pak, d.we_gbpal, d.ms_ist, d.st_saege], [33, 12, 7, 1]);
  assert.deepEqual(lead.errors, []);
});

test('Schichtaufgaben, 5S und Schichtplan: Änderungen kommen in der Zentrale an, nichts wird gelöscht', async () => {
  const lead = await open();
  await signIn(lead, 'M. Thiel', 'notfall-123456');
  await lead.waitForFunction(() => window.SY && SY.ok);
  const tok = await lead.evaluate(() => SY.tok);
  await api('/api/push', tok, { ops: [{ s: 'chkdef', k: 'cfremd', v: JSON.stringify({ t: 'Von anderem Gerät', o: 120 }) }] });
  await lead.evaluate(() => new Promise((ok) => syPull(ok)));
  await lead.evaluate(() => go('chk'));
  assert.match(await lead.textContent('#stage'), /Von anderem Gerät/);
  await lead.click('[data-act="chkt"][data-id="d1"]');
  await lead.evaluate(() => go('s5'));
  await lead.click('[data-act="s5c"][data-i="0"]');
  await lead.evaluate(() => go('schicht'));
  const sel = 'select[data-in="splan"]:not([disabled])';
  await lead.selectOption(sel, 'Säge Metall');
  await lead.waitForTimeout(1500);
  const rows = (await api('/api/sync?since=0', tok)).rows;
  assert.ok(rows.some((r) => r.s === 'chk' && r.k === today + '|d1' && r.v), 'Schichtaufgabe erledigt');
  assert.ok(rows.some((r) => r.s === 'chkdef' && r.k === 'cfremd' && r.v), 'fremde Aufgabe nicht gelöscht');
  assert.equal(JSON.parse(rows.find((r) => r.s === 's5.items' && r.k === 'M01').v).st, 'STABIL');
  assert.ok(rows.some((r) => r.s === 'plan' && JSON.stringify(r.v).includes('Säge Metall')));
  for (const p of ['fluss', 'plan', 'quali', 'ausw', 'ber']) { await lead.evaluate((x) => go(x), p); await lead.waitForTimeout(250); }
  await lead.evaluate(() => go('lfm')); await lead.waitForSelector('#lfm .lk');
  assert.deepEqual(lead.errors, []);
});

test('Heute: Danke und Sonderbetrieb kommen an; Probelauf sendet nichts an die Zentrale', async () => {
  const lead = await open();
  await signIn(lead, 'M. Thiel', 'notfall-123456');
  await lead.waitForFunction(() => window.SY && SY.ok);
  const tok = await lead.evaluate(() => SY.tok);
  await lead.evaluate(() => go('heute'));
  await lead.click('[data-act="dkn"]');
  await lead.fill('#dk_x', 'hat die Rampe frei gemacht');
  await lead.click('[data-act="dks"]');
  await lead.click('[data-act="sbm"]');
  await lead.fill('#sb_d', '2026-11-14');
  await lead.click('[data-act="sbs"]');
  await lead.waitForTimeout(1300);
  let rows = (await api('/api/sync?since=0', tok)).rows;
  assert.ok(rows.some((r) => r.s === 'dank' && JSON.parse(r.v).txt === 'hat die Rampe frei gemacht'));
  assert.ok(rows.some((r) => r.s === 'extra' && r.k === '2026-11-14' && r.v));
  assert.equal(await lead.evaluate(() => isWork('2026-11-14')), true, 'Samstag mit Sonderbetrieb ist Arbeitstag');
  for (const p of ['frist', 'woche', 'tag']) { await lead.evaluate((x) => go(x), p); await lead.waitForTimeout(250); }
  // Probelauf: Einlagern darf die Zentrale nicht erreichen
  const content = (rows) => JSON.stringify(rows.filter((r) => r.s !== 'dev')); // Herzschlag anderer offener Geräte ausnehmen
  const before = content((await api('/api/sync?since=0', tok)).rows);
  await lead.evaluate(() => go('train'));
  await lead.click('[data-act="trs"]');
  await lead.waitForSelector('#trb');
  await lead.evaluate(() => go('fach'));
  await lead.fill('#fscan', '4999111');
  await lead.keyboard.press('Enter');
  await lead.waitForTimeout(1500);
  assert.ok(await lead.evaluate(() => S.fach.some((f) => f.auf === '4999111')), 'lokal sichtbar');
  const after = await api('/api/sync?since=0', tok);
  assert.equal(content(after.rows), before, 'kein einziger Schreibvorgang dieses Geräts in der Zentrale');
  assert.ok(!after.rows.some((r) => r.s === 'fach' && r.v && JSON.parse(r.v).auf === '4999111'));
  assert.deepEqual(lead.errors, []);
});

test('Persönliche Nachricht bei Ablehnung, Etikett mit Barcode, Geräteübersicht', async () => {
  const lead = await open();
  await signIn(lead, 'M. Thiel', 'notfall-123456');
  await lead.waitForFunction(() => window.SY && SY.ok);
  const tok = await lead.evaluate(() => SY.tok);
  await api('/api/pin', tok, { name: 'K. Braun', pin: 'braun-123456' });
  await api('/api/pin', tok, { name: 'M. Neifer', pin: 'neifer-12345' });
  const team = await open();
  await signIn(team, 'K. Braun', 'braun-123456');
  await team.waitForFunction(() => SY.ok);
  await team.evaluate(() => go('urlaub'));
  await team.click('[data-act="vq"][data-e="K. Braun"]');
  await team.click('[data-act="vadd"]');
  await team.waitForTimeout(1200);
  await lead.evaluate(() => new Promise((ok) => syPull(ok)));
  await lead.evaluate(() => go('urlaub'));
  await lead.click('[data-act="vno"]');
  await lead.click('[data-act="mconf"]');
  await lead.waitForTimeout(1200);
  await team.evaluate(() => new Promise((ok) => syPull(ok)));
  assert.ok(await team.evaluate(() => alerts(new Date()).some((a) => /Persönlich von M\. Thiel: Dein Urlaub/.test(a.t))), 'Warnlage zeigt die Ablehnung');
  const other = await open();
  await signIn(other, 'M. Neifer', 'neifer-12345');
  await other.waitForFunction(() => SY.ok);
  assert.equal(await other.evaluate(() => Object.keys(S.funk).filter((k) => k[0] === '@').length), 0, 'fremde persönliche Nachrichten kommen gar nicht erst an');
  // Etikett
  await lead.evaluate(() => { const f = S.fach.find((x) => !x.auf && !x.legacy); fachIn(f, '4823456'); go('fach'); ACT.fo({ id: f.id }); });
  await lead.click('[data-act="fet"]');
  await lead.waitForSelector('#etbc rect');
  assert.ok(await lead.$$eval('#etbc rect', (r) => r.length) > 20, 'Code128-Balken gezeichnet');
  // Geräte
  await lead.evaluate(() => devBeat());
  await lead.waitForTimeout(800);
  await lead.evaluate(() => { closeModal(); go('adm'); });
  assert.match(await lead.textContent('#stage'), /Geräte/);
  assert.match(await lead.textContent('#stage'), /dieses Gerät/);
  assert.deepEqual(lead.errors, []); assert.deepEqual(team.errors, []); assert.deepEqual(other.errors, []);
});

test('Etikettengröße: Vorlage und eigene Maße, exakte Druckmaße, je Gerät gemerkt', async () => {
  const lead = await open();
  await signIn(lead, 'M. Thiel', 'notfall-123456');
  await lead.waitForFunction(() => window.SY && SY.ok);
  await lead.evaluate(() => { const f = S.fach.find((x) => !x.auf && !x.legacy); fachIn(f, '4876543'); go('fach'); ACT.fo({ id: f.id }); });
  await lead.click('[data-act="fet"]');
  await lead.waitForSelector('#etbc rect');
  await lead.selectOption('#et_p', '62x29');
  await lead.waitForFunction(() => document.getElementById('etinfo').textContent.startsWith('62 × 29 mm'));
  const mm = (px) => Math.round(px * 25.4 / 96 * 10) / 10;
  await lead.evaluate(() => { document.body.classList.add('prlbl'); const e = document.getElementById('etk'); e.style.transform = ''; });
  await lead.emulateMedia({ media: 'print' });
  let r = await lead.evaluate(() => { const b = document.getElementById('etk').getBoundingClientRect(); return [b.width, b.height, document.getElementById('etk').classList.contains('flat')]; });
  assert.deepEqual([mm(r[0]), mm(r[1]), r[2]], [62, 29, true], '62 × 29 mm, flaches Layout');
  await lead.emulateMedia({ media: 'screen' });
  await lead.evaluate(() => document.body.classList.remove('prlbl'));
  await lead.selectOption('#et_p', 'eigen');
  await lead.fill('#et_w', '80'); await lead.fill('#et_h', '60');
  await lead.waitForFunction(() => document.getElementById('etinfo').textContent.startsWith('80 × 60 mm'));
  // Druck auslösen ohne echten Dialog: @page muss die Größe tragen
  await lead.evaluate(() => { window.print = () => {}; ACT.etprint(); });
  assert.match(await lead.evaluate(() => document.getElementById('lblpage').textContent), /size:80mm 60mm;margin:0/);
  assert.deepEqual(await lead.evaluate(() => lblSize()), { p: 'eigen', w: 80, h: 60, date: true, bar: 'n' });
  await lead.waitForFunction(() => { try { return JSON.parse(localStorage.getItem('mflow.v2')).ui.lbl.w === 80; } catch { return false; } }, null, { timeout: 3000 }); // auf diesem Gerät gespeichert (verzögert)
  await lead.fill('#et_w', '5');
  await lead.waitForFunction(() => document.getElementById('etinfo').textContent.startsWith('20 × 60 mm'));
  assert.deepEqual(lead.errors, []);
});
