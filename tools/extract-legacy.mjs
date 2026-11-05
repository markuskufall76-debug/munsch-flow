// Friert den bewährten Logik-Kern aus MUNSCH Flow 5 als eigene Quelldateien ein.
// Einmalig bzw. nur bei bewussten Übernahmen aus Flow 5 ausführen:
//   node tools/extract-legacy.mjs
// Ergebnis (wird eingecheckt und ist durch test/core.test.mjs abgesichert):
//   app/src/legacy/mfdata.js  Stammdaten (window.MFDATA)
//   app/src/legacy/core.js    Logo, Stammdaten-Logik, Zustand, Fächer, Milkrun, Register, Warnlage
//   app/src/legacy/sync.js    Synchronisierung mit der Zentrale (Format der Zentrale, nicht ändern)
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync(new URL('../legacy/flow5.html', import.meta.url), 'utf8');

function one(re) {
  const m = [...src.matchAll(re)];
  if (m.length !== 1) throw new Error(`${re}: ${m.length} Treffer statt 1`);
  return m[0][1];
}
function between(start, end) {
  const i = src.indexOf(start);
  if (i < 0 || src.indexOf(start, i + 1) >= 0) throw new Error(`Startmarke ${start} nicht eindeutig`);
  const j = src.indexOf(end, i);
  if (j < 0) throw new Error(`Endmarke ${end} fehlt`);
  return src.slice(i, j);
}

const head = (what) => `/* Aus MUNSCH Flow 5 übernommen (tools/extract-legacy.mjs). ${what}\n   Nicht von Hand ändern, ohne test/core.test.mjs anzupassen. */\n`;

const mfdata = one(/<script>window\.MF_BUILD='[^']*';(window\.MFDATA=.*?)<\/script>/gs);
let core = between('/* Original-MUNSCH-Logo als Vektor', '/* ===== Modal ===== */');
core = core.replace(/<\/script>\s*<script[^>]*>/g, '\n');
if (/<\/?script/.test(core)) throw new Error('Kern enthält noch Script-Tags');
const sync = between('/* ===== ZENTRALE SYNCHRONISIERUNG', 'ACT.syout=function');
for (const fn of ['function syFlat', 'function syApply', 'function syPush', 'function syStart', 'function syPull'])
  if (!sync.includes(fn)) throw new Error(`Sync ohne ${fn}`);

// Excel-Parser (auf die echten Dateien abgestimmt: Tageszahlen „Erfassung“ und Monatsblätter, Fachbelegung, Urlaubsplanung)
function def(start) {
  const i = src.indexOf(start);
  if (i < 0 || src.indexOf(start, i + 1) >= 0) throw new Error(`Definition ${start} nicht eindeutig`);
  let j = src.indexOf('\n', i);
  while (src[j + 1] === ' ') j = src.indexOf('\n', j + 1); // Fortsetzungszeilen beginnen mit Leerzeichen
  return src.slice(i, j).trim();
}
const excel = ['function capR(', 'var XMAP=', 'var TZOLD=', 'var WEPK=', 'function tzOld(', 'function fxParse(', 'function vxParse('].map(def).join('\n');
writeFileSync(new URL('../app/src/legacy/excel.js', import.meta.url), head('Excel-Parser.') + 'window._tzun=window._tzun||[];\n' + excel + '\n');
writeFileSync(new URL('../app/src/legacy/mfdata.js', import.meta.url), head('Stammdaten.') + mfdata + '\n');
writeFileSync(new URL('../app/src/legacy/core.js', import.meta.url), head('Logik-Kern.') + core);
writeFileSync(new URL('../app/src/legacy/sync.js', import.meta.url), head('Synchronisierung.') + sync);
console.log('legacy: excel', excel.length, 'mfdata', mfdata.length, 'core', core.length, 'sync', sync.length, 'Zeichen');
