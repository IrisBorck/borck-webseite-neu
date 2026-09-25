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
    iFrameResize({ heightCalculationMethod: 'lowestElement', tolerance: 0, waitForLoad: true, checkOrigin: [new URL(frame.dataset.src!).origin], scrolling: 'auto', resizedCallback: ({ height }: { height: number }) => {
      // Bei sehr schmalen Frames können klassische 15-px-Scrollleisten sich
      // gegenseitig auslösen. Etwas Luft erhält die volle Anbieterbreite,
      // während die Inhaltshöhe weiterhin bei jeder Meldung neu gesetzt wird.
      frame.style.height = `${height + (frame.clientWidth < 340 ? 16 : 0)}px`;
    } }, frame);
    // Native Scrollbarkeit bleibt als Fallback erhalten, wenn Smoobu keine Höhe meldet.
  });
}
