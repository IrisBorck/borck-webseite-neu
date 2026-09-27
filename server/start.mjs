import {createAvailabilityServer} from './http.mjs';

const env=process.env;
if(!env.SMOOBU_API_KEY || !env.SMOOBU_API_SECRET || !/^[1-9]\d*$/.test(env.SMOOBU_CUSTOMER_ID||'') || !Number.isSafeInteger(Number(env.SMOOBU_CUSTOMER_ID)) || !['major','minor'].includes(env.SMOOBU_PRICE_UNIT)) {
  console.error('Server configuration missing: set SMOOBU_API_KEY, SMOOBU_API_SECRET, SMOOBU_CUSTOMER_ID and SMOOBU_PRICE_UNIT in the server secret store.');
  process.exit(1);
}
const port=Number(env.PORT||8787);
if(!Number.isInteger(port)||port<1||port>65535) throw Error('Invalid PORT');
// Default: local reverse proxy with HTTPS. HOST=0.0.0.0 only in a managed container.
const server=createAvailabilityServer(env);
server.listen(port,env.HOST||'127.0.0.1',()=>console.log('Read-only availability server started.'));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));
