import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const hasRequiredRole = allowedRoles.includes(user.role);
  
  if (!hasRequiredRole) {
    // Redirect to the appropriate dashboard based on user role
    const redirectPath = 
      user.role === 'admin' ? '/admin' :
      user.role === 'vendor' ? '/vendor' :
      '/customer';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
