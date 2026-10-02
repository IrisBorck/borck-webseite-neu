// Synthetic unit fixtures only. Not imported into the website or served as live data.
import assert from 'node:assert/strict';
import {accommodationQuote,minimumStayMessage} from '../src/lib/apartment-quotes.mjs';
import {normalizeAvailability,handleAvailability,signedHeaders} from '../server/availability.mjs';
import {searchApartments} from '../src/data/apartment-search.mjs';
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
const basis='major';
let items=normalizeAvailability(raw,travel,basis);
assert.equal(items.find(x=>x.id==='saphir').baseCents,33000);
assert.equal(items.find(x=>x.id==='opal').status,'minimum_stay');
assert.equal(items.find(x=>x.id==='rubin').status,'unavailable');
assert.equal(normalizeAvailability(raw,travel).find(x=>x.id==='saphir').status,'price_unknown');
const item=normalizeAvailability(raw,travel,basis)[0];
for(let repeat=0;repeat<3;repeat++) assert.equal(accommodationQuote(item.baseCents,travel).totalCents,41500,'Repeated rendering adds fee once');
assert.equal(normalizeAvailability({...raw,prices:{133655:{price:33000,currency:'EUR'}}},travel,'minor')[0].baseCents,33000);
const liveShape={availableApartments:[133655],prices:{133655:{price:420,currency:'€',priceElements:[{type:'basePrice',amount:420,currencyCode:'EUR'}]}},errorMessages:[]};
assert.equal(normalizeAvailability(liveShape,travel,'major')[0].baseCents,42000,'Live Smoobu euro symbol and empty error array are accepted');
const emptyLiveShape={availableApartments:[],prices:[],errorMessages:[]};
assert.equal(normalizeAvailability(emptyLiveShape,travel,'major').every(x=>x.status==='unavailable'),true,'Empty Smoobu arrays are accepted as no matches');
const uncertain=structuredClone(raw);uncertain.availableApartments=[133655];
assert.deepEqual(normalizeAvailability(uncertain,travel,basis).find(x=>x.id==='opal'),{id:'opal',status:'minimum_stay',minimumNights:5},'Preserve rule without asserting availability or returning a bookable price');
const shortStay={arrival:'2027-10-01',departure:'2027-10-04',guests:2};
for(const availableApartments of [[],[133655]]) {
 const result=normalizeAvailability({availableApartments,prices:[],errorMessages:{133655:{errorCode:401,minimumLengthOfStay:4}}},shortStay,basis)[0];
 assert.deepEqual(result,{id:'saphir',status:'minimum_stay',minimumNights:4});
 assert.equal(minimumStayMessage(result.minimumNights,shortStay),'Mindestaufenthalt: 4 Nächte · gewählt: 3 Nächte');
}
assert.equal(minimumStayMessage(4,{...shortStay,departure:'2027-10-02'}),'Mindestaufenthalt: 4 Nächte · gewählt: 1 Nacht');
for(const minimum of [undefined,null,'4',0,-1,2,3,4.5,Infinity,Number.MAX_SAFE_INTEGER+1]) {
 const result=normalizeAvailability({availableApartments:[],prices:[],errorMessages:{133655:{errorCode:401,minimumLengthOfStay:minimum}}},shortStay,basis)[0];
 assert.equal(result.status,'restriction','Missing, invalid or non-blocking minimum stays remain neutral');
 assert.throws(()=>minimumStayMessage(minimum,shortStay));
}
for(const errorCode of [400,402,403,404,999]) {
 const result=normalizeAvailability({availableApartments:[],prices:[],errorMessages:{133655:{errorCode,minimumLengthOfStay:4}}},shortStay,basis)[0];
 assert.equal(result.status,'restriction','Other rules must not be interpreted as minimum stay or occupancy');
}
const foreign=structuredClone(raw);foreign.prices[133655].currency='USD';assert.equal(normalizeAvailability(foreign,travel,basis)[0].status,'price_unknown');
assert.throws(()=>normalizeAvailability({title:'error'},travel,basis));
assert.equal(normalizeAvailability(raw,{...travel,guests:5},basis)[0].status,'capacity');
// Different prices and deliberately reversed provider order detect ID mix-ups.
const all={availableApartments:searchApartments.map(a=>a.providerId).reverse(),prices:Object.fromEntries(searchApartments.map((a,i)=>[a.providerId,{price:320+i*17.23,currency:'EUR'}])),errorMessages:{}};
for(let nights=1;nights<=5;nights++) for(let guests=1;guests<=5;guests++) {
 const stay={...travel,departure:`2027-10-0${nights+1}`,guests};
 const results=normalizeAvailability(all,stay,'major');
 results.forEach((result,i)=>{
  assert.equal(result.id,searchApartments[i].id);
  if(guests>searchApartments[i].guests) assert.equal(result.status,'capacity');
  else {
   assert.equal(result.status,'available');
   assert.equal(accommodationQuote(result.baseCents,stay).totalCents,32000+i*1723+(nights<5?8500:0));
  }
 });
}
let calls=0;
const url='https://example.test/availability?arrival=2027-10-01&departure=2027-10-04&guests=2';
const res=await handleAvailability(new Request(url),{},()=>{calls++;});
assert.equal(res.status,503);assert.equal(calls,0);
assert.equal((await handleAvailability(new Request(url,{method:'POST'}),{})).status,405);
assert.equal((await handleAvailability(new Request(url,{headers:{Origin:'https://other.test'}}),{})).status,403);
assert.equal((await handleAvailability(new Request(url+'&guests=5'),{})).status,400);
const hdr=signedHeaders('{}','test-key','test-secret');assert.ok(hdr['X-Signature']);assert.ok(!Object.values(hdr).includes('test-secret'));
const success=await handleAvailability(new Request(url),{SMOOBU_API_KEY:'test',SMOOBU_API_SECRET:'test',SMOOBU_CUSTOMER_ID:'1',SMOOBU_PRICE_UNIT:basis},async(endpoint,options)=>{
 assert.equal(endpoint,'https://login.smoobu.com/booking/checkApartmentAvailability');
 assert.equal(JSON.parse(options.body).apartments.length,7);
 assert.equal(options.redirect,'error');
 return new Response(JSON.stringify(raw),{headers:{'Content-Type':'application/json'}});
});
assert.equal(success.status,200);assert.equal((await success.json()).apartments[0].baseCents,33000);
const env={SMOOBU_API_KEY:'test',SMOOBU_API_SECRET:'test',SMOOBU_CUSTOMER_ID:'1',SMOOBU_PRICE_UNIT:'major'};
for(const failure of [async()=>new Response('{}',{status:429}),async()=>new Response('{broken'),async()=>{throw Error('network');}]) {
 const response=await handleAvailability(new Request(url),env,failure);
 assert.equal(response.status,502);assert.deepEqual(await response.json(),{error:'provider_unavailable'});
}
console.log('Preisregel, 1–6 Nächte, DST/Jahreswechsel, Doppelberechnung, unbekannte Preise, Mindestmietdauer und nur lesender API-Handler geprüft. Keine Live-Abfrage.');
