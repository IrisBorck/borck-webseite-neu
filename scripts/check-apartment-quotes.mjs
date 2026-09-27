// Synthetic unit fixtures only. Not imported into the website or served as live data.
import assert from 'node:assert/strict';
import {accommodationQuote} from '../src/lib/apartment-quotes.mjs';
import {normalizeAvailability,handleAvailability,signedHeaders} from '../server/availability.mjs';
const travel={arrival:'2027-10-01',departure:'2027-10-04',guests:2};
assert.equal(accommodationQuote(33000,travel).totalCents,41500);
for(let nights=1;nights<=6;nights++) {
 const q=accommodationQuote(33000,{...travel,departure:`2027-10-0${1+nights}`});
 assert.equal(q.shortStayCents,nights<5?8500:0);
}
for(const dates of [['2027-03-27','2027-03-29'],['2027-10-30','2027-11-01'],['2027-12-31','2028-01-02']]) assert.equal(accommodationQuote(10000,{arrival:dates[0],departure:dates[1]}).nights,2);
assert.throws(()=>accommodationQuote(-1,travel));
assert.throws(()=>accommodationQuote(1.2,travel));
const raw={availableApartments:[133655,133658],prices:{133655:{price:330,currency:'EUR'}},errorMessages:{133658:{errorCode:401,minimumLengthOfStay:5}}};
const basis={saphir:{unit:'major',shortStay:'excluded',accommodationOnly:true}};
let items=normalizeAvailability(raw,travel,basis);
assert.equal(items.find(x=>x.id==='saphir').baseCents,33000);
assert.equal(items.find(x=>x.id==='opal').status,'minimum_stay');
assert.equal(items.find(x=>x.id==='rubin').status,'unavailable');
assert.equal(normalizeAvailability(raw,travel).find(x=>x.id==='saphir').status,'price_unknown');
const included=structuredClone(raw);included.prices[133655].price=415;
const item=normalizeAvailability(included,travel,{saphir:{...basis.saphir,shortStay:'included'}})[0];
assert.equal(accommodationQuote(item.baseCents,travel).totalCents,41500,'Do not double-charge');
const uncertain=structuredClone(raw);uncertain.availableApartments=[133655];
assert.equal(normalizeAvailability(uncertain,travel,basis).find(x=>x.id==='opal').status,'restriction','Minimum-stay error alone does not prove free dates');
const foreign=structuredClone(raw);foreign.prices[133655].currency='USD';assert.equal(normalizeAvailability(foreign,travel,basis)[0].status,'price_unknown');
assert.throws(()=>normalizeAvailability({title:'error'},travel,basis));
assert.equal(normalizeAvailability(raw,{...travel,guests:5},basis)[0].status,'capacity');
let calls=0;
const url='https://example.test/availability?arrival=2027-10-01&departure=2027-10-04&guests=2';
const res=await handleAvailability(new Request(url),{},()=>{calls++;});
assert.equal(res.status,503);assert.equal(calls,0);
assert.equal((await handleAvailability(new Request(url,{method:'POST'}),{})).status,405);
assert.equal((await handleAvailability(new Request(url,{headers:{Origin:'https://other.test'}}),{})).status,403);
assert.equal((await handleAvailability(new Request(url+'&guests=5'),{})).status,400);
const hdr=signedHeaders('{}','test-key','test-secret');assert.ok(hdr['X-Signature']);assert.ok(!Object.values(hdr).includes('test-secret'));
const success=await handleAvailability(new Request(url),{SMOOBU_API_KEY:'test',SMOOBU_API_SECRET:'test',SMOOBU_CUSTOMER_ID:'1',SMOOBU_VERIFIED_PRICE_BASIS:JSON.stringify(basis)},async(endpoint,options)=>{
 assert.equal(endpoint,'https://login.smoobu.com/booking/checkApartmentAvailability');
 assert.equal(JSON.parse(options.body).apartments.length,7);
 assert.equal(options.redirect,'error');
 return new Response(JSON.stringify(raw),{headers:{'Content-Type':'application/json'}});
});
assert.equal(success.status,200);assert.equal((await success.json()).apartments[0].baseCents,33000);
console.log('Preisregel, 1–6 Nächte, DST/Jahreswechsel, Doppelberechnung, unbekannte Preise, Mindestmietdauer und nur lesender API-Handler geprüft. Keine Live-Abfrage.');
