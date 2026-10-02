import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {PGlite} from '@electric-sql/pglite';
import {migration} from '../../server/booking/runtime.mjs';
import {PostgresStore} from '../../server/booking/store.mjs';import {BookingService} from '../../server/booking/service.mjs';import {SimulationProvider,SmoobuProvider} from '../../server/booking/provider.mjs';
import {priceSnapshot,paymentPlan,validateSelection,SCOPE,reservationPayload} from '../../server/booking/domain.mjs';
const now=new Date('2026-10-02T12:00:00Z');
const selection=()=>({arrival:SCOPE.arrival,departure:SCOPE.departure,adults:2,children:0,regularTax:true,extras:{linen:2,towels:0,cot:0,chair:0,dogs:0}});
// Synthetic address generated per test, never a fixed test recipient.
const guest=()=>({firstName:'Prüfung',lastName:'Simulation',email:randomUUID()+'@example.invalid',phone:'+49000000000',street:'Testweg 1',postalCode:'00000',city:'Testort',country:'DE'});
async function fixture(t){
 let db;
 if(process.env.BOOKING_TEST_DATABASE_URL){
  const url=new URL(process.env.BOOKING_TEST_DATABASE_URL);
  assert.ok(['127.0.0.1','localhost'].includes(url.hostname),'Tests require an isolated local PostgreSQL instance');
  const schema='aq_test_'+randomUUID().replaceAll('-','');
  const admin=new pg.Pool({connectionString:url.href});await admin.query(`CREATE SCHEMA ${schema}`);
  db=new pg.Pool({connectionString:url.href,options:`-c search_path=${schema}`});
  t.after(async()=>{await db.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();});
  await db.query(await migration());
 }else{db=new PGlite();await db.exec(await migration());t.after(()=>db.close());}
const store=new PostgresStore(db),provider=new SimulationProvider(),service=new BookingService({store,provider,clock:()=>now});return {db,store,provider,service};}
async function submission(f){const q=await f.service.offer(selection());return {quoteId:q.id,key:randomUUID(),guest:guest(),accepted:true};}
test('complete stored price, total-only Smoobu mapping, repeat and reload',async t=>{
 const f=await fixture(t),input=await submission(f),b=await f.service.submit(input);
 assert.equal(b.state,'confirmed');assert.equal(b.quote.price.totalCents,60760);assert.equal(b.quote.price.taxDays,6);assert.equal(b.quote.price.lines.find(x=>x.key==='visitorTax').cents,3360);
 const payload=reservationPayload(await f.store.get(b.id));assert.equal(payload.price,607.6);assert.equal(payload.prepayment,50);assert.equal(payload.channelId,70);assert.equal(payload.priceElements,undefined);
 assert.deepEqual(await f.service.submit(input),b);assert.equal(f.provider.calls,1);
 const restarted=new BookingService({...f,clock:()=>now});assert.deepEqual(await restarted.status(b.id),b);
 assert.equal((await f.store.byKey(input.key)).id,b.id);
 f.provider.mode='live';assert.equal((await restarted.submit(input)).id,b.id);assert.equal(f.provider.calls,1);
 await assert.rejects(()=>f.service.submit({...input,guest:{...input.guest,lastName:'Changed'}}),/idempotency_conflict/);
});
test('concurrent duplicate submit sends at most once',async t=>{
 const f=await fixture(t),input=await submission(f);const results=await Promise.all([f.service.submit(input),f.service.submit(input)]);assert.equal(results[0].id,results[1].id);assert.equal(f.provider.calls,1);
});
test('different quotes cannot occupy same pilot slot',async t=>{
 const f=await fixture(t),a=await submission(f),b=await submission(f);
 const r=await Promise.allSettled([f.service.submit(a),f.service.submit(b)]);assert.equal(r.filter(x=>x.status==='rejected').length,1);assert.equal(f.provider.calls,1);
});
test('changed price requires a new quote and zero writes',async t=>{
 const f=await fixture(t),input=await submission(f);f.provider.baseCents+=100;const b=await f.service.submit(input);assert.equal(b.state,'price_changed');assert.equal(f.provider.calls,0);
 const replacement=await submission(f);assert.equal((await f.service.submit(replacement)).state,'confirmed');
});
test('expired quote and unavailability fail closed',async t=>{
 const f=await fixture(t),input=await submission(f);const later=new BookingService({...f,clock:()=>new Date(now.getTime()+11*60000)});
 await assert.rejects(()=>later.submit(input),/quote_expired/);assert.equal(f.provider.calls,0);
 f.provider.availability=async()=>({status:'unavailable'});assert.equal((await f.service.submit(input)).state,'rejected');assert.equal(f.provider.calls,0);
});
test('lost response after successful create is recovered without repeating create',async t=>{
 const f=await fixture(t),input=await submission(f);f.provider.fault='after_create';const b=await f.service.submit(input);assert.equal(b.state,'uncertain');
 const restarted=new BookingService({...f,clock:()=>now});assert.equal((await restarted.reconcile(b.id)).state,'confirmed');assert.equal((await restarted.submit(input)).id,b.id);assert.equal(f.provider.calls,1);
});
test('timeout with no visible reservation never retries or frees slot',async t=>{
 const f=await fixture(t),input=await submission(f);f.provider.fault='before_create';const b=await f.service.submit(input);
 for(let i=0;i<3;i++){assert.equal((await f.service.reconcile(b.id)).state,'uncertain');assert.equal((await f.service.submit(input)).id,b.id);}
 assert.equal(f.provider.calls,1);const other=await submission(f);await assert.rejects(()=>f.service.submit(other),/pilot_already_used/);
});
test('crash after durable dispatch mark cannot send again',async t=>{
 const f=await fixture(t),input=await submission(f);f.provider.create=async()=>{throw Error('crash')};const b=await f.service.submit(input);
 await f.db.query("UPDATE aq_bookings SET state='submitting',updated_at=now()-interval '1 minute' WHERE id=$1",[b.id]);
 const restarted=new BookingService({...f,clock:()=>new Date('2030-01-01T00:00:00Z')});assert.equal((await restarted.reconcile(b.id)).state,'uncertain');assert.equal((await f.store.get(b.id)).create_attempts,1);
});
test('mismatched readback requires manual review',async t=>{
 const f=await fixture(t),input=await submission(f);const read=f.provider.read.bind(f.provider);f.provider.read=async id=>({...await read(id),price:1});const b=await f.service.submit(input);assert.equal(b.state,'review');assert.equal(f.provider.calls,1);
});
test('unblocked calendar does not report confirmed',async t=>{
 const f=await fixture(t),input=await submission(f);f.provider.availability=async()=>({status:'available',baseCents:55000,currency:'EUR'});const b=await f.service.submit(input);assert.equal(b.state,'uncertain');assert.equal(b.reason,'calendar_not_verified');
});
test('live guard blocks calls without activation AND fresh preflight',async t=>{
 const f=await fixture(t),input=await submission(f);f.provider.mode='live';await assert.rejects(()=>f.service.submit(input),/live_write_disabled/);
 const enabled=new BookingService({...f,env:{BOOKING_ENABLE_LIVE_WRITE:'SAPHIR-09-14-NOV-2026'},clock:()=>now});await assert.rejects(()=>enabled.submit(input),/live_preflight_required/);assert.equal(f.provider.calls,0);
 let calls=0;const p=new SmoobuProvider({},()=>{calls++;});await assert.rejects(()=>p.create({}),/live_write_disabled/);assert.equal(calls,0);
});
test('scope, group, tax eligibility and extra prices cannot be injected',()=>{
 for(const bad of [{...selection(),arrival:'2026-11-10'},{...selection(),adults:3},{...selection(),regularTax:false},{...selection(),totalCents:1},{...selection(),extras:{...selection().extras,dogs:3}}])assert.throws(()=>validateSelection(bad));
});
test('four/five night fee, extras and Berlin payment boundary',()=>{
 const four=priceSnapshot({...selection(),departure:'2026-11-13'},40000,now);assert.equal(four.lines.find(x=>x.key==='shortStay').cents,8500);
 assert.equal(priceSnapshot(selection(),55000,now).lines.find(x=>x.key==='shortStay').cents,0);
 const all=priceSnapshot({...selection(),extras:{linen:2,towels:8,cot:1,chair:1,dogs:2}},55000,now);assert.equal(all.totalCents,75860);
 assert.deepEqual(paymentPlan(60760,SCOPE.arrival,new Date('2026-10-09T12:00:00Z')),[{kind:'deposit',cents:5000,due:'2026-10-10'},{kind:'balance',cents:55760,due:'2026-10-10'}]);
 assert.deepEqual(paymentPlan(60760,SCOPE.arrival,new Date('2026-10-10T12:00:00Z')),[{kind:'full',cents:60760,due:'2026-10-10'}]);
});
