# Saphir: oberer Einstieg und gemeinsame Reisegruppe – 29.09.2026

Grundlage: `work/apartments-direkt`, `ede67decfdbe125241c61a26bee327530dca7e7e`. Änderungen ausschließlich für IrisBorck/borck-webseite-neu entsprechend dem Auftrag vom 29.09.2026.

## Umsetzung

- Eckdaten, Galerie links, Kalender rechts und alle 14 Fotos erhalten.
- Kalender: nur Überschrift und „Rot markierte Tage sind belegt.“; zusätzliche Werbe-/Anbietertexte und Link entfernt. Lade-/Fehlerhinweis bleibt nur bis zum erfolgreichen Laden. Original-Pfeilbilder auf 18 × 18 px begrenzt, Ziele weiterhin 44 × 44 px; Tastatur, Beschriftung und Monatslogik bleiben erhalten. Keine Änderungen an Smoobu selbst.
- Große Maske direkt unter Galerie/Kalender, Überschrift „Preis & Verfügbarkeit“, Button „Preise & Verfügbarkeit prüfen“. Vier Felder: Anreise, Abreise, Erwachsene ab 16, Kinder bis 15. Insgesamt 1–4 Personen; ganze Zahlen, beide Altersgruppen explizit auszuwählen (auch 0). Keine individuellen Kinderalter.
- Eine gemeinsame Reisegruppe: `adults16` und `children15`, Gesamtzahl daraus abgeleitet. Validierte URL-Parameter erlauben Wiederaufnahme. Bestehende Links mit nur Gesamtzahl übernehmen Termine und nennen die bisherige Gesamtzahl, lassen aber beide Altersfelder leer. Erst eine vollständige Gruppe ermöglicht die Preisabfrage. Die API erhält weiterhin ausschließlich Anreise, Abreise und Gesamtzahl; weder Altersaufteilung noch Sonderkategorien werden dorthin geschickt.
- Sticky-Leiste verwendet genau dieselben Daten und führt mit „Ändern“ zurück zur großen Maske. Der bisherige zweite Reiseauswahldialog entfällt. Bestehendes Verhalten bei sehr niedrigen Bildschirmen bleibt: unter 551 px Höhe statische Leiste, um Platz für Inhalte zu erhalten.
- Kurabgabenrechner übernimmt Gruppe und Daten automatisch, ohne doppelte Datums-/Personenfelder. Normale Kurabgabe wird automatisch berechnet. Checkbox „Ermäßigung oder Befreiung bei der Kurabgabe berücksichtigen“ blendet Sonderfelder ein; Änderungen aktualisieren die Summe. Gruppenänderungen verwerfen personenbezogene Sonderzuordnungen. Sonderkategorien werden nicht gespeichert oder übertragen. Die unveränderte Berechnungsfunktion berücksichtigt beide Reisetage, Saisons, Altersgrenze, Ermäßigungen, Befreiungen und Jahresobergrenzen. Ohne gültigen Tarif gibt es keinen vorgetäuschten Gesamtpreis.
- Fünf kompakte Extras-Auswahlen: Bettwäsche 0–Reisende (12 €/Person), Handtuchpakete 0–8 (9 €/Paket), Babybett 0/1 (5 €), Hochstuhl 0/1 (5 €), Hunde 0/1/2 (46 € + 23 €). Bei kleinerer gültiger Gruppe wird eine zu hohe Bettwäschemenge mit Hinweis angepasst. Während unvollständiger Eingaben bleiben vorherige Mengen erhalten. Vorauswahl bleibt nur auf der aktuellen Seite, ohne Bestellung oder Übertragung an Smoobu.
- Kostenübersicht: Smoobu-Basispreis, 85 € bei 1–4 Nächten, gewählte Extras, separat berechnete Kurabgabe, voraussichtliche Aufenthaltsgesamtkosten. Bei fehlender Kurabgabe ausdrücklich nur eine Zwischensumme. Die Anzeige bestätigt keinen Smoobu-Zahlbetrag: Maßgeblich für dortige Zahlung ist dessen eigene Aufstellung. Extras müssen vorläufig auch dort gewählt und dort enthaltene Leistungen nicht doppelt berechnet werden.
- Sichtbare Smoobu-Maske und separates Fenster bleiben. Weiterhin die etablierte Übergabe der Gesamtpersonenzahl; die lokalen Steuer-Altersgrenzen werden nicht ungeprüft als Smoobu-Altersgrenzen verwendet. Bei einer tatsächlich notwendigen Änderung eines bereits geladenen Formulars erscheint eine kurze Warnung. Abbrechen stellt die bisherige Auswahl wieder her, ohne Frame-Neuladen.

## Prüfung

Erfolgreich lokal:

- `npm run test:apartments` einschließlich neuer Fälle für bekannte/unbekannte Altersaufteilung, 0/1–4 je Gruppe, falsche Summen, ungültige Werte, Mengenbegrenzung und Hundestaffel.
- `npm run build` einschließlich HTML/Assets/Anker, Galerie-Inhalten, 32 unveränderten Kurabgabenfällen und DOM-Interaktionstests mit den tatsächlichen Seitenskripten.
- DOM: kein automatischer Preisabruf ohne vollständige Gruppe, Gesamtzahl an API, automatische normale Kurabgabe, Sonderfälle, Extras und Summen, Rückkehr mit expliziter Altersaufteilung, fehlender Zukunftstarif, ungültige Kapazität, verlorene/verspätete Antworten, Mindestaufenthalt, unverfügbarer Zeitraum, Retry, bestätigte/abgebrochene Änderungswarnung, Buchungsframe/externes Fenster, alle Fotos, Pfeiltasten, Fokusrückgabe, Menü und Kalenderhöhe.
- Beispiele aus künstlichen Testantworten (keine Live-Preisbehauptung): 420 € Basis + 85 € Zuschlag + 20 € Kurabgabe (1 Person ab 16, 1 Kind, 5 Kurabgabe-Tage) = 525 €. Mit 2 Bettwäsche, 3 Handtuchpaketen, Babybett, Hochstuhl, 2 Hunden zusätzlich 130 € = 655 €. Ermäßigung senkt im getesteten Fall die Kurabgabe auf 14 €, Summe 649 €.
- `git diff --check` fehlerfrei. Startseiten-/Übersichtsquelltext, globale Gestaltung, gemeinsame Smoobu-URL-Funktion, Steuer-Tarife/-Kern, Server und Workflows unverändert.

DOM- und Quelltextprüfungen sind keine visuelle Browserabnahme. Es wurde keine Buchung ausgelöst.

## Veröffentlichung und Browsergrenze

Die bestehende Testseite ist im Browser erreichbar und zeigt den zuvor veröffentlichten Stand. Der neue lokale Stand ist dort noch nicht veröffentlicht.

Der lokale HTTP-Prüfserver ist gestartet, der Cloud-Browser blockiert jedoch dessen URL mit `ERR_BLOCKED_BY_CLIENT`. Desktop-/Smartphone-Layout, Überläufe, Sticky-Scrollverhalten und die tatsächliche Pfeildarstellung sind deshalb noch nicht visuell bestätigt.

Der GitHub-Pages-Workflow ist erreichbar, der Browser zeigt „Sign in“ und keine Schaltfläche zum Starten. Die GitHub-Verbindung bietet keinen `workflow_dispatch`-Aufruf. Die AGENTS.md erlaubt ohne gesonderte Freigabe weder Anfordern noch Verwenden einer persönlichen GitHub-Anmeldung. Daher keine Veröffentlichung über einen anderen Workflow, main-Merge oder andere Hostingplattform erzwungen.

Nächster veröffentlichender Schritt: im bestehenden Workflow `pages.yml` den Branch `work/apartments-direkt` wählen und „Run workflow“ ausführen. Danach neue Seite auf Desktop und Smartphone visuell abnehmen.

https://github.com/IrisBorck/borck-webseite-neu/actions/workflows/pages.yml

## Restpunkte der späteren eigenen Buchungsstrecke

Noch ausstehend und ausdrücklich nicht implementiert: verbindliche Übernahme der Extras in die Buchung, abschließende serverseitige Preis-/Verfügbarkeitskontrolle, zuverlässige Buchungsanlage ohne Doppelbuchungen, Gastdaten, Zahlungszuordnung/Fälligkeiten/Stripe, Abgleich von Buchungs- und Zahlungsstatus. Auch eine verbindliche Übernahme der lokalen Kurabgabe in die tatsächliche Abrechnung benötigt den separaten Auftrag. Der VPS bleibt unverändert; genauere Mindestaufenthalte können nur dargestellt werden, wenn dessen API sie liefert.

Produktivwebsite, Smoobu-Einstellungen, VPS, DNS/IONOS, Marvins Projekt und PR #3 wurden nicht verändert oder gemergt. Nur das Aktualisieren des Arbeitsbranches aktualisiert automatisch dessen PR-Diff.

## Geänderte Dateien

- `docs/SAPHIR-REISEGRUPPE-2026-09-29.md`
- `public/calendar/saphir.html`
- `public/calendar/status.js`
- `scripts/check-saphir-interactions.mjs`
- `scripts/check-saphir-travel.mjs`
- `scripts/check-saphir.mjs`
- `src/components/apartment/SaphirBookingBar.astro`
- `src/components/apartment/SaphirExtras.astro`
- `src/components/apartment/SaphirPriceSummary.astro`
- `src/components/apartment/VisitorTaxCalculator.astro`
- `src/lib/saphir-travel.mjs`
- `src/pages/apartments/saphir.astro`
- `src/scripts/saphir-booking.ts`
- `src/scripts/saphir-gallery.ts`
- `src/scripts/visitor-tax.ts`
