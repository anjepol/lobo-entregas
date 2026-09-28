const express = require('express');
const Order = require('./order');
const { authenticate, requireRole } = require('./auth');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'order-service' }));

  // Checkout: el cliente crea un pedido
  app.post('/orders', authenticate, requireRole('cliente'), async (req, res) => {
    const { restaurantId, items } = req.body || {};
    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Pedido inválido' });
    }
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const order = await Order.create({ customerId: req.user.sub, restaurantId, items, total });
    res.status(201).json(order);
  });

  // Seguimiento: clientes ven los suyos; restaurante/repartidor ven todos
  app.get('/orders', authenticate, async (req, res) => {
    const filter = req.user.role === 'cliente' ? { customerId: req.user.sub } : {};
    res.json(await Order.find(filter).sort({ createdAt: -1 }));
  });

  app.get('/orders/:id', authenticate, async (req, res) => {
    const o = await Order.findById(req.params.id).catch(() => null);
    if (!o) return res.status(404).json({ error: 'No encontrado' });
    if (req.user.role === 'cliente' && o.customerId !== req.user.sub) {
      return res.status(403).json({ error: 'Sin permisos' });
    }
    res.json(o);
  });

  app.patch('/orders/:id/status', authenticate, requireRole('restaurante', 'repartidor'), async (req, res) => {
    if (!Order.STATUSES.includes(req.body?.status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).catch(() => null);
    o ? res.json(o) : res.status(404).json({ error: 'No encontrado' });
  });

  return app;
}

module.exports = { createApp };
