import {randomUUID} from 'node:crypto';
import {accommodationQuote} from '../../src/lib/apartment-quotes.mjs';
import {calculateVisitorTax} from '../../src/lib/visitor-tax.mjs';
export const SCOPE=Object.freeze({id:'saphir-2026-11-09',apartmentId:133655,arrival:'2026-11-09',departure:'2026-11-14',adults:2,children:0});
export const RULE_VERSION='aquamarin-pilot-2026-10-02-v1';
export class BookingError extends Error {constructor(code,status=400){super(code);this.code=code;this.status=status;}}
export function requireThat(condition,code,status=400){if(!condition)throw new BookingError(code,status);}
export function exactKeys(o,keys){requireThat(o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>keys.includes(k)),'invalid_input');}
export function validateSelection(input){
 exactKeys(input,['arrival','departure','adults','children','extras','regularTax']);
 requireThat(input.arrival===SCOPE.arrival&&input.departure===SCOPE.departure&&input.adults===2&&input.children===0,'outside_test_scope');
 requireThat(input.regularTax===true,'tax_review_required');
 exactKeys(input.extras,['linen','towels','cot','chair','dogs']);
 const limits={linen:2,towels:8,cot:1,chair:1,dogs:2};
 for(const [key,max] of Object.entries(limits))requireThat(Number.isInteger(input.extras[key])&&input.extras[key]>=0&&input.extras[key]<=max,'invalid_extras');
 return {arrival:input.arrival,departure:input.departure,adults:2,children:0,regularTax:true,extras:Object.fromEntries(Object.keys(limits).map(k=>[k,input.extras[k]]))};
}
export function validateGuest(input){
 exactKeys(input,['firstName','lastName','email','phone','street','postalCode','city','country']);
 const guest={};
 for(const [key,max] of Object.entries({firstName:80,lastName:80,email:254,phone:40,street:160,postalCode:20,city:100,country:2})){
  requireThat(typeof input[key]==='string','invalid_guest');guest[key]=input[key].trim();
  requireThat(guest[key].length>0&&guest[key].length<=max&&!/[\x00-\x1f\x7f<>]/.test(guest[key]),'invalid_guest');
 }
 requireThat(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email),'invalid_email');
 requireThat(/^[+\d ()/.-]{5,40}$/.test(guest.phone),'invalid_phone');
 // First pilot restricted to a German billing address; no unverified country mapping.
 requireThat(guest.country==='DE','unsupported_country');return guest;
}
const addDays=(date,days)=>new Date(Date.parse(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
export function paymentPlan(total,arrival,now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const booked=['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');
 const balance=addDays(arrival,-30);
 if(booked>=balance)return [{kind:'full',cents:total,due:booked}];
 const deposit=Math.min(5000,total),usual=addDays(booked,7);
 return [{kind:'deposit',cents:deposit,due:usual<balance?usual:balance},{kind:'balance',cents:total-deposit,due:balance}].filter(x=>x.cents>0);
}
export function priceSnapshot(selection,baseCents,now=new Date()){
 requireThat(Number.isSafeInteger(baseCents)&&baseCents>0,'invalid_provider_price',502);
 const accommodation=accommodationQuote(baseCents,selection);
 const tax=calculateVisitorTax({arrival:selection.arrival,departure:selection.departure,categories:['regular','regular'],children:0});
 requireThat(Number.isSafeInteger(tax.cents),'tax_unavailable');
 const lines=[{key:'accommodation',label:'Übernachtungspreis',quantity:1,cents:baseCents},{key:'shortStay',label:'Kurzreisezuschlag',quantity:1,cents:accommodation.shortStayCents}];
 for(const [key,label,unit] of [['linen','Bettwäsche',1200],['towels','Handtuchpakete',900],['cot','Babybett',500],['chair','Hochstuhl',500]]){
  if(selection.extras[key])lines.push({key,label,quantity:selection.extras[key],cents:selection.extras[key]*unit});
 }
 if(selection.extras.dogs)lines.push({key:'dogs',label:'Hundepauschale',quantity:selection.extras.dogs,cents:4600+(selection.extras.dogs===2?2300:0)});
 lines.push({key:'visitorTax',label:`Kurabgabe · 2 Erwachsene / ${tax.days} Tage`,quantity:2,cents:tax.cents});
 const totalCents=lines.reduce((sum,x)=>sum+x.cents,0);
 requireThat(Number.isSafeInteger(totalCents),'invalid_total');
 return {ruleVersion:RULE_VERSION,currency:'EUR',baseCents,totalCents,lines,payments:paymentPlan(totalCents,selection.arrival,now),taxDays:tax.days,taxCollection:'included_in_transfer',calculatedAt:now.toISOString()};
}
export function newQuote(selection,baseCents,now=new Date()){
 return {id:randomUUID(),selection,price:priceSnapshot(selection,baseCents,now),createdAt:now.toISOString(),expiresAt:new Date(now.getTime()+10*60000).toISOString()};
}
export function reservationPayload(booking){
 const {selection:s,price:p}=booking.quote;const g=booking.guest;
 return {arrivalDate:s.arrival,departureDate:s.departure,apartmentId:SCOPE.apartmentId,channelId:70,firstName:g.firstName,lastName:g.lastName,email:g.email,phone:g.phone,address:{street:g.street,postalCode:g.postalCode,location:g.city},country:g.country,adults:2,children:0,language:'de',arrivalTime:'15:00',departureTime:'10:00',price:p.totalCents/100,priceStatus:0,prepayment:p.payments[0].cents/100,prepaymentStatus:0,notice:`Aquamarin booking ${booking.id}\nGesamtbetrag inkl. Extras und Kurabgabe; eigene Preisaufstellung maßgeblich. ${p.payments.map(x=>`${x.cents/100} EUR bis ${x.due}`).join('; ')}`};
}
export function matchesReservation(raw,booking,expectedChannelId){
 const p=reservationPayload(booking);
 return Number.isSafeInteger(expectedChannelId)&&expectedChannelId>0&&raw&&Number.isSafeInteger(Number(raw.id))&&Number(raw.id)>0&&(!booking.reservation_id||Number(raw.id)===booking.reservation_id)&&raw.type==='reservation'&&raw['is-blocked-booking']===false&&Number(raw.apartment?.id)===p.apartmentId&&Number(raw.channel?.id)===expectedChannelId&&raw.arrival===p.arrivalDate&&raw.departure===p.departureDate&&Number(raw.adults)===2&&Number(raw.children)===0&&raw.email?.trim().toLowerCase()===p.email.toLowerCase()&&raw.notice?.includes(`Aquamarin booking ${booking.id}`)&&typeof raw.price==='number'&&Math.abs(raw.price-p.price)<0.001&&Number(raw.prepayment)===p.prepayment;
}
