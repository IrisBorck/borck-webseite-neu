export const bookingPolicy = {
  shortStayCents: 8500,
  shortStayBelowNights: 5,
  depositCents: 5000,
  depositDays: 7,
  balanceDays: 30,
  fourNightHint: 'Hinweis bei 4 Übernachtungen: Ab 5 Nächten entfällt der Kurzreisezuschlag von 85,00 €. Dadurch kann der Gesamtpreis für 5 Nächte günstiger sein. Vergleiche am besten beide Varianten.',
};
export const apartmentBooking = {
  saphir: {
    name: 'Saphir',
    apartmentId: '133655',
    // Exakte iframe-Adresse aus dem bestehenden Smoobu-Embed der Produktivseite.
    url: 'https://booking.smoobu.com/9A40536?apartmentId=133655',
    showFourNightHint: false,
  },
};
export const euro = cents => (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
