import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, MessageCircle, ShoppingBag, ArrowRight, ShieldCheck, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '../../context/AppDataContext';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, cartSummary, updateCartQty, placeOrder, vendors, getVendorById, fetchVendorById, generateWhatsAppOrderLink } = useAppData();
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    const loadVendor = async () => {
      if (!cartSummary.vendorId) return;
      
      const cachedVendor = vendors.find(v => v._id === cartSummary.vendorId);
      if (cachedVendor) {
        setVendor(cachedVendor);
        return;
      }
      
      const vendorData = await fetchVendorById(cartSummary.vendorId);
      if (vendorData) {
        setVendor(vendorData);
      }
    };
    loadVendor();
  }, [cartSummary.vendorId, vendors, fetchVendorById]);

  const canPlaceOrder = !vendor || vendor.isVerified;

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    setPlacing(true);
    try {
      const order = await placeOrder({ 
        customerName: customerName.trim(), 
        customerPhone: customerPhone.trim(),
        address: '' 
      });
      if (order) {
        setLastOrder(order);
      }
    } finally {
      setPlacing(false);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!vendor || cart.length === 0) return;
    const link = generateWhatsAppOrderLink(vendor.phone, cart, cartSummary.total, vendor.shopName);
    window.open(link, '_blank');
  };

  const handleShareOnWhatsApp = (order) => {
    const vendorName = vendor?.shopName || 'Vendor';
    const itemsList = order.items
      .map(item => `• ${item.quantity}x ${item.name}`)
      .join('\n');
    const message = `*Order Confirmation*\n\n*Vendor:* ${vendorName}\n*Items:*\n${itemsList}\n\n*Total:* ₹${order.total}\n\nStatus: ${order.status}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDF9DC] font-sans selection:bg-[#CDF546]">
      <Navbar role="customer" />
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 flex-1">
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={() => navigate('/customer')}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-heading font-black text-gray-900 uppercase tracking-tight">Your Cart</h1>
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.3em] mt-1">Review your plate before ordering</p>
          </div>
        </div>

        {lastOrder ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[56px] p-12 md:p-20 text-center border border-gray-100 shadow-2xl max-w-2xl mx-auto overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-[#CDF546]" />
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10 text-[#1A6950]">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-4xl font-heading font-black text-gray-900 uppercase tracking-tighter mb-4">Order Successful!</h2>
            <p className="text-gray-400 font-medium text-lg mb-4">
              Your order from <span className="text-[#1A6950] font-black">{vendor?.shopName}</span> has been placed.
            </p>
            <p className="text-sm text-gray-500 mb-12">Order ID: {lastOrder._id?.slice(-8)}</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleShareOnWhatsApp(lastOrder)}
                className="flex-1 bg-green-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-green-700 transition-all"
              >
                <MessageCircle size={18} />
                Share on WhatsApp
              </button>
              <button
                onClick={() => navigate('/customer')}
                className="flex-1 bg-white border border-gray-100 text-gray-900 py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:shadow-xl transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        ) : !cart.length ? (
          <div className="bg-white rounded-[48px] p-20 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="text-gray-200" size={40} />
            </div>
            <h3 className="text-2xl font-heading font-black text-gray-900 uppercase tracking-tight">Empty Cart</h3>
            <p className="text-gray-400 font-medium mt-2">Hungry? Add some delicious items to your cart.</p>
            <button 
              onClick={() => navigate('/customer')}
              className="mt-10 bg-[#1A6950] text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs"
            >
              Explore Vendors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-white/50 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Clock size={20} className="text-[#1A6950]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ordering From</p>
                    <p className="font-black uppercase tracking-tight text-gray-900">{vendor?.shopName || 'Loading...'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {vendor && !vendor.isVerified && (
                    <span className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                      Not Verified
                    </span>
                  )}
                  {vendor?.isOnline && (
                    <span className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Online
                    </span>
                  )}
                  {vendor?.schedule?.isRoaming && (
                    <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                      Roaming
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {cart.map((ci) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      key={`${ci.vendorId}-${ci.item._id || ci.item.id}`}
                      className="group bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#CDF546] transition-colors duration-500 overflow-hidden">
                          {ci.item.image ? (
                            <img src={ci.item.image} alt={ci.item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag size={24} className="text-[#1A6950]" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-1">{ci.item.name}</h4>
                          <p className="text-[#1A6950] font-black text-lg">₹{ci.item.price}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        <button
                          onClick={() => updateCartQty({ vendorId: ci.vendorId, itemId: ci.item._id || ci.item.id, qty: ci.qty - 1 })}
                          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-md transition-all"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-black text-gray-900">{ci.qty}</span>
                        <button
                          onClick={() => updateCartQty({ vendorId: ci.vendorId, itemId: ci.item._id || ci.item.id, qty: ci.qty + 1 })}
                          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-md transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="bg-white rounded-[32px] p-6 border border-gray-100 mt-8">
                <h3 className="font-black uppercase tracking-tight text-gray-900 mb-4">Your Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Your Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#CDF546] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#CDF546] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32 bg-gray-900 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#CDF546] rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2" />
                
                <h3 className="text-2xl font-heading font-black uppercase mb-10 relative z-10">Bill Summary</h3>
                
                <div className="space-y-6 relative z-10 mb-12">
                  <div className="flex justify-between items-center text-white/60 font-medium">
                    <span className="uppercase tracking-widest text-[10px]">Subtotal</span>
                    <span className="font-bold">₹{cartSummary.total}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/60 font-medium">
                    <span className="uppercase tracking-widest text-[10px]">Delivery Fee</span>
                    <span className="font-bold text-[#CDF546]">FREE</span>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <span className="uppercase tracking-[0.2em] text-[10px] font-black text-[#CDF546]">Total Amount</span>
                    <span className="text-5xl font-black">₹{cartSummary.total}</span>
                  </div>
                </div>

                {!canPlaceOrder && (
                  <p className="text-red-400 text-xs font-bold uppercase mb-6 text-center tracking-widest">
                    Vendor Verification Required
                  </p>
                )}

                <div className="space-y-3">
                  <button 
                    onClick={handleWhatsAppOrder}
                    disabled={!canPlaceOrder}
                    className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                      canPlaceOrder 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle size={20} />
                    Order via WhatsApp
                  </button>
                  
                  <button 
                    disabled={placing || !canPlaceOrder || !customerName.trim()}
                    onClick={handlePlaceOrder}
                    className={`w-full py-6 rounded-[28px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                      canPlaceOrder && customerName.trim()
                        ? 'bg-[#CDF546] text-gray-900 hover:scale-105 shadow-xl shadow-[#CDF546]/20' 
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    {placing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order In-App
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {!lastOrder && <Footer />}
    </div>
  );
};

export default CartPage;
