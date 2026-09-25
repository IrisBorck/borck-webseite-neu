// Misst nur das öffentliche Widget; kein Zugriff auf Buchungs- oder Rechnerwerte.
const content = document.querySelector('.calendarContent');
const loading = document.querySelector('#calendar-loading');
let scheduled = false;
let lastHeight = 0;
let lastWidth = 0;
function adaptToWidth() {
  const width = document.body.clientWidth;
  if (width === lastWidth) return;
  lastWidth = width;
  for (const widget of content.querySelectorAll('.multiCalendarWidget')) {
    const small = widget.getBoundingClientRect().width <= 500;
    widget.querySelectorAll('.fullCalendar, .btn-prev, .btn-next, .logo').forEach(el => {
      el.classList.toggle('smallDevices', small);
      el.classList.toggle('bigDevices', !small);
    });
    for (const table of widget.querySelectorAll('table')) {
      // Nur Zellgeometrie an die aktuelle Breite anpassen; keine Kalenderdaten.
      const size = Math.floor((table.closest('.singleCalendarWidget') || table.parentElement).getBoundingClientRect().width / 7);
      if (size <= 0) continue;
      table.querySelectorAll('td').forEach(cell => {
        for (const property of ['width', 'height', 'line-height']) cell.style.setProperty(property, `${size}px`, 'important');
      });
    }
  }
}
function report() {
  scheduled = false;
  adaptToWidth();
  const ready = Boolean(content.querySelector('table'));
  loading.hidden = ready;
  // Body-Inhalt messen, nicht documentElement.scrollHeight (sonst schrumpft
  // der Frame nach einem kürzeren Monat wegen seiner eigenen Höhe nicht).
  const height = Math.ceil(document.body.getBoundingClientRect().height);
  if (height !== lastHeight || ready) {
    lastHeight = height;
    window.parent.postMessage({ type: 'saphir-calendar-size', height, ready }, '*');
  }
}
function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(report); } }
function labelControls() {
  for (const [selector, label] of [['.btn-prev', 'Vorheriger Monat'], ['.btn-next', 'Nächster Monat']]) {
    content.querySelectorAll(selector).forEach(control => {
      control.setAttribute('aria-label', label);
      control.setAttribute('role', 'button');
      control.setAttribute('tabindex', '0');
    });
  }
}
content.addEventListener('keydown', event => {
  if ((event.key === ' ' || event.key === 'Enter') && event.target.closest('.btn-prev, .btn-next')) {
    event.preventDefault(); event.target.closest('.btn-prev, .btn-next').click();
  }
});
new MutationObserver(() => { lastWidth = 0; labelControls(); schedule(); }).observe(content, { childList: true, subtree: true });
new ResizeObserver(schedule).observe(document.body);
window.addEventListener('load', schedule);
window.addEventListener('resize', schedule);
document.fonts?.ready.then(schedule);
labelControls(); schedule();
