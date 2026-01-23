import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, TrendingUp, Star, Plus, MapPin, MessageCircle, Camera, Settings, Bell, DollarSign, Trash2, AlertTriangle, Loader, Upload, X, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import VendorVoiceAssistant from '../components/vendor/VendorVoiceAssistant';
import AIProductListing from '../components/vendor/AIProductListing';
import AddProductModal from '../components/vendor/AddProductModal';
import ShopDetailsModal from '../components/vendor/ShopDetailsModal';
import VendorAnalytics from '../components/vendor/VendorAnalytics';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { toast } from 'react-toastify';
import apiClient from '../utils/api';

const EnhancedVendorDashboard = () => {
  const { user } = useAuth();

  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState({
    todayEarnings: 0,
    activeOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    isOnline: false,
    shopName: '',
    ownerName: '',
    address: 'Location not set'
  });
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationUpdating, setLocationUpdating] = useState(false);

  // UI state
  const [showAIListing, setShowAIListing] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProductSettings, setShowProductSettings] = useState(null);

  // Profile edit state - FIXED: Include all vendor fields including image
  const [profileData, setProfileData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    category: 'food',
    operatingHours: '10:00 AM - 9:00 PM',
    services: [],
    image: null // ADDED: Include image in profile data
  });

  // Location tracking
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsResponse, productsResponse, profileResponse] = await Promise.all([
        apiClient.getVendorStats(),
        apiClient.getVendorProducts(),
        apiClient.getVendorProfile()
      ]);

      if (statsResponse.success) {
        setDashboardStats(statsResponse.stats);
      }

      // Get vendor profile for image and other details - FIXED: Populate complete profile data
      if (profileResponse) {
        
        setDashboardStats(prev => ({
          ...prev,
          shopImage: profileResponse.image,
          shopName: profileResponse.shopName || prev.shopName,
          ownerName: profileResponse.ownerName || prev.ownerName,
          address: profileResponse.address || prev.address,
          phone: profileResponse.phone || '',
          email: profileResponse.email || ''
        }));
        
        // FIXED: Set complete profile data including image and all fields
        setProfileData({
          shopName: profileResponse.shopName || '',
          ownerName: profileResponse.ownerName || '',
          phone: profileResponse.phone || '',
          email: profileResponse.email || '',
          address: profileResponse.address || '',
          category: profileResponse.category || 'food',
          operatingHours: profileResponse.schedule?.operatingHours || '10:00 AM - 9:00 PM',
          services: profileResponse.services || [],
          image: profileResponse.image || null // ADDED: Include image in profile data
        });

      }

      if (Array.isArray(productsResponse)) {
        setProducts(productsResponse);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current location and update backend
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setLocationUpdating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        try {
          // Update live location in backend
          const response = await apiClient.updateLiveLocation(latitude, longitude);
          
          if (response.success) {
            setDashboardStats(prev => ({ 
              ...prev, 
              address: response.vendor.address 
            }));
            
            // Show success message only on manual update
            if (!locationUpdating) {
              toast.success('Location updated successfully');
            }
          }
        } catch (error) {
          console.error('Failed to update live location:', error);
          // Only show error on manual update
          if (!locationUpdating) {
            toast.error('Failed to update location');
          }
        }
        
        setLocationUpdating(false);
        setLocationError(null);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
            break;
        }
        
        setLocationError(errorMessage);
        setLocationUpdating(false);
        
        // Only show error toast on manual update
        if (!locationUpdating) {
          toast.error(errorMessage);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, [locationUpdating]);

  // Update location
  const handleLocationUpdate = async (address, coordinates = null) => {
    try {
      const response = await apiClient.updateVendorLocation({
        address,
        coordinates
      });

      if (response.success) {
        setDashboardStats(prev => ({ ...prev, address }));
        toast.success('Location updated successfully');
      }
    } catch (error) {
      console.error('Failed to update location:', error);
      toast.error('Failed to update location');
    }
  };

  // Toggle online status
  const handleToggleOnlineStatus = async () => {
    try {
      const newStatus = !dashboardStats.isOnline;
      const response = await apiClient.toggleVendorStatus(newStatus);
      
      if (response.success) {
        setDashboardStats(prev => ({ ...prev, isOnline: newStatus }));
        toast.success(response.message);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status');
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (updatedData) => {
    try {
      
      const response = await apiClient.updateVendorProfile(updatedData);
      
      if (response && response.success) {
        
        // Update dashboard stats with new data
        setDashboardStats(prev => ({
          ...prev,
          shopName: response.vendor.shopName || prev.shopName,
          ownerName: response.vendor.ownerName || prev.ownerName,
          address: response.vendor.address || prev.address,
          shopImage: response.vendor.image || prev.shopImage
        }));
        
        // FIXED: Update complete profile data after successful save
        setProfileData({
          shopName: response.vendor.shopName || '',
          ownerName: response.vendor.ownerName || '',
          phone: response.vendor.phone || '',
          email: response.vendor.email || '',
          address: response.vendor.address || '',
          category: response.vendor.category || 'food',
          operatingHours: response.vendor.schedule?.operatingHours || '10:00 AM - 9:00 PM',
          services: response.vendor.services || [],
          image: response.vendor.image || null // ADDED: Update image in profile data
        });
        
        setShowEditProfile(false);
        toast.success('Profile updated successfully');
        
        // Refresh dashboard data to get latest info
        setTimeout(() => {
          fetchDashboardData();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Handle product operations
  const handleAddProduct = async (productData) => {
    try {
      const response = await apiClient.addVendorProduct(productData);
      
      if (response) {
        setProducts(prev => [...prev, response]);
        setShowAddProduct(false);
        setShowAIListing(false);
        toast.success('Product added successfully');
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await apiClient.deleteVendorProduct(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
      setShowDeleteConfirm(null);
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Handle shop photo upload
  const handleShopPhotoUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('shopPhoto', file);
      
      
      const response = await apiClient.uploadShopPhoto(formData);
      
      if (response.success) {
        
        // Immediately update dashboard state with new image
        const fullImageUrl = response.imageUrl.startsWith('http') 
          ? response.imageUrl 
          : `${window.location.origin}${response.imageUrl}`;
          
        setDashboardStats(prev => ({
          ...prev,
          shopImage: response.imageUrl // Store relative path for consistency
        }));
        
        setProfileData(prev => ({
          ...prev,
          image: response.imageUrl
        }));
        
        toast.success('Shop photo updated successfully');
        
        // Refresh dashboard data to ensure consistency
        setTimeout(() => {
          fetchDashboardData();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to upload shop photo:', error);
      toast.error('Failed to upload shop photo');
    }
  };

  useEffect(() => {
    if (user && user.role === 'vendor') {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Auto-update location every 2 minutes when online
  useEffect(() => {
    let locationInterval;
    
    if (dashboardStats.isOnline) {
      // Update location immediately when going online
      getCurrentLocation();
      
      // Set up interval for every 2 minutes
      locationInterval = setInterval(() => {
        getCurrentLocation();
      }, 2 * 60 * 1000); // 2 minutes
    }

    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [dashboardStats.isOnline, getCurrentLocation]);

  const stats = [
    { 
      id: 1, 
      name: 'Today\'s Earnings', 
      value: `₹${dashboardStats.todayEarnings}`, 
      change: '+12%', 
      icon: DollarSign, 
      color: 'bg-[#CDF546] text-gray-900' 
    },
    { 
      id: 2, 
      name: 'Active Orders', 
      value: dashboardStats.activeOrders, 
      change: '+2', 
      icon: Package, 
      color: 'bg-[#1A6950] text-white' 
    },
    { 
      id: 3, 
      name: 'Total Revenue', 
      value: `₹${dashboardStats.totalRevenue}`, 
      change: '+8%', 
      icon: TrendingUp, 
      color: 'bg-white text-[#1A6950]' 
    },
    { 
      id: 4, 
      name: 'Avg Rating', 
      value: dashboardStats.averageRating, 
      change: `(${dashboardStats.totalReviews})`, 
      icon: Star, 
      color: 'bg-gray-900 text-white' 
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar role="vendor" />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-28">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-8">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative"
            >
              <div className="w-20 h-20 bg-[#1A6950] rounded-[24px] flex items-center justify-center overflow-hidden">
                {dashboardStats.shopImage ? (
                  <img 
                    src={dashboardStats.shopImage.startsWith('http') 
                      ? dashboardStats.shopImage 
                      : `${window.location.origin}${dashboardStats.shopImage}`
                    } 
                    alt="Shop" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
                    }}
                  />
                ) : null}
                {/* Fallback icon */}
                <div className={`fallback-icon w-full h-full flex items-center justify-center ${dashboardStats.shopImage ? 'hidden' : 'flex'}`}>
                  <Store size={32} className="text-white" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#CDF546] rounded-full flex items-center justify-center">
                {dashboardStats.isOnline ? (
                  <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
                ) : (
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                )}
              </div>
            </motion.div>

            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {dashboardStats.shopName || 'Your Shop'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{dashboardStats.address}</span>
                  {locationUpdating && (
                    <Loader size={12} className="animate-spin text-[#1A6950]" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${dashboardStats.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{dashboardStats.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white rounded-[16px] border border-gray-200 hover:bg-gray-50"
            >
              <Bell size={20} />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </button>

            <button
              onClick={handleToggleOnlineStatus}
              className={`px-6 py-3 rounded-[16px] font-bold text-sm transition-colors ${
                dashboardStats.isOnline
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {dashboardStats.isOnline ? 'Go Offline' : 'Go Online'}
            </button>

            <button
              onClick={() => setShowEditProfile(true)}
              className="p-3 bg-[#1A6950] text-white rounded-[16px] hover:bg-[#145240]"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.color} rounded-[24px] p-6 border border-gray-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon size={24} />
                <span className="text-sm font-bold opacity-60">{stat.change}</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                  {stat.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Location Update Section */}
        <div className="bg-white rounded-[24px] p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Live Location</h3>
            <div className="flex gap-2">
              <button
                onClick={getCurrentLocation}
                disabled={locationUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-[#1A6950] text-white rounded-[12px] hover:bg-[#145240] disabled:opacity-50"
              >
                {locationUpdating ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <MapPin size={16} />
                )}
                {locationUpdating ? 'Updating...' : 'Update Now'}
              </button>
              
              <div className={`px-3 py-2 rounded-[12px] text-sm font-medium ${
                dashboardStats.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {dashboardStats.isOnline ? 'Auto-updating' : 'Manual only'}
              </div>
            </div>
          </div>
          
          {locationError && (
            <div className="bg-red-100 text-red-600 p-3 rounded-[12px] mb-4 text-sm">
              {locationError}
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Current:</strong> {dashboardStats.address}
            </p>
            <p className="text-xs text-gray-500">
              {dashboardStats.isOnline 
                ? 'Location updates automatically every 2 minutes when online' 
                : 'Go online to enable automatic location updates'
              }
            </p>
            {currentLocation && (
              <p className="text-xs text-green-600">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-white rounded-[24px] p-6 border border-gray-200 hover:bg-gray-50 text-left"
          >
            <Plus size={24} className="text-[#1A6950] mb-3" />
            <p className="font-bold text-gray-900">Add Product</p>
            <p className="text-xs text-gray-600">Manual entry</p>
          </button>

          <button
            onClick={() => setShowAIListing(true)}
            className="bg-[#CDF546] rounded-[24px] p-6 border border-gray-200 hover:bg-[#b8e639] text-left"
          >
            <MessageCircle size={24} className="text-gray-900 mb-3" />
            <p className="font-bold text-gray-900">AI Assistant</p>
            <p className="text-xs text-gray-600">Smart product entry</p>
          </button>

          <button
            onClick={() => setShowAnalytics(true)}
            className="bg-white rounded-[24px] p-6 border border-gray-200 hover:bg-gray-50 text-left"
          >
            <TrendingUp size={24} className="text-[#1A6950] mb-3" />
            <p className="font-bold text-gray-900">Analytics</p>
            <p className="text-xs text-gray-600">View insights</p>
          </button>

          <label className="bg-white rounded-[24px] p-6 border border-gray-200 hover:bg-gray-50 text-left cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleShopPhotoUpload(e.target.files[0])}
              className="hidden"
            />
            <div className="w-6 h-6 mx-auto mb-3 rounded-full overflow-hidden bg-[#1A6950] flex items-center justify-center">
              {dashboardStats.shopImage ? (
                <img 
                  src={dashboardStats.shopImage.startsWith('http') 
                    ? dashboardStats.shopImage 
                    : `${window.location.origin}${dashboardStats.shopImage}`
                  } 
                  alt="Shop" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-camera').style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`fallback-camera w-full h-full flex items-center justify-center ${dashboardStats.shopImage ? 'hidden' : 'flex'}`}>
                <Camera size={16} className="text-white" />
              </div>
            </div>
            <p className="font-bold text-gray-900">Shop Photo</p>
            <p className="text-xs text-gray-600">{dashboardStats.shopImage ? 'Change photo' : 'Upload image'}</p>
          </label>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-[24px] p-8 border border-gray-200 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">Menu Items</h2>
            <span className="text-sm text-gray-600">{products.length} items</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Utensils size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No menu items yet</p>
              <button
                onClick={() => setShowAddProduct(true)}
                className="px-6 py-3 bg-[#1A6950] text-white rounded-[16px] hover:bg-[#145240]"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="relative group">
                  <div className="bg-gray-50 rounded-[20px] p-4 border border-gray-200">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-[12px] mb-3"
                      />
                    )}
                    <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <p className="text-lg font-bold text-[#1A6950]">₹{product.price}</p>
                    
                    <button
                      onClick={() => setShowProductSettings(product._id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings size={16} />
                    </button>
                  </div>

                  {showProductSettings === product._id && (
                    <div className="absolute top-12 right-2 bg-white rounded-[12px] shadow-lg border border-gray-200 p-2 z-10">
                      <button
                        onClick={() => setShowDeleteConfirm(product._id)}
                        className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-[8px]"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Voice Assistant */}
        <VendorVoiceAssistant />
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onAdd={handleAddProduct}
      />

      {showAIListing && (
        <AIProductListing
          onClose={() => setShowAIListing(false)}
          onProductAdded={handleAddProduct}
        />
      )}

      <ShopDetailsModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleProfileUpdate}
        initialData={profileData}
      />

      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <VendorAnalytics vendorId={user?.id} />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-md">
            <div className="text-center">
              <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Delete Product</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-[12px] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(showDeleteConfirm)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-[12px] hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EnhancedVendorDashboard;