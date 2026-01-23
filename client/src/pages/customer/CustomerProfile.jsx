import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Edit,
  Camera,
  TrendingUp,
  Package,
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';

const CustomerProfile = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');

  const customerDetails = {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    location: 'MG Road, Bengaluru',
    memberSince: 'January 2024',
    stats: {
      totalOrders: 47,
      totalSpent: 3850,
      favoriteVendors: 8,
    }
  };

  const stats = [
    { icon: Package, label: 'Orders', value: customerDetails.stats.totalOrders, color: 'bg-[#1A6950] text-white' },
    { icon: TrendingUp, label: 'Spent', value: `₹${customerDetails.stats.totalSpent}`, color: 'bg-[#CDF546] text-gray-900' },
    { icon: Heart, label: 'Favorites', value: customerDetails.stats.favoriteVendors, color: 'bg-white text-[#1A6950]' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF9DC] font-sans selection:bg-[#CDF546]">
      <Navbar role="customer" />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Profile Sidebar */}
          <div className="md:w-1/3 space-y-8">
            <div className="bg-white rounded-[56px] p-12 border border-gray-100 shadow-sm relative overflow-hidden text-center">
              <div className="relative inline-block mb-8">
                <div className="w-40 h-40 bg-gray-50 rounded-[48px] flex items-center justify-center border-4 border-[#FDF9DC] shadow-xl overflow-hidden">
                  <User size={64} className="text-gray-200" />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-[#1A6950] text-white p-4 rounded-2xl shadow-lg hover:scale-110 transition-transform">
                  <Camera size={20} />
                </button>
              </div>

              <h1 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tight mb-2">{customerDetails.name}</h1>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-8">Member Since {customerDetails.memberSince}</p>

              <div className="flex items-center justify-center gap-3 bg-[#CDF546]/20 py-3 px-6 rounded-2xl text-[#1A6950] font-black text-[10px] uppercase tracking-widest border border-[#CDF546]/30">
                <ShieldCheck size={16} />
                Premium Member
              </div>
            </div>

            <div className="bg-gray-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#CDF546] rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2" />
              <h3 className="text-xl font-heading font-black uppercase mb-8 relative z-10">Quick Stats</h3>
              <div className="grid grid-cols-1 gap-4 relative z-10">
                {stats.map((stat, idx) => (
                  <div key={idx} className={`${stat.color} p-6 rounded-[32px] flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all`}>
                    <div className="flex items-center gap-4">
                      <stat.icon size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{stat.label}</span>
                    </div>
                    <span className="text-xl font-black">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-2/3 space-y-8">
            <div className="bg-white rounded-[56px] p-10 md:p-14 border border-gray-100 shadow-sm">
              <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
                {['overview', 'orders', 'favorites', 'settings'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                        ? 'bg-[#1A6950] text-white shadow-xl shadow-[#1A6950]/20'
                        : 'bg-gray-50 text-gray-400 hover:text-gray-900'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-8">
                {activeTab === 'overview' && (
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-heading font-black text-gray-900 uppercase tracking-tight">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-gray-50 rounded-[32px] space-y-1 border border-transparent hover:border-gray-100 transition-all">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                          <p className="font-black text-gray-900">{customerDetails.email}</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-[32px] space-y-1 border border-transparent hover:border-gray-100 transition-all">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                          <p className="font-black text-gray-900">{customerDetails.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-heading font-black text-gray-900 uppercase tracking-tight">Default Address</h3>
                      <div className="p-8 bg-[#CDF546] rounded-[40px] flex items-center justify-between group cursor-pointer border border-transparent hover:border-[#1A6950] transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center text-[#1A6950]">
                            <MapPin size={28} />
                          </div>
                          <span className="text-xl font-black text-gray-900 uppercase tracking-tight">{customerDetails.location}</span>
                        </div>
                        <Edit size={24} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <button
                      onClick={() => navigate('/customer/orders')}
                      className="w-full p-8 bg-gray-900 text-white rounded-[40px] flex items-center justify-between group hover:bg-black transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#CDF546] rounded-2xl flex items-center justify-center text-gray-900">
                          <ShoppingBag size={28} />
                        </div>
                        <span className="text-xl font-black uppercase tracking-tight">View Full Order History</span>
                      </div>
                      <ChevronRight size={24} className="text-[#CDF546]" />
                    </button>
                  </div>
                )}

                {activeTab === 'favorites' && (
                  <div className="text-center py-20 bg-gray-50 rounded-[40px]">
                    <Heart size={48} className="text-gray-200 mx-auto mb-6" />
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Your favorite vendors will appear here</p>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <div className="p-8 bg-gray-50 rounded-[40px] flex items-center justify-between group cursor-pointer hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400">
                          <Settings size={28} />
                        </div>
                        <span className="text-xl font-black text-gray-900 uppercase tracking-tight">Account Security</span>
                      </div>
                      <ChevronRight size={24} className="text-gray-300" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerProfile;
