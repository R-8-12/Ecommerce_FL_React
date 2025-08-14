/**
 * Auth Debugger Service
 * This utility helps troubleshoot auth token issues with the backend
 */

import { TOKEN_KEY } from '../utils/constants';

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

export default debugAuthToken;
