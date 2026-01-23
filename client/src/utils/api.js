import { authToasts } from './toast';
import { CONFIG, ENDPOINTS, ERROR_MESSAGES } from '../constants/config';

class ApiClient {
  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
    this.timeout = CONFIG.API.TIMEOUT;
  }

  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('vendorify_token');
  }

  // Remove auth data from localStorage
  clearAuth() {
    localStorage.removeItem('vendorify_token');
    localStorage.removeItem('vendorify_user');
  }

  // Create request headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
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

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        this.clearAuth();
        if (data.message?.includes('expired')) {
          authToasts.sessionExpired();
        } else {
          authToasts.unauthorized();
        }
        // Redirect to login page
        window.location.href = '/';
        throw new Error(data.message || ERROR_MESSAGES.UNAUTHORIZED);
      }

      if (response.status === 403) {
        authToasts.unauthorized();
        throw new Error(data.message || ERROR_MESSAGES.UNAUTHORIZED);
      }

      if (response.status === 404 && data.message?.includes('Account not found')) {
        authToasts.userNotFound();
        throw new Error(data.message);
      }

      if (response.status === 401 && data.message?.includes('password')) {
        authToasts.wrongPassword();
        throw new Error(data.message);
      }

      if (response.status === 409 && data.message?.includes('already exists')) {
        authToasts.accountExists();
        throw new Error(data.message);
      }

      if (response.status >= 500) {
        authToasts.serverError();
        throw new Error(data.message || ERROR_MESSAGES.SERVER_ERROR);
      }

      throw new Error(data.message || 'Request failed');
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
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        authToasts.networkError();
        throw new Error(ERROR_MESSAGES.NETWORK);
      }
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Authentication specific methods
  async login(credentials) {
    const data = await this.post(ENDPOINTS.AUTH.LOGIN, credentials, { includeAuth: false });
    if (data.success && data.token) {
      localStorage.setItem('vendorify_token', data.token);
      localStorage.setItem('vendorify_user', JSON.stringify(data.user));
      authToasts.loginSuccess(data.user.name);
    }
    return data;
  }

  async register(userData) {
    const data = await this.post(ENDPOINTS.AUTH.REGISTER, userData, { includeAuth: false });
    if (data.success && data.token) {
      localStorage.setItem('vendorify_token', data.token);
      localStorage.setItem('vendorify_user', JSON.stringify(data.user));
      authToasts.registerSuccess(data.user.name);
    }
    return data;
  }

  async logout() {
    try {
      await this.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearAuth();
      authToasts.logoutSuccess();
    }
  }

  async getCurrentUser() {
    return this.get(ENDPOINTS.AUTH.ME);
  }

  // Vendor specific methods
  async getVendorProfile() {
    return this.get(ENDPOINTS.VENDORS.PROFILE);
  }

  async updateVendorProfile(profileData) {
    return this.put(ENDPOINTS.VENDORS.PROFILE, profileData);
  }

  async updateVendorLocation(locationData) {
    return this.post('/vendors/location', locationData);
  }

  async updateLiveLocation(latitude, longitude) {
    return this.post('/vendors/location/live', { latitude, longitude });
  }

  async getVendorStats() {
    return this.get(ENDPOINTS.VENDORS.STATS);
  }

  async toggleVendorStatus(isOnline) {
    return this.post(ENDPOINTS.VENDORS.TOGGLE_STATUS, { isOnline });
  }

  async uploadShopPhoto(formData) {
    const headers = {};
    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${ENDPOINTS.VENDORS.UPLOAD_PHOTO}`, {
      method: 'POST',
      headers,
      body: formData
    });

    return await this.handleResponse(response);
  }

  async uploadProductImages(formData) {
    const headers = {};
    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/vendors/upload/product-images`, {
      method: 'POST',
      headers,
      body: formData
    });

    return await this.handleResponse(response);
  }

  async getVendorProducts() {
    return this.get(ENDPOINTS.VENDORS.PRODUCTS);
  }

  async addVendorProduct(productData) {
    return this.post(ENDPOINTS.VENDORS.PRODUCTS, productData);
  }

  async deleteVendorProduct(productId) {
    return this.delete(`${ENDPOINTS.VENDORS.PRODUCTS}/${productId}`);
  }

  async generateAIMenu(query) {
    return this.post('/vendors/ai/generate', { query });
  }

  async processVoiceCommand(command, language = 'en') {
    return this.post('/vendors/voice/command', { command, language });
  }

  // Public vendor methods
  async getNearbyVendors(lat, lng, radius = CONFIG.MAP.DEFAULT_RADIUS_KM * 1000, category = 'all') {
    return this.get(`${ENDPOINTS.PUBLIC.VENDORS_NEARBY}?lat=${lat}&lng=${lng}&radius=${radius}&category=${category}`, { includeAuth: false });
  }

  async searchVendors(query, category, lat, lng) {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    if (lat && lng) {
      params.append('lat', lat);
      params.append('lng', lng);
    }
    return this.get(`${ENDPOINTS.PUBLIC.VENDORS_SEARCH}?${params}`, { includeAuth: false });
  }

  // NEW: Item search method (REQUIREMENT 1)
  async searchItems(query, lat, lng) {
    const params = new URLSearchParams({ q: query });
    if (lat && lng) {
      params.append('lat', lat);
      params.append('lng', lng);
    }
    return this.get(`/public/vendors/search/items?${params}`, { includeAuth: false });
  }

  // NEW: Vendor type and verification methods (REQUIREMENT 1 & 2)
  async setVendorType(vendorType) {
    return this.post('/vendors/set-type', { vendorType });
  }

  async uploadVerificationDocument(file, documentType) {
    const formData = new FormData();
    formData.append('verificationDocument', file);
    formData.append('documentType', documentType);

    const token = this.getToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/vendors/upload/verification`, {
      method: 'POST',
      headers,
      body: formData
    });

    return await this.handleResponse(response);
  }

  async getVerificationStatus() {
    return this.get('/vendors/verification-status');
  }

  // NEW: Enhanced location update for roaming vendors (REQUIREMENT 2)
  async updateLiveLocation({ latitude, longitude }) {
    return this.post('/vendors/location/live', { latitude, longitude });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;