import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './constants/roles';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CustomerLogin from './pages/customer/CustomerLogin';
import VendorLogin from './pages/vendor/VendorLogin';
import CustomerSignup from './pages/customer/CustomerSignup';
import VendorSignup from './pages/vendor/VendorSignup';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InfoPage from './pages/InfoPage';
import ForgotPassword from './pages/ForgotPassword';

import CustomerLayout from './pages/customer/CustomerLayout';
import VendorDetails from './pages/customer/VendorDetails';
import CartPage from './pages/customer/CartPage';
import CustomerOrders from './pages/customer/CustomerOrders';
import MapPage from './pages/customer/MapPage';
import CustomerProfile from './pages/customer/CustomerProfile';

import VendorLayout from './pages/vendor/VendorLayout';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorProfile from './pages/vendor/VendorProfile';

import AdminLayout from './pages/admin/AdminLayout';
import AdminVendors from './pages/admin/AdminVendors';

import ConditionalChatbot from './components/chat/ConditionalChatbot';

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* New Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Legacy Authentication Routes (for backward compatibility) */}
            <Route path="/login/customer" element={<CustomerLogin />} />
            <Route path="/login/vendor" element={<VendorLogin />} />
            <Route path="/signup/customer" element={<CustomerSignup />} />
            <Route path="/signup/vendor" element={<VendorSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Info Pages */}
            <Route path="/about" element={<InfoPage page="about" />} />
            <Route path="/security" element={<InfoPage page="security" />} />
            <Route path="/integrations" element={<InfoPage page="integrations" />} />
            <Route path="/careers" element={<InfoPage page="careers" />} />
            <Route path="/blog" element={<InfoPage page="blog" />} />
            <Route path="/docs" element={<InfoPage page="docs" />} />
            <Route path="/help" element={<InfoPage page="help" />} />
            <Route path="/terms" element={<InfoPage page="terms" />} />
            <Route path="/privacy" element={<InfoPage page="privacy" />} />
            <Route path="/customers" element={<InfoPage page="customers" />} />
            
            {/* Protected Customer Routes */}
            <Route path="/customer" element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <CustomerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CustomerDashboard />} />
              <Route path="vendor/:vendorId" element={<VendorDetails />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="map" element={<MapPage />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>

            {/* Protected Vendor Routes */}
            <Route path="/vendor" element={
              <ProtectedRoute allowedRoles={[ROLES.VENDOR]}>
                <VendorLayout />
              </ProtectedRoute>
            }>
              <Route index element={<VendorDashboard />} />
              <Route path="orders" element={<VendorOrders />} />
              <Route path="profile" element={<VendorProfile />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="vendors" element={<AdminVendors />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <ToastContainer 
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            className="z-50"
            toastClassName="bg-white border border-gray-200 rounded-2xl shadow-lg"
          />

          <ConditionalChatbot />
        </div>
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
