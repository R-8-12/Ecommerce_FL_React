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
import RoleBasedRouteGuard from "./components/auth/RoleBasedRouteGuard";
import { CustomerOnlyRoute, AdminOnlyRoute, DeliveryPartnerOnlyRoute, PublicRoute } from "./components/auth/RoleGuards";
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
  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  const { checkAdminAuthStatus } = useAdminAuthStore();
  const { initializeTheme } = useThemeStore();

  // Initialize products and authentication
  React.useEffect(() => {
    const initializeStore = async () => {
      try {
        // 🚀 Initialize centralized frontend cache FIRST (replaces individual API calls)
        const { default: useFrontendCacheStore } = await import('./store/useFrontendCacheStore');
        await useFrontendCacheStore.getState().initializeCache();
        console.log('✅ Frontend cache initialized - no more redundant API calls');
        
        // Initialize theme (now reads from cache)
        initializeTheme();
        
        // Load theme from cache (no API call needed)
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
        {/* 🔐 NEW: Unified RBAC Authentication Routes */}
        <Route path="/unified-signup" element={<UnifiedRegistration />} />
        <Route path="/unified-login" element={<UnifiedLogin />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UnifiedDashboardRouter />
          </ProtectedRoute>
        } />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/rbac-redirect" element={<RoleBasedRedirect />} />

        {/* 🔄 LEGACY: Backward Compatibility Auth Routes */}
        <Route
          path="/signup"
          element={!isAuthenticated ? <SignUp /> : <RoleBasedRedirect />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <RoleBasedRedirect />}
        />
        
        {/* Firebase Setup Route (Development) */}
        <Route 
          path="/firebase-setup" 
          element={<FirebaseSetup />} 
        />
        {/* Delivery Partner Routes - RBAC Protected */}
        <Route path="/delivery">
          {/* Public delivery routes */}
          <Route path="login" element={<PublicRoute><PartnerLogin /></PublicRoute>} />
          <Route path="register" element={<PublicRoute><PartnerRegister /></PublicRoute>} />

          {/* Protected Delivery Partner Routes */}
          <Route
            path="dashboard"
            element={
              <DeliveryPartnerOnlyRoute>
                <DeliveryDashboard />
              </DeliveryPartnerOnlyRoute>
            }
          />
          <Route
            path="assignments"
            element={
              <DeliveryPartnerOnlyRoute>
                <DeliveryAssignmentList />
              </DeliveryPartnerOnlyRoute>
            }
          />
          <Route
            path="update/:id"
            element={
              <DeliveryPartnerOnlyRoute>
                <DeliveryStatusUpdate />
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
        {/* Public Routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<Product />} />
          <Route path="/category/:category" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/gamification" element={<GamificationDashboard />} />
          <Route path="/orders" element={<OrderStatus />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/order-tracking/:id" element={<OrderTrackingDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/dynamic-page" element={<DynamicPage />} />
          {/* Footer Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/bulk-order" element={<BulkOrder />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route
            path="/cancellation-refund-policy"
            element={<CancellationRefundPolicy />}
          />{" "}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="/shipping-delivery-policy"
            element={<ShippingDeliveryPolicy />}
          />
          <Route path="/our-stores" element={<OurStores />} />
          <Route path="/warranty-policy" element={<WarrantyPolicy />} />
          {/* Account Routes */}
          <Route path="/profile" element={<Account />} />
          <Route path="/profile/:section" element={<Account />} />
          {/* Dynamic Content Pages - Custom pages created by admin */}
          {/* This must be placed after all other specific routes to avoid conflicts */}
          <Route path="/:pagePath" element={<DynamicPage />} />
        </Route>
        {/* Admin Routes - RBAC Protected */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" />}
        />
        <Route
          path="/admin/login"
          element={<PublicRoute><AdminLogin /></PublicRoute>}
        />
        <Route
          path="/admin/register"
          element={<PublicRoute><AdminRegister /></PublicRoute>}
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