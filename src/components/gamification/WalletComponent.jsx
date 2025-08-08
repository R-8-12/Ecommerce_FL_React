/**
 * Wallet Component for Header Navigation
 * Displays user's coin balance and provides access to wallet features
 * Uses admin customizable theme variables for consistent styling
 * Role-based access: Available for customers and admins, excluded for delivery partners
 */

import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'; // Used for JSX motion elements
import { FaCoins, FaWallet, FaGift, FaTrophy, FaStar, FaAward, FaUsers } from 'react-icons/fa';
import useGamificationStore from '../../store/useGamificationStore';
import { useAuthStore } from '../../store/useAuth';
import { useNavigate } from 'react-router-dom';

const WalletComponent = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    wallet,
    coinBalance,
    gamificationStatus,
    isLoading,
    fetchWallet,
    fetchGamificationStatus,
    openWalletModal,
    openSpinWheel
  } = useGamificationStore();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [animatedBalance, setAnimatedBalance] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWallet();
      fetchGamificationStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]); // Only depend on auth state to prevent infinite loop

  // Animate balance changes
  useEffect(() => {
    if (coinBalance !== animatedBalance) {
      const duration = 1000;
      const start = animatedBalance;
      const end = coinBalance;
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        setAnimatedBalance(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [coinBalance, animatedBalance]);

  // Role-based access control - exclude delivery partners
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user is delivery partner (exclude gamification for them)
  const userRole = user?.role || user?.user_type || 'customer';
  if (userRole === 'delivery_partner' || userRole === 'delivery' || userRole === 'deliveryman') {
    return null;
  }

  const handleWalletClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSpinWheel = () => {
    setShowDropdown(false);
    openSpinWheel();
  };

  const handleViewWallet = () => {
    setShowDropdown(false);
    openWalletModal();
  };

  const userLevel = gamificationStatus?.level || 1;
  const dailySpinAvailable = gamificationStatus?.daily_spin_available || false;

  return (
    <div className="relative">
      {/* Wallet Icon & Balance - Using Theme Variables */}
      <motion.button
        onClick={handleWalletClick}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-hover) 100%)',
          color: 'var(--text-on-brand)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaWallet className="text-lg" />
        <div className="flex items-center space-x-1">
          <FaCoins className="opacity-80" />
          <span className="font-semibold">
            {isLoading ? '...' : animatedBalance.toLocaleString()}
          </span>
        </div>
        
        {/* Notification Badge for Available Spin */}
        {dailySpinAvailable && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--error-color)' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl overflow-hidden z-50"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            {/* Header - Using Theme Variables */}
            <div 
              className="px-6 py-4"
              style={{
                background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
                color: 'var(--text-on-brand)'
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">My Wallet</h3>
                <div className="flex items-center space-x-1">
                  <FaStar style={{ color: 'var(--warning-color)' }} />
                  <span className="text-sm">Level {userLevel}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <FaCoins style={{ color: 'var(--warning-color)' }} />
                <span className="text-2xl font-bold">{coinBalance.toLocaleString()}</span>
                <span className="text-sm opacity-80">coins</span>
              </div>
            </div>

            {/* Quick Stats - Using Theme Variables */}
            <div 
              className="p-4"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--success-color)' }}
                  >
                    {wallet?.total_earned || 0}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Total Earned
                  </div>
                </div>
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    {gamificationStatus?.login_streak || 0}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Login Streak
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-3">
              {/* Spin Wheel Button - Using Theme Variables */}
              <motion.button
                onClick={handleSpinWheel}
                disabled={!dailySpinAvailable}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  dailySpinAvailable ? '' : 'cursor-not-allowed opacity-50'
                }`}
                style={{
                  background: dailySpinAvailable 
                    ? 'linear-gradient(135deg, var(--error-color) 0%, var(--warning-color) 100%)'
                    : 'var(--bg-tertiary)',
                  color: dailySpinAvailable ? 'var(--text-on-brand)' : 'var(--text-secondary)'
                }}
                whileHover={dailySpinAvailable ? { scale: 1.02 } : {}}
                whileTap={dailySpinAvailable ? { scale: 0.98 } : {}}
              >
                <FaGift className="text-lg" />
                <span>
                  {dailySpinAvailable ? 'Daily Spin Available!' : 'Spin Used Today'}
                </span>
                {dailySpinAvailable && (
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--warning-color)' }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </motion.button>

              {/* View Wallet Button - Using Theme Variables */}
              <motion.button
                onClick={handleViewWallet}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
                  color: 'var(--text-on-brand)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaTrophy className="text-lg" />
                <span>View Full Wallet</span>
              </motion.button>

              {/* Gamification Dashboard Link */}
              <motion.button
                onClick={() => { setShowDropdown(false); navigate('/gamification'); }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-primary) 100%)',
                  color: 'var(--text-on-brand)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaAward className="text-lg" />
                <span>Gamification Hub</span>
              </motion.button>

              {/* Refer & Earn Link */}
              <motion.button
                onClick={() => { setShowDropdown(false); navigate('/gamification?tab=refer'); }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--success-color) 0%, var(--brand-primary) 100%)',
                  color: 'var(--text-on-brand)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaUsers className="text-lg" />
                <span>Refer & Earn</span>
              </motion.button>
            </div>

            {/* Recent Achievement - Using Theme Variables */}
            {gamificationStatus?.achievements?.length > 0 && (
              <div className="px-4 pb-4">
                <div 
                  className="border rounded-lg p-3"
                  style={{
                    backgroundColor: 'var(--bg-accent-light)',
                    borderColor: 'var(--warning-color)'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {gamificationStatus.achievements[0].icon}
                    </span>
                    <div>
                      <div 
                        className="text-sm font-medium"
                        style={{ color: 'var(--warning-color)' }}
                      >
                        Latest Achievement
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {gamificationStatus.achievements[0].title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Close Dropdown on Outside Click */}
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={() => setShowDropdown(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletComponent;
