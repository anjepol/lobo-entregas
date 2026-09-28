const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user');

const ROLES = ['cliente', 'repartidor', 'restaurante'];
const secret = () => process.env.JWT_SECRET || 'dev-secret';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

  app.post('/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || password.length < 6 || !ROLES.includes(role)) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, passwordHash, role });
      res.status(201).json({ id: user.id, name, email: user.email, role });
    } catch (e) {
      if (e.code === 11000) return res.status(409).json({ error: 'Correo ya registrado' });
      res.status(500).json({ error: 'Error interno' });
    }
  });

  app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    const user = email && (await User.findOne({ email: String(email).toLowerCase() }));
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, secret(), {
      expiresIn: '8h',
    });
    res.json({ token, role: user.role });
  });

  app.get('/auth/me', (req, res) => {
    const header = req.headers.authorization || '';
    try {
      const payload = jwt.verify(header.replace('Bearer ', ''), secret());
      res.json({ id: payload.sub, role: payload.role, name: payload.name });
    } catch {
      res.status(401).json({ error: 'Token inválido' });
    }
  });

  return app;
}

module.exports = { createApp };
