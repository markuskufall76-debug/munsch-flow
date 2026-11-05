# MUNSCH Flow 6

Neue Oberfläche für den Logistik-Leitstand. Logik, Daten und Sync kommen unverändert aus MUNSCH Flow 5 (`../base.html`), damit die Zentrale und die gespeicherten Daten kompatibel bleiben.

## Bauen

```
python3 neu/build.py      # erzeugt neu/munsch-flow-6.html
```

`build.py` übernimmt aus `base.html`:
- Stammdaten (`window.MFDATA`)
- Logo und Logik-Kern (Zustand, Fächer, Milkrun-Takt, Register, Warnlage)
- die zentrale Synchronisierung (`syFlat`, `syApply`, `syPush`, `syStart` …)

Jeder Abschnitt wird über eine Marke gesucht. Fehlt eine Marke oder kommt sie doppelt vor, bricht der Build ab.

Die neue Oberfläche liegt in `src/app.css` und `src/app.js`.

## Stand der Seiten

Neu gebaut: Lagebild, Fachverwaltung mit Lagerkarte, Milkrun, Tageszahlen, Urlaub und Anwesenheit, alle Register (WEP, Wareneingang, Materialwagen, Werksverkehr, TB, Vorkommissionierung, Aufträge, QS und Störmeldungen, Maschinen, Audits, Personalgespräche), Schwarzes Brett, Abteilungsfunk, Verlauf, Einstellungen mit PIN-Verwaltung, Werkstattmonitor, Suche mit Perplexity.

Folgt in Etappe 2: Shopfloor 06:45, Schichtaufgaben, Materialfluss, 5S-Board, Planungsboard, Schichtplan, Qualifikationen, Auswertung, Excel-Import, Berichte, Stationsmodus (Tablet), Lagerfachmonitor. Deren Daten bleiben erhalten, weil der Sync immer den ganzen Zustand führt.
