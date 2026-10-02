import { readTravel, todayISO, travelURL } from './travel-search.mjs';

// Search age bands. guests always means regular occupancy, never all travellers.
export const partyKeys = ['adults16', 'children3to15', 'infants2'];
export function readParty(params) {
  const values = partyKeys.map(key => params.get(key));
  if (partyKeys.some(key => params.getAll(key).length !== 1) || values.some(v => !/^(0|[1-9]\d*)$/.test(v || ''))) return null;
  const [adults16, children3to15, infants2] = values.map(Number);
  const guests = adults16 + children3to15, totalPeople = guests + infants2;
  if (![adults16, children3to15, infants2, totalPeople].every(Number.isSafeInteger) || guests < 1 || guests > 5) return null;
  return {adults16, children3to15, infants2, guests, totalPeople};
}
export function readSearchTravel(params, today = todayISO()) {
  const party = readParty(params);
  if (!party || (params.has('guests') && (params.getAll('guests').length !== 1 || params.get('guests') !== String(party.guests)))) return null;
  const travel = readTravel(new URLSearchParams({arrival:params.get('arrival') || '',departure:params.get('departure') || '',guests:String(party.guests)}), today);
  return travel ? {...travel, ...party} : null;
}
export function searchTravelURL(href, travel, origin) {
  const url = travelURL(href, travel, origin);
  for (const key of partyKeys) {
    if (travel) url.searchParams.set(key, String(travel[key]));
    else url.searchParams.delete(key);
  }
  // The old Saphir age band must not be mistaken for this search's children.
  url.searchParams.delete('children15');
  return url;
}
export function partySummary(party) {
  return `${party.totalPeople} Reisende insgesamt · ${party.guests} reguläre Schlafplätze · ${party.infants2} ${party.infants2===1?'Kleinkind':'Kleinkinder'} bis 2 Jahre`;
}
