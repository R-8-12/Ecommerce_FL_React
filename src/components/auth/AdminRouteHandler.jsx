import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/Admin/useAdminAuth';

// This component handles admin routing logic for the homepage
// - First visit or direct URL access -> redirect to admin dashboard
// - Explicit navigation from admin panel -> allow homepage access
const AdminRouteHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated: isAdminAuth, admin } = useAdminAuthStore();
  const [allowAccess, setAllowAccess] = useState(false);

  useEffect(() => {
    if (isAdminAuth && admin) {
      // Check if this is an explicit navigation from admin panel
      const navigationState = location.state;
      const isExplicitNavigation = navigationState?.fromAdmin === true;
      
      // Also check if the referrer suggests navigation from admin panel
      const referrer = document.referrer;
      const isFromAdminPanel = referrer.includes('/admin/');
      
      // Check sessionStorage for admin navigation flag
      const adminNavigationFlag = sessionStorage.getItem('admin_visiting_homepage');
      
      if (isExplicitNavigation || isFromAdminPanel || adminNavigationFlag) {
        // Allow access to homepage
        setAllowAccess(true);
        // Clear the flag after use
        sessionStorage.removeItem('admin_visiting_homepage');
      } else {
        // First visit or direct URL access - redirect to admin dashboard
        console.log('🔀 Admin first visit - redirecting to admin dashboard');
        navigate('/admin/dashboard', { replace: true });
      }
    } else {
      // Not an admin, allow access
      setAllowAccess(true);
    }
  }, [isAdminAuth, admin, location, navigate]);

  // Show loading while determining access
  if (isAdminAuth && admin && !allowAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
          <p style={{ color: 'var(--text-primary)' }}>Redirecting to admin dashboard...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRouteHandler;
