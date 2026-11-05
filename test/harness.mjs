// Lädt den eingefrorenen Logik-Kern in eine isolierte VM, ohne Browser.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = (p) => readFileSync(new URL('../app/src/legacy/' + p, import.meta.url), 'utf8');
const SRC = { mfdata: read('mfdata.js'), core: read('core.js'), sync: read('sync.js') };

/** @param {{now?: string, server?: boolean}} [o] now = lokale Zeit "JJJJ-MM-TTTHH:MM" */
export function loadCore(o = {}) {
  const store = new Map();
  const RealDate = Date;
  const fixed = o.now ? new RealDate(o.now).getTime() : null;
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length === 0 && fixed !== null) super(fixed); else super(...a); }
    static now() { return fixed !== null ? fixed : RealDate.now(); }
  }
  const ctx = {
    console, Date: FakeDate, Math, JSON, Set, Map, Promise, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0,
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
    document: { querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, visibilityState: 'visible' },
    addEventListener() {}, fetch: () => Promise.reject(new Error('kein Netz im Test')),
  };
  ctx.window = ctx;
  ctx.MF_SERVER = o.server ? 1 : undefined;
  vm.createContext(ctx);
  for (const k of ['mfdata', 'core', 'sync']) vm.runInContext(SRC[k], ctx, { filename: k + '.js' });
  ctx.toast = () => {}; ctx.render = () => {}; ctx.shellUpdate = () => {};
  vm.runInContext('S=newState()', ctx);
  return ctx;
}
