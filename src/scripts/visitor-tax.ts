import { calculateVisitorTax } from '../lib/visitor-tax.mjs';
import { readSaphirJourney } from '../lib/saphir-travel.mjs';
import { euro } from '../data/booking-policy.mjs';

for (const root of document.querySelectorAll<HTMLElement>('[data-tax-calculator]')) {
  const form = root.querySelector('form')!;
  const special = root.querySelector<HTMLInputElement>('#tax-special')!;
  const personArea = root.querySelector<HTMLElement>('#tax-people')!;
  const fields = root.querySelector<HTMLElement>('[data-person-fields]')!;
  const template = root.querySelector<HTMLTemplateElement>('#tax-person-template')!;
  const feedback = root.querySelector<HTMLElement>('#tax-feedback')!;
  const result = root.querySelector<HTMLElement>('[data-tax-result]')!;
  const note = root.querySelector<HTMLElement>('[data-tax-travel-note]')!;
  let journey = readSaphirJourney(new URLSearchParams(location.search));
  function clearResult() {
    result.hidden = true; result.replaceChildren(); feedback.textContent = '';
    document.dispatchEvent(new CustomEvent('saphir-tax-result', {detail:null}));
  }
  function syncPeople() {
    personArea.hidden = !special.checked;
    special.setAttribute('aria-expanded', String(special.checked));
    const count = journey?.adults16 || 0;
    if (!special.checked || !journey) { fields.replaceChildren(); return; }
    while (fields.children.length > count) fields.lastElementChild!.remove();
    while (fields.children.length < count) {
      const row = template.content.cloneNode(true) as DocumentFragment;
      row.querySelector('[data-person-number]')!.textContent = String(fields.children.length + 1);
      fields.append(row);
    }
  }
  function calculate() {
    clearResult(); syncPeople();
    if (!journey) { note.textContent = 'Bitte vervollständige oben Reisedaten und Reisegruppe. Es wird noch keine Kurabgabe eingerechnet.'; return; }
    note.textContent = `${journey.arrival.split('-').reverse().join('.')} – ${journey.departure.split('-').reverse().join('.')} · ${journey.adults16} ab 16 Jahren · ${journey.children15} bis 15 Jahre`;
    const categories = special.checked ? [...fields.querySelectorAll('select')].map(el=>el.value) : Array(journey.adults16).fill('regular');
    const calculation = calculateVisitorTax({arrival:journey.arrival,departure:journey.departure,categories,children:journey.children15});
    if (calculation.error || calculation.unavailable) { feedback.textContent = calculation.error || calculation.unavailable; return; }
    const element = (tag: string, text: string, className?: string) => { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; };
    const date = (s: string) => new Date(`${s}T00:00:00Z`).toLocaleDateString('de-DE', { timeZone: 'UTC' });
    const title = element('h3', `Voraussichtliche Kurabgabe: ${euro(calculation.cents)}`); title.id = 'tax-result-title';
    result.append(title, element('p', `${date(calculation.arrival)} – ${date(calculation.departure)} · ${calculation.nights} Übernachtungen · ${calculation.days} Kurabgabe-Tage`));
    for (const person of calculation.people) {
      result.append(element('h4', `${person.label}: ${euro(person.cents)}`));
      const list = document.createElement('ul');
      for (const line of person.lines) list.append(element('li', `${line.days} Kurabgabe-Tage ${line.season === 'high' ? 'Hauptsaison' : 'Nebensaison'} ${line.year} × ${euro(line.rate)} = ${euro(line.cents)}`));
      for (const cap of person.caps) list.append(element('li', `Begrenzung auf die Jahreskurabgabe ${cap.year} (${euro(cap.cap)}): ${euro(cap.cents)}`));
      if (list.children.length) result.append(list);
    }
    result.append(element('p', `Gesamt: ${euro(calculation.cents)}`, 'total'), element('p', 'Berechnung für diesen Aufenthalt. Bereits gezahlte Kurabgaben im selben Kalenderjahr oder weitere besondere Befreiungen bitte mit Iris klären.'));
    result.hidden = false;
    // No eligibility or medical categories leave the calculator.
    document.dispatchEvent(new CustomEvent('saphir-tax-result', {detail:{arrival:journey.arrival,departure:journey.departure,people:journey.guests,adults16:journey.adults16,children15:journey.children15,cents:calculation.cents}}));
    feedback.textContent = `Berechnet: ${euro(calculation.cents)} für ${calculation.days} Kurabgabe-Tage.`;
  }
  document.addEventListener('saphir-travel-change',event=>{
    const next = (event as CustomEvent).detail;
    if (next?.adults16 !== journey?.adults16 || next?.children15 !== journey?.children15) { special.checked = false; fields.replaceChildren(); }
    journey = next; calculate();
  });
  form.addEventListener('change',calculate);
  form.addEventListener('submit',event=>{event.preventDefault();calculate();});
  form.addEventListener('reset',()=>queueMicrotask(()=>{special.checked=false;fields.replaceChildren();calculate();}));
  window.addEventListener('pageshow',event=>{if(event.persisted){special.checked=false;fields.replaceChildren();calculate();}});
  calculate();
  document.dispatchEvent(new CustomEvent('saphir-journey-request'));
}
