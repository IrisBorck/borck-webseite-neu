import {config} from './config.mjs';
import {runtime} from './runtime.mjs';
import {BookingService} from './service.mjs';
import {createBookingServer} from './http.mjs';
const env=process.env,cfg=config(env),r=await runtime(env);
const server=await createBookingServer({service:new BookingService({...r,env}),config:cfg});
server.listen(cfg.port,'127.0.0.1',()=>console.log(`Aquamarin protected pilot: ${cfg.mode}; listening on loopback:${cfg.port}.`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await r.close();process.exit(0);}));
