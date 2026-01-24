import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, MapPin, Package, Star, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '../../context/AppDataContext';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { vendors, orders, userLocation } = useAppData();
  
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, orders, vendors

  // Generate dynamic notifications based on app data
  useEffect(() => {
    const generateNotifications = () => {
      const notifs = [];
      const now = new Date();

      // Order-related notifications
      (orders || []).forEach(order => {
        const vendor = (vendors || []).find(v => v._id === order.vendorId);
        if (order.status === 'pending' || order.status === 'new') {
          notifs.push({
            id: `order-${order._id}`,
            type: 'order',
            title: 'Order Confirmation Pending',
            message: `Your order from ${vendor?.shopName || 'vendor'} is awaiting confirmation`,
            time: new Date(order.createdAt || now).toISOString(),
            unread: true,
            icon: Package,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            action: () => navigate('/customer/orders')
          });
        }
        
        if (order.status === 'completed' || order.status === 'delivered') {
          notifs.push({
            id: `order-complete-${order._id}`,
            type: 'order',
            title: 'Order Delivered!',
            message: `Your order from ${vendor?.shopName || 'vendor'} has been delivered. Rate your experience!`,
            time: new Date(order.updatedAt || order.createdAt || now).toISOString(),
            unread: Math.random() > 0.5, // Randomly mark some as read
            icon: Package,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            action: () => navigate('/customer/orders')
          });
        }
      });

      // Vendor-related notifications
      (vendors || []).slice(0, 3).forEach((vendor, idx) => {
        if (vendor.isOnline) {
          notifs.push({
            id: `vendor-online-${vendor._id}`,
            type: 'vendor',
            title: 'Vendor Now Online',
            message: `${vendor.shopName} is now accepting orders in your area`,
            time: new Date(now.getTime() - (idx * 30 * 60 * 1000)).toISOString(), // 30 mins ago
            unread: Math.random() > 0.3,
            icon: MapPin,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            action: () => navigate(`/customer/vendor/${vendor._id}`)
          });
        }

        // Special offers
        if (Math.random() > 0.7) {
          notifs.push({
            id: `offer-${vendor._id}`,
            type: 'offer',
            title: 'Special Offer Available',
            message: `${vendor.shopName} is offering 20% off on orders above ₹300`,
            time: new Date(now.getTime() - (idx * 60 * 60 * 1000)).toISOString(), // 1 hour ago
            unread: Math.random() > 0.4,
            icon: Star,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            action: () => navigate(`/customer/vendor/${vendor._id}`)
          });
        }
      });

      // Location-based notifications
      if (userLocation) {
        notifs.push({
          id: 'location-update',
          type: 'system',
          title: 'Location Updated',
          message: 'We found new vendors in your area. Check them out!',
          time: new Date(now.getTime() - (2 * 60 * 60 * 1000)).toISOString(), // 2 hours ago
          unread: false,
          icon: MapPin,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          action: () => navigate('/customer/map')
        });
      }

      // Welcome notification for new users
      if ((orders || []).length === 0) {
        notifs.push({
          id: 'welcome',
          type: 'system',
          title: 'Welcome to Vendorify!',
          message: 'Discover amazing local vendors and place your first order',
          time: new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString(), // 1 day ago
          unread: false,
          icon: Bell,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          action: () => navigate('/customer')
        });
      }

      // Sort by time (newest first)
      return notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
    };

    setNotifications(generateNotifications());
  }, [vendors, orders, userLocation, navigate]);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return notif.unread;
    if (filter === 'orders') return notif.type === 'order';
    if (filter === 'vendors') return notif.type === 'vendor' || notif.type === 'offer';
    return true;
  });

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, unread: false }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTimeAgo = (timeString) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-[#FDF9DC] font-sans selection:bg-[#CDF546]">
      <Navbar role="customer" />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/customer')}
              className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-xl transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-heading font-black text-gray-900 uppercase tracking-tight">Notifications</h1>
              <p className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.3em] mt-1">
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up!'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 bg-[#1A6950] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all"
            >
              <CheckCircle size={16} />
              Mark All Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'orders', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
            { id: 'vendors', label: 'Vendors', count: notifications.filter(n => n.type === 'vendor' || n.type === 'offer').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#1A6950] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-16 text-center border border-gray-100 shadow-sm"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No notifications</h3>
                <p className="text-gray-500">
                  {filter === 'unread' ? 'All notifications have been read' : 'You\'re all caught up!'}
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, idx) => {
                const IconComponent = notification.icon;
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.05 }}
                    key={notification.id}
                    className={`bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group ${
                      notification.unread ? 'border-l-4 border-l-[#CDF546]' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.action) notification.action();
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${notification.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent size={20} className={notification.color} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className={`font-bold text-gray-900 mb-1 ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock size={12} />
                              {getTimeAgo(notification.time)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {notification.unread && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-2 text-gray-400 hover:text-[#1A6950] transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {notification.unread && (
                        <div className="w-2 h-2 bg-[#CDF546] rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotificationsPage;