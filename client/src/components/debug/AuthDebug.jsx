import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthDebug = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>User: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
      <div>Token: {localStorage.getItem('vendorify_token') ? 'exists' : 'none'}</div>
      <div>Session: {sessionStorage.getItem('vendorify_session_id') ? 'exists' : 'none'}</div>
    </div>
  );
};

export default AuthDebug;