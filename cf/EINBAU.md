# Perplexity im Worker einbauen

Die Seite (`base.html`) ruft `POST /api/ask` auf, aber nur auf der Cloudflare-Instanz (`window.MF_SERVER`) und nur mit einer gültigen Anmeldung.
Antwortet der Endpunkt mit 404 oder 501, blendet die Seite den Eintrag in der Suche aus. Ohne Einbau ändert sich also nichts.

## 1. Modul einbinden

`cf/ask.js` in den Worker-Build aufnehmen (oder den Inhalt in die Worker-Datei kopieren) und im `fetch`-Router vor den anderen `/api/`-Routen ergänzen:

```js
import { handleAsk } from './ask.js';

// im fetch-Handler:
if (url.pathname === '/api/ask') {
  const who = await nutzerAusToken(request, env); // bestehende Prüfung wie bei /api/me, liefert Name oder null
  return handleAsk(request, env, who);
}
```

`nutzerAusToken` steht hier für die Token-Prüfung, die der Worker schon für `/api/me` und `/api/sync` verwendet.

## 2. Secret setzen

Cloudflare-Dashboard → Worker → Einstellungen → Variablen und Geheimnisse:

| Name | Art | Wert |
|---|---|---|
| `PPLX_KEY` | Secret | API-Schlüssel von perplexity.ai/settings/api |
| `PPLX_MODEL` | Text, optional | `sonar` (Standard) oder `sonar-pro` |
| `PPLX_URL` | Text, optional | Standard `https://api.perplexity.ai/v1/sonar` |

## Schutz

- Der Schlüssel bleibt im Worker und erscheint nie in der Seite.
- Nur angemeldete Nutzer können fragen, höchstens 6 Anfragen pro Minute und Person, Zeitlimit 25 s, Antworten höchstens 600 Tokens.
- Die Seite entfernt Personennamen und die Besetzungs- und Abwesenheitszeile, bevor sie den Lagekontext sendet.
