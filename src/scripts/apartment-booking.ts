// Der bestehende Smoobu-Frame nutzt iframe-resizer. Gleiche Elternbibliothek wie
// BookingToolIframe.js, lokal ausgeliefert und auf den Anbieter-Origin begrenzt.
import iFrameResize from 'iframe-resizer/js/iframeResizer';
for (const details of document.querySelectorAll<HTMLDetailsElement>('[data-booking]')) {
  const frame = details.querySelector<HTMLIFrameElement>('[data-booking-frame]')!;
  let initialized = false;
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    if (initialized) {
      (frame as any).iFrameResizer?.resize();
      return;
    }
    initialized = true;
    frame.src = frame.dataset.src!;
    iFrameResize({ heightCalculationMethod: 'lowestElement', tolerance: 34, waitForLoad: true, checkOrigin: [new URL(frame.dataset.src!).origin], scrolling: 'auto' }, frame);
    // Native Scrollbarkeit bleibt als Fallback erhalten, wenn Smoobu keine Höhe meldet.
  });
}
