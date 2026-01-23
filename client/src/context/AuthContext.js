import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';
import { CONFIG, SOCKET_EVENTS } from '../constants/config';
import apiClient from '../utils/api';
import { io } from 'socket.io-client';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // Fetch current user from token
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('vendorify_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('vendorify_user', JSON.stringify(response.user));
      } else {
        // Invalid response, clear auth data
        setUser(null);
        apiClient.clearAuth();
      }
    } catch (error) {
      console.error('Fetch current user error:', error);
      // Token is invalid, clear auth data
      apiClient.clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Listen for storage changes (logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'vendorify_token' && !e.newValue) {
        // Token was removed, clear user state
        setUser(null);
        if (socket) {
          socket.disconnect();
          setSocket(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [socket]);

  // Socket Connection Management
  useEffect(() => {
    if (user && user.id) {
      const newSocket = io(CONFIG.API.SOCKET_URL);

      newSocket.on(SOCKET_EVENTS.CONNECTION, () => {
        if (user.role === ROLES.VENDOR) {
          // Join vendor room - will be handled by VendorDashboard with actual vendor profile ID
        } else if (user.role === ROLES.CUSTOMER) {
          newSocket.emit(SOCKET_EVENTS.JOIN_CUSTOMER_ROOM, user.id);
        }
      });

      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [user]);

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiClient.register(userData);
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // Navigate based on role
        const redirectPath = 
          response.user.role === ROLES.ADMIN ? '/admin' :
          response.user.role === ROLES.VENDOR ? '/vendor' :
          '/customer';
        
        navigate(redirectPath);
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiClient.login(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // Navigate based on role
        const redirectPath = 
          response.user.role === ROLES.ADMIN ? '/admin' :
          response.user.role === ROLES.VENDOR ? '/vendor' :
          '/customer';
        
        navigate(redirectPath);
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state immediately
      setUser(null);
      // Clear localStorage to ensure no stale data
      localStorage.removeItem('vendorify_token');
      localStorage.removeItem('vendorify_user');
      // Disconnect socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      // Navigate to home page
      navigate('/');
    }
  };

  // Update user function
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('vendorify_user', JSON.stringify(updatedUser));
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return user && user.role === requiredRole;
  };

  // Check if user is authenticated
  const isAuthenticated = user && user.id;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateUser,
        hasRole,
        isAuthenticated,
        socket
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
