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

/**
 * Validates a JWT token
 * @returns {Object} Token validation status
 */
const debugAuthToken = () => {
  try {
    // Get token from local storage
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      console.error('🔑 AUTH DEBUG: No token found in localStorage');
      return {
        error: 'No token found',
        status: 'missing'
      };
    }
    
    // Check token format (should be JWT format)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('🔑 AUTH DEBUG: Token is not in valid JWT format');
      return {
        error: 'Invalid token format',
        status: 'invalid_format'
      };
    }
    
    // Decode payload (middle part of JWT)
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      
      console.log('🔑 AUTH DEBUG: Token payload:', payload);
      
      // Check for critical fields
      const missingFields = [];
      ['email', 'user_id', 'exp'].forEach(field => {
        if (!payload[field]) missingFields.push(field);
      });
      
      if (missingFields.length > 0) {
        console.error(`🔑 AUTH DEBUG: Token missing required fields: ${missingFields.join(', ')}`);
        return {
          error: `Token missing fields: ${missingFields.join(', ')}`,
          status: 'missing_fields',
          payload
        };
      }
      
      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        console.error('🔑 AUTH DEBUG: Token has expired', {
          expiry: new Date(payload.exp * 1000).toLocaleString(),
          now: new Date().toLocaleString()
        });
        return {
          error: 'Token expired',
          status: 'expired',
          payload
        };
      }
      
      return {
        status: 'valid',
        payload
      };
      
    } catch (e) {
      console.error('🔑 AUTH DEBUG: Failed to decode token payload', e);
      return {
        error: 'Failed to decode token',
        status: 'decode_error'
      };
    }
  } catch (e) {
    console.error('🔑 AUTH DEBUG: Unexpected error during token validation', e);
    return {
      error: e.message,
      status: 'error'
    };
  }
};

/**
 * Attempts to refresh the authentication token
 * @returns {Promise<boolean>} True if token was successfully refreshed
 */
const refreshToken = async () => {
  try {
    // Check if we have a valid user stored
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) {
      console.error('No user data found for token refresh');
      return false;
    }

    // Parse user data
    const userData = JSON.parse(userJson);
    if (!userData || !userData.email) {
      console.error('Invalid user data for token refresh', userData);
      return false;
    }

    // Call the token refresh endpoint
    const response = await api.post('/users/token/refresh/', {
      user_id: userData.uid || userData.id,
      email: userData.email
    });

    if (response.data && response.data.token) {
      // Store the new token
      localStorage.setItem(TOKEN_KEY, response.data.token);
      
      // Validate the new token
      const tokenStatus = debugAuthToken();
      if (tokenStatus.status === 'valid') {
        console.log('Token successfully refreshed');
        return true;
      } else {
        console.error('Refreshed token is invalid:', tokenStatus);
        return false;
      }
    } else {
      console.error('Token refresh response missing token', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      // Validate token before using
      if (config.url.includes('/gamification/') || config.url.includes('/wallet/')) {
        const tokenStatus = debugAuthToken();
        console.log(`Token validation for ${config.url}:`, tokenStatus.status);
        
        // If token is invalid but we have a user, try to refresh the token
        if (tokenStatus.status !== 'valid' && localStorage.getItem(USER_KEY)) {
          console.warn('Invalid token detected for gamification/wallet endpoint, will need refresh');
        }
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common response issues
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if error is due to unauthorized access
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      
      // Check if the error is about missing email field in token
      const errorMessage = error.response?.data?.error || '';
      
      if (errorMessage.includes('missing email field') && !originalRequest._retry) {
        console.log('Attempting to refresh token due to missing email field error');
        
        // Mark this request so we don't try to refresh more than once
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const refreshed = await refreshToken();
          
          if (refreshed) {
            // Update authorization header with new token
            const newToken = localStorage.getItem(TOKEN_KEY);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Retry the original request with new token
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      
      // If refresh failed or wasn't attempted, clear auth state
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
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
      try {
        // Set the authorization header directly
        config.headers.Authorization = `Bearer ${adminToken}`;
        
        // Debug log to verify token format (remove in production)
        console.log("Using admin token (first 15 chars):", 
          adminToken.substring(0, Math.min(15, adminToken.length)) + "...");
      } catch (err) {
        console.error("Error processing admin token:", err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to reset admin authentication state on token errors
const resetAdminAuth = () => {
  // Remove tokens from localStorage
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  
  // Clear authorization headers
  if (adminApi.defaults && adminApi.defaults.headers) {
    delete adminApi.defaults.headers.common["Authorization"];
  }
  
  console.log("Admin authentication reset due to token error");
  
  // Redirect to login page if not already there
  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/admin') && !currentPath.includes('login')) {
    console.log("Redirecting to admin login page");
    window.location.href = '/admin/login';
  }
};

// Add a response interceptor for admin API to handle unauthorized responses
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.warn("Admin unauthorized access detected:", 
        error.response?.data?.error || error.message);
      
      // Reset authentication state
      resetAdminAuth();
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
export { adminApi, deliveryApi, refreshToken, debugAuthToken };
