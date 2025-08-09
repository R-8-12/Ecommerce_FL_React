import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuth';
import { useAdminAuthStore } from '../../store/Admin/useAdminAuth';
import { useDeliveryPartnerStore } from '../../store/Delivery/useDeliveryPartnerStore';

// Role-based redirect component
const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated: isCustomerAuth, user } = useAuthStore();
  const { isAuthenticated: isAdminAuth, admin } = useAdminAuthStore();
  const { isAuthenticated: isDeliveryPartnerAuth, partner } = useDeliveryPartnerStore();

  useEffect(() => {
    // Redirect based on authentication state
    if (isDeliveryPartnerAuth && partner) {
      navigate('/delivery/dashboard', { replace: true });
    } else if (isAdminAuth && admin) {
      navigate('/admin/dashboard', { replace: true });
    } else if (isCustomerAuth && user) {
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [isCustomerAuth, isAdminAuth, isDeliveryPartnerAuth, user, admin, partner, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
        <p style={{ color: 'var(--text-primary)' }}>Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default RoleBasedRedirect;
