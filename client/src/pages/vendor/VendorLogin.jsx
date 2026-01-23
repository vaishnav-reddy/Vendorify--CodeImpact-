import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Phone, ShieldCheck, Shield, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const VendorLogin = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ mobile: '', password: '', aadhaar: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm({ ...form, mobile: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mobile || !form.password) {
      setError('Please fill all fields');
      return;
    }

    if (!validateMobile(form.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await login({ mobile: form.mobile, password: form.password, role: 'vendor' });
      if (!result.success) {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9DC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#CDF546] rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A6950] rounded-full blur-[150px] opacity-10 -translate-x-1/4 translate-y-1/4" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[48px] p-10 md:p-14 shadow-2xl border border-white/50">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#1A6950] rounded-[28px] flex items-center justify-center shadow-lg -rotate-3 group-hover:rotate-0 transition-all duration-500 p-4">
                <img
                  src="/logo.svg"
                  alt="Vendorify Logo"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
            </div>
            <h1 className="text-4xl font-heading font-black text-gray-900 uppercase tracking-tight mb-2">Vendor Portal</h1>
            <p className="text-gray-400 font-bold text-[12px] uppercase tracking-[0.2em]">Manage your shop & reach customers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Mobile Number</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                  <Phone size={20} />
                </div>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full bg-gray-50/50 border-2 border-transparent pl-16 pr-6 py-5 rounded-[24px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
                  value={form.mobile}
                  onChange={handleMobileChange}
                  maxLength={10}
                  aria-label="Mobile number"
                />
                {form.mobile && (
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold ${validateMobile(form.mobile) ? 'text-green-500' : 'text-gray-400'}`}>
                    {form.mobile.length}/10
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-4 mr-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
                <Link 
                  to="/forgot-password" 
                  className="text-[10px] font-bold text-[#1A6950] uppercase tracking-widest hover:underline focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="w-full bg-gray-50/50 border-2 border-transparent pl-16 pr-14 py-5 rounded-[24px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A6950] transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAadhaar(!showAadhaar)}
                className="flex items-center gap-2 text-[11px] font-black text-[#1A6950] uppercase tracking-widest hover:underline ml-4 focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded"
              >
                <Shield size={14} />
                {showAadhaar ? 'Hide' : 'Add'} Aadhaar Verification
              </button>

              {showAadhaar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-2"
                >
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                      <ShieldCheck size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter 12-digit Aadhaar"
                      maxLength={12}
                      className="w-full bg-gray-50/50 border-2 border-transparent pl-16 pr-6 py-5 rounded-[24px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
                      value={form.aadhaar}
                      onChange={(e) => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '') })}
                      aria-label="Aadhaar number"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-center border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#CDF546] focus:ring-offset-2"
            >
              {loading ? 'Processing...' : (
                <>
                  Enter Dashboard
                  <ArrowRight size={20} className="text-[#CDF546]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              New to Vendorify?{' '}
              <Link to="/signup/vendor" className="text-[#1A6950] hover:underline focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded">Register Shop</Link>
            </p>
            <div className="pt-6 border-t border-gray-100 flex items-center justify-center gap-2">
              <ShoppingBag size={16} className="text-[#1A6950]" />
              <Link to="/login/customer" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1A6950] transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded">
                Are you a customer? Login here
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorLogin;
