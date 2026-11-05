# Architektur MUNSCH Flow 7

```
Browser (Halle, Büro, Handy)                     Cloudflare
┌──────────────────────────────┐   HTTPS   ┌──────────────────────────────┐
│ Seite (eine Datei)           │ ───────▶  │ Worker  worker/src/index.js  │
│  app/src/ui      Oberfläche  │  /api/*   │  auth.js   PINs, Sitzungen   │
│  app/src/legacy  Logik-Kern  │ ◀───────  │  sync.js   Zeilen, Rechte    │
│                  + Sync      │           │  ask.js    Perplexity        │
└──────────────────────────────┘           └──────────────┬───────────────┘
                                                          │
                                                   D1 (SQLite) rows, users,
                                                   sessions, attempts, audit
```

## Daten

Maßgeblich sind die Originaldaten aus dem Excel-Import (`app/src/legacy/mfdata.js`, Stand 01.11.2026): 213 Tage Tageszahlen (05.01. bis 30.10.), 149 Abwesenheiten, 107 Fächer Altbestand, Urlaubsüberträge. Es gibt keine Beispieldaten. Laufende Daten kommen aus der Zentrale oder per Umzug aus einer Flow-5-Sicherung.

## Entscheidungen

- **Eine Datei je Seite und Worker.** Hallenmonitor und Tablets laden genau eine Datei, ohne Abhängigkeiten zur Laufzeit. `npm run build` erzeugt beides.
- **Logik-Kern eingefroren** (`app/src/legacy/`). Die bewährte Fachlogik aus Flow 5 bleibt wortgleich und ist durch `test/core.test.mjs` festgehalten. Änderungen daran sind bewusste Schritte mit Testanpassung.
- **Zustand als Zeilen** `{s, k, v}` mit fortlaufender Nummer `seq`. Geräte holen nur Neues ab (`/api/sync?since=`) und senden nur Änderungen (`/api/push`). Löschen ist eine Zeile mit `v = null`. Das Format ist mit Flow 5 kompatibel.
- **Rechte im Server, nicht nur in der Oberfläche** (`worker/src/sync.js` → `rule`).
- **Offline-fest:** Ungesendete Änderungen bleiben im Browser und werden nach Rückkehr der Verbindung gesendet (aus dem Kern übernommen).

## API

| Methode | Pfad | Wer | Zweck |
|---|---|---|---|
| POST | `/api/login` | alle | `{name, pin}` → `{token, name, role}` |
| GET | `/api/me` | angemeldet | eigene Rolle |
| POST | `/api/logout` | angemeldet | Sitzung beenden |
| GET | `/api/sync?since=N` | angemeldet | Zeilen nach Stand N, `more` bei weiteren Seiten |
| POST | `/api/push` | Team, Leitung | `{ops:[{s,k,v}]}` → `{seq, n, rej}` |
| GET | `/api/seed` | Leitung | Stammdaten für die Erstbefüllung |
| POST | `/api/pin` | Leitung | PIN setzen |
| GET | `/api/users` | Leitung | wer hat eine PIN |
| POST | `/api/ask` | angemeldet | Perplexity, ohne Personendaten |
| GET | `/healthz` | alle | Version |

## Tests

| Befehl | Prüft |
|---|---|
| `npm test` | Logik-Kern inkl. Originaldaten (10 Tests) und API inkl. Sicherheit (11 Tests) gegen SQLite |
| `npm run test:e2e` | echter Worker lokal + Seite in zwei Browsern: Erstbefüllung, PIN, Live-Abgleich, Rechte, Umzug, falsche PIN, Shopfloor-Runde, Station mit Rückgängig |
| `npm run dev` | lokaler Server unter http://localhost:8787 |

CI (`.github/workflows/ci.yml`) führt alles bei jedem Push aus und stellt die Worker-Datei als Download bereit.
