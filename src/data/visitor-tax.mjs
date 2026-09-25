// Offizielle Büsum-Tarife, geprüft am 25.09.2026. Keine automatische Fortschreibung.
export const taxSource = 'https://www.buesum.de/urlaub-planen/buesumer-gaestekarte';
export const taxStatute = 'https://www.buesum.de/fileadmin/Mediendatenbank/PDF/Dokumente/251114-Kurabgabesatzung-2026-webKA01.pdf';
export const taxNotice = 'Alle Angaben nach aktuellem Stand. Änderungen und Irrtümer vorbehalten. Maßgeblich sind die jeweils gültige Kurabgabesatzung und die Regelungen der Gemeinde Büsum.';
export const separateTax = 'Die Kurabgabe wird separat abgerechnet und ist nicht im Übernachtungspreis enthalten.';
export const unknownTariff = 'Für diesen Reisezeitraum sind die aktuellen Kurabgaben noch nicht vollständig hinterlegt. Bitte beachte die jeweils gültigen Angaben der Gemeinde Büsum.';
export const taxRules = {
  adultAge: 16,
  childMaxAge: 15,
  reducedGdb: 80,
  mobilityGdb: 50,
  mobilityMarks: ['G', 'aG'],
  exemptMarks: ['BL', 'H'],
};
export const taxTariffs = {
  2026: {
    high: { regular: 400, reduced: 280 },
    low: { regular: 280, reduced: 200 },
    annual: { regular: 11200, reduced: 7840 },
    highPeriods: [[101, 107], [401, 1031], [1225, 1231]],
  },
};
export const taxCategories = [
  { id: 'regular', label: 'Keine Ermäßigung / Befreiung', tariff: 'regular', result: 'regulär' },
  { id: 'gdb80', label: `GdB ${taxRules.reducedGdb} oder höher`, tariff: 'reduced', result: 'ermäßigt (GdB 80+)' },
  { id: 'mobility', label: `GdB mindestens ${taxRules.mobilityGdb} + Merkzeichen G oder aG`, tariff: 'reduced', result: 'ermäßigt (GdB 50+ und G/aG)' },
  { id: 'blind-help', label: 'Merkzeichen BL oder H', tariff: 'exempt', result: 'befreit (BL/H)' },
  { id: 'companion-reduced', label: 'Berechtigte Begleitperson mit Merkzeichen B', tariff: 'reduced', result: 'ermäßigte Begleitperson' },
  { id: 'companion-exempt', label: 'Eine Begleitperson einer Person mit BL oder H', tariff: 'exempt', result: 'befreite Begleitperson' },
];
