# Saphir – zusammenhängender Buchungsfluss

Ausgangsstand: `816e033c37dbf0ef5e586a45d04535fd160e08d2`, Branch `work/apartments-direkt`.

## Umsetzung

- Galerie, Kalender, Eckdaten und oberes Reiseformular bleiben erhalten. Das Formular ist durch Aqua und seegrüne Umrandung deutlicher hervorgehoben.
- Erst eine erfolgreiche, zur aktuellen Reise passende Verfügbarkeitsantwort öffnet den zusammenhängenden Bereich: optionale Leistungen → Kurabgabe → Preisübersicht → Zur Buchung / bestehender Smoobu-Frame. Weiße Teilflächen stehen auf Aqua.
- Vor Prüfung, während erneuter Prüfung, bei Änderung der Reise, Fehler, Nichtverfügbarkeit und Buchungsbeschränkungen bleibt der Block verborgen. Ein offenes Buchungs-Disclosure wird beim Verwerfen des Ergebnisses geschlossen. Der bestehende konkrete Hinweis vor Änderungen bereits geladener Buchungsdaten bleibt erhalten.
- Die allgemeinen Inhalte folgen danach: Ausstattung, Preise/Buchung/Ablauf, ausführliche Kurabgabeninformationen, Lage. Ihre Texte wurden nicht verändert.
- Kurabgabe: automatische Berechnung, kompakte Reisegruppe und Betrag; Sonderfelder samt Datenschutzhinweis/Zurücksetzen nur bei gewählter Ermäßigung/Befreiung. Die vollständige Berechnung einschließlich Saison, Tageszählung, Kategorien und Obergrenzen bleibt im standardmäßig geschlossenen „Berechnung anzeigen“ erhalten. Keine Änderung der Berechnungsregeln.
- Sticky-Leiste und Preisübersicht erhalten ihren Gesamtbetrag aus derselben Berechnung inklusive Extras und berechenbarer Kurabgabe. Bei unbekanntem Kurabgabentarif zeigen beide ausdrücklich nur eine Zwischensumme ohne Kurabgabe.
- Der kompakte Zahlungshinweis unterscheidet weiterhin die lokale Kostenübersicht vom maßgeblichen Smoobu-Betrag und weist auf separat abgerechnete Kurabgabe sowie die erneute Extras-Auswahl hin.
- Keine Änderung an Apartments-Übersicht, Startseite, Preisregeln, Reisegruppenvalidierung, API-Vertrag, Kalender, Galerie oder Smoobu-Integration.

## Geänderte Dateien

- `src/pages/apartments/saphir.astro`
- `src/components/apartment/SaphirBookingBar.astro`
- `src/components/apartment/BookingSection.astro`
- `src/components/apartment/SaphirPriceSummary.astro`
- `src/components/apartment/VisitorTaxCalculator.astro`
- `src/scripts/saphir-booking.ts`
- `src/scripts/visitor-tax.ts`
- `scripts/check-saphir.mjs`
- `scripts/check-saphir-interactions.mjs`
- dieser Bericht

## Prüfung

`npm run test:apartments` und `PUBLIC_AVAILABILITY_URL=https://api.nordsee-buesum-fewo.de/availability ASTRO_TELEMETRY_DISABLED=1 npm run build` erfolgreich.

Die Tests umfassen Preisregeln, API-Adapter, Reiseparameter/Altersgruppen, Mindestaufenthalt ohne Verfügbarkeitszusage, Extras und alle 32 unveränderten Kurabgabenfälle. Die tatsächlichen Seitenskripte laufen zusätzlich gegen das gebaute HTML in jsdom. Ergänzte Prüfungen: versteckter Buchungsblock vor Prüfung, während Prüfung und bei Fehler-/Beschränkungsstatus; Reihenfolge aller Schritte vor Ausstattung; zunächst geschlossene Berechnungsdetails; identische Sticky-/Hauptsummen einschließlich Sonderermäßigung; unbekannter Jahrestarif; Öffnen/Schließen der Buchungsmaske. Bestehende Prüfungen für verspätete Antworten, Datumswechselwarnung, Befüllung, Menü, Galerie/Fokus und Kalenderhöhe bleiben erfolgreich.

## Veröffentlichung und visuelle Abnahme: offen

Der GitHub-Connector bietet keinen Start eines `workflow_dispatch`. Der bestehende Pages-Workflow veröffentlicht `main` bei Push oder einen manuell gewählten Branch. Er wurde nicht geändert. Im Cloud-Browser zeigt GitHub „Sign in“ und keinen Workflow-Start. Nach AGENTS.md darf ohne gesonderte Freigabe kein persönlicher GitHub-Login angefordert oder verwendet werden.

Der Cloud-Browser kann auch die laufende lokale Vorschau nicht öffnen (`net::ERR_BLOCKED_BY_CLIENT` für `http://127.0.0.1:4321/borck-webseite-neu/apartments/saphir/`). Daher keine behauptete Desktop-/Tablet-/Smartphone-Sichtprüfung des neuen Stands. Responsive CSS und DOM-Verhalten sind umgesetzt/geprüft; tatsächliche Darstellung, horizontale Überläufe und Sticky-Verdeckung müssen nach Veröffentlichung im echten Browser abgenommen werden.

## Bewusst später

Eigene Gastdatenmaske, verbindliches Buchen per Smoobu-API, Übertragung der Extras/Kurabgabe in die tatsächliche Buchung, Zahlungsabwicklung und Entfernung des Smoobu-Frames bleiben separate Aufgaben. Keine Testbuchung; keine Änderungen an Produktivwebsite, VPS, DNS/IONOS, Smoobu, Marvins Projekt oder PR #3.
