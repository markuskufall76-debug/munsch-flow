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
- **Rechte im Server, nicht nur in der Oberfläche** (`worker/src/sync.js` → `rule`, `canRead`). Persönliche Nachrichten (`funk.@Name`) liefert der Server nur an die Person und die Teamleitung aus, Personalgespräche nur an die Teamleitung. In Flow 5 waren beide nur in der Oberfläche verborgen.
- **Excel-Import:** Die Parser sind wortgleich aus Flow 5 eingefroren (`app/src/legacy/excel.js`), weil sie auf die echten Dateien abgestimmt sind. Die Bibliothek SheetJS 0.20.3 liefert der Worker selbst aus (`/vendor/xlsx-0.20.3.js`) und lädt sie erst beim Import.
- **Fachregeln-Erweiterung** (`app/src/core/rules-ext.js`): Sonderbetrieb an Wochenenden und Feiertagen (`S.extra`), ruhende Hinweise ohne Betrieb, Fristen in der Warnlage, Schulferien RLP – wortgleich aus Flow 5.
- **Sync-Sicherheitsnetz** (`app/src/core/sync-ext.js`): Abschnitte, die die Zentrale kennt und ein Gerät nicht, werden weitergereicht und nie gelöscht.
- **Installierbar und offline startfähig** (`worker/src/pwa.js`): Service Worker hält Seite und Logo im Cache, die API nie. Jede Version bekommt einen eigenen Cache. Zusammen mit dem Änderungspuffer des Kerns läuft eine Station auch bei WLAN-Ausfall weiter.
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
| `npm test` | Logik-Kern inkl. Originaldaten und Sync-Sicherheitsnetz (14 Tests) und API inkl. Sicherheit (14 Tests) gegen SQLite |
| `npm run test:e2e` | echter Worker lokal + Seite in zwei Browsern: Erstbefüllung, PIN, Live-Abgleich, Rechte, Umzug, falsche PIN, Shopfloor-Runde, Station mit Rückgängig, Excel-Import mit echter .xlsx, Schichtaufgaben/5S/Schichtplan, Danke/Sonderbetrieb, Probelauf ohne Schreibzugriff, persönliche Nachricht bei Ablehnung, Etikett, Geräte, Etikettengröße, Offline-Start, Alarm-Banner und Monitor-Alarm im Vollbild, Monatsrückblick als Film, Handy-Fernbedienung mit folgendem Monitor, Mein Tag (15 Tests) |
| `npm run dev` | lokaler Server unter http://localhost:8787 |

CI (`.github/workflows/ci.yml`) führt alles bei jedem Push aus und stellt die Worker-Datei als Download bereit.
