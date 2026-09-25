# Saphir – Umsetzung und offener Abnahmestand, 25.09.2026

## Status

Die beauftragten Änderungen sind implementiert. Build, 32 Berechnungstests und statische Saphir-Prüfungen bestehen. **Noch nicht zur Veröffentlichung freigegeben:** Die abschließende Browserprüfung des geänderten Stands fehlt. Daher wird dieser Stand separat gesichert und nicht auf main veröffentlicht.

Ausgangscommit: `af406cf80bee9a7df9fd02e16a8775deff62baa7`.
Arbeitsbereich ausschließlich `IrisBorck/borck-webseite-neu`.

## Änderungen nach Auftrag

1. Lightbox: sichtbare Bildbeschreibung entfernt. ALT-Texte und Live-Status bleiben; sichtbarer Zähler „1 / 14“. Native Dialogbedienung, Escape, Pfeiltasten und Rückgabe des Fokus an den tatsächlichen Auslöser.
2. Kalender: vorhandenes öffentliches Smoobu-Widget 133655 bleibt im isolierten iframe. `ResizeObserver` misst die tatsächliche Body-Höhe, `MutationObserver` erfasst nachgeladene Monate. Höhenmeldung via `postMessage`, akzeptiert nur vom konkreten Kalenderfenster und mit plausibler Höhe. Inhaltshöhe statt Viewporthöhe vermeidet ein Wachstum ohne Schrumpfen. Anpassung der Kalenderzellgrößen bei Breitenwechsel; vorhandene Navigation wird beschriftet und per Tastatur bedienbar. Keine künstliche feste Endhöhe und kein Ausblenden abgeschnittener Inhalte. Die reale Scrollfreiheit ist noch visuell zu prüfen.
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

Das Originalformular erschien in diesem Prüf-Browser auf Englisch. Die originale URL wurde unverändert übernommen; keine ungeprüften Sprachparameter ergänzt.

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

### Noch offene Browserabnahme

Der bereitgestellte Cloud-Browser kann den lokalen Vorschau-Server nicht öffnen (`ERR_BLOCKED_BY_CLIENT`). Das Öffnen der lokalen Build-Datei wurde von der Browser-Sicherheitsregel ebenfalls abgewiesen. Dieser Zugriff wurde nicht umgangen. Es wurden daher **keine erfolgreichen Desktop-/iPhone-Tests des geänderten Stands behauptet**.

Noch zu prüfen: Layout bei Desktop/320–430 px/iPhone, Galerie und Fokuswechsel, Kalenderhöhe beim Laden und Monats-/Breitenwechsel, Aufklapper, Rechnerinteraktion und Screenreader-Status, Smoobu-Autoheight, Datums-/Personenauswahl, optionale Leistungen, Zahlungs-/Zustimmungsfelder und Erreichbarkeit des Abschlusses ohne Absenden.

## Veröffentlichung

Kein Push auf main und keine Veröffentlichung dieses Stands, da die ausdrücklich verlangte Browserabnahme vor Veröffentlichung offen ist. Die bestehende URL bleibt bis zur Freigabe unverändert:
https://irisborck.github.io/borck-webseite-neu/apartments/saphir/

Keine Testbuchung, Kalenderbelegung, Gästenachricht, Smoobu-Konfigurationsänderung, Stripe-Anbindung, Änderung der Produktivseite oder an Marvins Projekt. Keine weiteren Apartmentseiten erstellt.

## Inhaltsquellen

- https://www.nordsee-buesum-fewo.de/saphir (Inhalte und vorhandene Einbettung, 25.09.2026)
- https://www.buesum.de/urlaub-planen/buesumer-gaestekarte (Tarife und Erläuterungen 2026)
- https://www.buesum.de/fileadmin/Mediendatenbank/PDF/Dokumente/251114-Kurabgabesatzung-2026-webKA01.pdf (Lesefassung, insbesondere §§ 3–5)
- Aktueller Repository-Stand und `docs/SAPHIR-PRUEFSTAND.md` für bereits bestätigte Präzisierungen.
