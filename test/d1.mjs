// Kleine Nachbildung der Cloudflare-D1-Schnittstelle auf node:sqlite – genug für Tests und den lokalen Server.
import { DatabaseSync } from 'node:sqlite';

class Stmt {
  constructor(db, sql, args = []) { this.db = db; this.sql = sql; this.args = args; }
  bind(...args) { return new Stmt(this.db, this.sql, args.map((a) => (a === undefined ? null : a))); }
  _s() { return this.db.prepare(this.sql); }
  async first(col) { const r = this._s().get(...this.args); return r == null ? null : col ? r[col] : { ...r }; }
  async all() { return { results: this._s().all(...this.args).map((r) => ({ ...r })), success: true }; }
  async run() { const r = this._s().run(...this.args); return { success: true, meta: { changes: r.changes } }; }
  _exec() { return /^\s*(select|with)\b/i.test(this.sql) ? { results: this._s().all(...this.args).map((r) => ({ ...r })) } : (this._s().run(...this.args), { results: [] }); }
}

export function d1(path = ':memory:') {
  const db = new DatabaseSync(path);
  return {
    prepare: (sql) => new Stmt(db, sql),
    async batch(stmts) {
      db.exec('BEGIN');
      try { const out = stmts.map((s) => s._exec()); db.exec('COMMIT'); return out; }
      catch (e) { db.exec('ROLLBACK'); throw e; }
    },
    raw: db,
  };
}
