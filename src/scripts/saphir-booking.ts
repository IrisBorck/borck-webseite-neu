import { todayISO, travelURL, validDate, smoobuApartmentURL } from '../lib/travel-search.mjs';
import { saphirTravel, readSaphirJourney, saphirResult, compatibleTax, emptyExtras, selectedExtras, extrasCents } from '../lib/saphir-travel.mjs';
import { minimumStayMessage } from '../lib/apartment-quotes.mjs';
import { euro } from '../data/booking-policy.mjs';

type Journey = {arrival:string;departure:string;guests:number;adults16:number;children15:number};
const bar = document.querySelector<HTMLElement>('[data-saphir-booking]')!;
const form = document.querySelector<HTMLFormElement>('#saphir-travel-form')!;
const field = (name:string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;
const arrival = field('arrival') as HTMLInputElement, departure = field('departure') as HTMLInputElement;
const action = bar.querySelector<HTMLButtonElement>('[data-book-saphir]')!;
const submit = form.querySelector<HTMLButtonElement>('[type=submit]')!;
const summary = bar.querySelector<HTMLElement>('[data-travel-summary]')!;
const price = bar.querySelector<HTMLElement>('[data-stay-price]')!;
const status = bar.querySelector<HTMLElement>('[data-stay-status]')!;
const primary = form.querySelector<HTMLElement>('[data-primary-status]')!;
const groupNote = form.querySelector<HTMLElement>('[data-group-note]')!;
const breakdown = document.querySelector<HTMLElement>('[data-price-breakdown]')!;
const empty = document.querySelector<HTMLElement>('[data-price-empty]')!;
const extraFields = [...document.querySelectorAll<HTMLSelectElement>('[data-extra]')];
const extraNote = document.querySelector<HTMLElement>('[data-extras-note]')!;
let travel:Journey|null = null;
let quote:any = null, tax:any = null;
let extras = emptyExtras();
let request:AbortController|null = null;
let generation = 0, checked = false;
let accepted = new Map<string,string>();
const date = (value:string) => new Date(`${value}T12:00:00Z`).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'});
const emitTravel = () => document.dispatchEvent(new CustomEvent('saphir-travel-change',{detail:travel}));
const readForm = () => readSaphirJourney(new URLSearchParams(Object.fromEntries(['arrival','departure','adults16','children15'].map(k=>[k,field(k).value]))));
function showState(title:string,description:string) {
  price.textContent=title; status.textContent=description; primary.textContent=`${title} · ${description}`;
}
function renderPrice() {
  breakdown.hidden = !quote; empty.hidden = Boolean(quote);
  if (!quote) return;
  const write = (selector:string,value:string) => { breakdown.querySelector<HTMLElement>(selector)!.textContent=value; };
  const validTax = compatibleTax(tax,travel) && tax.adults16===travel?.adults16 && tax.children15===travel?.children15;
  write('[data-base-price]',euro(quote.baseCents)); write('[data-short-price]',euro(quote.shortStayCents));
  write('[data-extras-price]',euro(extrasCents(extras)));
  const names:Record<string,string>={linen:'Bettwäsche',towels:'Handtuchpaket',cot:'Babybett',chair:'Hochstuhl',dogs:'Hund'};
  write('[data-extras-description]',Object.entries(extras).filter(([,n])=>n>0).map(([key,n])=>`${n} × ${names[key]}`).join(' · ') || 'Keine ausgewählt');
  write('[data-tax-price]',validTax?euro(tax.cents):'Noch nicht berechenbar');
  write('[data-sum-label]',validTax?'Voraussichtliche Aufenthaltsgesamtkosten':'Zwischensumme ohne Kurabgabe');
  write('[data-price-sum]',euro(quote.totalCents+extrasCents(extras)+(validTax?tax.cents:0)));
}
function updateExtras() {
  const previous = extras.linen;
  if(travel)extras=selectedExtras(extras,travel.guests);
  for (const input of extraFields) {
    input.disabled=!travel;
    if (input.dataset.extra==='linen') for (const option of input.options) option.disabled=Number(option.value)>(travel?.guests || 0);
    input.value=String(extras[input.dataset.extra!]);
  }
  extraNote.textContent=previous!==extras.linen?'Die Bettwäschemenge wurde an deine kleinere Reisegruppe angepasst.':travel?'Deine Vorauswahl wird in der Kostenübersicht berücksichtigt. Bis zu acht Handtuchpakete sind auswählbar.':'Bitte zuerst oben deine Reisegruppe angeben.';
}
function updateURL(next:Journey|null) {
  const url=travelURL(location.href,next,location.origin);
  for(const key of ['adults16','children15']) { if(next) url.searchParams.set(key,String(next[key as keyof Journey])); else url.searchParams.delete(key); }
  history.replaceState(null,'',url);
}
function acceptJourney(next:Journey|null) {
  generation++;request?.abort();request=null;travel=next;quote=null;tax=null;checked=false;
  action.disabled=false;action.textContent='Preis prüfen'; submit.disabled=false;
  accepted=new Map(['arrival','departure','adults16','children15'].map(k=>[k,field(k).value]));
  if(next)groupNote.textContent=`Deine Reisegruppe: ${next.guests} Personen insgesamt.`;
  summary.textContent=next?`${date(next.arrival)} – ${date(next.departure)} · ${next.adults16} ab 16 / ${next.children15} bis 15 Jahre`:'Reisedaten vervollständigen';
  showState('Deine Auszeit',next?'Reisegruppe übernommen. Bitte Preis prüfen.':'Bitte Reisedaten und Reisegruppe vervollständigen.');
  empty.textContent='Prüfe oben deinen Reisezeitraum, um die Kostenübersicht zu sehen.';
  updateURL(next);updateExtras();renderPrice();emitTravel();
}
function validate() {
  arrival.min=todayISO();departure.min=arrival.value || arrival.min;
  departure.setCustomValidity(arrival.value && departure.value && departure.value<=arrival.value?'Die Abreise muss nach der Anreise liegen.':'');
  const a=field('adults16'),c=field('children15');
  const sum=Number(a.value)+Number(c.value);
  c.setCustomValidity(a.value!=='' && c.value!=='' && (sum<1 || sum>4)?'Bitte wähle insgesamt eine bis vier Personen.':'');
}
function applyForm() {
  validate();
  const next=readForm();
  const unchanged=JSON.stringify(next)===JSON.stringify(travel) && [...accepted].every(([k,v])=>field(k).value===v);
  if(unchanged)return true;
  const frame=document.querySelector<HTMLIFrameElement>('[data-booking-frame]')!;
  const newURL=smoobuApartmentURL('133655',next).href;
  if(frame.hasAttribute('src') && frame.src!==newURL && !window.confirm('Reisedaten ändern? Angaben, die du bereits im Buchungsformular gemacht hast, gehen dabei verloren.')) {
    for(const [key,value] of accepted)field(key).value=value;
    validate();return false;
  }
  acceptJourney(next);return true;
}
async function checkPrice() {
  if(!travel)return;
  const selected=travel,run=++generation;
  request?.abort();const controller=new AbortController();request=controller;
  action.disabled=true;submit.disabled=true;quote=null;checked=false;renderPrice();
  showState('Wird geprüft …','Preis & Verfügbarkeit');
  const timeout=setTimeout(()=>controller.abort(),12000);
  try {
    if(!bar.dataset.endpoint)throw Error('No endpoint');
    // Deliberately send only the existing API's public total-person contract.
    const url=travelURL(bar.dataset.endpoint,selected,location.origin);
    const response=await fetch(url,{signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error',headers:{Accept:'application/json'}});
    if(!response.ok)throw Error('Unavailable');
    const item=saphirResult(await response.json(),selected);
    if(run!==generation)return;
    checked=true;
    if(item.status==='available') {
      quote=item.quote;
      showState(euro(quote.totalCents),`Verfügbar · ${quote.nights} Nächte · Unterkunft${quote.shortStayCents ? ' inkl. 85 € Zuschlag' : ''} · zzgl. Extras / Kurabgabe`);
      action.textContent='Zur Buchung';
    } else {
      showState(item.status==='minimum_stay'?minimumStayMessage(item.minimumNights,selected):item.status==='unavailable'?'Zeitraum nicht verfügbar':item.status==='restriction'?'Nicht direkt buchbar':'Preis derzeit nicht abrufbar',item.status==='minimum_stay'?'Frag Iris, ob eine kürzere Buchung möglich ist.':'Prüfe einen anderen Zeitraum.');
      action.textContent='Zeitraum ändern';empty.textContent=price.textContent;
    }
    renderPrice();
  } catch {
    if(run!==generation)return;
    showState('Preis derzeit nicht abrufbar','Iris hilft: 0172 7952082');
    empty.textContent='Bitte versuche es erneut oder prüfe im Smoobu-Buchungsformular.';action.textContent='Erneut prüfen';
  } finally {clearTimeout(timeout);if(run===generation){action.disabled=false;submit.disabled=false;request=null;}}
}
function editTravel(){document.getElementById('saphir-price-entry')!.scrollIntoView({block:'start'});arrival.focus({preventScroll:true});}
bar.querySelector('[data-edit-travel]')!.addEventListener('click',editTravel);
form.addEventListener('input',validate);
form.addEventListener('change',applyForm);
form.addEventListener('submit',event=>{event.preventDefault();if(!applyForm() || !form.reportValidity() || !travel)return;void checkPrice();});
action.addEventListener('click',()=>{
  if(!travel || (checked && !quote)){editTravel();return;}
  if(!quote){void checkPrice();return;}
  const booking=document.querySelector<HTMLDetailsElement>('[data-booking]')!;booking.open=true;booking.scrollIntoView({block:'start'});booking.querySelector<HTMLElement>('summary')!.focus({preventScroll:true});
});
for(const input of extraFields)input.addEventListener('change',()=>{extras={...extras,[input.dataset.extra!]:Number(input.value)};updateExtras();renderPrice();});
document.addEventListener('saphir-tax-result',event=>{tax=(event as CustomEvent).detail;renderPrice();});
document.addEventListener('saphir-journey-request',emitTravel);
// Shared anchor and keyboard-focus clearance; no additional journey selector.
document.documentElement.classList.add('saphir-page');
const header=document.querySelector<HTMLElement>('.site-header')!;
const measure=()=>{
  const h=Math.ceil(header.getBoundingClientRect().height),b=getComputedStyle(bar).position==='sticky'?bar.getBoundingClientRect().height:0;
  document.documentElement.style.setProperty('--saphir-header-height',`${h}px`);
  document.documentElement.style.setProperty('--saphir-scroll-offset',`${Math.ceil(h+b+18)}px`);
};
new ResizeObserver(measure).observe(header);new ResizeObserver(measure).observe(bar);window.addEventListener('resize',measure);measure();
document.addEventListener('focusin',event=>{
  const element=event.target as HTMLElement;if(element.closest('dialog,.site-header,[data-saphir-booking]'))return;
  const limit=header.getBoundingClientRect().bottom+(getComputedStyle(bar).position==='sticky'?bar.getBoundingClientRect().height:0);
  const rect=element.getBoundingClientRect();if(rect.top<limit && rect.bottom>0)element.scrollIntoView({block:'center'});
});
function restore(){
  const params=new URLSearchParams(location.search),legacy=saphirTravel(params),next=readSaphirJourney(params);
  for(const key of ['arrival','departure'])field(key).value=validDate(params.get(key))?params.get(key)!:'';
  for(const key of ['adults16','children15'])field(key).value=next?String(next[key]):'';
  acceptJourney(next);
  if(!next && legacy){
    const url=travelURL(location.href,legacy,location.origin);history.replaceState(null,'',url);
    groupNote.textContent=`Übernommen: ${legacy.guests} Personen. Bitte gib einmal an, wie viele davon ab 16 bzw. bis 15 Jahre alt sind. Es wird keine Aufteilung angenommen.`;
  }
  validate();
}
window.addEventListener('pageshow',event=>{if(event.persisted)restore();});
restore();
