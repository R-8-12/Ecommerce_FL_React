// API Constants - Use environment variables
export const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// Razorpay Configuration
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Local Storage Keys
export const TOKEN_KEY = "anand_mobiles_token";
export const USER_KEY = "anand_mobiles_user";
export const ADMIN_TOKEN_KEY = "admin_token";
export const DELIVERY_TOKEN_KEY = "delivery_partner_token";

// Route Constants
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROFILE: "/profile",
  PROFILE_SECTION: "/profile/:section",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  WISHLIST: "/wishlist",
  GAMIFICATION: "/gamification",
  ABOUT: "/about",
  CONTACT: "/contact",
  TRACK_ORDER: "/track-order",
  BULK_ORDER: "/bulk-order",
  TERMS_CONDITIONS: "/terms-conditions",
  CANCELLATION_REFUND_POLICY: "/cancellation-refund-policy",
  PRIVACY_POLICY: "/privacy-policy",
  SHIPPING_DELIVERY_POLICY: "/shipping-delivery-policy",
  OUR_STORES: "/our-stores",
  WARRANTY_POLICY: "/warranty-policy",
};

// UI Constants
export const THEME = {
  PRIMARY_COLOR: "#4F46E5", // indigo-600
  SECONDARY_COLOR: "#F59E0B", // amber-500
  SUCCESS_COLOR: "#10B981", // emerald-500
  ERROR_COLOR: "#EF4444", // red-500
  WARNING_COLOR: "#F59E0B", // amber-500
  INFO_COLOR: "#3B82F6", // blue-500
};

// Pagination
export const ITEMS_PER_PAGE = 10;
