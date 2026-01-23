import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Phone, User, Mail, ShoppingBag, Eye, EyeOff, Store, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const VendorSignup = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ 
    name: '', 
    shopName: '',
    mobile: '', 
    email: '',
    password: '', 
    confirmPassword: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateMobile = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.shopName || !form.mobile || !form.password) {
      setError('Please fill all required fields');
      return;
    }

    if (!validateMobile(form.mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (form.email && !validateEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register({
        name: form.name,
        shopName: form.shopName,
        mobile: form.mobile,
        email: form.email || undefined,
        password: form.password,
        address: form.address,
        role: 'vendor'
      });

      if (result.success) {
        toast.success('Registration successful!');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm({ ...form, mobile: value });
  };

  return (
    <div className="min-h-screen bg-[#FDF9DC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#CDF546] rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A6950] rounded-full blur-[150px] opacity-10 -translate-x-1/4 translate-y-1/4" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[520px] z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[48px] p-8 md:p-12 shadow-2xl border border-white/50">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#1A6950] rounded-[28px] flex items-center justify-center shadow-lg -rotate-3 p-4">
                <Store className="w-10 h-10 text-[#CDF546]" />
              </div>
            </div>
            <h1 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tight mb-2">Register Your Shop</h1>
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em]">Start selling to customers nearby</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Your Name *</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full bg-gray-50/50 border-2 border-transparent pl-14 pr-4 py-4 rounded-[20px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none text-sm"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    aria-label="Full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Shop Name *</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                    <Store size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Shop name"
                    className="w-full bg-gray-50/50 border-2 border-transparent pl-14 pr-4 py-4 rounded-[20px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none text-sm"
                    value={form.shopName}
                    onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                    aria-label="Shop name"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Mobile Number *</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full bg-gray-50/50 border-2 border-transparent pl-14 pr-4 py-4 rounded-[20px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
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
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Email (Optional)</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-gray-50/50 border-2 border-transparent pl-14 pr-4 py-4 rounded-[20px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-label="Email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Shop Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Your shop location"
                  className="w-full bg-gray-50/50 border-2 border-transparent pl-14 pr-4 py-4 rounded-[20px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  aria-label="Shop address"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Password *</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-gray-50/50 border-2 border-transparent pl-14 pr-12 py-4 rounded-[20px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A6950] transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Confirm *</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-gray-50/50 border-2 border-transparent pl-14 pr-12 py-4 rounded-[20px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    aria-label="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A6950] transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
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
              {loading ? 'Creating Account...' : (
                <>
                  Register Shop
                  <ArrowRight size={20} className="text-[#CDF546]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login/vendor" className="text-[#1A6950] hover:underline focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded">Login</Link>
            </p>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
              <ShoppingBag size={16} className="text-[#1A6950]" />
              <Link to="/signup/customer" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1A6950] transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded">
                Sign up as customer instead
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorSignup;
