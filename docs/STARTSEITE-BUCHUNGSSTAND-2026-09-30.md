# Startseite an Apartmentsuche angebunden

Basis: `c08d31873b01840818f8cb73e79f980240831568`, Branch `work/apartments-direkt`.

## Änderungen

- Startseitenformular sendet ausschließlich `arrival`, `departure`, `guests` per nativem GET an die bestehende `/apartments/`-Seite unter dem GitHub-Pages-Basispfad. Gemeinsame Datums-/Personenvalidierung aus `travel-search.mjs`; keine eigene Preislogik und kein API-Aufruf auf der Startseite. Ungültige Daten werden nicht stillschweigend korrigiert.
- Die Content Security Policy erlaubt dafür Formularziele derselben Herkunft (`form-action 'self'`). Direkte Netzwerkabfragen und Frames auf der Startseite bleiben gesperrt.
- Gültige URL-Reisedaten starten auf der Apartments-Seite genau eine vorhandene API-Abfrage. Ungültige/unvollständige Parameter starten keine Suche. Rückkehr aus dem Browsercache aktualisiert Ergebnisse; verlassene/veraltete Abfragen werden abgebrochen. Manuelle Suche und Zurücksetzen bleiben erhalten.
- Vorschau-Pseudosuche, falsche Nichtbuchbarkeits-/Nichtverfügbarkeitsaussagen und interne Freigabetexte entfernt. Banner: „Neue Website · Vorschau“. Informationsdialoge erläutern den tatsächlichen Such-/Buchungsweg und die Weitergabe der Reisedaten statt lokaler Nichtübermittlung. Kontakt, Identitätsangaben und Hinweise zur Testwebsite bleiben erhalten.
- Google-Hero: fünf Sternsymbole und „Google · 4,6 Sterne“, unveränderter Google-Link, ohne Rezensionenzahl und Datum.
- Vorteil: „Flexible Anreise“ mit Anreise ab 15 Uhr und später Schlüsselübergabe.
- Zahlungs-FAQ: Überweisung/Kreditkarte, regulär 50 € Anzahlung innerhalb von sieben Tagen nach Bestätigung, Rest 30 Tage vor Anreise, kurzfristig Gesamtbetrag sofort. Die zusätzliche Auswahl „Gesamtbetrag jetzt bezahlen“ ist ausdrücklich als noch nicht vorhandene Funktion beschrieben; keine automatische Kartenabbuchung zugesagt.
- Saphir-Karte verlinkt direkt auf `/apartments/saphir/`. Sechs weitere Apartments behalten ihre Kurzansichten. Keine neuen Detailseiten.
- Reihenfolge, Bilder, Farben, Typografie und allgemeine Inhalte erhalten. Nur der längere Suchbutton bekommt auf schmalen Displays eine volle Formularzeile; sehr schmale Displays zeigen die Eingaben untereinander.

## Dateien

- `src/pages/index.astro`
- `src/scripts/home.ts`
- `src/scripts/directory-search.ts`
- `src/layouts/Layout.astro`
- `src/data/faqs.json`
- `scripts/check-home-search.mjs`
- `package.json`
- dieser Bericht

## Tests

Erfolgreich: `npm run test:apartments` und `PUBLIC_AVAILABILITY_URL=https://api.nordsee-buesum-fewo.de/availability ASTRO_TELEMETRY_DISABLED=1 npm run build`.

Neue DOM-Tests führen die tatsächlichen Startseiten-/Apartmentskripte gegen gebautes HTML aus: natives GET-Ziel und Formularparameter, Validierung, keine eigene Startseitenabfrage, URL-Übernahme, automatischer Suchstart ohne Doppelaufruf, Zurücknavigation, manuelle Suche, Zurücksetzen, veraltete Antworten, Mindestaufenthalt, Nichtverfügbarkeit, Netzwerkfehler, Saphir-Link, sechs Kurzansichten, Menü und Dialog-Fokusrückgabe. Transportantworten sind Testdaten, keine Live-Ergebnisse. Bestehende Apartment-/Saphirprüfungen einschließlich 32 Kurabgabenfälle erfolgreich.

## Noch offen

Die visuelle Desktop-/Smartphone-Abnahme und die echte Browser-Navigation des neuen Stands sind nicht bestätigt: Der Cloud-Browser blockiert die lokale Vorschau mit `net::ERR_BLOCKED_BY_CLIENT`. DOM-Tests sind kein Nachweis für Layout, horizontale Überläufe oder reales Browser-Back-Verhalten. Nach Veröffentlichung ist diese Prüfung nachzuholen.

Der bestehende Pages-Workflow veröffentlicht nur Pushes auf `main` automatisch; der Arbeitsbranch benötigt weiterhin den manuellen Workflow-Start. Keine Workflow-/Repository-Einstellungen geändert und keinen manuellen Deploy ausgelöst. Produktivwebsite, Smoobu, VPS, DNS/IONOS und Marvins Projekt unverändert; PR #3 nicht gemergt; keine Buchung oder Zahlung ausgelöst.
