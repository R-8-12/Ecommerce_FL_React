import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SimpleThemeProvider from "./components/SimpleThemeProvider";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Product from "./pages/Product";
import ProductList from "./pages/ProductList";
import SearchResults from "./pages/SearchResults"; // Add the new import
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import OrderStatus from "./pages/OrderStatus";
import OrderTracking from "./pages/OrderTracking";
import OrderTrackingDetail from "./pages/OrderTrackingDetail";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TrackOrder from "./pages/TrackOrder";
import BulkOrder from "./pages/BulkOrder";
import OurStores from "./pages/OurStores";
import DynamicPage from "./pages/DynamicPage";
import {
  TermsConditions,
  CancellationRefundPolicy,
  PrivacyPolicy,
  ShippingDeliveryPolicy,
  WarrantyPolicy,
} from "./pages/Policy";
import { useAuthStore } from "./store/useAuth";
import { useAdminAuthStore } from "./store/Admin/useAdminAuth";
import useThemeStore from "./store/useTheme";
import { loadCustomColors } from "./utils/colorUtils";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminLayout from "./components/Admin/AdminLayout";
import { DeliveryAuthGuard } from "./components/Delivery";

// 🔐 RBAC Components
import { CustomerOnlyRoute, AdminOnlyRoute, DeliveryPartnerOnlyRoute, PublicRoute, GuestOnlyRoute, AuthenticatedOnlyRoute } from "./components/auth/RoleGuards";
import RoleBasedRouteGuard from "./components/auth/RoleBasedRouteGuard";
import AdminRouteHandler from "./components/auth/AdminRouteHandler";
import DeliveryRouteHandler from "./components/auth/DeliveryRouteHandler";
import RoleBasedRedirect from "./components/auth/RoleBasedRedirect";

import {
  PartnerLogin,
  PartnerRegister,
  DeliveryDashboard,
  DeliveryAssignmentList,
  DeliveryStatusUpdate,
  DeliveryHistory,
  DeliverySettings,
  AdminVerify,
} from "./pages/Delivery";
import {
  AdminLogin,
  AdminRegister,
  AdminDashboard,
  AdminProducts,
  AdminInventory,
  AdminOrders,
  AdminUsers,
  AdminReturns,
  AdminReviews,
  AdminContent,
  AdminDeliveryPartners,
} from "./pages/Admin";

// 🔐 NEW: Unified RBAC System Components
import UnifiedRegistration from "./components/auth/UnifiedRegistration";
import UnifiedLogin from "./pages/UnifiedLogin";
import UnifiedDashboardRouter from "./components/UnifiedDashboardRouter";
import ProtectedRoute, { UnauthorizedPage } from "./components/ProtectedRoute";

import AdminSellPhone from "./pages/Admin/AdminSellPhone";
import FirebaseOptimizationTest from "./components/FirebaseOptimizationTest";
import FirebaseOptimizationMonitor from "./components/FirebaseOptimizationMonitor";
import FirebaseSetup from "./components/FirebaseSetup";

import ErrorBoundary from "./components/ErrorBoundary";
import Page404 from "./pages/Page404";
import GamificationIntegration from "./components/gamification/GamificationIntegration";
import GamificationDashboard from "./pages/GamificationDashboard";

// Layout component that will be used across all pages
const Layout = () => {
  // Mock data for categories
  // const categories = [
  //   { id: 1, name: "Smartphones", path: "/category/smartphones" },
  //   { id: 2, name: "Laptops", path: "/category/laptops" },
  //   { id: 3, name: "Tablets", path: "/category/tablets" },
  //   { id: 4, name: "Mobile Accessories", path: "/category/mobile-accessories" },
  //   { id: 5, name: "Laptop Accessories", path: "/category/laptop-accessories" },
  //   { id: 6, name: "Audio Devices", path: "/category/audio" },
  // ];
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

const App = () => {
  const { checkAuthStatus } = useAuthStore();
  const { checkAdminAuthStatus } = useAdminAuthStore();
  const { initializeTheme } = useThemeStore();

  // Initialize products and authentication
  React.useEffect(() => {
    const initializeStore = async () => {
      try {
        // Initialize theme system (without loading theme data from API)
        initializeTheme();
        
        // Load theme from cache/localStorage if available (no API call needed)
        try {
          loadCustomColors();
          console.log('Theme loaded from cache/localStorage');
        } catch (error) {
          console.log('Theme fallback loaded:', error.message);
        }
        
        // Initialize authentication state from localStorage
        checkAuthStatus();

        // Initialize admin authentication state from localStorage
        checkAdminAuthStatus();

        // Import dynamically to avoid circular dependencies
        const { useProductStore } = await import("./store/useProduct");
        await useProductStore.getState().fetchProducts();

        // Page content now comes from cache - no API call
        console.log('App initialization completed with centralized caching');
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };

    initializeStore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize theme
  useEffect(() => {
    initializeTheme();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ErrorBoundary>
      <SimpleThemeProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />
          <Routes>
        {/* 🔐 NEW: Unified RBAC Authentication Routes - Guest Only */}
        <Route 
          path="/unified-signup" 
          element={
            <GuestOnlyRoute>
              <UnifiedRegistration />
            </GuestOnlyRoute>
          } 
        />
        <Route 
          path="/unified-login" 
          element={
            <GuestOnlyRoute>
              <UnifiedLogin />
            </GuestOnlyRoute>
          } 
        />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UnifiedDashboardRouter />
          </ProtectedRoute>
        } />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/rbac-redirect" element={<RoleBasedRedirect />} />

        {/* 🔄 LEGACY: Backward Compatibility Auth Routes - Guest Only */}
        <Route
          path="/signup"
          element={
            <GuestOnlyRoute>
              <SignUp />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <Login />
            </GuestOnlyRoute>
          }
        />
        
        {/* Firebase Setup Route (Development) */}
        <Route 
          path="/firebase-setup" 
          element={<FirebaseSetup />} 
        />
        {/* Delivery Partner Routes - RBAC Protected */}
        <Route path="/delivery">
          {/* Public delivery routes - Guest Only */}
          <Route 
            path="login" 
            element={
              <GuestOnlyRoute>
                <PartnerLogin />
              </GuestOnlyRoute>
            } 
          />
          <Route 
            path="register" 
            element={
              <GuestOnlyRoute>
                <PartnerRegister />
              </GuestOnlyRoute>
            } 
          />

          {/* Protected Delivery Partner Routes */}
          <Route
            path="dashboard"
            element={
              <DeliveryPartnerOnlyRoute>
                <DeliveryRouteHandler>
                  <DeliveryDashboard />
                </DeliveryRouteHandler>
              </DeliveryPartnerOnlyRoute>
            }
          />
          <Route
            path="assignments"
            element={
              <DeliveryPartnerOnlyRoute>
                <DeliveryRouteHandler>
                  <DeliveryAssignmentList />
                </DeliveryRouteHandler>
              </DeliveryPartnerOnlyRoute>
            }
          />
          <Route
            path="update/:id"
            element={
              <DeliveryPartnerOnlyRoute>
                <DeliveryRouteHandler>
                  <DeliveryStatusUpdate />
                </DeliveryRouteHandler>
              </DeliveryPartnerOnlyRoute>
            }
          />
          <Route
            path="status-update"
            element={
              <DeliveryPartnerOnlyRoute>
                <DeliveryStatusUpdate />
              </DeliveryPartnerOnlyRoute>
            }
          />
          <Route
            path="history"
            element={
              <DeliveryPartnerOnlyRoute>
                <DeliveryHistory />
              </DeliveryPartnerOnlyRoute>
            }
          />
          <Route
            path="settings"
            element={
              <DeliveryPartnerOnlyRoute>
                <DeliverySettings />
              </DeliveryPartnerOnlyRoute>
            }
          />

          {/* Admin verification route for delivery partners - Admin Only */}
          <Route
            path="admin-verify"
            element={
              <AdminOnlyRoute redirectTo="/admin/login">
                <AdminVerify />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="verification"
            element={
              <AdminOnlyRoute redirectTo="/admin/login">
                <AdminVerify />
              </AdminOnlyRoute>
            }
          />
        </Route>
        {/* Public Routes with Layout (guests and authenticated users) */}
        <Route element={<Layout />}>
          {/* Homepage - accessible to guests, customers, and admins */}
          <Route
            path="/"
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <AdminRouteHandler>
                  <Home />
                </AdminRouteHandler>
              </RoleBasedRouteGuard>
            }
          />
          
          {/* Product browsing - accessible to all */}
          <Route 
            path="/products" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <ProductList />
              </RoleBasedRouteGuard>
            } 
          />
          <Route 
            path="/products/:id" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <Product />
              </RoleBasedRouteGuard>
            } 
          />
          <Route 
            path="/category/:category" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <ProductList />
              </RoleBasedRouteGuard>
            } 
          />
          <Route 
            path="/search" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <SearchResults />
              </RoleBasedRouteGuard>
            } 
          />

          {/* Customer-only routes - require authentication */}
          <Route 
            path="/cart" 
            element={
              <CustomerOnlyRoute redirectTo="/login">
                <Cart />
              </CustomerOnlyRoute>
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <CustomerOnlyRoute redirectTo="/login">
                <Wishlist />
              </CustomerOnlyRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <CustomerOnlyRoute redirectTo="/login">
                <OrderStatus />
              </CustomerOnlyRoute>
            } 
          />
          <Route 
            path="/order-tracking" 
            element={
              <CustomerOnlyRoute redirectTo="/login">
                <OrderTracking />
              </CustomerOnlyRoute>
            } 
          />
          <Route 
            path="/order-tracking/:id" 
            element={
              <CustomerOnlyRoute redirectTo="/login">
                <OrderTrackingDetail />
              </CustomerOnlyRoute>
            } 
          />
          <Route 
            path="/gamification" 
            element={
              <CustomerOnlyRoute redirectTo="/login">
                <GamificationDashboard />
              </CustomerOnlyRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <CustomerOnlyRoute redirectTo="/login">
                <Account />
              </CustomerOnlyRoute>
            } 
          />
          <Route 
            path="/profile/:section" 
            element={
              <CustomerOnlyRoute redirectTo="/login">
                <Account />
              </CustomerOnlyRoute>
            } 
          />

          {/* Authenticated user routes (customers and admins) */}
          <Route 
            path="/track-order" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "admin"]} redirectTo="/login">
                <TrackOrder />
              </RoleBasedRouteGuard>
            } 
          />
          <Route 
            path="/bulk-order" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "admin"]} redirectTo="/login">
                <BulkOrder />
              </RoleBasedRouteGuard>
            } 
          />

          {/* Public information pages - accessible to all */}
          <Route 
            path="/about" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <About />
              </RoleBasedRouteGuard>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <Contact />
              </RoleBasedRouteGuard>
            } 
          />
          <Route 
            path="/our-stores" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <OurStores />
              </RoleBasedRouteGuard>
            } 
          />
          
          {/* Policy pages - accessible to all */}
          <Route 
            path="/terms-conditions" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <TermsConditions />
              </RoleBasedRouteGuard>
            } 
          />
          <Route
            path="/cancellation-refund-policy"
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <CancellationRefundPolicy />
              </RoleBasedRouteGuard>
            }
          />
          <Route 
            path="/privacy-policy" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <PrivacyPolicy />
              </RoleBasedRouteGuard>
            } 
          />
          <Route
            path="/shipping-delivery-policy"
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <ShippingDeliveryPolicy />
              </RoleBasedRouteGuard>
            }
          />
          <Route 
            path="/warranty-policy" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <WarrantyPolicy />
              </RoleBasedRouteGuard>
            } 
          />

          {/* Dynamic pages - accessible to all */}
          <Route 
            path="/dynamic-page" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <DynamicPage />
              </RoleBasedRouteGuard>
            } 
          />
          <Route 
            path="/:pagePath" 
            element={
              <RoleBasedRouteGuard allowedRoles={["customer", "guest", "admin"]}>
                <DynamicPage />
              </RoleBasedRouteGuard>
            } 
          />
        </Route>
        {/* Admin Routes - RBAC Protected */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" />}
        />
        <Route
          path="/admin/login"
          element={
            <GuestOnlyRoute>
              <AdminLogin />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/admin/register"
          element={
            <GuestOnlyRoute>
              <AdminRegister />
            </GuestOnlyRoute>
          }
        />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminOnlyRoute><AdminLayout /></AdminOnlyRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="firebase-test" element={<FirebaseOptimizationTest />} />
          <Route path="firebase-monitor" element={<FirebaseOptimizationMonitor />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="sell-phones" element={<AdminSellPhone />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="delivery-partners" element={<AdminDeliveryPartners />} />
        </Route>
        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<Page404 />} />
      </Routes>
      {/* <AuthDebugPanel /> */}
      
      {/* Global Gamification Integration - provides modals for all pages */}
      <GamificationIntegration />
    </BrowserRouter>
    </SimpleThemeProvider>
    </ErrorBoundary>
  );
};

export default App;