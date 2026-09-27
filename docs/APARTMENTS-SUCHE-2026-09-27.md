# Apartments-Übersicht – Umsetzungsstand 27.09.2026

## Status

Veröffentlicht auf der ausdrücklich freigegebenen GitHub-Testwebsite und anschließend im echten Chromium-Browser geprüft. Ausgangsstand: 3980b53. Nach anfänglicher Ablehnung der automatischen Freigabeprüfung hat Iris die Veröffentlichung und anschließende Browserprüfung am 27.09.2026 ausdrücklich bestätigt. PR #2 wurde mit Merge d36d2b78aa666d1b60b9d6c499d8b8277cfea856 übernommen. Keine Buchung abgesendet. Die nachstehend dokumentierten fachlichen Grenzen bleiben bestehen; dies ist keine vollständige Umsetzung eigener Live-Preiskarten.

## Umsetzung

- Ausschließlich Apartmentübersicht, eigene Such-/Übergabelogik, zugehörige Datenschutzausgabe und separate, nicht verlinkte noindex-Prüfansicht.
- Sieben horizontale Karten in bestehender Reihenfolge; gestaffeltes Layout für Desktop/Tablet/Smartphone. Echtes HTML mit Namen, Größen, Personenzahl, Schlafzimmern, individuellem Außenbereich und Links. Smaragd: offene Stahltreppe. Topas: ca. 76 m², seitlicher Deich-/Meerblick.
- Eigenes Suchformular mit Anreise, Abreise und 1–5 Personen. Ungültige, vergangene oder umgekehrte Daten werden nicht an den Anbieter übergeben. Änderungen entfernen alte Ergebnisse; kein veralteter Preis bleibt stehen.
- Die Suchaktion lädt das offizielle Smoobu-Gesamtformular, inklusive vorbelegtem Zeitraum und Personenzahl. Keine Buchung durch diese Aktion.
- Anbieterfenster verwendet vorhandenes iframe-resizer 3.5.16, Herkunftsprüfung, dynamische Höhe und scrollbar bleibenden Fallback. Ein Link öffnet dieselbe Abfrage separat. Erst auf bewusste Suchaktion wird das Anbieterfenster geladen.
- Kein Preis, keine Verfügbarkeit und keine Buchungsdaten werden aus dem iframe ausgelesen. Keine API-Zugangsdaten, kein Scraping, keine erfundenen Preise.
- Kapazitätshinweis bei zu hoher Personenzahl ist ausdrücklich keine Aussage zur zeitlichen Verfügbarkeit.
- Startseitenquellen, globale Gestaltung, Saphir-Seite und bestehende Buchungslogik bleiben unverändert. Gebaute Startseite bytegleich. Gebautes Saphir-HTML bis auf den von Vite geänderten JavaScript-Bündelhash identisch (iframe-resizer wird jetzt von zwei Einträgen genutzt).

## Technische Grenzen und konkrete Abweichungen vom Ziel

1. **Keine Live-Preise/Verfügbarkeitsmarkierungen direkt in eigenen Karten.** Das vorhandene Projekt ist statisches Astro/GitHub Pages und hat keinen API-Serverzugang. Die offizielle Smoobu Availability API unterstützt Aufenthaltspreise und Einschränkungen, verlangt aber Authentifizierung und laut Dokumentation einen serverseitigen Proxy. Ein iframe ist keine dokumentierte Datenschnittstelle für eigene Ergebnis-Karten. Deshalb stehen echte Ergebnisse ausschließlich im offiziellen Anbieterfenster; die eigenen Karten bleiben der semantische Apartmentvergleich. Keine Sortierung nach vermeintlicher Verfügbarkeit.
2. **Kein behaupteter vollständiger Endpreis.** Die Anbieterpreise werden unverändert angezeigt. Kurabgabe ist separat; optionale Leistungen und der Pflicht-Kurzreisezuschlag müssen berücksichtigt werden. Die bekannte doppelte optionale Kurzreisezuschlags-Konfiguration wurde nicht in Smoobu verändert. Deshalb benennt die Seite die Preisbestandteile und erklärt einen ungeprüften Anbieterbetrag nicht zum vollständigen Gesamtpreis.
3. **Nur Saphir besitzt eine neue Detailseite.** Die sechs übrigen Buttons führen ausdrücklich gekennzeichnet zur jeweiligen vorhandenen Produktiv-Detailseite. Es werden keine neuen Detailseiten gebaut, keine 404-Links angelegt und keine Produktivdateien verändert. Die Zielseiten sind lesend überprüft worden.
4. **Reisedaten im Link sind noch keine Vorbelegung der Detailseiten-Buchungsmaske.** Die Daten stehen dort für die spätere Sticky-/Buchungslösung bereit. Weder die externe Produktivwebsite noch Saphirs Buchungsskript werden in diesem Auftrag verändert.
5. **Änderungen im Anbieterfenster werden nicht zurückgelesen.** Ein sichtbarer Hinweis bittet, solche Änderungen auch im eigenen Formular einzutragen, damit die Detailseitenlinks übereinstimmen.
6. **Anbietergestaltung und Sprache:** Die eigene Seite ist deutsch; das Anbieterformular folgte im Prüf-Browser der englischen Browsersprache. Laut Smoobu-Hilfe ist diese Sprache browserabhängig. Keine erfundenen Sprachparameter oder Änderungen an Smoobu-Einstellungen.

## Übergabeformat

Eigene Links: `?arrival=2026-11-10&departure=2026-11-15&guests=2`.

`src/lib/travel-search.mjs` enthält die wiederverwendbaren Funktionen `readTravel`, `travelURL`, `smoobuSearchURL` und Datumsvalidierung. ISO-Kalendertage, 1–5 ganzzahlige Gäste, Abreise strikt nach Anreise, frühestens heutiges Datum in Europe/Berlin. Bestehende sonstige Queryparameter und Fragmente bleiben erhalten. Keine Cookies, kein localStorage, kein sessionStorage; Reisedaten können im normalen Browserverlauf stehen.

Smoobu: `arrivalDate=10/11/2026`, `departureDate=15/11/2026`, `adults=2`, `children=0`, `loadForCurrentDate=true` an `https://booking.smoobu.com/9A40536`. Diese Parameter und das Format stammen aus den live von Smoobu selbst erzeugten Ergebnislinks. Die entsprechende Gesamtsuche wurde direkt im echten Browser geöffnet und lieferte dieselben Daten und Ergebnisse. Sie sind damit praktisch verifiziert; ein gesonderter öffentlicher API-Vertrag für diese URL-Parameter wurde nicht gefunden. Für eine eigene Ergebnisschnittstelle ist die offizielle API der geeignete Weg.

## Bereits geprüft

- Repository und vorhandene Integration vollständig im betroffenen Umfang gelesen.
- Referenz-Screenshot geöffnet.
- `npm run build` einschließlich bestehender Startseiten-/Saphirprüfungen und 32 Kurabgabenfälle erfolgreich.
- `node scripts/check-travel-search.mjs`: unmögliche Daten, Vergangenheit, gleiche/umgekehrte Daten, Schaltjahre, Jahreswechsel, ungültige Personenzahlen, URL-Roundtrip, Beibehaltung anderer Parameter/Hash, Entfernen veralteter Daten, Anbieterformat erfolgreich.
- `git diff --check` erfolgreich.
- Offizielle Smoobu-Gesamtsuche im echten Browser, 10.–15.11.2026, 2 Personen: sieben Angebote. Angezeigte Aufenthaltspreise zum Prüfzeitpunkt: Saphir 550 EUR, Türkis 520 EUR, Topas 450 EUR, Opal 405 EUR, Smaragd 265 EUR, Bernstein 345 EUR, Rubin 460 EUR. Diese Werte sind Prüfbeobachtungen, niemals fest in die Website eingetragen, und keine Zusage eines vollständigen Endpreises.
- Gleiches Ergebnis nach direkter URL-Übergabe mit den Anbieterparametern.
- Keine Kontakte, Zahlungsangaben oder Zustimmung eingetragen; keine Buchung abgeschickt.

## Browserprüfung der veröffentlichten Seite

Testadresse: https://irisborck.github.io/borck-webseite-neu/apartments/

| Prüfung | Beobachtung |
| --- | --- |
| Desktop | Übersicht mit horizontalen Karten und kompakter Suche; Client-/Scrollbreite identisch, kein horizontaler Überlauf. |
| Responsive | Prüffenster 320, 375, 390, 430, 768, 820, 1024, 1200 px. Durch klassische Scrollleiste jeweils 15 px weniger Inhaltsbreite; Client-/Scrollbreiten 305/305, 360/360, 375/375, 415/415, 753/753, 805/805, 1009/1009, 1185/1185. Sieben Karten in allen Breiten, keine nach rechts hinausragenden Formularelemente oder Karten. |
| Suchformular | Native Datumseingaben und Personenauswahl bedienbar. Leere Anreise verhindert Suche und erhält Fokus. Gleiche An-/Abreise verhindert Suche, deutsche Fehlermeldung und Fokus auf Abreise. Unmögliche/vergangene Daten zusätzlich im automatisierten Validierungstest geprüft. |
| Live-Suche, 2 Personen | 10.–15.11.2026: alle sieben Angebote mit den oben dokumentierten, unterschiedlichen Aufenthaltspreisen. Suchdaten und Personen korrekt im Anbieterformular. Dynamische iframe-Höhe 2078 px im Desktopfall. |
| Live-Suche, 5 Personen | 10.–15.11.2026: Topas, 675 EUR für fünf Nächte. Die übrigen eigenen Karten zeigen einen Kapazitätshinweis und sind optisch zurückgenommen; keine falsche Aussage zur zeitlichen Verfügbarkeit. |
| Keine Verfügbarkeit | 29.12.2026–03.01.2027, drei Personen: Anbieter meldet „No available accommodation found.“ Sichtbar im eingebetteten Formular geprüft. Rahmen schrumpft wieder. Der separate Suchlink öffnet dieselben Reisedaten. |
| Weiterer Zeitraum | 10.–20.10.2026, zwei Personen: neue Anbieterpreise sichtbar, beispielsweise Topas 900 EUR, Opal 890 EUR, Bernstein 640 EUR. Keine Übernahme der alten Novemberpreise. |
| Mobile Live-Ergebnisse | 320-px-Prüffenster: äußere Seite 305/305 px, Anbieterinhalt 318/318 px ohne inneren horizontalen Überlauf; Darstellung durch vorhandene Skalierung auf 95 % eingepasst. Topas-Titel/Preis und Handlungsbutton erreichbar. Ergebnisrahmen ca. 726 px, Inhalt 748 px vor Skalierung; dynamische Anpassung bei weiteren Breitenwechseln. |
| Änderungen/Reset | Wechsel der Personenzahl entfernt alte Ergebnisse sofort. „Auswahl löschen“ leert beide Daten, entfernt Reiseparameter aus Links und setzt Fokus auf Anreise. |
| Detailseiten | Alle sieben tatsächlichen Zielseiten im Browser geöffnet. Richtige Apartments und alle drei Reiseparameter in den endgültigen URLs erhalten. Sechs Links führen weiterhin gekennzeichnet auf die bestehende Website. |
| Browser-Zurück/Neuladen | Saphir über „Ansehen & buchen“ geöffnet; Browser-Zurück erhält Anreise, Abreise, Personen. Neuladen übernimmt Daten aus der URL. Keine automatische Buchung oder automatische neue Preisabfrage beim Wiederherstellen. |
| Fokus/Menü/Dialog | Suchaktion fokussiert Ergebnisbereich. Mobiles Menü setzt aria-expanded=true, Escape schließt. Datenschutzdialog zeigt die passenden Such-/URL-Hinweise und lässt sich schließen. |
| Gestaltung | Eigene Karten sowie lange Anbieterbezeichnung von Topas geprüft. Keine festen Beispielpreise oder versteckten HTML-Ergebnisse in eigenen Karten. Screenshots: apartments-desktop-2026-09-27.jpg und apartments-mobil-2026-09-27.jpg. |

### Verbleibende Prüfgrenzen

- Chromium mit realen iframe-Inhaltsbreiten ist kein physisches iPhone und keine iOS-Safari-Simulation. Native iOS-Datumsauswahl, virtuelle Tastatur und Safari bleiben ungeprüft.
- Keine künstliche Anbieter-Netzwerkstörung ausgelöst. Der vorhandene separate Suchlink wurde mit identischen Daten geöffnet; der zeitgesteuerte Ausfallhinweis ist sichtbar.
- Kein künstlicher vierstelliger Anbieterpreis oder erfundener Apartmentname eingebaut. Verschiedene reale Preise und längere echte Anbieternamen wurden dargestellt.
- Die Anbieteroberfläche und das native Datumsformat folgen der Browsersprache und erschienen im Prüf-Browser englisch. Eigene Beschriftungen sind deutsch.
- Keine Buchung, Zahlung, Zustimmung, Smoobu-Konfigurationsänderung, Produktivänderung oder Änderung am Marvin-Projekt.

## Quellen

- https://docs.smoobu.com/ – CORS Policy, Smoobu Availability, Authentication (27.09.2026).
- https://support.smoobu.com/hc/en-us/articles/360015377680-Advanced-ways-to-embed-your-Booking-Engine – Gruppen und externe Detailseitenlinks (27.09.2026).
- https://support.smoobu.com/hc/en-us/articles/38213700681746-What-language-do-guests-see-on-the-booking-form (27.09.2026).
- https://booking.smoobu.com/9A40536 – eigene Live-Prüfung ohne Buchung.
- Bestehende Produktiv-Detailseiten `/rubin`, `/opal`, `/tuerkis`, `/topas`, `/bernstein`, `/smaragd` nur lesend geprüft; Türkis-Balkon sowohl im aktuellen Repository als auch auf der aktuellen Produktivseite ausgewiesen.
