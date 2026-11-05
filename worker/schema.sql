-- MUNSCH Zentrale · Datenbankschema (Cloudflare D1, SQLite)
-- Der Worker legt das Schema beim ersten Aufruf selbst an. Diese Datei dient als Referenz und für
--   wrangler d1 execute munsch-zentrale --file=worker/schema.sql

-- Zustand als Zeilen: Abschnitt (s), Schlüssel (k), JSON-Wert (v, NULL = gelöscht), fortlaufende Nummer (seq)
CREATE TABLE IF NOT EXISTS rows (
  s   TEXT NOT NULL,
  k   TEXT NOT NULL,
  v   TEXT,
  seq INTEGER NOT NULL,
  ts  INTEGER NOT NULL,
  by  TEXT,
  PRIMARY KEY (s, k)
);
CREATE INDEX IF NOT EXISTS rows_seq ON rows (seq);

-- Zähler und Kennwerte
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v INTEGER NOT NULL);
INSERT OR IGNORE INTO meta (k, v) VALUES ('seq', 0);

-- Persönliche PINs: PBKDF2-SHA256, nie im Klartext. ver steigt bei jeder neuen PIN (meldet alle Geräte ab).
CREATE TABLE IF NOT EXISTS users (
  name TEXT PRIMARY KEY,
  salt TEXT NOT NULL,
  hash TEXT NOT NULL,
  iter INTEGER NOT NULL,
  ver  INTEGER NOT NULL DEFAULT 1,
  ts   INTEGER NOT NULL
);

-- Sitzungen: gespeichert wird nur der SHA-256 des Tokens
CREATE TABLE IF NOT EXISTS sessions (
  th      TEXT PRIMARY KEY,
  name    TEXT NOT NULL,
  role    TEXT NOT NULL,
  ver     INTEGER NOT NULL,
  created INTEGER NOT NULL,
  seen    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_name ON sessions (name);

-- Sperre nach Fehlversuchen (je Name und je IP)
CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, n INTEGER NOT NULL, first INTEGER NOT NULL, until INTEGER NOT NULL);

-- Sicherheitsprotokoll: Anmeldungen, Notfallzugang, PIN-Änderungen, abgelehnte Schreibzugriffe
CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, name TEXT, ev TEXT NOT NULL, detail TEXT);
