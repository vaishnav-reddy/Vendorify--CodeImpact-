import { toast } from 'react-toastify';

export const showToast = {
  success: (message) => toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  error: (message) => toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  info: (message) => toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  warning: (message) => toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  })
};

// Enhanced toast messages for specific actions (REQUIREMENT 7)
export const vendorToasts = {
  locationUpdated: () => showToast.success('Location updated successfully'),
  locationPermissionDenied: () => showToast.error('Location permission denied. Please enable location access.'),
  itemAdded: (itemName) => showToast.success(`${itemName} added successfully`),
  vendorTypeChanged: (type) => showToast.success(`Vendor type set to ${type}`),
  verificationUploaded: (docType) => showToast.success(`${docType} document uploaded successfully`),
  onlineStatusChanged: (isOnline) => showToast.info(`Shop is now ${isOnline ? 'online' : 'offline'}`),
};

export const customerToasts = {
  itemFound: (count) => showToast.success(`Found ${count} item${count !== 1 ? 's' : ''}`),
  navigationStarted: (vendorName) => showToast.info(`Opening navigation to ${vendorName}`),
  locationPermissionDenied: () => showToast.error('Location permission denied. Navigation may not work properly.'),
  orderPlaced: () => showToast.success('Order placed successfully!'),
};

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Success toasts
export const showSuccessToast = (message) => {
  toast.success(message, {
    ...toastConfig,
    className: 'bg-green-50 text-green-800 border border-green-200',
  });
};

// Error toasts
export const showErrorToast = (message) => {
  toast.error(message, {
    ...toastConfig,
    className: 'bg-red-50 text-red-800 border border-red-200',
  });
};

// Info toasts
export const showInfoToast = (message) => {
  toast.info(message, {
    ...toastConfig,
    className: 'bg-blue-50 text-blue-800 border border-blue-200',
  });
};

// Warning toasts
export const showWarningToast = (message) => {
  toast.warn(message, {
    ...toastConfig,
    className: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  });
};

// Authentication specific toasts
export const authToasts = {
  loginSuccess: (name) => showSuccessToast(`Welcome back, ${name}! Login successful 👋`),
  registerSuccess: (name) => showSuccessToast(`Welcome to Vendorify, ${name}! Account created successfully 🎉`),
  logoutSuccess: () => showSuccessToast('You have been logged out successfully 🚪'),
  wrongPassword: () => showErrorToast('Incorrect password. Please try again.'),
  userNotFound: () => showErrorToast('Account not found. Please sign up first.'),
  unauthorized: () => showErrorToast('You are not authorized to access this page.'),
  sessionExpired: () => showWarningToast('Your session has expired. Please login again.'),
  accountExists: () => showErrorToast('An account with this email already exists.'),
  invalidEmail: () => showErrorToast('Please provide a valid email address.'),
  weakPassword: () => showErrorToast('Password must be at least 6 characters long.'),
  serverError: () => showErrorToast('Server error. Please try again later.'),
  networkError: () => showErrorToast('Network error. Please check your connection.'),
};