# MUNSCH Flow – Unterlage für Betriebsrat und Datenschutz

Stand: November 2026 · Verantwortlich für den Betrieb: Teamleitung Logistik (M. Thiel)
Zweck dieser Unterlage: Grundlage für die Mitbestimmung nach § 87 Abs. 1 Nr. 6 BetrVG und für das Verzeichnis der Verarbeitungstätigkeiten (Art. 30 DSGVO). Sie beschreibt, was die Anwendung tatsächlich tut, und macht Vorschläge für eine Regelung.

## 1. Wozu die Anwendung dient

MUNSCH Flow ist das digitale Schichtbrett der Logistik: Lagerfächer, Milkrun, Wareneingang und Prüfung, Sägen, Materialwagen, Werksverkehr, Tageszahlen, Störmeldungen, 5S, Shopfloor-Runde um 06:45, Schichtplan, Urlaub und Abwesenheiten, Nachrichten im Team.

Ziel ist die Steuerung des **Bereichs**, nicht die Bewertung einzelner Personen.

## 2. Welche personenbezogenen Daten gespeichert werden

| Daten | Inhalt | Wer sieht es | Zweck |
|---|---|---|---|
| Namensliste | Kurzname, Vorname, Rolle | alle Angemeldeten | Anmeldung, Zuordnung |
| PIN | nur als Hash (PBKDF2, 100 000 Runden), nie im Klartext | niemand | Anmeldung |
| Anmeldekarte (optional, standardmäßig aus) | nur als Hash (SHA-256) eines Zufallscodes | niemand | Anmeldung per Handscanner |
| Schichtplan | wer an welchem Tag in welchem Bereich | alle | Einteilung |
| Stammbereich | fester Bereich je Person | alle, ändern nur Teamleitung | Bereichsansicht |
| Qualifikationen | je Fähigkeit: lernend, sicher, Trainer | alle, ändern nur Teamleitung | Einsatzplanung, Ausfallrisiko |
| Urlaub, FZA | Zeitraum, Status | alle | Planung, Besetzung |
| Krankmeldungen | Zeitraum | **nur Teamleitung und die Person selbst**; für alle anderen nur „Abwesend“ | Besetzung |
| Personalgespräche | Termin, Thema | **nur Teamleitung** | Führung |
| Persönliche Nachrichten | Text | nur Empfänger und Teamleitung | Kommunikation |
| Team- und Abteilungsfunk, Schwarzes Brett, Danke-Brett | Text mit Absender | alle | Kommunikation |
| Buchungsprotokoll | wer hat wann welches Fach, welche Runde, welche Zahl gebucht | alle | Nachvollziehbarkeit im Ablauf |
| Shopfloor-Protokoll | Vortragende Person, Maßnahmen mit Verantwortlichen | alle | Shopfloor-Management |
| Anmeldeprotokoll (Server) | Zeit, Name, Ereignis, IP-Adresse | nur Betrieb (Cloudflare-Konto) | Sicherheit, Missbrauchserkennung |
| Nutzungszählung | Seitenaufrufe je Gerät und Tag, **ohne Name** (zufällige Geräte-Kennung) | Teamleitung | Pilot auswerten, Unnötiges entfernen |
| Pilot-Rückmeldung | freier Text und Art (stört, fehlt, gut), **ohne Name, nur Datum** | Teamleitung | Pilot auswerten |

Nicht gespeichert werden: Standort, Kamera, Mikrofon, Arbeitszeiten (Kommen/Gehen), Leistungskennzahlen je Person.

## 3. Was die Anwendung ausdrücklich nicht tut

- Sie bildet **keine Ranglisten oder Leistungswerte je Person**. Tageszahlen, Prognosen und Rekorde gelten für den Bereich (Säge, Wareneingang …), nicht für Personen.
- Die Station im Bereich bucht mit Namen, damit Rückfragen zu einem Fach oder einer Runde möglich sind. Eine Auswertung „wer hat wie viel gebucht“ gibt es nicht.
- Die Nutzungszählung kennt keine Person.
- Krankheitsgründe werden nicht erfasst.

## 4. Rechte und Schutz

- Rollen: Teamleitung, Team, Station (Tablet in der Halle), Monitor (nur lesen). Was jemand schreiben darf, prüft der **Server**, nicht nur die Oberfläche (z. B. Personalgespräche, Qualifikationen, Stammbereich, fremde Urlaube).
- Anmeldung mit persönlicher PIN (mind. 6 Zeichen). Nach 5 Fehlversuchen 15 Minuten Sperre. Neue PIN meldet die Person auf allen Geräten ab.
- Gemeinsame Tablets im Bereich melden nach 10 Minuten ohne Bedienung ab.
- Übertragung nur verschlüsselt (HTTPS), strikte Sicherheitsrichtlinie im Browser (CSP), keine Fremd-Skripte.
- Betrieb auf Cloudflare (Workers und D1-Datenbank). **Empfehlung:** Datenbank mit Speicherort EU anlegen (`--jurisdiction eu`) und den Auftragsverarbeitungsvertrag (DPA) von Cloudflare abschließen.
- KI-Frage (Perplexity, optional): Nur aktiv, wenn ein Schlüssel hinterlegt ist. Personennamen und Abwesenheiten werden vor dem Senden entfernt. **Empfehlung:** im Pilot ausgeschaltet lassen oder gesondert regeln (Datenübermittlung in die USA).

## 5. Aufbewahrung und Löschung

| Daten | Vorschlag | Umsetzung |
|---|---|---|
| Anmeldeprotokoll mit IP | 180 Tage | automatisch, jede Nacht |
| Sitzungen | 30 Tage ohne Nutzung | automatisch |
| Krankmeldungen | 13 Monate | Knopf für die Teamleitung in den Einstellungen |
| Nutzungszählung | 60 Tage | automatisch |
| Sicherungen in R2 (falls eingerichtet) | 30 Tage | automatisch |
| Austritt einer Person | Name aus der Liste entfernen, Karte sperren | Teamleitung |

## 6. Vorschläge für eine Regelung (Betriebsvereinbarung oder Regelungsabrede)

1. Zweckbindung: Nutzung nur zur Steuerung der Logistikbereiche, nicht zur Leistungs- oder Verhaltenskontrolle einzelner Beschäftigter.
2. Keine Auswertungen je Person. Neue Auswertungen und Funktionen mit Personenbezug nur nach Information des Betriebsrats.
3. Zugriff auf Krankmeldungen, Personalgespräche und persönliche Nachrichten nur durch die Teamleitung.
4. Löschfristen wie in Abschnitt 5.
5. Pilot von 4 Wochen; danach gemeinsame Auswertung (Nutzung, Rückmeldungen) und Entscheidung über den Dauerbetrieb.
6. Ansprechperson für Fragen und Auskunft (Art. 15 DSGVO): Teamleitung Logistik; Auskunft als Export auf Anfrage.

## 7. Offene Punkte zur Klärung vor dem Pilot

- Auftragsverarbeitung mit Cloudflare (DPA) und Speicherort EU.
- Entscheidung zur KI-Frage (Perplexity).
- Ob Anmeldekarten genutzt werden sollen (derzeit aus).
- Information der Beschäftigten (kurzes Merkblatt oder Aushang).
