import { readTravel, todayISO } from './travel-search.mjs';
import { accommodationQuote } from './apartment-quotes.mjs';

// Only public journey data is shared. Age, disability and eligibility stay in the calculator.
export function saphirTravel(params, today = todayISO()) {
  const travel = readTravel(params, today);
  return travel && travel.guests <= 4 ? travel : null;
}
export const sameTravel = (a, b) => Boolean(a && b && a.arrival === b.arrival && a.departure === b.departure && a.guests === b.guests);
export function saphirResult(data, travel) {
  if (!sameTravel(data?.travel, travel) || !Array.isArray(data?.apartments)) throw Error('Invalid response');
  const matches = data.apartments.filter(a => a?.id === 'saphir');
  if (matches.length !== 1) throw Error('Missing or duplicate Saphir');
  const item = matches[0];
  if (!['available','unavailable','minimum_stay','capacity','restriction','price_unknown','unknown'].includes(item.status)) throw Error('Invalid status');
  if (item.status === 'available') {
    if (item.currency !== 'EUR') throw Error('Invalid currency');
    return {...item, quote: accommodationQuote(item.baseCents, travel)};
  }
  if (item.status === 'minimum_stay' && (!Number.isSafeInteger(item.minimumNights) || item.minimumNights <= accommodationQuote(0, travel).nights)) throw Error('Invalid minimum stay');
  return item;
}
export function compatibleTax(tax, travel) {
  return Boolean(travel && tax && tax.arrival === travel.arrival && tax.departure === travel.departure && tax.people === travel.guests && Number.isSafeInteger(tax.cents) && tax.cents >= 0);
}
