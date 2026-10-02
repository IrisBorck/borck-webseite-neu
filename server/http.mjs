import {createServer} from 'node:http';
import {handleAvailability} from './availability.mjs';

// One process, one upstream budget. No IP addresses or travel data are logged.
// Multiple replicas require a shared upstream rate limiter before scaling.
export function createAvailabilityServer(env, handler=handleAvailability) {
  let active=0, count=0, windowStart=Date.now();
  return createServer({requestTimeout:15000,headersTimeout:10000,maxHeaderSize:8192},async(req,res)=>{
    const finish=(status,body,extra={})=>{
      res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...extra});
      res.end(JSON.stringify(body));
    };
    if(req.method!=='GET') return finish(405,{error:'method_not_allowed'},{Allow:'GET'});
    if(!req.url?.startsWith('/') || req.url.startsWith('//') || req.url.length>512) return finish(400,{error:'invalid_request'});
    const url=new URL(req.url,'http://localhost');
    if(url.pathname!=='/availability') return finish(404,{error:'not_found'});
    const origin=req.headers.origin;
    if(origin && origin!=='https://irisborck.github.io') return finish(403,{error:'forbidden'});
    const cors=origin?{'Access-Control-Allow-Origin':origin,Vary:'Origin'}:{};
    if(Date.now()-windowStart>=60000) {count=0;windowStart=Date.now();}
    if(active>=4 || count>=30) return finish(429,{error:'busy'},{...cors,'Retry-After':'60'});
    count++; active++;
    try {
      const response=await handler(new Request(url,{headers:origin?{Origin:origin}:{}}),env);
      res.writeHead(response.status,Object.fromEntries(response.headers));
      res.end(await response.text());
    } catch {
      finish(502,{error:'provider_unavailable'},cors);
    } finally {active--;}
  });
}
