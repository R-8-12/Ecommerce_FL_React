/**
 * Auth Debug Component
 * 
 * This component helps troubleshoot authentication issues in development mode
 * It will only render in development environment
 */

import React, { useState, useEffect } from 'react';
import { debugAuthToken, refreshToken } from '../../services/api';
import { TOKEN_KEY, USER_KEY } from '../../utils/constants';

const AuthDebugger = () => {
  const [tokenStatus, setTokenStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    const checkToken = () => {
      const status = debugAuthToken();
      setTokenStatus(status);
    };
    
    checkToken();
    
    // Re-check when localStorage changes
    const handleStorageChange = () => {
      checkToken();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const handleRefreshToken = async () => {
    const result = await refreshToken();
    if (result) {
      setTokenStatus(debugAuthToken());
      alert('Token refreshed successfully!');
    } else {
      alert('Failed to refresh token. See console for details.');
    }
  };
  
  // If no token issues, don't show anything
  if (!tokenStatus || tokenStatus.status === 'valid') {
    return (
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          zIndex: 9999, 
          cursor: 'pointer'
        }}
        onClick={() => setIsVisible(true)}
        title="Auth Status: OK"
      >
        <span role="img" aria-label="Auth OK" style={{ fontSize: '24px' }}>🔐</span>
      </div>
    );
  }
  
  if (!isVisible) {
    return (
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          zIndex: 9999, 
          backgroundColor: '#ff4d4f', 
          padding: '10px', 
          borderRadius: '50%', 
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
        onClick={() => setIsVisible(true)}
        title="Auth Issues Detected"
      >
        <span role="img" aria-label="Auth Warning" style={{ fontSize: '24px' }}>⚠️</span>
      </div>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '350px',
      backgroundColor: '#f0f2f5',
      border: '1px solid #d9d9d9',
      borderRadius: '4px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 9999,
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Auth Token Debugger</h3>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      
      <div>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ 
            fontWeight: 'bold', 
            color: tokenStatus.status === 'valid' ? 'green' : 'red' 
          }}>
            Status: {tokenStatus.status}
          </span>
        </div>
        
        {tokenStatus.error && (
          <div style={{ 
            backgroundColor: '#fff2f0', 
            border: '1px solid #ffccc7', 
            borderRadius: '4px', 
            padding: '8px', 
            marginBottom: '10px',
            color: '#cf1322'
          }}>
            Error: {tokenStatus.error}
          </div>
        )}
        
        {tokenStatus.payload && (
          <div>
            <h4 style={{ margin: '10px 0', fontSize: '14px' }}>Token Payload:</h4>
            <div style={{ 
              backgroundColor: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: '4px', 
              padding: '8px',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '150px'
            }}>
              <pre>{JSON.stringify(tokenStatus.payload, null, 2)}</pre>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={handleRefreshToken}
            style={{
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Token
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              window.location.href = '/login';
            }}
            style={{
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear & Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugger;
