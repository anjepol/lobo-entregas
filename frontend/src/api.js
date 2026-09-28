const AUTH = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001';
const CATALOG = import.meta.env.VITE_CATALOG_URL || 'http://localhost:3002';
const ORDERS = import.meta.env.VITE_ORDER_URL || 'http://localhost:3003';

const json = async (res) => {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Error');
  return body;
};

const headers = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const register = (data) =>
  fetch(`${AUTH}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(json);

export const login = (data) =>
  fetch(`${AUTH}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(json);

// GraphQL: pedimos solo los campos necesarios
export const fetchRestaurants = () =>
  fetch(`${CATALOG}/graphql`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      query: '{ restaurants { id name address menu { name price } } }',
    }),
  })
    .then(json)
    .then((r) => r.data.restaurants);

export const createOrder = (token, order) =>
  fetch(`${ORDERS}/orders`, { method: 'POST', headers: headers(token), body: JSON.stringify(order) }).then(json);

export const fetchOrders = (token) => fetch(`${ORDERS}/orders`, { headers: headers(token) }).then(json);
