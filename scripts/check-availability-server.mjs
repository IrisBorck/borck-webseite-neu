import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createAvailabilityServer} from '../server/http.mjs';
let calls=0;
const server=createAvailabilityServer({},async()=>{calls++;return new Response('{"test":true}');});
server.listen(0,'127.0.0.1'); await once(server,'listening');
const root=`http://127.0.0.1:${server.address().port}`;
try {
  assert.equal((await fetch(root+'/other')).status,404);
  assert.equal((await fetch(root+'/availability',{method:'POST'})).status,405);
  assert.equal((await fetch(root+'/availability',{headers:{Origin:'https://other.test'}})).status,403);
  assert.equal(calls,0);
  for(let i=0;i<30;i++) assert.equal((await fetch(root+'/availability')).status,200);
  const limited=await fetch(root+'/availability',{headers:{Origin:'https://irisborck.github.io'}});
  assert.equal(limited.status,429); assert.equal(limited.headers.get('Retry-After'),'60');
  assert.equal(limited.headers.get('Access-Control-Allow-Origin'),'https://irisborck.github.io');
  assert.equal(calls,30);
} finally {await new Promise(resolve=>server.close(resolve));}
const unconfigured=createAvailabilityServer({});
unconfigured.listen(0,'127.0.0.1'); await once(unconfigured,'listening');
try {
  const res=await fetch(`http://127.0.0.1:${unconfigured.address().port}/availability?arrival=2027-10-01&departure=2027-10-04&guests=2`,{headers:{Origin:'https://irisborck.github.io'}});
  assert.equal(res.status,503);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'),'https://irisborck.github.io');
  assert.deepEqual(await res.json(),{error:'not_configured'});
} finally {await new Promise(resolve=>unconfigured.close(resolve));}
console.log('HTTP adapter: method/path/origin restrictions, request limit and missing credentials checked. No Smoobu requests.');
