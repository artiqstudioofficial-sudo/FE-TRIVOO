// src/services/http.ts
import { ApiEnvelope } from '@/types';
import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  withCredentials: true, // ✅ session cookie
  headers: { 'Content-Type': 'application/json' },
});

// ✅ error normalization (tanpa unwrap)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || err?.message || 'Network error';

    return Promise.reject(new Error(msg));
  },
);

export default http;

// helper unwrap envelope (lebih clean daripada nulis berulang2)
export function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope.error) throw new Error(envelope.message || 'Request failed');
  return envelope.data;
}
