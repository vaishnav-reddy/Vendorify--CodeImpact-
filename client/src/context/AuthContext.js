import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';
import { CONFIG, SOCKET_EVENTS } from '../constants/config';
import apiClient from '../utils/api';
import { authToasts } from '../utils/toast';
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
      // First check if server is reachable and get server info
      const healthResponse = await fetch(`${CONFIG.API.BASE_URL}/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        const lastKnownServerStart = localStorage.getItem('vendorify_server_start');
        
        // If server start time is different, server was restarted
        if (lastKnownServerStart && lastKnownServerStart !== healthData.serverStartTime) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Server restart detected, clearing auth data');
          }
          clearAuthData();
          setLoading(false);
          return;
        }
        
        // Store current server start time
        localStorage.setItem('vendorify_server_start', healthData.serverStartTime);
      }

      // Test if the token is still valid by making an API call
      const response = await apiClient.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('vendorify_user', JSON.stringify(response.user));
        
        // Set session ID to maintain session only after successful validation
        sessionStorage.setItem('vendorify_session_id', Date.now().toString());
      } else {
        // Invalid response, clear auth data
        if (process.env.NODE_ENV === 'development') {
          console.log('Invalid user response, clearing auth data');
        }
        clearAuthData();
      }
    } catch (error) {
      console.error('Fetch current user error:', error);
      // Token is invalid or expired, or server is not reachable
      if (process.env.NODE_ENV === 'development') {
        console.log('Token validation failed or server unreachable, clearing auth data');
      }
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to clear all auth data and cache
  const clearAuthData = () => {
    setUser(null);
    localStorage.removeItem('vendorify_token');
    localStorage.removeItem('vendorify_user');
    localStorage.removeItem('vendorify_refresh_token');
    localStorage.removeItem('vendorify_server_start');
    sessionStorage.removeItem('vendorify_session_id');
    // Clear any other vendorify-related data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vendorify_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear browser cache for API requests
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('vendorify') || name.includes('api')) {
            caches.delete(name);
          }
        });
      });
    }
  };

  useEffect(() => {
    // Always try to fetch current user on app start
    // Don't rely on sessionStorage for session validation
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
        
        // Set session ID to maintain session
        sessionStorage.setItem('vendorify_session_id', Date.now().toString());
        
        // Return user data, let the component handle navigation
        return { success: true, user: response.user };
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
        
        // Set session ID to maintain session
        sessionStorage.setItem('vendorify_session_id', Date.now().toString());
        
        // Navigate based on role - don't navigate here, let the component handle it
        return { success: true, user: response.user };
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
      // Clear all auth data
      clearAuthData();
      // Disconnect socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      // Navigate to home page
      navigate('/');
    }
  };

  // Force logout - clears everything without API call
  const forceLogout = () => {
    clearAuthData();
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    navigate('/');
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
  const isAuthenticated = Boolean(user && user.id && !loading);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        forceLogout,
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
