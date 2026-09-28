// Der bestehende Smoobu-Frame nutzt iframe-resizer. Gleiche Elternbibliothek wie
// BookingToolIframe.js, lokal ausgeliefert und auf den Anbieter-Origin begrenzt.
import iFrameResize from 'iframe-resizer/js/iframeResizer';
import { readTravel, smoobuApartmentURL } from '../lib/travel-search.mjs';
for (const details of document.querySelectorAll<HTMLDetailsElement>('[data-booking]')) {
  const frame = details.querySelector<HTMLIFrameElement>('[data-booking-frame]')!;
  const windowLink = details.querySelector<HTMLAnchorElement>('[data-booking-window]')!;
  const updateBookingURL = () => {
    const travel = readTravel(new URLSearchParams(location.search));
    const url = smoobuApartmentURL(details.dataset.apartmentId, travel).href;
    const changed = frame.dataset.src !== url;
    frame.dataset.src = url;
    if (changed && initialized) frame.src = url;
    windowLink.href = url;
  };
  let initialized = false;
  updateBookingURL();
  document.addEventListener('saphir-travel-change', updateBookingURL);
  window.addEventListener('pageshow', updateBookingURL);
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    if (initialized) {
      (frame as any).iFrameResizer?.resize();
      return;
    }
    updateBookingURL();
    initialized = true;
    frame.src = frame.dataset.src!;
    iFrameResize({ heightCalculationMethod: 'lowestElement', tolerance: 0, waitForLoad: true, checkOrigin: [new URL(frame.dataset.src!).origin], scrolling: 'auto', resizedCallback: ({ height }: { height: number | string }) => {
      // Bei sehr schmalen Frames können klassische 15-px-Scrollleisten sich
      // gegenseitig auslösen. Etwas Luft erhält die volle Anbieterbreite,
      // während die Inhaltshöhe weiterhin bei jeder Meldung neu gesetzt wird.
      frame.style.height = `${Number(height) + (frame.clientWidth < 340 ? 16 : 0)}px`;
    } }, frame);
    // Native Scrollbarkeit bleibt als Fallback erhalten, wenn Smoobu keine Höhe meldet.
  });
}
