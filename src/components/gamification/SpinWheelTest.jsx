/**
 * Spin Wheel Test Component
 * For testing and debugging spin wheel functionality
 */

import React, { useState, useEffect } from 'react';
import useGamificationStore from '../../store/useGamificationStore';
import SpinWheel from './SpinWheel';

const SpinWheelTest = () => {
  const {
    gamificationStatus,
    fetchGamificationStatus,
    openSpinWheel,
    closeSpinWheel,
    isSpinWheelOpen
  } = useGamificationStore();

  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    // Fetch gamification status on mount
    fetchGamificationStatus();
  }, [fetchGamificationStatus]);

  const runTests = async () => {
    const results = [];
    
    // Test 1: Check if gamification status is loaded
    if (gamificationStatus) {
      results.push({
        test: 'Gamification Status Loaded',
        status: '✅ PASS',
        details: `Daily spin available: ${gamificationStatus.daily_spin_available}`
      });
    } else {
      results.push({
        test: 'Gamification Status Loaded',
        status: '❌ FAIL',
        details: 'No gamification status found'
      });
    }

    // Test 2: Check spin wheel rewards
    if (gamificationStatus?.spin_wheel_rewards) {
      results.push({
        test: 'Spin Wheel Rewards Available',
        status: '✅ PASS',
        details: `${gamificationStatus.spin_wheel_rewards.length} rewards configured`
      });
    } else {
      results.push({
        test: 'Spin Wheel Rewards Available',
        status: '⚠️ WARNING',
        details: 'Using default rewards (backend rewards not available)'
      });
    }

    // Test 3: Check daily spin availability
    const dailySpinAvailable = gamificationStatus?.daily_spin_available !== false;
    results.push({
      test: 'Daily Spin Availability',
      status: dailySpinAvailable ? '✅ AVAILABLE' : '⏰ UNAVAILABLE',
      details: dailySpinAvailable ? 'User can spin today' : 'Daily limit reached'
    });

    // Test 4: Check backdrop styling
    const backdropElement = document.querySelector('.fixed.inset-0.z-50');
    if (backdropElement) {
      const computedStyle = window.getComputedStyle(backdropElement);
      const backgroundColor = computedStyle.backgroundColor;
      const backdropFilter = computedStyle.backdropFilter;
      
      if (backgroundColor.includes('rgba(0, 0, 0, 0.2)') || backgroundColor.includes('rgba(0, 0, 0, 0.3)')) {
        results.push({
          test: 'Backdrop Styling',
          status: '✅ PASS',
          details: 'Backdrop uses proper overlay with blur effect'
        });
      } else {
        results.push({
          test: 'Backdrop Styling',
          status: '⚠️ WARNING',
          details: `Backdrop color: ${backgroundColor}, Filter: ${backdropFilter}`
        });
      }
    } else {
      results.push({
        test: 'Backdrop Styling',
        status: '❌ FAIL',
        details: 'Backdrop element not found'
      });
    }

    setTestResults(results);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Spin Wheel Test Panel
      </h2>

      {/* Test Controls */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Test Controls
        </h3>
        <div className="flex space-x-4">
          <button
            onClick={runTests}
            className="px-4 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-primary) 100%)',
              color: 'var(--text-on-brand)'
            }}
          >
            Run Tests
          </button>
          <button
            onClick={openSpinWheel}
            className="px-4 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--success-color) 0%, var(--brand-primary) 100%)',
              color: 'var(--text-on-brand)'
            }}
          >
            Open Spin Wheel
          </button>
          <button
            onClick={fetchGamificationStatus}
            className="px-4 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--warning-color) 0%, var(--brand-primary) 100%)',
              color: 'var(--text-on-brand)'
            }}
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Test Results
          </h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {result.test}
                  </span>
                  <span className="font-bold">{result.status}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {result.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gamification Status Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Gamification Status
        </h3>
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <pre className="text-sm overflow-auto" style={{ color: 'var(--text-secondary)' }}>
            {JSON.stringify(gamificationStatus, null, 2)}
          </pre>
        </div>
      </div>

      {/* Spin Wheel Component */}
      <SpinWheel 
        isOpen={isSpinWheelOpen}
        onClose={closeSpinWheel}
      />
    </div>
  );
};

export default SpinWheelTest;
