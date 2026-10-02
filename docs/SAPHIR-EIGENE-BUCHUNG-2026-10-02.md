# Eigene Buchungsstrecke – geschützter Saphir-Pilot

Projekt: IrisBorck/borck-webseite-neu  
Branch: work/apartments-direkt  
Ausgangscommit: a0f57e2e3ba6725b1657496a410bf765c3d6edb8  
Stand: 02.10.2026 – lokale Umsetzung; nicht deployed, Live-Schreibzugang standardmäßig aus.

## Umfang und fachliche Entscheidung

Ein geschütztes eigenes Formular unter `/pilot/` und ein separater Node-Einstieg bilden den vollständigen Weg Angebot → Bestätigung → Smoobu → Kontrolle ab. Der bestehende öffentliche Availability-Dienst und die statischen Seiten bleiben technisch unverändert. Das neue Formular wird erst nach gesonderter Bereitstellungsfreigabe erreichbar gemacht; kein Link auf den öffentlichen Seiten wurde gesetzt.

Der Pilot ist serverseitig fest auf Saphir (133655), 09.–14.11.2026, zwei Erwachsene ohne Kurabgabenermäßigung begrenzt. Eine deutsche Rechnungsanschrift wird unterstützt. Andere Zeiträume, Belegungen, Ermäßigungen, Jahreskarten/anrechenbare Vorzahlungen und unbekannte Zusatzfelder werden abgewiesen. Diese Begrenzung betrifft diesen ersten Test, nicht die spätere Produktarchitektur.

Maßgeblich ist die gespeicherte eigene Preisaufstellung. Sie umfasst Unterkunft, einmaligen Kurzreisezuschlag, Bettwäsche, Handtuchpakete, Babybett, Hochstuhl, Hundepauschalen und Kurabgabe. Smoobu bekommt den Gesamtbetrag in `price`, die erste fällige Zahlung in `prepayment`, beide Zahlungsstatus offen, Quelle Homepage (70) sowie eine eigene Buchungskennung und die Zahlungstermine in `notice`. Einzelne `priceElements` werden nicht nachgebaut. Die Gesamtpreisübertragung soll die bestehenden Nachrichten unterstützen; deren Inhalt muss beim Live-Test kontrolliert werden.

Für den Pilot wird die Kurabgabe zusammen mit dem Gesamtbetrag per Überweisung bezahlt. Das Formular benennt dies ausdrücklich. Es findet kein Zahlungseinzug statt. 50 € Anzahlung innerhalb von sieben Tagen; spätestens am Restzahlungstermin. Restzahlung 30 Tage vor Anreise. Ab genau 30 Tagen Vorlauf ist der Gesamtbetrag sofort fällig. Diese Präzisierung ist nur im neuen geschützten Ablauf enthalten; bestehende öffentliche Texte wurden nicht geändert.

## Dateien und Aufbau

- `server/booking/domain.mjs`: festgelegter Testumfang, Validierung, Preisstand, Zahlungsplan, Smoobu-Payload und Rückvergleich.
- `server/booking/migrations/001.sql`: PostgreSQL-Angebote, Buchungen, exklusive Pilotsperre, Ereignisse und Vorabprüfung.
- `server/booking/store.mjs`: Transaktionen, Sperren und eindeutige Schlüssel.
- `server/booking/provider.mjs`: HMAC-Smoobu-Adapter ohne automatische Schreibwiederholung; davon getrennter Netzwerk-freier Simulator.
- `server/booking/service.mjs`: Angebots- und Buchungszustände, erneute Preisprüfung, Ergebnisabgleich.
- `server/booking/http.mjs`, `config.mjs`, `runtime.mjs`, `start.mjs`: geschützter Server, feste Routen, Betriebsart und Datenbank.
- `server/booking/ui/`: eigenes deutsches Formular, mobile Darstellung, Statuswiederaufnahme.
- `scripts/booking/`: Datenbankmigration, rein lesende Live-Vorabprüfung und automatisierte Prüfungen.

Produktion nutzt den Treiber `pg` mit PostgreSQL. Die lokale Simulation nutzt PGlite, eine PostgreSQL/WASM-Laufzeit, in einer getrennten flüchtigen Datenbank. Nach Neustart des Simulators beginnt eine neue Simulation; ein echter Pilot nutzt die dauerhafte PostgreSQL-Datenbank. Keine eigene Gästekartei, kein sevdesk, kein Stripe, kein zusätzlicher Mailversand.

## Zuverlässigkeit

Angebote laufen nach zehn Minuten ab. Der Browser sendet nur Auswahl und Kontaktdaten; keine Preisbeträge werden als Eingabe akzeptiert. Der Server speichert Positionen, EUR-Centbeträge, Regelversion und Zahlungsplan. Vor dem Versand erfolgt eine erneute Abfrage. Bei geändertem Preis oder geändertem Zahlungsplan wird vor jedem Schreibversuch abgebrochen; neues Angebot und neue Bestätigung sind erforderlich.

Jeder Abschluss erhält einen Wiederholungsschlüssel. Eindeutige Datenbankbedingungen sichern Angebot und Schlüssel. Eine zusätzliche, transaktional belegte Pilot-Sperre verhindert einen weiteren Vorgang für denselben Test, auch aus einem zweiten Browser oder Prozess. Vor dem Netzwerkaufruf wird `submitting` mit `create_attempts=1` dauerhaft gespeichert. Es gibt keinen Codepfad, der diesen Anlageaufruf wiederholt.

Nach einem unklaren Ergebnis bleibt der Test gesperrt. Abgleich liest eine bekannte Reservierungs-ID oder sucht seitenweise nach der eigenen Kennung in `notice`. Kein Treffer bedeutet weiterhin ungeklärt, nicht gescheitert. Mehrere Treffer oder abweichende Daten erfordern manuelle Prüfung. Bestätigung erfordert zusätzlich eine nicht verfügbare Rückmeldung der Availability-API. Ein bloßer Restriktionshinweis wird nicht als Beweis einer Kalenderblockierung gewertet.

Die Erfolgsprüfung kontrolliert Reservierungsart, Blockierungskennzeichen, Apartment, Kanal, Zeitraum, Personenzahl, E-Mail, Kennung, Gesamtpreis und erste Zahlung. Nicht alle Anschriftfelder sind im dokumentierten Rückleseformat zugesichert; deren Darstellung ist im Live-Test zusätzlich manuell zu prüfen.

Wird der Browser nach dem Absenden geschlossen, bleibt nur die undurchsichtige Vorgangskennung/Wiederholungsschlüssel im Session Storage. Über den geschützten Statusaufruf kann der bestehende Vorgang wiedergefunden werden. Kontaktdaten oder Zugangsdaten werden dort nicht gespeichert. Nach einem Prozessabbruch vor dem Versand kann ein veralteter Prüfzustand sicher beendet werden; nach der Versandmarkierung ist nur Lesen erlaubt.

## Schutz und Betrieb

- HTTP Basic-Zugang mit Benutzer und mindestens 24 Zeichen langem Passwort aus Servervariablen, keine eingebauten Zugangsdaten.
- Live-Betrieb verlangt HTTPS-Origin, PostgreSQL und serverseitige Smoobu-Konfiguration.
- Node bindet ausschließlich an 127.0.0.1; separater Port 8788.
- Keine CORS-Freigabe. Schreibanfragen brauchen exakten Origin, JSON-Inhaltstyp und eigenen Header.
- Feste Pfade, keine Proxy-Ziel-URL, kein Zugriff auf Bank- oder sevdesk-Endpunkte.
- Größen-, Parallelitäts- und Anfragelimits; begrenzte externe Zeitüberschreitungen, keine Weiterleitungen.
- CSP, no-store, no-referrer, noindex/nofollow/noarchive; kein Drittanbieter-Code im Formular.
- Keine Request-/Gastdatenprotokollierung. Personenbezogene Buchungsdaten liegen nur in der geschützten Datenbank und später bei Smoobu.
- Vor Einsatz: eigener unprivilegierter Dienstbenutzer, eingeschränkte Datenbankrolle, geschützte Environment-Datei, Sicherung/Wiederherstellungsprüfung und passende Löschfristen. Eine Migrationsrolle benötigt DDL-Rechte; der laufende Dienst nur benötigte Tabellen-/Sequenzrechte.
- Browser-Caches, Nginx-Zugangsprotokolle und Sicherungen müssen ebenfalls dem Schutzkonzept entsprechen. Keine Autorisierungsheader protokollieren.

## Lokal prüfen (keine echten Buchungen)

Mit Node >=22.12 und `npm ci`:

1. `npm run test:booking`: lokale PostgreSQL/WASM-Prüfungen und HTTP-Schutztests.
2. `npm run test:apartments`: bestehende fachliche/API-Tests.
3. `ASTRO_TELEMETRY_DISABLED=1 npm run build`: bestehender Website-Build einschließlich Prüfungen.
4. `npm run test:booking:browser`: Desktop-/Mobilprüfung mit lokalem Chromium, ausschließlich Simulation. Bilder werden in `docs/booking-review/` geschrieben. Das Linux-Prüfwerkzeug benötigt eine Umgebung, die lokale Prozesse/Loopback erlaubt.

Für manuelle Simulation `BOOKING_MODE=simulation`, `BOOKING_USER`, ein selbst gewähltes langes `BOOKING_PASSWORD` und `BOOKING_ORIGIN=http://127.0.0.1:8788` nur in der lokalen Prozessumgebung setzen; dann `npm run start:booking` und `/pilot/` öffnen. Passwort nicht als URL-Bestandteil verwenden. Die Seite kennzeichnet Preise und Buchungen deutlich als Simulation.

Optional kann `BOOKING_TEST_DATABASE_URL` auf eine isolierte lokale PostgreSQL-Testinstanz zeigen. Die Tests erzeugen für jeden Fall ein eigenes zufällig benanntes Schema und entfernen nur dieses Schema. Kein produktives Datenbankziel verwenden. Der verwendete reale PostgreSQL-Testprozess hatte ausschließlich Loopback-Zugang.

Es gibt keine fest hinterlegte Test-E-Mail-Adresse. Automatische Tests erzeugen für jeden Lauf eine zufällige synthetische Adresse mit ungültiger Empfängerdomain im Arbeitsspeicher. Screenshots enthalten keine solche Adresse. Iris gibt ihre eigene Testadresse erst beim Live-Test ein.

## Vorbereitung einer späteren Bereitstellung – jetzt nicht ausgeführt

1. Bereitstellung separat freigeben lassen. PostgreSQL anlegen, Backup/Restore prüfen, unprivilegierten Dienst und TLS-Reverse-Proxy für den geschützten Pilot einrichten.
2. `BOOKING_MODE=live`, `DATABASE_URL`, `BOOKING_ORIGIN` (HTTPS), `BOOKING_USER`, `BOOKING_PASSWORD`, `SMOOBU_API_KEY`, `SMOOBU_API_SECRET`, `SMOOBU_CUSTOMER_ID`, `SMOOBU_PRICE_UNIT` serverseitig hinterlegen. `BOOKING_ENABLE_LIVE_WRITE` bleibt NICHT gesetzt.
3. Datenbankmigration ausdrücklich ausführen: `npm run booking:migrate`. Dies schreibt nur das lokale Datenbankschema; es ruft Smoobu nicht auf.
4. Quelle Homepage und bestehende Vorlagen nur lesend prüfen. Insbesondere darf eine Vorlage Kurabgabe/Extras nicht nochmals auf den übertragenen Gesamtbetrag addieren. Kurabgabe-im-Überweisungsbetrag und Zahlungsplan im Formular abnehmen. Für den ersten Live-Test festlegen, wer Bestätigungsmails erhält und wie der Test anschließend manuell storniert wird.
5. Unmittelbar VOR Aktivierung: bei ausgeschaltetem Schreibzugang `npm run booking:preflight`. Dieser Befehl fragt den festgelegten Aufenthalt live ab und speichert ausschließlich eine lokale Prüfbestätigung mit aktuellem Unterkunftspreis. Ist der Zeitraum nicht verfügbar, STOPP. Keinen anderen Zeitraum automatisch einsetzen.
6. Erst nach Iris' gesonderter Aktivierungsfreigabe `BOOKING_ENABLE_LIVE_WRITE=SAPHIR-09-14-NOV-2026` setzen und den Dienst starten. Die Vorabprüfung muss beim Abschluss jünger als zehn Minuten sein. Zusätzlich wird direkt vor dem Anlageaufruf erneut live geprüft. Nach Ablauf Schreibzugang wieder ausschalten und die Vorabprüfung wiederholen.

Der Aktivierungsschalter ist kein Passwort. Er ersetzt weder Zugangsschutz noch die Freigabe. Im ausgelieferten Projekt ist kein Live-Schreibzugang aktiviert.

## Checkliste für die eine echte Reservierung

### Iris löst selbst aus

- Saphir 09.–14.11.2026, zwei Erwachsene; reguläre Kurabgabe bestätigen.
- Zwei Bettwäschepakete, weitere Extras zunächst null.
- Echten Unterkunftspreis prüfen. Erwartete Zuschläge: Kurzreise 0 €, Bettwäsche 24 €, Kurabgabe 33,60 €. Summe = aktueller Unterkunftspreis +57,60 €.
- Eigene Test-E-Mail erst jetzt eingeben. Name, Anschrift, Telefon und Zahlungsplan prüfen.
- Live-Hinweis und Preis bestätigen; einmal „Zahlungspflichtig buchen“ betätigen.
- Eigene Vorgangs-ID und Smoobu-ID notieren. Nach Neuladen muss derselbe Vorgang erscheinen. Kein neuer Abschluss nötig.

### Ergebnis prüfen

- In Smoobu genau eine Reservierung: richtiges Apartment, Daten, Gäste, Quelle Homepage und Kontaktangaben.
- Übertragener Gesamtbetrag stimmt mit eigener Preisaufstellung überein; Zahlung bleibt offen.
- Kalender in Smoobu gesperrt; Weitergabe an Portale beobachten und Verbindungstyp/Verzögerung notieren.
- Sofort ausgelöste Nachrichten an Iris prüfen: Empfänger, Zeitraum, Gesamtbetrag, erste Zahlung, Fälligkeiten, vorhandener Check-in-Link, keine doppelten Aufschläge.
- Spätere zeitgesteuerte Nachrichten sind durch diesen einen sofortigen Test NICHT automatisch bewiesen.
- Ungeklärter Status: keine weitere Buchung. Geschützte Statusprüfung verwenden; falls nötig in Smoobu anhand der Kennung suchen. Fehlende Sichtbarkeit beweist kein Scheitern.

### Manuelle Bereinigung

- Live-Schreibschalter sofort wieder deaktivieren.
- Reservierungs-ID in Smoobu eindeutig mit dem Test abgleichen; Iris storniert ausschließlich diese Reservierung manuell. Es existiert kein automatischer Storno-Endpunkt im Pilot.
- Geplante Nachrichten zum Test in Smoobu kontrollieren und gegebenenfalls manuell stoppen; kein Gast außerhalb des Tests darf betroffen sein.
- Kalenderfreigabe und spätere Portalaktualisierung prüfen.
- Ergebnis und manuelle Bereinigung im Prüfprotokoll dokumentieren. Lokale Pilot-Sperre nicht automatisch löschen: sie verhindert einen zweiten Testversand. Der gespeicherte Bestätigungsstatus dokumentiert den Testzeitpunkt und wird in dieser Stufe nicht automatisch mit einer späteren Stornierung synchronisiert.
- Testkontaktdaten nach festgelegter Aufbewahrungs-/Löschentscheidung ausschließlich gezielt aus Testdatenbank und Sicherungen entfernen. Keine pauschale Bereinigung anderer Buchungen.

## Prüfgrenzen

Keine reale Reservierung, keine Live-Vorabprüfung in diesem Umsetzungsauftrag, keine Änderung an Smoobu, sevdesk, VPS, DNS oder Hosting. Keine Nachrichten versandt. Atomare Konfliktbehandlung zwischen Smoobu und externen Portalen, tatsächliche Nachrichten und Anbieter-Rücklesefelder bleiben Live-Prüfpunkte. Kein automatischer Abbruch oder Freigeben einer extern möglicherweise vorhandenen Reservierung.

## Tatsächlich ausgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Neue Buchungs-/HTTP-Tests mit PGlite | 15 bestanden, 0 fehlgeschlagen |
| Dieselben Kern-/HTTP-Tests mit separatem lokalem PostgreSQL-Prozess | 15 bestanden, 0 fehlgeschlagen; echte konkurrierende SQL-Transaktionen über `pg` |
| Desktop Chromium 1280 × 1000 | Angebot, vollständiges Formular, simulierte Bestätigung, Wiederaufnahme nach Neuladen erfolgreich; kein horizontaler Überlauf, keine JavaScript-Fehler |
| Mobile Chromium 390 × 844 | Derselbe Ablauf erfolgreich; kein horizontaler Überlauf, keine JavaScript-Fehler. Kein physisches iPhone-/Safari-Gerätetest |
| Bestehende `test:apartments` | Erfolgreich |
| Abschließender Astro-Build samt bestehenden DOM-/Inhaltsprüfungen | Erfolgreich; einschließlich 32 Kurabgabenfällen |
| `npm audit --omit=dev` | 0 gemeldete Schwachstellen nach gezieltem Update der vorhandenen transitiven Abhängigkeit `devalue` |
| `git diff --check` | Ohne Befund |

Die Fehlerprüfungen umfassen Doppelübermittlung, zwei konkurrierende Angebote, geänderten Preis, abgelaufenes Angebot, Unverfügbarkeit, Antwortverlust vor/nach simulierter Anlage, simulierten Prozessabbruch nach persistierter Versandmarkierung, abweichende Reservierung, fehlende Kalenderbestätigung, deaktivierten Live-Zugang, fehlende Vorabprüfung, Scope-/Preismanipulation, HTTP-Zugangsschutz und CSRF. Gespeicherte Vorgänge bleiben auch nach Schließen des Schreibzugangs abrufbar.

Visuell geprüfte Bilder: `booking-review/desktop-offer.png`, `desktop-result.png`, `mobile-offer.png`, `mobile-result.png`. Sichtbarer Unterkunftspreis 550 € ist ausdrücklich ein Simulationswert, keine aktuelle Live-Zusage.

Iris hat Commit und Push dieses fertiggestellten Standes auf `work/apartments-direkt` am 02.10.2026 ausdrücklich freigegeben. Deployment, Aktivierung des Live-Schreibzugangs, Live-Vorabprüfung und echte Reservierungen bleiben ausgeschlossen.
