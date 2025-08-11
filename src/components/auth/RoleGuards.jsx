import React from 'react';
import RoleBasedRouteGuard from './RoleBasedRouteGuard';

// Specific role guards for convenience
export const CustomerOnlyRoute = ({ children, redirectTo = '/login' }) => (
  <RoleBasedRouteGuard allowedRoles={['customer']} redirectTo={redirectTo} requireAuth={true}>
    {children}
  </RoleBasedRouteGuard>
);

export const AdminOnlyRoute = ({ children, redirectTo = '/admin/login' }) => (
  <RoleBasedRouteGuard allowedRoles={['admin']} redirectTo={redirectTo} requireAuth={true}>
    {children}
  </RoleBasedRouteGuard>
);

export const DeliveryPartnerOnlyRoute = ({ children, redirectTo = '/delivery/login' }) => (
  <RoleBasedRouteGuard allowedRoles={['delivery_partner']} redirectTo={redirectTo} requireAuth={true}>
    {children}
  </RoleBasedRouteGuard>
);

export const PublicRoute = ({ children }) => (
  <RoleBasedRouteGuard allowedRoles={['guest', 'customer', 'admin', 'delivery_partner']}>
    {children}
  </RoleBasedRouteGuard>
);

// New: Guest-only routes (for login/signup pages when user is already authenticated)
export const GuestOnlyRoute = ({ children }) => (
  <RoleBasedRouteGuard allowedRoles={['guest']} redirectTo="/rbac-redirect">
    {children}
  </RoleBasedRouteGuard>
);

// New: Authenticated-only routes (any authenticated user)
export const AuthenticatedOnlyRoute = ({ children, redirectTo = '/login' }) => (
  <RoleBasedRouteGuard allowedRoles={['customer', 'admin', 'delivery_partner']} redirectTo={redirectTo} requireAuth={true}>
    {children}
  </RoleBasedRouteGuard>
);
