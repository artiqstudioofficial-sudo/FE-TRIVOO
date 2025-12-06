// src/services/authService.ts
import { User } from '../types';
import http from './http';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'CUSTOMER' | 'AGENT' | 'ADMIN';
  specialization?: string; // kalau AGENT bisa kirim specialization
}

interface AuthResponseData {
  token: string;
  user: User;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const res = await http.post('/auth/login', payload);

    // backend pakai misc.response:
    // { status, error, message, data: { token, user } }
    const data = res.data.data as AuthResponseData;

    // simpan token
    localStorage.setItem('token', data.token);

    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const res = await http.post('/auth/register', payload);
    const data = res.data.data as AuthResponseData;

    localStorage.setItem('token', data.token);

    return data;
  },

  async me(): Promise<User> {
    const res = await http.get('/auth/me');
    // { status, error, message, data: { user } }
    const user = res.data.data.user as User;
    return user;
  },

  logout() {
    localStorage.removeItem('token');
  },
};
