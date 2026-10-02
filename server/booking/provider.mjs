import {createHash,createHmac,randomUUID} from 'node:crypto';
import {normalizeAvailability} from '../availability.mjs';
import {SCOPE,BookingError,requireThat,reservationPayload} from './domain.mjs';
import {websiteChannelId} from './config.mjs';
const base='https://login.smoobu.com';
export class SmoobuProvider {
 constructor(env,fetchImpl=fetch){this.env=env;this.fetch=fetchImpl;this.mode='live';}
 get reservationChannelId(){return websiteChannelId(this.env);}
 headers(method,url,body){
  const stamp=new Date().toISOString(),nonce=randomUUID();
  const encode=s=>encodeURIComponent(s).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
  const query=[...url.searchParams].sort(([a,av],[b,bv])=>a.localeCompare(b)||av.localeCompare(bv)).map(([k,v])=>`${encode(k)}=${encode(v)}`).join('&');
  const key=this.env.SMOOBU_API_KEY;
  const canonical=[method,url.pathname,query,stamp,nonce,createHash('sha256').update(body).digest('hex'),key].join('\n');
  return {'Content-Type':'application/json','X-API-Key':key,'X-Timestamp':stamp,'X-Nonce':nonce,'X-Signature':createHmac('sha256',this.env.SMOOBU_API_SECRET).update(canonical).digest('base64')};
 }
 async call(method,path,payload){
  const url=new URL(path,base);requireThat(url.origin===base,'invalid_provider_target',500);
  const body=payload===undefined?'':JSON.stringify(payload);
  const response=await this.fetch(url,{method,headers:this.headers(method,url,body),...(body?{body}:{}),redirect:'error',signal:AbortSignal.timeout(10000)});
  if(!response.ok){const e=new BookingError('provider_error',502);e.upstreamStatus=response.status;throw e;}
  return response.json();
 }
 async availability(){
  const customerId=Number(this.env.SMOOBU_CUSTOMER_ID);requireThat(Number.isSafeInteger(customerId)&&customerId>0,'provider_configuration',503);
  const raw=await this.call('POST','/booking/checkApartmentAvailability',{arrivalDate:SCOPE.arrival,departureDate:SCOPE.departure,guests:2,apartments:[SCOPE.apartmentId],customerId});
  const item=normalizeAvailability(raw,{arrival:SCOPE.arrival,departure:SCOPE.departure,guests:2},this.env.SMOOBU_PRICE_UNIT).find(x=>x.id==='saphir');
  return item;
 }
 async create(booking){
  // Defense in depth: no write through the adapter unless separately activated.
  requireThat(this.env.BOOKING_ENABLE_LIVE_WRITE==='SAPHIR-09-14-NOV-2026','live_write_disabled',403);
  websiteChannelId(this.env);
  const result=await this.call('POST','/api/reservations',reservationPayload(booking));
  requireThat(Number.isSafeInteger(result.id)&&result.id>0,'invalid_create_response',502);return result.id;
 }
 async read(id){requireThat(Number.isSafeInteger(id)&&id>0,'invalid_reservation',502);return this.call('GET',`/api/reservations/${id}`);}
 async find(booking){
  const found=[];
  for(let page=1;page<=100;page++){
   const query=new URLSearchParams({apartmentId:String(SCOPE.apartmentId),arrivalFrom:SCOPE.arrival,arrivalTo:SCOPE.arrival,showCancellation:'true',pageSize:'100',page:String(page)});
   const data=await this.call('GET','/api/reservations?'+query);
   requireThat(Array.isArray(data.bookings)&&Number.isInteger(data.page_count)&&data.page_count>=0&&data.page_count<=100,'invalid_lookup_response',502);
   found.push(...data.bookings.filter(x=>x.notice?.includes(`Aquamarin booking ${booking.id}`)));
   if(page>=data.page_count)return found;
  }
  throw new BookingError('lookup_incomplete',502);
 }
}
// Local simulation only. No URL, credentials or external network calls.
export class SimulationProvider {
 constructor(){this.reservationChannelId=700070;this.mode='simulation';this.baseCents=55000;this.records=new Map();this.calls=0;this.fault=null;}
 async availability(){if(this.fault==='availability')throw Error('simulated upstream outage');return {status:this.records.size?'unavailable':'available',baseCents:this.baseCents,currency:'EUR'};}
 async create(b){
  this.calls++;const p=reservationPayload(b),id=900000+this.calls;
  if(this.fault==='before_create')throw Error('simulated response loss');
  this.records.set(id,{id,type:'reservation','is-blocked-booking':false,apartment:{id:p.apartmentId},channel:{id:700070,name:'Website'},arrival:p.arrivalDate,departure:p.departureDate,adults:p.adults,children:p.children,email:p.email,notice:p.notice,price:p.price,prepayment:p.prepayment});
  if(this.fault==='after_create')throw Error('simulated response loss');return id;
 }
 async read(id){if(this.fault==='read')throw Error('simulated read failure');return this.records.get(id);}
 async find(b){return [...this.records.values()].filter(r=>r.notice.includes(b.id));}
}
