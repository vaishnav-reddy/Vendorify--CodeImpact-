import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Truck,
  Star,
  RefreshCw,
  Filter,
  Navigation as RouteIcon,
  AlertCircle,
  Timer
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { calculateDistance, formatDistance } from '../../utils/geoUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ThemedVendorMap from './ThemedVendorMap';
import apiClient from '../../utils/api';

const RoamingVendorMap = ({ 
  className = '',
  height = 'h-96',
  radiusKm = 5,
  onVendorSelect,
  selectedVendorId,
  showControls = true
}) => {
  const { userLocation, loading: appLoading } = useAppData();
  
  const [roamingVendors, setRoamingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showVendorList, setShowVendorList] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch roaming vendors
  const fetchRoamingVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        radius: radiusKm * 1000 // Convert km to meters
      };

      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      const response = await apiClient.getRoamingVendors(params);
      
      if (response.success) {
        setRoamingVendors(response.vendors || []);
      } else {
        setError('Failed to fetch roaming vendors');
      }
    } catch (err) {
      console.error('Fetch roaming vendors error:', err);
      setError('Failed to load roaming vendors');
    } finally {
      setLoading(false);
    }
  }, [userLocation, radiusKm]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchRoamingVendors();
    
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchRoamingVendors, 30000);
    
    return () => clearInterval(interval);
  }, [fetchRoamingVendors]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRoamingVendors();
    setRefreshing(false);
  };

  // Filter vendors by category
  const filteredVendors = useMemo(() => {
    if (filterCategory === 'all') return roamingVendors;
    return roamingVendors.filter(vendor => vendor.category === filterCategory);
  }, [roamingVendors, filterCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(roamingVendors.map(v => v.category).filter(Boolean))];
    return ['all', ...cats];
  }, [roamingVendors]);

  // Calculate ETA for vendor
  const getVendorETA = (vendor) => {
    if (vendor.etaMinutes !== undefined) {
      return vendor.etaMinutes;
    }
    
    if (vendor.schedule?.estimatedArrival) {
      const now = new Date();
      const eta = new Date(vendor.schedule.estimatedArrival);
      return Math.max(0, Math.round((eta - now) / (1000 * 60)));
    }
    
    return null;
  };

  // Get vendor status
  const getVendorStatus = (vendor) => {
    if (vendor.schedule?.isMoving) {
      return { text: 'Moving', color: 'text-blue-600', bg: 'bg-blue-100' };
    }
    
    if (vendor.schedule?.currentStop) {
      return { text: 'At Stop', color: 'text-green-600', bg: 'bg-green-100' };
    }
    
    return { text: 'Online', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  if (appLoading || loading) {
    return (
      <div className={`${className} ${height} flex items-center justify-center bg-gray-50 rounded-lg`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} ${height} flex items-center justify-center bg-gray-50 rounded-lg`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Map */}
        <div className={`flex-1 ${height} relative`}>
          <ThemedVendorMap
            vendors={filteredVendors}
            userLocation={userLocation}
            onVendorClick={onVendorSelect}
            selectedVendorId={selectedVendorId}
            className="w-full h-full rounded-lg"
            showRoamingIndicators={true}
          />

          {/* Map Controls */}
          {showControls && (
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white shadow-lg rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh vendors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setShowVendorList(!showVendorList)}
                className="p-2 bg-white shadow-lg rounded-lg hover:bg-gray-50 transition-colors"
                title="Toggle vendor list"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Vendor List */}
        <AnimatePresence>
          {showVendorList && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-80 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span>Roaming Vendors</span>
                  </h3>
                  <span className="text-sm text-gray-500">
                    {filteredVendors.length} nearby
                  </span>
                </div>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredVendors.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <RouteIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No roaming vendors nearby</p>
                    <p className="text-sm mt-1">Try expanding your search radius</p>
                  </div>
                ) : (
                  <div className="space-y-2 p-2">
                    {filteredVendors.map((vendor) => {
                      const eta = getVendorETA(vendor);
                      const status = getVendorStatus(vendor);
                      const isSelected = vendor._id === selectedVendorId;

                      return (
                        <motion.div
                          key={vendor._id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => onVendorSelect?.(vendor)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {vendor.shopName}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-600">
                                    {vendor.rating?.toFixed(1) || 'New'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-600 capitalize">
                                  {vendor.category}
                                </span>
                              </div>
                            </div>

                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                              {status.text}
                            </div>
                          </div>

                          {/* Current Stop */}
                          {vendor.schedule?.currentStop && (
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="w-3 h-3 text-blue-500" />
                              <span className="text-xs text-gray-600 truncate">
                                {vendor.schedule.currentStop}
                              </span>
                            </div>
                          )}

                          {/* Distance and ETA */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Navigation className="w-3 h-3" />
                              <span>
                                {vendor.distance ? formatDistance(vendor.distance) : 'Distance unknown'}
                              </span>
                            </div>

                            {eta !== null && (
                              <div className="flex items-center space-x-1">
                                <Timer className="w-3 h-3" />
                                <span>
                                  {eta === 0 ? 'Arrived' : `${eta}min`}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Speed indicator for moving vendors */}
                          {vendor.schedule?.isMoving && vendor.schedule?.speed > 0 && (
                            <div className="mt-2 flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-xs text-green-600">
                                Moving at {vendor.schedule.speed} km/h
                              </span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RoamingVendorMap;