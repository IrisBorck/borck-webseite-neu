# VPS- und API-Setup – technischer Status

Stand: 28.09.2026

## Zweck

Der IONOS-VPS dient als kleiner, abgesicherter Serverdienst für die eigene Apartmentsuche von Haus Aquamarin.

Ziel der aktuellen API-Stufe:

- Verfügbarkeit für einen gewählten Zeitraum aus Smoobu lesen
- den aktuellen Übernachtungspreis je Apartment aus Smoobu lesen
- auf der eigenen Apartments-Seite direkt Preis und Verfügbarkeit anzeigen
- den einmaligen Kurzreisezuschlag von 85 € bei 1–4 Übernachtungen auf der eigenen Website automatisch ergänzen
- Reisedaten an die Detailseiten weitergeben
- keine Buchung auslösen
- keine Smoobu-Daten verändern

Die API ist in dieser Stufe ausschließlich lesend vorgesehen.

## Projekt und GitHub

Repository:

`IrisBorck/borck-webseite-neu`

Aktueller Arbeitsbranch:

`work/apartments-direkt`

Draft-PR:

PR #3 – direkte Apartmentsuche mit automatischem Kurzreisezuschlag

Der Sicherheitsstand wurde am 28.09.2026 auf den Branch gepusht.

Letzter dabei bestätigter Commit:

`d0b1885` – `chore: update Astro to 7.3.5`

## VPS

Anbieter:

IONOS

Server:

`My VPS`

System:

Ubuntu 24.04 LTS

IPv4:

`217.160.119.163`

Aktueller Serverzugang:

- regulärer SSH-Benutzer: `irisadmin`
- SSH-Port: `22`
- Anmeldung per SSH-Schlüssel vom iMac erfolgreich getestet
- `irisadmin` besitzt `sudo`-Rechte
- Root-Login per SSH deaktiviert
- Passwort-Anmeldung per SSH deaktiviert

Wichtig:

Passwörter, API-Keys, Secrets und private SSH-Schlüssel dürfen nicht in dieses Repository oder in diese Datei eingetragen werden.

## Installierter technischer Stand

Auf dem VPS installiert und geprüft:

- Ubuntu-Paketstand aktuell
- Git installiert
- Node.js `v22.23.3`
- npm `10.9.9`
- Repository unter `/opt/aquamarin-api`
- Branch `work/apartments-direkt`

## Sicherheitsupdate Astro

Der ursprüngliche Projektstand verwendete Astro `7.0.7`.

`npm audit` meldete dafür eine kritische Sicherheitswarnung.

Astro wurde auf `7.3.5` aktualisiert.

Danach:

- `npm audit`: 0 Schwachstellen
- `npm run test:apartments`: erfolgreich
- `npm run build`: erfolgreich

Die Änderung wurde als Commit `d0b1885` gespeichert und auf GitHub gepusht.

## Tests des aktuellen Apartment-Entwurfs

Folgende Prüfungen liefen erfolgreich:

- Preislogik über Testaufenthalte
- Kurzreisezuschlag
- keine Doppelberechnung
- Mindestmietdauer-Logik
- Jahreswechsel
- Sommer-/Winterzeit
- Reisedatenübergabe
- Entfernung veralteter URL-Parameter
- HTTP-Methoden- und Pfadprüfung
- Origin-Prüfung
- Request-Limit
- Verhalten bei fehlenden Zugangsdaten
- sieben Apartments
- lokale Assets
- statischer Build
- Saphir-Seite
- Kurabgaben-Rechner mit 32 erfolgreichen Prüffällen

Die Tests lösen keine Live-Buchung aus.

## Kurzreisezuschlag

Verbindliche Regel:

- 1–4 Übernachtungen: +85 € einmalig
- ab 5 Übernachtungen: kein Kurzreisezuschlag

Der Smoobu-Basispreis enthält diesen Zuschlag nicht.

Geplanter Ablauf:

1. Smoobu liefert den Basis-/Übernachtungspreis.
2. Die Website berechnet die Zahl der Übernachtungen.
3. Bei 1–4 Übernachtungen werden 85 € einmalig ergänzt.
4. Ab 5 Übernachtungen werden 0 € ergänzt.
5. Die Website zeigt den resultierenden Unterkunftspreis an.
6. Die Kurabgabe wird getrennt ausgewiesen.

## Kurabgabe

Die Kurabgabe wird auf der Website separat und tagesgenau berechnet.

Zu berücksichtigen:

- An- und Abreisetag
- Saisonwechsel
- Altersbefreiung
- Ermäßigungen
- Befreiungen
- gemischte Personengruppen

Der bestehende Rechner wurde erfolgreich getestet.

Perspektivisch kann die Kurabgabe beim späteren vollständigen Buchungs- und Zahlungsschritt zusammen mit dem Gesamtbetrag eingezogen werden. Sie soll in der Preisaufstellung trotzdem als eigene Position sichtbar bleiben.

## Smoobu-Anbindung – vorbereiteter Stand

Der vorbereitete Serverdienst verwendet für die Verfügbarkeitsprüfung den read-only vorgesehenen Endpoint:

`POST https://login.smoobu.com/booking/checkApartmentAvailability`

Die aktuelle Implementierung ist so vorbereitet, dass sie nur Verfügbarkeit und Preise liest.

Es gibt in diesem Stand keine Buchungs-, Reservierungs-, Kalender- oder Preis-Schreiboperation.

Vorgesehene Servervariablen:

- `SMOOBU_API_KEY`
- `SMOOBU_API_SECRET`
- `SMOOBU_CUSTOMER_ID`
- `SMOOBU_PRICE_UNIT`

Diese Werte dürfen nur serverseitig hinterlegt werden.

Noch offen ist die einmalige Prüfung der von Smoobu gelieferten Preiseinheit gegen einen bekannten realen Preis.

## GitHub-Zugriff vom VPS

Für den VPS wurde ein eigenes SSH-Schlüsselpaar erzeugt.

Privater Schlüssel:

`/root/.ssh/aquamarin_github`

Öffentlicher Schlüssel:

`/root/.ssh/aquamarin_github.pub`

Der private Schlüssel darf niemals veröffentlicht oder in GitHub eingecheckt werden.

In GitHub wurde für dieses Repository ein Deploy Key angelegt:

Titel:

`Aquamarin VPS`

Berechtigung:

Read/write

Der Deploy Key ist nur für dieses Repository bestimmt.

Das Git-Remote wurde auf SSH umgestellt:

`git@github.com:IrisBorck/borck-webseite-neu.git`

Für dieses Repository ist auf dem VPS konfiguriert:

`ssh -i /root/.ssh/aquamarin_github -o IdentitiesOnly=yes`

Der SSH-Test zu GitHub war erfolgreich.

## Commit-Identität auf dem VPS

Nur für dieses Repository wurde gesetzt:

Name:

`Iris Borck`

GitHub-Noreply-Adresse:

`330437884+IrisBorck@users.noreply.github.com`

Damit erscheint die private E-Mail-Adresse nicht in neuen öffentlichen Commits.

## Sicherheits-Härtung des VPS – erledigt am 28.09.2026

Folgende Maßnahmen wurden umgesetzt und geprüft:

- separater Administrator-Benutzer `irisadmin` angelegt
- `irisadmin` zur Gruppe `sudo` hinzugefügt
- eigener SSH-Schlüssel auf dem iMac für den VPS erzeugt
- öffentlicher Schlüssel in `/home/irisadmin/.ssh/authorized_keys` hinterlegt
- Anmeldung als `irisadmin` per SSH-Schlüssel erfolgreich getestet
- `sudo whoami` erfolgreich getestet
- SSH-Konfiguration geprüft mit `sshd -t`
- Root-Login per SSH deaktiviert
- Passwort-Anmeldung per SSH deaktiviert
- Keyboard-Interactive-Login deaktiviert
- Public-Key-Authentifizierung aktiviert
- SSH-Dienst neu geladen
- erneuter Login-Test nach der Härtung erfolgreich
- UFW aktiviert und für Systemstart eingeschaltet

Aktuell freigegebene Ports:

- `22` / OpenSSH
- `80/tcp`
- `443/tcp`

Der interne Node-Dienst soll weiterhin nur auf:

`127.0.0.1:8787`

lauschen und nicht direkt über die Firewall nach außen freigegeben werden.

## Geplante öffentliche API-Adresse

Vorgesehen ist eine eigene Subdomain, zum Beispiel:

`api.nordsee-buesum-fewo.de`

Geplanter Aufbau:

Browser / Website → HTTPS → Reverse Proxy → Node-Dienst auf `127.0.0.1:8787`

Noch einzurichten:

- DNS-A-Record auf `217.160.119.163`
- Reverse Proxy, z. B. Nginx oder Caddy
- kostenloses TLS-Zertifikat, z. B. Let's Encrypt
- systemd-Dienst für den Node-Prozess
- sichere Servervariablen für Smoobu

## IONOS-Hinweis SMTP-Port 25

Der ausgehende SMTP-Port 25 ist beim VPS gesperrt.

Für den aktuellen API-Dienst ist das ohne Bedeutung.

Der API-Server soll keine E-Mails über Port 25 versenden.

## Veröffentlichung

Der aktuelle API-Entwurf ist noch nicht als fertige Live-Lösung veröffentlicht.

GitHub Pages kann selbst keinen dauerhaft laufenden Node-Server hosten.

Die statische Website bleibt auf GitHub Pages; der VPS übernimmt nur den API-Dienst.

PR #3 soll erst nach vollständiger Server-, API- und Browserprüfung zusammengeführt werden.

## Nächster Fortsetzungspunkt

Der VPS-Grundschutz ist abgeschlossen: `irisadmin` funktioniert per SSH-Schlüssel, Root-/Passwort-SSH ist deaktiviert und UFW ist aktiv.

Als nächstes sinnvoll:

1. Reverse Proxy installieren
2. DNS-Subdomain auf den VPS zeigen lassen
3. HTTPS einrichten
4. Node-Availability-Dienst als systemd-Service einrichten
5. sichere Servervariablen für Smoobu vorbereiten
6. Smoobu-Zugangsdaten ausschließlich serverseitig hinterlegen
7. ersten kontrollierten read-only Live-Test durchführen
8. Preiseinheit gegen bekannten Smoobu-Preis prüfen
9. Apartmentübersicht mit echter API verbinden
10. Desktop- und Smartphone-Browserprüfung
11. erst danach PR #3 final bewerten und ggf. mergen

## Sicherheitsgrundsatz

Keine geheimen Zugangsdaten in:

- GitHub
- Markdown-Dokumentation
- Browser-Screenshots
- Chat
- Client-JavaScript

Geheime Werte gehören ausschließlich in geschützte Servervariablen bzw. geeignete Secret-Verwaltung.
