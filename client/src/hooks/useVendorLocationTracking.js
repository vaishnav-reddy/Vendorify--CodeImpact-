import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/api';
import { vendorToasts } from '../utils/toast';

// Custom hook for vendor location tracking (REQUIREMENT 2)
export const useVendorLocationTracking = (vendorType = 'fixed', isOnline = false) => {
  const { user } = useAuth();
  const intervalRef = useRef(null);
  const lastLocationRef = useRef(null);

  const updateLocation = useCallback(async (position) => {
    const { latitude, longitude } = position.coords;
    
    // Only update if location has changed significantly (>10 meters)
    if (lastLocationRef.current) {
      const distance = calculateDistance(
        lastLocationRef.current.lat,
        lastLocationRef.current.lng,
        latitude,
        longitude
      );
      if (distance < 0.01) return; // Less than 10 meters
    }

    try {
      const response = await apiClient.updateLiveLocation({
        latitude,
        longitude
      });

      if (response.success) {
        lastLocationRef.current = { lat: latitude, lng: longitude };
        console.log('Location updated successfully');
        
        // Show success confirmation
        vendorToasts.locationUpdated();
      }
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }, []);

  const handleLocationError = useCallback((error) => {
    console.error('Location error:', error);
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log('Location permission denied');
        break;
      case error.POSITION_UNAVAILABLE:
        console.log('Location information unavailable');
        break;
      case error.TIMEOUT:
        console.log('Location request timeout');
        break;
    }
  }, []);

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    // Get initial location
    navigator.geolocation.getCurrentPosition(updateLocation, handleLocationError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });

    // For roaming vendors, update location every 10-15 seconds
    if (vendorType === 'roaming') {
      intervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(updateLocation, handleLocationError, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        });
      }, 12000); // 12 seconds interval
    }
  }, [vendorType, updateLocation, handleLocationError]);

  const stopLocationTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Only track location for vendors who are online
    if (user?.role === 'vendor' && isOnline) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [user, vendorType, isOnline, startLocationTracking, stopLocationTracking]);

  return {
    startLocationTracking,
    stopLocationTracking
  };
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}