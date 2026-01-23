/**
 * Input validation middleware for API endpoints
 * Provides common validation patterns and sanitization
 */

const Logger = require('../utils/logger');

// Common validation patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  mobile: /^[6-9]\d{9}$/,
  objectId: /^[0-9a-fA-F]{24}$/,
  coordinates: /^-?\d+\.?\d*$/
};

// Sanitize input by removing potentially harmful characters
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

// Validate email format
const validateEmail = (email) => {
  return email && VALIDATION_PATTERNS.email.test(email);
};

// Validate mobile number (Indian format)
const validateMobile = (mobile) => {
  return mobile && VALIDATION_PATTERNS.mobile.test(mobile);
};

// Validate ObjectId format
const validateObjectId = (id) => {
  return id && VALIDATION_PATTERNS.objectId.test(id);
};

// Validate coordinates
const validateCoordinates = (lat, lng) => {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  return !isNaN(latNum) && !isNaN(lngNum) && 
         latNum >= -90 && latNum <= 90 && 
         lngNum >= -180 && lngNum <= 180;
};

// Generic validation middleware factory
const createValidator = (validationRules) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const rule of validationRules) {
      const { field, required, type, min, max, pattern, custom } = rule;
      const value = req.body[field];
      
      // Check required fields
      if (required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip validation if field is not required and not provided
      if (!required && (!value || (typeof value === 'string' && !value.trim()))) {
        continue;
      }
      
      // Type validation
      if (type && typeof value !== type) {
        errors.push(`${field} must be of type ${type}`);
        continue;
      }
      
      // String length validation
      if (type === 'string' && value) {
        if (min && value.length < min) {
          errors.push(`${field} must be at least ${min} characters long`);
        }
        if (max && value.length > max) {
          errors.push(`${field} must be no more than ${max} characters long`);
        }
      }
      
      // Number range validation
      if (type === 'number' && value !== undefined) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          errors.push(`${field} must be a valid number`);
        } else {
          if (min !== undefined && numValue < min) {
            errors.push(`${field} must be at least ${min}`);
          }
          if (max !== undefined && numValue > max) {
            errors.push(`${field} must be no more than ${max}`);
          }
        }
      }
      
      // Pattern validation
      if (pattern && value && !pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
      
      // Custom validation
      if (custom && value) {
        const customError = custom(value);
        if (customError) {
          errors.push(customError);
        }
      }
      
      // Sanitize string values
      if (type === 'string' && value) {
        req.body[field] = sanitizeString(value);
      }
    }
    
    if (errors.length > 0) {
      Logger.warn('Validation failed:', { errors, body: req.body });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Pre-defined validation rules for common endpoints
const authValidation = {
  register: createValidator([
    { field: 'name', required: true, type: 'string', min: 2, max: 50 },
    { field: 'email', required: false, type: 'string', pattern: VALIDATION_PATTERNS.email },
    { field: 'mobile', required: false, type: 'string', pattern: VALIDATION_PATTERNS.mobile },
    { field: 'password', required: true, type: 'string', min: 6, max: 128 },
    { field: 'role', required: false, type: 'string', custom: (value) => {
      const validRoles = ['customer', 'vendor', 'admin'];
      return validRoles.includes(value) ? null : 'Invalid role specified';
    }},
    { field: 'shopName', required: false, type: 'string', min: 2, max: 100 }
  ]),
  
  login: createValidator([
    { field: 'email', required: false, type: 'string', pattern: VALIDATION_PATTERNS.email },
    { field: 'mobile', required: false, type: 'string', pattern: VALIDATION_PATTERNS.mobile },
    { field: 'password', required: true, type: 'string', min: 1 }
  ])
};

const vendorValidation = {
  updateProfile: createValidator([
    { field: 'shopName', required: false, type: 'string', min: 2, max: 100 },
    { field: 'ownerName', required: false, type: 'string', min: 2, max: 50 },
    { field: 'phone', required: false, type: 'string', min: 10, max: 15 },
    { field: 'email', required: false, type: 'string', pattern: VALIDATION_PATTERNS.email },
    { field: 'address', required: false, type: 'string', min: 5, max: 200 },
    { field: 'category', required: false, type: 'string', custom: (value) => {
      const validCategories = ['food', 'beverages', 'fruits', 'grocery', 'fashion', 'electronics', 'services', 'other'];
      return validCategories.includes(value) ? null : 'Invalid category specified';
    }}
  ]),
  
  updateLocation: createValidator([
    { field: 'address', required: true, type: 'string', min: 5, max: 200 },
    { field: 'coordinates', required: false, type: 'object' }
  ]),
  
  addProduct: createValidator([
    { field: 'name', required: true, type: 'string', min: 2, max: 100 },
    { field: 'description', required: false, type: 'string', max: 500 },
    { field: 'price', required: true, type: 'number', min: 0.01, max: 10000 },
    { field: 'category', required: false, type: 'string', min: 2, max: 50 },
    { field: 'calories', required: false, type: 'string', max: 20 },
    { field: 'ingredients', required: false, type: 'object' }
  ])
};

const orderValidation = {
  createOrder: createValidator([
    { field: 'vendorId', required: true, type: 'string', pattern: VALIDATION_PATTERNS.objectId },
    { field: 'items', required: true, type: 'object' },
    { field: 'totalAmount', required: true, type: 'number', min: 0.01 },
    { field: 'deliveryAddress', required: true, type: 'string', min: 10, max: 200 }
  ]),
  
  updateStatus: createValidator([
    { field: 'status', required: true, type: 'string', custom: (value) => {
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
      return validStatuses.includes(value) ? null : 'Invalid order status';
    }}
  ])
};

// Rate limiting validation
const rateLimitValidation = (req, res, next) => {
  // Basic rate limiting check (can be enhanced with Redis)
  const userKey = req.user?.id || req.ip;
  const now = Date.now();
  
  if (!req.rateLimitStore) {
    req.rateLimitStore = new Map();
  }
  
  const userRequests = req.rateLimitStore.get(userKey) || [];
  const recentRequests = userRequests.filter(time => now - time < 300000); // 5 minute window (increased from 1 minute)
  
  if (recentRequests.length >= 50) { // 50 requests per 5 minutes (reduced from 100 per minute)
    Logger.warn('Rate limit exceeded:', { userKey, requestCount: recentRequests.length });
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
  
  recentRequests.push(now);
  req.rateLimitStore.set(userKey, recentRequests);
  
  next();
};

module.exports = {
  createValidator,
  authValidation,
  vendorValidation,
  orderValidation,
  rateLimitValidation,
  validateEmail,
  validateMobile,
  validateObjectId,
  validateCoordinates,
  sanitizeString
};