// Bestätigter Arbeitsstand aus Iris' inhaltlicher und optischer Entscheidungsrunde.
// Preisberechnung, Buchungen und Bewertungsaktualisierung sind noch nicht aktiv.
export const apartments = [
  { id: 'saphir', name: 'Saphir', size: '60 m²', guests: 4, floor: 'Erdgeschoss', outdoor: 'Terrasse · Gartenblick', image: 'saphir-living', line: 'Platz für gemeinsame Lieblingsmomente.', note: 'Zwei Schlafzimmer, eine offene Küche und eine eigene Terrasse mit Gartenblick.', type: 'terrasse' },
  { id: 'rubin', name: 'Rubin', size: '60 m²', guests: 4, floor: 'Erdgeschoss', outdoor: 'Terrasse · Gartenblick', image: 'rubin-living', line: 'Ein gemütlicher Ankerplatz für die Familie.', note: 'Zwei Schlafzimmer mit einem 200 cm breiten Doppelbett (2 × 100 cm) und einem Etagenbett.', type: 'terrasse' },
  { id: 'opal', name: 'Opal', size: '55 m²', guests: 4, floor: '1. Obergeschoss', outdoor: '2 Balkone · einer mit seitlichem Deichblick', image: 'opal-living', line: 'Zwei Balkone. Doppelt draußen sein.', note: 'Zwei Schlafzimmer mit Doppelbett und Etagenbett. Einer der beiden Balkone bietet seitlichen Deichblick.', type: 'balkon' },
  { id: 'tuerkis', name: 'Türkis', size: 'ca. 57 m²', guests: 4, floor: '1. Obergeschoss', outdoor: 'Kleiner Deichblick · ohne Balkon', image: 'tuerkis-dining', line: 'Zusammen ankommen und sich wohlfühlen.', note: 'Zwei Schlafzimmer und eine offene Küche. Dieses Apartment hat keinen Balkon.', type: 'ohne' },
  { id: 'topas', name: 'Topas', size: 'ca. 76 m²', guests: 5, floor: '2. Obergeschoss', outdoor: 'Kleiner Balkon · seitlicher Deich-/Meerblick', image: 'topas-living-view', line: 'Mehr Raum für deine Nordsee-Auszeit.', note: 'Zwei Schlafzimmer, viel Platz und ein kleiner Balkon. Seitlicher Deich- und Meerblick.', type: 'balkon' },
  { id: 'bernstein', name: 'Bernstein', size: 'ca. 35 m²', guests: 2, floor: 'Erdgeschoss', outdoor: 'Terrasse · Gartenblick', image: 'bernstein-living-terrace', line: 'Ein kleiner Rückzugsort für zwei.', note: 'Mit eigenem Eingang, einem Schlafzimmer und einer Terrasse mit Gartenblick.', type: 'terrasse' },
  { id: 'smaragd', name: 'Smaragd', size: '28 m²', guests: 2, floor: '1. Obergeschoss', outdoor: 'Balkon · seitlicher Deichblick', image: 'smaragd-living', line: 'Kompaktes Urlaubsglück unter dem Dach.', note: 'Ein 1-Raum-Apartment mit Balkon. Wichtig: Der Zugang erfolgt über eine offene Stahltreppe.', type: 'balkon' },
];

export const reviews = [
  { name: 'Beate', quote: 'Ganz tolle Gastgeberin! Die Wohnung war sehr geräumig, gerade im Wohn-Ess-Bereich, was mit kleinen Kindern sehr angenehm war …' },
  { name: 'Carmen', quote: 'Sehr saubere Wohnung mit allem, was man braucht. Wir und unsere Fellnase wurden so herzlich empfangen …' },
];

export const faqs = [
  ['Wie weit ist es bis zur Nordsee?', 'Der Deich ist etwa 350 m entfernt, die Familienlagune Perlebucht etwa 400 m. Für den Weg zum Zentrum beziehungsweise Hafen rechne mit ungefähr 1,7 km zu Fuß; die Pkw-Strecke beträgt etwa 4,6 km.'],
  ['Darf mein Hund mitkommen?', 'Ja, Hunde sind im Haus Aquamarin willkommen. Für einen Hund fallen einmalig 46 € an, für einen zweiten Hund zusätzlich 23 €. Bitte gib deine Hunde bei der späteren Buchung mit an.'],
  ['Wann kann ich anreisen und wann ist die Abreise?', 'Die Anreise ist ab 15 Uhr möglich, die Abreise bis 10 Uhr. Andere Zeiten kannst du mit Iris persönlich abstimmen.'],
  ['Kann ich Bettwäsche und Handtücher dazubuchen?', 'Ja. Bettwäsche kostet 12 € pro Person, ein Handtuchpaket 9 € pro Paket. Beides ist eine freiwillige Zusatzleistung.'],
  ['Was gilt für kurze Aufenthalte und die Kurabgabe?', 'Bei Aufenthalten unter fünf Nächten fällt einmalig ein Kurzreisezuschlag von 85 € an. Die Kurabgabe wird separat abgerechnet. Die automatische Berechnung einschließlich An- und Abreisetag sowie Befreiungen und Ermäßigungen wird vor Freischaltung des Buchungsablaufs geprüft.'],
];
