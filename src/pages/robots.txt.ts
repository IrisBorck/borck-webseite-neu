export function GET() {
  // Crawling erlauben, damit Suchmaschinen das verbindliche HTML-noindex lesen können.
  return new Response('User-agent: *\nAllow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
