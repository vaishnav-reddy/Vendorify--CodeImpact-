import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Clock, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '../../context/AppDataContext';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { getOrdersForCustomer, getVendorById } = useAppData();

  const orders = getOrdersForCustomer();

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return 'bg-[#CDF546] text-gray-900 shadow-[0_0_20px_rgba(205,245,70,0.3)]';
      case 'ACCEPTED': return 'bg-[#1A6950] text-white';
      case 'COMPLETED': return 'bg-gray-100 text-gray-400';
      case 'REJECTED': return 'bg-red-50 text-red-400';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const handleShareOnWhatsApp = (order) => {
    const vendor = getVendorById(order.vendorId);
    const vendorName = vendor?.name || 'Vendor';
    const itemsList = order.items
      .map(item => `• ${item.qty}x ${item.name}`)
      .join('\n');
    const message = `*Order History*\n\n*Vendor:* ${vendorName}\n*Items:*\n${itemsList}\n\n*Total:* ₹${order.total}\n\nStatus: ${order.status}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDF9DC] font-sans selection:bg-[#CDF546]">
      <Navbar role="customer" />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={() => navigate('/customer')}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-heading font-black text-gray-900 uppercase tracking-tight">Order History</h1>
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.3em] mt-1">Track your recent purchases</p>
          </div>
        </div>

        {!orders.length ? (
          <div className="bg-white rounded-[48px] p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="text-gray-200" size={40} />
            </div>
            <h3 className="text-2xl font-heading font-black text-gray-900 uppercase">No orders yet</h3>
            <p className="text-gray-400 font-medium mt-2">Start exploring vendors to place your first order.</p>
            <button
              onClick={() => navigate('/customer')}
              className="mt-8 bg-[#1A6950] text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
            >
              Explore Vendors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {orders.map((o, idx) => {
                const vendor = getVendorById(o.vendorId);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={o.id}
                    className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Vendor</p>
                        <h4 className="text-2xl font-black uppercase tracking-tight text-gray-900 group-hover:text-[#1A6950] transition-colors">
                          {vendor?.name || 'Vendor'}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-1">
                          <Clock size={12} />
                          {new Date(o.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-8">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Items</p>
                      {o.items.map((it) => (
                        <div key={it.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl group-hover:bg-white transition-colors">
                          <span className="font-black text-gray-900 uppercase tracking-tight text-xs">{it.name} <span className="text-[#1A6950]">× {it.qty}</span></span>
                          <span className="font-bold text-gray-900">₹{it.price * it.qty}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Paid Amount</p>
                        <span className="text-3xl font-black text-gray-900">₹{o.total}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShareOnWhatsApp(o)}
                          className="bg-white border border-gray-100 p-4 rounded-[20px] text-gray-400 hover:text-gray-900 hover:shadow-xl transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
                        >
                          <MessageCircle size={18} />
                          Share
                        </button>
                        <button
                          onClick={() => navigate(`/customer/vendor/${o.vendorId}`)}
                          className="bg-[#1A6950] text-white p-4 rounded-[20px] shadow-lg hover:scale-110 transition-transform"
                        >
                          <ArrowUpRight size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CustomerOrders;
