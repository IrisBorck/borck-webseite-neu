import {isDeepStrictEqual} from 'node:util';
import {createHash} from 'node:crypto';
import {BookingError,SCOPE,RULE_VERSION,requireThat,validateSelection,validateGuest,newQuote,priceSnapshot,matchesReservation} from './domain.mjs';
const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
export class BookingService {
 constructor({store,provider,env={},clock=()=>new Date()}){this.store=store;this.provider=provider;this.env=env;this.clock=clock;}
 async offer(input){
  const selection=validateSelection(input);
  requireThat(this.clock()<new Date(SCOPE.arrival+'T00:00:00+01:00'),'test_period_passed',409);
  const a=await this.provider.availability();requireThat(a?.status==='available'&&a.currency==='EUR','not_available',409);
  return this.store.saveQuote(newQuote(selection,a.baseCents,this.clock()));
 }
 async writable(){
  if(this.provider.mode==='simulation')return;
  requireThat(this.env.BOOKING_ENABLE_LIVE_WRITE==='SAPHIR-09-14-NOV-2026','live_write_disabled',403);
  const p=await this.store.preflight();
  const age=p?this.clock()-new Date(p.checked_at):Infinity;
  requireThat(age>=0&&age<10*60000,'live_preflight_required',403);
 }
 async submit(input){
  requireThat(input&&Object.keys(input).every(k=>['quoteId','key','guest','accepted'].includes(k))&&input.accepted===true&&uuid(input.quoteId)&&uuid(input.key),'invalid_submission');
  const guest=validateGuest(input.guest);
  const hash=createHash('sha256').update(JSON.stringify({quoteId:input.quoteId,guest,accepted:true})).digest('hex');
  // Retrieval of an existing attempt remains possible after the write gate closes.
  const prior=await this.store.existing(input.quoteId,input.key);
  if(prior.length){requireThat(prior.length===1&&prior[0].request_hash===hash,'idempotency_conflict',409);return this.public(await this.store.get(prior[0].id));}
  // Disabled writes fail before creating any booking records.
  await this.writable();
  let claim;
  try{claim=await this.store.claim({quoteId:input.quoteId,key:input.key,hash,guest,now:this.clock()});}
  catch(e){if(e.code==='23505')throw new BookingError('idempotency_conflict',409);throw e;}
  if(!claim.fresh)return this.public(await this.store.get(claim.id));
  const b=await this.store.get(claim.id);
  try{
   requireThat(this.clock()<new Date(SCOPE.arrival+'T00:00:00+01:00'),'test_period_passed',409);
   requireThat(b.quote.price.ruleVersion===RULE_VERSION,'price_changed',409);
   const a=await this.provider.availability();requireThat(a?.status==='available','not_available',409);
   const recomputed=priceSnapshot(b.quote.selection,a.baseCents,this.clock());
   if(a.currency!=='EUR'||!isDeepStrictEqual({...recomputed,calculatedAt:null},{...b.quote.price,calculatedAt:null})){
    await this.store.transition(b.id,['checking'],'price_changed','new_offer_required',null,{release:true});
    return this.public(await this.store.get(b.id));
   }
   requireThat(Date.parse(b.quote.expiresAt)>this.clock().getTime(),'quote_expired',409);
   await this.writable();
  }catch(e){
   await this.store.transition(b.id,['checking'],'rejected',e.code||'precheck_failed',null,{release:true});
   return this.public(await this.store.get(b.id));
  }
  // Commit this before the network call. A restart NEVER re-sends this operation.
  if(!await this.store.transition(b.id,['checking'],'submitting',null,null,{attempt:true}))return this.public(await this.store.get(b.id));
  let id;
  try{id=await this.provider.create(b);}
  catch{
   await this.store.transition(b.id,['submitting'],'uncertain','create_result_unknown');
   // All errors are conservative, including provider 4xx: the slot remains held.
   return this.public(await this.store.get(b.id));
  }
  await this.store.transition(b.id,['submitting','uncertain'],'uncertain','verification_pending',id);
  return this.reconcile(b.id);
 }
 public(b){requireThat(b,'booking_not_found',404);return {id:b.id,state:b.state,reason:b.reason,reservationId:b.reservation_id,quote:b.quote,mode:this.provider.mode,attempts:b.create_attempts};}
 async status(id){requireThat(uuid(id),'invalid_id');return this.public(await this.store.get(id));}
 async reconcile(id){
  requireThat(uuid(id),'invalid_id');let b=await this.store.get(id);requireThat(b,'booking_not_found',404);
  if(['confirmed','rejected','price_changed','review'].includes(b.state))return this.public(b);
  if(b.state==='checking'){
   if(this.clock()-new Date(b.updated_at)>30000)await this.store.transition(id,['checking'],'rejected','interrupted_before_dispatch',null,{release:true});
   return this.public(await this.store.get(id));
  }
  try{
   const matches=b.reservation_id?[await this.provider.read(b.reservation_id)]:await this.provider.find(b);
   if(matches.length>1){await this.store.transition(id,['uncertain','submitting'],'review','multiple_reservations');}
   else if(matches.length===1){
    // Read the individual reservation even if it came from the list endpoint.
    const raw=await this.provider.read(Number(matches[0].id));
    if(!matchesReservation(raw,b))await this.store.transition(id,['uncertain','submitting'],'review','reservation_mismatch',Number(raw?.id)||null);
    else{
     const a=await this.provider.availability();
     if(a.status==='unavailable')await this.store.transition(id,['uncertain','submitting'],'confirmed',null,Number(raw.id));
     else await this.store.transition(id,['uncertain','submitting'],'uncertain','calendar_not_verified',Number(raw.id));
    }
   }else if(b.state==='uncertain'||this.clock()-new Date(b.updated_at)>30000){
    await this.store.transition(id,['uncertain','submitting'],'uncertain','no_match_yet');
   }
  }catch{await this.store.transition(id,['uncertain'],'uncertain','verification_unavailable');}
  return this.public(await this.store.get(id));
 }
}
