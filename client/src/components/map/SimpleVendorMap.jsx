import React, { useState, useCallback, useMemo } from 'react';
import { 
  MapPin, 
  Star, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { filterVendorsWithinRadius, formatDistance } from '../../utils/geoUtils';
import { useAppData } from '../../context/AppDataContext';
import LoadingSpinner from '../common/LoadingSpinner';
import LeafletMap from './LeafletMap';

/**
 * Simple vendor map component using the reliable LeafletMap
 */
const SimpleVendorMap = ({ 
  className = '',
  height = 'h-96',
  radiusKm = 2,
  onVendorSelect,
  selectedVendorId
}) => {
  const { 
    vendors, 
    userLocation, 
    loading, 
    geoError,
    refetchLocation
  } = useAppData();

  // Filter vendors within radius
  const filteredVendors = useMemo(() => {
    if (!userLocation) return [];
    return filterVendorsWithinRadius(vendors, userLocation, radiusKm);
  }, [vendors, userLocation, radiusKm]);

  // Handle vendor selection
  const handleVendorClick = useCallback((vendor) => {
    onVendorSelect?.(vendor);
  }, [onVendorSelect]);

  // Handle retry
  const handleRetry = useCallback(() => {
    refetchLocation();
  }, [refetchLocation]);

  // Loading state
  if (loading) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center border border-green-100`}>
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-green-700 font-medium mt-4">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (geoError && !userLocation) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-red-100`}>
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-red-500" size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Location Required</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Enable location access to see nearby vendors.
        </p>
        <button
          onClick={handleRetry}
          className="bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={14} />
          Enable Location
        </button>
      </div>
    );
  }

  return (
    <div className={`${className} ${height} rounded-2xl overflow-hidden shadow-lg border border-gray-200`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <div>
              <h3 className="font-bold text-sm">Nearby Vendors</h3>
              <p className="text-white/80 text-xs">{filteredVendors.length} vendors within {radiusKm}km</p>
            </div>
          </div>
          
          <button
            onClick={refetchLocation}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-1.5 transition-colors"
            title="Refresh location"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="h-full">
        <LeafletMap
          vendors={filteredVendors}
          userLocation={userLocation}
          onVendorSelect={handleVendorClick}
          selectedVendorId={selectedVendorId}
          radiusKm={radiusKm}
          height="h-full"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SimpleVendorMap;