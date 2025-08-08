import { create } from "zustand";
import api from "../services/api";
import { TOKEN_KEY, USER_KEY } from "../utils/constants";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { awardCoins, checkLoginStreakBonus } from "../utils/gamificationUtils";

// Helper function to safely parse JSON from localStorag      // Prepare user data for consistent structure
      // const userInfo = {
      //   uid: data.user_id || user?.uid,
      //   email: data.email || user?.email,
      //   first_name: data.first_name || userData.first_name,
      //   last_name: data.last_name || userData.last_name,
      //   phone: data.phone_number || userData.phone_number || "",
      //   auth_provider: 'google',
      //   photoURL: user?.photoURL
      // };
const getStoredData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error parsing stored data for key ${key}:`, error);
    return null;
  }
};

// Helper function to safely store data in localStorage
const storeData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    return false;
  }
};

// Helper function to persist user authentication data
const persistAuthData = (token, userData) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    if (userData) {
      storeData(USER_KEY, userData);
    }
    return true;
  } catch (error) {
    console.error("Error persisting auth data:", error);
    return false;
  }
};

// Helper function to clear all auth data
const clearAuthData = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

// Initialize state with persisted data
const getInitialState = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userData = getStoredData(USER_KEY);

  return {
    user: userData,
    isAuthenticated: !!(token && userData),
    isLoading: false,
    error: null,
  };
};

export const useAuthStore = create((set) => ({
  ...getInitialState(),
  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });

      // Direct API call to login endpoint
      const response = await api.post("/users/login", {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data;

      // Prepare user data for consistent structure
      const userData = {
        uid: data.user_id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone_number || data.phone || "",
      };

      // Persist authentication data
      persistAuthData(data.token, userData);

      // Update store state
      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });

      // Award gamification rewards for login
      try {
        await awardCoins('login');
        const streakResult = await checkLoginStreakBonus();
        
        // Force refresh gamification data after login streak bonus
        if (streakResult?.bonus_awarded) {
          // Dispatch event to refresh gamification store
          window.dispatchEvent(new CustomEvent('refreshGamification', { 
            detail: { 
              newBalance: streakResult.new_balance,
              bonusAmount: streakResult.bonus_amount,
              streakCount: streakResult.streak_count
            } 
          }));
        }
      } catch (gamificationError) {
        console.error('Gamification error during login:', gamificationError);
        // Don't block login success for gamification failures
      }

      return data;
    } catch (error) {
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error.response?.data?.error) {
        const serverError = error.response.data.error;
        const errorCode = error.response.data.code;
        
        // Handle specific error codes from backend
        if (errorCode === 'CLOCK_SKEW_ERROR') {
          errorMessage = "Clock synchronization issue detected. Please ensure your device clock is set to the correct time and try again.";
        } else if (errorCode === 'TOKEN_EXPIRED') {
          errorMessage = "Authentication session expired. Please try logging in again.";
        } else if (errorCode === 'INVALID_TOKEN') {
          errorMessage = "Invalid authentication. Please try logging in again.";
        } else {
          errorMessage = serverError;
        }
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
  signup: async (userData) => {
    try {
      set({ isLoading: true, error: null });

      // Handle Google ID token signup
      if (userData.idToken) {
        const response = await api.post("/users/signup", {
          idToken: userData.idToken,
        });

        const data = response.data;

        // Prepare user data for consistent structure
        const userInfo = {
          uid: data.user_id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone_number || "",
        };

        // Persist authentication data
        persistAuthData(data.token, userInfo);

        // Update store state
        set({
          user: userInfo,
          isAuthenticated: true,
          isLoading: false,
        });

        return data;
      }

      // Regular email/password signup
      const requestData = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName || userData.first_name || "",
        last_name: userData.lastName || userData.last_name || "",
        phone_number: userData.phone || userData.phone_number || "",
      };

      // Add metadata if provided
      if (userData.metadata) {
        requestData.metadata = userData.metadata;
      }

      // Direct API call to signup endpoint
      const response = await api.post("/users/signup", requestData);
      const data = response.data;

      // Prepare user data for consistent structure
      const userInfo = {
        uid: data.user_id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone_number || requestData.phone_number || "",
      };

      // Persist authentication data
      persistAuthData(data.token, userInfo);

      // Update store state
      set({
        user: userInfo,
        isAuthenticated: true,
        isLoading: false,
      });

      // Award gamification rewards for new signup
      try {
        await awardCoins('register');
      } catch (gamificationError) {
        console.error('Gamification error during signup:', gamificationError);
        // Don't block signup success for gamification failures
      }

      return data;
    } catch (error) {
      let errorMessage = "Signup failed. Please try again.";
      
      if (error.response?.data?.error) {
        const serverError = error.response.data.error;
        const errorCode = error.response.data.code;
        
        // Handle specific error codes from backend
        if (errorCode === 'CLOCK_SKEW_ERROR') {
          errorMessage = "Clock synchronization issue detected. Please ensure your device clock is set to the correct time and try again.";
        } else if (errorCode === 'TOKEN_EXPIRED') {
          errorMessage = "Authentication session expired. Please try signing up again.";
        } else if (errorCode === 'INVALID_TOKEN') {
          errorMessage = "Invalid authentication. Please try signing up again.";
        } else {
          errorMessage = serverError;
        }
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },
  googleSignup: async (customUserData = null) => {
    try {
      set({ isLoading: true, error: null });

      let userData, user, idToken;

      if (customUserData) {
        // Use provided custom data (for OTP-verified Google users)
        userData = {
          ...customUserData,
          // Ensure the field names match what the backend expects for idToken flow
          firstName: customUserData.first_name || customUserData.firstName,
          lastName: customUserData.last_name || customUserData.lastName
        };
        console.log("Using custom Google user data:", { ...userData, idToken: '[REDACTED]' });
        console.log("Full custom data structure:", JSON.stringify(customUserData, null, 2));
      } else {
        // Standard Google authentication flow
        console.log("Starting Google authentication...");

        // Configure popup options for better compatibility
        const result = await signInWithPopup(auth, provider).catch((error) => {
          console.error("Google popup error:", error);
          if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            throw new Error("Popup blocked or closed. Please allow popups and try again.");
          }
          throw error;
        });

        user = result.user;
        console.log("Google authentication successful:", user.email);

        // Get ID token
        idToken = await user.getIdToken();
        console.log("ID token obtained successfully");

        // Prepare comprehensive user data for backend
        userData = {
          idToken: idToken,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',    // Regular signup expects firstName
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',  // Regular signup expects lastName
          phone_number: '',  // Add phone_number field for consistency
          photoURL: user.photoURL,
          uid: user.uid,
          authProvider: 'google'
        };

        console.log("Sending data to backend:", { ...userData, idToken: '[REDACTED]' });
      }

      // For Google users, always use the regular signup endpoint
      // The backend handles OTP verification through the otp_verified flag
      let endpoint = "/users/signup";
      console.log("Using Google signup endpoint:", endpoint);

      // Direct API call with better error handling
      console.log("About to send request to:", endpoint);
      console.log("Request payload:", JSON.stringify(userData, null, 2));
      const response = await api.post(endpoint, userData);
      console.log("Backend response:", response.data);

      const data = response.data;

      // Prepare user data for consistent structure
      const userInfo = {
        uid: data.user_id || user?.uid,
        email: data.email || user?.email,
        first_name: data.first_name || userData.firstName || userData.first_name,
        last_name: data.last_name || userData.lastName || userData.last_name,
        phone: data.phone_number || userData.phone_number || "",
        auth_provider: 'google',
        photoURL: user?.photoURL
      };

      // Persist authentication data
      persistAuthData(data.token, userInfo);

      // Update store state
      set({
        user: userInfo,
        isAuthenticated: true,
        isLoading: false,
      });

      // Award gamification rewards for Google signup/login
      try {
        // Check if this is a new user (first signup) vs returning user (login)
        if (data.is_new_user) {
          await awardCoins('register');
        } else {
          await awardCoins('login');
          await checkLoginStreakBonus();
        }
      } catch (gamificationError) {
        console.error('Gamification error during Google auth:', gamificationError);
        // Don't block authentication success for gamification failures
      }

      return data;
    } catch (error) {
      console.error("Google signup/login error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      let errorMessage = "Google authentication failed. Please try again.";
      
      if (error.response?.data?.error) {
        const serverError = error.response.data.error;
        const errorCode = error.response.data.code;
        
        // Handle specific error codes from backend
        if (errorCode === 'CLOCK_SKEW_ERROR') {
          errorMessage = "Clock synchronization issue detected. Please ensure your device clock is set to the correct time and try again.";
        } else if (errorCode === 'TOKEN_EXPIRED') {
          errorMessage = "Authentication session expired. Please try logging in again.";
        } else if (errorCode === 'INVALID_TOKEN') {
          errorMessage = "Invalid authentication. Please try logging in again.";
        } else {
          errorMessage = serverError;
        }
      } else if (error.message.includes("popup")) {
        errorMessage = "Popup blocked or closed. Please allow popups and try again.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    // Clear all authentication data
    clearAuthData();

    // Reset store state
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
    });
  },
  checkAuthStatus: async () => {
    try {
      set({ isLoading: true });

      // Check if token exists in localStorage
      const token = localStorage.getItem(TOKEN_KEY);

      if (token) {
        try {
          // Try to get user data from localStorage first
          let userData = getStoredData(USER_KEY);

          if (!userData) {
            // If user data not in localStorage, fetch from API
            const response = await api.get("/users/profile/");
            userData = {
              uid: response.data.user_id || response.data.uid,
              email: response.data.email,
              first_name: response.data.first_name,
              last_name: response.data.last_name,
              phone: response.data.phone_number || response.data.phone || "",
            };

            // Update localStorage with fresh data
            storeData(USER_KEY, userData);
          }

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
          return userData;
        } catch (err) {
          // If API call fails, clear auth state
          clearAuthData();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: err.message || "Session expired",
          });
          return null;
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return null;
      }
    } catch (err) {
      // Clear auth state on error
      clearAuthData();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: err.message || "Session expired",
      });
      return null;
    }
  },

  // Update user profile data
  updateUserProfile: (updatedData) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updatedData };

    // Persist updated user data
    storeData(USER_KEY, updatedUser);

    // Update store state
    set({ user: updatedUser });
  },

  // Fetch user profile from API
  fetchUserProfile: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.get("/users/profile/");
      const profileData = response.data;

      const userData = {
        uid: profileData.user_id || profileData.uid,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone_number || profileData.phone || "",
        auth_provider: profileData.auth_provider,
      };

      // Update localStorage with fresh data
      storeData(USER_KEY, userData);

      set({
        user: userData,
        isLoading: false,
      });

      return userData;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to fetch profile",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update user profile via API
  updateUserProfileAPI: async (profileData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await api.post("/users/profile/update/", profileData);
      const updatedProfile = response.data.user;

      const userData = {
        uid: updatedProfile.user_id || useAuthStore.getState().user?.uid,
        email: updatedProfile.email,
        first_name: updatedProfile.first_name,
        last_name: updatedProfile.last_name,
        phone: updatedProfile.phone_number || updatedProfile.phone || "",
        auth_provider: useAuthStore.getState().user?.auth_provider,
      };

      // Update localStorage with fresh data
      storeData(USER_KEY, userData);

      set({
        user: userData,
        isLoading: false,
      });

      return {
        success: true,
        message: response.data.message,
        user: userData,
      };
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to update profile",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get current authentication token
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
