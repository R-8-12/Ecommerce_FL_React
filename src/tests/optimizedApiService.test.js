/**
 * OPTIMIZED API SERVICE TEST
 * 
 * This file tests the optimizedApiService against direct Firebase calls
 * to validate that the Backend Gateway Pattern is working correctly.
 */

import optimizedApiService from '../services/optimizedApiService';
import { db } from '../firebase';
import { getDocs, collection, query, limit, orderBy } from 'firebase/firestore';

// Tests for dashboard endpoints
const testDashboardEndpoints = async () => {
  console.log('🧪 Testing Dashboard Endpoints');

  try {
    // Test optimized API
    console.time('optimized-dashboard');
    const optimizedResult = await optimizedApiService.dashboard.getAggregatedData();
    console.timeEnd('optimized-dashboard');
    
    // Test direct Firebase
    console.time('direct-firebase-dashboard');
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const productsSnapshot = await getDocs(collection(db, 'products'));
    console.timeEnd('direct-firebase-dashboard');
    
    const directResult = {
      orders: ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      users: usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      products: productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
    
    console.log('Optimized Result:', optimizedResult);
    console.log('Direct Firebase Result Size:', {
      orders: directResult.orders.length,
      users: directResult.users.length,
      products: directResult.products.length
    });
    
    return {
      success: true,
      optimizedResult,
      directResult
    };
  } catch (error) {
    console.error('Dashboard Test Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Tests for orders endpoints
const testOrdersEndpoints = async () => {
  console.log('🧪 Testing Orders Endpoints');

  try {
    // Test optimized API
    console.time('optimized-orders');
    const optimizedResult = await optimizedApiService.orders.getPaginated({
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      sortDirection: 'desc'
    });
    console.timeEnd('optimized-orders');
    
    // Test direct Firebase
    console.time('direct-firebase-orders');
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('created_at', 'desc'),
      limit(10)
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    console.timeEnd('direct-firebase-orders');
    
    const directResult = {
      orders: ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
    
    console.log('Optimized Orders Result:', optimizedResult);
    console.log('Direct Firebase Orders Count:', directResult.orders.length);
    
    return {
      success: true,
      optimizedResult,
      directResult
    };
  } catch (error) {
    console.error('Orders Test Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Tests for products endpoints
const testProductsEndpoints = async () => {
  console.log('🧪 Testing Products Endpoints');

  try {
    // Test optimized API
    console.time('optimized-products');
    const optimizedResult = await optimizedApiService.products.getPaginated({
      page: 1,
      pageSize: 10
    });
    console.timeEnd('optimized-products');
    
    // Test direct Firebase
    console.time('direct-firebase-products');
    const productsQuery = query(
      collection(db, 'products'),
      limit(10)
    );
    const productsSnapshot = await getDocs(productsQuery);
    console.timeEnd('direct-firebase-products');
    
    const directResult = {
      products: productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
    
    console.log('Optimized Products Result:', optimizedResult);
    console.log('Direct Firebase Products Count:', directResult.products.length);
    
    return {
      success: true,
      optimizedResult,
      directResult
    };
  } catch (error) {
    console.error('Products Test Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Tests for users endpoints
const testUsersEndpoints = async () => {
  console.log('🧪 Testing Users Endpoints');

  try {
    // Test optimized API
    console.time('optimized-users');
    const optimizedResult = await optimizedApiService.users.getPaginated({
      page: 1,
      pageSize: 10
    });
    console.timeEnd('optimized-users');
    
    // Test direct Firebase
    console.time('direct-firebase-users');
    const usersQuery = query(
      collection(db, 'users'),
      limit(10)
    );
    const usersSnapshot = await getDocs(usersQuery);
    console.timeEnd('direct-firebase-users');
    
    const directResult = {
      users: usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
    
    console.log('Optimized Users Result:', optimizedResult);
    console.log('Direct Firebase Users Count:', directResult.users.length);
    
    return {
      success: true,
      optimizedResult,
      directResult
    };
  } catch (error) {
    console.error('Users Test Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting Optimized API Service Tests');
  
  const dashboardResult = await testDashboardEndpoints();
  const ordersResult = await testOrdersEndpoints();
  const productsResult = await testProductsEndpoints();
  const usersResult = await testUsersEndpoints();
  
  console.log('📊 Test Results Summary:');
  console.log('Dashboard:', dashboardResult.success ? '✅ PASS' : '❌ FAIL');
  console.log('Orders:', ordersResult.success ? '✅ PASS' : '❌ FAIL');
  console.log('Products:', productsResult.success ? '✅ PASS' : '❌ FAIL');
  console.log('Users:', usersResult.success ? '✅ PASS' : '❌ FAIL');
  
  return {
    dashboardResult,
    ordersResult,
    productsResult,
    usersResult,
    allPassed: 
      dashboardResult.success && 
      ordersResult.success && 
      productsResult.success && 
      usersResult.success
  };
};

export {
  testDashboardEndpoints,
  testOrdersEndpoints,
  testProductsEndpoints,
  testUsersEndpoints,
  runAllTests
};

export default runAllTests;
