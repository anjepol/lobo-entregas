const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

test('POST /orders sin token devuelve 401', async () => {
  const server = createApp().listen(0);
  const { port } = server.address();
  const res = await fetch('http://localhost:' + port + '/orders', { method: 'POST' });
  server.close();
  assert.strictEqual(res.status, 401);
});
