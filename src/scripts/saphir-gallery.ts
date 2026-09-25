// Gemeinsame Bedienung importieren: die Galerie bleibt als externes Modul CSP-konform.
import './apartment-shell';

const thumbnails = [...document.querySelectorAll<HTMLButtonElement>('[data-photo]')];
const mainImage = document.querySelector<HTMLImageElement>('#gallery-photo')!;
const viewerImage = document.querySelector<HTMLImageElement>('#viewer-image')!;
const viewer = document.querySelector<HTMLDialogElement>('#photo-viewer')!;
const opener = document.querySelector<HTMLButtonElement>('[data-gallery-open]')!;
let current = 0;
function showPhoto(index: number) {
  current = (index + thumbnails.length) % thumbnails.length;
  const photo = thumbnails[current];
  for (const img of [mainImage, viewerImage]) { img.src = photo.dataset.src!; img.alt = photo.dataset.alt!; }
  thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
  document.querySelectorAll('[data-photo-count]').forEach(el => { el.textContent = `Bild ${current + 1} von ${thumbnails.length}`; });
  document.querySelectorAll('[data-photo-description]').forEach(el => { el.textContent = photo.dataset.alt!; });
  document.getElementById('viewer-description')!.textContent = photo.dataset.alt!;
}
thumbnails.forEach((button, i) => button.addEventListener('click', () => showPhoto(i)));
document.querySelectorAll('.gallery-prev').forEach(button => button.addEventListener('click', () => showPhoto(current - 1)));
document.querySelectorAll('.gallery-next').forEach(button => button.addEventListener('click', () => showPhoto(current + 1)));
opener.addEventListener('click', () => { viewer.showModal(); document.body.style.overflow = 'hidden'; });
viewer.addEventListener('close', () => { document.body.style.overflow = ''; opener.focus({ preventScroll: true }); });
for (const area of [document.querySelector('.gallery')!, viewer]) area.addEventListener('keydown', (event) => {
  const e = event as KeyboardEvent;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); showPhoto(current + (e.key === 'ArrowRight' ? 1 : -1)); }
});
const calendar = document.querySelector<HTMLIFrameElement>('#saphir-calendar')!;
window.addEventListener('message', event => {
  if (event.source !== calendar.contentWindow || event.data?.type !== 'saphir-calendar-ready') return;
  const status = document.getElementById('calendar-status')!;
  status.textContent = 'Original-Belegungskalender von Smoobu · kein Buchungsformular.';
});
