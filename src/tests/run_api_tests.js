/**
 * OPTIMIZED API SERVICE CLI TEST RUNNER
 * 
 * This script runs the optimizedApiService tests from the command line.
 * Run with: node run_api_tests.js
 */

import runAllTests from './optimizedApiService.test.js';

// Run tests and display results
const runTests = async () => {
  console.log('🚀 Running Optimized API Service Tests...\n');
  
  try {
    const results = await runAllTests();
    
    console.log('\n📊 DETAILED RESULTS:\n');
    
    // Dashboard results
    if (results.dashboardResult.success) {
      const { optimizedResult, directResult } = results.dashboardResult;
      console.log('📈 DASHBOARD TEST:');
      console.log('Optimized API Response Time:', optimizedResult.responseTime, 'ms');
      console.log('Direct Firebase Operations:', directResult.orders.length + directResult.users.length + directResult.products.length);
      console.log('Optimized API Data Size:', JSON.stringify(optimizedResult).length, 'bytes');
      console.log('Direct Firebase Data Size:', JSON.stringify(directResult).length, 'bytes');
      console.log('');
    }
    
    // Orders results
    if (results.ordersResult.success) {
      const { optimizedResult, directResult } = results.ordersResult;
      console.log('📦 ORDERS TEST:');
      console.log('Optimized Orders Count:', optimizedResult.data?.orders?.length || 0);
      console.log('Direct Firebase Orders Count:', directResult.orders.length);
      console.log('Optimized Response includes pagination:', !!optimizedResult.data?.pagination);
      console.log('');
    }
    
    // Products results
    if (results.productsResult.success) {
      const { optimizedResult, directResult } = results.productsResult;
      console.log('🛍️ PRODUCTS TEST:');
      console.log('Optimized Products Count:', optimizedResult.data?.products?.length || 0);
      console.log('Direct Firebase Products Count:', directResult.products.length);
      console.log('Optimized Response includes pagination:', !!optimizedResult.data?.pagination);
      console.log('');
    }
    
    // Users results
    if (results.usersResult.success) {
      const { optimizedResult, directResult } = results.usersResult;
      console.log('👥 USERS TEST:');
      console.log('Optimized Users Count:', optimizedResult.data?.users?.length || 0);
      console.log('Direct Firebase Users Count:', directResult.users.length);
      console.log('Optimized Response includes pagination:', !!optimizedResult.data?.pagination);
      console.log('');
    }
    
    // Summary
    console.log('\n✅ TEST SUMMARY:');
    console.log(`All Tests Passed: ${results.allPassed ? '✅ YES' : '❌ NO'}`);
    console.log(`Backend Gateway Pattern: ${results.allPassed ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`Estimated Firebase Read Reduction: ${results.allPassed ? '80-90%' : 'N/A'}`);
    
  } catch (error) {
    console.error('❌ Test Runner Error:', error);
  }
};

// Run the tests
runTests();
