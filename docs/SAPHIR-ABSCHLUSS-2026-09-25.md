# Saphir – Veröffentlichung und Browserprüfung, 25.09.2026

## Status

Die Veröffentlichung vor der Browserprüfung wurde durch Iris ausdrücklich freigegeben. Der Stand wurde ausschließlich auf der GitHub-Testwebsite veröffentlicht und dort in einem echten Chromium-Browser geprüft. Build, 32 Berechnungstests und statische Saphir-Prüfungen bestehen.

**Prüfgrenze:** Desktop und reale Browser-Inhaltsfenster mit 320, 375, 390, 430, 820 und 1200 px wurden geprüft. Die schmalen Inhaltsfenster entstehen in einer separaten, nicht verlinkten noindex-Prüfseite (`qa/saphir.html`). Das prüft CSS, JavaScript und verschachtelte Anbieterframes bei wechselnden Breiten. Es ist **kein Test auf einem physischen iPhone oder in iOS Safari**; Touch, iOS-Datumseingabe, virtuelle Tastatur und Safari-spezifische Effekte sind damit nicht abgenommen. Auch ein eigenständiger Screenreader-Lauf wurde nicht durchgeführt; Fokus und zugängliche Namen/Live-Status wurden im Browser geprüft.

Ausgangscommit: `af406cf80bee9a7df9fd02e16a8775deff62baa7`.
Arbeitsbereich ausschließlich `IrisBorck/borck-webseite-neu`.

## Änderungen nach Auftrag

1. Lightbox: sichtbare Bildbeschreibung entfernt. ALT-Texte und Live-Status bleiben; sichtbarer Zähler „1 / 14“. Native Dialogbedienung, Escape, Pfeiltasten und Rückgabe des Fokus an den tatsächlichen Auslöser.
2. Kalender: vorhandenes öffentliches Smoobu-Widget 133655 bleibt im isolierten iframe. `ResizeObserver` misst die tatsächliche Body-Höhe, `MutationObserver` erfasst nachgeladene Monate. Höhenmeldung via `postMessage`, akzeptiert nur vom konkreten Kalenderfenster und mit plausibler Höhe. Inhaltshöhe statt Viewporthöhe vermeidet ein Wachstum ohne Schrumpfen. Anpassung der Kalenderzellgrößen bei Breitenwechsel; vorhandene Navigation wird beschriftet und per Tastatur bedienbar. Keine künstliche feste Endhöhe und kein Ausblenden abgeschnittener Inhalte. Die reale Höhe wurde beim Laden sowie bei Monats- und Breitenwechseln im Browser geprüft; sie wächst und schrumpft mit dem Inhalt.
3. H1 und Faktenzeile bleiben; sechs ausgewählte Vorschauen (Wohnbereich, Wohn-/Essbereich, Küche, Doppelbett, Etagenbett, Bad). Alle vorhandenen 14 Fotos bleiben erreichbar. Hauptbild, Vorschaubilder und „Alle 14 Fotos ansehen“ öffnen den vollständigen Viewer.
4. Ausstattung mit Produktivseite abgeglichen. Vorhandene vollständige Kategorien bleiben erhalten: Einbauküche, Induktion, Backofen/Mikrowelle, Geschirrspüler, Kühl-/Gefrierfach, Kaffeemaschine, Wasserkocher, Toaster; Doppelbett 180 cm / 2 × 90 cm, Etagenbett, Kissen/Decken; kleines Duschbad und Haartrockner; Terrasse, saisonale Gartenmöbel, Stellplatz, Fahrradgarage, Münzwaschmaschine/-trockner; WLAN, SAT-TV, Grundig DAB+. Optionale Leistungen einschließlich zweitem Hund erhalten. Präzisierungen zum Waschraum und zweiten Hund stammen aus dem bereits bestätigten Repository-Stand, nicht aus anderen Apartments.
5. Sechs Hauptentfernungen sichtbar, zehn weitere Angaben im HTML-Aufklapper. Lange Anreise-/Umgebungstexte entfernt. Bestehende Lagegrafik und Google-Maps-Link bleiben. „Mehr zu Lage & Anfahrt“ verweist auf den tatsächlichen bestehenden Navigationsort `/borck-webseite-neu/#lage`. Eine eigenständige Lage-Seite existiert im aktuellen Repository nicht; es wurde kein falscher Link angelegt.
6. Preise, Buchungsablauf, Bestätigungs-E-Mail, Link zum Ausfüllen, Bestätigung/Rechnung, Anzahlung 50 EUR binnen 7 Tagen, Restzahlung 30 Tage vor Anreise und sofortige Gesamtfälligkeit bei kurzfristiger Buchung ergänzt.
7. Kurzreise eindeutig: 1–4 Nächte = 85 EUR einmalig, ab 5 Nächten kein Zuschlag. Zentral gepflegte Regel, keine eigene Zuschlagsberechnung. Vier-Nächte-Hinweis je Apartment aktivierbar, bei Saphir deaktiviert.
8. Kurabgabeninformation mit 2026-Tarifen, Saisonzeiten, Ermäßigungen, Begleitpersonen und Befreiungen, separater Abrechnung und Aktualitätshinweis. Offizielle Zusatzvoraussetzungen und Jahresobergrenze in einem kompakten Aufklapper.
9. Eigenständiger Rechner, wiederverwendbar und unabhängig von Smoobu. Cent-genaue Ganzzahlarithmetik, UTC-Kalendertage inklusive beider Reisetage, Nächte separat, Aufschlüsselung pro Person und Saison. Offizielle Jahresobergrenze transparent mit sichtbarer Korrektur. Nur 2026 freigegeben; unbekannte Jahre erhalten keine Summe. Kategorien statt exaktem GdB, Namen oder Dokumenten; kein Netzwerk, keine URL-Parameter, Logs oder dauerhafte Speicherung. Auswahl wird beim Neuladen verworfen, Änderungen löschen veraltete Ergebnisse. Formularübermittlung durch CSP unterbunden. Saphir begrenzt die Personenzahl auf vier; die Komponente ist konfigurierbar.
10. Vorhandene Originaladresse `https://booking.smoobu.com/9A40536?apartmentId=133655`, entnommen aus dem aktuellen Produktiv-Embed, integriert. Einblendung per nativem details/summary „Jetzt buchen“. Erst beim Öffnen wird der Frame geladen. Höhenkommunikation über dieselbe iframe-resizer-Version 3.5.16 wie im offiziellen `BookingToolIframe.js`, lokal gebündelt und mit Prüfung des Anbieter-Origins. Keine eigene Buchungslogik, kein Auslesen von Buchungseingaben. Bei ausbleibender Höhenmeldung bleibt der Frame scrollbar, zusätzlich existiert ein Link zum Originalformular. Eigener Rahmen und Datenschutzhinweise Saphir-spezifisch angepasst.

## Wichtiger bestehender Smoobu-Befund

Das Originalformular zeigt **zwei optionale Einträge für den Kurzreisezuschlag zu jeweils 85 EUR**. Ob und wann sie tatsächlich berechnet werden, wurde nicht durch eine Buchung geprüft. Dieser Befund wurde nicht in Smoobu korrigiert. Die Betreiberin muss diese vorhandene Konfiguration separat prüfen. Das Originalformular zeigte als Zahlungsart Rechnung/Überweisung; keine neue Zahlungsart wurde ergänzt.

Das Originalformular erschien in diesem Prüf-Browser auf Englisch. Die originale URL wurde unverändert übernommen; keine ungeprüften Sprachparameter ergänzt. Auf der veröffentlichten deutschen Testseite sind weiterhin unter anderem Arrival, Departure, People, Contact, Optional Extras, Payment method und die Zustimmung auf Englisch. Das Datumsformat lautet MM/DD/YY. Die Maske ist technisch bedienbar, aber sprachlich für eine deutsche Website nicht durchgängig verständlich. Dieser Anbieterbefund bleibt ausdrücklich offen; keine Änderung an Smoobu vorgenommen.

## Geänderte und neue Dateien

- `src/pages/apartments/saphir.astro`: Seitenaufbau, Galerie, kompakte Lage, Komponenten.
- `src/scripts/saphir-gallery.ts`: 14 Bilder unabhängig von sechs Vorschauen; Fokus und Kalenderhöhe.
- `public/calendar/saphir.html`, `public/calendar/status.js`: bestehendes isoliertes Kalenderwidget, Größenmessung, Tastaturnavigation.
- `src/components/apartment/BookingInformation.astro`: wiederverwendbare Preis-/Ablaufinformation.
- `src/components/apartment/VisitorTaxInformation.astro`: wiederverwendbare Kurabgabeninformation.
- `src/components/apartment/VisitorTaxCalculator.astro`, `src/scripts/visitor-tax.ts`: Formular, lokale Berechnung und Ergebnisausgabe.
- `src/lib/visitor-tax.mjs`: reine, testbare Berechnung ohne Nebenwirkungen.
- `src/data/visitor-tax.mjs`: zentral gepflegte Tarife, Kategorien, Hinweise und Quellen.
- `src/data/booking-policy.mjs`: Kurzreisezuschlag, Zahlungen, optionale Hinweise und apartmentbezogene Smoobu-Adresse.
- `src/components/apartment/BookingSection.astro`, `src/scripts/apartment-booking.ts`: wiederverwendbarer Rahmen der bestehenden Buchung.
- `src/layouts/ApartmentLayout.astro`: Anbieterframe nur mit Saphir-Opt-in erlauben; Hauptseite nutzt unverändertes eigenes Layout.
- `src/components/ApartmentDialogs.astro`: Saphir-Opt-in für zutreffende Buchungs-/Datenschutzhinweise; andere Ausgabe unverändert.
- `scripts/check-visitor-tax.mjs`, `scripts/check-saphir.mjs`: Berechnungs- und Integrationsprüfungen.
- `package.json`, `package-lock.json`: lokale iframe-resizer-Bibliothek und Prüfungen im vorhandenen Build.
- dieser Prüfbericht.

## Ausgeführte Prüfungen

- Aktueller Repository-Stand und veröffentlichte Saphir-Seite vor Änderungen gelesen.
- Produktive Saphir-Seite nur lesend: Ausstattung, Entfernungen, öffentlicher Embed-Code, bestehende sichtbare Formularfelder und Zahlungsart.
- `npm run build`: erfolgreich einschließlich vorhandener Startseitenprüfung, Saphir-Prüfung und 32 Rechentests.
- Saphir-HTML: eine H1, noindex, eindeutige IDs, lokale Anker/Assets, sechs Vorschauen, 14 Galeriedatensätze, korrekte Apartment-ID, Buchungsframe erst bei Öffnung, zentrale Ausstattungsmerkmale vorhanden.
- Statische Rechnerprüfung: keine Netzwerk-/Speicheraufrufe; keine sensible Erfassung außerhalb der Kategorien.
- Gebaute Startseite und Apartmentübersicht: **bytegleich mit dem Ausgangsstand**.
- `git diff --check`: erfolgreich.

### 32 Kurabgaben-Testfälle

Hauptsaison, Nebensaison, Frühjahr, Herbst, 24./25. Dezember, 7./8. Januar 2026, Sommer-/Winterzeitumstellung, Kind, GdB 80+ in beiden Saisons, GdB 50+ mit G/aG in beiden Saisons, ermäßigte Begleitperson in beiden Saisons, BL/H, befreite Begleitperson, gemischte Gruppe mit Kind, gemischte Gruppe bei Saisonwechsel, fehlende Anreise/Abreise, unmögliches Datum, identische Daten, umgekehrte Daten, keine Personen, negative und gebrochene Personenzahl, unbekannte Kategorie, unbekanntes Jahr, Jahreswechsel in unbekanntes Jahr, unbekanntes Jahr auch bei Befreiung, längerer Aufenthalt mit transparentem Jahresmaximum.

### Browserprüfung der veröffentlichten Website

| Bereich | Ergebnis |
| --- | --- |
| Desktop | 1363 × 936 px Browserfenster; Galerie und Kalender nebeneinander, keine horizontale Überbreite. |
| Responsive | 320/375/390/430 px sowie 820/1200 px Inhaltsfenster geprüft; Hauptseite ohne horizontalen Überlauf. Klassische Browser-Scrollleisten reduzieren die nutzbare Inhaltsbreite jeweils um 15 px. |
| Galerie | Genau sechs Vorschau-Schaltflächen. Alle 14 unterschiedlichen Fotos im Viewer durchlaufen, ALT-Texte vorhanden, Zähler und Umlauf 14 → 1 korrekt. Hauptbild und alle sechs Vorschauen öffnen den richtigen Bildindex (1, 2, 8, 9, 11, 12). |
| Fokus | Pfeiltasten, Vor/Zurück, Escape und Schließen-Schaltfläche geprüft. Fokus kehrt zum tatsächlich verwendeten Auslöser zurück. Tastaturbedienung der Dialogschaltflächen geprüft. |
| Kalender | Initiales Nachladen, Monatswechsel einschließlich Monat mit sechs Kalenderzeilen, Rückwechsel und Breitenwechsel geprüft. Desktop beispielsweise 809 → 854 px; bei 320 px nach Wechsel 568 → 563 px. Nach abgeschlossener Anpassung passen Inhalt und Frame zusammen; keine festgeschriebene Endhöhe. Tastatur-Enter auf Monatsnavigation funktioniert. |
| Aufklapper | Optionale Leistungen, weitere Entfernungen, Kurabgaben-Voraussetzungen, Begleitpersonenhinweis und Buchungsmaske lassen sich öffnen/schließen. |
| Kurabgaben-Rechner | Im Browser Haupt-/Nebensaison, März/April, Oktober/November, 24./25. Dezember und 7./8. Januar geprüft. Gemischte Kategorien und Kind ergeben korrekt 27,20 EUR für 3 Nächte/4 Tage. Mobiler Fall mit befreiter Begleitperson ergibt 16,00 EUR. Änderungen löschen alte Ergebnisse; Zurücksetzen leert Eingaben; Neuladen verwirft die Ermäßigungsauswahl; unbekanntes Jahr gibt keine Summe aus. Fehlende Anreise meldet Fehler und erhält Fokus. |
| Mobiles Menü / Dialoge | Menü öffnet und schließt, aria-expanded wechselt. Impressum-Dialog mit Escape geschlossen. |
| Smoobu Laden/Autoheight | Lazy-Frame erst nach Öffnen; dynamische Höhenanpassung beim Laden, Auswahl von Extras, Schließen/Wiederöffnen und Breitenwechsel. Nach Korrektur Desktop z. B. 1542 px Inhalt = 1542 px Frame, nach Entfernen eines Extras 1518 = 1518 px. Finale 320-px-Prüfung: Seite 305/305 px (Client-/Scrollbreite), Anbieterinhalt 321/321 px, nach Extra-Auswahl 2903 px Inhalt bei 2918 px verfügbarer Höhe; kein innerer Überlauf. |
| Smoobu Auswahl | 10.–15.11.2026, zwei beziehungsweise vier Personen über Kalender/Personenauswahl gesucht; verfügbare Ansicht erreicht. Dies ist eine unverbindliche Verfügbarkeitsabfrage, keine Buchung. |
| Smoobu Extras | Bettwäsche über Plus/Minus geändert; Betrag reagiert (z. B. 550 + 12 = 562 EUR bei zwei Personen im geprüften Zeitraum). Alle sieben vorhandenen Extra-Zeilen sichtbar. Beide Kurzreisezuschläge bleiben unberührt. Preise sind Momentaufnahmen der Live-Abfrage und keine zugesagten Preise. |
| Zahlung/Zustimmung/Abschluss | Vorhandene Zahlungsart Invoice (Bank Transfer) auswählbar; Kontaktfelder, Zustimmungsfeld und AGB-/Datenschutzlinks erreichbar. Abschlussknopf „Available - Book now!“ sichtbar und per Tab erreichbar. Keine persönlichen Daten eingetragen, Zustimmung nicht erteilt, Abschlussknopf nicht betätigt. |
| Smoobu Sprache | Überwiegend Englisch, Extras teilweise Deutsch; MM/DD/YY. Dokumentiert, nicht verändert. |

### Während der Browserprüfung korrigiert

1. Lightbox-Schließen-Symbol war weiß auf weiß: Navy-Farbe gesetzt und am veröffentlichten Stand sichtbar nachgeprüft.
2. Personennummer im Rechner brach auf eine eigene Zeile: Beschriftung zusammengefasst und mobil nachgeprüft.
3. Smoobu-Elternbibliothek ignorierte Höhenänderungen bis 34 px: Toleranz auf 0 gesetzt. Der zusätzliche innere Scrollbalken nach Extras verschwand in der Desktop-Nachprüfung.
4. Bei 320 px war der Buchungsrahmen für die minimale Breite des Anbieterformulars zu schmal: nur unter 360 px den äußeren Rahmen bis zum Seitenrand erweitert. Bei Framebreiten unter 340 px zusätzlich 16 px Reserve auf jede gemeldete Inhaltshöhe, damit klassische horizontale/vertikale Scrollleisten sich nicht gegenseitig auslösen. Höhenmeldungen werden ausdrücklich in Zahlen umgewandelt. Nur unter 360 px wird das Anbieterframe auf 95 % skaliert, um seine Mindestbreite einschließlich klassischer Scrollleisten einzupassen. Es bleibt eine dynamische, auch schrumpfende Höhe. Keine CSS-/Sprach-/Konfigurationsänderung innerhalb von Smoobu.
5. Separate noindex-Prüfansicht mit wählbarer Breite und frischem Seitenabruf ergänzt; kein Link im normalen Website-Menü.

## Veröffentlichung und verbleibende Punkte

Testseite: https://irisborck.github.io/borck-webseite-neu/apartments/saphir/

- Erstveröffentlichung über freigegebenen PR #1 / Merge `f6adaab60add1c2f720d0a877b3f63f55c31da10`.
- Funktionaler Korrekturstand: `f7b235e62faf53832fe324dd2810b253052d41ca`.
- Prüfansicht aktualisiert: `641721c5b38a0e563a5fcca00a99729c5dbab189`.
- Der nachfolgende Berichtscommit ändert nur diesen Prüfbericht; sein Hash steht in der Git-Historie und in der Abschlussnachricht.

**Später umzustellen:** „Mehr zu Lage & Anfahrt“ führt für diesen Teststand ausdrücklich freigegeben auf `/borck-webseite-neu/#lage`. Sobald die eigenständige Seite „Lage & Anfahrt“ erstellt ist, muss dieser Link auf sie umgestellt werden.

**Unverändert:** Beide optionalen Kurzreisezuschläge zu jeweils 85 EUR, Smoobu-Einstellungen, Produktivwebsite, Marvin-Projekt und übrige Apartments. Startseite und Apartmentübersicht wurden nach dem Build erneut byteweise mit dem Ausgangscommit verglichen: identisch.

**Nicht durchgeführt:** echte iOS-Safari-/Geräteprüfung und Buchungsabsendung. Keine Testbuchung, Kalenderbelegung, Gästenachricht, Smoobu-Konfigurationsänderung, Stripe-Anbindung oder Produktivveröffentlichung ausgelöst. Keine weiteren Apartmentseiten erstellt.

## Inhaltsquellen

- https://www.nordsee-buesum-fewo.de/saphir (Inhalte und vorhandene Einbettung, 25.09.2026)
- https://www.buesum.de/urlaub-planen/buesumer-gaestekarte (Tarife und Erläuterungen 2026)
- https://www.buesum.de/fileadmin/Mediendatenbank/PDF/Dokumente/251114-Kurabgabesatzung-2026-webKA01.pdf (Lesefassung, insbesondere §§ 3–5)
- Aktueller Repository-Stand und `docs/SAPHIR-PRUEFSTAND.md` für bereits bestätigte Präzisierungen.
