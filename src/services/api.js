import axios from "axios";
import {
  API_URL,
  TOKEN_KEY,
  USER_KEY,
  DELIVERY_TOKEN_KEY,
} from "../utils/constants";

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: API_URL, // Use API_URL from constants
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const authToken = localStorage.getItem('auth_token'); // Also check the new token key
    const availableToken = token || authToken;
    
    console.log('🔑 API Request Debug:', {
      endpoint: config.url,
      method: config.method,
      legacyToken: token ? `${token.substring(0, 10)}...` : 'not found',
      authToken: authToken ? `${authToken.substring(0, 10)}...` : 'not found',
      usingToken: availableToken ? `${availableToken.substring(0, 10)}...` : 'none'
    });
    
    if (availableToken) {
      config.headers.Authorization = `Bearer ${availableToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common response issues
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      endpoint: response.config.url,
      status: response.status,
      dataKeys: Object.keys(response.data || {})
    });
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      endpoint: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      hasAuthHeader: !!error.config?.headers?.Authorization
    });
    
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - clearing tokens');
      // Handle unauthorized - could clear auth state and redirect to login
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('auth_token'); // Also clear the new token key
    }
    return Promise.reject(error);
  }
);

// Create an admin API instance with separate token handling
const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor for admin API to include the admin token
adminApi.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("admin_token");
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for admin API to handle unauthorized responses
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear admin auth state
      localStorage.removeItem("admin_token");
    }
    return Promise.reject(error);
  }
);

// Create a delivery partner API instance
const deliveryApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the delivery partner token in requests
deliveryApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(DELIVERY_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle unauthorized access
deliveryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear delivery partner auth state
      localStorage.removeItem(DELIVERY_TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;
export { adminApi, deliveryApi };
