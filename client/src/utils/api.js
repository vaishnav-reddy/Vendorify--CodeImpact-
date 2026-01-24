import { authToasts } from "./toast";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem("vendorify_token");
  }

  // Remove auth data from localStorage
  clearAuth() {
    localStorage.removeItem("vendorify_token");
    localStorage.removeItem("vendorify_user");
    localStorage.removeItem("vendorify_refresh_token");
    // Clear any other auth-related data that might exist
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vendorify_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Create request headers
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Handle API responses
  async handleResponse(response) {
    const data = await response.json();

    // FIXED: Log network requests in development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 ${response.url.split('/').pop()} - ${response.url} - ${response.status} - ${response.ok ? 'Success' : data.message}`);
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401 && data.message?.includes("password")) {
        authToasts.wrongPassword();
        throw new Error(data.message);
      }

      if (response.status === 401) {
        this.clearAuth();
        if (data.message?.includes("expired")) {
          authToasts.sessionExpired();
        } else {
          authToasts.unauthorized();
        }
        // Redirect to login page
        window.location.href = "/";
        throw new Error(data.message || "Unauthorized");
      }

      if (response.status === 403) {
        authToasts.unauthorized();
        throw new Error(data.message || "Forbidden");
      }

      if (
        response.status === 404 &&
        data.message?.includes("Account not found")
      ) {
        authToasts.userNotFound();
        throw new Error(data.message);
      }

      if (response.status === 409 && data.message?.includes("already exists")) {
        authToasts.accountExists();
        throw new Error(data.message);
      }

      if (response.status >= 500) {
        authToasts.serverError();
        throw new Error(data.message || "Server error");
      }

      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        authToasts.networkError();
        throw new Error("Network error. Please check your connection.");
      }
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // Authentication specific methods
  async login(credentials) {
    const data = await this.post("/auth/login", credentials, {
      includeAuth: false,
    });
    if (data.success && data.token) {
      localStorage.setItem("vendorify_token", data.token);
      localStorage.setItem("vendorify_user", JSON.stringify(data.user));
      authToasts.loginSuccess(data.user.name);
    }
    return data;
  }

  async register(userData) {
    const data = await this.post("/auth/register", userData, {
      includeAuth: false,
    });
    if (data.success && data.token) {
      localStorage.setItem("vendorify_token", data.token);
      localStorage.setItem("vendorify_user", JSON.stringify(data.user));
      authToasts.registerSuccess(data.user.name);
    }
    return data;
  }

  async logout() {
    try {
      await this.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
      if (process.env.NODE_ENV === 'development') {
        console.warn("Logout API call failed:", error);
      }
    } finally {
      this.clearAuth();
      authToasts.logoutSuccess();
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.get("/auth/me");
      return response;
    } catch (error) {
      // If getCurrentUser fails, it means the token is invalid
      if (process.env.NODE_ENV === 'development') {
        console.debug('getCurrentUser failed, clearing auth data:', error.message);
      }
      this.clearAuth();
      throw error;
    }
  }

  // Test if current token is valid
  async testToken() {
    const token = this.getToken();
    if (!token) {
      return { valid: false, reason: 'No token found' };
    }

    try {
      const response = await this.getCurrentUser();
      return { valid: true, user: response.user };
    } catch (error) {
      // If it's a network error (server not reachable), don't clear auth
      if (error.message.includes('Network error') || error.message.includes('fetch')) {
        return { valid: false, reason: 'Server unreachable', networkError: true };
      }
      // Otherwise, it's an auth error, clear the token
      this.clearAuth();
      return { valid: false, reason: error.message };
    }
  }

  // Vendor-specific API methods
  async getVendorProfile() {
    return this.get('/vendors/profile');
  }

  async getVendorStats() {
    return this.get('/vendors/dashboard/stats');
  }

  async updateVendorProfile(profileData) {
    return this.put('/vendors/profile', profileData);
  }

  async toggleVendorStatus(isOnline) {
    return this.post('/vendors/dashboard/toggle-status', { isOnline });
  }

  async uploadShopPhoto(formData) {
    return this.request('/vendors/upload/shop-photo', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
  }

  async addVendorProduct(productData) {
    const response = await this.post('/vendors/products', productData);
    // FIXED: Handle new response format
    return response.success ? response.product : response;
  }

  async getVendorProducts() {
    const response = await this.get('/vendors/products');
    // FIXED: Handle new response format
    return response.success ? response.products : response;
  }

  async deleteVendorProduct(productId) {
    return this.delete(`/vendors/products/${productId}`);
  }

  async updateLiveLocation(latitude, longitude) {
    return this.post('/vendors/location/live', { latitude, longitude });
  }

  // Camera and photo utilities
  async capturePhotoFromCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        video.srcObject = stream;
        video.play();
        
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Capture after 1 second to allow camera to adjust
          setTimeout(() => {
            context.drawImage(video, 0, 0);
            
            // Stop the stream
            stream.getTracks().forEach(track => track.stop());
            
            // Convert to blob
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to capture photo'));
              }
            }, 'image/jpeg', 0.8);
          }, 1000);
        };
        
        video.onerror = () => {
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('Camera access failed'));
        };
      });
    } catch (error) {
      throw new Error(`Camera access denied: ${error.message}`);
    }
  }

  // Convert coordinates to readable address
  async getReadableLocation(latitude, longitude) {
    try {
      const locationData = await this.reverseGeocode(latitude, longitude);
      
      if (locationData.rateLimited) {
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      
      // Create a readable address from the geocoding data
      const parts = [];
      if (locationData.place && locationData.place !== 'Unknown Area') {
        parts.push(locationData.place);
      }
      if (locationData.district && locationData.district !== 'Unknown District') {
        parts.push(locationData.district);
      }
      if (locationData.state && locationData.state !== 'Unknown State') {
        parts.push(locationData.state);
      }
      
      return parts.length > 0 ? parts.join(', ') : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Failed to get readable location:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  // Utility function to construct proper image URLs with cache busting
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Use HTTP (not HTTPS) for localhost to avoid mixed content issues
    const serverPort = '5001';
    const hostname = window.location.hostname;
    
    // Add timestamp to prevent caching issues
    const timestamp = Date.now();
    return `http://${hostname}:${serverPort}${imagePath}?t=${timestamp}`;
  }

  // Reverse geocoding using backend proxy to OpenStreetMap Nominatim
  async reverseGeocode(lat, lon) {
    try {
      const response = await this.get(
        `/public/vendors/reverse-geocode?lat=${lat}&lon=${lon}`,
      );

      // Handle the rate limit response format from the server
      if (
        response.success === false &&
        response.message?.includes("Too many requests")
      ) {
        return {
          place: "Service temporarily unavailable",
          district: "Please try again later",
          state: "Rate limit exceeded",
          country: "India",
          fullAddress: "Location service temporarily unavailable",
          rateLimited: true,
        };
      }

      return response;
    } catch (error) {
      console.error("Reverse geocoding error:", error);

      // Check if it's a rate limit error
      if (
        error.message?.includes("Too many requests") ||
        error.message?.includes("429")
      ) {
        return {
          place: "Service temporarily unavailable",
          district: "Please try again later",
          state: "Rate limit exceeded",
          country: "India",
          fullAddress: "Location service temporarily unavailable",
          rateLimited: true,
        };
      }

      return {
        place: "Unknown Area",
        district: "Unknown District",
        state: "Unknown State",
        country: "Unknown Country",
        fullAddress: "Location unavailable",
      };
    }
  }

  // Public vendor methods
  async getNearbyVendors(lat, lng, radius = 5000, category = 'all') {
    return this.get(`/public/vendors/nearby?lat=${lat}&lng=${lng}&radius=${radius}&category=${category}`, { includeAuth: false });
  }

  async searchVendors(query, category, lat, lng) {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    if (lat && lng) {
      params.append('lat', lat);
      params.append('lng', lng);
    }
    return this.get(`/public/vendors/search?${params}`, { includeAuth: false });
  }

  async getRoamingVendors(lat, lng) {
    let url = '/public/vendors/roaming';
    if (lat && lng) {
      url += `?lat=${lat}&lng=${lng}`;
    }
    return this.get(url, { includeAuth: false });
  }

  async getVendorById(vendorId) {
    return this.get(`/public/vendors/${vendorId}`, { includeAuth: false });
  }

  async getVendorMenu(vendorId) {
    return this.get(`/public/vendors/${vendorId}/menu`, { includeAuth: false });
  }

  async getVendorReviews(vendorId) {
    return this.get(`/public/vendors/${vendorId}/reviews`, { includeAuth: false });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;