const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

test('GET /health responde ok', async () => {
  const server = createApp().listen(0);
  const { port } = server.address();
  const res = await fetch('http://localhost:' + port + '/health');
  const body = await res.json();
  server.close();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.status, 'ok');
});
