import { readTravel, todayISO, validDate } from '../lib/travel-search.mjs';

const nav = document.querySelector<HTMLElement>('#navigation')!;
const menu = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Menü öffnen'); }
menu.addEventListener('click', () => { const open = !nav.classList.contains('open'); nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen'); });
nav.querySelectorAll('a, [data-open]').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
window.matchMedia('(min-width: 1281px)').addEventListener('change', closeMenu);

const filterButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const cards = [...document.querySelectorAll<HTMLElement>('[data-apartment]')];
const status = document.querySelector<HTMLElement>('#filter-status')!;
function filterApartments(filter: string) {
  let count = 0;
  cards.forEach(card => {
    const guests = Number(card.dataset.guests);
    const fits = filter === 'zwei' ? guests <= 2 : filter === 'vier' ? guests <= 4 : filter === 'fuenf' ? guests <= 5 : ['terrasse', 'balkon'].includes(filter) ? card.dataset.type === filter : true;
    card.hidden = !fits; if (fits) count++;
  });
  filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
  status.textContent = `${count} ${count === 1 ? 'Apartment' : 'Apartments'} zur Auswahl`;
}
filterButtons.forEach(b => b.addEventListener('click', () => filterApartments(b.dataset.filter!)));
document.querySelectorAll<HTMLButtonElement>('[data-theme]').forEach(b => b.addEventListener('click', () => {
  const theme = b.dataset.theme!; filterApartments(theme === 'hund' ? 'alle' : theme);
  if (theme === 'hund') status.textContent = '7 Apartments · Hunde willkommen';
  document.querySelector('#apartments')!.scrollIntoView();
}));

// The homepage only forwards public travel data; the directory owns the API query.
const form = document.querySelector<HTMLFormElement>('#availability-form')!;
const arrival = document.querySelector<HTMLInputElement>('#arrival')!;
const departure = document.querySelector<HTMLInputElement>('#departure')!;
function syncDates() {
  arrival.min = todayISO();
  const minimum = validDate(arrival.value) ? arrival.value : arrival.min;
  departure.min = new Date(Date.parse(`${minimum}T12:00:00Z`) + 86400000).toISOString().slice(0,10);
  departure.setCustomValidity(arrival.value && departure.value && departure.value <= arrival.value ? 'Bitte wähle eine Abreise nach der Anreise.' : '');
}
arrival.addEventListener('input', syncDates);
arrival.addEventListener('change', syncDates);
departure.addEventListener('input', syncDates);
departure.addEventListener('change', syncDates);
syncDates();
// Reset native restored accordion state on initial load and back/forward navigation.
function closeFaqs() { document.querySelectorAll<HTMLDetailsElement>('.faq-list details').forEach(d => d.open = false); }
closeFaqs();
window.addEventListener('pageshow', () => { closeFaqs(); syncDates(); });
form.addEventListener('submit', e => {
  syncDates();
  if (!form.reportValidity() || !readTravel(new URLSearchParams(new FormData(form) as any))) e.preventDefault();
  // Valid submissions use the native GET form action, preserving browser Back.
});

let previousFocus: HTMLElement | null = null;
document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach(button => button.addEventListener('click', () => {
  const dialog = document.getElementById(button.dataset.open!) as HTMLDialogElement | null;
  if (!dialog) return;
  previousFocus = button; dialog.showModal(); document.body.style.overflow = 'hidden';
}));
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; previousFocus?.focus({ preventScroll: true }); });
  dialog.querySelector<HTMLAnchorElement>('.dialog-book')?.addEventListener('click', event => {
    dialog.close();
    // Nach dem nativen Fokus-Restore landet die Bedienung direkt im Datumsfeld.
    window.setTimeout(() => arrival.focus({ preventScroll: true }), 0);
  });
});

const bar = document.querySelector<HTMLElement>('.mobile-booking')!;
const hero = document.querySelector<HTMLElement>('.hero')!;
const booking = document.querySelector<HTMLElement>('#verfuegbarkeit')!;
const ending = document.querySelector<HTMLElement>('#abschluss')!;
const mobile = window.matchMedia('(max-width: 700px)');
let scheduled = false;
function updateBar() {
  scheduled = false;
  const b = booking.getBoundingClientRect();
  const bookingVisible = b.top < window.innerHeight && b.bottom > 68;
  const endingVisible = ending.getBoundingClientRect().top < window.innerHeight;
  bar.hidden = !mobile.matches || hero.getBoundingClientRect().bottom > 68 || bookingVisible || endingVisible || !!document.querySelector('dialog[open]');
}
function queueBar() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateBar); } }
window.addEventListener('scroll', queueBar, { passive: true });
window.addEventListener('resize', queueBar);
new MutationObserver(queueBar).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['open'] });
updateBar();
