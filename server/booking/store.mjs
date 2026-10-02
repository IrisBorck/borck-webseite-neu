import {randomUUID} from 'node:crypto';
import {BookingError,SCOPE} from './domain.mjs';
export class PostgresStore {
 constructor(db){this.db=db;}
 async transaction(fn){
  // pg Pool provides dedicated clients; PGlite provides transaction for local SQL tests.
  if(this.db.transaction)return this.db.transaction(fn);
  const client=await this.db.connect();
  try{await client.query('BEGIN');const value=await fn(client);await client.query('COMMIT');return value;}
  catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
 }
 async saveQuote(q){await this.db.query('INSERT INTO aq_quotes(id,document,expires_at) VALUES ($1,$2,$3)',[q.id,q,q.expiresAt]);return q;}
 async existing(quoteId,key){return (await this.db.query('SELECT id,request_hash FROM aq_bookings WHERE quote_id=$1 OR idempotency_key=$2',[quoteId,key])).rows;}
 async byKey(key){const r=await this.db.query('SELECT id FROM aq_bookings WHERE idempotency_key=$1',[key]);return r.rows[0]?this.get(r.rows[0].id):null;}
 async quote(id){return (await this.db.query('SELECT document FROM aq_quotes WHERE id=$1',[id])).rows[0]?.document;}
 async get(id){const r=(await this.db.query('SELECT b.*, q.document AS quote FROM aq_bookings b JOIN aq_quotes q ON q.id=b.quote_id WHERE b.id=$1',[id])).rows[0];return r&&{...r,reservation_id:r.reservation_id===null?null:Number(r.reservation_id)};}
 async claim({quoteId,key,hash,guest,now}){
  return this.transaction(async db=>{
   // Serialize on the quote before checking keys; unique indexes handle cross-quote races.
   const q=(await db.query('SELECT document FROM aq_quotes WHERE id=$1 FOR UPDATE',[quoteId])).rows[0]?.document;
   if(!q)throw new BookingError('quote_not_found',404);
   const old=(await db.query('SELECT id,request_hash FROM aq_bookings WHERE quote_id=$1 OR idempotency_key=$2',[quoteId,key])).rows;
   if(old.length){if(old.length!==1||old[0].request_hash!==hash)throw new BookingError('idempotency_conflict',409);return {id:old[0].id,fresh:false};}
   if(Date.parse(q.expiresAt)<=now.getTime())throw new BookingError('quote_expired',409);
   const id=randomUUID();
   await db.query("INSERT INTO aq_bookings(id,quote_id,idempotency_key,request_hash,guest,state) VALUES ($1,$2,$3,$4,$5,'checking')",[id,quoteId,key,hash,guest]);
   try{await db.query('INSERT INTO aq_pilot_slots(scope,booking_id) VALUES ($1,$2)',[SCOPE.id,id]);}
   catch(e){if(e.code==='23505')throw new BookingError('pilot_already_used',409);throw e;}
   await db.query("INSERT INTO aq_booking_events(booking_id,state) VALUES ($1,'checking')",[id]);return {id,fresh:true};
  });
 }
 async transition(id,from,state,reason=null,reservationId=null,{release=false,attempt=false}={}){
  return this.transaction(async db=>{
   const r=await db.query('UPDATE aq_bookings SET state=$3,reason=$4,reservation_id=COALESCE($5,reservation_id),create_attempts=create_attempts+$6,updated_at=now() WHERE id=$1 AND state=ANY($2::text[]) RETURNING id',[id,from,state,reason,reservationId,attempt?1:0]);
   if(!r.rows.length)return false;
   await db.query('INSERT INTO aq_booking_events(booking_id,state,reason) VALUES ($1,$2,$3)',[id,state,reason]);
   if(release)await db.query('DELETE FROM aq_pilot_slots WHERE booking_id=$1',[id]);return true;
  });
 }
 async preflight(){return (await this.db.query('SELECT * FROM aq_preflight WHERE scope=$1',[SCOPE.id])).rows[0];}
 async savePreflight(baseCents,now){await this.db.query('INSERT INTO aq_preflight(scope,base_cents,checked_at) VALUES ($1,$2,$3) ON CONFLICT(scope) DO UPDATE SET base_cents=$2,checked_at=$3',[SCOPE.id,baseCents,now]);}
}
