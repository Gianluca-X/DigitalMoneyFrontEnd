Así que tu frontend hace peticiones a rutas que tu backend no conoce → 404 y errores de lógica.

---

## ✅ Cómo debe lucir tu `api.ts` o util de conexiones

Reemplaza todo tu código de utils para usar los endpoints reales.  
Te dejo una versión ya corregida y alineada con tu backend:

```ts
const baseUrl = import.meta.env.VITE_API_URL;

// función genérica para todos los requests
const request = async (endpoint: string, method: string, token?: string, body?: any) => {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: error.message || 'Error en la petición',
    };
  }

  return response.json();
};

// AUTH
export const login = (email: string, password: string) =>
  request(`/auth/login`, 'POST', undefined, { email, password });

export const logout = (token: string) =>
  request(`/auth/logout`, 'POST', token);

// USERS
export const registerUser = (user: any) =>
  request(`/users/register`, 'POST', undefined, user);

export const getUser = (userId: string, token: string) =>
  request(`/users/${userId}`, 'GET', token);

export const updateUser = (userId: string, data: any, token: string) =>
  request(`/users/${userId}`, 'PUT', token, data);

// ACCOUNT
export const getAccount = (accountId: string, token: string) =>
  request(`/accounts/${accountId}`, 'GET', token);

export const getAccountTransactions = (accountId: string, token: string) =>
  request(`/accounts/${accountId}/transactions`, 'GET', token);

export const createCardForAccount = (accountId: string, card: any, token: string) =>
  request(`/accounts/${accountId}/cards`, 'POST', token, card);

export const deleteCardForAccount = (
  accountId: string,
  cardId: string,
  token: string
) => request(`/accounts/${accountId}/cards/${cardId}`, 'DELETE', token);

// TRANSFERS / ACTIVITY
export const createTransfer = (
  accountId: string,
  transferData: any,
  token: string
) => request(`/accounts/${accountId}/transfers`, 'POST', token, transferData);

export const getAccountActivity = (accountId: string, token: string) =>
  request(`/accounts/${accountId}/activity`, 'GET', token);