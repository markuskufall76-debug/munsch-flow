// Lokaler Server: der echte Worker mit SQLite statt D1.
//   npm run dev            -> http://localhost:8787  (Daten in .data/dev.sqlite, Notfall-PIN: PIN_LEAD oder "notfall-123456")
// Wird auch von test/e2e.test.mjs verwendet.
import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { d1 } from '../test/d1.mjs';

export async function start({ port = 8787, db = ':memory:', env = {} } = {}) {
  const { default: worker } = await import('../worker/src/index.js?' + Date.now());
  const E = { DB: d1(db), PIN_LEAD: 'notfall-123456', ...env };
  const server = createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const headers = { ...req.headers, 'cf-connecting-ip': req.socket.remoteAddress || 'lokal' };
    const r = await worker.fetch(new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), E);
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
  });
  await new Promise((ok) => server.listen(port, '127.0.0.1', ok));
  return { url: `http://127.0.0.1:${server.address().port}`, env: E, close: () => new Promise((ok) => server.close(ok)) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(new URL('../.data/', import.meta.url), { recursive: true });
  const s = await start({ db: new URL('../.data/dev.sqlite', import.meta.url).pathname, env: process.env.PIN_LEAD ? { PIN_LEAD: process.env.PIN_LEAD } : {} });
  console.log(`MUNSCH Zentrale lokal: ${s.url}  (Notfall-PIN für Teamleitung: ${s.env.PIN_LEAD})`);
}
