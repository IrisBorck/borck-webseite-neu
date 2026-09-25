import assert from 'node:assert/strict';
import fs from 'node:fs';
const html = fs.readFileSync('dist/apartments/saphir/index.html','utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert.match(html,/name="robots" content="noindex, nofollow, noarchive"/);
assert.equal((html.match(/data-photo="/g)||[]).length,6);
assert.equal((html.match(/data-photo-entry/g)||[]).length,14);
assert.match(html,/Alle 14 Fotos ansehen/);
assert.ok(!html.includes('viewer-description'));
assert.ok(!html.includes('Buchungen sind hier noch nicht möglich'));
assert.match(html,/data-src="https:\/\/booking.smoobu.com\/9A40536\?apartmentId=133655"/);
assert.ok(!/<iframe[^>]*\ssrc="https:\/\/booking\.smoobu\.com/.test(html), 'Buchungsiframe erst bei Öffnung laden');
for(const s of ['Wohn- &amp; Essbereich','Einbauküche','Induktionskochfeld','Backofen mit Mikrowellenfunktion','Geschirrspüler','Kühlschrank mit Gefrierfach','Kaffeemaschine','Wasserkocher','Toaster','Haartrockner','180 cm','90 cm','Etagenbett','Kopfkissen','Bettdecken','SAT-Anschluss','DAB+','Fahrradträger','Münzwaschmaschine','Münztrockner','Babybett','Hochstuhl','Zweiter Hund','Weitere Entfernungen anzeigen','Mehr zu Lage &amp; Anfahrt','Kurabgabe berechnen','Saphir direkt buchen']) assert.ok(html.includes(s),s);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'eindeutige IDs');
for(const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id),`Anker ${id}`);
for(const [,url] of html.matchAll(/(?:src|href)="(\/borck-webseite-neu\/[^"#?]*)"/g)) {
 const file = decodeURI(url.slice('/borck-webseite-neu/'.length));
 if(file) assert.ok(fs.existsSync(`dist/${file}`),file);
}
const local = fs.readFileSync('src/scripts/visitor-tax.ts','utf8') + fs.readFileSync('src/lib/visitor-tax.mjs','utf8');
assert.ok(!/\b(fetch|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|postMessage)\s*[.(]/.test(local),'keine Übertragung/Speicherung aus dem Rechner');
console.log('Saphir geprüft: 14 Bilder, sechs Vorschauen, Inhaltsabgleich, Buchungszuordnung, HTML, Anker, Assets, Datensparsamkeit.');
