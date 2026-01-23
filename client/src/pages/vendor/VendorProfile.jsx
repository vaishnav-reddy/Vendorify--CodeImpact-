import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import {
  Store,
  MapPin,
  Star,
  Clock,
  Edit,
  Camera,
  Package,
  ShieldCheck,
  ChevronRight,
  Settings,
  DollarSign,
  Award,
  LogOut
} from 'lucide-react';

import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';

const VendorProfile = () => {
  const navigate = useNavigate();
  const { getVendorById, getOrdersForVendor } = useAppData();
  const [activeTab, setActiveTab] = useState('overview');

  const vendorId = 1;
  const vendor = getVendorById(vendorId);
  const orders = getOrdersForVendor(vendorId);
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.total, 0);

  const vendorDetails = {
    ...vendor,
    email: 'raju@vendorify.com',
    phone: '+91 98765 43210',
    description: 'Serving authentic street food since 2015. Specializing in Pani Puri, Chaat, and traditional Indian snacks.',
    businessHours: '10:00 AM - 10:00 PM',
    established: '2015',
    certifications: ['FSSAI Certified', 'Hygiene Verified'],
  };

  const stats = [
    { icon: DollarSign, label: 'Earnings', value: `₹${totalEarnings}`, color: 'bg-[#CDF546] text-gray-900' },
    { icon: Package, label: 'Orders', value: orders.length, color: 'bg-[#1A6950] text-white' },
    { icon: Star, label: 'Rating', value: vendorDetails.rating, color: 'bg-white text-[#1A6950]' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF9DC] font-sans selection:bg-[#CDF546]">
      <Navbar role="vendor" />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3 space-y-8">
            <div className="bg-white rounded-[56px] p-12 border border-gray-100 shadow-sm relative overflow-hidden text-center">
              <div className="relative inline-block mb-8">
                <div className="w-40 h-40 bg-[#1A6950] rounded-[48px] flex items-center justify-center border-4 border-[#FDF9DC] shadow-xl overflow-hidden">
                  <Store size={64} className="text-[#CDF546]" />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-[#1A6950] text-white p-4 rounded-2xl shadow-lg hover:scale-110 transition-transform">
                  <Camera size={20} />
                </button>
              </div>

              <h1 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tight mb-2">{vendorDetails.name}</h1>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-8">Verified Vendor Since {vendorDetails.established}</p>

              <div className="flex items-center justify-center gap-3 bg-[#CDF546]/20 py-3 px-6 rounded-2xl text-[#1A6950] font-black text-[10px] uppercase tracking-widest border border-[#CDF546]/30 mb-8">
                <ShieldCheck size={16} />
                Premium Shop
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-3 py-4 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 rounded-2xl transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>

            <div className="bg-gray-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#CDF546] rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2" />
              <h3 className="text-xl font-heading font-black uppercase mb-8 relative z-10">Business Pulse</h3>
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

          <div className="md:w-2/3 space-y-8">
            <div className="bg-white rounded-[56px] p-10 md:p-14 border border-gray-100 shadow-sm">
              <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
                {['overview', 'business', 'documents', 'settings'].map((tab) => (
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
                      <h3 className="text-2xl font-heading font-black text-gray-900 uppercase tracking-tight">Public Profile</h3>
                      <div className="p-8 bg-gray-50 rounded-[40px] border border-transparent hover:border-gray-100 transition-all">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Description</p>
                        <p className="font-medium text-gray-600 leading-relaxed">{vendorDetails.description}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-heading font-black text-gray-900 uppercase tracking-tight">Contact Channels</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-gray-50 rounded-[32px] space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Business Email</p>
                          <p className="font-black text-gray-900">{vendorDetails.email}</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-[32px] space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Support Line</p>
                          <p className="font-black text-gray-900">{vendorDetails.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'business' && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-heading font-black text-gray-900 uppercase tracking-tight">Shop Settings</h3>
                      <div className="p-8 bg-[#CDF546] rounded-[40px] flex items-center justify-between group cursor-pointer border border-transparent hover:border-[#1A6950] transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center text-[#1A6950]">
                            <Clock size={28} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#1A6950]/60">Operational Hours</p>
                            <span className="text-xl font-black text-gray-900 uppercase tracking-tight">{vendorDetails.businessHours}</span>
                          </div>
                        </div>
                        <ChevronRight size={24} className="text-gray-400 group-hover:text-gray-900" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-heading font-black text-gray-900 uppercase tracking-tight">Location</h3>
                      <div className="p-8 bg-gray-900 rounded-[40px] text-white flex items-center justify-between group cursor-pointer border border-transparent hover:border-[#CDF546] transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#CDF546]">
                            <MapPin size={28} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Primary Address</p>
                            <span className="text-xl font-black uppercase tracking-tight">{vendorDetails.address}</span>
                          </div>
                        </div>
                        <Edit size={24} className="text-white/20 group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-heading font-black text-gray-900 uppercase tracking-tight">Compliance & Trust</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vendorDetails.certifications.map((cert, idx) => (
                        <div key={idx} className="p-8 bg-white border border-gray-100 rounded-[40px] flex items-center gap-6 group hover:shadow-xl transition-all">
                          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                            <Award size={24} />
                          </div>
                          <span className="font-black text-gray-900 uppercase tracking-tight text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <div className="p-8 bg-gray-50 rounded-[40px] flex items-center justify-between group cursor-pointer hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400">
                          <Settings size={28} />
                        </div>
                        <span className="text-xl font-black text-gray-900 uppercase tracking-tight">Shop Preferences</span>
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

export default VendorProfile;
