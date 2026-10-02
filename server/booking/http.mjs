import {createServer} from 'node:http';
import {createHash,timingSafeEqual} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {BookingError,SCOPE} from './domain.mjs';
const assets=new Map([['/pilot/',['index.html','text/html; charset=utf-8']],['/pilot/app.js',['app.js','text/javascript; charset=utf-8']],['/pilot/style.css',['style.css','text/css; charset=utf-8']]]);
export async function createBookingServer({service,config}){
 const files=new Map(await Promise.all([...assets].map(async([path,[name,type]])=>[path,{body:await readFile(new URL('ui/'+name,import.meta.url)),type}])));
 const expected=createHash('sha256').update('Basic '+Buffer.from(config.user+':'+config.password).toString('base64')).digest();
 let active=0,count=0,start=Date.now(),authFailures=0;
 return createServer({requestTimeout:20000,headersTimeout:10000,maxHeaderSize:8192},async(req,res)=>{
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow, noarchive','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"};
  const send=(status,data,type='application/json; charset=utf-8',extra={})=>{res.writeHead(status,{...headers,'Content-Type':type,...extra});res.end(type.startsWith('application/json')?JSON.stringify(data):data);};
  if(Date.now()-start>60000){start=Date.now();count=0;authFailures=0;}
  if(authFailures>=20)return send(429,{error:'busy'});
  const supplied=createHash('sha256').update(req.headers.authorization||'').digest();
  if(!timingSafeEqual(expected,supplied)){authFailures++;return send(401,{error:'authentication_required'},undefined,{'WWW-Authenticate':'Basic realm="Aquamarin Buchungstest", charset="UTF-8"'});}
  if(active>=4||count>=100)return send(429,{error:'busy'});
  count++;active++;
  try{
   if(!req.url?.startsWith('/')||req.url.startsWith('//')||req.url.length>200)throw new BookingError('invalid_path');
   const url=new URL(req.url,config.origin);
   if(url.search)throw new BookingError('query_not_allowed');
   if(req.method==='GET'&&files.has(url.pathname)){const f=files.get(url.pathname);return send(200,f.body,f.type);}
   if(req.method==='GET'&&url.pathname==='/pilot/config')return send(200,{scope:SCOPE,mode:service.provider.mode,liveWriteEnabled:service.provider.mode==='live'&&service.env.BOOKING_ENABLE_LIVE_WRITE==='SAPHIR-09-14-NOV-2026'});
   if(req.method==='GET'&&/^\/pilot\/attempts\/[0-9a-f-]{36}$/.test(url.pathname))return send(200,service.public(await service.store.byKey(url.pathname.split('/').at(-1))));
   if(req.method==='GET'&&/^\/pilot\/bookings\/[0-9a-f-]{36}$/.test(url.pathname))return send(200,await service.status(url.pathname.split('/').at(-1)));
   if(req.method!=='POST')throw new BookingError('method_not_allowed',405);
   if(req.headers.origin!==config.origin||req.headers['content-type']!=='application/json'||req.headers['x-aquamarin-request']!=='booking')throw new BookingError('request_forbidden',403);
   let bytes=0;const chunks=[];
   for await(const chunk of req){bytes+=chunk.length;if(bytes>8192)throw new BookingError('body_too_large',413);chunks.push(chunk);}
   let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new BookingError('invalid_json');}
   if(url.pathname==='/pilot/quotes')return send(200,await service.offer(body));
   if(url.pathname==='/pilot/bookings')return send(200,await service.submit(body));
   if(/^\/pilot\/bookings\/[0-9a-f-]{36}\/reconcile$/.test(url.pathname))return send(200,await service.reconcile(url.pathname.split('/')[3]));
   throw new BookingError('not_found',404);
  }catch(e){send(e instanceof BookingError?e.status:503,{error:e instanceof BookingError?e.code:'temporarily_unavailable'});}
  finally{active--;}
 });
}
