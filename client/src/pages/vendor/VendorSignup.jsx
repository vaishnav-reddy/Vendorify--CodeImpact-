import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Phone, User, Mail, ShoppingBag, Eye, EyeOff, Store, MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { navigateToDashboard } from '../../utils/navigation';

const VendorSignup = () => {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    shopName: '',
    mobile: '', 
    email: '',
    password: '', 
    confirmPassword: '',
    address: '',
    latitude: null,
    longitude: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Redirect authenticated users to their dashboard
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('User already authenticated, redirecting to dashboard');
      }
      navigateToDashboard(navigate, user);
    }
  }, [isAuthenticated, user, navigate]);

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
        latitude: form.latitude,
        longitude: form.longitude,
        role: 'vendor'
      });

      if (result.success) {
        toast.success('Registration successful!');
        // Navigate to vendor dashboard after successful registration
        if (result.user) {
          // Add a small delay to ensure toast is visible
          setTimeout(() => {
            navigateToDashboard(navigate, result.user);
          }, 1000);
        } else {
          console.warn('Registration successful but no user data received');
          // Fallback navigation
          navigate('/vendor');
        }
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Vendor registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm({ ...form, mobile: value });
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted;
              setForm(prev => ({
                ...prev,
                address,
                latitude,
                longitude
              }));
              toast.success('Location detected successfully!');
            }
          } else {
            // Fallback: just set coordinates
            setForm(prev => ({
              ...prev,
              latitude,
              longitude,
              address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
            }));
            toast.success('Location coordinates captured!');
          }
        } catch (error) {
          // Fallback: just set coordinates
          setForm(prev => ({
            ...prev,
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          }));
          toast.success('Location coordinates captured!');
        }
        
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
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
              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A6950] transition-colors">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your shop location or use GPS"
                    className="w-full bg-gray-50/50 border-2 border-transparent pl-14 pr-4 py-4 rounded-[20px] text-gray-900 font-bold placeholder:text-gray-300 focus:bg-white focus:border-[#CDF546] focus:ring-0 transition-all outline-none"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    aria-label="Shop address"
                  />
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="w-full bg-[#CDF546] hover:bg-[#b8dd3e] disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-[20px] text-sm transition-all flex items-center justify-center gap-2"
                >
                  {locationLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation size={16} />
                      Use Current Location
                    </>
                  )}
                </button>
                {form.latitude && form.longitude && (
                  <div className="text-xs text-green-600 font-medium text-center">
                    ✓ Location captured: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                  </div>
                )}
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
