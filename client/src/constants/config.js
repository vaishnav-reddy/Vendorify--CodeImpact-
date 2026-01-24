// Application Configuration Constants
export const CONFIG = {
  API: {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
    SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
  },
  
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },
  
  MAP: {
    DEFAULT_ZOOM: 15,
    MAX_ZOOM: 18,
    MIN_ZOOM: 10,
    DEFAULT_RADIUS_KM: 5,
    MAX_RADIUS_KM: 50,
    TILE_PROVIDERS: {
      PRIMARY: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      FALLBACK: 'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png'
    }
  },
  
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 500,
    PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/
  },
  
  FILE_UPLOAD: {
    MAX_SIZE_MB: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
  },
  
  CACHE: {
    USER_LOCATION_TTL: 300000, // 5 minutes
    VENDOR_DATA_TTL: 60000,    // 1 minute
    SEARCH_RESULTS_TTL: 30000  // 30 seconds
  },
  
  ANIMATION: {
    DURATION: {
      FAST: 200,
      NORMAL: 300,
      SLOW: 500
    },
    EASING: {
      EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      EASE_IN_OUT: 'cubic-bezier(0.645, 0.045, 0.355, 1)'
    }
  }
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  
  VENDORS: {
    LIST: '/vendors',
    PROFILE: '/vendors/profile',
    NEARBY: '/public/vendors/nearby',
    SEARCH: '/public/vendors/search',
    UPLOAD_PHOTO: '/vendors/upload/shop-photo',
    PRODUCTS: '/vendors/products',
    STATS: '/vendors/dashboard/stats',
    TOGGLE_STATUS: '/vendors/dashboard/toggle-status'
  },
  
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders',
    CANCEL: '/orders/cancel'
  },
  
  PUBLIC: {
    HEALTH: '/health',
    VENDORS_NEARBY: '/public/vendors/nearby',
    VENDORS_SEARCH: '/public/vendors/search'
  }
};

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_VENDOR_ROOM: 'join_vendor_room',
  JOIN_CUSTOMER_ROOM: 'join_customer_room',
  VENDOR_STATUS_UPDATE: 'vendor_status_update',
  ORDER_UPDATE: 'order_update',
  LOCATION_UPDATE: 'location_update'
};

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a valid image.',
  LOCATION_DENIED: 'Location access denied. Please enable location services.',
  LOCATION_UNAVAILABLE: 'Location is currently unavailable.'
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  REGISTER: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  FILE_UPLOADED: 'File uploaded successfully!'
};