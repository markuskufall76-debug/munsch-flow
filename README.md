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
| `app/src/ui` | Oberfläche: `app.js` Gerüst und Seiten, `shopfloor.js` Shopfloor 06:45, `station.js` Tablet in der Halle, `pages.js` Materialfluss, Schichtaufgaben, 5S, Planung, Schichtplan, Qualifikationen, Auswertung, Excel-Import, Berichte, Lagerfachmonitor, `today.js` Heute, Fristen, Wochenrückblick, Tagesabschluss, Probelauf, `extras.js` persönliche Nachrichten, Fach-Etikett, Geräteübersicht, `cinema.js` Ton und Vibration, Erfolgsszene, Alarm, Seitenwechsel, Rundgang, `cinema2.js` Zeitreise im Schichtpuls, Kachel-Zoom, Tageslicht, Tiefe, `film.js` Monatsrückblick als Film, `stage.js` Shopfloor-Bühne mit Handy-Fernbedienung, `mine.js` persönliche Startseite „Mein Tag“, `forecast.js` Prognose bis Schichtende, `halle.js` Hallenplan mit Fächern, Störungen, Milkrun und Suche, `moments.js` Rekord-Szene, Ruhemodus, Morgenauftakt im Shopfloor, `flow.js` Materialfluss, Kamerafahrt, lebender Hintergrund, Bauchbinde, `filmrec.js` Monatsrückblick als Videodatei, `focus.js` Bereichsansicht, Gerät im Bereich, Anmeldekarten für Handscanner (optional), `care.js` Ausfallrisiko, Datensicherung, Aufbewahrung, Nutzung anonym, ruhiger Modus, Schnellanmeldung, `pilot.js` anonyme Rückmeldung im Pilot, `clips.js` Shopfloor-Begrüßung, Tag und Woche in Zahlen als Film und MP4, persönlicher Begrüßungsfilm, `kino.js` Kino-Hintergrund (WebGL-Licht durch Hallendunst, Filmkorn, eigenes Video je Gerät), `open.css` Seitengestaltung „offen“ (Standard, je Gerät auf Kacheln umschaltbar), `lage2.js` Lagebild als Bühne (Hallenbild, Lage in einem Satz, Schicht als Band, Bogenanzeige, Produktbild; Bilder in `app/src/img`, KI-generiert), `pagehero.js` Kopfbild mit Titel und Lage-Satz für alle Seiten, Kapitelnummern, `buehne.js` Werkstattmonitor, Shopfloor und Ruhemodus in der Bildwelt, Lichtimpuls bei Erfolgen, `hell.css` heller Modus mit Bildkarten, `fx.js`/`lesbar.css` Effektstufe je Gerät (voll, ausgewogen, ruhig; automatisch), große Schrift, Lesbarkeit, `module.js` Zusatzmodule, je Modul ein- und ausschaltbar (Unterweisungen mit Ablauf, Lieferanten-Auswertung, Materialabruf, Fehlteile, Leergut, Versand, Verbesserungsvorschläge, Arbeitsanweisungen), `betrieb.js` Monitor-Konto (nur lesen), Fehlerberichte an die Zentrale, Hilfe an Ort und Stelle, `vorpilot.js` vor dem Pilot: Sicherung prüfen ohne Überschreiben, Pilot-Auswertung je Woche, Hinweis bei Urlaub über dem Anspruch, fehlende Tageszahlen ab 14:50 in der Warnlage, `klang.js` Klangbild (synthetische Klänge für Tippen, Plus/Minus, erledigt, eingelagert, Fehler, Hinweis, Alarm, Rekord, Folienwechsel; Lautstärke je Gerät, Monitore laut), `lesehalle.js`/`lesehalle.css` Hallenmodus (größere, kräftigere Schrift, heller Nebentext; automatisch an Station, Monitor, Widgets und Shopfloor auf dem großen Monitor), `widget.js`/`widget.css` Zahlen-Widgets je Abteilung (eigene Adresse /w/<id>, installierbar) und Zahlen-Leiste unten in der App, `polish.js`/`polish.css` Feinschliff: Kurven, Druckgefühl, Hover nur mit Maus, gleitende Markierung, Kurven zeichnen sich, Handy-Begrüßung |
| `app/src/legacy` | eingefrorener Logik-Kern, Sync und Excel-Parser aus Flow 5 |
| `app/src/core` | Ergänzungen zum Kern: Fachregeln (Sonderbetrieb, Fristen) und Sync-Sicherheitsnetz |
| `worker/src` | Cloudflare Worker: Anmeldung, Abgleich, Rechte, Perplexity |
| `test` | Kern-, API- und Ende-zu-Ende-Tests |
| `tools` | Build, lokaler Server, Übernahme aus Flow 5 |
| `legacy/flow5.html` | MUNSCH Flow 5 als Referenz |
| `docs` | [Architektur](docs/ARCHITEKTUR.md), [Betrieb](docs/BETRIEB.md) |


Betriebsrat und Datenschutz: [docs/DATENSCHUTZ.md](docs/DATENSCHUTZ.md) (als Word: docs/MUNSCH-Flow-Datenschutz-Betriebsrat.docx) · Merkblatt für das Team: docs/MUNSCH-Flow-Merkblatt-Team.docx
