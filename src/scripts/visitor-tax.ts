import { calculateVisitorTax } from '../lib/visitor-tax.mjs';
import { euro } from '../data/booking-policy.mjs';

for (const root of document.querySelectorAll<HTMLElement>('[data-tax-calculator]')) {
  const form = root.querySelector('form')!;
  const input = (id: string) => root.querySelector<HTMLInputElement>(`#tax-${id}`)!;
  const adults = input('adults'), children = input('children'), special = input('special');
  const personArea = root.querySelector<HTMLElement>('#tax-people')!;
  const fields = root.querySelector<HTMLElement>('[data-person-fields]')!;
  const template = root.querySelector<HTMLTemplateElement>('#tax-person-template')!;
  const feedback = root.querySelector<HTMLElement>('#tax-feedback')!;
  const result = root.querySelector<HTMLElement>('[data-tax-result]')!;
  const maxPeople = Number(root.dataset.maxPeople);
  const clearResult = () => { result.hidden = true; result.replaceChildren(); feedback.textContent = ''; form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid')); };
  const syncPeople = () => {
    const count = adults.valueAsNumber;
    personArea.hidden = !special.checked;
    special.setAttribute('aria-expanded', String(special.checked));
    if (!special.checked || !Number.isInteger(count) || count < 0 || count > maxPeople) { fields.replaceChildren(); return; }
    while (fields.children.length > count) fields.lastElementChild!.remove();
    while (fields.children.length < count) {
      const row = template.content.cloneNode(true) as DocumentFragment;
      row.querySelector('[data-person-number]')!.textContent = String(fields.children.length + 1);
      fields.append(row);
    }
  };
  form.addEventListener('input', clearResult);
  adults.addEventListener('input', syncPeople);
  special.addEventListener('change', syncPeople);
  form.addEventListener('change', clearResult);
  form.addEventListener('reset', () => {
    clearResult();
    // Reset löscht auch Standard-Personenzahlen und sensible Kategorien.
    queueMicrotask(() => { input('arrival').value = ''; input('departure').value = ''; adults.value = '0'; children.value = '0'; special.checked = false; syncPeople(); });
  });
  // Kein Submit ohne JavaScript: form-action 'none' in der Saphir-CSP.
  form.addEventListener('submit', event => {
    event.preventDefault(); clearResult();
    const adultCount = adults.valueAsNumber, childCount = children.valueAsNumber;
    const invalid = [adults, children].find(el => !Number.isInteger(el.valueAsNumber) || el.valueAsNumber < 0 || el.valueAsNumber > maxPeople);
    if (invalid || adultCount + childCount > maxPeople) {
      feedback.textContent = `Bitte gib gültige ganze Personenzahlen ein (insgesamt höchstens ${maxPeople}).`;
      (invalid || adults).setAttribute('aria-invalid', 'true'); (invalid || adults).focus(); return;
    }
    syncPeople();
    const categories = special.checked ? [...fields.querySelectorAll('select')].map(el => el.value) : Array(adultCount).fill('regular');
    const calculation = calculateVisitorTax({ arrival: input('arrival').value, departure: input('departure').value, categories, children: childCount });
    if (calculation.error) {
      feedback.textContent = calculation.error;
      const el = input(calculation.field); el.setAttribute('aria-invalid', 'true'); el.focus(); return;
    }
    if (calculation.unavailable) { feedback.textContent = calculation.unavailable; return; }
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
    feedback.textContent = `Berechnung abgeschlossen: ${euro(calculation.cents)} für ${calculation.days} Kurabgabe-Tage. Die Aufschlüsselung folgt darunter.`;
  });
  // Browserseitige Wiederherstellung sensibler Formularwerte ebenfalls verwerfen.
  window.addEventListener('pageshow', () => { special.checked = false; fields.replaceChildren(); syncPeople(); clearResult(); });
}
