import type {
  AgentProduct,
  AgentProductPayload,
  ApiEnvelope,
  RawAgentProduct,
} from "../types";
import http, { unwrap } from "./http";

type ProductEnvelope<T> = ApiEnvelope<T>;

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80";

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
    image: data.image_url || (data as any).image || DEFAULT_IMAGE,
    images: Array.isArray((data as any).images) ? (data as any).images : [],
    features: Array.isArray((data as any).features)
      ? (data as any).features
      : [],
    details: (data as any).details ?? undefined,
    daily_capacity: (data as any).daily_capacity ?? 10,
    blocked_dates: (data as any).blocked_dates ?? [],
    rating: (data as any).rating ? Number((data as any).rating) : 0,
    is_active: !!(data as any).is_active,
    created_at: (data as any).created_at,
  } as any;
}

async function mapOne<T>(
  req: Promise<{ data: ProductEnvelope<T> }>
): Promise<T> {
  const res = await req;
  return unwrap(res.data);
}

function extractUploadedUrls(payload: any): string[] {
  // fleksibel: server bisa balikin array string, array object, atau {images: ...}
  const pick = (arr: any[]): string[] => {
    if (!Array.isArray(arr)) return [];
    if (arr.length === 0) return [];
    if (typeof arr[0] === "string") return arr.filter(Boolean);
    if (typeof arr[0] === "object") {
      return arr
        .map((x) => x?.url || x?.image_url || x?.image || x?.path)
        .filter(Boolean);
    }
    return [];
  };

  if (Array.isArray(payload)) return pick(payload);
  if (payload?.images) return pick(payload.images);
  if (payload?.data && Array.isArray(payload.data)) return pick(payload.data);
  return [];
}

export const agentProductService = {
  async createProduct(payload: AgentProductPayload): Promise<AgentProduct> {
    const raw = await mapOne(
      http.post<ProductEnvelope<RawAgentProduct>>("/agent/products", payload)
    );
    return normalizeProduct(raw);
  },

  async updateProduct(
    id: number,
    payload: AgentProductPayload
  ): Promise<AgentProduct> {
    const raw = await mapOne(
      http.put<ProductEnvelope<RawAgentProduct>>(
        `/agent/products/${id}`,
        payload
      )
    );
    return normalizeProduct(raw);
  },

  async getMyProduct(id: number): Promise<AgentProduct> {
    const raw = await mapOne(
      http.get<ProductEnvelope<RawAgentProduct>>(`/agent/products/${id}`)
    );
    return normalizeProduct(raw);
  },

  async getMyProducts(): Promise<AgentProduct[]> {
    const rows = await mapOne(
      http.get<ProductEnvelope<RawAgentProduct[]>>("/agent/products")
    );
    return rows.map(normalizeProduct);
  },

  /**
   * ✅ Upload image(s) lewat endpoint yang ADA sekarang:
   * POST /agent/products/:id/images (multipart/form-data)
   * Return: array URL (ditarik fleksibel dari response)
   */
  async uploadProductImages(
    productId: number,
    files: File[]
  ): Promise<string[]> {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f, f.name));

    const uploaded = await mapOne(
      http.post<ProductEnvelope<any>>(
        `/agent/products/${productId}/images`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
    );

    console.log(uploaded);

    return extractUploadedUrls(uploaded);
  },
};
