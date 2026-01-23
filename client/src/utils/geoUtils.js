/**
 * Geospatial utility functions for distance calculations and geo-filtering
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Filter vendors within specified radius
 * @param {Array} vendors - Array of vendor objects
 * @param {Object} userLocation - User's current location {lat, lng}
 * @param {number} radiusKm - Radius in kilometers (default: 2)
 * @returns {Array} Filtered vendors with distance property
 */
export const filterVendorsWithinRadius = (vendors, userLocation, radiusKm = 2) => {
  if (!userLocation || !vendors.length) {
    console.log('No user location or vendors for filtering');
    return [];
  }
  
  console.log('Filtering vendors:', vendors.length, 'within', radiusKm, 'km of', userLocation);
  
  const filtered = vendors
    .map(vendor => {
      // Handle different coordinate formats
      let vendorLat, vendorLng;
      
      if (vendor.coordinates?.lat && vendor.coordinates?.lng) {
        // Transformed coordinates format
        vendorLat = vendor.coordinates.lat;
        vendorLng = vendor.coordinates.lng;
      } else if (vendor.location?.coordinates) {
        // GeoJSON format [lng, lat]
        vendorLng = vendor.location.coordinates[0];
        vendorLat = vendor.location.coordinates[1];
      } else if (vendor.latitude && vendor.longitude) {
        // Direct lat/lng properties
        vendorLat = vendor.latitude;
        vendorLng = vendor.longitude;
      } else if (vendor.lat && vendor.lng) {
        // Alternative lat/lng properties
        vendorLat = vendor.lat;
        vendorLng = vendor.lng;
      } else {
        // Skip vendors without valid coordinates
        console.warn('Vendor missing coordinates:', vendor.shopName, vendor);
        return null;
      }
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        vendorLat,
        vendorLng
      );
      
      console.log(`Vendor ${vendor.shopName}: ${distance}km away`);
      
      return {
        ...vendor,
        distance,
        coordinates: { lat: vendorLat, lng: vendorLng }
      };
    })
    .filter(vendor => vendor && vendor.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
    
  console.log('Filtered result:', filtered.length, 'vendors within radius');
  return filtered;
};

/**
 * Get formatted distance string
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 0.1) return '< 100m';
  if (distance < 1) return `${Math.round(distance * 1000)}m`;
  return `${distance}km`;
};

/**
 * Check if coordinates are valid
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if coordinates are valid
 */
export const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

/**
 * Get bounds for a given center point and radius
 * @param {Object} center - Center point {lat, lng}
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Object} Bounds object with north, south, east, west
 */
export const getBounds = (center, radiusKm) => {
  const latDelta = radiusKm / 111; // Approximate km per degree latitude
  const lngDelta = radiusKm / (111 * Math.cos(toRadians(center.lat)));
  
  return {
    north: center.lat + latDelta,
    south: center.lat - latDelta,
    east: center.lng + lngDelta,
    west: center.lng - lngDelta
  };
};