import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuth';
import useGamificationStore from '../../store/useGamificationStore';

const AuthDebugPanel = () => {
  const { user, isAuthenticated, getToken, login, logout } = useAuthStore();
  const { fetchWallet, fetchGamificationStatus, isLoading } = useGamificationStore();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem('anand_mobiles_user');
    const storedToken = localStorage.getItem('anand_mobiles_token');
    
    setDebugInfo({
      isAuthenticated,
      user,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 50)}...` : 'No token',
      storedUser: storedUser ? JSON.parse(storedUser) : null,
      hasStoredToken: !!storedToken,
      localStorage: {
        userKey: !!localStorage.getItem('anand_mobiles_user'),
        tokenKey: !!localStorage.getItem('anand_mobiles_token')
      }
    });
  }, [isAuthenticated, user, getToken]);

  const testGamificationEndpoints = async () => {
    console.log('🧪 Testing gamification endpoints...');
    try {
      await fetchWallet();
      await fetchGamificationStatus();
      console.log('✅ Gamification endpoints working');
    } catch (error) {
      console.error('❌ Gamification endpoints failed:', error);
    }
  };

  const testLogin = async () => {
    console.log('🔐 Testing login...');
    try {
      // Try to login with test credentials
      await login({
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      // Manually set a test token for debugging
      const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdF91c2VyX2dhbWlmaWNhdGlvbiIsImVtYWlsIjoidGVzdC5nYW1pZmljYXRpb25AZXhhbXBsZS5jb20iLCJ1aWQiOiJ0ZXN0X3VzZXJfZ2FtaWZpY2F0aW9uIiwiZXhwIjoxNzU0ODEzOTQ4LCJpYXQiOjE3NTQ2NDExNDh9.E5BL81bcwLLMloHqJyeAIT2mny9dzI8xk5Ktlyst_3oU";
      const testUser = {
        email: 'test.gamification@example.com',
        uid: 'test_user_gamification',
        first_name: 'Test',
        last_name: 'User'
      };
      
      localStorage.setItem('anand_mobiles_token', testToken);
      localStorage.setItem('anand_mobiles_user', JSON.stringify(testUser));
      
      // Force page refresh to reload auth state
      window.location.reload();
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '15px',
      borderRadius: '5px',
      maxWidth: '400px',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h4>🔍 Auth Debug Panel</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Authentication Status:</strong>
        <div>Authenticated: {debugInfo.isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {debugInfo.user?.email || 'None'}</div>
        <div>Has Token: {debugInfo.hasToken ? '✅' : '❌'}</div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Token Info:</strong>
        <div style={{ wordBreak: 'break-all', fontSize: '10px' }}>
          {debugInfo.tokenPreview}
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>LocalStorage:</strong>
        <div>User stored: {debugInfo.localStorage?.userKey ? '✅' : '❌'}</div>
        <div>Token stored: {debugInfo.localStorage?.tokenKey ? '✅' : '❌'}</div>
      </div>
      
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        <button 
          onClick={testGamificationEndpoints}
          disabled={isLoading}
          style={{
            padding: '5px 10px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          {isLoading ? 'Testing...' : 'Test Gamification'}
        </button>
        
        <button 
          onClick={testLogin}
          style={{
            padding: '5px 10px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Set Test Token
        </button>
        
        <button 
          onClick={logout}
          style={{
            padding: '5px 10px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        Check browser console for detailed logs
      </div>
    </div>
  );
};

export default AuthDebugPanel;
