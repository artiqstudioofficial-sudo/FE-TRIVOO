import { Product } from '@/types';

/**
 * Shape response dari BE (snake_case)
 * contoh:
 * {
 *   id, owner_id, category_id, daily_capacity, is_active, created_at, image
 * }
 */
export type ApiAgentProductRow = {
  id: number;
  owner_id: number;
  category_id: number;
  name: string;
  description: string;
  price: number | string;
  currency: string;
  location: string;
  image?: string; // BE kamu pakai ini
  image_url?: string; // jaga-jaga kalau berubah
  daily_capacity?: number;
  rating?: number | string;
  is_active?: boolean | 0 | 1;
  created_at?: string;

  // optional kalau nanti BE sudah lengkap
  images?: string[];
  features?: string[];
  details?: any;
  blocked_dates?: string[];
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';

export function mapApiAgentProductToProduct(row: ApiAgentProductRow): Product {
  return {
    // ---- core fields yang pasti dipakai ProductCard
    id: row.id,
    ownerId: row.owner_id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    location: row.location,
    image: row.image || row.image_url || DEFAULT_IMAGE,

    // ---- optional fields (buat page lain)
    images: Array.isArray(row.images) ? row.images : [],
    features: Array.isArray(row.features) ? row.features : [],
    details: row.details ?? null,
    dailyCapacity: typeof row.daily_capacity === 'number' ? row.daily_capacity : 10,
    rating: row.rating ? Number(row.rating) : 0,
    isActive: !!row.is_active,
    createdAt: row.created_at,

    // ---- field yang biasanya ada di mock Product biar UI aman
    flashSale: null,
    reviews: [],
  } as Product;
}
