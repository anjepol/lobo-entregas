const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const Restaurant = require('./restaurant');
const { schema, rootValue } = require('./graphql');
const { authenticate, requireRole } = require('./auth');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'catalog-service' }));

  // GraphQL: consultas del cliente (evita sobrecarga de datos)
  app.all('/graphql', createHandler({ schema, rootValue }));

  // REST: operaciones estándar
  app.get('/restaurants', async (_req, res) => res.json(await Restaurant.find()));

  app.get('/restaurants/:id', async (req, res) => {
    const r = await Restaurant.findById(req.params.id).catch(() => null);
    r ? res.json(r) : res.status(404).json({ error: 'No encontrado' });
  });

  app.post('/restaurants', authenticate, requireRole('restaurante'), async (req, res) => {
    const { name, address, menu } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });
    const r = await Restaurant.create({ name, address, menu: menu || [], ownerId: req.user.sub });
    res.status(201).json(r);
  });

  app.post('/restaurants/:id/menu', authenticate, requireRole('restaurante'), async (req, res) => {
    const r = await Restaurant.findOne({ _id: req.params.id, ownerId: req.user.sub }).catch(() => null);
    if (!r) return res.status(404).json({ error: 'No encontrado' });
    r.menu.push(req.body);
    await r.save();
    res.status(201).json(r);
  });

  return app;
}

module.exports = { createApp };
