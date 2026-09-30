# Reisegruppen Startseite → Apartments

Basis: `7211f632ca2cdd2dcd41d154312e5ebcc1d081ad`, Branch `work/apartments-direkt`.

## Umsetzung

Startseite und Apartments-Übersicht verwenden dieselbe Komponente für drei numerische Angaben: `adults16` (ab 16), `children3to15` (3–15) und `infants2` (0–2). Desktop: drei Felder nebeneinander; schmale Ansicht: untereinander. Die Zusammenfassung unterscheidet Reisende insgesamt und reguläre Schlafplätze.

`search-party.mjs` validiert ganze, nicht negative Anzahlen. `guests = adults16 + children3to15`; `totalPeople = guests + infants2`. Für reguläre Personen bleibt der vorhandene Suchbereich 1–5 bestehen. Es gibt keine zusätzliche Regel für Mindestzahl Erwachsener oder Kinderreisebetten und keine Belegungsgrenze anhand der Kleinkindzahl.

Startseite übergibt die drei Altersgruppen mit Anreise/Abreise per GET. Apartments stellt diese wieder her und startet die bestehende Abfrage. An die API gehen weiterhin ausschließlich `arrival`, `departure`, `guests`; Altersgruppen und Kleinkinder werden nicht an die API übermittelt. Preisberechnung und serverseitige Kapazitätsprüfung unverändert, kein VPS-Update erforderlich.

Alle Apartmentlinks enthalten die drei Altersgruppen und `guests` als reguläre Belegung. Veraltetes `children15` wird nicht mit der neuen Kindergruppe vermischt. Die bestehende Saphir-Seite interpretiert diese neue Dreiteilung noch nicht automatisch; ihr Umbau einschließlich Kleinkindern und korrekter Buchungs-/Kurabgabenübernahme bleibt separat. Keine Änderung an ihren Dateien oder am Kinderreisebett.

Alte URLs mit ausschließlich `guests` übernehmen die gültigen Reisedaten, verlangen aber eine ausdrückliche Ergänzung der Altersgruppen. Es wird keine Erwachsenen-/Kinderaufteilung erfunden. Die neue URL-Übergabe und Zurücknavigation mit vollständigen Altersgruppen starten die Suche automatisch.

## Kapazität und manuelle Filter

Die unveränderte Serverregel ist `reguläre Personen > Apartmentkapazität → capacity`. Ein größeres Apartment wird dadurch nie ausgeschlossen. Unpassende Apartments bleiben als Karten mit Status sichtbar.

- 1/2 reguläre Personen: alle sieben grundsätzlich möglich.
- 3/4: fünf möglich, Bernstein/Smaragd zu klein.
- 5: Topas möglich.
- Kleinkinder ändern diese Zuordnung nicht; 2 Erwachsene + 3 Kinder + 1 Kleinkind ergeben `guests=5`, insgesamt 6 Reisende.

Die manuellen Startseitenfilter „Bis 2/4/5 Personen“ bleiben unverändert. Sie filtern nach Apartmentgröße mit `Apartmentkapazität <= Filterzahl`, sind also keine Eignungsprüfung für eine eingegebene Reisegruppe. „Bis 2“ blendet beispielsweise größere Apartments aus. Die Suche aktiviert diese Filter nicht; auf der zentralen Apartments-Suche werden keine größeren Apartments deswegen verborgen. Ein Filter-Redesign ist bewusst offen.

## Dateien

- `src/components/SearchPartyFields.astro` (neu)
- `src/lib/search-party.mjs` (neu)
- `src/pages/index.astro`
- `src/pages/apartments.astro`
- `src/scripts/home.ts`
- `src/scripts/directory-search.ts`
- `scripts/check-search-party.mjs` (neu)
- `scripts/check-home-search.mjs`
- `package.json`
- dieser Bericht

## Prüfung und Veröffentlichung

`npm run test:apartments` und `PUBLIC_AVAILABILITY_URL=https://api.nordsee-buesum-fewo.de/availability ASTRO_TELEMETRY_DISABLED=1 npm run build` erfolgreich. Neue reine Funktionstests und DOM-Tests mit tatsächlichen Seitenskripten prüfen alle drei Altersgruppen, URL-Rundlauf, Wiederherstellung, Request nur mit regulärer Belegung, 1–5 Personen, zusätzliche Kleinkinder, Topas-Beispiel, alle sichtbaren Karten, Mindestaufenthalt, Fehler, Abbruch alter Antworten und Browsercache-Rückkehr. Bestehende Saphirprüfungen und alle 32 Kurabgabenfälle erfolgreich. Testantworten sind simuliert; keine Live-Buchung.

Die echte Desktop-/Smartphone-Sichtprüfung bleibt offen: Der Cloud-Browser blockiert die lokale Vorschau weiterhin mit `ERR_BLOCKED_BY_CLIENT`. Deshalb keine behauptete Abnahme von Darstellung oder horizontalen Überläufen.

Der unveränderte Pages-Workflow veröffentlicht Pushes auf `main`, nicht automatisch auf diesem Arbeitsbranch. Nach Push ist eine manuelle Veröffentlichung der Testseite erforderlich. Keine Workflow-/Repository-Einstellungen geändert, keine Testbuchung, kein Merge von PR #3, keine Änderung an Produktivwebsite, Smoobu, VPS, DNS/IONOS oder Marvins Projekt.
