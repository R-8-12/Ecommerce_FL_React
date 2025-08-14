/**
 * Test script for the auth debugging functions
 * Run this to verify the auth token debugging is working
 */

import { debugAuthToken, refreshToken } from './src/services/api';
import { TOKEN_KEY, USER_KEY } from './src/utils/constants';

// Simulate a token for testing
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImV4cCI6MjUzNDAyMzAwODAwfQ.8KRWV6E6NVEHfHjzEouFIX9cH9tBqpH8YpFIjdCWqdk';

// Function to test the auth debugging
const testAuthDebugging = () => {
  // First, store the original token
  const originalToken = localStorage.getItem(TOKEN_KEY);
  
  console.log('=== Auth Debugging Test ===');
  console.log('Setting test token in localStorage...');
  localStorage.setItem(TOKEN_KEY, testToken);
  
  console.log('Running debugAuthToken()...');
  const result = debugAuthToken();
  console.log('Debug result:', result);
  
  // Restore original token if any
  if (originalToken) {
    console.log('Restoring original token...');
    localStorage.setItem(TOKEN_KEY, originalToken);
  } else {
    console.log('Removing test token...');
    localStorage.removeItem(TOKEN_KEY);
  }
  
  console.log('=== Test Complete ===');
  return result;
};

// Export the test function
export default testAuthDebugging;
