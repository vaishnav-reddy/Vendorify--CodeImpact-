import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useGeolocation } from "../hooks/useGeolocation";
import api from "../utils/api";
import { CONFIG } from "../constants/config";

const AppDataContext = createContext(null);

const uid = () => `ORD-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const getCustomerId = () => {
  let id = localStorage.getItem("vendorify_customer_id");
  if (!id) {
    id = `CUST-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    localStorage.setItem("vendorify_customer_id", id);
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
    const saved = localStorage.getItem("vendorify_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [userLocation, setUserLocation] = useState(null);
  const [vendorLocations, setVendorLocations] = useState(new Map());
  const [products, setProducts] = useState([]);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  /* ✅ NEW: CUSTOMER PROFILE STATE */
  const [customerProfile, setCustomerProfile] = useState(null);

  const socketRef = useRef(null);
  const customerId = getCustomerId();

  /* -------------------- SOCKET -------------------- */
  useEffect(() => {
    socketRef.current = io(CONFIG.API.SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join_customer_room", customerId);
      socketRef.current.emit("get_all_vendor_locations");
    });

    socketRef.current.on("vendor_moved", (data) => {
      setVendorLocations((prev) => {
        const map = new Map(prev);
        map.set(data.vendorId, {
          lat: data.lat,
          lng: data.lng,
          currentStop: data.currentStop,
        });
        return map;
      });

      setVendors((prev) =>
        prev.map((v) =>
          v._id === data.vendorId
            ? {
                ...v,
                location: {
                  type: "Point",
                  coordinates: [data.lng, data.lat],
                },
                schedule: { ...v.schedule, currentStop: data.currentStop },
              }
            : v,
        ),
      );
    });

    socketRef.current.on("vendor_status_changed", (data) => {
      setVendors((prev) =>
        prev.map((v) =>
          v._id === data.vendorId ? { ...v, isOnline: data.isOnline } : v,
        ),
      );
    });

    socketRef.current.on("all_vendor_locations", (locations) => {
      const map = new Map();
      locations.forEach((loc) => {
        map.set(loc.vendorId, {
          lat: loc.lat,
          lng: loc.lng,
          currentStop: loc.currentStop,
        });
      });
      setVendorLocations(map);
    });

    socketRef.current.on("order_status_update", (data) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === data.orderId ? { ...o, status: data.status } : o,
        ),
      );
    });

    socketRef.current.on("new_order", (order) => {
      setOrders((prev) => [order, ...prev]);
    });

    return () => socketRef.current?.disconnect();
  }, [customerId]);

  /* -------------------- GEOLOCATION -------------------- */
  const handleLocationUpdate = useCallback(
    (location) => {
      setUserLocation(location);
      socketRef.current?.emit("customer_location", {
        customerId,
        lat: location.lat,
        lng: location.lng,
      });
    },
    [customerId],
  );

  const {
    error: geoError,
    loading: geoLoading,
    refetch: refetchLocation,
  } = useGeolocation(handleLocationUpdate, 30000);

  /* Reverse Geocoding */
  useEffect(() => {
    if (!userLocation) return;

    const fetchLocationDetails = async () => {
      setLoadingLocation(true);
      try {
        const details = await api.reverseGeocode(
          userLocation.lat,
          userLocation.lng,
        );
        setLocationDetails(details);
      } catch (err) {
        setLocationDetails({
          place: "Unknown Area",
          district: "Unknown District",
          state: "Unknown State",
          country: "India",
          rateLimited: true,
        });
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchLocationDetails();
  }, [userLocation]);

  /* -------------------- CUSTOMER PROFILE (NEW) -------------------- */
  const fetchOrCreateCustomerProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("vendorify_token");
      const res = await fetch(`${CONFIG.API.BASE_URL}/customers/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setCustomerProfile(data);
        return data;
      }

      if (res.status === 404) {
        const createRes = await fetch(`${CONFIG.API.BASE_URL}/customers/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            customerId,
            name: "Customer",
          }),
        });

        if (!createRes.ok) throw new Error("Profile create failed");
        const created = await createRes.json();
        setCustomerProfile(created);
        return created;
      }
    } catch (err) {
      console.error("Customer profile error:", err);
      return null;
    }
  }, [customerId]);

  const updateCustomerProfile = useCallback(async (updates) => {
    try {
      const token = localStorage.getItem("vendorify_token");
      const res = await fetch(`${CONFIG.API.BASE_URL}/customers/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Profile update failed");
      const updated = await res.json();
      setCustomerProfile(updated);
      return updated;
    } catch (err) {
      console.error("Update profile error:", err);
      return null;
    }
  }, []);

  /* -------------------- API HELPERS -------------------- */
  const fetchVendors = useCallback(async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Fetching vendors...');
      }
      setLoading(true);
      
      // First check if server is reachable
      try {
        const healthCheck = await fetch(`${CONFIG.API.BASE_URL}/health`);
        if (!healthCheck.ok) {
          throw new Error('Server health check failed');
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Server health check passed');
        }
      } catch (healthError) {
        throw new Error('Server is not reachable. Please check if the backend is running.');
      }
      
      let url = `${CONFIG.API.BASE_URL}/public/vendors/all`;
      if (userLocation) {
        url += `?lat=${userLocation.lat}&lng=${userLocation.lng}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('📍 User location available:', userLocation);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ No user location available');
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('📡 API URL:', url);
      }
      const res = await fetch(url);
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Response status:', res.status);
      }
      
      if (!res.ok) throw new Error(`Failed to fetch vendors: ${res.status} ${res.statusText}`);
      const data = await res.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Raw vendors fetched:', data.length);
        console.log('📋 Sample vendor data:', data[0]);
      }

      const processedVendors = data.map((v) => {
        const processed = {
          ...v,
          coordinates: v.location?.coordinates
            ? {
                lat: v.location.coordinates[1],
                lng: v.location.coordinates[0],
              }
            : null,
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Processed vendor:', {
            name: processed.shopName,
            originalLocation: v.location,
            processedCoordinates: processed.coordinates
          });
        }
        
        return processed;
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Processed vendors:', processedVendors.length);
        console.log('📍 Vendors with coordinates:', processedVendors.filter(v => v.coordinates).length);
      }

      setVendors(processedVendors);
      setError(null);
    } catch (err) {
      console.error('❌ Fetch vendors error:', err);
      setError(err.message);
      // Set empty vendors array to stop infinite loading
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  // Fetch vendors on mount and when location changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Use setLoading with a function to avoid dependency on loading state
      setLoading(currentLoading => {
        if (currentLoading) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Fetch vendors timeout - stopping loading state');
          }
          setError('Request timeout - please try again');
          return false;
        }
        return currentLoading;
      });
    }, 10000); // 10 second timeout

    fetchVendors().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [fetchVendors]);

  const searchVendors = useCallback(async (query, category) => {
    try {
      const results = await api.searchVendors(query, category, userLocation?.lat, userLocation?.lng);
      return results;
    } catch (err) {
      console.error('Search vendors error:', err);
      return [];
    }
  }, [userLocation]);

  const fetchRoamingVendors = useCallback(async () => {
    try {
      const results = await api.getRoamingVendors(userLocation?.lat, userLocation?.lng);
      return results;
    } catch (err) {
      console.error('Fetch roaming vendors error:', err);
      return [];
    }
  }, [userLocation]);

  const fetchDeals = useCallback(async () => {
    try {
      console.log('🔄 Fetching deals...');
      const res = await fetch(`${CONFIG.API.BASE_URL}/public/vendors/deals`);
      console.log('📊 Deals response status:', res.status);
      
      if (!res.ok) {
        console.warn('⚠️ Deals fetch failed:', res.status, res.statusText);
        return [];
      }
      
      const data = await res.json();
      console.log('✅ Deals fetched:', data.length);
      setDeals(data);
      return data;
    } catch (err) {
      console.error('❌ Fetch deals error:', err);
      return [];
    }
  }, []);

  // Fetch deals on mount
  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const fetchCustomerOrders = useCallback(async () => {
    const res = await fetch(
      `${CONFIG.API.BASE_URL}/orders/customer/${customerId}`,
    );
    const data = await res.json();
    setOrders(data);
    return data;
  }, [customerId]);

  /* -------------------- CART -------------------- */
  useEffect(() => {
    localStorage.setItem("vendorify_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = ({ vendorId, item }) => {
    setCart((prev) => {
      const found = prev.find(
        (ci) =>
          String(ci.vendorId) === String(vendorId) &&
          String(ci.item._id || ci.item.id) ===
            String(item._id || item.id),
      );
      return found
        ? prev.map((ci) =>
            ci === found ? { ...ci, qty: ci.qty + 1 } : ci,
          )
        : [...prev, { vendorId, item, qty: 1 }];
    });
  };

  const updateCartQty = ({ vendorId, itemId, qty }) => {
    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter(
          (ci) =>
            !(String(ci.vendorId) === String(vendorId) &&
              String(ci.item._id || ci.item.id) === String(itemId))
        );
      }
      return prev.map((ci) =>
        String(ci.vendorId) === String(vendorId) &&
        String(ci.item._id || ci.item.id) === String(itemId)
          ? { ...ci, qty }
          : ci
      );
    });
  };

  const clearCart = () => setCart([]);

  const cartSummary = useMemo(() => {
    const total = cart.reduce(
      (s, c) => s + (c.item.price || 0) * c.qty,
      0,
    );
    const itemCount = cart.reduce((s, c) => s + c.qty, 0);
    return { total, itemCount, vendorId: cart[0]?.vendorId || null };
  }, [cart]);

  const placeOrder = useCallback(async (orderData) => {
    try {
      const order = {
        _id: uid(),
        customerId,
        vendorId: cartSummary.vendorId,
        items: cart,
        total: cartSummary.total,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        ...orderData
      };
      
      setOrders(prev => [order, ...prev]);
      clearCart();
      return order;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }, [customerId, cartSummary, cart]);

  const getOrdersForCustomer = useCallback(() => {
    return orders.filter(order => 
      String(order.customerId) === String(customerId)
    );
  }, [orders, customerId]);

  /* -------------------- HELPER FUNCTIONS -------------------- */
  const getVendorById = useCallback((vendorId) => {
    if (!vendorId || !Array.isArray(vendors)) return null;
    return vendors.find(vendor => 
      String(vendor._id) === String(vendorId) || 
      String(vendor.id) === String(vendorId)
    ) || null;
  }, [vendors]);

  const fetchVendorById = useCallback(async (vendorId) => {
    try {
      const vendor = await api.getVendorById(vendorId);
      return vendor;
    } catch (error) {
      console.error('Error fetching vendor by ID:', error);
      return null;
    }
  }, []);

  const getVendorMenu = useCallback(async (vendorId) => {
    try {
      const menu = await api.getVendorMenu(vendorId);
      return menu;
    } catch (error) {
      console.error('Error fetching vendor menu:', error);
      return [];
    }
  }, []);

  const getVendorReviews = useCallback(async (vendorId) => {
    try {
      const reviews = await api.getVendorReviews(vendorId);
      return reviews;
    } catch (error) {
      console.error('Error fetching vendor reviews:', error);
      return [];
    }
  }, []);

  const getVendorLocation = useCallback((vendorId) => {
    return vendorLocations.get(vendorId) || null;
  }, [vendorLocations]);

  const generateWhatsAppOrderLink = useCallback((phone, cartItems, total, shopName) => {
    const itemsList = cartItems.map(item => 
      `${item.qty}x ${item.item.name} - ₹${item.item.price * item.qty}`
    ).join('\n');
    
    const message = `Hello ${shopName}! I'd like to place an order:\n\n${itemsList}\n\nTotal: ₹${total}\n\nPlease confirm availability and delivery details.`;
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  }, []);

  const generateWhatsAppShareLink = useCallback((vendor) => {
    const message = `Check out ${vendor.shopName}! ${vendor.description || 'Great food vendor'}\n\nLocation: ${vendor.address}\nRating: ${vendor.rating || 'New'} ⭐\n\nOrder now: ${window.location.origin}/customer/vendor/${vendor._id}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, []);

  const addReview = useCallback(async (reviewData) => {
    try {
      const response = await api.post(`/public/vendors/${reviewData.vendorId}/reviews`, {
        customerId,
        customerName: reviewData.customerName,
        rating: reviewData.rating,
        text: reviewData.text
      }, { includeAuth: false });
      return response;
    } catch (error) {
      console.error('Error adding review:', error);
      return null;
    }
  }, [customerId]);

  const getOrdersForVendor = useCallback((vendorId) => {
    if (!vendorId || !Array.isArray(orders)) return [];
    return orders.filter(order => 
      String(order.vendorId) === String(vendorId) || 
      String(order.vendorId?._id) === String(vendorId)
    );
  }, [orders]);

  const addProduct = useCallback(async (productData) => {
    try {
      // Make API call to add product
      const response = await api.addVendorProduct(productData);
      
      if (response && response._id) {
        // Add to local state
        setProducts(prev => [...(prev || []), response]);
        return response;
      } else {
        console.error('Failed to add product:', response);
        return null;
      }
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  }, []);

  const deleteProduct = useCallback(async (productId) => {
    try {
      // Make API call to delete product
      await api.deleteVendorProduct(productId);
      
      // Remove from local state
      setProducts(prev => (prev || []).filter(p => p._id !== productId && p.id !== productId));
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }, []);

  const updateVendorDetails = useCallback(async (details) => {
    try {
      // Update vendor profile via API
      const response = await api.updateVendorProfile(details);
      
      if (response.success) {
        setVendorDetails(response.vendor);
        return response.vendor;
      } else {
        console.error('Failed to update vendor details:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error updating vendor details:', error);
      return null;
    }
  }, []);

  const fetchVendorData = useCallback(async (vendorId) => {
    try {
      console.log('Fetching vendor data for:', vendorId);
      
      // Fetch vendor profile and products
      const [profileResponse, productsResponse] = await Promise.all([
        api.getVendorProfile(),
        api.getVendorProducts()
      ]);
      
      if (profileResponse && profileResponse.success !== false) {
        setVendorDetails(profileResponse);
      }
      
      if (productsResponse && Array.isArray(productsResponse)) {
        setProducts(productsResponse);
      }
      
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      // Set empty defaults if fetch fails
      setProducts([]);
      setVendorDetails(null);
    }
  }, []);
  /* -------------------- ANALYTICS -------------------- */
  const getVendorAnalytics = useCallback(
    (vendorId) => {
      const vendorOrders = (orders || []).filter(
        (o) =>
          String(o.vendorId) === String(vendorId) ||
          String(o.vendorId?._id) === String(vendorId),
      );

      const hourlyData = new Array(24).fill(0);
      vendorOrders.forEach((o) =>
        hourlyData[new Date(o.createdAt).getHours()]++,
      );

      const totalRevenue = vendorOrders
        .filter((o) => o.status === "COMPLETED")
        .reduce((s, o) => s + (o.total || 0), 0);

      return {
        hourlyData,
        totalOrders: vendorOrders.length,
        totalRevenue,
      };
    },
    [orders],
  );

  /* -------------------- PROVIDER -------------------- */
  const value = {
    vendors: vendors || [],
    orders: orders || [],
    deals: deals || [],
    cart: cart || [],
    cartSummary,
    userLocation,
    locationDetails,
    loadingLocation,
    loading,
    error,
    geoError,
    geoLoading,
    customerId,
    customerProfile, // ✅ NEW
    vendorLocations,
    products: products || [],
    vendorDetails,
    fetchVendors,
    fetchDeals,
    fetchCustomerOrders,
    fetchOrCreateCustomerProfile, // ✅ NEW
    updateCustomerProfile, // ✅ NEW
    searchVendors, // ✅ NEW
    fetchRoamingVendors, // ✅ NEW
    getVendorById, // ✅ Synchronous version
    fetchVendorById, // ✅ Asynchronous version
    getVendorMenu, // ✅ NEW
    getVendorReviews, // ✅ NEW
    getVendorLocation, // ✅ NEW
    generateWhatsAppOrderLink, // ✅ NEW
    generateWhatsAppShareLink, // ✅ NEW
    addReview, // ✅ NEW
    getOrdersForVendor, // ✅ NEW
    getOrdersForCustomer, // ✅ NEW
    addProduct, // ✅ NEW
    deleteProduct, // ✅ NEW
    updateVendorDetails, // ✅ NEW
    fetchVendorData, // ✅ NEW
    addToCart,
    updateCartQty, // ✅ NEW
    clearCart,
    placeOrder, // ✅ NEW
    getVendorAnalytics,
    refetchLocation,
    socket: socketRef.current,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
};