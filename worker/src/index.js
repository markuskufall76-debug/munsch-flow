// MUNSCH Zentrale · Cloudflare Worker
// Liefert die Seite aus und stellt die API bereit. Bindungen: DB (D1). Secrets: PIN_LEAD, PPLX_KEY (optional),
// PIN_TEAM + ALLOW_SHARED=1 (optional, Gruppen-PIN). Details: docs/BETRIEB.md
import { HTML, CSP, BUILD, MFDATA, XLSX_JS } from './generated/page.js';
import { login, session, logout, setPin, usersWithPin, audit } from './auth.js';
import { pull, push } from './sync.js';
import { handleAsk } from './ask.js';

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS rows (s TEXT NOT NULL, k TEXT NOT NULL, v TEXT, seq INTEGER NOT NULL, ts INTEGER NOT NULL, by TEXT, PRIMARY KEY (s, k))',
  'CREATE INDEX IF NOT EXISTS rows_seq ON rows (seq)',
  'CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v INTEGER NOT NULL)',
  "INSERT OR IGNORE INTO meta (k, v) VALUES ('seq', 0)",
  'CREATE TABLE IF NOT EXISTS users (name TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL, iter INTEGER NOT NULL, ver INTEGER NOT NULL DEFAULT 1, ts INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS sessions (th TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, ver INTEGER NOT NULL, created INTEGER NOT NULL, seen INTEGER NOT NULL)',
  'CREATE INDEX IF NOT EXISTS sessions_name ON sessions (name)',
  'CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, n INTEGER NOT NULL, first INTEGER NOT NULL, until INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, name TEXT, ev TEXT NOT NULL, detail TEXT)',
];
const ready = new WeakMap(); // Schema einmal je Datenbank und Isolate anlegen
const ensure = (db) => {
  if (!ready.has(db)) ready.set(db, db.batch(SCHEMA.map((q) => db.prepare(q))).catch((e) => { ready.delete(db); throw e; }));
  return ready.get(db);
};

const SEC = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'cross-origin-opener-policy': 'same-origin',
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...SEC, 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const out = (r) => json(r.body, r.status);

async function body(request) {
  if ((request.headers.get('content-length') | 0) > 2_000_000) throw Object.assign(new Error('zu groß'), { status: 413 });
  try { return await request.json(); } catch { throw Object.assign(new Error('ungültiges JSON'), { status: 400 }); }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url), p = url.pathname, m = request.method;
    try {
      if (p === '/' || p === '/index.html') {
        if (m !== 'GET' && m !== 'HEAD') return json({ error: 'Methode nicht erlaubt' }, 405);
        return new Response(m === 'HEAD' ? null : HTML, { headers: { ...SEC, 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'content-security-policy': CSP, 'x-build': BUILD } });
      }
      if (p === '/healthz') return json({ ok: 1, build: BUILD });
      // Excel-Bibliothek (SheetJS 0.20.3, fest gepinnt) aus dem Worker selbst, nur beim Import geladen
      if (p === '/vendor/xlsx-0.20.3.js') return new Response(XLSX_JS, { headers: { ...SEC, 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=31536000, immutable' } });
      if (!p.startsWith('/api/')) return json({ error: 'Nicht gefunden' }, 404);
      if (!env.DB) return json({ error: 'Datenbank nicht gebunden (D1-Bindung DB fehlt)' }, 500);

      // Schreibende Aufrufe nur von der eigenen Seite (kein Cross-Site-Request)
      const origin = request.headers.get('origin');
      if (m === 'POST' && origin && origin !== url.origin) return json({ error: 'Fremde Herkunft' }, 403);

      const db = env.DB;
      await ensure(db);
      const ip = request.headers.get('cf-connecting-ip') || 'lokal';

      if (p === '/api/login' && m === 'POST') return out(await login(db, env, await body(request), ip));

      const who = await session(db, request);
      if (!who) return json({ error: 'Nicht angemeldet' }, 401);

      switch (p) {
        case '/api/me': return json({ name: who.name, role: who.role });
        case '/api/logout': await logout(db, who); return json({ ok: 1 });
        case '/api/sync': return json(await pull(db, url.searchParams.get('since'), who));
        case '/api/push': if (m !== 'POST') break; return out(await push(db, who, await body(request)));
        case '/api/seed':
          if (who.role !== 'lead') return json({ error: 'Nur Teamleitung' }, 403);
          await audit(db, who.name, 'seed', null);
          return json(MFDATA);
        case '/api/pin': if (m !== 'POST') break; return out(await setPin(db, who, await body(request)));
        case '/api/users': return out(await usersWithPin(db, who));
        case '/api/ask': return handleAsk(request, env, who.name);
      }
      return json({ error: 'Nicht gefunden' }, 404);
    } catch (e) {
      if (e && e.status) return json({ error: e.message }, e.status);
      console.log('fehler', p, e && e.stack);
      return json({ error: 'Interner Fehler' }, 500);
    }
  },
};
