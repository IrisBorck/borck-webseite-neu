// Explicit local administration only. NEVER creates/cancels Smoobu reservations.
import {runtime} from '../../server/booking/runtime.mjs';
import {requireThat} from '../../server/booking/domain.mjs';
const action=process.argv[2],env=process.env;
requireThat(['migrate','preflight'].includes(action),'expected_migrate_or_preflight');
requireThat(env.BOOKING_MODE==='live','live_mode_required');
requireThat(!env.BOOKING_ENABLE_LIVE_WRITE,'disable_writes_before_preflight');
const r=await runtime(env,{migrate:action==='migrate'});
try{
 if(action==='preflight'){
  const a=await r.provider.availability();requireThat(a.status==='available'&&a.currency==='EUR'&&Number.isSafeInteger(a.baseCents),'not_available',409);
  await r.store.savePreflight(a.baseCents,new Date());
  console.log(JSON.stringify({scope:'Saphir 09.–14.11.2026 / 2 Erwachsene',baseCents:a.baseCents,currency:'EUR',validForMinutes:10,writeEnabled:false}));
 }else console.log('Booking schema installed. No external API called.');
}finally{await r.close();}
