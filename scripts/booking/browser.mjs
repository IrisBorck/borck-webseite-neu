import {chromium as playwright} from 'playwright';import chromium from '@sparticuz/chromium';import {randomUUID} from 'node:crypto';import {mkdir} from 'node:fs/promises';import assert from 'node:assert/strict';
import {runtime} from '../../server/booking/runtime.mjs';import {BookingService} from '../../server/booking/service.mjs';import {createBookingServer} from '../../server/booking/http.mjs';
const password=randomUUID(),user='operator';
const browser=await playwright.launch({executablePath:await chromium.executablePath(),args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader'],headless:true});
await mkdir('docs/booking-review',{recursive:true});
try{
 for(const [name,viewport] of [['desktop',{width:1280,height:1000}],['mobile',{width:390,height:844}]]){
  const r=await runtime({BOOKING_MODE:'simulation'}),service=new BookingService({...r,clock:()=>new Date('2026-10-02T12:00:00Z')});
  const cfg={user,password,origin:''};const server=await createBookingServer({service,config:cfg});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));cfg.origin='http://127.0.0.1:'+server.address().port;
  const context=await browser.newContext({viewport,httpCredentials:{username:user,password}}),page=await context.newPage();
  page.on('response',async r=>{if(r.status()>=400)console.log('HTTP FAILURE',r.status(),new URL(r.url()).pathname,await r.text());});
  const failures=[];page.on('pageerror',e=>failures.push(e.message));
  await page.goto(cfg.origin+'/pilot/');await page.getByText('SIMULATION: Alle Anbieterantworten',{exact:false}).waitFor();
  await page.locator('[name=regularTax]').check();await page.getByRole('button',{name:'Aktuelles Angebot berechnen'}).click();
  try{await page.locator('#total').filter({hasText:'607,60'}).waitFor({timeout:8000});}catch(e){console.log(await page.locator('body').innerText(),failures);throw e;}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:`docs/booking-review/${name}-offer.png`,fullPage:true});
  const values={firstName:'Prüfung',lastName:'Simulation',email:randomUUID()+'@example.invalid',phone:'+49000000000',street:'Testweg 1',postalCode:'00000',city:'Testort'};
  for(const [key,value] of Object.entries(values))await page.locator(`[name=${key}]`).fill(value);
  await page.locator('[name=accepted]').check();await page.getByRole('button',{name:'Buchung simulieren'}).click();
  await page.locator('#state').filter({hasText:'Reservierung bestätigt'}).waitFor();assert.equal(r.provider.calls,1);
  // No test address in screenshots: blank guest fields before recording result.
  await page.evaluate(()=>{for(const input of document.querySelectorAll('#guest input:not([type=checkbox])'))input.value='';});
  await page.screenshot({path:`docs/booking-review/${name}-result.png`,fullPage:true});
  await page.reload();await page.locator('#state').filter({hasText:'Reservierung bestätigt'}).waitFor();assert.equal(r.provider.calls,1);assert.deepEqual(failures,[]);
  await context.close();await new Promise(resolve=>server.close(resolve));await r.close();console.log(`${name}: quote, complete form, reservation simulation, reload, no overflow, no browser errors`);
 }
}finally{await browser.close();}
