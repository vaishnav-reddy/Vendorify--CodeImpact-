import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, ArrowRight, Users, Star } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole === 'customer') {
      navigate('/login/customer');
    } else if (selectedRole === 'vendor') {
      navigate('/login/vendor');
    }
  };

  const handleSignup = () => {
    if (selectedRole === 'customer') {
      navigate('/signup/customer');
    } else if (selectedRole === 'vendor') {
      navigate('/signup/vendor');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9DC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#CDF546] rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1A6950] rounded-full blur-[150px] opacity-10 translate-x-1/4 translate-y-1/4" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[48px] p-8 md:p-12 shadow-2xl border border-white/50">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#CDF546] rounded-[28px] flex items-center justify-center shadow-lg p-4">
                <img 
                  src="/logo.svg" 
                  alt="Vendorify Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-gray-900 uppercase tracking-tight mb-4">
              Choose Your Role
            </h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-[0.2em] max-w-md mx-auto">
              Select how you want to use Vendorify
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Customer Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('customer')}
              className={`relative p-8 rounded-[32px] border-2 cursor-pointer transition-all duration-300 ${
                selectedRole === 'customer'
                  ? 'border-[#1A6950] bg-[#1A6950]/5 shadow-xl'
                  : 'border-gray-200 bg-white/50 hover:border-[#CDF546] hover:shadow-lg'
              }`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-[24px] flex items-center justify-center transition-colors ${
                  selectedRole === 'customer' ? 'bg-[#1A6950]' : 'bg-[#CDF546]'
                }`}>
                  <ShoppingBag className={`w-8 h-8 ${
                    selectedRole === 'customer' ? 'text-white' : 'text-gray-900'
                  }`} />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3">
                  Customer
                </h3>
                
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Order from local vendors, discover new shops, and enjoy fresh products delivered to your doorstep
                </p>

                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#CDF546] rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Browse local vendors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#CDF546] rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Order fresh products</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#CDF546] rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Track your orders</span>
                  </div>
                </div>

                {selectedRole === 'customer' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-[#1A6950] rounded-full flex items-center justify-center"
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Vendor Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('vendor')}
              className={`relative p-8 rounded-[32px] border-2 cursor-pointer transition-all duration-300 ${
                selectedRole === 'vendor'
                  ? 'border-[#1A6950] bg-[#1A6950]/5 shadow-xl'
                  : 'border-gray-200 bg-white/50 hover:border-[#CDF546] hover:shadow-lg'
              }`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-[24px] flex items-center justify-center transition-colors ${
                  selectedRole === 'vendor' ? 'bg-[#1A6950]' : 'bg-gray-900'
                }`}>
                  <Store className={`w-8 h-8 ${
                    selectedRole === 'vendor' ? 'text-white' : 'text-[#CDF546]'
                  }`} />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3">
                  Vendor
                </h3>
                
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Manage your shop, reach more customers, and grow your business with our vendor platform
                </p>

                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#CDF546] rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Manage your shop</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#CDF546] rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Reach more customers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#CDF546] rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Track your earnings</span>
                  </div>
                </div>

                {selectedRole === 'vendor' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-[#1A6950] rounded-full flex items-center justify-center"
                  >
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <button
                onClick={handleContinue}
                className="w-full bg-[#1A6950] hover:bg-[#145a44] text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-[#1A6950]/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Continue to Login
                <ArrowRight size={20} className="text-[#CDF546]" />
              </button>

              <div className="text-center">
                <p className="text-gray-500 text-xs font-medium mb-3">Don't have an account?</p>
                <button
                  onClick={handleSignup}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 rounded-[24px] font-bold uppercase tracking-[0.1em] text-sm transition-all"
                >
                  Create New Account
                </button>
              </div>
            </motion.div>
          )}

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-600 text-xs font-medium uppercase tracking-widest transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;