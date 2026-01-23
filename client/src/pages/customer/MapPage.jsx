import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Star, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppData } from '../../context/AppDataContext';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';

const MapPage = () => {
  const navigate = useNavigate();
  const { vendors } = useAppData();

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
            <h1 className="text-4xl font-heading font-black text-gray-900 uppercase tracking-tight">Interactive Map</h1>
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.3em] mt-1">Live tracking of nearby vendors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-8">
            <div className="relative bg-white rounded-[56px] p-4 border border-gray-100 shadow-2xl overflow-hidden h-[600px]">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.5896,12.9666,77.5996,12.9766&layer=mapnik&marker=12.9716,77.5946"
                className="w-full h-full rounded-[40px] border-0 grayscale invert opacity-90 contrast-125"
                title="Map view"
                loading="lazy"
              />

              {/* Custom Map Controls Overlay */}
              <div className="absolute top-10 left-10 space-y-4">
                <div className="bg-gray-900/90 backdrop-blur-xl text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10">
                  <div className="w-2 h-2 bg-[#CDF546] rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">MG Road, Bengaluru</span>
                </div>
              </div>

              <div className="absolute bottom-10 right-10 flex flex-col gap-4">
                <button className="w-14 h-14 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-gray-900 hover:scale-110 transition-transform">
                  <Navigation size={24} />
                </button>
                <button
                  onClick={() => navigate('/customer')}
                  className="w-14 h-14 bg-[#1A6950] rounded-2xl shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <Home size={24} />
                </button>
              </div>

              {/* Custom Pins Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {vendors.slice(0, 4).map((v, idx) => (
                  <motion.div
                    key={v.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.2, type: 'spring' }}
                    className="absolute"
                    style={{
                      top: `${30 + (idx * 15)}%`,
                      left: `${20 + (idx * 20)}%`,
                    }}
                  >
                    <div className="relative group pointer-events-auto cursor-pointer" onClick={() => navigate(`/customer/vendor/${v.id}`)}>
                      <div className="bg-[#1A6950] p-1 rounded-full shadow-2xl border-4 border-white overflow-hidden w-12 h-12">
                        <img src={v.image} className="w-full h-full object-cover rounded-full" alt="" />
                      </div>
                      <div className="absolute top-0 left-full ml-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-2xl shadow-2xl border border-gray-100 whitespace-nowrap">
                        <p className="text-xs font-black text-gray-900 uppercase">{v.name}</p>
                        <p className="text-[10px] text-[#1A6950] font-bold">{v.distance}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Nearby List */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-900 rounded-[56px] p-10 text-white relative overflow-hidden shadow-2xl h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#CDF546] rounded-full blur-[100px] opacity-10 translate-x-1/2 -translate-y-1/2" />

              <div className="flex justify-between items-center mb-10 relative z-10">
                <h3 className="text-2xl font-heading font-black uppercase tracking-tight">On The Move</h3>
                <span className="bg-[#CDF546] text-gray-900 px-3 py-1 rounded-full text-[10px] font-black">4 Live</span>
              </div>

              <div className="space-y-4 relative z-10 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {vendors.map((v) => (
                  <motion.div
                    key={v.id}
                    whileHover={{ x: 5 }}
                    onClick={() => navigate(`/customer/vendor/${v.id}`)}
                    className="group bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/5 hover:border-[#CDF546]/50 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10">
                          <img src={v.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <h4 className="font-black uppercase tracking-tight text-sm group-hover:text-[#CDF546] transition-colors">{v.name}</h4>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{v.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-black">{v.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[#CDF546]">
                        <MapPin size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{v.distance}</span>
                      </div>
                      <ArrowRight size={16} className="text-white/20 group-hover:text-[#CDF546] transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MapPage;
