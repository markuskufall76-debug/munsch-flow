// Charakterisierungstests: halten das Verhalten des Flow-5-Kerns fest, auf dem Flow 7 aufbaut.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { loadCore } from './harness.mjs';

const run = (c, js) => vm.runInContext(js, c);
const THU = '2026-11-05T10:15:00'; // Donnerstag, Werktag

test('Fächer: 132 Standard- und 72 Pufferfächer mit stabilen IDs', () => {
  const c = loadCore();
  const f = run(c, 'S.fach');
  assert.equal(f.length, 204);
  assert.equal(f.filter((x) => x.typ === 'S').length, 132);
  assert.equal(f[0].id, 'S1'); assert.equal(f[131].id, 'S132'); assert.equal(f[132].id, 'P1'); assert.equal(f[203].id, 'P72');
  assert.equal(run(c, 'fachName(S.fach[11])'), 'S012');
});

test('Auftragsnummer = erste 7 Ziffern des Scans', () => {
  const c = loadCore();
  assert.equal(run(c, "aufNr('48219071234')"), '4821907');
  assert.equal(run(c, "aufNr(' 4821907 ')"), '4821907');
  assert.equal(run(c, "aufNr('48219')"), '');
  assert.equal(run(c, "aufNr('A821907')"), '');
});

test('Milkrun-Takt: Runden 1–9 stündlich ab 06:00, Runde 10 um 14:25', () => {
  const c = loadCore();
  assert.deepEqual(Array.from({ length: 10 }, (_, i) => run(c, `mkTime(${i})`)),
    ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '14:25']);
});

test('Milkrun-Status: fällig, überfällig, läuft, eskaliert, erledigt', () => {
  const c = loadCore({ now: THU });
  const st = (i) => run(c, `mkStatus(${i},new Date()).s`);
  assert.match(st(4), /überfällig/);       // 10:00 geplant, jetzt 10:15 → mehr als 10 Minuten drüber
  const early = loadCore({ now: '2026-11-05T10:05:00' });
  assert.equal(run(early, 'mkStatus(4,new Date()).s'), 'fällig');
  assert.match(run(c, 'mkStatus(3,new Date()).s'), /überfällig/);
  run(c, "mkDay(todayIso())[3]={s:Date.now()-25*6e4}");
  assert.match(run(c, 'mkStatus(3,new Date()).s'), /eskaliert/);
  run(c, "mkDay(todayIso())[3].e=Date.now()");
  assert.equal(run(c, 'mkStatus(3,new Date()).s'), 'erledigt');
  assert.equal(run(c, 'mkStatus(9,new Date()).s'), 'geplant');
});

test('Warnlage meldet Langlieger ab 11 Tagen und Besetzung unter Minimum', () => {
  const c = loadCore({ now: THU });
  run(c, "S.fach[0].auf='4821907';S.fach[0].ts=Date.now()-11*864e5");
  assert.ok(run(c, 'alerts(new Date()).some(a=>a.go==="fach"&&/Langlieger/.test(a.t))'));
  const before = run(c, 'presentOn(todayIso()).length');
  run(c, "presentOn(todayIso()).slice(0,4).forEach((n,i)=>S.vacs.push({id:'t'+i,emp:n,type:'Urlaub',d0:todayIso(),d1:todayIso(),st:'genehmigt'}))");
  assert.equal(run(c, 'presentOn(todayIso()).length'), before - 4);
  assert.ok(run(c, 'alerts(new Date()).some(a=>a.tone==="crit"&&/Besetzung/.test(a.t))'));
});

test('Urlaubskonto zählt nur Werktage und halbe Tage', () => {
  const c = loadCore({ now: THU });
  run(c, "S.carry={};S.carryY={};S.vacs=[{id:'a',emp:'M. Bode',type:'Urlaub',d0:'2026-11-09',d1:'2026-11-15',st:'genehmigt'},{id:'b',emp:'M. Bode',type:'Urlaub',d0:'2026-11-20',d1:'2026-11-20',st:'beantragt',h:1}]");
  const k = run(c, "konto('M. Bode',2026)");
  assert.equal(k.g, 5); assert.equal(k.b, 0.5); assert.equal(k.rest, 30 - 5.5);
});

test('Tageszahlen: Kennzahlen aus Rohfeldern', () => {
  const c = loadCore();
  const f = run(c, 'tzFn({we_pak:12,ms_ist:3,ks_ist:4,lack_hp:2,lack_vp:1,st_w2:2,st_saege:1,milkrun:7})');
  assert.equal(f.pakete, 12); assert.equal(f.gesaegt, 7); assert.equal(f.lack, 3); assert.equal(f.stoer, 3); assert.equal(f.milk, 7);
});

test('Sync: Zustand wandert verlustfrei über Zeilen in einen frischen Zustand', () => {
  const a = loadCore({ now: THU, server: true });
  run(a, "S.fach[4].auf='4821907';S.fach[4].ts=1;S.fachlog.unshift({ts:5,u:'M. Thiel',f:'S5',a:'4821907',k:'ein'});S.reg.qs.push({id:'q1',bereich:'Säge',art:'Störung',txt:'Band',min:5,st:1,ts:9});S.milk['2026-11-05']={0:{s:1,e:2}};S.funk.WEP=[{by:'M. Bode',t:'Hallo',ts:3}];S.tz['2026-11-05']={we_pak:4}");
  const flat = run(a, 'syFlat()');
  const rows = [];
  for (const s of Object.keys(flat)) for (const k of Object.keys(flat[s])) rows.push({ s, k, v: flat[s][k] });
  const b = loadCore({ now: THU, server: true });
  run(b, 'SY.last={}');
  b.__rows = rows;
  assert.ok(run(b, 'syApply(__rows)') > 0);
  assert.deepEqual(JSON.parse(JSON.stringify(run(b, 'syFlat()'))), JSON.parse(JSON.stringify(flat)));
  assert.equal(run(b, "S.fach.filter(f=>f.id==='S5')[0].auf"), '4821907');
  assert.equal(run(b, 'S.funk.WEP[0].t'), 'Hallo');
});

test('Sync: Änderungen und Löschungen werden als Operationen erkannt', () => {
  const c = loadCore({ now: THU, server: true });
  run(c, "S.reg.qs.push({id:'q1',txt:'x',st:0,ts:1});SY.last=syFlat()");
  run(c, "S.reg.qs[0].st=2;S.brett.push({id:'b1',t:'Neu',by:'M. Thiel',pin:0,ts:2})");
  let ops = run(c, 'syOps(syFlat())');
  assert.ok(ops.some((o) => o.s === 'reg.qs' && o.k === 'q1' && JSON.parse(o.v).st === 2));
  assert.ok(ops.some((o) => o.s === 'brett' && o.k === 'b1'));
  run(c, 'SY.last=syFlat();S.reg.qs=[]');
  ops = run(c, 'syOps(syFlat())');
  assert.deepEqual(JSON.parse(JSON.stringify(ops.filter((o) => o.s === 'reg.qs').map((o) => [o.k, o.v]))), [['q1', null]]);
});

test('Originaldaten: frischer Zustand enthält nur echte Stammdaten, keine Beispiele', () => {
  const c = loadCore({ now: THU });
  assert.equal(run(c, 'S.vacs.filter(v=>v.demo||v.id==="v0").length'), 0, 'kein Platzhalter-Urlaub');
  assert.equal(run(c, 'S.vacs.length'), run(c, 'MFDATA.vac.length'), 'alle 149 Abwesenheiten aus der Excel');
  assert.equal(run(c, 'Object.keys(S.tz).length'), run(c, 'Object.keys(MFDATA.tz).length'));
  assert.equal(run(c, "S.carry['M. Thiel']"), run(c, "MFDATA.carry['M. Thiel']"), 'Urlaubsübertrag aus der Excel');
  assert.equal(run(c, 'S.fach.filter(f=>f.legacy).length'), run(c, 'MFDATA.fach.filter(f=>f[1]).length'));
  assert.equal(run(c, 'S.brett.length + Object.keys(S.reg).reduce((a,k)=>a+S.reg[k].length,0)'), 0, 'keine erfundenen Meldungen oder Register');
  assert.equal(run(c, "S.tz['2026-10-30'].we_pak"), 18);
});

test('Sync: Schichtaufgaben und unbekannte Abschnitte der Zentrale werden nie gelöscht', () => {
  const c = loadCore({ now: THU, server: true });
  run(c, 'SY.last=syFlat()');
  c.__rows = [
    { s: 'chk', k: '2026-11-05|d1', v: '{"u":"M. Bode","ts":1}' },
    { s: 'chkdef', k: 'c1', v: '{"t":"Regale prüfen","o":101}' },
    { s: 'kuenftig', k: 'x', v: '{"a":1}' },
    { s: 'dev', k: 'abc', v: '{"n":"Station"}' },
  ];
  run(c, 'syApply(__rows)');
  const ops = JSON.parse(JSON.stringify(run(c, 'syOps(syFlat())')));
  assert.deepEqual(ops, [], 'nach dem Abgleich nichts zu senden, insbesondere keine Löschungen');
  run(c, "S.chk['2026-11-05|d2']={u:'M. Thiel',ts:2}");
  const ops2 = JSON.parse(JSON.stringify(run(c, 'syOps(syFlat())')));
  assert.deepEqual(ops2.map((o) => o.s + '/' + o.k), ['chk/2026-11-05|d2']);
});

test('Sonderbetrieb: eingerichteter Samstag ist Arbeitstag, ohne Betrieb ruhen Milkrun-Hinweise', () => {
  const c = loadCore({ now: '2026-11-07T09:30:00' }); // Samstag
  assert.equal(run(c, 'isWork(todayIso())'), false);
  assert.equal(run(c, 'mkOverdue(new Date())'), 0);
  run(c, "S.extra={'2026-11-07':{by:'M. Thiel',ts:1}}");
  assert.equal(run(c, 'isWork(todayIso())'), true);
  assert.ok(run(c, 'mkOverdue(new Date())') > 0, 'am Sonderbetrieb gilt der Milkrun-Takt');
  assert.ok(run(c, 'presentOn(todayIso()).length') > 0);
  assert.equal(run(c, "_dayKind('2026-12-25')"), 'Feiertag');
  assert.equal(run(c, "_ferien('2026-10-12').n"), 'Herbstferien');
});

test('Fristen: überfällige und baldige Fristen erscheinen in der Warnlage', () => {
  const c = loadCore({ now: THU });
  run(c, "S.reg.mas.push({id:'m1',ref:'Stapler',art:'UVV',faellig:'2026-11-01',st:0,ts:1});S.reg.aud.push({id:'a1',ref:'Audit 5S',bereich:'W1',datum:'2026-11-06',st:0,ts:1});S.reg.aud.push({id:'a2',ref:'Audit alt',datum:'2026-10-01',st:0,ts:1})");
  const F = run(c, 'frDue()');
  assert.deepEqual(JSON.parse(JSON.stringify(F.map((x) => [x.id, x.dd]))), [['a2', -35], ['m1', -4], ['a1', 1]]);
  assert.ok(run(c, "alerts(new Date()).some(a=>a.go==='frist'&&/überfällig/.test(a.t))"));
  assert.ok(run(c, "alerts(new Date()).some(a=>a.go==='frist'&&/nächsten 3 Tagen/.test(a.t))"));
});

test('Sync: Danke vom Server auf einem frischen Gerät bleibt eine Liste, Abgleich läuft weiter', () => {
  const c = loadCore({ now: THU, server: true });
  run(c, 'SY.last=syFlat();delete S.dank');
  c.__rows = [{ s: 'dank', k: 'd1', v: '{"id":"d1","from":"M. Thiel","to":"M. Bode","txt":"Danke","ts":1}' }];
  run(c, 'syApply(__rows)');
  assert.equal(run(c, 'Array.isArray(S.dank)'), true);
  assert.equal(run(c, 'S.dank[0].txt'), 'Danke');
  assert.doesNotThrow(() => run(c, 'syFlat()'));
  assert.deepEqual(JSON.parse(JSON.stringify(run(c, 'syOps(syFlat())'))), []);
});
