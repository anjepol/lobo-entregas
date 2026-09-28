const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

test('POST /auth/register rechaza datos inválidos', async () => {
  const server = createApp().listen(0);
  const { port } = server.address();
  const res = await fetch('http://localhost:' + port + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'x@y.com' }),
  });
  server.close();
  assert.strictEqual(res.status, 400);
});
