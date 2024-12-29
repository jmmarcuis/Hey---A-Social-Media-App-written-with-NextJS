// src/utils/tokenManager.ts
import { Token } from '../types/Users';

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setToken: (token: Token): void => {
    localStorage.setItem('token', token.token);
  },

  clearToken: (): void => {
    localStorage.removeItem('token');
  },
};
