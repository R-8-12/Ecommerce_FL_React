/**
 * Token Refresh Service
 * This service handles refreshing of invalid tokens
 */

import api from './api';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

/**
 * Validates a JWT token
 * @returns {Object} Token validation status
 */
const validateToken = (token) => {
  try {
    // Check token format (should be JWT format)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return {
        error: 'Invalid token format',
        status: 'invalid_format'
      };
    }
    
    // Decode payload (middle part of JWT)
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Check for critical fields
      const missingFields = [];
      ['email', 'user_id', 'exp'].forEach(field => {
        if (!payload[field]) missingFields.push(field);
      });
      
      if (missingFields.length > 0) {
        return {
          error: `Token missing fields: ${missingFields.join(', ')}`,
          status: 'missing_fields',
          payload
        };
      }
      
      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
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
      
    } catch {
      return {
        error: 'Failed to decode token',
        status: 'decode_error'
      };
    }
  } catch (e) {
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
      const tokenStatus = validateToken(response.data.token);
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

export { refreshToken };
