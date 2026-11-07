// Baut MUNSCH Flow 7:
//   dist/munsch-flow.html            eigenständige Seite (ohne Zentrale, Daten im Browser) – für Artifact und Vorschau
//   dist/munsch-zentrale-worker.js   kompletter Cloudflare Worker inkl. Seite, eine Datei zum Einfügen oder Deployen
// Aufruf: npm run build
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import * as esbuild from 'esbuild';

const R = (p) => new URL('../' + p, import.meta.url);
const read = (p) => readFileSync(R(p), 'utf8');
const quiet = process.argv.includes('--quiet');

const parts = {
  barcode: read('node_modules/jsbarcode/dist/barcodes/JsBarcode.code128.min.js'),
  mfdata: read('app/src/legacy/mfdata.js'),
  core: read('app/src/legacy/core.js') + '\n' + read('app/src/core/rules-ext.js'),
  sync: read('app/src/legacy/sync.js') + '\n' + read('app/src/core/sync-ext.js') + '\n' + read('app/src/legacy/excel.js'),
  app: ['app.js', 'shopfloor.js', 'station.js', 'pages.js', 'today.js', 'extras.js', 'cinema.js', 'cinema2.js', 'film.js', 'stage.js', 'mine.js', 'forecast.js', 'halle.js', 'moments.js', 'flow.js', 'filmrec.js', 'clips.js', 'kino.js', 'focus.js', 'care.js', 'pilot.js', 'module.js', 'lage2.js', 'pagehero.js', 'buehne.js', 'fx.js', 'betrieb.js', 'polish.js'].map((f) => read('app/src/ui/' + f)).join('\n;\n'),
  css: ['app.css', 'modules.css', 'cinema.css', 'cinema2.css', 'stage.css', 'halle.css', 'moments.css', 'flow.css', 'focus.css', 'care.css', 'clips.css', 'kino.css', 'open.css', 'lage2.css', 'pagehero.css', 'buehne.css', 'hell.css', 'lesbar.css', 'formen.css', 'module.css', 'betrieb.css', 'polish.css'].map((f) => read('app/src/ui/' + f)).join('\n'),
};
// Bilder (app/src/img/*.webp): Gestaltung nutzt var(--img-name), ein kleines Skript setzt die Quelle.
// Eigenständige Seite: data:-URL (eine Datei). Worker: /img/name-hash.webp, unveränderlich zwischengespeichert.

const IMGS = Object.fromEntries(readdirSync(R('app/src/img')).filter((f) => f.endsWith('.webp')).map((f) => {
  const b = readFileSync(R('app/src/img/' + f)), n = f.replace(/\.webp$/, '');
  return [n, { b64: b.toString('base64'), path: `/img/${n}-${createHash('sha256').update(b).digest('hex').slice(0, 8)}.webp` }];
}));
parts.css = parts.css.replace(/url\(IMG:([a-z0-9-]+)\)/g, (_, n) => { if (!IMGS[n]) throw new Error('Bild fehlt: ' + n); return `var(--img-${n})`; });
const imgScript = (server) => 'window.MF_IMG=' + JSON.stringify(Object.fromEntries(Object.entries(IMGS).map(([n, v]) => [n, server ? v.path : 'data:image/webp;base64,' + v.b64]))) + ';(function(){var r=document.documentElement.style;for(var k in MF_IMG)r.setProperty("--img-"+k,"url("+MF_IMG[k]+")")})();';
const BUILD = '7-' + createHash('sha256').update(Object.values(parts).join('\0') + JSON.stringify(Object.values(IMGS).map((v) => v.path))).digest('hex').slice(0, 10);

// Klassische Skripte teilen sich den globalen Namensraum. esbuild ohne "format" lässt Namen auf oberster Ebene
// unangetastet, kürzt aber alles innerhalb von Funktionen.
const min = async (code, loader = 'js') => (await esbuild.transform(code, { loader, minify: true, legalComments: 'none', target: 'es2020', charset: 'utf8' })).code.trim();
const js = {
  build: `window.MF_BUILD=${JSON.stringify(BUILD)};`,
  barcode: parts.barcode.trim(), // JsBarcode 3.11.6 (MIT), Code128, wie in Flow 5
  mfdata: await min(parts.mfdata),
  core: await min(parts.core),
  sync: await min(parts.sync),
  app: await min(parts.app),
};
const css = await min(parts.css, 'css');

const FONTS = 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@500;600;700;800&family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap';
function page(server) {
  const scripts = [server ? 'window.MF_SERVER=1;' : '', imgScript(server), js.build, js.barcode, js.mfdata, js.core, js.sync, js.app].filter(Boolean);
  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>MUNSCH Flow</title>
<meta name="description" content="Logistik-Leitstand Munsch Chemiepumpen">
<meta name="theme-color" content="#0A0B0D">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">${server ? '\n<link rel="manifest" href="/manifest.webmanifest">\n<link rel="icon" href="/icon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/icon.svg">' : ''}
<style>${css}</style>
</head>
<body>
<div id="light" aria-hidden="true"></div><div id="vignette" aria-hidden="true"></div>
<div id="app"></div>
${scripts.map((s) => `<script>${s}</script>`).join('\n')}
</body>
</html>
`;
  const hashes = scripts.map((s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`);
  return { html, hashes };
}

const standalone = page(false), server = page(true);
const CSP = [
  "default-src 'none'",
  `script-src 'self' ${server.hashes.join(' ')}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "connect-src 'self'",
  "img-src 'self' data:",
  "media-src 'self' blob:",
  "manifest-src 'self'",
  "worker-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

// Stammdaten und Team für den Server aus dem Kern lesen, damit es nur eine Quelle gibt
const ctx = { window: {}, document: { querySelector: () => null } };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(parts.mfdata + '\n' + parts.core + '\nthis.__TEAM = TEAM; this.__ICON = logoCore(512);', ctx);
const TEAM = ctx.__TEAM.map((m) => ({ n: m.n, lead: m.lead ? 1 : 0, station: m.station ? 1 : 0, monitor: m.monitor ? 1 : 0 }));

mkdirSync(R('dist'), { recursive: true });
mkdirSync(R('worker/src/generated'), { recursive: true });
writeFileSync(R('dist/munsch-flow.html'), standalone.html);
writeFileSync(R('worker/src/generated/page.js'),
  '// Automatisch erzeugt von tools/build.mjs – nicht bearbeiten\n' +
  `export const BUILD = ${JSON.stringify(BUILD)};\n` +
  `export const CSP = ${JSON.stringify(CSP)};\n` +
  `export const TEAM = ${JSON.stringify(TEAM)};\n` +
  `export const ICON = ${JSON.stringify(ctx.__ICON.replace(/<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/ class="[^"]*"/, ''))};\n` +
  `export const MFDATA = ${JSON.stringify(ctx.MFDATA)};\n` +
  `export const HTML = ${JSON.stringify(server.html)};\n` +
  `export const IMGS = ${JSON.stringify(Object.fromEntries(Object.values(IMGS).map((v) => [v.path, v.b64])))};\n` +
  `export const XLSX_JS = ${JSON.stringify(readFileSync(R('node_modules/@e965/xlsx/dist/xlsx.full.min.js'), 'utf8'))};\n`);

await esbuild.build({
  entryPoints: [R('worker/src/index.js').pathname],
  bundle: true, format: 'esm', platform: 'neutral', target: 'es2022',
  outfile: R('dist/munsch-zentrale-worker.js').pathname,
  banner: { js: `// MUNSCH Zentrale ${BUILD} · gebaut ${new Date().toISOString()} · Quelle: worker/src, app/src` },
  logLevel: 'warning',
});

const kb = (s) => Math.round(Buffer.byteLength(s) / 1024);
if (!quiet) console.log(`MUNSCH Flow ${BUILD}\n  dist/munsch-flow.html           ${kb(standalone.html)} KB\n  dist/munsch-zentrale-worker.js  ${kb(read('dist/munsch-zentrale-worker.js'))} KB`);
