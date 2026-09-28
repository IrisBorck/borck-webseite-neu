# Saphir – Überarbeitung vom 28. September 2026

Arbeitsgrundlage: `work/apartments-direkt`, Commit `0012c52a84dccb3f2681cec35b0e65c43e58c951`, verbindliche AGENTS.md und Iris' Auftrag „Saphir-Detailseite fertigstellen“.

## Umsetzung

1. Galerie/Kalender: kompaktere Abstände, breiterer Kalenderbereich neben der Galerie auf breitem Desktop; vorhandenes Smoobu-Widget schaltet bei mehr als 500 px Widgetbreite auf zwei Monate nebeneinander. Unter 1101 px Seitenbreite stehen Galerie und Kalender untereinander. Alle 14 Fotos, sechs Vorschauen, Lightbox und vorhandene dynamische Kalenderhöhe bleiben erhalten. Die tatsächliche Darstellung des externen Widgets ist nach Veröffentlichung visuell abzunehmen.
2. Preis & Buchung: natürliche Position nach Galerie/Kalender, danach sticky unter der Hauptnavigation. Reiseauswahl im Dialog, aktuelle öffentliche API, eindeutige Verfügbarkeits- und Fehlerzustände, Weiterleitung in das bereits vorhandene Smoobu-Formular. Keine zweite Buchungsstrecke. Mobile Darstellung in zwei kompakten Zeilen; bei sehr niedrigen Viewports (bis 550 px Höhe) wird die Leiste statisch, damit Formularinhalte erreichbar bleiben. Anker-/Fokusabstände berücksichtigen die gemessenen Leistenhöhen.
3. Ausstattung: natürlich hohe Gruppen in drei bzw. zwei bzw. einer Spalte, ohne große gleichförmige Karten. Inhaltsabgleich gegen den Ausgangsstand: Kategorien, Texte und Fettschrift vollständig erhalten.
4. Optionale Leistungen: immer sichtbare kompakte Preisliste; alle sechs Positionen und Preise unverändert, zweispaltig bzw. mobil einspaltig.
5. Kurabgabe: kompakterer Rechner, synchronisierte An-/Abreise, Hinweis auf die gewählte Gesamtpersonenzahl. Altersfelder bleiben anfangs leer und werden nicht aus der Gesamtzahl abgeleitet. Eine vollständige, zur Reisegruppe passende Berechnung erscheint als eigener Preisbestandteil. Bei Änderungen wird die alte Summe sofort verworfen. Tariflogik, Saisonwechsel, beide Reisetage, Ermäßigungen/Befreiungen unverändert. Optionale Leistungen bleiben als noch auszuwählend gekennzeichnet; es wird kein vollständiger Endpreis behauptet.
6. Lage: vorhandenes Bild, sechs Hauptentfernungen und weitere aufklappbare Entfernungen bleiben erhalten. Hauptweg ist „Mehr zu Lage & Anfahrt“ zur Startseite; der doppelte externe Google-Maps-Link entfällt.
7. Buchungsinformationen: 85 € bei 1–4 Nächten, kein Zuschlag ab 5 Nächten, separate Kurabgabe, 50 € Anzahlung, Rest 30 Tage vor Anreise und volle Fälligkeit bei kurzfristiger Buchung bleiben erhalten. Keine neue Zahlungsfunktion eingebaut.

Die Saphir-Buchungsmaske und ihr separates Fenster verwenden weiterhin die gemeinsame validierte Smoobu-URL-Funktion. Änderungen der Reisedaten aktualisieren auch einen bereits geladenen Frame. Der Reiseauswahldialog weist darauf hin, dass dabei dortige Eingaben verloren gehen. Smoobu-interne Änderungen können mangels dokumentierter Rückschnittstelle nicht zurück in die äußere Seite übernommen werden; die äußere Reiseauswahl ist die gemeinsame Eingabestelle.

Die einzige Änderung am gemeinsam genutzten Seitenskript betrifft die Fokusrückgabe: Der auslösende Button wird je Dialog gespeichert. Ein zuvor geöffnetes Informationsfenster kann dadurch beim Schließen der Reiseauswahl oder Galerie nicht mehr den Fokus übernehmen. Gestaltung und Inhalte der Startseite und Apartments-Übersicht sind unverändert.

## Kreditkartenprüfung – keine Einstellungen geändert

Aktuelle offizielle Dokumentation, gelesen am 28.09.2026:

- Smoobu dokumentiert die Anzahlung als Prozentsatz des Gesamtpreises. 0 % und 100 % bedeuten dort beide vollständige Zahlung bei Buchung. Eine feste 50-€-Anzahlung ist in dieser Dokumentation nicht bestätigt. Ebenso nicht bestätigt sind eine automatische Umstellung auf Vollzahlung bei weniger als 30 Tagen Vorlauf und eine vom Gast wählbare Alternative „Gesamtbetrag jetzt bezahlen“ innerhalb desselben Checkouts.
- Smoobu erlaubt Restzahlung per Stripe-Zahlungslink oder manuelle Kartenbelastung für geeignete Direktbuchungen. Eine automatische Restabbuchung zu einem festen Zeitpunkt unterstützt Smoobu laut Dokumentation nicht. Automatisierbar ist die Nachricht mit dem Zahlungslink; der Gast bezahlt selbst. Der Betrag des Links entspricht dem zum Erstellzeitpunkt offenen Saldo.
- Stripe selbst unterstützt konkrete Beträge in Cent. Daraus folgt technisch, dass 50 € oder ein bestätigter Gesamtbetrag mit einer gesonderten Integration darstellbar wären. Das belegt keine entsprechende Funktion des vorhandenen Smoobu-Checkouts. Eine eigene Zahlungsintegration bräuchte einen separaten Auftrag, serverseitige Buchungs-/Zahlungszuordnung, Terminsteuerung, Zahlungsstatusabgleich und gegebenenfalls Einwilligungs-/Authentifizierungsabläufe.
- Empfehlung: zunächst die drei offenen Smoobu-Funktionen (feste 50 €, kurzfristige Vollfälligkeit, freiwillige Vollzahlung) ausdrücklich vom Anbieter bestätigen lassen. Die bestehende Zahlungsinformation beibehalten; keine Prozentanzahlung als Ersatz für 50 € konfigurieren. Keine neue Zahlungsoption versprechen, bevor der durchgängige Ablauf geklärt ist.

Quellen:

- https://support.smoobu.com/hc/en-us/articles/360003157159-How-do-I-set-up-my-Booking-Engine
- https://support.smoobu.com/hc/en-us/articles/5639435150354-Send-a-payment-link-or-charge-the-remaining-balance
- https://docs.stripe.com/api/payment_intents/create

## Prüfungen

- `npm run test:apartments`: Preis-/Zuschlagsregeln, Serveradapter, gemeinsame Reisedaten/Smoobu-URLs; zusätzlich Saphir-Kapazität, Antwortzuordnung, Mindestaufenthalt ohne Verfügbarkeitszusage und passende Kurabgabe.
- `npm run build`: Astro-Build, bestehende HTML-/Asset-/Inhaltsprüfungen, alle 32 bestehenden Kurabgabentests.
- Neue DOM-Interaktionstests mit tatsächlichen Seitenskripten und gebautem HTML: initiale Reisedaten, keine erfundenen Altersangaben, passende Altersaufteilung, Kurabgabenpreis, Datenänderungen/Preisverwerfung, späte API-Antworten, Mindestaufenthalt, Nichtverfügbarkeit, Netzwerkfehler, Retry, lazy Buchungsiframe, Aktualisierung des geöffneten Frames und separates Fenster, Menü, alle 14 Fotos, Pfeiltasten, Fokusrückgabe und Kalenderhöhe einschließlich Schrumpfen und fremdem Absender.
- DOM-Tests verwenden ausschließlich künstliche Antworten, laden keine externen Ressourcen und erzeugen keine Buchungen. jsdom/esbuild sind nur Entwicklungsabhängigkeiten. Diese Tests ersetzen keine echte Layoutprüfung.
- Lesende Live-API-Kontrolle: 05.–09.10.2026, 2 Personen liefert Saphir `available`, `baseCents: 42000`, `currency: EUR`; CORS erlaubt `https://irisborck.github.io`. Website-Aufenthaltspreis daraus: 505 € einschließlich 85 € Zuschlag, ohne Kurabgabe/Extras.
- 05.–08.10.2026, 2 Personen liefert auf der derzeit laufenden API noch `restriction`, keine `minimumNights`. Die neue Seite zeigt deshalb korrekt neutral „Nicht direkt buchbar“. Die genauere Mindestaufenthaltsanzeige funktioniert mit entsprechend angereicherter API-Antwort; der VPS wurde nicht verändert.

## Veröffentlichung und offene Abnahme

Noch nicht veröffentlicht. Der vorhandene Pages-Workflow benötigt für diesen Branch einen manuellen Start (`workflow_dispatch`). Die verfügbare GitHub-Verbindung unterstützt keinen Workflow-Start. Der Cloud-Browser ist nicht bei GitHub angemeldet; nach AGENTS.md darf ohne gesonderte Freigabe keine Anmeldung mit Iris' persönlichem Konto angefordert oder verwendet werden. Workflows, Repository-Einstellungen und main wurden nicht als Umgehung geändert.

Auch die lokale Browserprüfung ist blockiert: Der bereitgestellte Cloud-Browser verweigert `localhost` mit `ERR_BLOCKED_BY_CLIENT`. Daher noch offen: echte Desktop-/Smartphone-Darstellung, Scroll-/Sticky-Verhalten, Überläufe, native Datumswahl und Fokusfalle, externes Kalenderlayout mit zwei Monaten, tatsächlicher Smoobu-Frame und Rückvergleich seiner Preise. Für den manuellen Test ist der bestehende Pages-Workflow auf `work/apartments-direkt` zu starten:

https://github.com/IrisBorck/borck-webseite-neu/actions/workflows/pages.yml

Keine Testbuchung, kein PR-Merge, keine Änderungen an Produktivwebsite, Smoobu, VPS, DNS/IONOS oder Marvins Projekt.

## Geänderte Dateien

- `docs/SAPHIR-FERTIGSTELLUNG-2026-09-28.md`
- `package-lock.json`
- `package.json`
- `scripts/check-saphir-interactions.mjs`
- `scripts/check-saphir-travel.mjs`
- `src/components/apartment/BookingSection.astro`
- `src/components/apartment/SaphirBookingBar.astro`
- `src/components/apartment/SaphirPriceSummary.astro`
- `src/components/apartment/VisitorTaxCalculator.astro`
- `src/lib/saphir-travel.mjs`
- `src/pages/apartments/saphir.astro`
- `src/scripts/apartment-booking.ts`
- `src/scripts/apartment-shell.ts`
- `src/scripts/saphir-booking.ts`
- `src/scripts/visitor-tax.ts`
