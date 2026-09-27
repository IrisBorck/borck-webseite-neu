# Direkte Apartmentsuche – Entwurf, nicht zur Veröffentlichung freigegeben

Stand: 27. September 2026. Die veröffentlichte Übersicht bleibt unverändert.

## Vorbereitet

Die bestehende horizontale Gestaltung und die sieben Apartments bleiben erhalten. Einleitung, Opal/Topas-Ausblick und der persönliche Telefonlink sind korrigiert. Die zusätzliche Smoobu-Ergebnisfläche entfällt in diesem Entwurf. Ergebnisse werden den bestehenden Karten anhand fester Apartment-IDs zugeordnet.

Die Preisberechnung verwendet ganze Centbeträge: 1–4 Nächte einmalig 8.500 Cent zusätzlich, ab fünf Nächten kein Zuschlag. Kurabgabe und freiwillige Leistungen werden nicht berechnet. Ist der Zuschlag nachweislich bereits im Lieferpreis enthalten, wird er vor der eigenen Berechnung herausgerechnet. Ohne bestätigte Preisbasis wird kein Preis angezeigt.

Anreise, Abreise und Personenzahl werden als `arrival=YYYY-MM-DD`, `departure=YYYY-MM-DD` und `guests=N` in der URL geführt und an jeden Detailseitenlink angehängt. Keine dauerhafte Speicherung. Nur Saphir hat bereits eine lokale Detailseite; die übrigen sechs Links führen weiterhin zur bestehenden Website. Deren Übernahme in ein Buchungsformular ist damit noch nicht implementiert.

## Noch fehlende Voraussetzung für echte Ergebnisse

Das Projekt ist eine statische Astro-Website auf GitHub Pages. Es gibt keinen bereitgestellten Server für authentifizierte Smoobu-Abfragen. Die offizielle API ist nicht für direkte Browserabfragen freigegeben; API-Schlüssel gehören nicht in Website-Dateien. Quelle: https://docs.smoobu.com/ (CORS, Authentication und Check apartment availability).

`server/availability.mjs` ist ein vorbereiteter, noch nicht bereitgestellter Request/Response-Handler für einen Node-kompatiblen Server. Er fragt ausschließlich `POST https://login.smoobu.com/booking/checkApartmentAvailability` ab. Er kann keine Buchungen erstellen oder ändern. Kein Scraping und kein Zugriff auf iframe-Inhalte.

Vor einer Veröffentlichung sind erforderlich:

1. Separat autorisierter Serverbetrieb mit HTTPS, Laufzeitadapter für den Handler, Anfragebegrenzung und ohne Protokollierung von Geheimnissen. GitHub Pages allein kann diesen Handler nicht ausführen. Bestehendes Hosting und Smoobu-Einstellungen wurden nicht geändert.
2. Serverseitige Geheimnisse `SMOOBU_API_KEY`, `SMOOBU_API_SECRET` sowie `SMOOBU_CUSTOMER_ID`. Zugangsdaten ausschließlich im Secret-Speicher des gewählten Servers hinterlegen, niemals im Repository, Browser oder Chat.
3. Echte Antworten für alle sieben Apartment-IDs mit den jeweiligen Smoobu-Angeboten vergleichen. Die dokumentierte Antwort enthält Preis und Währung, aber keinen ausreichend eindeutigen Preisbestandteilnachweis. Pro Apartment müssen Preiseinheit, enthaltene Pflichtkosten und Kurzreisezuschlag bestätigt werden.
4. Erst dann `SMOOBU_VERIFIED_PRICE_BASIS` als JSON konfigurieren: je Apartment-ID die verifizierten Felder `unit` (`major` oder `minor`), `shortStay` (`included` oder `excluded`) und `accommodationOnly: true`. Letzteres bestätigt einen vollständigen Unterkunftspreis ohne Kurabgabe und optionale Leistungen. Ist diese Grundlage nicht nachweisbar, muss die Integration angepasst werden; das Flag darf nicht bloß zur Freischaltung gesetzt werden.
5. Den HTTPS-Endpunkt `/availability` über `PUBLIC_AVAILABILITY_URL` beim Astro-Build setzen. Die CORS-Freigabe ist auf `https://irisborck.github.io` beschränkt. Keine Zugangsdaten als `PUBLIC_`-Variablen verwenden.

Mindestmietdauer wird nur dann als „Verfügbar – Mindestmietdauer nicht erreicht“ bezeichnet, wenn die Antwort sowohl die Apartment-ID in `availableApartments` als auch Fehler 401 mit passender Mindestdauer enthält. Andere Einschränkungen werden nicht als Belegung ausgegeben. Abfragefehler sind ausdrücklich keine Nichtverfügbarkeit.

## Prüfung und verbleibende Abnahme

`npm run build`, `node scripts/check-apartment-quotes.mjs`, `node scripts/check-travel-search.mjs` und `git diff --check` erfolgreich. Die Preisprüfungen verwenden ausschließlich isolierte synthetische Testdaten: 1–6 Nächte, Jahreswechsel/Zeitumstellung, Zuschlag genau einmal, unbestätigte Preise, Mindestmietdauer, Personenlimit, Antwortprüfung und ausschließlich lesender Handler. Diese Daten gelangen nicht in die Website.

Keine echte API-Abfrage und keine Buchung durchgeführt. Die neue Fassung ist noch nicht im echten Browser abgenommen; die frühere Browserprüfung gilt nur für die veröffentlichte iframe-Fassung. Nach Bereitstellung des Servers müssen reale freie/belegte Zeiträume, Mindestmietdauer, apartmentgenaue Preise einschließlich Zuschlag sowie Desktop, Tablet und 320–430 px geprüft werden. Auch lange Namen/Preise, Datumseingaben, Fehlerfälle, schnelle Suchänderungen und alle sieben Detailseitenlinks gehören zur offenen Abnahme.

Der Entwurf darf bis dahin nicht nach `main` übernommen werden: Ohne konfigurierten Endpunkt zeigt die Suche korrekt einen Abruffehler statt erfundener Ergebnisse.
