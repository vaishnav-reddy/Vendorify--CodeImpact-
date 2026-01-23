import { useState, useCallback, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { filterVendorsWithinRadius } from '../utils/geoUtils';

/**
 * Custom hook for managing map state and vendor filtering
 */
export const useMapState = (radiusKm = 2) => {
  const { vendors, userLocation, loading, error } = useAppData();
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [mapTheme, setMapTheme] = useState('light');

  // Filter vendors within radius
  const nearbyVendors = filterVendorsWithinRadius(vendors, userLocation, radiusKm);

  // Set initial map center when user location is available
  useEffect(() => {
    if (userLocation && !mapCenter) {
      setMapCenter(userLocation);
    }
  }, [userLocation, mapCenter]);

  // Handle vendor selection
  const handleVendorSelect = useCallback((vendor) => {
    setSelectedVendorId(vendor._id);
  }, []);

  // Handle map center change
  const handleMapCenterChange = useCallback((newCenter) => {
    setMapCenter(newCenter);
  }, []);

  // Reset selection
  const clearSelection = useCallback(() => {
    setSelectedVendorId(null);
  }, []);

  // Get selected vendor
  const selectedVendor = nearbyVendors.find(v => v._id === selectedVendorId);

  return {
    // Map state
    mapCenter,
    mapZoom,
    mapTheme,
    setMapCenter,
    setMapZoom,
    setMapTheme,
    
    // Vendor state
    nearbyVendors,
    selectedVendorId,
    selectedVendor,
    
    // Handlers
    handleVendorSelect,
    handleMapCenterChange,
    clearSelection,
    
    // App state
    userLocation,
    loading,
    error
  };
};