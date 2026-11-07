# Betrieb: MUNSCH Zentrale auf Cloudflare

## Einmalig einrichten (Dashboard, ohne Kommandozeile)

1. **Datenbank anlegen:** Cloudflare-Dashboard → Storage & Databases → D1 → *Create* → Name `munsch-zentrale`.
2. **Worker anlegen:** Workers & Pages → *Create* → *Hello World* → Name `munsch-zentrale` → *Deploy*.
3. **Datenbank binden:** Worker → Settings → Bindings → *Add* → D1 database → Variablenname **`DB`** → Datenbank `munsch-zentrale`.
4. **Secrets setzen:** Worker → Settings → Variables and Secrets:

   | Name | Art | Zweck |
   |---|---|---|
   | `PIN_LEAD` | Secret | Notfall-PIN für die Teamleitung, mindestens 12 Zeichen. Damit meldet sich die Teamleitung beim ersten Start an und setzt danach die persönlichen PINs. |
   | `PPLX_KEY` | Secret, optional | Perplexity in der Suche |
   | `ALLOW_SHARED` + `PIN_TEAM` | optional | Gruppen-PIN für das Team. Nur setzen, wenn bewusst gewollt (`ALLOW_SHARED` = `1`). |

5. **Code einspielen:** Worker → *Edit code* → Inhalt komplett durch `dist/munsch-zentrale-worker.js` ersetzen → *Deploy*.

Das Datenbankschema legt der Worker beim ersten Aufruf selbst an.

## Erster Start

1. Seite öffnen, als Teamleitung mit der Notfall-PIN anmelden. Die leere Zentrale wird mit den Stammdaten befüllt.
2. **Umzug aus Flow 5** (falls bisherige Daten übernommen werden sollen): in Flow 5 unter Einstellungen „Sicherung als Text kopieren“, in Flow 7 unter Einstellungen → *Umzug aus Flow 5* einfügen und einspielen.
3. Unter Einstellungen → *Zugang und PINs* für jede Person eine PIN setzen (mindestens 6 Zeichen).

## Jede neue Version

```
npm run check        # bauen und alle Tests
```
Danach Schritt 5 wiederholen. Die Daten bleiben erhalten. Die Version steht in den Einstellungen und unter `/healthz`.

## Sicherheit im Überblick

- PINs werden mit PBKDF2-SHA256 (100 000 Runden, eigenes Salz) gespeichert, Sitzungstoken nur als SHA-256.
- Nach 5 Fehlversuchen ist der Name 15 Minuten gesperrt, je IP-Adresse nach 30.
- Eine neue PIN meldet die Person auf allen anderen Geräten ab.
- Rechte prüft der Server: Personalgespräche, Urlaubskonten und Qualifikationen schreibt nur die Teamleitung. Das Team darf nur eigene Urlaubsanträge stellen und ändern, Protokolle kann es nicht löschen. Abgelehnte Änderungen werden zurückgesetzt und protokolliert.
- Die Seite läuft mit einer Content-Security-Policy, die nur die eigenen, per Hash bekannten Skripte erlaubt.
- Anmeldungen, Notfallzugänge, PIN-Änderungen und abgelehnte Schreibversuche stehen in der Tabelle `audit`.

## Anmeldekarten (Handscanner, optional)

- Standardmäßig aus; einschalten unter Einstellungen → „Anmeldekarten“. Die App druckt eigene Karten, Firmenausweise braucht es nicht.

- Einstellungen → „Bereiche und Anmeldekarten“: Stammbereich je Person, „Karte“ stellt eine Karte aus und druckt sie im Scheckkartenformat (85,6 × 54 mm, Code 128). Der Code erscheint nur einmal.
- Handscanner als Tastatur (HID) mit Enter als Abschluss einstellen – das ist bei fast allen Geräten die Werkseinstellung.
- Verlorene Karte: „Sperren“ (meldet die Person überall ab) oder einfach neue Karte ausstellen.
- Tablets im Bereich: Einstellungen → „Dieses Gerät“ → Bereich wählen und „Gemeinsames Gerät: ja“ (Abmeldung nach 10 Minuten ohne Bedienung).
- Die Tabelle `badges` legt der Worker beim ersten Aufruf selbst an.

## Hallenmonitor und Fehlerberichte

- **Monitor-Konto:** In der Anmeldung gibt es „Monitor“ (Rolle `monitor`, nur lesen; der Server lehnt jede Änderung ab). PIN wie für alle unter *Zugang und PINs* setzen. Nach der Anmeldung startet der Werkstattmonitor von selbst, Eingabeformulare sind ausgeblendet, die Schrift ist groß.
- **Fehlerberichte:** Stürzt auf einem Gerät eine Ansicht ab, meldet die Seite das ohne Personendaten an die Zentrale (Seite, Gerätetyp, Version, Fehlertext; Tabelle `errs`, die letzten 300, höchstens 60 je Gerät und Tag). Einsehen und leeren: *Einstellungen* → „Fehlerberichte“ (nur Teamleitung).

## Datensicherung

- Einstellungen → „Datensicherung und Aufbewahrung“: Sicherung als Datei herunterladen (die Warnlage erinnert nach 7 Tagen), Sicherung einspielen, alte Krankmeldungen löschen.
- Nächtlicher Lauf: In `wrangler.toml` ist der Cron-Trigger eingetragen. Wer den Worker im Dashboard einfügt: Worker → Einstellungen → Trigger → Cron „17 3 * * *“ anlegen.
- Optional R2: Bucket `munsch-sicherung` anlegen und als Bindung `BACKUP` an den Worker hängen; dann liegen dort die letzten 30 Tage.
- Zusätzlich kann D1 per Time Travel auf einen früheren Stand zurück: `npx wrangler d1 time-travel restore munsch-zentrale --timestamp=…`.
- Empfehlung für den Speicherort: D1-Datenbank mit `--jurisdiction eu` anlegen.
