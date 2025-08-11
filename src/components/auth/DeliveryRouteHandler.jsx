import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDeliveryPartnerStore } from '../../store/Delivery/useDeliveryPartnerStore';
import useFrontendCacheStore from '../../store/useFrontendCacheStore';

const DeliveryRouteHandler = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, partner } = useDeliveryPartnerStore();
  const { initializeCacheWithContext } = useFrontendCacheStore();

  // Initialize delivery-specific cache on mount
  useEffect(() => {
    const initializeDeliveryCache = async () => {
      try {
        console.log('🚚 Initializing delivery partner context cache...');
        // Initialize cache without requiring authentication for theme loading
        await initializeCacheWithContext('delivery');
        console.log('✅ Delivery partner cache initialized');
      } catch (error) {
        console.error('❌ Delivery partner cache initialization failed:', error);
      }
    };

    // Initialize cache immediately for theme consistency, not just when authenticated
    initializeDeliveryCache();
  }, [initializeCacheWithContext]); // Remove dependency on isAuthenticated and partner for theme consistency

  // If not authenticated, redirect to delivery login
  if (!isAuthenticated || !partner) {
    return <Navigate to="/delivery/login" replace />;
  }

  // Always redirect delivery partners to delivery dashboard as default
  if (location.pathname === '/' || 
      location.pathname === '/home' || 
      !location.pathname.startsWith('/delivery/')) {
    return <Navigate to="/delivery/dashboard" replace />;
  }

  return children;
};

export default DeliveryRouteHandler;
