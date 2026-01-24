import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authToasts } from '../utils/toast';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#CDF546] mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Unauthorized access attempt to protected route:', location.pathname);
    }
    authToasts.unauthorized();
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Role mismatch: required ${requiredRole}, user has ${user.role}`);
    }
    authToasts.unauthorized();
    return <Navigate to="/" replace />;
  }

  // Check if user role is in allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Role not allowed: user has ${user.role}, allowed roles:`, allowedRoles);
    }
    authToasts.unauthorized();
    return <Navigate to="/" replace />;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`Access granted to ${location.pathname} for user role: ${user.role}`);
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;