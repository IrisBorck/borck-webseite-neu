# Apartments → Saphir: durchgängige Reisegruppe und automatische Prüfung

Stand: 01.10.2026. Projekt `IrisBorck/borck-webseite-neu`, Branch `work/apartments-direkt`.

## Umsetzung

- Die bestehende gemeinsame Suchvalidierung führt `arrival`, `departure`, `adults16`, `children3to15`, `infants2`. `guests` bleibt die reguläre Belegung (Erwachsene + Kinder 3–15), `totalPeople` enthält zusätzlich alle Kleinkinder. Startseite und deren Filter bleiben unverändert.
- Saphir verwendet jetzt dieselbe Validierung, begrenzt ausschließlich die reguläre Belegung auf vier und behält alle Reisenden. Alte reine Gesamtangaben oder die frühere Zweiteilung werden nicht künstlich auf drei Altersgruppen verteilt.
- Bei vollständiger Übergabe sind die Saphir-Felder vorausgefüllt und unter „Reisedaten ändern“ erreichbar. Der manuelle Prüfschritt entfällt. Ein Hintergrundaufruf prüft die bestehende Verfügbarkeits-API; das initiale `pageshow` löst keinen zweiten Aufruf aus.
- Nur eine bestätigte verfügbare Antwort macht den bestehenden Bereich Extras → Kurabgabe → Preisübersicht → Buchung sichtbar. Mindestaufenthalt, Einschränkungen, Unverfügbarkeit und Fehler öffnen keine Buchungsstrecke. Ein Rücklink zur Übersicht übernimmt die gültige Reisegruppe.
- Direkter Saphir-Einstieg ohne vollständige Angaben behält den manuellen Erstcheck. Nach erfolgreicher Prüfung werden bewusste Änderungen automatisch erneut geprüft. Der Sticky zeigt die Reisegruppe, die bestehende voraussichtliche Kostensumme und „Zur Buchung“.
- Der Suchbutton der Apartments-Übersicht entfällt. Vollständige URL-Daten starten sofort eine Abfrage; vollständige Formulareingaben und Änderungen starten sie nach 300 ms. Identische `input`-/`change`-Ereignisse werden zusammengefasst. Ungültige Angaben und „Auswahl löschen“ brechen laufende bzw. vorgemerkte Anfragen ab. Ein Generationszähler verhindert, dass verspätete Antworten neuere Angaben überschreiben. Ergebnisse übernehmen weder Fokus noch Scrollposition.
- Alle sieben Karten bleiben sichtbar; zu kleine und datumsmäßig nicht verfügbare Apartments behalten ihre bestehende Kennzeichnung.
- Kurabgabe: `children15` wird intern ausdrücklich aus Kindern 3–15 plus Kleinkindern abgeleitet. Beide Gruppen bleiben beitragsfrei; die Zuordnung des Ergebnisses berücksichtigt die tatsächliche Gesamtzahl. Tarife, Saisonwechsel, An-/Abreisetag, Ermäßigungen, Befreiungen und Sonderkategorien bleiben unverändert.

## Geänderte Dateien

- `src/components/apartment/SaphirBookingBar.astro`
- `src/lib/saphir-travel.mjs`
- `src/pages/apartments.astro`
- `src/scripts/directory-search.ts`
- `src/scripts/saphir-booking.ts`
- `src/scripts/visitor-tax.ts`
- `scripts/check-home-search.mjs`
- `scripts/check-saphir-interactions.mjs`
- `scripts/check-saphir-travel.mjs`
- `scripts/check-saphir.mjs`
- `scripts/check-search-party.mjs`
- dieser Bericht

## Erfolgreiche Prüfungen

- `npm run test:apartments`
- `PUBLIC_AVAILABILITY_URL=https://api.nordsee-buesum-fewo.de/availability ASTRO_TELEMETRY_DISABLED=1 npm run build`
- Reale gebaute HTML-Seiten und Seitenskripte in DOM-Tests, ausschließlich mit kontrollierten API-Antworten: Übergabe, Wiederherstellung, automatischer Erstaufruf, Entprellung, Abbruch, verspätete Antworten, ungültige Daten, Löschen, Fokus und Zurücknavigation.
- Familie 2 Erwachsene + 2 Kinder + 1 Kleinkind: API `guests=4`, fünf Reisende in der Saphir-Reisegruppe und Kurabgabe; keine zusätzliche manuelle Prüfung bei Übergabe.
- Reguläre Belegung 1/2/3/4/5: weiterhin 7/7/5/5/1 grundsätzlich passende Apartments. Kleinkinder ändern diese Kapazitätsentscheidung nicht.
- Verfügbarkeit, Mindestaufenthalt ohne Verfügbarkeitszusage, Fehlerfälle, Zuschlag, Extras, Summe und Sticky, bestehende Formular-URL und Änderungswarnung.
- Alle 32 Kurabgabenfälle, Menü/Dialogfokus, alle 14 Galeriebilder, Lightbox und Kalenderhöhenlogik.
- Keine Testbuchung und keine Live-Smoobu-Schreiboperation.

## Prüfgrenzen und Veröffentlichung

Die lokale Browser-Vorschau wurde versucht; der bereitgestellte Browser blockiert `http://127.0.0.1:4321/apartments/saphir/` mit `net::ERR_BLOCKED_BY_CLIENT`. Deshalb sind die visuelle Desktop-/Smartphone-Abnahme und die Prüfung auf horizontale Überläufe noch offen. DOM-Tests ersetzen diese Sichtprüfung nicht.

Der vorhandene Pages-Workflow reagiert nur auf Pushes nach `main` oder manuelle Auslösung. Ein Push dieses Arbeitsbranches veröffentlicht die Testseite nicht automatisch. Die manuelle Veröffentlichung bleibt erforderlich; Workflow- und Repository-Einstellungen werden nicht geändert.

## Bewusst unverändert / später

- Bestehender Smoobu-Buchungsabschluss und seine bisherige Parameterzuordnung. Die neue Dreiteilung wird vollständig innerhalb der Website geführt; eine neue anbieterspezifische Alters-/Kleinkind-Zuordnung im externen Abschluss wird hier nicht eingeführt.
- Bestehende Extras einschließlich Kinderreisebett und deren Mengenfelder; keine Sonderlogik für mehrere Kinderreisebetten oder besondere Familienkonstellationen.
- Sechs externe Apartmentseiten, Startseitenfilter, vollständige eigene Buchungs-/Gastdaten-/Zahlungsstrecke und Stripe.
- Keine Änderungen an Produktivwebsite, Smoobu, VPS, DNS/IONOS oder Marvins Projekt; PR #3 wird nicht gemergt.
