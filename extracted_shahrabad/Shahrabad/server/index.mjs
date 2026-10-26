import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
import { getFlightStatus } from './flight-provider.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const cache = new Map();
const pending = new Map();
let budgetStart = Date.now();
let budgetUsed = 0;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };
function json(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
}
const server = createServer(async (request, response) => {
  if (request.method !== 'GET') return json(response, 405, { error: 'Méthode non autorisée' });
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/health') return json(response, 200, { ok: true, flightTrackerConfigured: Boolean(process.env.FR24_API_KEY) });
  if (url.pathname === '/api/flight-status') {
    const number = url.searchParams.get('number') || '';
    const date = url.searchParams.get('date') || '';
    if (number.length > 12 || date.length > 10) return json(response, 400, { connected: false, message: 'Paramètres invalides.' });
    for (const [key, item] of cache) if (Date.now() >= item.expires) cache.delete(key);
    const cacheKey = `${number.toUpperCase()}|${date}`;
    let payload = cache.get(cacheKey)?.payload;
    if (!payload) {
      if (pending.size >= 10 && !pending.has(cacheKey)) return json(response, 429, { connected: false, message: 'Trop de requêtes. Réessaie plus tard.' });
      if (!pending.has(cacheKey)) {
        if (Date.now() - budgetStart >= 60000) { budgetStart = Date.now(); budgetUsed = 0; }
        if (budgetUsed >= 10) return json(response, 429, { connected: false, message: 'Limite de suivi atteinte pour cette minute. Réessaie plus tard.' });
        budgetUsed++;
        pending.set(cacheKey, getFlightStatus(number, date));
      }
      try { payload = await pending.get(cacheKey); } finally { pending.delete(cacheKey); }
      if (cache.size >= 250) cache.delete(cache.keys().next().value);
      const entry = { payload, expires: Date.now() + 60000 };
      cache.set(cacheKey, entry);
      setTimeout(() => { if (cache.get(cacheKey) === entry) cache.delete(cacheKey); }, 60000).unref();
    }
    return json(response, payload.connected ? 200 : 503, payload);
  }
  const allowed = url.pathname === '/' || /^\/(?:index\.html|styles\.css|manus-routes\.json)$/.test(url.pathname) || /^\/(?:src|styles)\/[a-zA-Z0-9._/-]+\.(?:js|mjs|css)$/.test(url.pathname);
  if (!allowed || url.pathname.includes('..')) return json(response, 404, { error: 'Introuvable' });
  try {
    const file = resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + '/')) return json(response, 404, { error: 'Introuvable' });
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(body);
  } catch (_) { json(response, 404, { error: 'Introuvable' }); }
});
const port = Number(process.env.PORT || 3000);
server.listen(port, '0.0.0.0', () => console.log(`Shahrabad disponible sur le port ${port} ; suivi ${process.env.FR24_API_KEY ? 'configuré' : 'non connecté'}.`));
