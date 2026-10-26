import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const child = spawn(process.execPath, ['server/index.mjs'], { env: { ...process.env, PORT: '3101', FR24_API_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
child.stdout.on('data', data => { logs += data; });
child.stderr.on('data', data => { logs += data; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { ready = (await fetch('http://127.0.0.1:3101/health')).ok; } catch (_) {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, logs);
  const health = await (await fetch('http://127.0.0.1:3101/health')).json();
  assert.equal(health.flightTrackerConfigured, false);
  const response = await fetch('http://127.0.0.1:3101/api/flight-status?number=AF002&date=2026-11-18');
  assert.equal(response.status, 503);
  const data = await response.json();
  assert.equal(data.connected, false);
  assert.match(data.message, /activer/);
  assert.equal((await fetch('http://127.0.0.1:3101/')).status, 200);
  assert.equal((await fetch('http://127.0.0.1:3101/manus-routes.json')).status, 200);
  assert.equal((await fetch('http://127.0.0.1:3101/server/flight-provider.mjs')).status, 404);
  assert.equal((await fetch('http://127.0.0.1:3101/.env')).status, 404);
  console.log('OK : serveur local, santé, fichiers statiques et API explicitement déconnectée, aucun fichier serveur/confidentiel exposé.');
} finally { child.kill('SIGTERM'); }
