import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

// Real built markup and page scripts, mocked transport only. No provider calls
// or bookings. Native GET navigation is verified by action/method/FormData;
// jsdom does not implement navigation or visual layout.
const base = 'https://irisborck.github.io/borck-webseite-neu/';
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
fill('#arrival','2026-10-05');fill('#departure','2026-10-09');fill('#guests','3');
assert.equal(event(w,form,'submit'),true,'Valid submission must retain native GET navigation');
const target=new URL(form.action);target.search=new w.URLSearchParams(new w.FormData(form)).toString();
assert.deepEqual(Object.fromEntries(target.searchParams),{arrival:'2026-10-05',departure:'2026-10-09',guests:'3'});
assert.equal(home.requests.length,0,'Homepage must never fetch availability');
for(const [arrival,departure,guests] of [['2026-10-09','2026-10-09','2'],['2026-10-10','2026-10-09','2'],['2026-09-29','2026-10-09','2'],['','2026-10-09','2'],['2026-02-30','2026-10-09','2'],['2026-10-05','2026-10-09','6']]) {
  fill('#arrival',arrival);fill('#departure',departure);fill('#guests',guests);
  assert.equal(event(w,form,'submit'),false,'Invalid travel must not navigate');
}
fill('#arrival','2026-10-05');fill('#departure','2026-10-09');fill('#guests','3');
payment.open=true;w.dispatchEvent(new w.PageTransitionEvent('pageshow',{persisted:true}));
assert.equal(payment.open,false);assert.equal($('#arrival').value,'2026-10-05');assert.equal($('#guests').value,'3');
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
assert.deepEqual(Object.fromEntries(pending[0].url.searchParams),Object.fromEntries(target.searchParams));
event(d,d,'pageshow');assert.equal(pending.length,1,'Initial pageshow must not duplicate the query');
const reply=(request,status='available')=>request.resolve({ok:true,json:async()=>({travel:Object.fromEntries([...request.url.searchParams].map(([k,v])=>[k,k==='guests'?Number(v):v])),apartments:[...d.document.querySelectorAll('[data-directory-apartment]')].map(card=>({id:card.dataset.directoryApartment,status,baseCents:42000,currency:'EUR',minimumNights:5}))})});
reply(pending[0]);await tick();
assert.match(q('[data-card-price]').textContent,/505,00/);
assert.equal(q('[data-card-price]').hidden,false);
assert.equal(new URL(q('[data-travel-link]').href).searchParams.get('guests'),'3');
const search=()=>event(d,q('#directory-search'),'submit');
q('[name=departure]').value='2026-10-10';event(d,q('[name=departure]'),'input');
assert.equal(q('[data-card-price]').hidden,true);assert.equal(pending.length,1,'Editing does not auto-submit');
search();const stale=pending.at(-1);
q('[name=departure]').value='2026-10-08';event(d,q('[name=departure]'),'change');search();
assert.equal(stale.options.signal.aborted,true);
reply(pending.at(-1),'minimum_stay');await tick();reply(stale);await tick();
assert.match(q('[data-card-status]').textContent,/Mindestaufenthalt: 5 Nächte · gewählt: 3 Nächte/);assert.equal(q('[data-card-price]').hidden,true);
event(d,d,'pagehide');
d.dispatchEvent(new d.PageTransitionEvent('pageshow',{persisted:true}));
assert.equal(pending.length,4,'Back navigation refreshes availability once');
reply(pending.at(-1),'unavailable');await tick();assert.match(q('[data-card-status]').textContent,/nicht verfügbar/);
search();pending.at(-1).reject(new Error('offline'));await tick();assert.match(q('#travel-status').textContent,/gerade nicht möglich/);
q('#clear-search').click();const count=pending.length;
d.dispatchEvent(new d.PageTransitionEvent('pageshow',{persisted:true}));assert.equal(pending.length,count,'Cleared search must not restart on Back');
d.close();
for(const query of ['', '?arrival=2026-10-05', '?arrival=2026-10-05&departure=2026-10-04&guests=2', '?arrival=2026-02-30&departure=2026-10-09&guests=2', '?arrival=2026-09-29&departure=2026-10-09&guests=2', '?arrival=2026-10-05&departure=2026-10-09&guests=6']) {
  const invalid=await page('dist/apartments/index.html','src/scripts/directory-search.ts',base+'apartments/'+query);
  assert.equal(invalid.requests.length,0,'Invalid/incomplete URL must not query');invalid.w.close();
}
console.log('Startseite/Apartments geprüft: native GET-Übergabe, Validierung, automatische Suche ohne Doppelaufruf, Zurücknavigation, Request-Abbruch, Mindestaufenthalt, Fehler, Texte, Saphir-Link, sechs Kurzansichten, Menü und Dialogfokus. Keine Live-Abfrage oder Testbuchung.');
