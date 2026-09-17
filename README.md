# Haus Aquamarin – unabhängige Startseiten-Vorschau

Diese Arbeitsversion gehört ausschließlich zu `IrisBorck/borck-webseite-neu`.
Sie enthält die technische Grundlage und die erste deutsche Startseite. Marvins
Repository, Smoobu und `nordsee-buesum-fewo.de` werden weder verändert noch automatisch angesprochen.

## Lokal ansehen

Node 22.12 oder neuer:

```sh
npm ci
npm run dev
```

Dann `http://localhost:4321/borck-webseite-neu/` öffnen.
`npm run build` erzeugt `dist/` und prüft noindex, Assets, Anker und Dialoge.

## Später über GitHub Pages ansehen

1. In diesem Repository unter **Settings → Pages → Source** die Option **GitHub Actions** wählen.
2. Unter **Actions → Vorschau manuell auf GitHub Pages veröffentlichen → Run workflow** den Zweig `main` ausführen.
3. Die URL wird vom Deployment ausgegeben (vorgesehen: `https://irisborck.github.io/borck-webseite-neu/`).

Keine Custom Domain eintragen. Es gibt absichtlich keine CNAME-Datei und keine
Cloudflare-/IONOS-Anbindung. Ein Push prüft die Vorschau, veröffentlicht sie aber
nicht automatisch. Alle HTML-Seiten tragen `noindex, nofollow, noarchive`.
Die robots.txt erlaubt den Abruf, damit Crawler das noindex lesen können.
Noindex ist kein Passwortschutz; das Repository ist öffentlich.

## Umfang der ersten Version

- Responsive Startseite mit Original-Logo, Manrope und Source Sans 3 (lokal gehostet).
- Navy/Seegrün/Sand/Aqua, gezielte Glasoptik, einheitliche Linien-Icons.
- Bestätigte Reihenfolge der Startseitenbereiche und Apartmentreihenfolge.
- Funktionierende Abschnittsnavigation, mobiles Menü, Apartmentfilter und Kurzansichten.
- Datums-/Personenauswahl als ausdrücklich gekennzeichnete lokale Vorschau.
- Mobile Buchungsleiste verschwindet bei Hero, Verfügbarkeitsbereich, Dialogen und Abschluss/Footer.
- Tastaturbedienbare native Dialoge und FAQ, Fokusführung, Reduced Motion, 404-Seite.
- Keine Analytics, Cookies, externen Fonts, Karten-Frames oder Smoobu-Frames.

## Bewusste Grenzen

Keine Live-Verfügbarkeiten, keine Preise, kein Checkout und keine Datenübermittlung
aus dem Vorschauformular. Kurzreisezuschlag, Kurabgabe, Befreiungen und Ermäßigungen
sind noch nicht automatisiert. Die Kurabgabe bleibt entsprechend dem Arbeitsstand
separat abzurechnen. Offene Punkte der technischen Bestandsaufnahme sind Aufgaben,
keine bereits freigegebenen Systementscheidungen.

Englisch, Niederländisch, Dänisch, vollständige Apartment- und Reiseführerseiten
sowie rechtlich geprüfte endgültige Rechtstexte gehören zu späteren Schritten.
Der Sprachwähler kennzeichnet die noch fehlenden Sprachen ausdrücklich.
Google-Zitate stammen aus dem vorhandenen Bestand, ohne erfundene aktuelle
Durchschnittswerte. Airbnb wird zunächst mit dem bestätigten Superhost-Hinweis
dargestellt, ohne erfundene Bewertungen oder Siegel.

## Bilder und Material

Apartmentbilder, Original-Logo, Iris/Mia-Foto und Bewertungszitate wurden aus der
bereits lokal vorhandenen, nur gelesenen Ausgangsbasis `Marvin2702/Borck` übernommen.
Diese Kopie enthält keine fremden Deployments, Secrets oder Git-Historie.
Das vorläufige Hero zeigt den echten Topas-Ausblick und wird als solcher bezeichnet.
Finales Hero-Motiv und Bildausschnitte bleiben – wie beschlossen – Umsetzungsdetails.
Die Themenkarten verwenden vorläufig konsistente Linienillustrationen statt
unverifizierter Ortsfotos. Eigene lokale Reiseführerbilder können später ergänzt werden.
Schriftdateien: Fontsource, Manrope / Source Sans 3, jeweils Version 5.3.0;
Lizenztexte liegen in `public/fonts/`.

## Pflege

- Apartment-Kurzinfos und FAQ: `src/data/home.ts`
- Startseitenstruktur: `src/pages/index.astro`
- Farben, Abstände, responsive Gestaltung: `src/styles/global.css`
- Bedienung und Vorschauauswahl: `src/scripts/home.ts`
- Gemeinsamer Seitenrahmen/noindex: `src/layouts/Layout.astro`
