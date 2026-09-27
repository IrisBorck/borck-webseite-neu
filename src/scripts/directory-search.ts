import iFrameResize from 'iframe-resizer/js/iframeResizer';
import { readTravel, todayISO, travelURL, smoobuSearchURL } from '../lib/travel-search.mjs';
const form = document.querySelector<HTMLFormElement>('#directory-search')!;
const arrival = form.elements.namedItem('arrival') as HTMLInputElement;
const departure = form.elements.namedItem('departure') as HTMLInputElement;
const guests = form.elements.namedItem('guests') as HTMLSelectElement;
const results = document.querySelector<HTMLElement>('#live-results')!;
const summary = document.querySelector<HTMLElement>('#search-summary')!;
const frame = document.querySelector<HTMLIFrameElement>('#directory-booking')!;
const fallback = document.querySelector<HTMLAnchorElement>('#search-fallback')!;
const status = document.querySelector<HTMLElement>('#travel-status')!;
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-travel-link]')];
const cards = [...document.querySelectorAll<HTMLElement>('[data-directory-apartment]')];
const clear = document.querySelector<HTMLButtonElement>('#clear-search')!;
let initialized = false;
let timer: ReturnType<typeof setTimeout>;
const formatter = new Intl.DateTimeFormat('de-DE', {day:'2-digit', month:'2-digit', year:'numeric', timeZone:'UTC'});
const dateLabel = (s:string) => formatter.format(new Date(`${s}T12:00:00Z`));
arrival.min = todayISO();
departure.min = arrival.min;
function currentTravel() { return readTravel(new URLSearchParams(new FormData(form) as any)); }
function updateLinks(travel: ReturnType<typeof readTravel>) {
  links.forEach(link => { link.href = travelURL(link.href, travel, location.origin).href; });
}
function invalidate() {
  clearTimeout(timer);
  results.hidden = true;
  if (frame.getAttribute('src')) frame.src = 'about:blank';
  arrival.setCustomValidity(''); departure.setCustomValidity('');
  arrival.min = todayISO();
  departure.min = arrival.value || arrival.min;
  if (arrival.value && departure.value && departure.value <= arrival.value) departure.setCustomValidity('Die Abreise muss nach der Anreise liegen.');
  const travel = currentTravel();
  updateLinks(travel);
  history.replaceState(null, '', travelURL(location.href, travel, location.origin));
  status.textContent = travel ? 'Reisedaten ausgewählt. Bitte Preise und Verfügbarkeit prüfen.' : 'Wähle deinen Reisezeitraum und die Personenzahl.';
  cards.forEach(card => {
    card.classList.remove('capacity-mismatch');
    card.querySelector<HTMLElement>('[data-card-status]')!.textContent = 'Preis & Verfügbarkeit nach Reisedatum';
  });
}
function search(moveFocus = true) {
  arrival.min = todayISO();
  if (!form.reportValidity()) return;
  const travel = currentTravel();
  if (!travel) return;
  updateLinks(travel);
  history.replaceState(null, '', travelURL(location.href, travel, location.origin));
  summary.textContent = `${dateLabel(travel.arrival)} – ${dateLabel(travel.departure)} · ${travel.guests} ${travel.guests === 1 ? 'Person' : 'Personen'}`;
  status.textContent = 'Deine Auswahl ist in den Apartmentlinks hinterlegt.';
  cards.forEach(card => {
    const tooSmall = Number(card.dataset.guests) < travel.guests;
    card.classList.toggle('capacity-mismatch', tooSmall);
    card.querySelector<HTMLElement>('[data-card-status]')!.textContent = tooSmall
      ? `Für ${travel.guests} Personen zu klein · bis ${card.dataset.guests} Personen`
      : 'Aktuellen Preis & Verfügbarkeit oben prüfen';
  });
  results.hidden = false;
  fallback.href = smoobuSearchURL(travel).href;
  frame.src = fallback.href;
  if (!initialized) {
    initialized = true;
    iFrameResize({ checkOrigin: ['https://booking.smoobu.com'], heightCalculationMethod:'lowestElement', tolerance:0, waitForLoad:true, scrolling:'auto', resizedCallback:({height}:{height:number|string}) => {
      frame.style.height = `${Number(height) + (frame.clientWidth < 340 ? 16 : 0)}px`;
    } }, frame);
  }
  const loading = document.querySelector<HTMLElement>('#provider-status')!;
  loading.textContent = 'Die Live-Suche wird geladen. Prüfe die Ergebnisse direkt im Suchfenster.';
  clearTimeout(timer);
  timer = setTimeout(() => { loading.textContent = 'Falls keine Ergebnisse erscheinen, öffne die Suche über den Link unter dem Suchfenster.'; }, 15000);
  if (moveFocus) results.focus();
}
form.addEventListener('input', invalidate);
form.addEventListener('change', invalidate);
form.addEventListener('submit', event => { event.preventDefault(); search(); });
clear.addEventListener('click', () => { form.reset(); invalidate(); arrival.focus(); });
const restored = readTravel(new URLSearchParams(location.search));
if (restored) { arrival.value=restored.arrival; departure.value=restored.departure; guests.value=String(restored.guests); updateLinks(restored); status.textContent='Reisedaten übernommen. Bitte Preise und Verfügbarkeit erneut prüfen.'; }
window.addEventListener('pageshow', () => { if (!results.hidden) invalidate(); else updateLinks(currentTravel()); });
