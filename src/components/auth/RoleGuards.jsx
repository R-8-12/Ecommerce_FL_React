import React from 'react';
import RoleBasedRouteGuard from './RoleBasedRouteGuard';

// Specific role guards for convenience
export const CustomerOnlyRoute = ({ children, redirectTo = '/login' }) => (
  <RoleBasedRouteGuard allowedRoles={['customer']} redirectTo={redirectTo}>
    {children}
  </RoleBasedRouteGuard>
);

export const AdminOnlyRoute = ({ children, redirectTo = '/admin/login' }) => (
  <RoleBasedRouteGuard allowedRoles={['admin']} redirectTo={redirectTo}>
    {children}
  </RoleBasedRouteGuard>
);

export const DeliveryPartnerOnlyRoute = ({ children, redirectTo = '/delivery/login' }) => (
  <RoleBasedRouteGuard allowedRoles={['delivery_partner']} redirectTo={redirectTo}>
    {children}
  </RoleBasedRouteGuard>
);

export const PublicRoute = ({ children }) => (
  <RoleBasedRouteGuard allowedRoles={[]}>
    {children}
  </RoleBasedRouteGuard>
);
