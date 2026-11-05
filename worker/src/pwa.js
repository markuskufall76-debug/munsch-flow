// Installierbar und offline startfähig: Seite und Logo im Cache, die API nie.
// Jede neue Version (BUILD) bekommt einen eigenen Cache; alte Caches werden beim Aktivieren entfernt.
export function serviceWorker(build) {
  return [
    `const C = 'mf-${build}';`,
    "self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(['/', '/icon.svg'])).then(() => self.skipWaiting())); });",
    "self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches['delete'](x)))).then(() => self.clients.claim())); });",
    "self.addEventListener('fetch', (e) => {",
    "  const u = new URL(e.request.url);",
    "  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;",
    "  if (u.pathname === '/' || u.pathname === '/index.html') {",
    "    e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(C).then((c) => c.put('/', cp)); } return r; }).catch(() => caches.match('/')));",
    "    return;",
    "  }",
    "  e.respondWith(caches.match(e.request).then((m) => m || fetch(e.request).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); } return r; })));",
    "});",
  ].join('\n');
}

export const MANIFEST = JSON.stringify({
  name: 'MUNSCH Flow', short_name: 'MUNSCH Flow', description: 'Logistik-Leitstand Munsch Chemiepumpen',
  start_url: '/', scope: '/', display: 'standalone', orientation: 'any', lang: 'de',
  background_color: '#0A0B0D', theme_color: '#0A0B0D',
  icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
});
