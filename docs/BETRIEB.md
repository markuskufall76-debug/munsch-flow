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

## Lesbarkeit in der Halle

Der Hallenmodus macht Schrift größer und kräftiger und Nebentext heller. Er ist automatisch an für das Station-Tablet, das Monitor-Konto, die Zahlen-Widgets und den Shopfloor auf dem großen Monitor (dort wächst die ganze Ansicht mit der Bildschirmbreite). Werkstattmonitor, Lagerfachmonitor und Ruhemodus sind immer im Hallenmodus. Je Gerät umstellbar unter Einstellungen → *Hallenmodus* (automatisch, an, aus).

## Zahlen-Widgets an den Arbeitsplätzen

Jede Abteilung hat eine eigene Adresse, die nach der Anmeldung nur ihre Tageszahlen zeigt: `/w/we` Wareneingang, `/w/ms` Säge Metall, `/w/ks` Säge Kunststoff, `/w/saege` beide Sägen, `/w/gp` Grundplatten, `/w/lack` Pumpen vor Lack, `/w/mont` Pumpen vor Montage, `/w/mw` Materialwagen. Die Liste mit „Kopieren“ steht unter Einstellungen → *Zahlen-Widgets*.

1. Am PC die Adresse in **Microsoft Edge** öffnen und anmelden (die Anmeldung hält 30 Tage ohne Nutzung).
2. Oben rechts „…“ → Apps → „Als App installieren“. Das Widget bekommt ein eigenes Fenster und ein Symbol in Taskleiste und Startmenü.
3. Fenster schmal an den rechten Rand ziehen (Spalten) oder flach an den unteren Rand (Zeilen); Windows merkt sich Größe und Position.
4. Autostart: `edge://apps` öffnen und beim Widget den Start bei der Anmeldung einschalten. Falls die Option fehlt: Verknüpfung in den Ordner `shell:startup` legen (Windows-Taste + R).

In der App selbst gibt es dieselben Zahlen als Leiste unten auf jeder Seite (Einstellungen → *Zahlen-Leiste*, je Gerät; automatisch nach Schichtplan, deckend oder durchsichtig). Gebucht wird in die Tageszahlen von heute; „Rückstand heute“ steht mit dem Vortag darunter.

## Datensicherung

- Einstellungen → „Datensicherung und Aufbewahrung“: Sicherung als Datei herunterladen (die Warnlage erinnert nach 7 Tagen), Sicherung einspielen, alte Krankmeldungen löschen.
- Nächtlicher Lauf: In `wrangler.toml` ist der Cron-Trigger eingetragen. Wer den Worker im Dashboard einfügt: Worker → Einstellungen → Trigger → Cron „17 3 * * *“ anlegen.
- Optional R2: Bucket `munsch-sicherung` anlegen und als Bindung `BACKUP` an den Worker hängen; dann liegen dort die letzten 30 Tage.
- Zusätzlich kann D1 per Time Travel auf einen früheren Stand zurück: `npx wrangler d1 time-travel restore munsch-zentrale --timestamp=…`.
- Empfehlung für den Speicherort: D1-Datenbank mit `--jurisdiction eu` anlegen.
