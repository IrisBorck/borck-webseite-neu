# Direkte Apartmentsuche – technischer Stand vom 27. September 2026

Die Ergänzung liegt in Entwurf PR #3. Noch keine Live-Abnahme und keine Veröffentlichung. Der neue Auftrag erlaubt die Veröffentlichung ausschließlich nach erfolgreicher Browserprüfung mit echten Daten. Diese Voraussetzung ist noch nicht erfüllt.

## Implementierter Ablauf

Die sieben vorhandenen Karten erhalten Preise/Status direkt nach einer Suche. Keine zweite Smoobu-Ergebnisansicht und keine zweite Suchmaske. Gestaltung, Fotos, Einleitung, Opal/Topas-Ausblicke und der anklickbare persönliche Telefonhinweis bleiben erhalten.

`server/availability.mjs` fragt ausschließlich den offiziellen lesenden Smoobu-Endpunkt `POST https://login.smoobu.com/booking/checkApartmentAvailability` ab. Anfrage: Anreise, Abreise, Gästezahl, Kunden-ID und die sieben fest zugeordneten Apartment-IDs. Authentifizierung: HMAC mit Schlüssel, Secret, Zeitstempel und Nonce. Geheimnisse verbleiben im Server. Keine Buchungs-API, keine Reservierung, kein Scraping.

`server/http.mjs` und `server/start.mjs` ergänzen einen ausführbaren Node-22-Dienst mit festem Pfad `/availability`, Eingabeprüfung, CORS für `https://irisborck.github.io`, 10 Sekunden Upstream-Timeout, maximal vier parallelen und 30 Anfragen pro Minute. Keine Aufzeichnung von Reiseangaben oder Zugangsdaten. Das globale Limit ist für eine einzelne Instanz ausgelegt; mehrere Instanzen brauchen einen gemeinsamen Limiter. CORS ist kein Schutz gegen direkte externe HTTP-Anfragen; das globale Limit schützt das Upstream-Budget. Ohne Konfiguration startet der Dienst nicht.

Der Browser prüft Datum, Personenzahl, Apartment-IDs, Währung und Vollständigkeit der Antwort. Geänderte Eingaben machen alte Preise ungültig; überholte Antworten werden verworfen. Fehler werden nicht als belegte Termine ausgegeben.

## Preisregel – verbindlich geklärt

Iris hat bestätigt: Der Smoobu-Übernachtungspreis enthält **keinen Kurzreisezuschlag**. Dies wird nicht erneut geprüft. Die frühere Konfiguration `SMOOBU_VERIFIED_PRICE_BASIS` und die Variante „Zuschlag bereits enthalten“ entfallen.

Der Server liefert den Übernachtungspreis als `baseCents`. Der Browser berechnet kalendertagsgenau in UTC: bei 1–4 Nächten einmalig 8.500 Cent, ab fünf Nächten null. Jede Anzeige wird aus dem unveränderten Basispreis neu berechnet; wiederholte Suchen addieren nichts auf einen vorherigen Gesamtpreis. Kurabgabe und optionale Leistungen werden nicht hinzugerechnet.

Die technische Skalierung des API-Zahlenwerts ist unabhängig davon: `SMOOBU_PRICE_UNIT=major` bedeutet Euro, `minor` Cent. Da die öffentliche Dokumentation beim Preisfeld keine eindeutige Einheit nennt und noch kein echter API-Zugriff besteht, muss beim ersten Live-Abgleich die Einheit anhand eines bekannten Übernachtungspreises bestätigt werden. Ohne diese Einstellung wird kein Preis freigeschaltet. Es geht dabei ausdrücklich nicht um eine erneute Prüfung des Kurzreisezuschlags.

## Mindestmietdauer

Die offizielle Dokumentation liefert Fehlercode 401 und `minimumLengthOfStay`. Steht das Apartment zugleich in `availableApartments` und übersteigt die Mindestdauer die angefragten Nächte, zeigt die Karte „Verfügbar – Mindestmietdauer nicht erreicht“ und den Anrufhinweis. Fehlt die Bestätigung freier Termine, wird nur „Für diese Reisedaten nicht direkt buchbar“ angezeigt. Andere Buchungsregeln werden nicht als Belegung ausgegeben. Ein fehlendes Apartment ohne Regelhinweis gilt bei einer gültigen vollständigen API-Antwort als nicht verfügbar.

Quelle, geprüft am 27.09.2026: https://docs.smoobu.com/ – Authentication, Smoobu Availability, Errors. Der dortige Beispielresponse enthält die Kombination aus verfügbarer ID und Mindestmietdauerfehler. Ob das Konto diese Kombination in realen Mindestmietdauerfällen liefert, bleibt Teil der Live-Abnahme.

## Übergabe an Detailseiten

`arrival=YYYY-MM-DD`, `departure=YYYY-MM-DD`, `guests=N` werden in der aktuellen URL und allen sieben Detailseitenlinks erhalten. Keine dauerhafte Speicherung und keine personenbezogenen Gästedaten. Nur Saphir hat bereits eine lokale Detailseite; sechs Links führen weiterhin zur bestehenden Website. Die Parameter stehen dort in der Ziel-URL, werden von deren Buchungsformularen aber noch nicht automatisch übernommen. Der spätere Sticky-/Buchungsauftrag kann die gemeinsame Übergabelogik verwenden.

## Konkrete Inbetriebnahme

Benötigt wird ein separater, dauerhaft erreichbarer Node-22-/Container-Dienst mit HTTPS. GitHub Pages bleibt unverändert als Website-Hosting bestehen; es kann diesen Server nicht selbst ausführen. Ein vorhandener Serverzugang bzw. ein gewählter Hostingdienst liegt in dieser Arbeitsumgebung nicht vor. Es wurden keine Konten, kostenpflichtigen Dienste, Domains oder Smoobu-Einstellungen angelegt/geändert.

1. Im Secret-Speicher des Serverdienstes `SMOOBU_API_KEY`, `SMOOBU_API_SECRET`, `SMOOBU_CUSTOMER_ID` und nach Preisabgleich `SMOOBU_PRICE_UNIT` hinterlegen. Keine Geheimnisse in Chat, Git oder `PUBLIC_`-Variablen.
2. Start: `npm run start:availability`. Standard ist `127.0.0.1:8787` hinter einem HTTPS-Reverse-Proxy. Alternativ vom Repository-Stamm `docker build -f server/Dockerfile -t aquamarin-availability .`; der Container startet mit Host `0.0.0.0`, Port 8787. Keine zusätzlichen npm-Abhängigkeiten. Secrets erst zur Laufzeit über den Hostingdienst einsetzen, nicht ins Image. Das Docker-Image wurde hier nicht gebaut.
3. Die HTTPS-Adresse mit Endung `/availability` als GitHub-Repository-Variable `PUBLIC_AVAILABILITY_URL` hinterlegen. Beide vorbereiteten Build-Workflows reichen nur diese öffentliche Adresse an Astro weiter. Niemals Smoobu-Schlüssel als Repository-Variable oder Frontendvariable eintragen.
4. Den PR-Stand auf einer gesonderten, vom Prüf-Browser erreichbaren Vorschau unter dem erlaubten Ursprung bereitstellen, ohne die veröffentlichte `/apartments/`-Seite zu ersetzen. Alternativ benötigt ein separater Vorschau-Ursprung eine ausdrücklich fest konfigurierte CORS-Freigabe. Keine Wildcard-Freigabe.
5. Echte API-Ergebnisse mit Smoobu-Angeboten vergleichen: alle sieben IDs, 1–5 Nächte, Personen 1–5, freie/belegte Termine, Mindestmietdauer und fehlende Preise. API-Preis gegen die Basisübernachtung prüfen; Websitebetrag muss bei 1–4 Nächten genau 85 Euro darüber liegen. Keine Buchung absenden.
6. Desktop, Tablet, 320/375/390/430 px sowie iPhone/Safari prüfen: Eingaben, Preis-/Statuswechsel, schnelles Ändern, lange Preise, alle sieben Links, Zurücknavigation, Überläufe. Erst danach PR #3 zusammenführen und ausschließlich auf der GitHub-Testwebsite veröffentlichen.

## Tatsächlich durchgeführte Prüfungen

- `npm run build`: erfolgreich, einschließlich bestehender Build-, Saphir- und Kurabgabenprüfungen.
- `npm run test:apartments`: Preisregel 1–5/6 Nächte, Zeitumstellungen/Jahreswechsel, wiederholte Preisberechnung, alle sieben IDs mit unterschiedlichen synthetischen Preisen und Gästezahlen 1–5, Mindestmietdauer mit/ohne Verfügbarkeitsnachweis, Währung/fehlerhafte Antworten, Upstream-Ausfall, Reiseparameter, HTTP-Pfad/Methode/CORS/Anfragelimit und fehlende Zugangsdaten. Ausschließlich isolierte Testdaten, keine Ergebnisse für Gäste.
- Lokale Astro-Vorschau läuft. Der bereitgestellte Cloud-Browser blockiert den Zugriff auf `http://127.0.0.1:4321/borck-webseite-neu/apartments/` mit `ERR_BLOCKED_BY_CLIENT`. Daher keine Browserabnahme dieser neuen Fassung; die frühere Abnahme der iframe-Seite ersetzt sie nicht.
- Keine Live-Smoobu-Anfrage, keine Buchung, keine Veröffentlichung. Es fehlen Serverbetrieb/HTTPS und sicher hinterlegte API-Zugangsdaten. Vollständige funktionale Fertigstellung und Veröffentlichung bleiben bis zur Live-Abnahme offen.
