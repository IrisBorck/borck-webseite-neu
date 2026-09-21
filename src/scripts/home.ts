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
function filterApartments(filter: string, minGuests = 0) {
  let count = 0;
  cards.forEach(card => {
    const guests = Number(card.dataset.guests);
    const fits = minGuests > 0 ? guests >= minGuests : filter === 'zwei' ? guests <= 2 : filter === 'vier' ? guests <= 4 : filter === 'fuenf' ? guests <= 5 : ['terrasse', 'balkon'].includes(filter) ? card.dataset.type === filter : true;
    card.hidden = !fits; if (fits) count++;
  });
  filterButtons.forEach(b => b.setAttribute('aria-pressed', String(!minGuests && b.dataset.filter === filter)));
  status.textContent = `${count} ${count === 1 ? 'Apartment' : 'Apartments'} zur Auswahl${minGuests ? ` für ${minGuests} ${minGuests === 1 ? 'Person' : 'Personen'} · Verfügbarkeit noch nicht geprüft` : ''}`;
}
filterButtons.forEach(b => b.addEventListener('click', () => filterApartments(b.dataset.filter!)));
document.querySelectorAll<HTMLButtonElement>('[data-theme]').forEach(b => b.addEventListener('click', () => {
  const theme = b.dataset.theme!; filterApartments(theme === 'hund' ? 'alle' : theme);
  if (theme === 'hund') status.textContent = '7 Apartments · Hunde willkommen';
  document.querySelector('#apartments')!.scrollIntoView();
}));

// Kalenderdaten bewusst als lokale Kalendertage behandeln (keine DST-bedingte Nächteabweichung).
const arrival = document.querySelector<HTMLInputElement>('#arrival')!;
const departure = document.querySelector<HTMLInputElement>('#departure')!;
const result = document.querySelector<HTMLElement>('#booking-result')!;
const today = new Date();
const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
arrival.min = localDate(today);
const day = (value: string) => Date.parse(`${value}T12:00:00Z`);
function syncDates() {
  const minimum = arrival.value || arrival.min;
  departure.min = new Date(day(minimum) + 86400000).toISOString().slice(0,10);
  if (departure.value && departure.value < departure.min) departure.value = departure.min;
  departure.setCustomValidity(''); result.hidden = true;
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
let chosenApartment = '';
document.querySelector<HTMLFormElement>('#availability-form')!.addEventListener('submit', e => {
  e.preventDefault();
  const nights = Math.round((day(departure.value) - day(arrival.value)) / 86400000);
  if (!Number.isFinite(nights) || nights < 1) { departure.setCustomValidity('Bitte wähle eine Abreise nach der Anreise.'); departure.reportValidity(); return; }
  const guests = Number(document.querySelector<HTMLSelectElement>('#guests')!.value);
  const format = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString('de-DE');
  result.replaceChildren();
  const heading = document.createElement('strong');
  heading.textContent = `${chosenApartment ? chosenApartment + ' · ' : ''}${format(arrival.value)} – ${format(departure.value)} · ${nights} ${nights === 1 ? 'Nacht' : 'Nächte'} · ${guests} ${guests === 1 ? 'Person' : 'Personen'}`;
  const notice = document.createElement('p');
  notice.textContent = 'Deine Auswahl wurde nur in dieser Vorschau übernommen. Es wurde keine Verfügbarkeit abgefragt und keine Buchung angelegt. Preise und die geprüfte Buchungsanbindung folgen später.';
  const link = document.createElement('a'); link.className = 'text-link'; link.href = '#apartments'; link.textContent = 'Apartments nach Personenzahl ansehen →';
  link.addEventListener('click', () => filterApartments('alle', guests));
  result.append(heading, notice, link); result.hidden = false; result.focus({ preventScroll: true });
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
    chosenApartment = (event.currentTarget as HTMLElement).dataset.select || '';
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
