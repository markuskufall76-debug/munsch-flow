// Baut MUNSCH Flow 7:
//   dist/munsch-flow.html            eigenständige Seite (ohne Zentrale, Daten im Browser) – für Artifact und Vorschau
//   dist/munsch-zentrale-worker.js   kompletter Cloudflare Worker inkl. Seite, eine Datei zum Einfügen oder Deployen
// Aufruf: npm run build
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import * as esbuild from 'esbuild';

const R = (p) => new URL('../' + p, import.meta.url);
const read = (p) => readFileSync(R(p), 'utf8');
const quiet = process.argv.includes('--quiet');

const parts = {
  mfdata: read('app/src/legacy/mfdata.js'),
  core: read('app/src/legacy/core.js'),
  sync: read('app/src/legacy/sync.js') + '\n' + read('app/src/core/sync-ext.js'),
  app: ['app.js', 'shopfloor.js', 'station.js'].map((f) => read('app/src/ui/' + f)).join('\n;\n'),
  css: ['app.css', 'modules.css'].map((f) => read('app/src/ui/' + f)).join('\n'),
};
const BUILD = '7-' + createHash('sha256').update(Object.values(parts).join('\0')).digest('hex').slice(0, 10);

// Klassische Skripte teilen sich den globalen Namensraum. esbuild ohne "format" lässt Namen auf oberster Ebene
// unangetastet, kürzt aber alles innerhalb von Funktionen.
const min = async (code, loader = 'js') => (await esbuild.transform(code, { loader, minify: true, legalComments: 'none', target: 'es2020', charset: 'utf8' })).code.trim();
const js = {
  build: `window.MF_BUILD=${JSON.stringify(BUILD)};`,
  mfdata: await min(parts.mfdata),
  core: await min(parts.core),
  sync: await min(parts.sync),
  app: await min(parts.app),
};
const css = await min(parts.css, 'css');

const FONTS = 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@500;600;700;800&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';
function page(server) {
  const scripts = [server ? 'window.MF_SERVER=1;' : '', js.build, js.mfdata, js.core, js.sync, js.app].filter(Boolean);
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
<link rel="stylesheet" href="${FONTS}">
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
  `script-src ${server.hashes.join(' ')}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "connect-src 'self'",
  "img-src 'self' data:",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

// Stammdaten und Team für den Server aus dem Kern lesen, damit es nur eine Quelle gibt
const ctx = { window: {}, document: { querySelector: () => null } };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(parts.mfdata + '\n' + parts.core + '\nthis.__TEAM = TEAM;', ctx);
const TEAM = ctx.__TEAM.map((m) => ({ n: m.n, lead: m.lead ? 1 : 0, station: m.station ? 1 : 0, monitor: m.monitor ? 1 : 0 }));

mkdirSync(R('dist'), { recursive: true });
mkdirSync(R('worker/src/generated'), { recursive: true });
writeFileSync(R('dist/munsch-flow.html'), standalone.html);
writeFileSync(R('worker/src/generated/page.js'),
  '// Automatisch erzeugt von tools/build.mjs – nicht bearbeiten\n' +
  `export const BUILD = ${JSON.stringify(BUILD)};\n` +
  `export const CSP = ${JSON.stringify(CSP)};\n` +
  `export const TEAM = ${JSON.stringify(TEAM)};\n` +
  `export const MFDATA = ${JSON.stringify(ctx.MFDATA)};\n` +
  `export const HTML = ${JSON.stringify(server.html)};\n`);

await esbuild.build({
  entryPoints: [R('worker/src/index.js').pathname],
  bundle: true, format: 'esm', platform: 'neutral', target: 'es2022',
  outfile: R('dist/munsch-zentrale-worker.js').pathname,
  banner: { js: `// MUNSCH Zentrale ${BUILD} · gebaut ${new Date().toISOString()} · Quelle: worker/src, app/src` },
  logLevel: 'warning',
});

const kb = (s) => Math.round(Buffer.byteLength(s) / 1024);
if (!quiet) console.log(`MUNSCH Flow ${BUILD}\n  dist/munsch-flow.html           ${kb(standalone.html)} KB\n  dist/munsch-zentrale-worker.js  ${kb(read('dist/munsch-zentrale-worker.js'))} KB`);
