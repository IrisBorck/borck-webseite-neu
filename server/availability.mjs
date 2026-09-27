// Undeployed read-only API handler. Requires a secret-capable server runtime.
// No booking/create/update API is present. Never imported by client code.
import {createHash, createHmac, randomUUID} from 'node:crypto';
import {readTravel} from '../src/lib/travel-search.mjs';
import {stayNights} from '../src/lib/apartment-quotes.mjs';
import {searchApartments} from '../src/data/apartment-search.mjs';
const upstream='https://login.smoobu.com/booking/checkApartmentAvailability';
const object = x => x && typeof x==='object' && !Array.isArray(x);
export function normalizeAvailability(raw, travel, verifiedPriceBasis={}) {
  if (!object(raw) || !Array.isArray(raw.availableApartments) || !raw.availableApartments.every(Number.isSafeInteger) || !object(raw.prices) || !object(raw.errorMessages)) throw Error('Invalid provider response');
  const available=new Set(raw.availableApartments);
  return searchApartments.map(a=>{
    const item={id:a.id,status:'unknown'};
    if (travel.guests>a.guests) return {...item,status:'capacity'};
    const error=raw.errorMessages[a.providerId];
    if (error) {
      // Do not turn restrictions on arrival/lead time/buffer into booked dates.
      if (error.errorCode===401 && Number.isInteger(error.minimumLengthOfStay) && error.minimumLengthOfStay>stayNights(travel) && available.has(a.providerId)) return {...item,status:'minimum_stay',minimumNights:error.minimumLengthOfStay};
      return {...item,status:'restriction'};
    }
    if (!available.has(a.providerId)) return {...item,status:'unavailable'};
    const price=raw.prices[a.providerId];
    const basis=verifiedPriceBasis[a.id];
    // Units and included price components MUST be checked for each apartment
    // against the real account before enabling price output. Never infer them.
    if (!object(basis) || !['major','minor'].includes(basis.unit) || !['excluded','included'].includes(basis.shortStay) || basis.accommodationOnly!==true || !price || price.currency!=='EUR' || typeof price.price!=='number' || !Number.isFinite(price.price) || price.price<0) return {...item,status:'price_unknown'};
    const amount=price.price*(basis.unit==='major'?100:1);
    const cents=Math.round(amount);
    if (!Number.isSafeInteger(cents) || Math.abs(amount-cents)>0.00001) return {...item,status:'price_unknown'};
    const included=stayNights(travel)<5 && basis.shortStay==='included'?8500:0;
    if(cents<included) return {...item,status:'price_unknown'};
    return {...item,status:'available',baseCents:cents-included,currency:'EUR'};
  });
}
export function signedHeaders(body,key,secret) {
  const timestamp=new Date().toISOString();
  const nonce=randomUUID();
  const digest=createHash('sha256').update(body).digest('hex');
  const canonical=['POST',new URL(upstream).pathname,'',timestamp,nonce,digest,key].join('\n');
  return {'Content-Type':'application/json','X-API-Key':key,'X-Timestamp':timestamp,'X-Nonce':nonce,'X-Signature':createHmac('sha256',secret).update(canonical).digest('base64')};
}
export async function handleAvailability(request,env,fetchImpl=fetch) {
  const origin=request.headers.get('Origin');
  const allowed='https://irisborck.github.io';
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
  if (origin && origin!==allowed) return new Response(null,{status:403,headers});
  if (origin===allowed) headers['Access-Control-Allow-Origin']=allowed;
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(request.method!=='GET') return reply({error:'method_not_allowed'},405);
  const url=new URL(request.url);
  if(url.pathname!=='/availability') return reply({error:'not_found'},404);
  if([...url.searchParams.keys()].some(k=>!['arrival','departure','guests'].includes(k)) || ['arrival','departure','guests'].some(k=>url.searchParams.getAll(k).length!==1)) return reply({error:'invalid_request'},400);
  const travel=readTravel(url.searchParams);
  if(!travel || stayNights(travel)>366) return reply({error:'invalid_request'},400);
  if(!env.SMOOBU_API_KEY || !env.SMOOBU_API_SECRET || !/^\d+$/.test(env.SMOOBU_CUSTOMER_ID||'')) return reply({error:'not_configured'},503);
  try {
    const customerId=Number(env.SMOOBU_CUSTOMER_ID);
    if(!Number.isSafeInteger(customerId)||customerId<=0) return reply({error:'not_configured'},503);
    const basis=JSON.parse(env.SMOOBU_VERIFIED_PRICE_BASIS||'{}');
    const body=JSON.stringify({arrivalDate:travel.arrival,departureDate:travel.departure,guests:travel.guests,apartments:searchApartments.map(a=>a.providerId),customerId});
    const response=await fetchImpl(upstream,{method:'POST',headers:signedHeaders(body,env.SMOOBU_API_KEY,env.SMOOBU_API_SECRET),body,redirect:'error',signal:AbortSignal.timeout(10000)});
    if(!response.ok) return reply({error:'provider_unavailable'},502);
    const apartments=normalizeAvailability(await response.json(),travel,basis);
    return reply({travel,apartments});
  } catch { return reply({error:'provider_unavailable'},502); }
}
