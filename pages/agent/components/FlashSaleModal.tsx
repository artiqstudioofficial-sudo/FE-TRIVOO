import { Percent, X, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import { FlashSaleCampaign, Product } from '../../../types';

type Props = {
  open: boolean;
  onClose: () => void;

  campaigns: FlashSaleCampaign[];

  selectedCampaign: FlashSaleCampaign | null;
  selectedProduct: Product | null;

  eligibleProducts: Product[];

  isJoiningCampaign: boolean;
  productToJoinId: number | '';
  setProductToJoinId: (v: number | '') => void;

  discountPercentage: string;
  setDiscountPercentage: (v: string) => void;

  onSubmit: () => void;
};

const FlashSaleModal: React.FC<Props> = ({
  open,
  onClose,
  selectedCampaign,
  selectedProduct,
  eligibleProducts,
  isJoiningCampaign,
  productToJoinId,
  setProductToJoinId,
  discountPercentage,
  setDiscountPercentage,
  onSubmit,
}) => {
  const targetProduct = useMemo(() => {
    if (selectedProduct) return selectedProduct;
    if (productToJoinId === '') return null;
    return eligibleProducts.find((p) => p.id === Number(productToJoinId)) || null;
  }, [selectedProduct, productToJoinId, eligibleProducts]);

  const calc = useMemo(() => {
    if (!targetProduct) return null;
    const percentage = Number(discountPercentage);
    if (!discountPercentage || !Number.isFinite(percentage)) return null;

    const finalPrice = Math.round(targetProduct.price * (1 - percentage / 100));
    return { percentage, finalPrice };
  }, [targetProduct, discountPercentage]);

  if (!open) return null;

  const disableSubmit = (isJoiningCampaign && !productToJoinId) || !discountPercentage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Zap className="w-6 h-6 text-orange-500 mr-2 fill-current" />
            {selectedCampaign ? 'Join Campaign' : 'Join Flash Sale'}
          </h3>
          <button
            onClick={onClose}
            className="bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {selectedCampaign ? (
          <div className="mb-6 bg-purple-50 p-4 rounded-xl border border-purple-100">
            <h4 className="font-bold text-purple-900 text-sm mb-1">{selectedCampaign.name}</h4>
            <div className="flex justify-between text-xs text-purple-700">
              <span>
                Min Discount: <strong>{selectedCampaign.minDiscount}%</strong>
              </span>
              <span>
                Fee: <strong>{selectedCampaign.adminFeePercentage}%</strong>
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
            <p className="text-xs text-orange-700">
              You are requesting a standard Flash Sale. Admin fees remain standard unless part of a
              campaign.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {isJoiningCampaign && !selectedProduct && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Select Product</label>
              <select
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
                value={productToJoinId}
                onChange={(e) => {
                  const v = e.target.value ? Number(e.target.value) : '';
                  setProductToJoinId(v);
                  setDiscountPercentage('');
                }}
              >
                <option value="">-- Choose Product --</option>
                {eligibleProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.currency} {p.price})
                  </option>
                ))}
              </select>

              {eligibleProducts.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No eligible products available (others may already be in a sale).
                </p>
              )}
            </div>
          )}

          {(selectedProduct || (isJoiningCampaign && productToJoinId)) && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Discount Percentage (%)
              </label>
              <div className="relative">
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  required
                  min="1"
                  max="99"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="e.g. 20"
                />
              </div>

              {targetProduct && calc && (
                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Original Price:</span>
                    <span className="text-xs font-medium text-gray-900 line-through">
                      {targetProduct.currency} {targetProduct.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-700">Final Sale Price:</span>
                    <span className="text-lg font-bold text-green-600">
                      {targetProduct.currency} {calc.finalPrice}
                    </span>
                  </div>

                  {selectedCampaign && (
                    <div className="mt-2 text-right">
                      <span
                        className={`text-xs ${
                          calc.percentage < selectedCampaign.minDiscount
                            ? 'text-red-500 font-bold'
                            : 'text-green-600'
                        }`}
                      >
                        Required Min: {selectedCampaign.minDiscount}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
            <p>
              Note: Admin will review your request. Once approved, your product will appear in the
              Flash Sale section on the homepage.
            </p>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={disableSubmit}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors mt-4 disabled:opacity-50"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashSaleModal;
