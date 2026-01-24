import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Filter,
  Truck,
  Star,
  Clock,
  Navigation,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import RoamingVendorMap from '../../components/map/RoamingVendorMap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Navbar from '../../components/common/Navbar';
import { formatDistance } from '../../utils/geoUtils';
import { toast } from 'react-toastify';

// Helper functions
const getVendorStatus = (vendor) => {
  if (vendor.schedule?.isMoving) {
    return { 
      text: 'Moving', 
      color: 'text-[#1A6950]', 
      bg: 'bg-[#CDF546]',
      icon: <Navigation className="w-3 h-3" />
    };
  }
  
  if (vendor.schedule?.currentStop) {
    return { 
      text: 'At Stop', 
      color: 'text-[#1A6950]', 
      bg: 'bg-green-100',
      icon: <MapPin className="w-3 h-3" />
    };
  }
  
  return { 
    text: 'Online', 
    color: 'text-gray-600', 
    bg: 'bg-gray-100',
    icon: <Clock className="w-3 h-3" />
  };
};

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

const RoamingVendorsPage = () => {
  const navigate = useNavigate();
  const { userLocation, loading: appLoading } = useAppData();
  
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [radiusKm, setRadiusKm] = useState(5);

  // Handle vendor selection
  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
  };

  // Navigate to vendor details
  const handleViewVendor = (vendor) => {
    navigate(`/customer/vendor/${vendor._id}`);
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 px-4">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-[#1A6950] to-emerald-700 rounded-[32px] flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">
              Location Required
            </h2>
            <p className="text-gray-600 font-medium mb-8">
              We need your location to show nearby roaming vendors and their routes.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1A6950] text-white px-8 py-4 rounded-[24px] font-black uppercase tracking-widest hover:bg-[#145240] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Enable Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-2 flex items-center space-x-3">
                  <Truck className="w-8 h-8 text-[#1A6950]" />
                  <span>Roaming Vendors</span>
                </h1>
                <p className="text-gray-600 font-medium">
                  Mobile food vendors moving around your area
                </p>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              {/* Radius Selector */}
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="px-4 py-3 text-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1A6950] focus:border-transparent bg-white font-medium"
              >
                <option value={2}>2 km radius</option>
                <option value={5}>5 km radius</option>
                <option value={10}>10 km radius</option>
                <option value={20}>20 km radius</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 text-sm rounded-xl font-bold uppercase tracking-widest transition-all ${
                    viewMode === 'map'
                      ? 'bg-[#1A6950] text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm rounded-xl font-bold uppercase tracking-widest transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#1A6950] text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {viewMode === 'map' ? (
            <div className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100 overflow-hidden">
              <RoamingVendorMap
                height="h-[600px]"
                radiusKm={radiusKm}
                onVendorSelect={handleVendorSelect}
                selectedVendorId={selectedVendor?._id}
                showControls={true}
                className="w-full"
              />
            </div>
          ) : (
            <RoamingVendorList
              radiusKm={radiusKm}
              userLocation={userLocation}
              onVendorSelect={handleVendorSelect}
              onViewVendor={handleViewVendor}
            />
          )}

          {/* Selected Vendor Details */}
          {selectedVendor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] shadow-2xl border border-gray-700 p-8 text-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-6">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                      {selectedVendor.shopName}
                    </h3>
                    
                    {(() => {
                      const status = getVendorStatus(selectedVendor);
                      return (
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest ${status.bg} ${status.color}`}>
                          {status.icon}
                          <span>{status.text}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Current Location */}
                    {selectedVendor.schedule?.currentStop && (
                      <div className="flex items-center space-x-3 text-white/80">
                        <div className="w-10 h-10 bg-[#1A6950] rounded-2xl flex items-center justify-center">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Current Stop</div>
                          <div className="font-bold">{selectedVendor.schedule.currentStop}</div>
                        </div>
                      </div>
                    )}

                    {/* Distance */}
                    {selectedVendor.distance && (
                      <div className="flex items-center space-x-3 text-white/80">
                        <div className="w-10 h-10 bg-[#CDF546] rounded-2xl flex items-center justify-center">
                          <Navigation className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Distance</div>
                          <div className="font-bold">{formatDistance(selectedVendor.distance)} away</div>
                        </div>
                      </div>
                    )}

                    {/* ETA */}
                    {(() => {
                      const eta = getVendorETA(selectedVendor);
                      return eta !== null ? (
                        <div className="flex items-center space-x-3 text-white/80">
                          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white/60 uppercase tracking-widest">ETA</div>
                            <div className="font-bold">{eta === 0 ? 'Arrived' : `${eta} minutes`}</div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-[#CDF546] fill-current" />
                      <span className="text-xl font-black text-white">
                        {selectedVendor.rating?.toFixed(1) || 'New'}
                      </span>
                    </div>
                    <span className="text-white/60">
                      ({selectedVendor.totalReviews || 0} reviews)
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/80 capitalize font-bold">
                      {selectedVendor.category}
                    </span>
                  </div>

                  {/* Route Info */}
                  {selectedVendor.schedule?.routeName && (
                    <div className="bg-white/10 rounded-2xl p-4 mb-6">
                      <div className="text-sm font-bold text-[#CDF546] uppercase tracking-widest mb-1">Current Route</div>
                      <div className="text-white font-bold">{selectedVendor.schedule.routeName}</div>
                    </div>
                  )}

                  {/* Next Stops */}
                  {selectedVendor.schedule?.nextStops?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-black text-[#CDF546] uppercase tracking-widest mb-4">Upcoming Stops</h4>
                      <div className="space-y-3">
                        {selectedVendor.schedule.nextStops
                          .filter(stop => !stop.isCompleted)
                          .slice(0, 3)
                          .map((stop, index) => (
                            <div key={index} className="flex items-center space-x-3 text-white/80">
                              <div className="w-2 h-2 bg-[#CDF546] rounded-full" />
                              <span className="font-medium">{stop.location}</span>
                              <span className="text-white/40">•</span>
                              <span className="text-sm">{stop.time}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleViewVendor(selectedVendor)}
                  className="bg-[#CDF546] text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#b8e635] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  View Menu
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

import apiClient from '../../utils/api';

// Roaming Vendor List Component
const RoamingVendorList = ({ radiusKm, userLocation, onVendorSelect, onViewVendor }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: radiusKm * 1000 // Convert km to meters
        };

        const response = await apiClient.getRoamingVendors(params);
        setVendors(response.vendors || []);
      } catch (err) {
        console.error('Fetch vendors error:', err);
        setError('Failed to load roaming vendors');
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchVendors();
    }
  }, [userLocation, radiusKm]);

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100 p-12">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100 p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-[24px] flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Error Loading</h3>
          <p className="text-gray-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100 p-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1A6950] to-emerald-700 rounded-[32px] flex items-center justify-center mx-auto mb-8">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">No Roaming Vendors</h3>
          <p className="text-gray-600 font-medium">No mobile vendors found in your area. Try expanding your search radius.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100">
      <div className="p-8 border-b border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          {vendors.length} Roaming Vendors Found
        </h2>
        <p className="text-gray-600 font-medium mt-2">Mobile vendors currently active in your area</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {vendors.map((vendor) => {
          const status = getVendorStatus(vendor);
          const eta = getVendorETA(vendor);

          return (
            <div
              key={vendor._id}
              className="p-8 hover:bg-gray-50 cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() => onVendorSelect(vendor)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                      {vendor.shopName}
                    </h3>
                    
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${status.bg} ${status.color}`}>
                      {status.icon}
                      <span>{status.text}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-gray-600 mb-4">
                    {vendor.schedule?.currentStop && (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#1A6950] rounded-xl flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{vendor.schedule.currentStop}</span>
                      </div>
                    )}
                    
                    {vendor.distance && (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#CDF546] rounded-xl flex items-center justify-center">
                          <Navigation className="w-4 h-4 text-gray-900" />
                        </div>
                        <span className="font-medium">{formatDistance(vendor.distance)} away</span>
                      </div>
                    )}

                    {eta !== null && (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{eta === 0 ? 'Arrived' : `${eta} min`}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-[#CDF546] fill-current" />
                      <span className="text-lg font-black text-gray-900">
                        {vendor.rating?.toFixed(1) || 'New'}
                      </span>
                    </div>
                    <span className="text-gray-500 font-medium">
                      ({vendor.totalReviews || 0} reviews)
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 capitalize font-bold">
                      {vendor.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewVendor(vendor);
                  }}
                  className="bg-[#1A6950] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-[#145240] transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  View Menu
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoamingVendorsPage;