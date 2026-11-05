# MUNSCH Flow

Logistik-Leitstand für Munsch Chemiepumpen: Lagebild, Fachverwaltung, Milkrun, Tageszahlen, Anwesenheit, Register, Kommunikation und Werkstattmonitor, live abgeglichen über die MUNSCH Zentrale auf Cloudflare.

```
npm install
npm run dev      # lokal: http://localhost:8787
npm run check    # bauen + alle Tests
npm run build    # dist/munsch-flow.html und dist/munsch-zentrale-worker.js
```

| Ordner | Inhalt |
|---|---|
| `app/src/ui` | Oberfläche: `app.js` Gerüst und Seiten, `shopfloor.js` Shopfloor 06:45, `station.js` Tablet in der Halle, `pages.js` Materialfluss, Schichtaufgaben, 5S, Planung, Schichtplan, Qualifikationen, Auswertung, Excel-Import, Berichte, Lagerfachmonitor, `today.js` Heute, Fristen, Wochenrückblick, Tagesabschluss, Probelauf, `extras.js` persönliche Nachrichten, Fach-Etikett, Geräteübersicht, `cinema.js` Ton und Vibration, Erfolgsszene, Alarm, Seitenwechsel, Rundgang, `cinema2.js` Zeitreise im Schichtpuls, Kachel-Zoom, Tageslicht, Tiefe, `film.js` Monatsrückblick als Film, `stage.js` Shopfloor-Bühne mit Handy-Fernbedienung, `mine.js` persönliche Startseite „Mein Tag“ |
| `app/src/legacy` | eingefrorener Logik-Kern, Sync und Excel-Parser aus Flow 5 |
| `app/src/core` | Ergänzungen zum Kern: Fachregeln (Sonderbetrieb, Fristen) und Sync-Sicherheitsnetz |
| `worker/src` | Cloudflare Worker: Anmeldung, Abgleich, Rechte, Perplexity |
| `test` | Kern-, API- und Ende-zu-Ende-Tests |
| `tools` | Build, lokaler Server, Übernahme aus Flow 5 |
| `legacy/flow5.html` | MUNSCH Flow 5 als Referenz |
| `docs` | [Architektur](docs/ARCHITEKTUR.md), [Betrieb](docs/BETRIEB.md) |
