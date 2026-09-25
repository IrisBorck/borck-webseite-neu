import { taxTariffs, taxCategories, unknownTariff } from '../data/visitor-tax.mjs';
const DAY = 86400000;
function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}
// Pure Funktion: keine Netzwerk-, DOM-, Protokoll- oder Speicherzugriffe.
export function calculateVisitorTax({ arrival, departure, categories, children }, tariffs = taxTariffs) {
  const start = parseDate(arrival), end = parseDate(departure);
  if (!start) return { error: 'Bitte wähle ein gültiges Anreisedatum.', field: 'arrival' };
  if (!end) return { error: 'Bitte wähle ein gültiges Abreisedatum.', field: 'departure' };
  if (end <= start) return { error: 'Das Abreisedatum muss nach dem Anreisedatum liegen.', field: 'departure' };
  if (!Array.isArray(categories) || !Number.isSafeInteger(children) || children < 0 || children > 100 || categories.length > 100 || categories.some(id => !taxCategories.some(c => c.id === id))) {
    return { error: 'Bitte gib gültige ganze Personenzahlen ein.', field: 'adults' };
  }
  if (categories.length + children === 0) return { error: 'Bitte gib mindestens eine Person an.', field: 'adults' };
  // Zuerst alle Jahre prüfen: auch bei Befreiung keine scheinbar bestätigte Zukunftssumme.
  for (let year = start.getUTCFullYear(); year <= end.getUTCFullYear(); year++) {
    if (!tariffs[year]) return { unavailable: unknownTariff };
  }
  const groups = new Map();
  for (let time = start.getTime(); time <= end.getTime(); time += DAY) {
    const date = new Date(time), year = date.getUTCFullYear(), tariff = tariffs[year];
    const mmdd = (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
    const season = tariff.highPeriods.some(([from, to]) => mmdd >= from && mmdd <= to) ? 'high' : 'low';
    const key = `${year}-${season}`;
    if (!groups.has(key)) groups.set(key, { year, season, days: 0 });
    groups.get(key).days++;
  }
  const seasons = [...groups.values()];
  const people = categories.map((id, i) => {
    const category = taxCategories.find(c => c.id === id);
    const lines = seasons.map(group => {
      const rate = category.tariff === 'exempt' ? 0 : tariffs[group.year][group.season][category.tariff];
      return { ...group, rate, cents: group.days * rate };
    });
    const caps = [];
    if (category.tariff !== 'exempt') {
      for (const year of new Set(seasons.map(s => s.year))) {
        const subtotal = lines.filter(l => l.year === year).reduce((sum, l) => sum + l.cents, 0);
        const cap = tariffs[year].annual[category.tariff];
        if (subtotal > cap) caps.push({ year, cents: cap - subtotal, cap });
      }
    }
    return { label: `Person ${i + 1} · ${category.result}`, lines, caps, cents: lines.reduce((s, l) => s + l.cents, 0) + caps.reduce((s, c) => s + c.cents, 0) };
  });
  for (let i = 0; i < children; i++) people.push({ label: `Kind ${i + 1} bis 15 Jahre · befreit`, lines: [], caps: [], cents: 0 });
  return { arrival, departure, nights: (end - start) / DAY, days: (end - start) / DAY + 1, seasons, people, cents: people.reduce((sum, person) => sum + person.cents, 0) };
}
