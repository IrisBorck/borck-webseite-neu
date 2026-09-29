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

// These age bands belong to the local tax calculation, not provider age bands.
export function readSaphirJourney(params, today = todayISO()) {
  const a = params.get('adults16'), c = params.get('children15');
  if (!/^[0-4]$/.test(a || '') || !/^[0-4]$/.test(c || '')) return null;
  const guests = Number(a) + Number(c);
  if (guests < 1 || guests > 4 || (params.has('guests') && params.get('guests') !== String(guests))) return null;
  const travel = saphirTravel(new URLSearchParams({arrival:params.get('arrival') || '',departure:params.get('departure') || '',guests:String(guests)}),today);
  return travel ? {...travel, adults16:Number(a), children15:Number(c)} : null;
}
export const emptyExtras = () => ({linen:0,towels:0,cot:0,chair:0,dogs:0});
export function selectedExtras(values, guests) {
  const limits = {linen:guests || 0,towels:8,cot:1,chair:1,dogs:2};
  return Object.fromEntries(Object.entries(limits).map(([key,max]) => [key,Number.isSafeInteger(values[key]) ? Math.max(0,Math.min(max,values[key])) : 0]));
}
export function extrasCents(e) {
  return e.linen*1200 + e.towels*900 + e.cot*500 + e.chair*500 + (e.dogs>=1 ? 4600 : 0) + (e.dogs===2 ? 2300 : 0);
}
