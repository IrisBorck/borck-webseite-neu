import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = '/borck-webseite-neu/';
const html = fs.readFileSync('dist/index.html', 'utf8');
for (const page of ['index.html', '404.html']) {
  assert.match(fs.readFileSync(`dist/${page}`, 'utf8'), /name="robots" content="noindex, nofollow, noarchive"/, `${page}: noindex fehlt`);
}
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Genau eine H1 erwartet');
assert.equal((html.match(/data-apartment=/g) || []).length, 7, 'Sieben Apartments erwartet');
assert.ok(!html.includes('<iframe'), 'Vorschau darf keine Live-Buchung laden');
assert.ok(!html.includes('googletagmanager'), 'Kein Tracking in der Vorschau');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'IDs müssen eindeutig sein');
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), `Anker fehlt: ${id}`);
for (const [, id] of html.matchAll(/data-open="([^"]+)"/g)) assert.ok(ids.includes(id), `Dialog fehlt: ${id}`);
for (const [, url] of html.matchAll(/(?:src|href)="(\/borck-webseite-neu\/[^"#?]*)"/g)) {
  const target = url.slice(base.length);
  if (target) assert.ok(fs.existsSync(path.join('dist', target)), `Asset fehlt: ${url}`);
}
assert.ok(!fs.existsSync('public/CNAME'), 'Keine Produktivdomain erlaubt');
console.log('Vorschau geprüft: noindex, 7 Apartments, eindeutige IDs, interne Anker, Dialoge, lokale Assets, keine Live-Buchung.');
