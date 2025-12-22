import { Edit3, Eye, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import type { AgentProduct } from '../../../types';

type Props = {
  product: AgentProduct;
  onToggleStatus: () => void;
  onDelete: () => void;
  onJoinFlashSale: () => void;
  onNavigateEdit: () => void;
};

const FALLBACK =
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';

function safeUrl(u: any): string {
  if (typeof u === 'string' && u.trim()) return u;
  return FALLBACK;
}

const ProductCard: React.FC<Props> = ({
  product,
  onToggleStatus,
  onDelete,
  onJoinFlashSale,
  onNavigateEdit,
}) => {
  const images = useMemo(() => {
    const arr = Array.isArray((product as any).images) ? (product as any).images : [];
    // pastikan string[]
    return arr
      .map((x: any) => (typeof x === 'string' ? x : x?.url || x?.image_url))
      .filter(Boolean);
  }, [product]);

  const cover = safeUrl((product as any).image || images[0] || (product as any).image_url);

  const extraCount = Math.max(0, images.length - 1);
  const thumbs = images.slice(0, 4); // mini thumbs max 4

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Cover */}
        <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100">
          <img
            src={cover}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK;
            }}
          />

          {/* Badge +N */}
          {extraCount > 0 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-bold bg-black/60 text-white">
              +{extraCount}
            </div>
          )}

          {/* Status pill */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold bg-white/80 text-gray-800">
            {product.is_active ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500 truncate">{product.location || '-'}</p>
            </div>

            <div className="text-right">
              <div className="text-sm font-extrabold text-gray-900">
                {product.currency} {Number(product.price).toLocaleString()}
              </div>
              {!!(product as any).rating && (
                <div className="text-xs text-gray-500">⭐ {product.rating}</div>
              )}
            </div>
          </div>

          {/* Mini thumbnails (optional) */}
          {thumbs.length > 1 && (
            <div className="mt-3 flex items-center gap-2">
              {thumbs.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={safeUrl(url)}
                    alt={`thumb-${idx}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK;
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={onNavigateEdit}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>

            <button
              onClick={onToggleStatus}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-900 text-sm font-bold hover:bg-gray-200"
            >
              {product.is_active ? (
                <>
                  <ToggleRight className="w-4 h-4" /> Disable
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" /> Enable
                </>
              )}
            </button>

            <button
              onClick={onJoinFlashSale}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700"
            >
              <Eye className="w-4 h-4" /> Flash Sale
            </button>

            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-bold hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
