// Debug utilities for authentication issues
import apiClient from './api';

export const debugAuth = async () => {
  console.log('=== AUTH DEBUG INFO ===');
  console.log('localStorage contents:');
  
  // Check all localStorage items
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value);
  }
  
  console.log('\nVendorify specific items:');
  console.log('vendorify_token:', localStorage.getItem('vendorify_token'));
  console.log('vendorify_user:', localStorage.getItem('vendorify_user'));
  console.log('vendorify_refresh_token:', localStorage.getItem('vendorify_refresh_token'));
  
  // Test token validity
  console.log('\nTesting token validity...');
  try {
    const tokenTest = await apiClient.testToken();
    console.log('Token test result:', tokenTest);
  } catch (error) {
    console.error('Token test error:', error);
  }
  
  console.log('=== END DEBUG INFO ===');
};

export const clearAllAuth = () => {
  console.log('Clearing all authentication data...');
  
  // Clear all vendorify related items
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('vendorify_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log(`Removing: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Also clear any other common auth keys
  const commonAuthKeys = ['token', 'user', 'auth', 'session'];
  commonAuthKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Removing common auth key: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  console.log('All authentication data cleared!');
  
  // Reload the page to reset the app state
  window.location.reload();
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  window.clearAllAuth = clearAllAuth;
}