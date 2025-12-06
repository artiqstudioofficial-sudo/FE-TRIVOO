
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockService } from '../../services/mockService';
import { Product, AgentSpecialization, FlashSaleCampaign } from '../../types';
import { Plus, Edit, Trash2, MapPin, Eye, Power, Users, BedDouble, Bath, Coffee, Clock, Mountain, Car, Briefcase, Star, Settings, Image as ImageIcon, Zap, X, Calendar, Gift, Percent } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useToast } from '../../components/ToastContext';

const AgentProducts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<FlashSaleCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Flash Sale Modal State
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<FlashSaleCampaign | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState('');

  // Join Campaign Logic (Select Product First)
  const [isJoiningCampaign, setIsJoiningCampaign] = useState(false);
  const [productToJoinId, setProductToJoinId] = useState<number | ''>('');

  useEffect(() => {
    if (user) {
        loadData();
    }
  }, [user]);

  const loadData = async () => {
      if (!user) return;
      const [prodData, campaignData] = await Promise.all([
          mockService.getAgentProducts(user.id),
          mockService.getCampaigns()
      ]);
      setProducts(prodData);
      setCampaigns(campaignData);
      setIsLoading(false);
  };

  const handleToggleStatus = async (id: number) => {
      await mockService.toggleProductStatus(id);
      loadData();
  };

  const handleDelete = async (id: number) => {
      if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
          await mockService.deleteProduct(id);
          loadData();
      }
  };

  // --- Flash Sale Logic ---
  const openFlashSaleModal = (product: Product, campaign?: FlashSaleCampaign) => {
      setSelectedProduct(product);
      if (campaign) {
          setSelectedCampaign(campaign);
          setIsJoiningCampaign(true);
      } else {
          setSelectedCampaign(null);
          setIsJoiningCampaign(false);
      }
      setDiscountPercentage('10'); // Default to 10% off
      setShowFlashSaleModal(true);
  };

  const openCampaignJoinModal = (campaign: FlashSaleCampaign) => {
      setSelectedCampaign(campaign);
      setIsJoiningCampaign(true);
      // Reset selections
      setSelectedProduct(null);
      setProductToJoinId('');
      setDiscountPercentage('');
      setShowFlashSaleModal(true);
  };

  const submitFlashSale = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const targetProduct = isJoiningCampaign 
          ? products.find(p => p.id === Number(productToJoinId)) 
          : selectedProduct;

      if (!targetProduct) return;
      
      const percentage = parseFloat(discountPercentage);
      if (percentage <= 0 || percentage >= 100) {
          showToast('Invalid discount percentage', 'error');
          return;
      }

      // Campaign validation
      if (selectedCampaign) {
          if (percentage < selectedCampaign.minDiscount) {
              showToast(`Campaign requires minimum ${selectedCampaign.minDiscount}% discount.`, 'error');
              return;
          }
      }

      // Calculate the final price based on discount
      const calculatedSalePrice = Math.round(targetProduct.price * (1 - percentage / 100));

      await mockService.requestFlashSale(targetProduct.id, calculatedSalePrice, selectedCampaign?.id);
      showToast('Request submitted successfully!', 'success');
      setShowFlashSaleModal(false);
      loadData();
  };

  // --- HELPER UNTUK MENAMPILKAN SPESIFIKASI SESUAI TIPE AGEN ---
  const renderProductSpecs = (product: Product) => {
      const d = product.details;
      if (!d) return null;

      // 1. Tampilan Khusus Penginapan (Stay)
      if (d.type === 'stay') {
          return (
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 font-medium">
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <BedDouble className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                      {d.beds} Beds
                  </div>
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <Bath className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                      {d.bathrooms} Baths
                  </div>
                  {d.breakfastIncluded && (
                      <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          <Coffee className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                          Breakfast
                      </div>
                  )}
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <span className="text-primary-600 font-bold mr-1.5 uppercase text-[10px]">{d.stayCategory}</span>
                  </div>
              </div>
          );
      }

      // 2. Tampilan Khusus Wisata (Tour)
      if (d.type === 'tour') {
          return (
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 font-medium">
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                      {d.duration}
                  </div>
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                      Max {d.groupSize}
                  </div>
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <Mountain className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                      {d.difficulty}
                  </div>
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <span className="text-primary-600 font-bold mr-1.5 uppercase text-[10px]">{d.tourCategory}</span>
                  </div>
              </div>
          );
      }

      // 3. Tampilan Khusus Transportasi (Car)
      if (d.type === 'car') {
          return (
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 font-medium">
                   <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <Car className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                      {d.seats} Seats
                  </div>
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <Settings className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                      {d.transmission}
                  </div>
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <Briefcase className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
                      {d.luggage} Bags
                  </div>
                  {d.year && (
                      <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          <span className="text-gray-600 font-bold text-[10px]">{d.year}</span>
                      </div>
                  )}
              </div>
          );
      }
      
      return null;
  };

  const getAddLabel = () => {
      switch(user?.specialization) {
          case AgentSpecialization.STAY: return 'List New Property';
          case AgentSpecialization.TRANSPORT: return 'Add Vehicle';
          default: return 'Create New Tour';
      }
  };

  // Filter products eligible for campaign (not already in one)
  const eligibleProducts = products.filter(p => !p.flashSale);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      
      {/* Active Campaigns Section */}
      {campaigns.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="relative z-10 mb-6">
                  <h2 className="text-2xl font-bold flex items-center mb-2">
                      <Gift className="w-6 h-6 mr-3 text-yellow-400" /> Active Campaigns
                  </h2>
                  <p className="text-indigo-200 text-sm max-w-xl">Boost your sales by joining our exclusive promotional events. Enjoy reduced platform fees and higher visibility.</p>
              </div>
              
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar relative z-10">
                  {campaigns.map(campaign => (
                      <div key={campaign.id} className="min-w-[300px] bg-white text-gray-900 rounded-2xl p-4 shadow-lg flex flex-col">
                          <div className="h-32 rounded-xl overflow-hidden mb-4 relative">
                              <img src={campaign.image} className="w-full h-full object-cover" alt="" />
                              <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                  {campaign.isActive ? 'Active' : 'Ended'}
                              </div>
                          </div>
                          <h3 className="font-bold text-lg mb-1">{campaign.name}</h3>
                          <div className="flex items-center text-xs text-gray-500 mb-4">
                              <Calendar className="w-3 h-3 mr-1" /> {campaign.startDate} - {campaign.endDate}
                          </div>
                          
                          <div className="mt-auto space-y-3">
                              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-500">Min. Discount</span>
                                      <span className="font-bold text-red-500">{campaign.minDiscount}%</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                      <span className="text-gray-500">Admin Fee</span>
                                      <span className="font-bold text-green-600">{campaign.adminFeePercentage}% (Save {11 - campaign.adminFeePercentage}%)</span>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => openCampaignJoinModal(campaign)}
                                  className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                              >
                                  Join Campaign
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
            <p className="text-gray-500 text-sm">Manage availability, pricing, and details.</p>
        </div>
        <Link 
            to="/agent/products/new" 
            className="flex items-center px-5 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all hover:-translate-y-0.5"
        >
            <Plus className="w-5 h-5 mr-2" />
            {getAddLabel()}
        </Link>
      </div>

      {isLoading ? (
          <div className="space-y-4">
              {[1,2,3].map(i => (
                  <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
              ))}
          </div>
      ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Empty Listing</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't listed any services yet. Start adding your first product to reach thousands of travelers.</p>
              <Link to="/agent/products/new" className="text-primary-600 font-bold hover:underline flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-1" /> {getAddLabel()}
              </Link>
          </div>
      ) : (
          <div className="space-y-4">
              {products.map(product => (
                  <div key={product.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 group">
                      {/* Image Section */}
                      <div className="w-full md:w-48 h-48 md:h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
                          <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
                             ID: {product.id}
                          </div>
                          
                          {/* Flash Sale Badge */}
                          {product.flashSale && (
                              <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm flex items-center ${
                                  product.flashSale.status === 'approved' ? 'bg-red-600 text-white' : 
                                  product.flashSale.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                  'bg-gray-100 text-gray-500'
                              }`}>
                                  <Zap className="w-3 h-3 mr-1 fill-current" />
                                  {product.flashSale.status === 'approved' ? 'Flash Sale Active' : 
                                   product.flashSale.status === 'pending' ? 'Reviewing Promo' : 'Promo Ended'}
                              </div>
                          )}
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center text-xs text-gray-500 mb-1">
                                      <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> {product.location}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg">
                                      <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                      {product.rating || 'New'} <span className="text-gray-400 font-normal">({product.reviews?.length || 0})</span>
                                  </div>
                              </div>
                              
                              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                  <Link to={`/product/${product.id}`}>{product.name}</Link>
                              </h3>
                              
                              {/* Dynamic Specs based on Type */}
                              {renderProductSpecs(product)}
                          </div>

                          <div className="flex items-end justify-between mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                              <div>
                                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Price</p>
                                  <div className="flex items-center gap-2">
                                     <p className="text-lg font-bold text-gray-900">{product.currency} {product.price}</p>
                                     {product.flashSale?.status === 'approved' && (
                                         <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                                             Promo: {product.flashSale.salePrice}
                                         </span>
                                     )}
                                  </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                   {/* Join Flash Sale Button */}
                                   {!product.flashSale && (
                                       <button 
                                           onClick={() => openFlashSaleModal(product)}
                                           className="flex items-center px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all border border-orange-200"
                                           title="Join Flash Sale"
                                       >
                                           <Zap className="w-3.5 h-3.5 sm:mr-1.5" />
                                           <span className="hidden sm:inline">Join Promo</span>
                                       </button>
                                   )}
                                   
                                   <div className="h-8 w-px bg-gray-200 mx-1"></div>

                                   <button 
                                      onClick={() => handleToggleStatus(product.id)}
                                      className={`flex items-center px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                                          product.isActive 
                                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                      }`}
                                      title="Toggle Status"
                                  >
                                      <Power className="w-3.5 h-3.5" />
                                  </button>
                                  
                                  <Link to={`/product/${product.id}`} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg hover:text-primary-600 transition-colors border border-transparent hover:border-gray-200" title="Preview">
                                      <Eye className="w-4 h-4" />
                                  </Link>
                                  <Link to={`/agent/products/edit/${product.id}`} className="p-2 text-gray-400 hover:bg-blue-50 rounded-lg hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100" title="Edit">
                                      <Edit className="w-4 h-4" />
                                  </Link>
                                  <button 
                                      onClick={() => handleDelete(product.id)}
                                      className="p-2 text-gray-400 hover:bg-red-50 rounded-lg hover:text-red-500 transition-colors border border-transparent hover:border-red-100" 
                                      title="Delete"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* FLASH SALE / CAMPAIGN MODAL */}
      {showFlashSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <Zap className="w-6 h-6 text-orange-500 mr-2 fill-current" />
                        {selectedCampaign ? 'Join Campaign' : 'Join Flash Sale'}
                    </h3>
                    <button onClick={() => setShowFlashSaleModal(false)} className="bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {selectedCampaign ? (
                    <div className="mb-6 bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <h4 className="font-bold text-purple-900 text-sm mb-1">{selectedCampaign.name}</h4>
                        <div className="flex justify-between text-xs text-purple-700">
                            <span>Min Discount: <strong>{selectedCampaign.minDiscount}%</strong></span>
                            <span>Fee: <strong>{selectedCampaign.adminFeePercentage}%</strong></span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <p className="text-xs text-orange-700">You are requesting a standard Flash Sale. Admin fees remain standard unless part of a campaign.</p>
                    </div>
                )}

                <form onSubmit={submitFlashSale} className="space-y-4">
                    {/* If we opened modal from Campaign button, we need to select a product */}
                    {isJoiningCampaign && !selectedProduct && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Select Product</label>
                            <select 
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
                                value={productToJoinId}
                                onChange={(e) => {
                                    setProductToJoinId(Number(e.target.value));
                                    // Reset percentage on change
                                    setDiscountPercentage('');
                                }}
                            >
                                <option value="">-- Choose Product --</option>
                                {eligibleProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.currency} {p.price})</option>
                                ))}
                            </select>
                            {eligibleProducts.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">No eligible products available (others may already be in a sale).</p>
                            )}
                        </div>
                    )}

                    {/* Show selected product details if available */}
                    {(selectedProduct || (isJoiningCampaign && productToJoinId)) && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Discount Percentage (%)</label>
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
                            
                            {/* Calculation Display */}
                            {(() => {
                                const prod = selectedProduct || products.find(p => p.id === Number(productToJoinId));
                                if (!prod || !discountPercentage) return null;
                                
                                const percentage = parseFloat(discountPercentage);
                                const finalPrice = Math.round(prod.price * (1 - percentage / 100));
                                
                                return (
                                    <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-500">Original Price:</span>
                                            <span className="text-xs font-medium text-gray-900 line-through">{prod.currency} {prod.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-700">Final Sale Price:</span>
                                            <span className="text-lg font-bold text-green-600">{prod.currency} {finalPrice}</span>
                                        </div>
                                        
                                        {selectedCampaign && (
                                            <div className="mt-2 text-right">
                                                <span className={`text-xs ${percentage < selectedCampaign.minDiscount ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                                                    Required Min: {selectedCampaign.minDiscount}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
                        <p>Note: Admin will review your request. Once approved, your product will appear in the Flash Sale section on the homepage.</p>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={(isJoiningCampaign && !productToJoinId) || !discountPercentage}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors mt-4 disabled:opacity-50"
                    >
                        Submit Request
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default AgentProducts;
