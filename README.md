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
| `app/src/ui` | Oberfläche (Gestaltung, Szenen, Interaktion) |
| `app/src/legacy` | eingefrorener Logik-Kern und Sync aus Flow 5 |
| `worker/src` | Cloudflare Worker: Anmeldung, Abgleich, Rechte, Perplexity |
| `test` | Kern-, API- und Ende-zu-Ende-Tests |
| `tools` | Build, lokaler Server, Übernahme aus Flow 5 |
| `legacy/flow5.html` | MUNSCH Flow 5 als Referenz |
| `docs` | [Architektur](docs/ARCHITEKTUR.md), [Betrieb](docs/BETRIEB.md) |
