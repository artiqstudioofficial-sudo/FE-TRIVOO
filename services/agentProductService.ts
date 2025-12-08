import { ProductDetails } from '../types';

const API_BASE = 'http://localhost:4000/api/v1';

export interface AgentProduct {
  id: number;
  ownerId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  image: string;
  images: string[];
  features: string[];
  details?: ProductDetails;
  dailyCapacity?: number;
  blockedDates?: string[];
}

export interface AgentProductPayload {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  image: string;
  images: string[];
  features: string[];
  details?: ProductDetails;
  dailyCapacity?: number;
  blockedDates?: string[];
}

interface ApiResponse<T> {
  status: number;
  error: boolean;
  message: string;
  data: T;
}

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || json.error) {
    throw new Error(json.message || 'Request failed');
  }

  return json.data;
}

export const agentProductService = {
  createProduct(payload: AgentProductPayload): Promise<AgentProduct> {
    return authFetch<AgentProduct>('/agent/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateProduct(id: number, payload: AgentProductPayload): Promise<AgentProduct> {
    return authFetch<AgentProduct>(`/agent/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getMyProduct(id: number): Promise<AgentProduct> {
    return authFetch<AgentProduct>(`/agent/products/${id}`, {
      method: 'GET',
    });
  },

  getMyProducts(): Promise<AgentProduct[]> {
    return authFetch<AgentProduct[]>('/agent/products/my', {
      method: 'GET',
    });
  },
};
