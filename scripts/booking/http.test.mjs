import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {config} from '../../server/booking/config.mjs';import {createBookingServer} from '../../server/booking/http.mjs';
test('HTTP access, CSRF, body limit, method restrictions and security headers',async t=>{
 let writes=0;const password=randomUUID(),env={BOOKING_USER:'operator',BOOKING_PASSWORD:password},cfg=config(env);
 const service={provider:{mode:'simulation'},env:{},submit:async()=>{writes++;return {};}};
 const server=await createBookingServer({service,config:cfg});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base='http://127.0.0.1:'+server.address().port,authorization='Basic '+Buffer.from('operator:'+password).toString('base64');
 assert.equal((await fetch(base+'/pilot/')).status,401);
 const page=await fetch(base+'/pilot/',{headers:{authorization}});assert.equal(page.status,200);assert.match(page.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.match(page.headers.get('x-robots-tag'),/noindex/);
 const headers={authorization,'Content-Type':'application/json','X-Aquamarin-Request':'booking'};
 assert.equal((await fetch(base+'/pilot/bookings',{method:'POST',headers,body:'{}'})).status,403);
 assert.equal((await fetch(base+'/pilot/bookings',{method:'POST',headers:{...headers,Origin:'https://other.invalid'},body:'{}'})).status,403);
 assert.equal((await fetch(base+'/pilot/bookings?token=not-allowed',{method:'POST',headers:{...headers,Origin:cfg.origin},body:'{}'})).status,400);
 assert.equal((await fetch(base+'/pilot/bookings',{method:'DELETE',headers})).status,405);
 assert.equal((await fetch(base+'/pilot/bookings',{method:'POST',headers:{...headers,Origin:cfg.origin},body:JSON.stringify({data:'x'.repeat(9000)})})).status,413);
 assert.equal(writes,0);
 assert.equal((await fetch(base+'/pilot/bookings',{method:'POST',headers:{...headers,Origin:cfg.origin},body:'{}'})).status,200);assert.equal(writes,1);
});
test('live startup requires HTTPS, PostgreSQL and secret configuration',()=>{
 const common={BOOKING_USER:'operator',BOOKING_PASSWORD:randomUUID()};
 assert.throws(()=>config({...common,BOOKING_MODE:'live'}),/https_required/);
 assert.throws(()=>config({...common,BOOKING_MODE:'simulation',BOOKING_ENABLE_LIVE_WRITE:'anything'}),/simulation_cannot_enable_live/);
 assert.throws(()=>config({...common,BOOKING_MODE:'live',BOOKING_ORIGIN:'https://example.invalid'}),/live_configuration_missing/);
});

test('live configuration requires explicit positive safe account channel ID',()=>{
 const env={BOOKING_MODE:'live',BOOKING_ORIGIN:'https://example.invalid',BOOKING_USER:'operator',BOOKING_PASSWORD:randomUUID(),DATABASE_URL:'postgresql:///unused',SMOOBU_API_KEY:'unused',SMOOBU_API_SECRET:'unused',SMOOBU_CUSTOMER_ID:'1',SMOOBU_PRICE_UNIT:'major'};
 for(const bad of [undefined,'','0','-1','NaN','1.5','9007199254740992']){
  assert.throws(()=>config({...env,SMOOBU_WEBSITE_CHANNEL_ID:bad}),/website_channel_configuration_missing/);
 }
 assert.equal(config({...env,SMOOBU_WEBSITE_CHANNEL_ID:'700070'}).mode,'live');
});
