import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Phone, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { navigateToDashboard } from '../../utils/navigation';

const CustomerLogin = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ mobile: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useMobile, setUseMobile] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect authenticated users to their dashboard
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('User already authenticated, redirecting to dashboard');
      }
      navigateToDashboard(navigate, user);
    }
  }, [isAuthenticated, user, navigate]);

  const validateMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm({ ...form, mobile: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const identifier = useMobile ? form.mobile : form.email;
    if (!identifier || !form.password) {
      setError('Please fill all fields');
      return;
    }

    if (useMobile && !validateMobile(form.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await login({ [useMobile ? 'mobile' : 'email']: identifier, password: form.password, role: 'customer' });
      if (result.success) {
        // Navigate to customer dashboard after successful login
        if (result.user) {
          // Add a small delay to ensure any success messages are visible
          setTimeout(() => {
            navigateToDashboard(navigate, result.user);
          }, 500);
        } else {
          console.warn('Login successful but no user data received');
          // Fallback navigation
          navigate('/customer');
        }
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Customer login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9DC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#CDF546] rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1A6950] rounded-full blur-[150px] opacity-10 translate-x-1/4 translate-y-1/4" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[48px] p-10 md:p-14 shadow-2xl border border-white/50">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#CDF546] rounded-[28px] flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-all duration-500 p-4">
                <img 
                  src="/logo.svg" 
                  alt="Vendorify Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </div>
            <h1 className="text-4xl font-heading font-black text-gray-900 uppercase tracking-tight mb-2">Welcome Back</h1>
            <p className="text-gray-400 font-bold text-[12px] uppercase tracking-[0.2em]">Order from your favorite vendors</p>
          </div>

          <div className="flex bg-gray-100/50 p-2 rounded-[24px] mb-8">
            <button
              type="button"
              onClick={() => setUseMobile(true)}
              className={`flex-1 py-4 px-6 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546] ${
                useMobile ? 'bg-white text-[#1A6950] shadow-sm' : 'text-gray-400'
              }`}
            >
              Mobile
            </button>
            <button
              type="button"
              onClick={() => setUseMobile(false)}
              className={`flex-1 py-4 px-6 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546] ${
                !useMobile ? 'bg-white text-[#1A6950] shadow-sm' : 'text-gray-400'
              }`}
            >
              Email
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">
                {useMobile ? 'Mobile Number' : 'Email Address'}
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                  {useMobile ? <Phone size={20} /> : <Mail size={20} />}
                </div>
                <input
                  type={useMobile ? 'tel' : 'email'}
                  placeholder={useMobile ? '10-digit mobile number' : 'Enter email'}
                  className="w-full bg-gray-50/50 border-2 border-transparent pl-16 pr-6 py-5 rounded-[24px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
                  value={useMobile ? form.mobile : form.email}
                  onChange={useMobile ? handleMobileChange : (e) => setForm({ ...form, email: e.target.value })}
                  maxLength={useMobile ? 10 : undefined}
                  aria-label={useMobile ? 'Mobile number' : 'Email address'}
                />
                {useMobile && form.mobile && (
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

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 text-red-500 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-center border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A6950] hover:bg-[#145a44] text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-[#1A6950]/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#CDF546] focus:ring-offset-2"
            >
              {loading ? 'Processing...' : (
                <>
                  Sign In
                  <ArrowRight size={20} className="text-[#CDF546]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Don't have an account?{' '}
              <Link to="/signup/customer" className="text-[#1A6950] hover:underline focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded">Sign up</Link>
            </p>
            <div className="pt-6 border-t border-gray-100 flex items-center justify-center gap-2">
              <ShieldCheck size={16} className="text-[#CDF546]" />
              <Link to="/login/vendor" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1A6950] transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded">
                Are you a vendor? Login here
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerLogin;
