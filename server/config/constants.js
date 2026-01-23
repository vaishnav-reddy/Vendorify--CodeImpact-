// Server Configuration Constants
const CONFIG = {
  SERVER: {
    PORT: process.env.PORT || 5001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  
  DATABASE: {
    URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vendorify',
    OPTIONS: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },
  
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    REFRESH_EXPIRES_IN: '30d'
  },
  
  BCRYPT: {
    SALT_ROUNDS: 12
  },
  
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000, // Increased from 100 to 1000
    AUTH_MAX_REQUESTS: 50 // Increased from 5 to 50 for login/register endpoints
  },
  
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    UPLOAD_PATH: './uploads',
    SHOP_PHOTOS_PATH: './uploads/shops',
    PRODUCT_PHOTOS_PATH: './uploads/products'
  },
  
  CORS: {
    ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
    CREDENTIALS: true,
    METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization']
  },
  
  SOCKET: {
    CORS: {
      ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
      METHODS: ['GET', 'POST', 'PATCH', 'DELETE']
    },
    TRANSPORTS: ['websocket', 'polling'],
    RECONNECTION_ATTEMPTS: 5,
    RECONNECTION_DELAY: 1000
  },
  
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/
  },
  
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  
  GEOLOCATION: {
    DEFAULT_RADIUS_KM: 5,
    MAX_RADIUS_KM: 50,
    EARTH_RADIUS_KM: 6371
  }
};

const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_VENDOR_ROOM: 'join_vendor_room',
  JOIN_CUSTOMER_ROOM: 'join_customer_room',
  VENDOR_STATUS_UPDATE: 'vendor_status_update',
  ORDER_UPDATE: 'order_update',
  LOCATION_UPDATE: 'location_update',
  NEW_ORDER: 'new_order',
  ORDER_STATUS_CHANGED: 'order_status_changed'
};

const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_PASSWORD: 'Password must be at least 8 characters long',
    INVALID_PHONE: 'Please provide a valid phone number',
    INVALID_COORDINATES: 'Invalid coordinates provided'
  },
  
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email already exists',
    UNAUTHORIZED: 'Unauthorized access',
    TOKEN_EXPIRED: 'Token has expired',
    INVALID_TOKEN: 'Invalid token provided',
    ACCESS_DENIED: 'Access denied'
  },
  
  SERVER: {
    INTERNAL_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database connection error',
    FILE_UPLOAD_ERROR: 'File upload failed',
    INVALID_REQUEST: 'Invalid request format',
    RESOURCE_NOT_FOUND: 'Resource not found'
  },
  
  VENDOR: {
    NOT_FOUND: 'Vendor not found',
    PROFILE_INCOMPLETE: 'Please complete your vendor profile',
    LOCATION_REQUIRED: 'Location is required for vendors'
  },
  
  ORDER: {
    NOT_FOUND: 'Order not found',
    INVALID_STATUS: 'Invalid order status',
    CANNOT_MODIFY: 'Cannot modify this order',
    PAYMENT_FAILED: 'Payment processing failed'
  }
};

const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTER_SUCCESS: 'Registration successful',
    PASSWORD_UPDATED: 'Password updated successfully'
  },
  
  PROFILE: {
    UPDATED: 'Profile updated successfully',
    PHOTO_UPLOADED: 'Photo uploaded successfully'
  },
  
  ORDER: {
    CREATED: 'Order created successfully',
    UPDATED: 'Order updated successfully',
    CANCELLED: 'Order cancelled successfully'
  },
  
  VENDOR: {
    STATUS_UPDATED: 'Vendor status updated',
    LOCATION_UPDATED: 'Location updated successfully',
    PRODUCT_ADDED: 'Product added successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully'
  }
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

module.exports = {
  CONFIG,
  SOCKET_EVENTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS
};