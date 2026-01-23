import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, TrendingUp, Star, Plus, Edit, MapPin, MessageCircle, Camera, ShieldCheck, ArrowUpRight, Utensils, Settings, Bell, DollarSign, Trash2, AlertTriangle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import VendorVoiceAssistant from '../components/vendor/VendorVoiceAssistant';
import AIProductListing from '../components/vendor/AIProductListing';
import AddProductModal from '../components/vendor/AddProductModal';
import ShopDetailsModal from '../components/vendor/ShopDetailsModal';
import Navbar from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { toast } from 'react-toastify';
import apiClient from '../utils/api';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    getOrdersForVendor,
    geoError,
    products,
    vendorDetails,
    addProduct,
    deleteProduct,
    updateVendorDetails,
    fetchVendorData
  } = useAppData();

  const [showProductSettings, setShowProductSettings] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showAIListing, setShowAIListing] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dashboard stats state
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

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const [statsResponse, profileResponse] = await Promise.all([
        apiClient.getVendorStats(),
        apiClient.getVendorProfile()
      ]);
      
      if (statsResponse.success) {
        setDashboardStats(statsResponse.stats);
        setIsOnline(statsResponse.stats.isOnline);
      }
      
      // FIXED: Get vendor profile for complete data including image
      if (profileResponse) {
        setDashboardStats(prev => ({
          ...prev,
          shopImage: profileResponse.image,
          shopName: profileResponse.shopName || prev.shopName,
          ownerName: profileResponse.ownerName || prev.ownerName,
          address: profileResponse.address || prev.address,
          phone: profileResponse.phone || '',
          email: profileResponse.email || '',
          category: profileResponse.category || 'food',
          services: profileResponse.services || [],
          schedule: profileResponse.schedule || { operatingHours: '10:00 AM - 9:00 PM' }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'vendor') {
      fetchVendorData(user.id);
      fetchDashboardStats();
    }
  }, [user, fetchVendorData, fetchDashboardStats]);

  const orders = typeof getOrdersForVendor === 'function' ? getOrdersForVendor(user?.id || user?._id) : [];
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.total, 0);

  const handleAddProduct = useCallback(async (newProduct) => {
    const result = await addProduct(newProduct);
    if (result) {
      toast.success('Product added successfully!');
      setShowAddProduct(false);
      setShowAIListing(false);
    } else {
      toast.error('Failed to add product');
    }
  }, [addProduct]);

  const handleDeleteProduct = (id) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteProduct(showDeleteConfirm);
      toast.success('Product deleted');
      setShowDeleteConfirm(null);
    }
  };

  // Toggle online status
  const handleToggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      const response = await apiClient.toggleVendorStatus(newStatus);
      
      if (response.success) {
        setIsOnline(newStatus);
        setDashboardStats(prev => ({ ...prev, isOnline: newStatus }));
        toast.success(response.message);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status');
    }
  };

  // Handle shop photo upload
  const handleShopPhotoUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('shopPhoto', file);
      
      const response = await apiClient.uploadShopPhoto(formData);
      
      if (response.success) {
        toast.success('Shop photo updated successfully');
        fetchDashboardStats(); // Refresh to get updated image
      }
    } catch (error) {
      console.error('Failed to upload shop photo:', error);
      toast.error('Failed to upload shop photo');
    }
  };

  const notifications = [
    { id: 1, text: 'New order received!', time: '2 min ago', unread: true },
    { id: 2, text: 'Your rating increased to 4.9', time: '1 hour ago', unread: true },
    { id: 3, text: 'Payment of Rs 1,240 received', time: '3 hours ago', unread: false },
  ];

  const stats = [
    { id: 1, name: 'Today\'s Earnings', value: `Rs ${dashboardStats.todayEarnings}`, change: '+12%', icon: DollarSign, color: 'bg-[#CDF546] text-gray-900', delay: 0 },
    { id: 2, name: 'Active Orders', value: dashboardStats.activeOrders, change: '+2', icon: Package, color: 'bg-[#1A6950] text-white', delay: 0.1 },
    { id: 3, name: 'Total Revenue', value: `Rs ${dashboardStats.totalRevenue}`, change: '+8%', icon: TrendingUp, color: 'bg-white text-[#1A6950]', delay: 0.2 },
    { id: 4, name: 'Avg Rating', value: dashboardStats.averageRating || '4.8', change: `(${dashboardStats.totalReviews || 0})`, icon: Star, color: 'bg-gray-900 text-white', delay: 0.3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar role="vendor" />
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-28">
        {geoError && (
          <div className="mb-8 bg-red-100 text-red-600 px-8 py-4 rounded-[24px] border border-red-200 text-sm font-bold uppercase tracking-widest flex items-center gap-3">
            <MapPin size={18} />
            {geoError} (Check Browser Permissions)
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-30">
          <div className="flex items-center gap-8 group">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative"
            >
              <div className="w-24 h-24 bg-[#1A6950] rounded-[32px] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
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
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!dashboardStats.shopImage && (
                  <Store size={40} className="text-[#CDF546]" />
                )}
                <Store size={40} className="text-[#CDF546]" style={{ display: 'none' }} />
              </div>
              <div className="absolute inset-0 bg-[#CDF546] rounded-[32px] blur-2xl opacity-40 animate-pulse" />
              <button
                onClick={() => setShowEditProfile(true)}
                className="absolute -bottom-2 -right-2 z-20 bg-white p-2 rounded-full shadow-lg text-gray-900 border border-gray-100 hover:scale-110 transition-transform"
              >
                <Edit size={14} />
              </button>
            </motion.div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-heading font-black text-gray-900 uppercase tracking-tighter">
                  {dashboardStats.shopName || user?.shopName || "My Shop"}
                </h1>
                <ShieldCheck className="text-[#1A6950]" size={28} />
              </div>
              <p className="text-gray-400 font-bold text-[12px] uppercase tracking-[0.3em] flex items-center gap-2">
                <MapPin size={14} className="text-[#1A6950]" />
                {dashboardStats.address || "Location not set"} • Verified Shop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[28px] border border-white/50 shadow-sm">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#CDF546] ${isOnline ? 'bg-white text-[#1A6950] shadow-md' : 'text-gray-400'
                }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-[#1A6950]' : 'bg-gray-300'}`} />
              {isOnline ? 'Accepting' : 'Paused'}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-4 text-gray-400 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded-lg relative"
              >
                <Bell size={24} />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h4 className="font-black text-sm uppercase tracking-widest">Notifications</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${n.unread ? 'bg-[#CDF546]/10' : ''}`}>
                          <p className="font-bold text-sm text-gray-900">{n.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={logout}
              className="p-4 text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDF546] rounded-lg"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className={`relative rounded-[32px] p-6 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700 group cursor-pointer border border-gray-100 ${stat.color}`}
            >
              <div className="relative z-10">
                <p className={`font-black text-[9px] uppercase tracking-[0.2em] mb-2 opacity-70`}>{stat.name}</p>
                <h3 className="text-2xl font-heading font-black mb-4">{stat.value}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2 py-1 rounded-full bg-black/10">
                    {stat.change}
                  </span>
                  <stat.icon size={20} className="opacity-40 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-5 rounded-full translate-x-8 -translate-y-8" />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-heading font-black text-gray-900 uppercase tracking-tight">Shop Menu</h2>
                  <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                    {products.length} Items • Manage availability
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setShowAIListing(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1A6950] text-white px-6 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#1A6950]/20 hover:scale-105 transition-all"
                  >
                    <Camera size={16} />
                    AI Add
                  </button>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#CDF546] text-gray-900 px-6 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#CDF546]/20 hover:scale-105 transition-all"
                  >
                    <Plus size={16} />
                    Manual
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AnimatePresence>
                  {products.map((item) => (
                    <motion.div
                      layout
                      key={item._id || item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group flex items-center justify-between p-6 bg-gray-50 rounded-[32px] hover:bg-white hover:shadow-xl transition-all duration-500 border border-transparent hover:border-gray-100"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Utensils className="text-[#1A6950]" size={28} />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 uppercase tracking-tight text-lg leading-tight mb-1">{item.name}</p>
                          <p className="text-[#1A6950] font-black text-xl">₹{item.price}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.available !== false ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-400'}`} />
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setShowProductSettings(item)}
                            className="p-3 bg-white text-gray-300 rounded-xl hover:text-gray-900 hover:shadow-md transition-all"
                          >
                            <Settings size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item._id || item.id)}
                            className="p-3 bg-white text-red-300 rounded-xl hover:text-red-500 hover:shadow-md transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {products.length === 0 && (
                  <div className="col-span-2 text-center py-10 opacity-30 italic">
                    No products added yet.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-[56px] p-10 md:p-14 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#CDF546] rounded-full blur-[150px] opacity-10 translate-x-1/2 -translate-y-1/2" />

              <div className="flex justify-between items-center mb-12 relative z-10">
                <h2 className="text-3xl font-heading font-black uppercase tracking-tight">Active Orders</h2>
                <button
                  onClick={() => navigate('/vendor/orders')}
                  className="bg-white/10 backdrop-blur-md text-white p-4 rounded-full hover:bg-[#CDF546] hover:text-gray-900 transition-all"
                >
                  <ArrowUpRight size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {orders.length > 0 ? orders.slice(0, 4).map((order) => (
                  <div key={order._id || order.id} className="bg-white/5 backdrop-blur-xl rounded-[40px] p-8 border border-white/10 hover:border-[#CDF546]/50 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Customer</p>
                        <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-[#CDF546] transition-colors">{order.customerName || 'Guest'}</h4>
                      </div>
                      <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${order.status === 'NEW' || order.status === 'PENDING' ? 'bg-[#CDF546] text-gray-900' : 'bg-white/10 text-white'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <span className="text-2xl font-black">₹{order.total}</span>
                      <div className="flex gap-2">
                        <button className="bg-white/10 p-4 rounded-2xl hover:bg-white hover:text-gray-900 transition-all">
                          <MessageCircle size={20} />
                        </button>
                        <button className="bg-[#CDF546] text-gray-900 p-4 rounded-2xl shadow-lg hover:scale-110 transition-transform">
                          <Package size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-10 opacity-50">
                    <Package size={48} className="mx-auto mb-4" />
                    <p>No active orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-[#1A6950] rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-[#CDF546] rounded-[28px] flex items-center justify-center mb-8 shadow-xl rotate-12 group-hover:rotate-0 transition-transform">
                  <MessageCircle size={36} className="text-gray-900" />
                </div>
                <h3 className="text-3xl font-heading font-black uppercase mb-4 leading-none">
                  Voice <br /> Control
                </h3>
                <p className="text-white/60 text-sm font-medium mb-10 leading-relaxed">
                  Say "Turn off orders" or "What's my total?" to interact with Vendorify AI.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    {isVoiceActive ? (
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-1/2 h-full bg-[#CDF546]"
                      />
                    ) : (
                      <div className="w-0 h-full bg-[#CDF546]" />
                    )}
                  </div>
                  <button
                    onClick={() => setIsVoiceActive(!isVoiceActive)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white ${isVoiceActive ? 'text-[#CDF546] bg-white/10' : 'text-white/40 hover:text-[#CDF546]'}`}
                  >
                    {isVoiceActive ? 'Listening' : 'Start'}
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="bg-white rounded-[56px] p-12 shadow-sm border border-gray-100">
              <h3 className="text-xl font-heading font-black text-gray-900 uppercase mb-8 tracking-tight">Daily Progress</h3>
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-400">
                    <span>Goal Reached</span>
                    <span className="text-[#1A6950]">85%</span>
                  </div>
                  <div className="h-4 bg-gray-50 rounded-full overflow-hidden p-1">
                    <div className="h-full bg-[#1A6950] rounded-full w-[85%]" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] group hover:bg-[#CDF546] transition-all duration-500 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Star className="text-yellow-500" size={20} />
                    </div>
                    <span className="font-black uppercase tracking-tight text-gray-900 text-sm">Rating Goal</span>
                  </div>
                  <ArrowUpRight size={20} className="text-gray-300 group-hover:text-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VendorVoiceAssistant />

      {showAIListing && (
        <AIProductListing
          onClose={() => setShowAIListing(false)}
          onProductAdded={handleAddProduct}
        />
      )}

      {showAddProduct && (
        <AddProductModal
          isOpen={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          onAdd={handleAddProduct}
        />
      )}

      {showEditProfile && (
        <ShopDetailsModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          initialData={dashboardStats} // FIXED: Use correct prop name
          onSave={(updatedData) => {
            updateVendorDetails(updatedData);
            fetchDashboardStats(); // ADDED: Refresh data after update
            setShowEditProfile(false);
          }}
        />
      )}

      {showProductSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Product Settings</h3>
              <button onClick={() => setShowProductSettings(null)} className="text-gray-400 hover:text-gray-900">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-gray-700">Available</span>
                <button className={`w-12 h-6 rounded-full relative ${showProductSettings.available !== false ? 'bg-[#CDF546]' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showProductSettings.available !== false ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 text-center mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-center text-sm mb-8">This action cannot be undone. The product will be permanently removed from your menu.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-4 px-6 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 px-6 rounded-2xl bg-red-500 text-white font-bold text-sm uppercase tracking-widest hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VendorDashboard;
