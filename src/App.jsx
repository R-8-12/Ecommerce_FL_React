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
import UnifiedRegistrationImproved from "./pages/UnifiedRegistrationImproved";
import UnifiedLoginImproved from "./pages/UnifiedLoginImproved";
import UnifiedDashboardRouter from "./components/UnifiedDashboardRouter";
import ProtectedRoute, { UnauthorizedPage, RoleBasedRedirect } from "./components/ProtectedRoute";

import AdminSellPhone from "./pages/Admin/AdminSellPhone";
import FirebaseOptimizationTest from "./components/FirebaseOptimizationTest";
import FirebaseOptimizationMonitor from "./components/FirebaseOptimizationMonitor";
import FirebaseSetup from "./components/FirebaseSetup";
import AdminAuthDebugger from "./components/AdminAuthDebugger";
import ErrorBoundary from "./components/ErrorBoundary";

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
  const { isAuthenticated: isAdminAuthenticated, checkAdminAuthStatus } =
    useAdminAuthStore();
  const { initializeTheme } = useThemeStore();

  // Initialize products and authentication
  React.useEffect(() => {
    const initializeStore = async () => {
      try {
        // Initialize theme first
        initializeTheme();
        
        // Load theme from backend and apply (with better error handling)
        try {
          const themeService = await import('./services/themeService');
          await themeService.default.loadAndApplyTheme();
          console.log('Theme loaded successfully from backend');
        } catch (error) {
          console.log('Theme service failed, loading custom colors from localStorage:', error.message);
          // Fallback to localStorage custom colors
          loadCustomColors();
        }
        
        // Initialize authentication state from localStorage
        checkAuthStatus();

        // Initialize admin authentication state from localStorage
        checkAdminAuthStatus();

        // Import dynamically to avoid circular dependencies
        const { useProductStore } = await import("./store/useProduct");
        await useProductStore.getState().fetchProducts();

        // Initialize page content store - fetch available pages
        const { usePageContentStore } = await import(
          "./store/usePageContentStore"
        );
        await usePageContentStore.getState().fetchAvailablePages();
        
        console.log('App initialization completed successfully');
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
        {/* 🔐 NEW: Improved Unified RBAC Authentication Routes */}
        <Route path="/unified-signup" element={<UnifiedRegistrationImproved />} />
        <Route path="/unified-login" element={<UnifiedLoginImproved />} />
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
          element={!isAuthenticated ? <SignUp /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
        
        {/* Firebase Setup Route (Development) */}
        <Route 
          path="/firebase-setup" 
          element={<FirebaseSetup />} 
        />
        {/* Delivery Partner Routes - keeping these outside the main Layout */}
        <Route path="/delivery">
          {/* Public delivery routes */}
          <Route path="login" element={<PartnerLogin />} />
          <Route path="register" element={<PartnerRegister />} />
          <Route path="admin-verify" element={<AdminVerify />} />

          {/* Protected Delivery Partner Routes */}
          <Route
            path="dashboard"
            element={
              <DeliveryAuthGuard>
                <DeliveryDashboard />
              </DeliveryAuthGuard>
            }
          />
          <Route
            path="assignments"
            element={
              <DeliveryAuthGuard>
                <DeliveryAssignmentList />
              </DeliveryAuthGuard>
            }
          />
          <Route
            path="update/:id"
            element={
              <DeliveryAuthGuard>
                <DeliveryStatusUpdate />
              </DeliveryAuthGuard>
            }
          />
          <Route
            path="status-update"
            element={
              <DeliveryAuthGuard>
                <DeliveryStatusUpdate />
              </DeliveryAuthGuard>
            }
          />
          <Route
            path="history"
            element={
              <DeliveryAuthGuard>
                <DeliveryHistory />
              </DeliveryAuthGuard>
            }
          />
          <Route
            path="settings"
            element={
              <DeliveryAuthGuard>
                <DeliverySettings />
              </DeliveryAuthGuard>
            }
          />

          {/* Admin verification route for delivery partners */}
          <Route
            path="verification"
            element={
              isAdminAuthenticated ? (
                <AdminVerify />
              ) : (
                <Navigate to="/admin/login" />
              )
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
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <Navigate to={isAdminAuthenticated ? "/admin/dashboard" : "/admin/login"} />
          }
        />
        <Route
          path="/admin/login"
          element={
            !isAdminAuthenticated ? (
              <AdminLogin />
            ) : (
              <Navigate to="/admin/dashboard" />
            )
          }
        />
        <Route
          path="/admin/register"
          element={
            !isAdminAuthenticated ? (
              <AdminRegister />
            ) : (
              <Navigate to="/admin/dashboard" />
            )
          }
        />
        <Route element={<AdminLayout />}>
          <Route
            path="/admin/dashboard"
            element={
              isAdminAuthenticated ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/firebase-test"
            element={
              isAdminAuthenticated ? (
                <FirebaseOptimizationTest />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/firebase-monitor"
            element={
              isAdminAuthenticated ? (
                <FirebaseOptimizationMonitor />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/auth-debug"
            element={<AdminAuthDebugger />}
          />
          <Route
            path="/admin/products"
            element={
              isAdminAuthenticated ? (
                <AdminProducts />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/inventory"
            element={
              isAdminAuthenticated ? (
                <AdminInventory />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/orders"
            element={
              isAdminAuthenticated ? (
                <AdminOrders />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/users"
            element={
              isAdminAuthenticated ? (
                <AdminUsers />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/returns"
            element={
              isAdminAuthenticated ? (
                <AdminReturns />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/content"
            element={
              isAdminAuthenticated ? (
                <AdminContent />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/sell-phones"
            element={
              isAdminAuthenticated ? (
                <AdminSellPhone />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/reviews"
            element={
              isAdminAuthenticated ? (
                <AdminReviews />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/delivery-partners"
            element={
              isAdminAuthenticated ? (
                <AdminDeliveryPartners />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
    </SimpleThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
