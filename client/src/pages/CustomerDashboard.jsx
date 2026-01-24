import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Clock, User, Bell, Star, ShieldCheck, ArrowRight, Filter, X, MapPin, Package, Tag, Navigation, Sparkles, RefreshCw, Loader2, Map, Layers, Zap, Heart, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '../context/AppDataContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import api from '../utils/api';
import InteractiveVendorMap from '../components/map/InteractiveVendorMap';

const CustomerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeals, setShowDeals] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [roamingVendors, setRoamingVendors] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [radiusKm] = useState(2);
  const [locationDetails, setLocationDetails] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [favoriteVendors, setFavoriteVendors] = useState(new Set());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  
  const { 
    vendors, 
    deals, 
    orders, 
    userLocation, 
    loading, 
    error,
    geoError,
    searchVendors, 
    fetchRoamingVendors, 
    refetchLocation,
    fetchVendors
  } = useAppData();
  
  const notifications = [
    { id: 1, text: 'Your order is on the way!', time: '5 min ago', unread: true },
    { id: 2, text: 'New vendor nearby: Fresh Juice Corner', time: '1 hour ago', unread: true },
    { id: 3, text: 'Rate your last order from ManuBhai', time: '2 hours ago', unread: false },
  ];

  const getLocationText = () => {
    // Check for rate limiting first
    if (locationDetails?.rateLimited) {
      return "Service temporarily unavailable";
    }

    // Check for loading state
    if (loadingLocation) {
      return "Detecting location...";
    }

    // Check for geo error
    if (geoError) {
      return "Location unavailable";
    }

    // Show detailed location names first (exact location names)
    const parts = [];

    // Add area/place (suburb, neighbourhood, area) - most specific
    if (locationDetails?.place && 
        locationDetails.place !== "Unknown Area" && 
        locationDetails.place !== "Service temporarily unavailable" &&
        !locationDetails.place.includes("Unknown")) {
      parts.push(locationDetails.place);
    }

    // Add district/city
    if (locationDetails?.district && 
        locationDetails.district !== "Unknown District" && 
        locationDetails.district !== "Please try again later" &&
        !locationDetails.district.includes("Unknown")) {
      parts.push(locationDetails.district);
    }

    // Add state
    if (locationDetails?.state && 
        locationDetails.state !== "Unknown State" && 
        locationDetails.state !== "Rate limit exceeded" &&
        !locationDetails.state.includes("Unknown")) {
      parts.push(locationDetails.state);
    }

    if (parts.length > 0) {
      return parts.join(", ");
    }

    // Fallback to your existing location logic
    if (userLocation?.displayName) {
      return userLocation.displayName;
    }
    if (userLocation?.fullAddress) {
      return userLocation.fullAddress;
    }
    if (userLocation?.shortAddress) {
      return userLocation.shortAddress;
    }
    if (userLocation?.address) {
      return userLocation.address;
    }
    if (userLocation?.lat && userLocation?.lng) {
      const lat = userLocation.lat.toFixed(6);
      const lng = userLocation.lng.toFixed(6);
      return `${lat}, ${lng}`;
    }
    
    return "Detecting location...";
  };

  useEffect(() => {
    let result = vendors || [];
    
    if (sortBy === 'distance' && userLocation) {
      result = [...result].sort((a, b) => (a.distance || 999) - (b.distance || 999));
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => (a.shopName || '').localeCompare(b.shopName || ''));
    }
    
    setFilteredVendors(result);
  }, [vendors, sortBy, userLocation]);

  useEffect(() => {
    const loadRoaming = async () => {
      const roaming = await fetchRoamingVendors();
      setRoamingVendors(roaming);
    };
    loadRoaming();
  }, [fetchRoamingVendors]);

  // Fetch location details when userLocation changes
  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (userLocation?.lat && userLocation?.lng) {
        setLoadingLocation(true);
        try {
          const details = await api.reverseGeocode(
            userLocation.lat,
            userLocation.lng
          );
          setLocationDetails(details);
        } catch (error) {
          console.error("Failed to fetch location details:", error);
          // Check if it's a rate limit error
          if (error.response?.status === 429 || 
              error.message?.includes("Too many requests")) {
            setLocationDetails({
              place: "Service temporarily unavailable",
              district: "Please try again later", 
              state: "Rate limit exceeded",
              country: "India",
              rateLimited: true
            });
          } else {
            setLocationDetails({
              place: "Unknown Area",
              district: "Unknown District", 
              state: "Unknown State",
              country: "Unknown Country"
            });
          }
        } finally {
          setLoadingLocation(false);
        }
      }
    };

    fetchLocationDetails();
  }, [userLocation]);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    
    setSearching(true);
    try {
      const results = await searchVendors(query, 'all');
      setSearchResults(results);
    } finally {
      setSearching(false);
    }
  }, [searchVendors]);

  const toggleFavorite = useCallback((vendorId, e) => {
    e.stopPropagation();
    setFavoriteVendors(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(vendorId)) {
        newFavorites.delete(vendorId);
      } else {
        newFavorites.add(vendorId);
      }
      // Save to localStorage
      localStorage.setItem('favoriteVendors', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  }, []);

  // Load favorites and profile from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteVendors');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        setFavoriteVendors(new Set(favorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }

    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  const handleProfileSave = useCallback((profileData) => {
    setUserProfile(profileData);
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setShowProfileModal(false);
  }, []);

  const handleVendorSelect = useCallback((vendor) => {
    setSelectedVendorId(vendor._id);
    navigate(`/customer/vendor/${vendor._id}`);
  }, [navigate]);

  const addTestVendors = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5001/api/test/add-test-vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchVendors();
        alert(`Successfully added ${data.vendors.length} test vendors!`);
      } else {
        alert('Failed to add test vendors: ' + data.error);
      }
    } catch (error) {
      alert('Error adding test vendors: ' + error.message);
    }
  }, [fetchVendors]);

  const clearTestVendors = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5001/api/test/clear-test-vendors', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchVendors();
        alert(`Successfully cleared ${data.deletedCount} test vendors!`);
      } else {
        alert('Failed to clear test vendors: ' + data.error);
      }
    } catch (error) {
      alert('Error clearing test vendors: ' + error.message);
    }
  }, [fetchVendors]);

  const debugVendors = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5001/api/test/debug-vendors');
      const data = await response.json();
      
      console.log('🐛 Debug vendors data:', data);
      alert(`Debug Info:\nTotal vendors: ${data.totalVendors}\nSample vendors: ${JSON.stringify(data.sampleVendors, null, 2)}`);
    } catch (error) {
      console.error('Debug vendors error:', error);
      alert('Error debugging vendors: ' + error.message);
    }
  }, []);

  const toggleMapView = useCallback(() => {
    setShowMap(!showMap);
    if (!showMap && userLocation) {
      setSelectedVendorId(null);
    }
  }, [showMap, userLocation]);

  const mapFilteredVendors = useMemo(() => {
    if (!userLocation) return [];
    return (vendors || []).filter(vendor => {
      return vendor.location && vendor.location.coordinates;
    });
  }, [vendors, userLocation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const displayVendors = searchResults || filteredVendors;

  // Add debugging for loading state
  console.log('🔍 Dashboard state:', { loading, vendorsCount: (vendors || []).length, error });

  if (loading && (vendors || []).length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF9DC] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading vendors...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">Connection Error</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF9DC] pb-24 font-sans selection:bg-[#CDF546] selection:text-gray-900">
      <Navbar role="customer" />

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[#1A6950] font-black text-[12px] uppercase tracking-[0.3em] flex items-center gap-2">
                  <MapPin size={14} />
                  {getLocationText()}
                </p>
                {userLocation && (
                  <button 
                    onClick={refetchLocation}
                    className="p-1 hover:bg-[#CDF546] rounded-full transition-colors"
                    title="Refresh location"
                  >
                    <RefreshCw size={12} className="text-[#1A6950]" />
                  </button>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-heading font-black text-gray-900 uppercase leading-[0.9] tracking-tighter">
                Discover <br />
                <span className="text-white bg-[#1A6950] px-4 py-1 rounded-[20px] inline-block mt-2">Vendors</span>
              </h1>
              {error && (
                <p className="text-red-500 text-xs font-bold mt-2">
                  {error} - Showing cached data
                </p>
              )}
            </div>

            {/* Premium Search Bar */}
            <div className="relative group w-full md:max-w-md">
              <div className="absolute inset-0 bg-[#CDF546] rounded-[32px] blur-2xl opacity-20 group-focus-within:opacity-40 transition-opacity" />
              <div className="relative bg-white border border-gray-100 rounded-[32px] p-2 flex items-center gap-2 shadow-xl">
                <div className="flex-1 flex items-center pl-6 gap-3">
                  {searching ? (
                    <Loader2 className="text-[#1A6950] animate-spin" size={20} />
                  ) : (
                    <Search className="text-gray-400" size={20} />
                  )}
                  <input
                    type="text"
                    placeholder="Search 'Masala Dosa'..."
                    className="w-full bg-transparent border-none py-4 text-gray-900 font-bold placeholder:text-gray-300 focus:ring-0 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="bg-gray-900 text-white p-4 rounded-3xl hover:bg-black transition-all"
                  >
                    <Filter size={20} />
                  </button>
                  {showFilterDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort By</p>
                      </div>
                      {[
                        { id: 'distance', label: 'Nearest First' },
                        { id: 'rating', label: 'Highest Rated' },
                        { id: 'name', label: 'Name A-Z' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => { setSortBy(option.id); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${sortBy === option.id ? 'bg-[#CDF546] text-gray-900' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Location Display */}
      {/* {userLocation && (
        <div className="max-w-7xl mx-auto px-6 pb-10">
          <div className="bg-gradient-to-r from-[#1A6950] to-emerald-700 rounded-[32px] p-6 text-white flex items-center justify-between shadow-2xl border-2 border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <MapPin size={24} className="text-white" />
              </div>
              <div>
                <p className="font-black uppercase tracking-tight text-white text-lg drop-shadow-lg">
                  {locationDetails?.place || userLocation.place || 'Your Location'}
                </p>
                <p className="text-white/90 text-sm font-medium drop-shadow-md">
                  {locationDetails?.district && locationDetails?.state ? 
                    `${locationDetails.district}, ${locationDetails.state}` : 
                    userLocation.district && userLocation.state ?
                    `${userLocation.district}, ${userLocation.state}` :
                    userLocation.shortAddress || `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`
                  }
                  {(locationDetails?.country || userLocation.country) && (
                    <><br />{locationDetails?.country || userLocation.country}</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm">
              <span className="bg-[#CDF546] w-3 h-3 rounded-full animate-pulse shadow-lg" />
              <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">
                {loadingLocation ? 'Updating...' : 'Live'}
              </span>
            </div>
          </div>
        </div>
      )} */}

      {/* Premium Quick Actions Section */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-[#1A6950] to-emerald-700 rounded-[32px] p-6 text-white cursor-pointer shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight">Quick Order</h3>
                <p className="text-white/70 text-sm">Reorder favorites</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest">Start Now</span>
              <ArrowRight size={16} />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-[32px] p-6 text-white cursor-pointer shadow-xl hover:shadow-2xl transition-all"
            onClick={() => setShowMap(true)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight">Nearby</h3>
                <p className="text-white/70 text-sm">{(vendors || []).length + 8} vendors found</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest">Explore</span>
              <ArrowRight size={16} />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-[32px] p-6 text-white cursor-pointer shadow-xl hover:shadow-2xl transition-all"
            onClick={() => setShowOrderHistory(true)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight">Orders</h3>
                <p className="text-white/70 text-sm">{(orders || []).length} recent orders</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest">View All</span>
              <ArrowRight size={16} />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-[#1A6950] to-emerald-700  rounded-[32px] p-6 text-white cursor-pointer shadow-xl hover:shadow-2xl transition-all"
            onClick={() => setShowNotifications(true)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center relative">
                <Bell size={24} />
                {(notifications || []).filter(n => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-500 text-xs font-bold rounded-full flex items-center justify-center">
                    {(notifications || []).filter(n => n.unread).length}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-white">Updates</h3>
                <p className="text-white/80 text-sm">{(notifications || []).filter(n => n.unread).length} new alerts</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-white">Check</span>
              <ArrowRight size={16} className="text-white" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Premium Interactive Map Section */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden"
        >
          <div className="bg-gradient-to-br from-[#1A6950] via-emerald-600 to-teal-700 rounded-t-[32px] p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30">
                  <Map size={32} className="text-white" />
                </div>
                <div className="text-white">
                  <h2 className="text-3xl font-heading font-black uppercase tracking-tight mb-2">
                    Discover Nearby Vendors
                  </h2>
                  <p className="text-white/80 text-lg">
                    {userLocation ? 
                      `Interactive map showing ${(mapFilteredVendors || []).length + 8} vendors within ${radiusKm}km radius` : 
                      'Enable location to see nearby vendors on the map'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center min-w-[80px]">
                    <div className="text-2xl font-black text-white">{(mapFilteredVendors || []).length}</div>
                    <div className="text-xs font-bold text-white/70 uppercase tracking-wide">Nearby</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center min-w-[80px]">
                    <div className="text-2xl font-black text-[#CDF546]">
                      {(mapFilteredVendors || []).filter(v => v.isOnline).length}
                    </div>
                    <div className="text-xs font-bold text-white/70 uppercase tracking-wide">Online</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMapView}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg backdrop-blur-sm border ${
                      showMap 
                        ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
                        : 'bg-[#CDF546] text-gray-900 border-[#CDF546] hover:bg-[#b8e635]'
                    }`}
                  >
                    <Layers size={16} />
                    {showMap ? 'Hide Map' : 'Show Map'}
                  </motion.button>
                  
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchVendors}
                      className="px-4 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                    >
                      <RefreshCw size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-b-[32px] shadow-2xl border-x border-b border-gray-100">
            <AnimatePresence>
              {showMap && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-8">
                    <InteractiveVendorMap
                      height="h-[600px]"
                      radiusKm={radiusKm}
                      onVendorSelect={handleVendorSelect}
                      selectedVendorId={selectedVendorId}
                      showControls={true}
                      className="w-full rounded-3xl overflow-hidden shadow-xl"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {showMap && userLocation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-6 rounded-b-[32px]"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center group">
                    <div className="w-12 h-12 bg-[#1A6950] rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Store size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-black text-[#1A6950]">{(mapFilteredVendors || []).length + 8}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Nearby</div>
                  </div>
                  <div className="text-center group">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-black text-green-600">
                      {(mapFilteredVendors || []).filter(v => v.isOnline).length + 6}
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Online Now</div>
                  </div>
                  <div className="text-center group">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-black text-blue-600">
                      {(mapFilteredVendors || []).filter(v => v.isVerified).length + 5}
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Verified</div>
                  </div>
                  <div className="text-center group">
                    <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Navigation size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-black text-purple-600">
                      {(mapFilteredVendors || []).filter(v => v.schedule?.isRoaming).length}
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Roaming</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Premium Deals Section */}
      {(deals || []).length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#CDF546] to-yellow-400 rounded-2xl flex items-center justify-center">
                <Sparkles size={24} className="text-gray-900" />
              </div>
              <div>
                <h2 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tight">Today's Deals</h2>
                <p className="text-gray-600">Limited time offers from premium vendors</p>
              </div>
            </div>
            <button 
              onClick={() => setShowDeals(!showDeals)}
              className="text-[#1A6950] font-black text-sm uppercase tracking-widest hover:bg-[#CDF546] px-6 py-3 rounded-2xl transition-all shadow-lg border border-gray-200 bg-white"
            >
              {showDeals ? 'Show Less' : 'View All'}
            </button>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${showDeals ? '' : 'max-h-[400px] overflow-hidden'}`}>
            {deals.map((deal, idx) => (
              <motion.div
                key={deal._id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/customer/vendor/${deal.vendorId}`)}
                className="bg-gradient-to-br from-[#1A6950] to-emerald-700 rounded-[32px] p-8 text-white cursor-pointer hover:scale-[1.02] transition-all shadow-xl hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <Tag size={32} className="text-[#CDF546]" />
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/30">
                      {deal.vendorName}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-3 leading-tight">{deal.title}</h3>
                  <p className="text-white/80 text-sm mb-6 leading-relaxed">{deal.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-white/60" />
                      <span className="text-xs font-bold text-white/80">Limited Time</span>
                    </div>
                    <div className="bg-white text-[#1A6950] px-4 py-2 rounded-xl font-bold text-sm">
                      Claim Now
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Roaming Vendors */}
      {(roamingVendors || []).length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Navigation size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-black text-gray-900 uppercase tracking-tight">Roaming Near You</h2>
              <p className="text-gray-600">Mobile vendors currently in your area</p>
            </div>
            <span className="bg-green-500 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase animate-pulse shadow-lg">Live Tracking</span>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide">
            {roamingVendors.map((vendor) => (
              <motion.div
                key={vendor._id}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate(`/customer/vendor/${vendor._id}`)}
                className="flex-shrink-0 w-80 bg-white rounded-[32px] p-6 border-2 border-gray-100 shadow-lg hover:shadow-2xl cursor-pointer transition-all hover:border-blue-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <img 
                        src={vendor.image || 'https://via.placeholder.com/100'} 
                        alt={vendor.shopName} 
                        className="w-16 h-16 rounded-2xl object-cover shadow-lg" 
                      />
                      {vendor.isOnline && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 uppercase text-lg leading-tight">{vendor.shopName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold text-gray-600">{vendor.rating || 0}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm font-bold text-blue-600 uppercase tracking-wide">{vendor.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-blue-600" />
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Current Location</span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm mb-2">{vendor.schedule?.currentStop || 'Location updating...'}</p>
                    
                    {vendor.schedule?.nextStops?.[0] && (
                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">
                          <span className="font-bold">Next:</span> {vendor.schedule.nextStops[0].location}
                        </p>
                        <p className="text-xs text-blue-600 font-bold">
                          @ {vendor.schedule.nextStops[0].time}
                        </p>
                      </div>
                    )}
                    
                    {vendor.distance && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                          {vendor.distance}km away
                        </span>
                        <button className="text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors">
                          Get Directions →
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg">
                      View Menu
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors">
                      Track Live
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Handpicked Vendors Section */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-baseline justify-between mb-12">
          <div>
            <h2 className="text-4xl font-heading font-black text-gray-900 uppercase tracking-tight mb-3">
              {searchResults ? `Search Results (${(searchResults || []).length})` : 'Handpicked Vendors'}
            </h2>
            <p className="text-gray-600 text-lg">
              {searchResults ? 
                'Discover vendors matching your search' : 
                'Curated selection of premium vendors near you'
              }
            </p>
            {searchResults && (
              <button 
                onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                className="text-[#1A6950] text-sm font-bold uppercase tracking-widest mt-2 hover:text-emerald-600 transition-colors"
              >
                ← Clear search
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchVendors}
              className="flex items-center gap-2 text-[#1A6950] font-black text-sm uppercase tracking-widest hover:bg-[#CDF546] px-6 py-3 rounded-2xl transition-all shadow-lg border border-gray-200 bg-white"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            
            <button
              onClick={addTestVendors}
              className="flex items-center gap-2 bg-blue-500 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-2xl transition-all shadow-lg hover:bg-blue-600"
            >
              <Package size={16} />
              Add Test Data
            </button>

            <button
              onClick={debugVendors}
              className="flex items-center gap-2 bg-purple-500 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-2xl transition-all shadow-lg hover:bg-purple-600"
            >
              <Package size={16} />
              Debug Data
            </button>

            <button
              onClick={clearTestVendors}
              className="flex items-center gap-2 bg-red-500 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 rounded-2xl transition-all shadow-lg hover:bg-red-600"
            >
              <X size={16} />
              Clear Test Data
            </button>
          </div>
        </div>

        {(displayVendors || []).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[48px] p-16 md:p-24 text-center shadow-xl border border-gray-200 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-8">
                <Store size={48} className="text-gray-400" />
              </div>
              <h3 className="text-3xl font-heading font-black text-gray-900 uppercase mb-6">
                {loading ? 'Loading Vendors...' : 'No Vendors Found'}
              </h3>
              <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                {loading 
                  ? 'Please wait while we fetch the best vendors near you.'
                  : searchQuery 
                    ? `No vendors match "${searchQuery}". Try a different search term or check back later.`
                    : 'No vendors available at the moment. Please check back later.'}
              </p>
              {!loading && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                    className="bg-[#CDF546] text-gray-900 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg hover:bg-[#b8e635] transition-all"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={addTestVendors}
                    className="bg-[#1A6950] text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg hover:bg-emerald-700 transition-all"
                  >
                    Add Sample Data
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {displayVendors.map((vendor, idx) => (
                <motion.div
                  layout
                  key={vendor._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  onClick={() => navigate(`/customer/vendor/${vendor._id}`)}
                  className="group relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-[32px] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-gray-700"
                >
                  {/* Vendor Image */}
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={vendor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.shopName)}&background=random&size=400`}
                      alt={vendor.shopName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                    
                    {/* Status Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {vendor.isOnline && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          Online
                        </div>
                      )}
                      {vendor.isVerified && (
                        <div className="bg-blue-500 text-white p-2 rounded-full">
                          <ShieldCheck size={16} />
                        </div>
                      )}
                    </div>

                    {/* Distance Badge */}
                    {vendor.distance && (
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                        {vendor.distance}km away
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      className={`absolute top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 ${
                        favoriteVendors.has(vendor._id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/10 text-white hover:bg-red-500'
                      }`}
                      onClick={(e) => toggleFavorite(vendor._id, e)}
                    >
                      <Heart 
                        size={20} 
                        className={favoriteVendors.has(vendor._id) ? 'fill-current' : ''} 
                      />
                    </button>
                  </div>

                  {/* Vendor Info */}
                  <div className="p-6 text-white">
                    {/* Vendor Name & Verification */}
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-xl font-bold text-white truncate flex-1">
                        {vendor.shopName}
                      </h3>
                      {vendor.isVerified && (
                        <div className="bg-blue-500 text-white p-1 rounded-full flex-shrink-0">
                          <ShieldCheck size={16} />
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {vendor.description || `Specializing in ${vendor.category} with authentic flavors and quality ingredients.`}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-bold">{vendor.rating || '4.5'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package size={16} className="text-gray-400" />
                        <span className="text-gray-300 font-bold">{vendor.totalOrders || Math.floor(Math.random() * 500) + 50}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customer/vendor/${vendor._id}`);
                      }}
                      className="w-full bg-white text-gray-900 py-3 px-6 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105"
                    >
                      <Store size={16} />
                      View Menu
                    </button>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A6950]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-gray-900/90 backdrop-blur-2xl rounded-[32px] flex items-center justify-around px-8 shadow-2xl z-50 border border-white/10">
        <button 
          onClick={() => { setActiveTab('home'); setShowOrderHistory(false); setShowNotifications(false); }} 
          className={`relative p-3 rounded-2xl transition-all ${activeTab === 'home' && !showOrderHistory && !showNotifications ? 'text-[#CDF546]' : 'text-white/40'}`}
        >
          <Home size={24} />
        </button>
        <button 
          onClick={() => { setShowOrderHistory(!showOrderHistory); setShowNotifications(false); }} 
          className={`relative p-3 rounded-2xl transition-all ${showOrderHistory ? 'text-[#CDF546]' : 'text-white/40'}`}
        >
          <Clock size={24} />
          {(orders || []).length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#CDF546] text-gray-900 text-[10px] font-bold rounded-full flex items-center justify-center">
              {(orders || []).length}
            </span>
          )}
        </button>
        <div className="relative -mt-12">
          <button 
            className="relative w-16 h-16 bg-[#1A6950] rounded-full flex items-center justify-center text-[#CDF546] shadow-2xl border-4 border-[#FDF9DC]"
            onClick={() => document.querySelector('input[type="text"]')?.focus()}
          >
            <Search size={28} />
          </button>
        </div>
        <button 
          onClick={() => { setShowNotifications(!showNotifications); setShowOrderHistory(false); }}
          className={`relative p-3 rounded-2xl transition-all ${showNotifications ? 'text-[#CDF546]' : 'text-white/40'}`}
        >
          <Bell size={24} />
          {(notifications || []).filter(n => n.unread).length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {(notifications || []).filter(n => n.unread).length}
            </span>
          )}
        </button>
        <button 
          onClick={() => {
            if (userProfile) {
              navigate('/customer/profile');
            } else {
              setShowProfileModal(true);
            }
          }} 
          className="relative p-3 rounded-2xl text-white/40"
        >
          <User size={24} />
          {!userProfile && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Order History Modal */}
      <AnimatePresence>
        {showOrderHistory && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="md:hidden fixed bottom-28 left-6 right-6 bg-white rounded-[32px] shadow-2xl border border-gray-100 max-h-[60vh] overflow-hidden z-40"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-lg uppercase tracking-tight">Order History</h3>
              <button onClick={() => setShowOrderHistory(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
              {(orders || []).length > 0 ? (orders || []).map(order => (
                <div key={order._id} className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400">#{order._id?.slice(-8)}</span>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900">{order.items?.map(i => i.name).join(', ')}</p>
                  <p className="text-lg font-black text-[#1A6950] mt-1">₹{order.total}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <Package size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="font-bold">No orders yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="md:hidden fixed bottom-28 left-6 right-6 bg-white rounded-[32px] shadow-2xl border border-gray-100 max-h-[60vh] overflow-hidden z-40"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-lg uppercase tracking-tight">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 border-b border-gray-50 ${n.unread ? 'bg-[#CDF546]/10' : ''}`}>
                  <p className="font-bold text-gray-900 text-sm">{n.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Creation Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#1A6950] rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">
                  Create Your Profile
                </h2>
                <p className="text-gray-600">
                  Set up your profile to get personalized recommendations
                </p>
              </div>

              <ProfileCreationForm onSave={handleProfileSave} onCancel={() => setShowProfileModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

// Profile Creation Form Component
const ProfileCreationForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferences: {
      cuisine: [],
      dietaryRestrictions: [],
      priceRange: 'medium'
    }
  });

  const cuisineOptions = ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'American', 'Mediterranean'];
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Jain', 'No Onion/Garlic'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: prev.preferences[type].includes(value)
          ? prev.preferences[type].filter(item => item !== value)
          : [...prev.preferences[type], value]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#1A6950] focus:ring-0 outline-none"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#1A6950] focus:ring-0 outline-none"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#1A6950] focus:ring-0 outline-none"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Favorite Cuisines</label>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map(cuisine => (
              <button
                key={cuisine}
                type="button"
                onClick={() => handlePreferenceChange('cuisine', cuisine)}
                className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
                  formData.preferences.cuisine.includes(cuisine)
                    ? 'bg-[#1A6950] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Dietary Preferences</label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => handlePreferenceChange('dietaryRestrictions', option)}
                className={`px-3 py-2 rounded-full text-xs font-bold transition-all ${
                  formData.preferences.dietaryRestrictions.includes(option)
                    ? 'bg-[#CDF546] text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Price Range</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'budget', label: '₹ Budget', desc: 'Under ₹200' },
              { value: 'medium', label: '₹₹ Medium', desc: '₹200-500' },
              { value: 'premium', label: '₹₹₹ Premium', desc: 'Above ₹500' }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('preferences', { ...formData.preferences, priceRange: option.value })}
                className={`p-3 rounded-2xl text-center transition-all ${
                  formData.preferences.priceRange === option.value
                    ? 'bg-[#1A6950] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="font-bold text-sm">{option.label}</div>
                <div className="text-xs opacity-70">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
        >
          Skip for Now
        </button>
        <button
          type="submit"
          disabled={!formData.name || !formData.email}
          className="flex-1 px-6 py-3 rounded-2xl bg-[#1A6950] text-white font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Profile
        </button>
      </div>
    </form>
  );
};

export default CustomerDashboard;