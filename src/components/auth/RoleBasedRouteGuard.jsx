import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuth';
import { useAdminAuthStore } from '../../store/Admin/useAdminAuth';
import { useDeliveryPartnerStore } from '../../store/Delivery/useDeliveryPartnerStore';

const RoleBasedRouteGuard = ({ children, allowedRoles = [], redirectTo = '/', requireAuth = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get authentication states from all stores
  const { isAuthenticated: isCustomerAuth, user } = useAuthStore();
  const { isAuthenticated: isAdminAuth, admin } = useAdminAuthStore();
  const { isAuthenticated: isDeliveryPartnerAuth, partner } = useDeliveryPartnerStore();

  useEffect(() => {
    // Determine current user role
    let currentRole = 'guest';
    let isAuthenticated = false;

    if (isDeliveryPartnerAuth && partner) {
      currentRole = 'delivery_partner';
      isAuthenticated = true;
    } else if (isAdminAuth && admin) {
      currentRole = 'admin';
      isAuthenticated = true;
    } else if (isCustomerAuth && user) {
      currentRole = 'customer';
      isAuthenticated = true;
    }

    console.log('🔐 Role Guard Check:', {
      currentRole,
      isAuthenticated,
      allowedRoles,
      requireAuth,
      currentPath: location.pathname
    });

    // If authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      console.log('🚫 Authentication required but user not authenticated. Redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true, state: { from: location } });
      return;
    }

    // If no roles specified, allow access (public route)
    if (allowedRoles.length === 0) {
      return;
    }

    // Check if current role is allowed
    if (!allowedRoles.includes(currentRole)) {
      console.log('🚫 Access denied for role:', currentRole, 'on path:', location.pathname);
      
      // Role-specific redirects
      if (currentRole === 'delivery_partner') {
        // Delivery partners should only access delivery routes
        if (!location.pathname.startsWith('/delivery/')) {
          navigate('/delivery/dashboard', { replace: true });
          return;
        }
      } else if (currentRole === 'admin') {
        // Admins can access homepage explicitly, but redirect to admin dashboard for other non-admin paths
        if (!location.pathname.startsWith('/admin/') && location.pathname !== '/') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
      } else if (currentRole === 'customer') {
        // Customers accessing admin/delivery routes should be redirected
        if (location.pathname.startsWith('/admin/') || location.pathname.startsWith('/delivery/')) {
          navigate('/', { replace: true });
          return;
        }
      } else if (currentRole === 'guest') {
        // Guest users trying to access protected routes
        console.log('🚫 Guest trying to access protected route. Redirecting to:', redirectTo);
        navigate(redirectTo, { replace: true, state: { from: location } });
        return;
      }
    }
  }, [
    isCustomerAuth, isAdminAuth, isDeliveryPartnerAuth,
    user, admin, partner,
    allowedRoles, requireAuth, location, navigate, redirectTo
  ]);

  // Determine current role for rendering
  let currentRole = 'guest';
  if (isDeliveryPartnerAuth && partner) currentRole = 'delivery_partner';
  else if (isAdminAuth && admin) currentRole = 'admin';
  else if (isCustomerAuth && user) currentRole = 'customer';

  // If no roles specified or role is allowed, render children
  if (allowedRoles.length === 0 || allowedRoles.includes(currentRole)) {
    return children;
  }

  // Role not allowed - show loading/redirect message
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
        <p style={{ color: 'var(--text-primary)' }}>Redirecting...</p>
      </div>
    </div>
  );
};

export default RoleBasedRouteGuard;
