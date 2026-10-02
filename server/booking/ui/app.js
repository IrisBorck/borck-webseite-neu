const $=id=>document.getElementById(id),money=n=>(n/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
let cfg,quote,busy=false,pending=null;
const remember=value=>{pending=value;sessionStorage.setItem('aq-pilot-attempt',JSON.stringify(value));};
async function api(path,body){
 const response=await fetch('/pilot/'+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',signal:AbortSignal.timeout(45000),cache:'no-store',redirect:'error',headers:body===undefined?{}:{'Content-Type':'application/json','X-Aquamarin-Request':'booking'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const value=await response.json();if(!response.ok){const e=Error(value.error||'temporarily_unavailable');e.status=response.status;throw e;}return value;
}
const errors={not_available:'Der Zeitraum ist nicht verfügbar.',quote_expired:'Das Angebot ist abgelaufen. Bitte neu berechnen.',live_write_disabled:'Der Live-Schreibzugang ist deaktiviert.',live_preflight_required:'Vor dem Live-Test ist eine aktuelle Freigabeprüfung erforderlich.',pilot_already_used:'Für diesen Test existiert bereits ein Buchungsvorgang. Bitte zuerst dessen Status prüfen.',invalid_guest:'Bitte prüfe deine Kontaktdaten.',invalid_email:'Bitte prüfe die E-Mail-Adresse.',invalid_phone:'Bitte prüfe die Telefonnummer.',idempotency_conflict:'Dieser Vorgang wurde bereits mit anderen Angaben übermittelt. Bitte den Status prüfen.'};
const error=e=>{$('error').textContent=errors[e.message]||'Die Anfrage konnte nicht sicher abgeschlossen werden. Bitte den bestehenden Vorgang prüfen.';};
function renderQuote(q){
 quote=q;$('guest').elements.accepted.checked=false;$('lines').replaceChildren();for(const line of q.price.lines){const row=document.createElement('div'),term=document.createElement('dt'),amount=document.createElement('dd');term.textContent=line.label;amount.textContent=money(line.cents);row.append(term,amount);$('lines').append(row);}
 $('total').textContent=money(q.price.totalCents);$('expiry').textContent='Angebot gültig bis '+new Date(q.expiresAt).toLocaleTimeString('de-DE',{timeZone:'Europe/Berlin'})+' Uhr (deutsche Zeit).';
 $('payments').replaceChildren();for(const p of q.price.payments){const li=document.createElement('li');li.textContent=`${p.kind==='deposit'?'Anzahlung':p.kind==='balance'?'Restzahlung':'Gesamtzahlung'}: ${money(p.cents)} bis ${p.due.split('-').reverse().join('.')}`;$('payments').append(li);}
 $('offer').hidden=false;$('checkout').hidden=false;$('submit-button').disabled=cfg.mode==='live'&&!cfg.liveWriteEnabled;
}
function showResult(b){
 renderQuote(b.quote);$('result').hidden=false;$('reference').textContent=`Vorgang ${b.id}${b.reservationId?' · Smoobu-ID '+b.reservationId:''}`;
 const texts={confirmed:'Reservierung bestätigt. Der Zeitraum wurde in Smoobu als nicht verfügbar zurückgemeldet.',checking:'Verfügbarkeit und Preis werden abschließend geprüft.',submitting:'Die Reservierung wird übermittelt. Bitte nicht erneut buchen.',uncertain:'Der Ausgang ist noch ungeklärt. Bitte Status erneut prüfen; es wird kein weiterer Anlageversuch gestartet.',review:'Die Rückmeldung muss manuell geprüft werden. Bitte keine neue Buchung starten.',rejected:'Es wurde vor dem Anlageversuch abgebrochen. Bitte Angaben und Verfügbarkeit prüfen.',price_changed:'Der Preis oder Zahlungsplan hat sich geändert. Bitte ein neues Angebot berechnen und erneut bestätigen.'};
 $('state').textContent=(cfg.mode==='simulation'?'SIMULATION – keine echte Reservierung. ':'')+texts[b.state];
 const terminal=['rejected','price_changed'].includes(b.state);
 $('guest-fields').disabled=!terminal;for(const el of $('selection').elements)el.disabled=!terminal;
 if(terminal){quote=null;pending=null;sessionStorage.removeItem('aq-pilot-attempt');$('checkout').hidden=true;}
 $('refresh').disabled=['confirmed','review','rejected','price_changed'].includes(b.state);
 $('result').focus();
}
$('selection').addEventListener('change',()=>{if(!pending){quote=null;$('offer').hidden=true;$('checkout').hidden=true;}});
$('selection').addEventListener('submit',async e=>{e.preventDefault();if(busy||pending)return;busy=true;$('error').textContent='';$('offer-button').disabled=true;
 try{const form=new FormData(e.target),extras=Object.fromEntries(['linen','towels','cot','chair','dogs'].map(k=>[k,Number(form.get(k))]));renderQuote(await api('quotes',{arrival:cfg.scope.arrival,departure:cfg.scope.departure,adults:2,children:0,extras,regularTax:form.has('regularTax')}));$('result').hidden=true;}
 catch(e){error(e);}finally{busy=false;$('offer-button').disabled=false;}});
$('guest').addEventListener('submit',async e=>{e.preventDefault();if(busy||!quote||pending)return;busy=true;$('error').textContent='';
 const form=new FormData(e.target),guest=Object.fromEntries(['firstName','lastName','email','phone','street','postalCode','city','country'].map(k=>[k,form.get(k)]));
 remember({key:crypto.randomUUID(),quoteId:quote.id});$('guest-fields').disabled=true;for(const el of $('selection').elements)el.disabled=true;
 try{const b=await api('bookings',{quoteId:quote.id,key:pending.key,guest,accepted:form.has('accepted')});remember({...pending,id:b.id});showResult(b);}
 catch(e){error(e);if(['invalid_guest','invalid_email','invalid_phone','unsupported_country','live_write_disabled','live_preflight_required','quote_expired'].includes(e.message)){pending=null;sessionStorage.removeItem('aq-pilot-attempt');$('guest-fields').disabled=false;for(const el of $('selection').elements)el.disabled=false;quote=null;$('checkout').hidden=true;return;}$('result').hidden=false;$('state').textContent='Noch keine sichere Rückmeldung. Über „Status erneut prüfen“ den vorhandenen Vorgang suchen.';$('refresh').disabled=false;}
 finally{busy=false;}});
async function refresh(){if(!pending)return;try{let b=pending.id?await api('bookings/'+pending.id):await api('attempts/'+pending.key);remember({...pending,id:b.id});b=await api('bookings/'+b.id+'/reconcile',{});showResult(b);$('error').textContent='';}catch(e){error(e);}}
$('refresh').addEventListener('click',refresh);
try{
 cfg=await api('config');$('mode').textContent=cfg.mode==='simulation'?'SIMULATION: Alle Anbieterantworten und Preise sind Testdaten. Es werden keine echten Reservierungen erzeugt.':cfg.liveWriteEnabled?'LIVE-TEST: Dieser Abschluss kann eine echte Smoobu-Reservierung und Gästenachrichten auslösen.':'LIVE-LESEN: Echte Angebote, aber der Buchungsabschluss ist deaktiviert.';
 $('submit-button').textContent=cfg.mode==='simulation'?'Buchung simulieren':'Zahlungspflichtig buchen';
 pending=JSON.parse(sessionStorage.getItem('aq-pilot-attempt')||'null');if(pending){$('offer-button').disabled=true;$('result').hidden=false;await refresh();}
}catch(e){error(e);$('offer-button').disabled=true;}
