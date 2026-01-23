import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useGeolocation } from '../hooks/useGeolocation';
import { CONFIG, SOCKET_EVENTS } from '../constants/config';

const AppDataContext = createContext(null);

const uid = () => `ORD-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const getCustomerId = () => {
  let id = localStorage.getItem('vendorify_customer_id');
  if (!id) {
    id = `CUST-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    localStorage.setItem('vendorify_customer_id', id);
  }
  return id;
};

export const AppDataProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('vendorify_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [userLocation, setUserLocation] = useState(null);
  const [vendorLocations, setVendorLocations] = useState(new Map());
  const [products, setProducts] = useState([]);
  const [vendorDetails, setVendorDetails] = useState(null);
  
  const socketRef = useRef(null);
  const customerId = getCustomerId();

  useEffect(() => {
    socketRef.current = io(CONFIG.API.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current.emit('join_customer_room', customerId);
      socketRef.current.emit('get_all_vendor_locations');
    });

    socketRef.current.on('vendor_moved', (data) => {
      setVendorLocations(prev => {
        const newMap = new Map(prev);
        newMap.set(data.vendorId, { lat: data.lat, lng: data.lng, currentStop: data.currentStop });
        return newMap;
      });

      setVendors(prev => prev.map(v => 
        v._id === data.vendorId 
          ? { 
              ...v, 
              location: { type: 'Point', coordinates: [data.lng, data.lat] },
              schedule: { ...v.schedule, currentStop: data.currentStop }
            }
          : v
      ));
    });

    socketRef.current.on('vendor_status_changed', (data) => {
      setVendors(prev => prev.map(v => 
        v._id === data.vendorId ? { ...v, isOnline: data.isOnline } : v
      ));
    });

    socketRef.current.on('all_vendor_locations', (locations) => {
      const newMap = new Map();
      locations.forEach(loc => {
        newMap.set(loc.vendorId, { lat: loc.lat, lng: loc.lng, currentStop: loc.currentStop });
      });
      setVendorLocations(newMap);
    });

    socketRef.current.on('order_status_update', (data) => {
      setOrders(prev => prev.map(o => 
        o._id === data.orderId ? { ...o, status: data.status } : o
      ));
    });

    socketRef.current.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [customerId]);

  useEffect(() => {
    localStorage.setItem('vendorify_cart', JSON.stringify(cart));
  }, [cart]);

  const handleLocationUpdate = useCallback((location) => {
    setUserLocation(location);
    if (socketRef.current) {
      socketRef.current.emit('customer_location', { 
        customerId, 
        lat: location.lat, 
        lng: location.lng 
      });
    }
  }, [customerId]);

  const { error: geoError, loading: geoLoading, refetch: refetchLocation } = useGeolocation(handleLocationUpdate, 30000);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${CONFIG.API.BASE_URL}/public/vendors/all`;
      
      if (userLocation) {
        url += `?lat=${userLocation.lat}&lng=${userLocation.lng}`;
      }

      console.log('Fetching vendors from:', url);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch vendors');
      
      const data = await res.json();
      console.log('Raw vendor data:', data);
      
      // Transform vendor data to include coordinates in the expected format
      const transformedVendors = data.map(vendor => ({
        ...vendor,
        coordinates: vendor.location?.coordinates ? {
          lat: vendor.location.coordinates[1],
          lng: vendor.location.coordinates[0]
        } : null
      }));
      
      console.log('Transformed vendors:', transformedVendors);
      setVendors(transformedVendors);
      setError(null);
    } catch (err) {
      console.error('Fetch vendors error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  const fetchNearbyVendors = useCallback(async (lat, lng, radius = 5000, category = 'all') => {
    try {
      let url = `${CONFIG.API.BASE_URL}/public/vendors/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
      if (category !== 'all') url += `&category=${category}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch nearby vendors');
      
      const data = await res.json();
      
      // Transform vendor data to include coordinates in the expected format
      return data.map(vendor => ({
        ...vendor,
        coordinates: vendor.location?.coordinates ? {
          lat: vendor.location.coordinates[1],
          lng: vendor.location.coordinates[0]
        } : null
      }));
    } catch (err) {
      console.error('Fetch nearby error:', err);
      return [];
    }
  }, []);

  const fetchRoamingVendors = useCallback(async () => {
    try {
      let url = `${CONFIG.API.BASE_URL}/public/vendors/roaming`;
      if (userLocation) {
        url += `?lat=${userLocation.lat}&lng=${userLocation.lng}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch roaming vendors');
      
      return await res.json();
    } catch (err) {
      console.error('Fetch roaming error:', err);
      return [];
    }
  }, [userLocation]);

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch(`${CONFIG.API.BASE_URL}/public/vendors/deals`);
      if (!res.ok) throw new Error('Failed to fetch deals');
      
      const data = await res.json();
      setDeals(data);
      return data;
    } catch (err) {
      console.error('Fetch deals error:', err);
      return [];
    }
  }, []);

  const searchVendors = useCallback(async (query, category = 'all') => {
    try {
      let url = `${CONFIG.API.BASE_URL}/public/vendors/search?q=${encodeURIComponent(query)}`;
      if (category !== 'all') url += `&category=${category}`;
      if (userLocation) url += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      
      return await res.json();
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }, [userLocation]);

  // NEW: Item search function (REQUIREMENT 1)
  const searchItems = useCallback(async (query) => {
    try {
      let url = `${CONFIG.API.BASE_URL}/public/vendors/search/items?q=${encodeURIComponent(query)}`;
      if (userLocation) url += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Item search failed');
      
      return await res.json();
    } catch (err) {
      console.error('Item search error:', err);
      return [];
    }
  }, [userLocation]);

  const fetchCustomerOrders = useCallback(async () => {
    try {
      // For now, return empty array since customers don't have authentication
      // In a full implementation, this would fetch orders for the customer
      console.log('Customer orders: Using local storage for guest customers');
      const localOrders = JSON.parse(localStorage.getItem('vendorify_customer_orders') || '[]');
      setOrders(localOrders);
      return localOrders;
    } catch (err) {
      console.error('Fetch orders error:', err);
      return [];
    }
  }, [customerId]);

  const getOrdersForVendor = useCallback((vendorId) => {
    return orders.filter(o => String(o.vendorId) === String(vendorId) || String(o.vendorId?._id) === String(vendorId));
  }, [orders]);

  const fetchVendorData = useCallback(async (vendorId) => {
    try {
      const token = localStorage.getItem('vendorify_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Vendor Details
      const vRes = await fetch(`${CONFIG.API.BASE_URL}/vendors/profile`, { headers });
      if (vRes.ok) {
        const vData = await vRes.json();
        setVendorDetails(vData);
      }

      // Fetch Products
      const pRes = await fetch(`${CONFIG.API.BASE_URL}/vendors/products`, { headers });
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts(pData);
      }

      // Fetch Orders
      const oRes = await fetch(`${CONFIG.API.BASE_URL}/orders/vendor`, { headers });
      if (oRes.ok) {
        const oData = await oRes.json();
        setOrders(prev => {
          const combined = [...prev, ...oData];
          const unique = Array.from(new Map(combined.map(o => [o._id, o])).values());
          return unique;
        });
      }
    } catch (err) {
      console.error('Fetch vendor data error:', err);
    }
  }, []);

  const addProduct = useCallback(async (productData) => {
    try {
      console.log('Adding product:', productData);
      
      const token = localStorage.getItem('vendorify_token');
      if (!token) {
        console.error('No auth token found');
        return null;
      }

      const res = await fetch(`${CONFIG.API.BASE_URL}/vendors/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const data = await res.json();
      console.log('Add product response:', data);

      if (res.ok && data.success) {
        const newProduct = data.product;
        setProducts(prev => [...prev, newProduct]);
        console.log('Product added successfully to state');
        return newProduct;
      } else {
        console.error('Failed to add product:', data.error || data.message);
        return null;
      }
    } catch (err) {
      console.error('Add product error:', err);
      return null;
    }
  }, []);

  const deleteProduct = useCallback(async (productId) => {
    try {
      const token = localStorage.getItem('vendorify_token');
      const res = await fetch(`${CONFIG.API.BASE_URL}/vendors/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p._id !== productId));
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  }, []);

  const updateVendorDetails = useCallback(async (details) => {
    try {
      const token = localStorage.getItem('vendorify_token');
      const res = await fetch(`${CONFIG.API.BASE_URL}/vendors/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(details)
      });
      if (res.ok) {
        const updated = await res.json();
        if (updated.success) {
          setVendorDetails(updated.vendor);
          return updated.vendor;
        }
      }
    } catch (err) {
      console.error('Update vendor error:', err);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
    fetchDeals();
    fetchCustomerOrders();
    const token = localStorage.getItem('vendorify_token');
    const user = JSON.parse(localStorage.getItem('vendorify_user') || '{}');
    if (token && user.role === 'VENDOR') {
      fetchVendorData();
    }
  }, [fetchVendors, fetchDeals, fetchCustomerOrders, fetchVendorData]);

  const getVendorById = useCallback(async (vendorId) => {
    const cached = vendors.find(v => v._id === vendorId);
    if (cached) return cached;

    try {
      const res = await fetch(`${CONFIG.API.BASE_URL}/public/vendors/${vendorId}`);
      if (!res.ok) throw new Error('Vendor not found');
      return await res.json();
    } catch (err) {
      console.error('Get vendor error:', err);
      return null;
    }
  }, [vendors]);

  const getVendorMenu = useCallback(async (vendorId) => {
    try {
      const res = await fetch(`${CONFIG.API.BASE_URL}/public/vendors/${vendorId}/menu`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      return await res.json();
    } catch (err) {
      console.error('Get menu error:', err);
      return [];
    }
  }, []);

  const getVendorReviews = useCallback(async (vendorId) => {
    try {
      const res = await fetch(`${CONFIG.API.BASE_URL}/public/vendors/${vendorId}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return await res.json();
    } catch (err) {
      console.error('Get reviews error:', err);
      return [];
    }
  }, []);

  const addReview = useCallback(async ({ vendorId, customerName, rating, text }) => {
    try {
      const res = await fetch(`${CONFIG.API.BASE_URL}/public/vendors/${vendorId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, customerName, rating, text })
      });
      
      if (!res.ok) throw new Error('Failed to add review');
      
      const review = await res.json();
      
      setVendors(prev => prev.map(v => {
        if (v._id === vendorId) {
          const reviews = [...(v.reviews || []), review];
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          return { ...v, reviews, rating: Math.round(avgRating * 10) / 10, totalReviews: reviews.length };
        }
        return v;
      }));

      return review;
    } catch (err) {
      console.error('Add review error:', err);
      return null;
    }
  }, [customerId]);

  const addToCart = ({ vendorId, item }) => {
    setCart((prev) => {
      const existing = prev.find((ci) => String(ci.vendorId) === String(vendorId) && String(ci.item.id || ci.item._id) === String(item.id || item._id));
      if (existing) {
        return prev.map((ci) =>
          String(ci.vendorId) === String(vendorId) && String(ci.item.id || ci.item._id) === String(item.id || item._id)
            ? { ...ci, qty: ci.qty + 1 }
            : ci
        );
      }
      return [...prev, { vendorId, item, qty: 1 }];
    });
  };

  const updateCartQty = ({ vendorId, itemId, qty }) => {
    setCart((prev) => {
      const next = prev
        .map((ci) =>
          String(ci.vendorId) === String(vendorId) && String(ci.item.id || ci.item._id) === String(itemId)
            ? { ...ci, qty }
            : ci
        )
        .filter((ci) => ci.qty > 0);
      return next;
    });
  };

  const clearCart = () => setCart([]);

  const cartSummary = useMemo(() => {
    const total = cart.reduce((sum, ci) => sum + (ci.item.price || 0) * ci.qty, 0);
    const itemCount = cart.reduce((sum, ci) => sum + ci.qty, 0);
    const vendorId = cart.length ? cart[0].vendorId : null;

    return { total, itemCount, vendorId };
  }, [cart]);

  const placeOrder = useCallback(async ({ customerName = 'Customer', customerPhone = '', address = '' } = {}) => {
    if (!cart.length) return null;

    const vendorId = cart[0].vendorId;
    const items = cart
      .filter((ci) => String(ci.vendorId) === String(vendorId))
      .map((ci) => ({
        productId: ci.item._id || ci.item.id,
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.qty,
      }));

    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // For guest customers, store orders locally
    const localOrder = {
      _id: uid(),
      vendorId,
      customerId,
      customerName: customerName || 'Guest Customer',
      customerPhone,
      items,
      total,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      deliveryAddress: address || userLocation?.address || 'Address not provided',
      paymentMethod: 'CASH'
    };

    try {
      // Try to place order via API if authentication is available
      const token = localStorage.getItem('vendorify_token');
      if (token) {
        const res = await fetch(`${CONFIG.API.BASE_URL}/orders`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            vendorId,
            customerId,
            customerName,
            customerPhone,
            customerLocation: userLocation ? {
              type: 'Point',
              coordinates: [userLocation.lng, userLocation.lat],
              address
            } : null,
            items,
            total,
            paymentMethod: 'CASH'
          })
        });

        if (res.ok) {
          const order = await res.json();
          setOrders(prev => [order, ...prev]);
          clearCart();
          return order;
        }
      }
      
      // Fallback: Store order locally for guest customers
      console.log('Storing order locally for guest customer');
      const existingOrders = JSON.parse(localStorage.getItem('vendorify_customer_orders') || '[]');
      const updatedOrders = [localOrder, ...existingOrders];
      localStorage.setItem('vendorify_customer_orders', JSON.stringify(updatedOrders));
      
      setOrders(prev => [localOrder, ...prev]);
      clearCart();
      return localOrder;
      
    } catch (err) {
      console.error('Place order error:', err);
      
      // Always fallback to local storage for guest customers
      console.log('Storing order locally due to error');
      const existingOrders = JSON.parse(localStorage.getItem('vendorify_customer_orders') || '[]');
      const updatedOrders = [localOrder, ...existingOrders];
      localStorage.setItem('vendorify_customer_orders', JSON.stringify(updatedOrders));
      
      setOrders(prev => [localOrder, ...prev]);
      clearCart();
      return localOrder;
    }
  }, [cart, customerId, userLocation]);

  const updateOrderStatus = useCallback(async ({ orderId, status }) => {
    try {
      const res = await fetch(`${CONFIG.API.BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error('Failed to update order');
      
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error('Update order error:', err);
    }
  }, []);

  const generateWhatsAppOrderLink = (vendorPhone, cartItems, total, vendorName) => {
    const itemsList = cartItems.map(ci => `• ${ci.qty}x ${ci.item.name} - ₹${ci.item.price * ci.qty}`).join('\n');
    const message = `🛒 *New Order Request*\n\n*Vendor:* ${vendorName}\n\n*Items:*\n${itemsList}\n\n*Total:* ₹${total}\n\n📍 Please confirm availability.`;
    return `https://wa.me/${vendorPhone}?text=${encodeURIComponent(message)}`;
  };

  const generateWhatsAppShareLink = (vendor) => {
    const message = `🏪 Check out *${vendor.shopName}* on Vendorify!\n\n⭐ Rating: ${vendor.rating}/5\n📍 ${vendor.address}\n🕐 ${vendor.schedule?.operatingHours || 'Check timings'}\n\n${vendor.isVerified ? '✅ Verified Vendor' : ''}\n\nOrder now on Vendorify!`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const getVendorLocation = (vendorId) => {
    return vendorLocations.get(vendorId) || null;
  };

  // Add missing getVendorAnalytics method
  const getVendorAnalytics = useCallback((vendorId) => {
    const vendorOrders = orders.filter(o => 
      String(o.vendorId) === String(vendorId) || 
      String(o.vendorId?._id) === String(vendorId)
    );

    // Generate hourly data (24 hours)
    const hourlyData = new Array(24).fill(0);
    vendorOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour]++;
    });

    // Calculate revenue by day (last 7 days)
    const dailyRevenue = new Array(7).fill(0);
    const today = new Date();
    vendorOrders.forEach(order => {
      if (order.status === 'COMPLETED' || order.status === 'delivered') {
        const orderDate = new Date(order.createdAt);
        const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < 7) {
          dailyRevenue[6 - daysDiff] += order.total || order.totalAmount || 0;
        }
      }
    });

    // Top selling items
    const itemCounts = {};
    vendorOrders.forEach(order => {
      order.items?.forEach(item => {
        const name = item.name || item.productName;
        if (name) {
          itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
        }
      });
    });

    const topItems = Object.entries(itemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Calculate metrics
    const totalRevenue = vendorOrders
      .filter(o => o.status === 'COMPLETED' || o.status === 'delivered')
      .reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);

    const totalOrders = vendorOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      hourlyData,
      dailyRevenue,
      topItems,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      peakHour: hourlyData.indexOf(Math.max(...hourlyData)),
      conversionRate: 85 // Mock data for now
    };
  }, [orders]);

  // NEW: Navigation functions (REQUIREMENT 1)
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }, []);

  const navigateToVendor = useCallback((vendor, mode = 'walking') => {
    if (!userLocation || !vendor.location) {
      alert('Location information not available');
      return;
    }

    const vendorLat = vendor.location.coordinates ? vendor.location.coordinates[1] : vendor.coordinates?.lat;
    const vendorLng = vendor.location.coordinates ? vendor.location.coordinates[0] : vendor.coordinates?.lng;
    
    if (!vendorLat || !vendorLng) {
      alert('Vendor location not available');
      return;
    }

    const distance = calculateDistance(userLocation.lat, userLocation.lng, vendorLat, vendorLng);
    const distanceText = distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
    
    // Estimate time based on mode
    let timeEstimate = '';
    switch (mode) {
      case 'walking':
        timeEstimate = `${Math.round(distance * 12)} min`; // ~5 km/h
        break;
      case 'bike':
        timeEstimate = `${Math.round(distance * 4)} min`; // ~15 km/h
        break;
      case 'car':
        timeEstimate = `${Math.round(distance * 2)} min`; // ~30 km/h
        break;
      default:
        timeEstimate = `${Math.round(distance * 12)} min`;
    }

    // Show navigation options
    const message = `Navigate to ${vendor.shopName || vendor.vendorName}?\n\nDistance: ${distanceText}\nEstimated time (${mode}): ${timeEstimate}`;
    
    // Use window.confirm to avoid ESLint error
    if (window.confirm(message)) {
      // Try Google Maps first, fallback to OpenStreetMap
      const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${vendorLat},${vendorLng}`;
      const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${userLocation.lat}%2C${userLocation.lng}%3B${vendorLat}%2C${vendorLng}`;
      
      // Try to open Google Maps, fallback to OSM
      try {
        window.open(googleMapsUrl, '_blank');
      } catch (error) {
        console.log('Google Maps failed, trying OpenStreetMap');
        window.open(osmUrl, '_blank');
      }
    }
  }, [userLocation, calculateDistance]);

  const value = {
    vendors,
    orders,
    deals,
    cart,
    cartSummary,
    userLocation,
    loading,
    error,
    geoError,
    geoLoading,
    customerId,
    vendorLocations,
    products,
    vendorDetails,
    fetchVendors,
    fetchNearbyVendors,
    fetchRoamingVendors,
    fetchDeals,
    searchVendors,
    searchItems, // NEW: Item search function (REQUIREMENT 1)
    fetchCustomerOrders,
    getVendorById,
    getVendorMenu,
    getVendorReviews,
    addReview,
    addToCart,
    updateCartQty,
    clearCart,
    placeOrder,
    updateOrderStatus,
    generateWhatsAppOrderLink,
    generateWhatsAppShareLink,
    getVendorLocation,
    refetchLocation,
    getOrdersForVendor,
    fetchVendorData,
    addProduct,
    deleteProduct,
    updateVendorDetails,
    getVendorAnalytics,
    // NEW: Navigation functions (REQUIREMENT 1)
    navigateToVendor,
    calculateDistance,
    socket: socketRef.current
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return ctx;
};
