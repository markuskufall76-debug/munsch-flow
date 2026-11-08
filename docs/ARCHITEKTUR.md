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
| `npm test` | Logik-Kern inkl. Originaldaten und Sync-Sicherheitsnetz (14 Tests) und API inkl. Sicherheit (22 Tests, inkl. Anmeldekarten, Sicherung, Datenschutz, anonyme Rückmeldung, Monitor-Rolle, Fehlerberichte) gegen SQLite |
| `npm run test:e2e` | echter Worker lokal + Seite in zwei Browsern: Erstbefüllung, PIN, Live-Abgleich, Rechte, Umzug, falsche PIN, Shopfloor-Runde, Station mit Rückgängig, Excel-Import mit echter .xlsx, Schichtaufgaben/5S/Schichtplan, Danke/Sonderbetrieb, Probelauf ohne Schreibzugriff, persönliche Nachricht bei Ablehnung, Etikett, Geräte, Etikettengröße, Offline-Start, Alarm-Banner und Monitor-Alarm im Vollbild, Monatsrückblick als Film, Handy-Fernbedienung mit folgendem Monitor, Mein Tag, Hallenplan mit Suche und Zoom, Prognose, Morgenauftakt und Ruhemodus, Rekord auf zwei Geräten, Materialfluss mit Stau, Kamerafahrt, Bauchbinde, Videobild, Bereichsansicht mit Karten-Anmeldung und Station-Scan, Ausfallrisiko, Nutzung, Schnellanmeldung, Pilot-Rückmeldung, Module mit Materialabruf, Wareneingang und Lieferanten, Herkunft der Shopfloor-Zahlen, Unterweisungen, Monitor-Konto mit Fehlerbericht, Darstellung und persönliche Begrüßung, Zahlen-Widget mit Leiste in der App (30 Tests) |
| `npm run dev` | lokaler Server unter http://localhost:8787 |

CI (`.github/workflows/ci.yml`) führt alles bei jedem Push aus und stellt die Worker-Datei als Download bereit.

## Prognose

`forecast.js` rechnet je Bereich (Säge Metall, Säge Kunststoff, Wareneingang) bis 15:00 hoch:
Mitte = gebucht + Restschicht × (Anteil Schicht × Tempo heute + Rest × Ø der letzten 20 Arbeitstage).
Der Bereich ist ± Streuung der 20 Tage, anteilig zur Restschicht, und liegt nie unter dem bereits Gebuchten.
Ohne Buchung heute zählt nur der Erfahrungswert. Ziel der Sägen = Plan heute + Rückstand Vortag. „Rückstand heute“ ist, was heute nicht abgearbeitet wurde; am nächsten Arbeitstag wird derselbe Wert als „Rückstand Vortag“ geführt (`rueckVortag` in core.js).

## Hallenplan

`halle.js` zeichnet Werk 2 und Werk 1 als Schema (nicht maßstäblich). Die Lage der Bereiche steht in der Liste `Z`
am Dateianfang und lässt sich dort anpassen. Störmeldungen erscheinen am Bereich ihres QS-Felds „Bereich“.

## Momente

`moments.js`:
- **Rekord:** Liegt ein heutiger Wert (Pakete, GB/Pal, Metallsäge, Kunststoffsäge, beide Sägen) über dem Höchstwert aller früheren Tage, zeigt jedes Gerät die Szene einmal (gemerkt in `localStorage` je Tag und Feld). Prüfung nach jeder Eingabe und alle 5 s, so erreicht ein Rekord von der Station auch den Monitor.
- **Ruhemodus:** nach einstellbarer Zeit ohne Bedienung (Einstellungen, je Gerät; Standard 5 Min. an Geräten mit Maus, sonst aus; an der Station nie). Uhr, Schicht als Lichtband, wechselnde Kennzahlen, Warnungen sofort. Jede Taste oder Berührung beendet ihn.
- **Morgenauftakt:** beim Eröffnen der Shopfloor-Runde 5 s „Gestern in Zahlen“; der Monitor im Bühnenmodus spielt ihn auch, wenn am Handy eröffnet wurde. In automatisierten Tests nur mit `window.__sfi`.

## Bewegung

`flow.js`:
- **Materialfluss:** Lichtpunkte auf den Wegen im Hallenplan (Strecken in `routes()`). Dichte aus den Tageszahlen des letzten Tages; vor einem Bereich mit offener Störmeldung staut sich der Strom.
- **Kamerafahrt:** Knopf im Hallenplan. Ganze Halle, dann jeder Bereich mit Handlungsbedarf (Störung, Prognose, Langlieger, offene Vorgänge) mit Bauchbinde. Vollbild über die ganze Seite, damit der Live-Abgleich die Fahrt nicht unterbricht. Esc beendet.
- **Lebender Hintergrund** in Ruhemodus, Werkstattmonitor und Shopfloor-Bühne: ruhig in Orange, bei Warnungen schneller und wärmer, bei kritischen Warnungen rötlich.
- **Bauchbinde** im Bühnenmodus, sobald eine Folie eine vortragende Person hat.

`filmrec.js`: zeichnet den Monatsrückblick in 1920 × 1080 auf eine Leinwand und nimmt ihn mit `MediaRecorder` auf (MP4/H.264 in Chrome, Edge, Safari; sonst WebM). Dauer etwa 39 s, in Echtzeit.

## Bereichsansicht und Anmeldekarten

`focus.js`: Der Bereich einer Person kommt aus Gerät (Einstellung „Gerät gehört fest zum Bereich“, je Gerät in `localStorage`) vor Schichtplan heute vor Stammbereich (`S.home`, Abschnitt `home`, nur Teamleitung schreibt). Navigation, Schnellwahl und „Mein Tag“ zeigen dann nur die Seiten des Bereichs (`AREAP`) plus gemeinsame Seiten; „Alle Seiten“ hebt das auf. Die Rechte prüft unverändert der Server.

`worker/src/badge.js`: Teamleitung stellt je Person eine Karte aus (Code `MF-` + 16 Zeichen Base32 = 80 Bit, gespeichert nur als SHA-256 in Tabelle `badges`; eine neue Karte ersetzt die alte, Sperren beendet alle Sitzungen der Person). `POST /api/login {badge}` meldet an (nicht für die Teamleitung), `POST /api/badge/who` nennt dem Stations-Konto die gescannte Person. 20 unbekannte Karten je IP in 15 Minuten sperren die IP für 15 Minuten. Der Handscanner wird an seiner Tippgeschwindigkeit und dem Präfix `MF-` erkannt; andere Barcodes laufen wie bisher.

## Vorsorge und Betrieb

`care.js`: Ausfallrisiko aus Qualifikationen (sicher = Stufe 2+) und genehmigten Abwesenheiten der nächsten 20 Arbeitstage; Lücken in den nächsten 10 Tagen erscheinen in der Warnlage, und vor dem Genehmigen eines Urlaubs fragt die App nach, wenn dadurch niemand mehr sicher da wäre. Datensicherung als Datei (`GET /api/backup`, nur Teamleitung) und Einspielen über den normalen, rechtegeprüften Push. Nutzung anonym im Abschnitt `use` (Schlüssel Datum.Geräte-Zufallskennung). Abschnitt `cfg` (nur Teamleitung): Anmeldekarten an/aus, letzte Sicherung.

`worker/src/backup.js`: Cron-Trigger nachts: Sicherung nach R2 (Bindung `BACKUP`, 30 Tage), Protokoll 180 Tage, alte Sitzungen und Fehlversuche löschen.

Datenschutz im Server (`sync.js`, `mask`): Krankmeldungen anderer erreichen Team-Geräte nur als „Abwesend“, auch in Ablehnungen. Siehe docs/DATENSCHUTZ.md.

## Anonyme Rückmeldung

`pilot.js` und `worker/src/feedback.js`: `POST /api/feedback {t, cat}` legt eine Zeile im Abschnitt `fb` an, **ohne Namen** (`by = NULL`) und mit Zeitstempel nur auf den Tag genau. Team-Geräte lesen `fb` nicht und können es nicht über den Sync schreiben; die Teamleitung liest und hakt ab (auch dabei wird kein Name gespeichert). Höchstens 10 Rückmeldungen je Person und Tag (Zähler in `attempts`, ohne Bezug zum Inhalt).
