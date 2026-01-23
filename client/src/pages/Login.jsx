import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, User, Store, Shield, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ROLES.CUSTOMER
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    {
      value: ROLES.CUSTOMER,
      label: 'Customer',
      icon: User,
      description: 'Browse and order from vendors',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      value: ROLES.VENDOR,
      label: 'Vendor',
      icon: Store,
      description: 'Manage your shop and orders',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      value: ROLES.ADMIN,
      label: 'Admin',
      icon: Shield,
      description: 'Platform administration',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      if (!result.success) {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF9DC] via-white to-[#F0F9FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/logo.svg" 
                alt="Vendorify" 
                className="w-12 h-12 object-contain"
              />
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Vendorify
              </h1>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              I am a
            </label>
            <div className="grid grid-cols-1 gap-3">
              {roleOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = formData.role === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleRoleSelect(option.value)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected 
                        ? `${option.color} border-current shadow-lg scale-[1.02]` 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${isSelected ? 'text-current' : 'text-gray-400'}`} />
                      <div>
                        <div className={`font-bold text-sm uppercase tracking-wider ${isSelected ? 'text-current' : 'text-gray-900'}`}>
                          {option.label}
                        </div>
                        <div className={`text-xs ${isSelected ? 'text-current opacity-80' : 'text-gray-500'}`}>
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#CDF546] transition-all ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#CDF546]'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#CDF546] transition-all ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#CDF546]'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#CDF546] hover:bg-[#b8dd3e] disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-bold py-4 px-6 rounded-2xl uppercase tracking-wider transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Forgot your password?
            </Link>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>Don't have an account?</span>
              <Link
                to="/signup"
                className="font-bold text-gray-900 hover:text-emerald-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;