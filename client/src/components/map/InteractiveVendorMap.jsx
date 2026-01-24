import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  RefreshCw,
  AlertCircle,
  Maximize2,
  Minimize2,
  Users,
  Filter
} from 'lucide-react';
import { filterVendorsWithinRadius, formatDistance } from '../../utils/geoUtils';
import { useAppData } from '../../context/AppDataContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ThemedVendorMap from './ThemedVendorMap';
import SafeVendorMap from './SafeVendorMap';

/**
 * Interactive vendor map component with enhanced UI
 */
const InteractiveVendorMap = ({ 
  className = '',
  height = 'h-96',
  radiusKm = 2,
  onVendorSelect,
  selectedVendorId,
  showControls = true
}) => {
  const { 
    vendors, 
    userLocation, 
    loading, 
    geoError,
    refetchLocation
  } = useAppData();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVendorList, setShowVendorList] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [mapError, setMapError] = useState(false);
  const [useSafeMode, setUseSafeMode] = useState(false);

  // Filter vendors within radius and by category
  const filteredVendors = useMemo(() => {
    if (!userLocation) return [];
    let filtered = filterVendorsWithinRadius(vendors, userLocation, radiusKm);
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(vendor => vendor.category === filterCategory);
    }
    
    return filtered;
  }, [vendors, userLocation, radiusKm, filterCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(vendors.map(v => v.category).filter(Boolean))];
    return ['all', ...cats];
  }, [vendors]);

  // Handle vendor selection
  const handleVendorClick = useCallback((vendor) => {
    onVendorSelect?.(vendor);
  }, [onVendorSelect]);

  // Handle map error
  const handleMapError = useCallback(() => {
    console.log('🔄 Switching to safe mode due to map error');
    setUseSafeMode(true);
    setMapError(true);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    setUseSafeMode(false);
    setMapError(false);
    refetchLocation();
  }, [refetchLocation]);

  // Loading state
  if (loading) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl flex items-center justify-center border border-green-100`}>
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-green-700 font-bold mt-4">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (geoError && !userLocation) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-red-100`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Location Required</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Enable location access to discover nearby vendors on the interactive map.
        </p>
        <button
          onClick={handleRetry}
          className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Enable Location
        </button>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : `${className} ${height}`} rounded-3xl overflow-hidden shadow-xl border border-gray-200`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Interactive Map</h3>
              <p className="text-white/80 text-sm">{filteredVendors.length + 8} vendors within {radiusKm}km</p>
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white/20 text-white rounded-xl px-3 py-2 text-sm font-medium appearance-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="text-gray-900">
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <Filter size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setUseSafeMode(!useSafeMode)}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-colors"
                title={useSafeMode ? 'Switch to interactive map' : 'Switch to safe mode'}
              >
                <MapPin size={18} />
              </button>
              
              <button
                onClick={() => setShowVendorList(!showVendorList)}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-colors"
                title="Toggle vendor list"
              >
                <Users size={18} />
              </button>
              
              <button
                onClick={refetchLocation}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-colors"
                title="Refresh location"
              >
                <RefreshCw size={18} />
              </button>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`flex ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-full'}`}>
        {/* Map Container */}
        <div className={`${showVendorList ? 'flex-1' : 'w-full'} relative`}>
          {useSafeMode ? (
            <SafeVendorMap
              vendors={filteredVendors}
              userLocation={userLocation}
              onVendorSelect={handleVendorClick}
              selectedVendorId={selectedVendorId}
              radiusKm={radiusKm}
              height="h-full"
              className="w-full"
            />
          ) : (
            <ThemedVendorMap
              vendors={filteredVendors}
              userLocation={userLocation}
              onVendorSelect={handleVendorClick}
              selectedVendorId={selectedVendorId}
              radiusKm={radiusKm}
              height="h-full"
              className="w-full"
              onError={handleMapError}
            />
          )}
          
          {/* Map Status Overlay */}
          <div className="absolute top-4 left-4 z-[1000]">
            <div className="bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-bold text-gray-700">
                {userLocation ? 'Location Active' : 'No Location'}
              </span>
              {useSafeMode && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-bold text-blue-600">Safe Mode</span>
                </>
              )}
              {mapError && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-bold text-orange-600">Fallback Active</span>
                </>
              )}
            </div>
          </div>

          {/* Category Filter Overlay */}
          {filterCategory !== 'all' && (
            <div className="absolute top-4 right-4 z-[1000]">
              <div className="bg-blue-500 text-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2">
                <Filter size={14} />
                <span className="text-xs font-bold">
                  {filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)}
                </span>
                <button
                  onClick={() => setFilterCategory('all')}
                  className="ml-2 text-white/80 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vendor List Sidebar */}
        <AnimatePresence>
          {showVendorList && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 border-l border-gray-200 overflow-hidden"
            >
              <div className="p-4 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">Nearby Vendors</h4>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                    {filteredVendors.length + 8}
                  </span>
                </div>

                {filteredVendors.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="font-bold text-gray-900 mb-2">Loading Vendors...</h3>
                    <p className="text-gray-600 text-sm">
                      {filterCategory === 'all' 
                        ? `Finding vendors within ${radiusKm}km of your location...`
                        : `Searching for ${filterCategory} vendors within ${radiusKm}km...`
                      }
                    </p>
                    <div className="mt-4 text-green-600 text-sm font-bold">
                      📍 Static demo vendors will appear on the map
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredVendors.map((vendor) => (
                      <motion.div
                        key={vendor._id}
                        whileHover={{ y: -2 }}
                        onClick={() => handleVendorClick(vendor)}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                          selectedVendorId === vendor._id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={vendor.image || 'https://via.placeholder.com/48'}
                            alt={vendor.shopName}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm truncate">
                              {vendor.shopName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-bold text-gray-600">
                                  {vendor.rating || 0}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs font-bold text-green-600">
                                {formatDistance(vendor.distance)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2">
                              {vendor.category && (
                                <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                                  {vendor.category}
                                </div>
                              )}
                              {vendor.isOnline && (
                                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                  Online
                                </div>
                              )}
                              {vendor.isVerified && (
                                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                  ✓ Verified
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
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

export default InteractiveVendorMap;