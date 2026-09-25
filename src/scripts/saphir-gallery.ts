import './apartment-shell';

const photos = [...document.querySelectorAll<HTMLElement>('[data-photo-entry]')];
const thumbnails = [...document.querySelectorAll<HTMLButtonElement>('[data-photo]')];
const mainImage = document.querySelector<HTMLImageElement>('#gallery-photo')!;
const viewerImage = document.querySelector<HTMLImageElement>('#viewer-image')!;
const viewer = document.querySelector<HTMLDialogElement>('#photo-viewer')!;
const opener = document.querySelector<HTMLButtonElement>('[data-gallery-open]')!;
let current = 0;
let returnFocus: HTMLElement = opener;
function showPhoto(index: number) {
  current = (index + photos.length) % photos.length;
  const photo = photos[current];
  for (const img of [mainImage, viewerImage]) {
    img.src = photo.dataset.src!; img.alt = photo.dataset.alt!;
    img.width = Number(photo.dataset.width); img.height = Number(photo.dataset.height);
  }
  thumbnails.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.photo) === current)));
  document.querySelectorAll('[data-photo-count]').forEach(el => { el.textContent = `${current + 1} / ${photos.length}`; });
  document.querySelectorAll('[data-photo-description]').forEach(el => { el.textContent = `Bild ${current + 1} von ${photos.length}: ${photo.dataset.alt!}`; });
}
function openViewer(button: HTMLElement) { returnFocus = button; viewer.showModal(); document.body.style.overflow = 'hidden'; }
thumbnails.forEach(button => button.addEventListener('click', () => { showPhoto(Number(button.dataset.photo)); openViewer(button); }));
document.querySelectorAll('.gallery-prev').forEach(button => button.addEventListener('click', () => showPhoto(current - 1)));
document.querySelectorAll('.gallery-next').forEach(button => button.addEventListener('click', () => showPhoto(current + 1)));
opener.addEventListener('click', () => openViewer(opener));
const allPhotos = document.querySelector<HTMLButtonElement>('[data-gallery-all]')!;
allPhotos.addEventListener('click', () => openViewer(allPhotos));
viewer.addEventListener('close', () => { document.body.style.overflow = ''; returnFocus.focus({ preventScroll: true }); });
for (const area of [document.querySelector('.gallery')!, viewer]) area.addEventListener('keydown', (event) => {
  const e = event as KeyboardEvent;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); showPhoto(current + (e.key === 'ArrowRight' ? 1 : -1)); }
});
const calendar = document.querySelector<HTMLIFrameElement>('#saphir-calendar')!;
window.addEventListener('message', event => {
  // Das sandboxed Widget hat absichtlich einen opaken Origin. Die genaue
  // sendende Window-Referenz ist daher die entscheidende Vertrauensgrenze.
  if (event.source !== calendar.contentWindow || event.data?.type !== 'saphir-calendar-size') return;
  const { height, ready } = event.data;
  if (typeof height !== 'number' || !Number.isFinite(height) || height < 30 || height > 10000) return;
  calendar.height = String(Math.ceil(height));
  if (ready === true) document.getElementById('calendar-status')!.textContent = 'Original-Belegungskalender von Smoobu. Preise und Buchung findest du im Buchungsformular.';
});
