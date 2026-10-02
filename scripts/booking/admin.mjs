// Explicit server administration only. NEVER creates/cancels Smoobu reservations.
// recheck-review may update our own booking state after read-only provider verification.
import {BookingService} from '../../server/booking/service.mjs';
import {runtime} from '../../server/booking/runtime.mjs';
import {requireThat} from '../../server/booking/domain.mjs';
const action=process.argv[2],env=process.env;
requireThat(['migrate','preflight','recheck-review'].includes(action),'expected_migrate_preflight_or_recheck_review');
requireThat(env.BOOKING_MODE==='live','live_mode_required');
requireThat(!env.BOOKING_ENABLE_LIVE_WRITE,'disable_writes_before_preflight');
const r=await runtime(env,{migrate:action==='migrate'});
try{
 if(action==='preflight'){
  const a=await r.provider.availability();requireThat(a.status==='available'&&a.currency==='EUR'&&Number.isSafeInteger(a.baseCents),'not_available',409);
  await r.store.savePreflight(a.baseCents,new Date());
  console.log(JSON.stringify({scope:'Saphir 09.–14.11.2026 / 2 Erwachsene',baseCents:a.baseCents,currency:'EUR',validForMinutes:10,writeEnabled:false}));
 }else if(action==='recheck-review'){
  const result=await new BookingService({...r,env}).recheckReview(process.argv[3]);
  console.log(JSON.stringify({id:result.id,state:result.state,reason:result.reason,reservationId:result.reservationId,attempts:result.attempts,writeEnabled:false}));
  if(result.state!=='confirmed')process.exitCode=2;
 }else console.log('Booking schema installed. No external API called.');
}finally{await r.close();}
