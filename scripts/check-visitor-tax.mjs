import assert from 'node:assert/strict';
import { calculateVisitorTax as calculate } from '../src/lib/visitor-tax.mjs';
const tests = [];
const test = (name, fn) => tests.push([name, fn]);
const calc = (arrival = '2026-06-10', departure = '2026-06-13', categories = ['regular'], children = 0) => calculate({ arrival, departure, categories, children });
test('Hauptsaison: 3 Nächte, 4 Tage, 16 EUR', () => { const r = calc(); assert.equal(r.nights, 3); assert.equal(r.days, 4); assert.equal(r.cents, 1600); });
test('Nebensaison: 4 Tage, 11,20 EUR', () => assert.equal(calc('2026-11-10', '2026-11-13').cents, 1120));
test('Frühjahr: 31. März / 1. April = 6,80 EUR', () => { const r = calc('2026-03-31', '2026-04-01'); assert.equal(r.cents, 680); assert.deepEqual(r.seasons.map(s => s.days), [1, 1]); });
test('Herbst: 31. Oktober / 1. November = 6,80 EUR', () => assert.equal(calc('2026-10-31', '2026-11-01').cents, 680));
test('Weihnachten: 24./25. Dezember = 6,80 EUR', () => assert.equal(calc('2026-12-24', '2026-12-25').cents, 680));
test('Januar: 7./8. Januar 2026 = 6,80 EUR', () => assert.equal(calc('2026-01-07', '2026-01-08').cents, 680));
test('Sommerzeit: 28.–30. März bleiben 2 Nächte / 3 Tage', () => { const r = calc('2026-03-28', '2026-03-30'); assert.equal(r.days, 3); assert.equal(r.cents, 840); });
test('Winterzeit: 24.–26. Oktober bleiben 2 Nächte / 3 Tage', () => assert.equal(calc('2026-10-24','2026-10-26').days, 3));
test('Kind bis 15: sichtbar berücksichtigt, 0 EUR', () => { const r = calc(undefined, undefined, [], 1); assert.equal(r.cents, 0); assert.match(r.people[0].label, /Kind 1 bis 15/); });
for (const id of ['gdb80', 'mobility', 'companion-reduced']) {
  test(`${id}: Hauptsaison 11,20 EUR`, () => assert.equal(calc(undefined, undefined, [id]).cents, 1120));
  test(`${id}: Nebensaison 8 EUR`, () => assert.equal(calc('2026-11-10','2026-11-13',[id]).cents, 800));
}
for (const id of ['blind-help', 'companion-exempt']) test(`${id}: 0 EUR`, () => assert.equal(calc(undefined, undefined, [id]).cents, 0));
test('Gemischte Gruppe: regulär, ermäßigt, befreit, Kind = 27,20 EUR', () => { const r = calc(undefined, undefined, ['regular','gdb80','blind-help'],1); assert.equal(r.people.length,4); assert.equal(r.cents,2720); assert.equal(r.cents,r.people.reduce((s,p)=>s+p.cents,0)); });
test('Saisonwechsel gemischte Gruppe = 11,60 EUR', () => assert.equal(calc('2026-03-31','2026-04-01',['regular','mobility'],1).cents,1160));
test('Fehlende Anreise', () => assert.equal(calc('').field, 'arrival'));
test('Fehlende Abreise', () => assert.equal(calc(undefined,'').field, 'departure'));
test('Unmöglicher 30. Februar', () => assert.equal(calc('2026-02-30').field,'arrival'));
test('Identische Tage abgewiesen', () => assert.equal(calc('2026-06-10','2026-06-10').field,'departure'));
test('Abreise vor Anreise abgewiesen', () => assert.equal(calc('2026-06-10','2026-06-09').field,'departure'));
test('Keine Personen abgewiesen', () => assert.equal(calc(undefined,undefined,[],0).field,'adults'));
test('Negative Personenzahl abgewiesen', () => assert.equal(calc(undefined,undefined,[],-1).field,'adults'));
test('Gebrochene Personenzahl abgewiesen', () => assert.equal(calc(undefined,undefined,[],1.5).field,'adults'));
test('Unbekannte Kategorie abgewiesen', () => assert.equal(calc(undefined,undefined,['other']).field,'adults'));
test('2027 nicht freigegeben', () => { const r=calc('2027-01-07','2027-01-08'); assert.ok(r.unavailable); assert.equal(r.cents,undefined); });
test('Jahreswechsel mit fehlendem Tarif: keine Teilsumme', () => { const r=calc('2026-12-30','2027-01-02'); assert.ok(r.unavailable); assert.equal(r.cents,undefined); });
test('Unbekanntes Jahr auch bei befreiter Person ohne Summe', () => assert.ok(calc('2027-01-01','2027-01-02',['blind-help']).unavailable));
test('Langer Aufenthalt: Jahresobergrenzen, sichtbare Korrektur', () => { const r=calc('2026-06-01','2026-07-15',['regular','gdb80']); assert.equal(r.cents,19040); for(const p of r.people) assert.equal(p.cents,p.lines.reduce((s,l)=>s+l.cents,0)+p.caps.reduce((s,c)=>s+c.cents,0)); });
for (const [name, fn] of tests) { fn(); console.log(`✓ ${name}`); }
console.log(`${tests.length} Kurabgaben-Prüfungen erfolgreich.`);
