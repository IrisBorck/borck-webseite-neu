import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { normalizeAvailability } from '../server/availability.mjs';
import { searchApartments } from '../src/data/apartment-search.mjs';

// Real built markup and page scripts, mocked transport only. No provider calls
// or bookings. Native GET navigation is verified by action/method/FormData;
// jsdom does not implement navigation or visual layout.
const base = 'https://irisborck.github.io/borck-webseite-neu/';
const debounce = () => new Promise(resolve=>setTimeout(resolve,350));
const tick = () => new Promise(resolve=>setTimeout(resolve,0));
const event = (w,target,type) => target.dispatchEvent(new w.Event(type,{bubbles:true,cancelable:true}));
async function page(file,script,url) {
  const dom = new JSDOM(fs.readFileSync(file,'utf8'),{url,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  w.Date=class extends Date {constructor(...args){super(...(args.length?args:['2026-09-30T12:00:00Z']));} static now(){return Date.parse('2026-09-30T12:00:00Z');}};
  w.AbortController=AbortController;
  w.matchMedia=()=>({matches:false,addEventListener(){}});
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;event(w,this,'close');};
  const requests=[];
  w.fetch=(url,options)=>new Promise((resolve,reject)=>requests.push({url:new URL(url),options,resolve,reject}));
  const searchForm=w.document.querySelector('#directory-search');
  if(searchForm)searchForm.dataset.endpoint='https://api.nordsee-buesum-fewo.de/availability';
  const {outputFiles}=await build({entryPoints:[script],bundle:true,write:false,format:'iife',platform:'browser'});
  await tick();
  w.eval(outputFiles[0].text);
  return {w,requests,$:selector=>w.document.querySelector(selector)};
}

const home=await page('dist/index.html','src/scripts/home.ts',base);
const {w,$}=home;
const form=$('#availability-form');
assert.equal(form.method,'get');assert.equal(form.action,base+'apartments/');
assert.match($('meta[http-equiv="Content-Security-Policy"]').content,/form-action 'self'/);
assert.match($('meta[http-equiv="Content-Security-Policy"]').content,/connect-src 'none'/);
assert.equal($('#booking-result'),null);
assert.equal($('.preview-banner').textContent.trim(),'Neue Website · Vorschau');
assert.equal([...$('.hero-google').children].map(el=>el.textContent.trim()).join(' '),'★★★★★ Google · 4,6 Sterne');
assert.equal($('.hero-google').href,'https://www.google.com/maps?cid=18045129901455022857');
assert.equal($('[data-apartment=saphir] a.button').href,base+'apartments/saphir/');
assert.equal($('#apartment-saphir'),null);
assert.equal(w.document.querySelectorAll('dialog[id^="apartment-"]').length,6);
assert.match($('[type=submit]').textContent,/Preise & Verfügbarkeit prüfen/);
for(const obsolete of ['keine Live-Verfügbarkeit','Buchungen sind hier noch nicht möglich','Zur Freigabe:','keine Buchungen oder Zahlungen möglich','Sie bietet keinen Buchungsabschluss','Deine Datumsauswahl bleibt im Browser','24/7 anreisen'])assert.ok(!w.document.body.textContent.includes(obsolete),obsolete);
const payment=[...w.document.querySelectorAll('.faq-list details')].find(el=>el.querySelector('summary').textContent.includes('Wie und wann'));
for(const text of ['Überweisung oder Kreditkarte','50 €','30 Tage','Gesamtbetrag sofort','Gesamtbetrag jetzt bezahlen','noch nicht als eigene Funktion'])assert.ok(payment.textContent.includes(text),text);
assert.ok(!payment.textContent.includes('gesamte Reisepreis bei der Buchung'));
const fill=(selector,value)=>{const input=$(selector);input.value=value;event(w,input,'input');event(w,input,'change');};
fill('#arrival','2026-10-05');fill('#departure','2026-10-09');fill('[name=adults16]','2');fill('[name=children3to15]','1');fill('[name=infants2]','1');
assert.equal(event(w,form,'submit'),true,'Valid submission must retain native GET navigation');
const target=new URL(form.action);target.search=new w.URLSearchParams(new w.FormData(form)).toString();
assert.deepEqual(Object.fromEntries(target.searchParams),{arrival:'2026-10-05',departure:'2026-10-09',adults16:'2',children3to15:'1',infants2:'1'});
assert.equal(home.requests.length,0,'Homepage must never fetch availability');
for(const [arrival,departure,guests] of [['2026-10-09','2026-10-09','2'],['2026-10-10','2026-10-09','2'],['2026-09-29','2026-10-09','2'],['','2026-10-09','2'],['2026-02-30','2026-10-09','2'],['2026-10-05','2026-10-09','6']]) {
  fill('#arrival',arrival);fill('#departure',departure);fill('[name=adults16]',guests);fill('[name=children3to15]','0');fill('[name=infants2]','0');
  assert.equal(event(w,form,'submit'),false,'Invalid travel must not navigate');
}
fill('#arrival','2026-10-05');fill('#departure','2026-10-09');fill('[name=adults16]','2');fill('[name=children3to15]','1');fill('[name=infants2]','1');
payment.open=true;w.dispatchEvent(new w.PageTransitionEvent('pageshow',{persisted:true}));
assert.equal(payment.open,false);assert.equal($('#arrival').value,'2026-10-05');assert.equal($('[name=adults16]').value,'2');assert.equal($('[name=children3to15]').value,'1');assert.equal($('[name=infants2]').value,'1');
assert.equal(event(w,form,'submit'),true,'Back-restored form can be submitted again');
$('.menu-toggle').click();assert.equal($('.menu-toggle').getAttribute('aria-expanded'),'true');
w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
assert.equal($('.menu-toggle').getAttribute('aria-expanded'),'false');
for(const opener of w.document.querySelectorAll('[data-open]')) {
  opener.click();const dialog=w.document.getElementById(opener.dataset.open);assert.equal(dialog.open,true);
  dialog.querySelector('.dialog-close').click();assert.equal(dialog.open,false);assert.equal(w.document.activeElement,opener);
}
$('[data-filter=zwei]').click();assert.match($('#filter-status').textContent,/2 Apartments/);
$('[data-filter=alle]').click();assert.match($('#filter-status').textContent,/7 Apartments/);
w.close();

const directory=await page('dist/apartments/index.html','src/scripts/directory-search.ts',target.href);
const d=directory.w, q=directory.$, pending=directory.requests;
// The configured endpoint is a fixture; all requests remain mocked.
assert.equal(pending.length,1,'Valid incoming URL automatically starts exactly one query');
assert.equal(pending[0].url.origin,'https://api.nordsee-buesum-fewo.de');
assert.deepEqual(Object.fromEntries(pending[0].url.searchParams),{arrival:'2026-10-05',departure:'2026-10-09',guests:'3'});
for(const key of ['adults16','children3to15','infants2'])assert.equal(q(`[name=${key}]`).value,target.searchParams.get(key));
for(const link of d.document.querySelectorAll('[data-travel-link]'))for(const key of ['adults16','children3to15','infants2'])assert.equal(new URL(link.href).searchParams.get(key),target.searchParams.get(key));
assert.match(q('[data-party-note]').textContent,/4 Reisende insgesamt · 3 reguläre Schlafplätze/);
event(d,d,'pageshow');assert.equal(pending.length,1,'Initial pageshow must not duplicate the query');
const reply=(request,status='available')=>request.resolve({ok:true,json:async()=>({travel:Object.fromEntries([...request.url.searchParams].map(([k,v])=>[k,k==='guests'?Number(v):v])),apartments:[...d.document.querySelectorAll('[data-directory-apartment]')].map(card=>({id:card.dataset.directoryApartment,status,baseCents:42000,currency:'EUR',minimumNights:5}))})});
reply(pending[0]);await tick();
assert.match(q('[data-card-price]').textContent,/505,00/);
assert.equal(q('[data-card-price]').hidden,false);
assert.equal(new URL(q('[data-travel-link]').href).searchParams.get('guests'),'3');
assert.equal(q('#directory-search [type=submit]'),null);
const search=debounce;
q('[name=departure]').value='2026-10-10';event(d,q('[name=departure]'),'input');
assert.equal(q('[data-card-price]').hidden,true);assert.equal(pending.length,1,'Debounce waits before starting a query');
await search();const stale=pending.at(-1);
q('[name=departure]').value='2026-10-08';event(d,q('[name=departure]'),'change');await search();
assert.equal(stale.options.signal.aborted,true);
reply(pending.at(-1),'minimum_stay');await tick();reply(stale);await tick();
assert.match(q('[data-card-status]').textContent,/Mindestaufenthalt: 5 Nächte · gewählt: 3 Nächte/);assert.equal(q('[data-card-price]').hidden,true);
q('[name=infants2]').value='2';event(d,q('[name=infants2]'),'change');
assert.equal(q('[data-card-price]').hidden,true);
event(d,d,'pagehide');
d.dispatchEvent(new d.PageTransitionEvent('pageshow',{persisted:true}));
assert.equal(pending.length,4,'Back navigation refreshes availability once');
assert.equal(q('[name=infants2]').value,'2');assert.equal(pending.at(-1).url.searchParams.get('guests'),'3');
reply(pending.at(-1),'unavailable');await tick();assert.match(q('[data-card-status]').textContent,/nicht verfügbar/);
q('[name=departure]').value='2026-10-12';event(d,q('[name=departure]'),'change');await search();pending.at(-1).reject(new Error('offline'));await tick();assert.match(q('#travel-status').textContent,/gerade nicht möglich/);
q('#clear-search').click();const count=pending.length;
d.dispatchEvent(new d.PageTransitionEvent('pageshow',{persisted:true}));assert.equal(pending.length,count,'Cleared search must not restart on Back');
d.close();
for(const query of ['', '?arrival=2026-10-05', '?arrival=2026-10-05&departure=2026-10-04&guests=2', '?arrival=2026-02-30&departure=2026-10-09&guests=2', '?arrival=2026-09-29&departure=2026-10-09&guests=2', '?arrival=2026-10-05&departure=2026-10-09&guests=6']) {
  const invalid=await page('dist/apartments/index.html','src/scripts/directory-search.ts',base+'apartments/'+query);
  assert.equal(invalid.requests.length,0,'Invalid/incomplete URL must not query');invalid.w.close();
}
// Old total-only URLs are not silently converted to adults.
for(const [regular,expected] of [[1,7],[2,7],[3,5],[4,5],[5,1]]) {
  const url=new URL(base+'apartments/');
  url.search=new URLSearchParams({arrival:'2026-10-05',departure:'2026-10-09',adults16:String(Math.min(2,regular)),children3to15:String(Math.max(0,regular-2)),infants2:'1'}).toString();
  const test=await page('dist/apartments/index.html','src/scripts/directory-search.ts',url.href);
  assert.equal(test.requests.length,1);
  const request=test.requests[0];assert.equal(request.url.searchParams.get('guests'),String(regular));
  const travel={arrival:'2026-10-05',departure:'2026-10-09',guests:regular};
  const raw={availableApartments:searchApartments.map(a=>a.providerId),prices:Object.fromEntries(searchApartments.map(a=>[a.providerId,{price:420,currency:'EUR'}])),errorMessages:[]};
  request.resolve({ok:true,json:async()=>({travel,apartments:normalizeAvailability(raw,travel,'major')})});await tick();
  const cards=[...test.w.document.querySelectorAll('[data-directory-apartment]')];
  assert.equal(cards.filter(card=>!card.querySelector('[data-card-price]').hidden).length,expected);
  assert.ok(cards.every(card=>!card.hidden),'Capacity statuses must not hide larger apartments');
  assert.equal(test.$('[data-directory-apartment=topas] [data-card-price]').hidden,false);
  if(regular===5)assert.match(test.$('[data-party-note]').textContent,/6 Reisende insgesamt · 5 reguläre Schlafplätze/);
  test.w.close();
}
const legacy=await page('dist/apartments/index.html','src/scripts/directory-search.ts',base+'apartments/?arrival=2026-10-05&departure=2026-10-09&guests=2');
assert.equal(legacy.requests.length,0);assert.equal(legacy.$('[name=adults16]').value,'');assert.match(legacy.$('[data-party-note]').textContent,/keine Aufteilung angenommen/);legacy.w.close();
console.log('Startseite/Apartments geprüft: native GET-Übergabe, Validierung, automatische Suche ohne Doppelaufruf, Zurücknavigation, Request-Abbruch, Mindestaufenthalt, Fehler, Texte, Saphir-Link, sechs Kurzansichten, Menü und Dialogfokus. Keine Live-Abfrage oder Testbuchung.');

// Direct entry: real input/change events, no submit, no focus/scroll jump.
const direct=await page('dist/apartments/index.html','src/scripts/directory-search.ts',base+'apartments/');
const dq=direct.$, dw=direct.w, dr=direct.requests;
const set=(name,value)=>{const field=dq(`[name=${name}]`);field.value=value;event(dw,field,'input');event(dw,field,'change');};
set('arrival','2026-10-05');await debounce();assert.equal(dr.length,0);
set('departure','2026-10-09');set('children3to15','2');set('infants2','1');
dq('[name=infants2]').focus();await debounce();
assert.equal(dr.length,1,'One debounced query after all fields are complete');
assert.equal(dr[0].url.searchParams.get('guests'),'4');
event(dw,dq('[name=infants2]'),'change');await debounce();assert.equal(dr.length,1,'Unchanged input/change events never duplicate a request');
set('departure','');assert.equal(dr[0].options.signal.aborted,true);await debounce();assert.equal(dr.length,1,'Invalid edits cancel old requests and never query');
dr[0].resolve({ok:true,json:async()=>({})});await tick();assert.ok(!dq('#travel-status').textContent.includes('gerade nicht möglich'),'Stale failure cannot overwrite incomplete state');
set('departure','2026-10-10');await debounce();assert.equal(dr.length,2);
const current=dr[1], travel=Object.fromEntries([...current.url.searchParams].map(([k,v])=>[k,k==='guests'?Number(v):v]));
const raw={availableApartments:searchApartments.filter(a=>a.id!=='opal').map(a=>a.providerId),prices:Object.fromEntries(searchApartments.map(a=>[a.providerId,{price:420,currency:'EUR'}])),errorMessages:[]};
current.resolve({ok:true,json:async()=>({travel,apartments:normalizeAvailability(raw,travel,'major')})});await tick();
assert.equal(dw.document.activeElement,dq('[name=infants2]'),'Auto-results preserve input focus');
assert.ok(dq('[data-directory-apartment=bernstein]').classList.contains('capacity-mismatch'));
assert.ok(dq('[data-directory-apartment=opal]').classList.contains('is-unavailable'));
assert.equal(dw.document.querySelectorAll('[data-directory-apartment]').length,7);
assert.ok([...dw.document.querySelectorAll('[data-directory-apartment]')].every(c=>!c.hidden));
const saphirURL=new URL(dq('[data-directory-apartment=saphir] [data-travel-link]').href);
for(const [key,value] of Object.entries({adults16:'2',children3to15:'2',infants2:'1',guests:'4'}))assert.equal(saphirURL.searchParams.get(key),value);
set('infants2','2');dq('#clear-search').click();await debounce();assert.equal(dr.length,2,'Clearing also cancels a pending debounce');assert.equal(dw.location.search,'');
dw.close();
console.log('Apartments-Automatik geprüft: vollständige Direkteingabe, Entprellung, unveränderte Ereignisse, ungültige Änderungen, sichtbare Kapazitäts-/Datumsfälle, Fokus und Löschen.');
