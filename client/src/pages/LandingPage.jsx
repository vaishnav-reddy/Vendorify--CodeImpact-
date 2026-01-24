import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Navbar from '../components/common/Navbar';
import CategoriesCarousel from '../components/CategoriesCarousel';
import { Footer } from '../components/common/Footer';
import ErrorBoundary from '../components/common/ErrorBoundary';

import { useAuth } from '../context/AuthContext';
import { debugAuth, clearAllAuth } from '../utils/authDebug';
import { navigateToDashboard } from '../utils/navigation';
import usePerformanceMonitor from '../hooks/usePerformanceMonitor';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, forceLogout } = useAuth();
  
  // Monitor performance metrics
  usePerformanceMonitor();

  const handleDashboardRedirect = () => {
    navigateToDashboard(navigate, user);
  };

  const handleForceLogout = () => {
    forceLogout();
  };

  const handleTestToken = async () => {
    await debugAuth();
  };

  // Auto-redirect authenticated users to their dashboard only if they explicitly navigate to landing page
  // This prevents auto-redirect when server starts and user is already authenticated
  React.useEffect(() => {
    // Don't redirect on initial page load - only redirect if user navigates to landing page while authenticated
    // Check if user came from another route (not direct page load)
    const referrer = document.referrer;
    const isDirectAccess = !referrer || referrer === window.location.href;
    
    if (!loading && isAuthenticated && user && user.id && !isDirectAccess) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auto-redirecting authenticated user to dashboard');
      }
      handleDashboardRedirect();
    }
  }, [isAuthenticated, user, loading]);

  // Debug: Log current auth state
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('LandingPage - Auth State:', {
        isAuthenticated,
        user: user ? { id: user.id, name: user.name, role: user.role } : null,
        loading,
        token: localStorage.getItem('vendorify_token') ? 'exists' : 'none',
        storedUser: localStorage.getItem('vendorify_user') ? 'exists' : 'none',
        sessionId: sessionStorage.getItem('vendorify_session_id') ? 'exists' : 'none'
      });
    }
    
    // Make debug functions available globally
    window.debugAuth = debugAuth;
    window.clearAllAuth = clearAllAuth;
  }, [isAuthenticated, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF9DC] px-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-[#CDF546]/30 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border-4 border-transparent border-t-[#CDF546] rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium text-base md:text-lg">Loading your experience...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to local vendors</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (isAuthenticated && user && user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF9DC] px-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-[#1A6950]/30 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border-4 border-transparent border-t-[#1A6950] rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-gray-600 font-medium text-base md:text-lg">Redirecting to your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Welcome back, {user.name}!</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <Navbar />
        <div id="hero">
          <Hero />
        </div>
        <CategoriesCarousel />
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default LandingPage;
