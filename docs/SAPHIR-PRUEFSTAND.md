# Saphir und Apartmentübersicht – 24.09.2026

Basis: main f149d8e0a5e9f1ceeeb743ab91e1bb81ed7c5894. Ausschließlich IrisBorck/borck-webseite-neu.

## Inhalt und Bildquellen
- Vorlage: https://www.nordsee-buesum-fewo.de/saphir (am 24.09.2026 gelesen).
- Alle 14 Saphir-Fotodateien der Seite einschließlich der beiden CSS-Hintergrundfotos übernommen; 2 Lagegrafiken. Originaldateinamen der verfügbaren Website-Dateien bleiben erhalten; zusätzlich kleine WebP-Vorschaubilder.
- src/data/saphir-images.json dokumentiert genaue Quell-URLs, Dateinamen, Maße, ALT-Texte. Drei PNG-Vorschaulinks führten in eine Weiterleitungsschleife; die im Original-HTML hinterlegten Originaldateien waren verfügbar und wurden verwendet.
- ALT-Texte mit den Bildern visuell abgeglichen. Backofen-Detail und Flurblick präzisiert. Bei den beiden Hintergrundfotos fehlten eigene ALT-Texte; anhand des tatsächlichen Bildinhalts beschrieben (sourceAlt leer dokumentiert).
- Ausstattung gemäß Original und ausdrücklichen Präzisierungen von Iris: Induktion, Backofen/Mikrowelle, Doppelbett 180 cm (2 × 90), Etagenbett, fensterloses Duschbad, SAT-TV, DAB+, Waschgeräte im separaten Raum der Garage.
- Zweiter Hund 23 € gemäß FAQ der bestehenden Startseite; übrige optionalen Leistungen gemäß Saphir-Original.
- Alle 15 Entfernungsangaben und beide Lagegrafiken übernommen. PKW-Zeit ab Hamburg auf die freigegebene Angabe ca. 1,5 Stunden je nach Verkehr vereinheitlicht (Originalseite nennt noch knapp eine Stunde).

## Kalender und Buchung
- Original: CalendarWidget.js / Apartment/SingleCalendar.js, Apartment 133655. Kalender lädt per POST ausschließlich Monat/Jahr und öffentlichen Widget-Verifikationswert; keine Reservierungserstellung. Separates BookingToolIframe ist NICHT übernommen.
- Kalender isoliert in lokalem iframe mit sandbox="allow-scripts". Keine Formulare, Pop-ups oder Navigation der übergeordneten Seite erlaubt; keine same-origin-Freigabe. CSP erlaubt Netzwerkzugriff nur auf den konkreten Kalender-Lese-Endpunkt. Der sichtbare Widget-Verifikationswert ist Teil des öffentlichen Original-Widgets, kein angeforderter API-Schlüssel.
- Original-Kalendergestaltung bleibt erhalten, keine eigene Legende oder erfundenen Belegungen. Monatsnavigation erhält zugängliche Namen.
- Falls Smoobu nicht lädt, wird ausdrücklich die fehlende Verfügbarkeit der Einbindung angezeigt. Keine Interpretation einer leeren Anzeige als freie Termine.
- Buchungsbereich bleibt ausdrücklich nicht angebunden. Keine Gesamtpreisberechnung, keine Reservierung, keine Zahlung; nur Kontaktlinks für eine unverbindliche Anfrage.
- Kalenderdienst in den Datenschutzhinweisen der neuen Unterseiten benannt.

## Umfang und Prüfungen
- Startseitendatei, bisheriges Layout, globale Styles, Startseitenskript und Apartmentdaten unverändert.
- Vergleich der gebauten Startseite: identischer HTML-Inhalt und identische Styles/Skripte; lediglich automatisch benannter gemeinsamer CSS-Dateipräfix von Layout zu global geändert, Inhaltshash identisch.
- Übersicht: gleiche Kartenklassen und Inhalte wie Startseite. Namen führen zu Kartenankern, Saphir-Button zur Detailseite; andere Buttons zu sechs bestehenden Kurzansichten.
- Build erfolgreich; eindeutige IDs, lokale Anker, Dialogziele, noindex und fehlende Buchungsformulare geprüft.
- Andere sechs vollständige Detailseiten erst nach ausdrücklicher Freigabe.
