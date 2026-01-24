/**
 * Cache utilities to prevent repeated data clearing and improve performance
 */

// Cache keys
export const CACHE_KEYS = {
  USER_LOCATION: 'vendorify_user_location',
  VENDOR_DATA: 'vendorify_vendor_data',
  CUSTOMER_PROFILE: 'vendorify_customer_profile',
  LOCATION_CACHE: 'vendorify_location_cache',
  APP_VERSION: 'vendorify_app_version',
  LAST_CLEAR: 'vendorify_last_clear'
};

// Current app version - increment this when you want to force cache clear
const APP_VERSION = '1.2.0';

/**
 * Check if cache should be cleared based on version or time
 * @returns {boolean} Whether cache should be cleared
 */
export const shouldClearCache = () => {
  const storedVersion = localStorage.getItem(CACHE_KEYS.APP_VERSION);
  const lastClear = localStorage.getItem(CACHE_KEYS.LAST_CLEAR);
  const now = Date.now();
  
  // Clear if version changed
  if (storedVersion !== APP_VERSION) {
    return true;
  }
  
  // Clear if more than 24 hours since last clear
  if (lastClear && (now - parseInt(lastClear)) > 24 * 60 * 60 * 1000) {
    return true;
  }
  
  return false;
};

/**
 * Smart cache clear - only clears when necessary
 */
export const smartCacheClear = () => {
  if (shouldClearCache()) {
    console.log('🧹 Performing smart cache clear...');
    
    // Clear only non-essential cache
    const keysToKeep = [
      'vendorify_token',
      'vendorify_user',
      'vendorify_session_id'
    ];
    
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vendorify_') && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Update version and clear timestamp
    localStorage.setItem(CACHE_KEYS.APP_VERSION, APP_VERSION);
    localStorage.setItem(CACHE_KEYS.LAST_CLEAR, Date.now().toString());
    
    console.log(`🧹 Cleared ${keysToRemove.length} cache entries`);
  }
};

/**
 * Set cache item with expiration
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds
 */
export const setCacheItem = (key, value, ttl = 60 * 60 * 1000) => {
  const item = {
    value,
    timestamp: Date.now(),
    ttl
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Get cache item if not expired
 * @param {string} key - Cache key
 * @returns {any|null} Cached value or null if expired/not found
 */
export const getCacheItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    const now = Date.now();
    
    if (now - parsed.timestamp > parsed.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.value;
  } catch (error) {
    console.warn(`Failed to get cache item ${key}:`, error);
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * Remove expired cache items
 */
export const cleanExpiredCache = () => {
  const keysToRemove = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('vendorify_')) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && parsed.ttl) {
            const now = Date.now();
            if (now - parsed.timestamp > parsed.ttl) {
              keysToRemove.push(key);
            }
          }
        }
      } catch (error) {
        // Invalid JSON, remove it
        keysToRemove.push(key);
      }
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  if (keysToRemove.length > 0) {
    console.log(`🧹 Cleaned ${keysToRemove.length} expired cache entries`);
  }
};

/**
 * Initialize cache management
 */
export const initCacheManagement = () => {
  // Perform smart cache clear on app start
  smartCacheClear();
  
  // Clean expired cache items
  cleanExpiredCache();
  
  // Set up periodic cache cleaning
  setInterval(cleanExpiredCache, 10 * 60 * 1000); // Every 10 minutes
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  let totalItems = 0;
  let vendorifyItems = 0;
  let expiredItems = 0;
  let totalSize = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      totalItems++;
      const value = localStorage.getItem(key);
      totalSize += key.length + (value ? value.length : 0);
      
      if (key.startsWith('vendorify_')) {
        vendorifyItems++;
        
        try {
          const parsed = JSON.parse(value);
          if (parsed.timestamp && parsed.ttl) {
            const now = Date.now();
            if (now - parsed.timestamp > parsed.ttl) {
              expiredItems++;
            }
          }
        } catch (error) {
          // Not a cached item with TTL
        }
      }
    }
  }
  
  return {
    totalItems,
    vendorifyItems,
    expiredItems,
    totalSize,
    sizeInKB: Math.round(totalSize / 1024)
  };
};