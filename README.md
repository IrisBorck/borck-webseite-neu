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

## GitHub Pages

Die Vorschau liegt unter https://irisborck.github.io/borck-webseite-neu/.
Der Pages-Workflow veröffentlicht Änderungen auf `main` automatisch; er kann
zusätzlich manuell gestartet werden. Pages verwendet ausschließlich GitHub Actions.
Keine Custom Domain, CNAME, Cloudflare- oder IONOS-Anbindung hinzufügen.
Alle HTML-Seiten behalten `noindex, nofollow, noarchive`.

## Umfang der ersten Version

- Responsive Startseite mit Original-Logo, Manrope und Source Sans 3 (lokal gehostet).
- Navy/Seegrün/Sand/Aqua, Panorama mit Navy-Verlauf ohne Textkachel, einheitliche Linien-Icons.
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
Die echten Google-Bewertungen sind manuell in `src/data/reviews.json` gepflegt.
Jessica Götz (Google) und Catrin (Airbnb) fehlen als Originalquelle samt Sternen.
Bis dahin steht Torstens belegte Bewertung im Vordergrund; zwei vorhandene
Google-Bewertungen sind zusätzlich aufklappbar. Kein Superhost-Platzhalter.

## Bilder und Material

Original-Logo, Apartmentbilder und Iris/Mia bleiben aus dem bestehenden Stand.
Die beiden neu gelieferten Fotos liegen unverändert als `hero-panorama.jpg` und
`haus-aquamarin-aussenansicht.jpeg` vor. Gestaltungsreferenzen sind keine Seitenbilder.
13 FAQs wurden aus der bisherigen öffentlichen Website übernommen; nur die
beiden ausdrücklich beauftragten Antworten zu später Anreise und Zahlung geändert.
Türkis: eigener Außenbereich laut neuem Auftrag, konkrete Zuordnung noch offen.
Bis zur Bestätigung erscheint Türkis in keinem Balkon-/Terrassenfilter.

Schriftdateien: Fontsource, Manrope / Source Sans 3, jeweils Version 5.3.0;
Lizenztexte liegen in `public/fonts/`.

## Pflege

- Apartment-Kurzinfos: `src/data/home.ts`
- FAQ: `src/data/faqs.json`; Bewertungen: `src/data/reviews.json`
- Startseitenstruktur: `src/pages/index.astro`
- Farben, Abstände, responsive Gestaltung: `src/styles/global.css`
- Bedienung und Vorschauauswahl: `src/scripts/home.ts`
- Gemeinsamer Seitenrahmen/noindex: `src/layouts/Layout.astro`
