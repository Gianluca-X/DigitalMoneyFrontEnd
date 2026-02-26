import { UserAccount, User, Transaction, Card } from '../../types';

const baseUrl = process.env.REACT_APP_API_URL;

const request = async (
  path: string,
  method: string = 'GET',
  token?: string,
  body?: any
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Request failed');
  }

  // Si la respuesta es 204 No Content
  if (response.status === 204) return null;

  return response.json();
};

/** ------------------ AUTH ------------------ */
export const login = (email: string, password: string) =>
  request('/auth/login', 'POST', undefined, { email, password });

export const logout = (token: string) => request('/auth/logout', 'POST', token);

/** ------------------ USERS ------------------ */
export const createUser = (user: User) => request('/users/register', 'POST', undefined, user);
export const getUser = (id: string, token: string): Promise<User> =>
  request(`/users/${id}`, 'GET', token);
export const updateUser = (id: string, data: any, token: string) =>
  request(`/users/${id}`, 'PUT', token, data);

/** ------------------ ACCOUNTS ------------------ */
export const getAccount = (accountId: string, token: string): Promise<UserAccount> =>
  request(`/accounts/${accountId}`, 'GET', token);

export const getAccountTransactions = (accountId: string, token: string): Promise<Transaction[]> =>
  request(`/accounts/${accountId}/transactions`, 'GET', token);

export const createCard = (accountId: string, card: any, token: string): Promise<Card> =>
  request(`/accounts/${accountId}/cards`, 'POST', token, card);

export const deleteCard = (accountId: string, cardId: string, token: string) =>
  request(`/accounts/${accountId}/cards/${cardId}`, 'DELETE', token);

/** ------------------ TRANSACTIONS ------------------ */
export const createTransfer = (
  accountId: string,
  payload: { amount: number; origin: string; destination: string; name?: string },
  token: string
) => request(`/accounts/${accountId}/transfers`, 'POST', token, payload);

export const getAccountActivity = (accountId: string, token: string): Promise<Transaction[]> =>
  request(`/accounts/${accountId}/activity`, 'GET', token);
/** ------------------ ADAPTERS PARA FRONT ------------------ */

// Obtener cuenta del usuario
export const getAccounts = async (token: string) => {
  // si tu backend tiene endpoint para listar cuentas
  return request(`/accounts`, 'GET', token);
};

// Actividades del usuario (realmente son actividades de la cuenta)
export const getUserActivities = async (accountId: string, token: string) => {
  return request(`/accounts/${accountId}/activity`, 'GET', token);
};

// Actividad individual
export const getUserActivity = async (
  accountId: string,
  activityId: string,
  token: string
) => {
  const activities = await getUserActivities(accountId, token);
  return activities.find((a: any) => a.id === activityId);
};

// Tarjetas del usuario
export const getUserCards = (accountId: string, token: string) =>
  request(`/accounts/${accountId}/cards`, 'GET', token);

// Crear tarjeta
export const createUserCard = (
  accountId: string,
  card: any,
  token: string
) => createCard(accountId, card, token);

// Eliminar tarjeta
export const deleteUserCard = (
  accountId: string,
  cardId: string,
  token: string
) => deleteCard(accountId, cardId, token);

// Depositar dinero
export const createDepositActivity = (
  accountId: string,
  payload: { amount: number },
  token: string
) => request(`/accounts/${accountId}/deposit`, 'POST', token, payload);

// Transferencia
export const createTransferActivity = (
  accountId: string,
  payload: {
    amount: number;
    origin: string;
    destination: string;
    name?: string;
  },
  token: string
) => createTransfer(accountId, payload, token);

// Actualizar cuenta (alias por ejemplo)
export const updateAccount = (
  accountId: string,
  data: any,
  token: string
) => request(`/accounts/${accountId}`, 'PUT', token, data);

// Alias para compatibilidad
export const createAnUser = createUser;