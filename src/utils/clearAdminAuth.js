// Utility to clear admin authentication for testing
export const clearAdminAuth = () => {
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    console.log('✅ Admin authentication cleared from localStorage');
    return true;
  } catch (error) {
    console.error('❌ Error clearing admin auth:', error);
    return false;
  }
};

// Check if admin is currently authenticated
export const checkAdminAuthStatus = () => {
  const token = localStorage.getItem('admin_token');
  const user = localStorage.getItem('admin_user');
  
  console.log('🔍 Admin Auth Status:', {
    hasToken: !!token,
    hasUser: !!user,
    token: token ? token.substring(0, 20) + '...' : null,
    user: user ? JSON.parse(user) : null
  });
  
  return !!(token && user);
};

// For development: Clear auth and reload page
export const devClearAuthAndReload = () => {
  clearAdminAuth();
  window.location.reload();
};
