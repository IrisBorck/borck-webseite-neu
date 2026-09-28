import { todayISO, travelURL } from '../lib/travel-search.mjs';
import { saphirTravel, saphirResult, compatibleTax } from '../lib/saphir-travel.mjs';
import { minimumStayMessage } from '../lib/apartment-quotes.mjs';
import { euro } from '../data/booking-policy.mjs';

type Travel = {arrival:string;departure:string;guests:number};
const bar = document.querySelector<HTMLElement>('[data-saphir-booking]')!;
const dialog = document.querySelector<HTMLDialogElement>('#saphir-travel-dialog')!;
const form = document.querySelector<HTMLFormElement>('#saphir-travel-form')!;
const arrival = form.elements.namedItem('arrival') as HTMLInputElement;
const departure = form.elements.namedItem('departure') as HTMLInputElement;
const guests = form.elements.namedItem('guests') as HTMLSelectElement;
const action = bar.querySelector<HTMLButtonElement>('[data-book-saphir]')!;
const edit = bar.querySelector<HTMLButtonElement>('[data-edit-travel]')!;
const summary = bar.querySelector<HTMLElement>('[data-travel-summary]')!;
const price = bar.querySelector<HTMLElement>('[data-stay-price]')!;
const status = bar.querySelector<HTMLElement>('[data-stay-status]')!;
const breakdown = document.querySelector<HTMLElement>('[data-price-breakdown]')!;
const empty = document.querySelector<HTMLElement>('[data-price-empty]')!;
let travel:Travel|null = null;
let quote:any = null;
let tax:any = null;
let request:AbortController|null = null;
let generation = 0;
let checked = false;
let opener:HTMLElement = edit;
const date = (value:string) => new Date(`${value}T12:00:00Z`).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'});
const emitTravel = () => document.dispatchEvent(new CustomEvent('saphir-travel-change',{detail:travel}));
function renderPrice() {
  breakdown.hidden = !quote; empty.hidden = Boolean(quote);
  if (!quote) return;
  const write = (selector:string, value:string) => { breakdown.querySelector<HTMLElement>(selector)!.textContent = value; };
  write('[data-base-price]',euro(quote.baseCents)); write('[data-short-price]',euro(quote.shortStayCents));
  const includeTax = compatibleTax(tax,travel);
  write('[data-tax-price]',includeTax ? euro(tax.cents) : 'Noch nicht berechnet');
  write('[data-sum-label]',includeTax ? 'Aufenthalt inkl. Kurabgabe, ohne Extras' : 'Aufenthalt ohne Kurabgabe und Extras');
  write('[data-price-sum]',euro(quote.totalCents + (includeTax ? tax.cents : 0)));
}
function setTravel(next:Travel|null) {
  generation++; request?.abort(); request = null;
  travel = next; quote = null; tax = null; checked = false; departure.setCustomValidity('');
  action.disabled = false; action.textContent = 'Preis prüfen';
  price.textContent = 'Deine Auszeit'; status.textContent = next ? 'Bitte aktuellen Preis prüfen.' : 'Wähle deinen Reisezeitraum.';
  empty.textContent = 'Wähle oben deinen Reisezeitraum, um den aktuellen Aufenthaltspreis zu prüfen.';
  if (next) { arrival.value = next.arrival; departure.value = next.departure; guests.value = String(next.guests); }
  summary.textContent = next ? `${date(next.arrival)} – ${date(next.departure)} · ${next.guests} ${next.guests===1?'Person':'Personen'}` : 'Reisezeitraum & Personen wählen';
  history.replaceState(null,'',travelURL(location.href,next,location.origin));
  renderPrice(); emitTravel();
}
async function checkPrice() {
  if (!travel) return;
  const selected = travel; const run = ++generation;
  request?.abort(); const controller = new AbortController(); request = controller;
  action.disabled = true; quote = null; checked = false; renderPrice();
  price.textContent = 'Wird geprüft …'; status.textContent = 'Preis & Verfügbarkeit';
  const timeout = setTimeout(()=>controller.abort(),12000);
  try {
    if (!bar.dataset.endpoint) throw Error('No endpoint');
    const url = travelURL(bar.dataset.endpoint,selected,location.origin);
    const response = await fetch(url,{signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error',headers:{Accept:'application/json'}});
    if (!response.ok) throw Error('Unavailable');
    const item = saphirResult(await response.json(),selected);
    if (run !== generation) return;
    checked = true;
    if (item.status === 'available') {
      quote = item.quote; price.textContent = euro(quote.totalCents);
      status.textContent = `Verfügbar · ${quote.nights} ${quote.nights===1?'Nacht':'Nächte'}${quote.shortStayCents?' · inkl. 85 € Zuschlag':''} · zzgl. Kurabgabe / Extras`;
      action.textContent = 'Zur Buchung';
    } else {
      price.textContent = item.status === 'minimum_stay' ? minimumStayMessage(item.minimumNights,selected) : item.status === 'unavailable' ? 'Zeitraum nicht verfügbar' : item.status === 'restriction' ? 'Nicht direkt buchbar' : 'Preis derzeit nicht abrufbar';
      status.textContent = item.status === 'minimum_stay' ? 'Frag Iris, ob eine kürzere Buchung möglich ist.' : 'Prüfe einen anderen Zeitraum.';
      action.textContent = 'Zeitraum ändern';
      empty.textContent = price.textContent;
    }
    renderPrice();
  } catch {
    if (run !== generation) return;
    price.textContent = 'Preis derzeit nicht abrufbar'; status.textContent = 'Iris hilft: 0172 7952082';
    empty.textContent = 'Preis und Verfügbarkeit sind gerade nicht abrufbar. Bitte prüfe im Buchungsformular oder ruf Iris an.';
    action.textContent = 'Erneut prüfen';
  } finally {
    clearTimeout(timeout);
    if (run === generation) { action.disabled = false; request = null; }
  }
}
function openTravel(from:HTMLElement) {
  opener = from; arrival.min = todayISO(); departure.min = arrival.value || arrival.min;
  dialog.showModal(); document.body.style.overflow = 'hidden'; arrival.focus();
}
edit.addEventListener('click',()=>openTravel(edit));
dialog.addEventListener('close',()=>opener.focus({preventScroll:true}));
form.addEventListener('input',()=>{
  departure.min = arrival.value || todayISO();
  departure.setCustomValidity(arrival.value && departure.value && departure.value<=arrival.value ? 'Die Abreise muss nach der Anreise liegen.' : '');
});
form.addEventListener('submit',event=>{
  event.preventDefault(); if (!form.reportValidity()) return;
  const next = saphirTravel(new URLSearchParams({arrival:arrival.value,departure:departure.value,guests:guests.value}));
  if (!next) return;
  setTravel(next); dialog.close(); void checkPrice();
});
action.addEventListener('click',()=>{
  if (!travel || (checked && !quote)) { openTravel(action); return; }
  if (!quote) { void checkPrice(); return; }
  const booking = document.querySelector<HTMLDetailsElement>('[data-booking]')!;
  booking.open = true;
  booking.scrollIntoView({block:'start'});
  booking.querySelector<HTMLElement>('summary')!.focus({preventScroll:true});
});
document.addEventListener('saphir-tax-result',event=>{ tax = (event as CustomEvent).detail; renderPrice(); });
// Date edits in the calculator update the same journey; eligibility never leaves it.
document.addEventListener('saphir-tax-dates',event=>{
  const dates = (event as CustomEvent).detail;
  const next = saphirTravel(new URLSearchParams({...dates,guests:String(travel?.guests || guests.value)}));
  if (next) { setTravel(next); void checkPrice(); }
  else { setTravel(null); arrival.value = dates.arrival; departure.value = dates.departure; }
});
// Reserve the actual combined header/bar height for anchors and keyboard focus.
document.documentElement.classList.add('saphir-page');
const header = document.querySelector<HTMLElement>('.site-header')!;
const measure = () => {
  document.documentElement.style.setProperty('--saphir-header-height',`${Math.ceil(header.getBoundingClientRect().height)}px`);
  const sticky = getComputedStyle(bar).position === 'sticky';
  document.documentElement.style.setProperty('--saphir-scroll-offset',`${Math.ceil(header.getBoundingClientRect().height+(sticky?bar.getBoundingClientRect().height:0)+18)}px`);
};
new ResizeObserver(measure).observe(header); new ResizeObserver(measure).observe(bar); window.addEventListener('resize',measure); measure();
document.addEventListener('focusin',event=>{
  const element = event.target as HTMLElement;
  if (element.closest('dialog,.site-header,[data-saphir-booking]')) return;
  const limit = header.getBoundingClientRect().bottom+(getComputedStyle(bar).position==='sticky'?bar.getBoundingClientRect().height:0);
  const rect = element.getBoundingClientRect();
  if (rect.top < limit && rect.bottom > 0) element.scrollIntoView({block:'center'});
});
const restore = () => { setTravel(saphirTravel(new URLSearchParams(location.search))); if (travel) void checkPrice(); };
window.addEventListener('pageshow',event=>{ if (event.persisted) restore(); });
restore();
