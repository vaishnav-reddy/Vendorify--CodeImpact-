/**
 * Location utilities for handling coordinates and reverse geocoding
 */

import apiClient from './api';

// Cache for reverse geocoding results to avoid repeated API calls
const geocodeCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Convert coordinates to human-readable address with caching
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {boolean} useCache - Whether to use cached results
 * @returns {Promise<Object>} Location object with address components
 */
export const coordinatesToAddress = async (lat, lng, useCache = true) => {
  if (!lat || !lng) {
    return {
      place: 'Unknown Location',
      district: 'Unknown District',
      state: 'Unknown State',
      country: 'India',
      fullAddress: 'Location not available',
      coordinates: { lat, lng }
    };
  }

  // Create cache key
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  
  // Check cache first
  if (useCache && geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    } else {
      geocodeCache.delete(cacheKey);
    }
  }

  try {
    const result = await apiClient.reverseGeocode(lat, lng);
    
    // Enhance the result with coordinates
    const enhancedResult = {
      ...result,
      coordinates: { lat, lng },
      timestamp: Date.now()
    };

    // Cache the result
    if (useCache && !result.rateLimited) {
      geocodeCache.set(cacheKey, {
        data: enhancedResult,
        timestamp: Date.now()
      });
    }

    return enhancedResult;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    
    // Return fallback with coordinates
    return {
      place: 'Location Service Unavailable',
      district: 'Unknown District',
      state: 'Unknown State',
      country: 'India',
      fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      coordinates: { lat, lng },
      error: true
    };
  }
};

/**
 * Batch convert multiple coordinates to addresses
 * @param {Array} locations - Array of {lat, lng} objects
 * @param {number} batchSize - Number of requests to process at once
 * @returns {Promise<Array>} Array of location objects with addresses
 */
export const batchCoordinatesToAddresses = async (locations, batchSize = 3) => {
  const results = [];
  
  for (let i = 0; i < locations.length; i += batchSize) {
    const batch = locations.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (location, index) => {
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, index * 200));
      return coordinatesToAddress(location.lat, location.lng);
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches
    if (i + batchSize < locations.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};

/**
 * Format location for display
 * @param {Object} location - Location object from coordinatesToAddress
 * @param {string} format - Format type: 'short', 'medium', 'full'
 * @returns {string} Formatted address string
 */
export const formatLocationForDisplay = (location, format = 'medium') => {
  if (!location) return 'Unknown Location';
  
  if (location.rateLimited) {
    return 'Location service temporarily unavailable';
  }
  
  if (location.error) {
    return location.fullAddress || 'Location unavailable';
  }
  
  switch (format) {
    case 'short':
      return location.place || location.district || 'Unknown Area';
    
    case 'medium':
      const parts = [];
      if (location.place && location.place !== 'Unknown Area') {
        parts.push(location.place);
      }
      if (location.district && location.district !== 'Unknown District') {
        parts.push(location.district);
      }
      return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
    
    case 'full':
      return location.fullAddress || [
        location.place,
        location.district,
        location.state,
        location.country
      ].filter(part => part && !part.includes('Unknown')).join(', ') || 'Unknown Location';
    
    default:
      return formatLocationForDisplay(location, 'medium');
  }
};

/**
 * Get distance between two coordinates in kilometers
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Check if coordinates are valid
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} Whether coordinates are valid
 */
export const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' && 
    lat >= -90 && lat <= 90 && 
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  );
};

/**
 * Clear the geocoding cache
 */
export const clearGeocodeCache = () => {
  geocodeCache.clear();
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  geocodeCache.forEach((value) => {
    if (now - value.timestamp < CACHE_DURATION) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  });
  
  return {
    totalEntries: geocodeCache.size,
    validEntries,
    expiredEntries,
    cacheHitRate: validEntries / Math.max(geocodeCache.size, 1)
  };
};