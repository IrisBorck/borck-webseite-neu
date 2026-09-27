# Apartments-Übersicht – Umsetzungsstand 27.09.2026

## Status

Implementiert und lokal gebaut, noch nicht veröffentlicht und noch nicht vollständig im Browser abgenommen. Ausgangsstand: 3980b53. Die automatische Freigabeprüfung hat den Push auf main abgelehnt: Für die Veröffentlichung dieses neuen Stands fehlt ihr die ausdrückliche Nutzerfreigabe. Keine Umgehung; vor Veröffentlichung Freigabe einholen.

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

## Nach Freigabe noch zu prüfen

Die neue Seite selbst war noch nicht im Prüf-Browser erreichbar: lokale URLs werden dort blockiert. Nicht als bestanden ausgeben:

- veröffentlichte neue Übersicht Desktop, 320/375/390/430 und 768/820/1024 px;
- eigenes Formular, Fokus, native Datumseingabe, Reset, Browser-Zurück, Suche mit neuen Daten;
- eingebettete Smoobu-Abfrage, Höhenänderungen, Lade-/Ausfallfallback und Anbieterergebnisse;
- vollständig nicht verfügbarer Zeitraum und unterschiedliche Personenzahlen;
- alle sieben Detailseitenziele einschließlich unveränderter Reiseparameter;
- keine horizontalen Überläufe und Darstellung langer Texte;
- Menü und Dialoge.

`public/qa/apartments.html` stellt verschiedene reale iframe-Inhaltsbreiten bereit. Das ersetzt keinen Test auf einem physischen iPhone oder in iOS Safari. Keine native iPhone-/Safari-Abnahme erfolgt.

## Quellen

- https://docs.smoobu.com/ – CORS Policy, Smoobu Availability, Authentication (27.09.2026).
- https://support.smoobu.com/hc/en-us/articles/360015377680-Advanced-ways-to-embed-your-Booking-Engine – Gruppen und externe Detailseitenlinks (27.09.2026).
- https://support.smoobu.com/hc/en-us/articles/38213700681746-What-language-do-guests-see-on-the-booking-form (27.09.2026).
- https://booking.smoobu.com/9A40536 – eigene Live-Prüfung ohne Buchung.
- Bestehende Produktiv-Detailseiten `/rubin`, `/opal`, `/tuerkis`, `/topas`, `/bernstein`, `/smaragd` nur lesend geprüft; Türkis-Balkon sowohl im aktuellen Repository als auch auf der aktuellen Produktivseite ausgewiesen.
