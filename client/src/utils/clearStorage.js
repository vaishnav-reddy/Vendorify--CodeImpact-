/**
 * Clear all browser storage and reload the page
 * Use this when the app is stuck in a loading state
 */
export const clearAllStorage = () => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies (if any)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('All storage cleared successfully');
    
    // Reload the page
    window.location.reload();
  } catch (error) {
    console.error('Error clearing storage:', error);
    // Force reload anyway
    window.location.reload();
  }
};

/**
 * Clear only authentication-related storage
 */
export const clearAuthStorage = () => {
  try {
    // Clear auth-related localStorage items
    localStorage.removeItem('vendorify_token');
    localStorage.removeItem('vendorify_user');
    localStorage.removeItem('vendorify_refresh_token');
    
    // Clear session storage
    sessionStorage.removeItem('vendorify_session_id');
    
    console.log('Auth storage cleared successfully');
    
    // Redirect to home
    window.location.href = '/';
  } catch (error) {
    console.error('Error clearing auth storage:', error);
    // Force redirect anyway
    window.location.href = '/';
  }
};

// Add global functions for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  window.clearAllStorage = clearAllStorage;
  window.clearAuthStorage = clearAuthStorage;
}