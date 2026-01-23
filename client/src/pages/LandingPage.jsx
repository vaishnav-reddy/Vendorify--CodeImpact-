import { useNavigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';
import Hero from '../components/Hero';
import Navbar from '../components/common/Navbar';
import CategoriesCarousel from '../components/CategoriesCarousel';
import { Footer } from '../components/common/Footer';

import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  const handleContinue = (role) => {
    // For now, redirect to login page - users will select their role there
    // In the future, we could pre-select the role or have separate flows
    navigate('/login');
  };

  const handleDashboardRedirect = () => {
    if (user?.role === ROLES.VENDOR) navigate('/vendor');
    else if (user?.role === ROLES.CUSTOMER) navigate('/customer');
    else if (user?.role === ROLES.ADMIN) navigate('/admin');
  };

  // Debug function to clear auth (you can remove this later)
  const clearAuth = () => {
    localStorage.removeItem('vendorify_token');
    localStorage.removeItem('vendorify_user');
    localStorage.removeItem('vendorify_customer');
    localStorage.removeItem('vendorify_customer_orders');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF9DC]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#CDF546] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div id="hero">
        {isAuthenticated ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FDF9DC] px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Welcome Back, {user?.name}!</h1>
            <p className="text-xl text-gray-600 mb-8">You are already logged in.</p>
            <div className="flex gap-4">
              <button
                onClick={handleDashboardRedirect}
                className="bg-[#1A6950] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#145a44] transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={clearAuth}
                className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all"
              >
                Logout & Reset
              </button>
            </div>
          </div>
        ) : (
          <Hero
            onContinueCustomer={() => handleContinue(ROLES.CUSTOMER)}
            onContinueVendor={() => handleContinue(ROLES.VENDOR)}
          />
        )}
      </div>
      <CategoriesCarousel />
      <Footer />
    </div>
  );
};

export default LandingPage;
