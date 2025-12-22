import type { AgentProduct, AgentProductPayload, ApiEnvelope, RawAgentProduct } from '../types';
import http, { unwrap } from './http';

type ProductEnvelope<T> = ApiEnvelope<T>;

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';

function normalizeProduct(data: RawAgentProduct): AgentProduct {
  return {
    id: data.id,
    owner_id: data.owner_id,
    category_id: data.category_id,
    name: data.name,
    description: data.description,
    price: Number(data.price),
    currency: data.currency,
    location: data.location,
    image: data.image_url || data.image || DEFAULT_IMAGE,
    images: Array.isArray(data.images) ? data.images : [],
    features: Array.isArray(data.features) ? data.features : [],
    details: data.details ?? undefined,
    daily_capacity: data.daily_capacity ?? 10,
    rating: data.rating ? Number(data.rating) : 0,
    is_active: !!data.is_active,
    created_at: data.created_at,
  };
}

async function mapOne<T>(req: Promise<{ data: ProductEnvelope<T> }>): Promise<T> {
  const res = await req;
  return unwrap(res.data);
}

export const agentProductService = {
  async createProduct(payload: AgentProductPayload): Promise<AgentProduct> {
    const raw = await mapOne(
      http.post<ProductEnvelope<RawAgentProduct>>('/agent/products', payload),
    );
    return normalizeProduct(raw);
  },

  async updateProduct(id: number, payload: AgentProductPayload): Promise<AgentProduct> {
    const raw = await mapOne(
      http.put<ProductEnvelope<RawAgentProduct>>(`/agent/products/${id}`, payload),
    );
    return normalizeProduct(raw);
  },

  async getMyProduct(id: number): Promise<AgentProduct> {
    const raw = await mapOne(http.get<ProductEnvelope<RawAgentProduct>>(`/agent/products/${id}`));
    return normalizeProduct(raw);
  },

  async getMyProducts(): Promise<AgentProduct[]> {
    const rows = await mapOne(http.get<ProductEnvelope<RawAgentProduct[]>>('/agent/products'));
    return rows.map(normalizeProduct);
  },
};
