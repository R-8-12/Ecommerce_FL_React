/**
 * Token Validation Test Script
 * 
 * This script tests the authentication flow and token validation
 * Run this script in the browser console to check if tokens are valid
 */

function testAuthTokenFlow() {
  console.log('🔍 Running Auth Token Validation Test');
  console.log('=======================================');
  
  // Step 1: Check if user is logged in
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  console.log('🔐 Authentication Status:', token ? 'Logged in' : 'Not logged in');
  
  if (!token) {
    console.log('❌ No token found - test cannot continue');
    console.log('Please log in first, then run this test again');
    return;
  }
  
  // Step 2: Validate token format
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('❌ Token is not in valid JWT format (should have 3 parts separated by dots)');
      return;
    }
    
    // Decode token payload
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log('✅ Successfully decoded token payload');
    
    // Check for critical fields
    console.log('📋 Token Fields Check:');
    console.log('- user_id:', payload.user_id ? '✅ Present' : '❌ Missing');
    console.log('- email:', payload.email ? '✅ Present' : '❌ Missing');
    console.log('- exp:', payload.exp ? '✅ Present' : '❌ Missing');
    
    // Check expiration
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expDate < now;
      
      console.log(`- Expiration: ${isExpired ? '❌ Expired' : '✅ Valid'} (${expDate.toLocaleString()})`);
    }
    
    // Overall validity
    const isValid = payload.user_id && payload.email && payload.exp && (new Date(payload.exp * 1000) > new Date());
    console.log('=======================================');
    console.log(`🏁 Overall Token Status: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValid && payload.email === undefined) {
      console.log('🛠️ Recommendation: This token is missing the email field required by the backend.');
      console.log('   Please log out and log in again to get a properly formatted token.');
    }
    
  } catch (error) {
    console.log('❌ Error validating token:', error);
  }
}

// Run the test
testAuthTokenFlow();
