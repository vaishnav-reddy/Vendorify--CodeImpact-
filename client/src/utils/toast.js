import { toast } from 'react-toastify';

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