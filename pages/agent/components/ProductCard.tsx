import { Edit, Eye, MapPin, Power, Star, Trash2, Zap } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../../types';
import ProductSpecs from './ProductSpecs';

type Props = {
  product: Product;
  onToggleStatus: () => void;
  onDelete: () => void;
  onJoinFlashSale: () => void;
  onNavigateEdit: () => void;
};

const ProductCard: React.FC<Props> = ({
  product,
  onToggleStatus,
  onDelete,
  onJoinFlashSale,
  onNavigateEdit,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 group">
      {/* Image */}
      <div className="w-full md:w-48 h-48 md:h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
        <img
          src={product.image}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={product.name}
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
          ID: {product.id}
        </div>

        {product.flashSale && (
          <div
            className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm flex items-center ${
              product.flashSale.status === 'approved'
                ? 'bg-red-600 text-white'
                : product.flashSale.status === 'pending'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Zap className="w-3 h-3 mr-1 fill-current" />
            {product.flashSale.status === 'approved'
              ? 'Flash Sale Active'
              : product.flashSale.status === 'pending'
              ? 'Reviewing Promo'
              : 'Promo Ended'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> {product.location}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              {product.rating || 'New'}{' '}
              <span className="text-gray-400 font-normal">({product.reviews?.length || 0})</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>

          <ProductSpecs product={product} />
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Price</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-gray-900">
                {product.currency} {product.price}
              </p>
              {product.flashSale?.status === 'approved' && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                  Promo: {product.flashSale.salePrice}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!product.flashSale && (
              <button
                onClick={onJoinFlashSale}
                className="flex items-center px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all border border-orange-200"
                title="Join Flash Sale"
              >
                <Zap className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Join Promo</span>
              </button>
            )}

            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            <button
              onClick={onToggleStatus}
              className={`flex items-center px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                product.isActive
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
              title="Toggle Status"
            >
              <Power className="w-3.5 h-3.5" />
            </button>

            <Link
              to={`/product/${product.id}`}
              className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg hover:text-primary-600 transition-colors border border-transparent hover:border-gray-200"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={onNavigateEdit}
              className="p-2 text-gray-400 hover:bg-blue-50 rounded-lg hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:bg-red-50 rounded-lg hover:text-red-500 transition-colors border border-transparent hover:border-red-100"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
