// Pessoas que usam o app. Sem login: a escolha fica salva no aparelho.
export const USERS = [
  { id: 'lucas', name: 'Lucas' },
  { id: 'anthony', name: 'Anthony' },
];

export const DEFAULT_USER = 'lucas';

export const isValidUser = (id) => USERS.some((u) => u.id === id);
export const getUser = (id) => USERS.find((u) => u.id === id) ?? null;
