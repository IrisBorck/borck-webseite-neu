import { validDate } from './travel-search.mjs';
import { bookingPolicy } from '../data/booking-policy.mjs';
export function stayNights(travel) {
  if (!validDate(travel.arrival) || !validDate(travel.departure)) throw Error('Invalid travel dates');
  const nights=(Date.parse(`${travel.departure}T00:00:00Z`)-Date.parse(`${travel.arrival}T00:00:00Z`))/86400000;
  if (!Number.isInteger(nights) || nights<1) throw Error('Invalid stay');
  return nights;
}
// Input is a verified accommodation price EXCLUDING short-stay fee,
// tourist tax and optional extras. Never feed a raw/unverified supplier total.
export function accommodationQuote(baseCents, travel) {
  if (!Number.isSafeInteger(baseCents) || baseCents<0) throw Error('Invalid price');
  const nights=stayNights(travel);
  const shortStayCents=nights<bookingPolicy.shortStayBelowNights?bookingPolicy.shortStayCents:0;
  const totalCents=baseCents+shortStayCents;
  if (!Number.isSafeInteger(totalCents)) throw Error('Invalid total');
  return {nights,baseCents,shortStayCents,totalCents};
}
