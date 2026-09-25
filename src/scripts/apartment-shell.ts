const nav = document.querySelector<HTMLElement>('#navigation')!;
const menu = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Menü öffnen'); }
menu.addEventListener('click', () => { const open = !nav.classList.contains('open'); nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen'); });
nav.querySelectorAll('a, [data-open]').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
window.matchMedia('(min-width: 1281px)').addEventListener('change', closeMenu);

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
});
