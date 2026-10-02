// Public travel data only. No guest identities, cookies or persistent storage.
import { searchApartments } from '../data/apartment-search.mjs';
export const travelKeys = ['arrival', 'departure', 'guests'];
export function todayISO() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
  return ['year','month','day'].map(k => parts.find(p => p.type === k).value).join('-');
}
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function readTravel(params, today = todayISO()) {
  const arrival = params.get('arrival'), departure = params.get('departure'), raw = params.get('guests');
  if (!validDate(arrival) || !validDate(departure) || arrival < today || departure <= arrival || !/^[1-5]$/.test(raw || '')) return null;
  return { arrival, departure, guests: Number(raw) };
}
export function travelURL(href, travel, origin) {
  const url = new URL(href, origin);
  for (const key of travelKeys) {
    if (travel) url.searchParams.set(key, String(travel[key]));
    else url.searchParams.delete(key);
  }
  return url;
}
// Parameter names/format taken from Smoobu's own result links and verified
// against the live engine on 2026-09-27. Never read another origin's iframe.
export function smoobuSearchURL(travel) {
  const url = new URL('https://booking.smoobu.com/9A40536');
  if (travel) {
    url.searchParams.set('arrivalDate', travel.arrival.split('-').reverse().join('/'));
    url.searchParams.set('departureDate', travel.departure.split('-').reverse().join('/'));
    url.searchParams.set('adults', String(travel.guests));
    url.searchParams.set('children', '0');
    url.searchParams.set('loadForCurrentDate', 'true');
  }
  return url;
}

// Shared by apartment booking forms. Only the seven configured provider IDs
// are allowed; invalid/expired travel falls back to an unfilled apartment form.
export function smoobuApartmentURL(apartmentId, travel, today = todayISO()) {
  const apartment = searchApartments.find(a => String(a.providerId) === String(apartmentId));
  if (!apartment) throw Error('Unknown apartment');
  const validated = travel ? readTravel(new URLSearchParams({
    arrival: travel.arrival, departure: travel.departure, guests: String(travel.guests),
  }), today) : null;
  const url = smoobuSearchURL(validated);
  // Keep the existing total-person mapping; no new adult/child selection.
  url.searchParams.set('apartmentId', String(apartment.providerId));
  return url;
}
