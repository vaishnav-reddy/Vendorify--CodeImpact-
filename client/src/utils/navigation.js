import { ROLES } from '../constants/roles';

/**
 * Get the dashboard path for a user based on their role
 * @param {string} role - User role (customer, vendor, admin)
 * @returns {string} Dashboard path
 */
export const getDashboardPath = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.VENDOR:
      return '/vendor';
    case ROLES.CUSTOMER:
      return '/customer';
    default:
      return '/customer'; // Default to customer dashboard
  }
};

/**
 * Navigate to the appropriate dashboard based on user role
 * @param {object} navigate - React Router navigate function
 * @param {object} user - User object with role property
 * @param {object} options - Additional options for navigation
 */
export const navigateToDashboard = (navigate, user, options = {}) => {
  // Edge case: No navigate function provided
  if (!navigate || typeof navigate !== 'function') {
    console.error('Navigate function is required for dashboard navigation');
    return;
  }

  // Edge case: No user provided
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('No user provided for navigation, redirecting to home');
    }
    navigate('/');
    return;
  }

  // Edge case: User object exists but no role
  if (!user.role) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('User has no role defined, defaulting to customer dashboard');
    }
    navigate('/customer');
    return;
  }

  // Edge case: Invalid role
  const validRoles = [ROLES.ADMIN, ROLES.VENDOR, ROLES.CUSTOMER];
  if (!validRoles.includes(user.role)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Invalid user role: ${user.role}, defaulting to customer dashboard`);
    }
    navigate('/customer');
    return;
  }
  
  const dashboardPath = getDashboardPath(user.role);
  
  // Add replace option to prevent back navigation to auth pages
  const navigationOptions = {
    replace: true,
    ...options
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Navigating user ${user.name} (${user.role}) to ${dashboardPath}`);
  }
  navigate(dashboardPath, navigationOptions);
};

/**
 * Check if user should be redirected to dashboard (for preventing access to auth pages when logged in)
 * @param {object} user - User object
 * @param {boolean} isAuthenticated - Authentication status
 * @returns {boolean} Whether user should be redirected
 */
export const shouldRedirectToDashboard = (user, isAuthenticated) => {
  return isAuthenticated && user && user.id && user.role;
};