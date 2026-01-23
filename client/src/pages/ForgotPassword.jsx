import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [form, setForm] = useState({ identifier: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [useMobile, setUseMobile] = useState(true);

  const validateMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.identifier) {
      toast.error('Please enter your ' + (useMobile ? 'mobile number' : 'email'));
      return;
    }

    if (useMobile && !validateMobile(form.identifier)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!useMobile && !validateEmail(form.identifier)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSent(true);
    setLoading(false);
    toast.success('Reset instructions sent!');
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (useMobile) {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setForm({ identifier: value });
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#FDF9DC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#CDF546] rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[480px] z-10"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[48px] p-10 md:p-14 shadow-2xl border border-white/50 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#CDF546] rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-[#1A6950]" />
              </div>
            </div>
            <h1 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tight mb-4">Check Your {useMobile ? 'Phone' : 'Email'}</h1>
            <p className="text-gray-500 mb-8">
              We've sent password reset instructions to <span className="font-bold text-gray-900">{form.identifier}</span>
            </p>
            <Link 
              to="/login/customer"
              className="inline-flex items-center gap-2 bg-[#1A6950] text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-[#145a44] transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546]"
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <Link 
            to="/login/customer" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1A6950] mb-8 font-bold text-sm uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tight mb-2">Forgot Password?</h1>
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em]">No worries, we'll send you reset instructions</p>
          </div>

          <div className="flex bg-gray-100/50 p-2 rounded-[24px] mb-6">
            <button
              type="button"
              onClick={() => { setUseMobile(true); setForm({ identifier: '' }); }}
              className={`flex-1 py-3 px-6 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546] ${
                useMobile ? 'bg-white text-[#1A6950] shadow-sm' : 'text-gray-400'
              }`}
            >
              Mobile
            </button>
            <button
              type="button"
              onClick={() => { setUseMobile(false); setForm({ identifier: '' }); }}
              className={`flex-1 py-3 px-6 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546] ${
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
                  placeholder={useMobile ? '10-digit mobile number' : 'your@email.com'}
                  className="w-full bg-gray-50/50 border-2 border-transparent pl-16 pr-6 py-5 rounded-[24px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
                  value={form.identifier}
                  onChange={handleInputChange}
                  maxLength={useMobile ? 10 : undefined}
                  aria-label={useMobile ? 'Mobile number' : 'Email address'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A6950] hover:bg-[#145a44] text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-[#1A6950]/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#CDF546] focus:ring-offset-2"
            >
              {loading ? 'Sending...' : (
                <>
                  Reset Password
                  <ArrowRight size={20} className="text-[#CDF546]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Remember your password?{' '}
              <Link to="/login/customer" className="text-[#1A6950] hover:underline focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
