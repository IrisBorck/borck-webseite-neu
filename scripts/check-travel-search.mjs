import assert from 'node:assert/strict';
import {readTravel, travelURL, smoobuSearchURL, smoobuApartmentURL} from '../src/lib/travel-search.mjs';
const read = (a,d,g='2') => readTravel(new URLSearchParams({arrival:a,departure:d,guests:g}), '2026-09-27');
for(const [a,d,g] of [['2026-02-30','2026-10-10','2'],['2026-09-26','2026-09-29','2'],['2026-10-10','2026-10-10','2'],['2026-10-11','2026-10-10','2'],['2026-10-10','2026-10-11','2.5'],['2026-10-10','2026-10-11','6'],['2026-10-10','2026-10-11','0']]) assert.equal(read(a,d,g),null);
const travel=read('2026-12-30','2027-01-03','5');
assert.equal(travel.guests,5);
assert.ok(read('2028-02-29','2028-03-01'));
assert.equal(read('2027-02-29','2027-03-01'),null);
const link=travelURL('/apartments/saphir/?source=test#buchung', travel, 'https://example.com');
assert.equal(link.hash,'#buchung');
assert.equal(link.searchParams.get('source'),'test');
assert.deepEqual(readTravel(link.searchParams,'2026-09-27'),travel);
assert.equal(travelURL(link,null).searchParams.has('arrival'),false);
const provider=smoobuSearchURL(travel);
assert.equal(provider.origin,'https://booking.smoobu.com');
assert.equal(provider.searchParams.get('arrivalDate'),'30/12/2026');
assert.equal(provider.searchParams.get('departureDate'),'03/01/2027');
assert.equal(provider.searchParams.get('adults'),'5');
// Independent expected provider IDs catch wrong apartment routing.
for(const id of [133655,133683,133658,133656,133657,133660,133659]) {
 for(let guests=1;guests<=5;guests++) {
  const url=smoobuApartmentURL(id,{...travel,guests},'2026-09-27');
  assert.equal(url.origin,'https://booking.smoobu.com');
  assert.equal(url.pathname,'/9A40536');
  assert.deepEqual(Object.fromEntries(url.searchParams),{
   arrivalDate:'30/12/2026',departureDate:'03/01/2027',adults:String(guests),
   children:'0',loadForCurrentDate:'true',apartmentId:String(id),
  });
 }
 const empty=smoobuApartmentURL(String(id),null,'2026-09-27');
 assert.deepEqual(Object.fromEntries(empty.searchParams),{apartmentId:String(id)});
 for(const invalid of [
  {...travel,arrival:'2026-02-30'}, {...travel,arrival:'2026-09-26'},
  {...travel,departure:travel.arrival}, {...travel,departure:'2026-10-01'},
  {...travel,guests:0}, {...travel,guests:6}, {...travel,guests:2.5}, {},
 ]) assert.equal(smoobuApartmentURL(id,invalid,'2026-09-27').href,empty.href,'Invalid dates/person count must not leak into a provider form');
 assert.equal(smoobuApartmentURL(id,travel,'2027-01-04').href,empty.href,'Expired travel is removed');
}
for(const id of [159139,40536,0,'133655&adults=99',undefined]) assert.throws(()=>smoobuApartmentURL(id,travel,'2026-09-27'));
console.log('Reisedaten geprüft: Kalenderdaten, Jahreswechsel, Personen, Übergabe und Entfernung veralteter Parameter.');
