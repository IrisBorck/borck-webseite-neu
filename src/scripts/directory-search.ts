import { partyKeys, readParty, readSearchTravel, searchTravelURL, partySummary } from '../lib/search-party.mjs';
import { readTravel, todayISO, travelURL } from '../lib/travel-search.mjs';
import { accommodationQuote, minimumStayMessage, stayNights } from '../lib/apartment-quotes.mjs';
type Travel = {arrival:string;departure:string;guests:number;adults16:number;children3to15:number;infants2:number;totalPeople:number};
type Result = {id:string;status:string;baseCents?:number;currency?:string;minimumNights?:number};
const form=document.querySelector<HTMLFormElement>('#directory-search')!;
const arrival=form.elements.namedItem('arrival') as HTMLInputElement;
const departure=form.elements.namedItem('departure') as HTMLInputElement;
const partyField=(key:string)=>form.elements.namedItem(key) as HTMLInputElement;
const button=form.querySelector<HTMLButtonElement>('[type=submit]')!;
const status=document.querySelector<HTMLElement>('#travel-status')!;
const results=document.querySelector<HTMLElement>('#search-results')!;
const cards=[...document.querySelectorAll<HTMLElement>('[data-directory-apartment]')];
const links=[...document.querySelectorAll<HTMLAnchorElement>('[data-travel-link]')];
const euro=new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'});
let controller:AbortController|null=null;
let generation=0;
const currentTravel=()=>readSearchTravel(new URLSearchParams(new FormData(form) as any)) as Travel|null;
function cardState(card:HTMLElement,message:string,label='Apartment ansehen') {
  card.querySelector<HTMLElement>('[data-card-status]')!.textContent=message;
  card.querySelector<HTMLElement>('[data-card-status]')!.hidden=false;
  for(const selector of ['[data-card-price]','[data-card-fee]','[data-card-tax]','[data-card-contact]']) card.querySelector<HTMLElement>(selector)!.hidden=true;
  card.querySelector<HTMLElement>('[data-button-label]')!.textContent=label;
  card.querySelector<HTMLAnchorElement>('[data-travel-link]')!.setAttribute('aria-label',`${card.querySelector('h3')!.textContent}: ${label}`);
  card.classList.remove('capacity-mismatch','is-unavailable');
}
function updateLinks(travel:Travel|null) {links.forEach(link=>link.href=searchTravelURL(link.href,travel,location.origin).href);}
function invalidate() {
  generation++; controller?.abort(); controller=null;
  button.disabled=false; results.removeAttribute('aria-busy');
  arrival.min=todayISO(); departure.min=arrival.value||arrival.min;
  departure.setCustomValidity(arrival.value&&departure.value&&departure.value<=arrival.value?'Die Abreise muss nach der Anreise liegen.':'');
  const party=readParty(new URLSearchParams(new FormData(form) as any));
  partyField('children3to15').setCustomValidity(party ? '' : 'Bitte gib ganze, nicht negative Zahlen und insgesamt eine bis fünf Personen ab 3 Jahren an.');
  form.querySelector<HTMLElement>('[data-party-note]')!.textContent=party ? partySummary(party) : 'Bitte vervollständige deine Reisegruppe. Kleinkinder bis 2 Jahre zählen nicht zur regulären Maximalbelegung.';
  const travel=currentTravel(); updateLinks(travel);
  history.replaceState(null,'',searchTravelURL(location.href,travel,location.origin));
  status.textContent=travel?'Reisedaten ausgewählt. Bitte Preise und Verfügbarkeit prüfen.':'Wähle deinen Reisezeitraum und deine Reisegruppe.';
  cards.forEach(card=>cardState(card,'Preis & Verfügbarkeit nach Reisedatum','Ansehen & buchen'));
}
function render(card:HTMLElement,item:Result,travel:Travel) {
  if(item.status==='available') {
    const quote=accommodationQuote(item.baseCents,travel);
    cardState(card,'','Ansehen & buchen');
    card.querySelector<HTMLElement>('[data-card-status]')!.hidden=true;
    const price=card.querySelector<HTMLElement>('[data-card-price]')!;
    price.textContent=`${quote.nights} ${quote.nights===1?'Nacht':'Nächte'} · ${euro.format(quote.totalCents/100)}`;
    price.hidden=false;
    if(quote.shortStayCents) {
      const note=card.querySelector<HTMLElement>('[data-card-fee]')!;
      note.textContent='inkl. 85 € Kurzreisezuschlag'; note.hidden=false;
    }
    card.querySelector<HTMLElement>('[data-card-tax]')!.hidden=false;
  } else if(item.status==='unavailable') {
    cardState(card,'Gewünschter Zeitraum nicht verfügbar'); card.classList.add('is-unavailable');
  } else if(item.status==='minimum_stay') {
    cardState(card,minimumStayMessage(item.minimumNights,travel));
    card.querySelector<HTMLElement>('[data-card-contact]')!.hidden=false;
  } else if(item.status==='capacity') {
    cardState(card,`Für ${travel.guests} Personen ab 3 Jahren zu klein`); card.classList.add('capacity-mismatch');
  } else if(item.status==='restriction') {
    cardState(card,'Für diese Reisedaten nicht direkt buchbar');
  } else if(item.status==='price_unknown') {
    cardState(card,'Preis derzeit nicht abrufbar');
  } else cardState(card,'Verfügbarkeit derzeit nicht abrufbar');
}
function checkedResults(data:any,travel:Travel):Result[] {
  if(!data || data.travel?.arrival!==travel.arrival || data.travel?.departure!==travel.departure || data.travel?.guests!==travel.guests || !Array.isArray(data.apartments) || data.apartments.length!==cards.length) throw Error('Invalid response');
  const expected=new Set(cards.map(c=>c.dataset.directoryApartment));
  for(const item of data.apartments) {
    if(!item || !expected.delete(item.id) || !['available','unavailable','minimum_stay','capacity','restriction','price_unknown','unknown'].includes(item.status)) throw Error('Invalid result');
    if(item.status==='available' && (item.currency!=='EUR' || !Number.isSafeInteger(item.baseCents) || item.baseCents<0)) throw Error('Invalid price');
    if(item.status==='minimum_stay' && (!Number.isSafeInteger(item.minimumNights) || item.minimumNights<=stayNights(travel))) throw Error('Invalid minimum stay');
  }
  return data.apartments;
}
async function search() {
  arrival.min=todayISO();
  if(!form.reportValidity()) return;
  const travel=currentTravel(); if(!travel) return;
  controller?.abort(); const request=new AbortController(); controller=request;
  const run=++generation;
  updateLinks(travel); history.replaceState(null,'',searchTravelURL(location.href,travel,location.origin));
  cards.forEach(card=>cardState(card,'Wird geprüft …'));
  status.textContent='Preise und Verfügbarkeit werden geprüft …';
  results.setAttribute('aria-busy','true'); button.disabled=true;
  const timeout=setTimeout(()=>request.abort(),12000);
  try {
    const endpoint=form.dataset.endpoint;
    if(!endpoint) throw Error('Search is not configured');
    const url=travelURL(endpoint,travel,location.origin);
    const response=await fetch(url,{signal:request.signal,cache:'no-store',credentials:'omit',redirect:'error',headers:{Accept:'application/json'}});
    if(!response.ok) throw Error('Search unavailable');
    const items=checkedResults(await response.json(),travel);
    if(run!==generation) return;
    cards.forEach(card=>render(card,items.find(item=>item.id===card.dataset.directoryApartment)!,travel));
    const unknown=items.some(item=>['unknown','price_unknown'].includes(item.status));
    status.textContent=unknown?'Nicht alle Angaben konnten abgerufen werden.':'Preise und Verfügbarkeit wurden aktualisiert.';
  } catch {
    if(run!==generation) return;
    cards.forEach(card=>cardState(card,'Preis & Verfügbarkeit derzeit nicht abrufbar'));
    status.textContent='Die Suche ist gerade nicht möglich. Ruf Iris an: 0172 7952082.';
  } finally {
    clearTimeout(timeout);
    if(run===generation) {controller=null;button.disabled=false;results.removeAttribute('aria-busy');results.focus({preventScroll:true});}
  }
}
arrival.min=todayISO(); departure.min=arrival.min;
form.addEventListener('input',invalidate);
form.addEventListener('change',invalidate);
form.addEventListener('submit',event=>{event.preventDefault();void search();});
document.querySelector('#clear-search')!.addEventListener('click',()=>{form.reset();invalidate();arrival.focus();});
function restoreSearch() {
  const params=new URLSearchParams(location.search), restored=readSearchTravel(params);
  const legacy=!partyKeys.some(key=>params.has(key)) ? readTravel(params) : null;
  arrival.value=restored?.arrival || legacy?.arrival || ''; departure.value=restored?.departure || legacy?.departure || '';
  for(const key of partyKeys) partyField(key).value=restored ? String(restored[key]) : legacy ? '' : key==='adults16' ? '2' : '0';
  invalidate();
  if(legacy) form.querySelector<HTMLElement>('[data-party-note]')!.textContent=`Übernommen: ${legacy.guests} Personen. Bitte ergänze die drei Altersgruppen; es wird keine Aufteilung angenommen.`;
  if(restored) void search();
}
restoreSearch();
window.addEventListener('pageshow',event=>{if(event.persisted) restoreSearch();else updateLinks(currentTravel());});
window.addEventListener('pagehide',()=>{generation++;controller?.abort();controller=null;});
