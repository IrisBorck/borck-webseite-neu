import assert from 'node:assert/strict';
import { readParty, readSearchTravel, searchTravelURL } from '../src/lib/search-party.mjs';
import { travelURL } from '../src/lib/travel-search.mjs';
import { readSaphirJourney } from '../src/lib/saphir-travel.mjs';
import { normalizeAvailability } from '../server/availability.mjs';
import { searchApartments } from '../src/data/apartment-search.mjs';

const params=(a,c,i)=>new URLSearchParams({arrival:'2026-10-05',departure:'2026-10-09',adults16:String(a),children3to15:String(c),infants2:String(i)});
const read=p=>readSearchTravel(p,'2026-09-30');
const raw={availableApartments:searchApartments.map(a=>a.providerId),prices:Object.fromEntries(searchApartments.map(a=>[a.providerId,{price:420,currency:'EUR'}])),errorMessages:[]};
for(const [guests,expected] of [[1,7],[2,7],[3,5],[4,5],[5,1]]) {
  for(const infants of [0,1,2,6]) {
    const p=params(Math.min(guests,2),Math.max(0,guests-2),infants),travel=read(p);
    assert.equal(travel.guests,guests);assert.equal(travel.totalPeople,guests+infants);
    // This invokes the existing server capacity/price normalization unchanged.
    const results=normalizeAvailability(raw,travel,'major');
    assert.equal(results.filter(a=>a.status==='available').length,expected);
    assert.equal(results.find(a=>a.id==='topas').status,'available');
    if(guests===3)assert.deepEqual(results.filter(a=>a.status==='capacity').map(a=>a.id),['bernstein','smaragd']);
    const api=travelURL('https://example.com/availability',travel);
    assert.deepEqual(Object.fromEntries(api.searchParams),{arrival:'2026-10-05',departure:'2026-10-09',guests:String(guests)});
    const link=searchTravelURL('https://example.com/apartments/saphir/?children15=9#buchung',travel);
    assert.deepEqual(read(link.searchParams),travel);assert.equal(link.hash,'#buchung');assert.equal(link.searchParams.has('children15'),false);
    assert.equal(searchTravelURL(link,null).search,'');
    assert.equal(readSaphirJourney(link.searchParams,'2026-09-30'),null,'New age bands must not silently prefill the old Saphir split');
  }
}
const example=read(params(2,3,1));assert.equal(example.guests,5);assert.equal(example.totalPeople,6);
for(const values of [[0,0,1],[5,1,0],[-1,2,0],[2,1.5,0],[2,0,-1],[2,0,0.5],[2,0,''],[2,0,'1e2'],[2,0,Number.MAX_SAFE_INTEGER]])assert.equal(read(params(...values)),null);
const partial=params(2,0,0);partial.delete('infants2');assert.equal(read(partial),null);
const duplicate=params(2,0,0);duplicate.append('adults16','1');assert.equal(read(duplicate),null);
const mismatch=params(2,3,1);mismatch.set('guests','6');assert.equal(read(mismatch),null);
assert.equal(read(new URLSearchParams({arrival:'2026-10-05',departure:'2026-10-09',guests:'2'})),null);
assert.ok(readParty(params(0,2,1)),'No additional adult-only restriction');
console.log('Drei Altersgruppen geprüft: 1–5 reguläre Personen, Kleinkinder ohne Kapazitätseinfluss, Topas 2+3+1, API-Vertrag, Links, Validierung und keine falsche Saphir-Altersübernahme.');
