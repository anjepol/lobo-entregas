import React, { useEffect, useState } from 'react';
import { login, register, fetchRestaurants, createOrder, fetchOrders } from './api.js';

function AuthForm({ onToken }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cliente' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    try {
      setError('');
      if (mode === 'register') await register(form);
      const { token } = await login(form);
      onToken(token);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="card">
      <h2>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
      {mode === 'register' && (
        <>
          <input placeholder="Nombre" value={form.name} onChange={set('name')} />
          <select value={form.role} onChange={set('role')}>
            <option value="cliente">Cliente</option>
            <option value="repartidor">Repartidor</option>
            <option value="restaurante">Restaurante</option>
          </select>
        </>
      )}
      <input placeholder="Correo" value={form.email} onChange={set('email')} />
      <input type="password" placeholder="Contraseña" value={form.password} onChange={set('password')} />
      {error && <p className="error">{error}</p>}
      <button onClick={submit}>{mode === 'login' ? 'Entrar' : 'Registrarme'}</button>
      <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? '¿Sin cuenta? Regístrate' : 'Ya tengo cuenta'}
      </button>
    </div>
  );
}

function Home({ token, onLogout }) {
  const [restaurants, setRestaurants] = useState([]);
  const [cart, setCart] = useState({ restaurantId: null, items: [] });
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState('');

  const loadOrders = () => fetchOrders(token).then(setOrders).catch(() => {});
  useEffect(() => {
    fetchRestaurants().then(setRestaurants).catch((e) => setMsg(e.message));
    loadOrders();
  }, []);

  const add = (r, item) => {
    const items = cart.restaurantId === r.id ? [...cart.items] : [];
    const found = items.find((i) => i.name === item.name);
    found ? found.qty++ : items.push({ ...item, qty: 1 });
    setCart({ restaurantId: r.id, items });
  };

  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);

  const checkout = async () => {
    try {
      await createOrder(token, cart);
      setCart({ restaurantId: null, items: [] });
      setMsg('Pedido creado');
      loadOrders();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <>
      <header>
        <h1>🐺 Lobo entregas</h1>
        <button className="link" onClick={onLogout}>Salir</button>
      </header>
      {msg && <p className="note">{msg}</p>}
      <h2>Restaurantes</h2>
      {restaurants.map((r) => (
        <div className="card" key={r.id}>
          <h3>{r.name}</h3>
          <small>{r.address}</small>
          {r.menu.map((m) => (
            <div className="row" key={m.name}>
              <span>{m.name} · ${m.price}</span>
              <button onClick={() => add(r, m)}>Agregar</button>
            </div>
          ))}
        </div>
      ))}
      <div className="card">
        <h2>Carrito</h2>
        {cart.items.map((i) => (
          <div className="row" key={i.name}>
            <span>{i.qty} × {i.name}</span>
            <span>${i.price * i.qty}</span>
          </div>
        ))}
        <strong>Total: ${total}</strong>
        <button disabled={!cart.items.length} onClick={checkout}>Confirmar pedido</button>
      </div>
      <h2>Mis pedidos</h2>
      {orders.map((o) => (
        <div className="card" key={o._id}>
          <div className="row"><span>#{o._id.slice(-6)}</span><b>{o.status}</b></div>
          <span>${o.total}</span>
        </div>
      ))}
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  return (
    <main>
      {token ? <Home token={token} onLogout={() => setToken(null)} /> : <AuthForm onToken={setToken} />}
    </main>
  );
}
