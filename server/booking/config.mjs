import {requireThat} from './domain.mjs';
export function config(env){
 const mode=env.BOOKING_MODE||'simulation';requireThat(['simulation','live'].includes(mode),'invalid_mode',500);
 const origin=new URL(env.BOOKING_ORIGIN||'http://127.0.0.1:8788');
 requireThat(origin.pathname==='/'&&!origin.search&&!origin.hash&&!origin.username&&!origin.password,'invalid_origin',500);
 const loopback=['127.0.0.1','localhost'].includes(origin.hostname);
 requireThat(origin.protocol==='https:'||(mode==='simulation'&&loopback),'https_required',500);
 requireThat((env.BOOKING_PASSWORD||'').length>=24&&(env.BOOKING_USER||'').length>=1,'protected_access_required',500);
 if(mode==='live')requireThat(env.DATABASE_URL&&env.SMOOBU_API_KEY&&env.SMOOBU_API_SECRET&&/^[1-9]\d*$/.test(env.SMOOBU_CUSTOMER_ID||'')&&['major','minor'].includes(env.SMOOBU_PRICE_UNIT),'live_configuration_missing',500);
 if(mode==='live')websiteChannelId(env);
 requireThat(mode!=='simulation'||!env.BOOKING_ENABLE_LIVE_WRITE,'simulation_cannot_enable_live',500);
 return {mode,origin:origin.origin,port:Number(env.BOOKING_PORT||8788),user:env.BOOKING_USER,password:env.BOOKING_PASSWORD};
}

// This is the account-specific readback ID, not POST channelId=70.
export function websiteChannelId(env){
 const value=env.SMOOBU_WEBSITE_CHANNEL_ID;
 requireThat(/^[1-9]\d*$/.test(value||'')&&Number.isSafeInteger(Number(value)),'website_channel_configuration_missing',500);
 return Number(value);
}
