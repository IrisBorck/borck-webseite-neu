import pg from 'pg';
import {readFile} from 'node:fs/promises';
import {PostgresStore} from './store.mjs';
import {SimulationProvider,SmoobuProvider} from './provider.mjs';
export const migration=()=>readFile(new URL('migrations/001.sql',import.meta.url),'utf8');
export async function runtime(env,{migrate=false}={}){
 const mode=env.BOOKING_MODE||'simulation';let db;
 if(mode==='simulation'){
  // Separate local PostgreSQL/WASM database, never pointed at production.
  const {PGlite}=await import('@electric-sql/pglite');db=new PGlite();await db.exec(await migration());
 }else{
  if(!env.DATABASE_URL)throw Error('DATABASE_URL required');
  db=new pg.Pool({connectionString:env.DATABASE_URL,max:4,connectionTimeoutMillis:5000,statement_timeout:15000});
  if(migrate)await db.query(await migration());
  const v=await db.query('SELECT version FROM aq_booking_schema');if(!v.rows.some(x=>x.version===1))throw Error('Migration required');
 }
 return {store:new PostgresStore(db),provider:mode==='simulation'?new SimulationProvider():new SmoobuProvider(env),close:()=>db.end?db.end():db.close(),db};
}
