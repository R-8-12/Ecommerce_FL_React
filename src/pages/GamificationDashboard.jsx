/**
 * Gamification Dashboard
 * Comprehensive user dashboard for wallet, achievements, and gamification features
 * Uses admin customizable theme variables for consistent styling
 */

import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGift, FiTarget, FiUsers, FiStar, FiCalendar,
  FiTrendingUp, FiClock, FiRefreshCw, FiAward, FiZap, FiShare2
} from 'react-icons/fi';
import { FaTrophy, FaSpinner, FaMedal, FaCoins } from 'react-icons/fa';
import useGamificationStore from '../store/useGamificationStore';
import { useAuthStore } from '../store/useAuth';
import Button from '../components/ui/Button';
import SpinWheel from '../components/gamification/SpinWheel';
import WalletModal from '../components/gamification/WalletModal';

const GamificationDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    // wallet, // Available if needed for future features
    coinBalance,
    gamificationStatus,
    achievements,
    leaderboard,
    isLoading,
    fetchWallet,
    fetchGamificationStatus,
    fetchLeaderboard,
    openSpinWheel,
    openWalletModal,
    isSpinWheelOpen,
    isWalletModalOpen
  } = useGamificationStore();

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWallet();
      fetchGamificationStatus();
      fetchLeaderboard();
    }
  }, [isAuthenticated, user, fetchWallet, fetchGamificationStatus, fetchLeaderboard]);

  // Role-based access control - exclude delivery partners
  if (!isAuthenticated || !user) {
    return (
      <div 
        className="p-6 text-center"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
      >
        Please log in to access gamification features.
      </div>
    );
  }

  const userRole = user?.role || user?.user_type || 'customer';
  if (userRole === 'delivery_partner' || userRole === 'delivery' || userRole === 'deliveryman') {
    return null; // Hide for delivery partners
  }

  const getUserLevelInfo = (level) => {
    const levels = {
      'Bronze': { color: '#CD7F32', nextLevel: 'Silver', threshold: 500 },
      'Silver': { color: '#C0C0C0', nextLevel: 'Gold', threshold: 1000 },
      'Gold': { color: '#FFD700', nextLevel: 'Platinum', threshold: 2500 },
      'Platinum': { color: '#E5E4E2', nextLevel: 'Diamond', threshold: 5000 },
      'Diamond': { color: '#B9F2FF', nextLevel: 'Max Level', threshold: 10000 }
    };
    return levels[level] || levels['Bronze'];
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiTrendingUp /> },
    { id: 'achievements', label: 'Achievements', icon: <FaTrophy /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <FiUsers /> },
    { id: 'rewards', label: 'Rewards', icon: <FiGift /> }
  ];

  const renderOverviewTab = () => {
    const userLevelInfo = getUserLevelInfo(gamificationStatus?.level || 'Bronze');
    const progressPercentage = Math.min(
      ((coinBalance - (userLevelInfo.threshold - 500)) / 500) * 100, 
      100
    );

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <FaCoins 
                  size={32} 
                  style={{ color: 'var(--warning-color)' }}
                />
                <h3 
                  className="text-2xl font-bold mt-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {coinBalance.toLocaleString()}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>Total Coins</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <FiStar 
                  size={32} 
                  style={{ color: userLevelInfo.color }}
                />
                <h3 
                  className="text-lg font-bold mt-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {gamificationStatus?.level || 'Bronze'}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>Current Level</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <FiCalendar 
                  size={32} 
                  style={{ color: 'var(--success-color)' }}
                />
                <h3 
                  className="text-2xl font-bold mt-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {gamificationStatus?.login_streak || 0}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>Day Streak</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <FaTrophy 
                  size={32} 
                  style={{ color: 'var(--brand-primary)' }}
                />
                <h3 
                  className="text-2xl font-bold mt-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {achievements?.length || 0}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>Achievements</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Level Progress */}
        <div 
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Level Progress
            </h3>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {coinBalance} / {userLevelInfo.threshold} coins
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <motion.div
              className="h-4 rounded-full"
              style={{ backgroundColor: userLevelInfo.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>
              Current: {gamificationStatus?.level || 'Bronze'}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Next: {userLevelInfo.nextLevel}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={openSpinWheel}
              variant="primary"
              disabled={!gamificationStatus?.daily_spin_available}
              className="flex items-center justify-center space-x-2 py-3"
            >
              <FiGift />
              <span>
                {gamificationStatus?.daily_spin_available ? 'Daily Spin Available!' : 'Come Back Tomorrow'}
              </span>
            </Button>

            <Button
              onClick={openWalletModal}
              variant="secondary"
              className="flex items-center justify-center space-x-2 py-3"
            >
              <FaCoins />
              <span>View Wallet</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2 py-3"
            >
              <FiShare2 />
              <span>Refer Friends</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      <h3 
        className="text-xl font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Your Achievements
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements?.map((achievement, index) => (
          <motion.div
            key={index}
            className="p-6 rounded-xl border shadow-md"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{achievement.icon}</div>
              <h4 
                className="font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {achievement.title}
              </h4>
              <p 
                className="text-sm mb-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                {achievement.description}
              </p>
              <div 
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'var(--success-color)',
                  color: 'var(--text-on-brand)'
                }}
              >
                +{achievement.reward_coins} coins
              </div>
            </div>
          </motion.div>
        ))}
        
        {(!achievements || achievements.length === 0) && (
          <div 
            className="col-span-full text-center p-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            <FaTrophy size={48} className="mx-auto mb-4 opacity-50" />
            <p>No achievements yet. Start shopping to unlock rewards!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="space-y-6">
      <h3 
        className="text-xl font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Community Leaderboard
      </h3>
      
      <div 
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        {leaderboard?.map((user, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-4 ${
              index !== leaderboard.length - 1 ? 'border-b' : ''
            }`}
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: index < 3 ? 'var(--warning-color)' : 'var(--bg-tertiary)',
                  color: index < 3 ? 'var(--text-on-brand)' : 'var(--text-primary)'
                }}
              >
                {index + 1}
              </div>
              <div>
                <h4 
                  className="font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user.name}
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Level {user.level}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div 
                className="font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {user.coins.toLocaleString()} coins
              </div>
              <div 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {user.points} points
              </div>
            </div>
          </div>
        ))}
        
        {(!leaderboard || leaderboard.length === 0) && (
          <div 
            className="text-center p-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            <FiUsers size={48} className="mx-auto mb-4 opacity-50" />
            <p>Leaderboard will update soon!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRewardsTab = () => (
    <div className="space-y-6">
      <h3 
        className="text-xl font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Available Rewards
      </h3>
      
      <div 
        className="p-6 rounded-xl border text-center"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <FiGift 
          size={48} 
          style={{ color: 'var(--brand-primary)' }} 
          className="mx-auto mb-4"
        />
        <p style={{ color: 'var(--text-secondary)' }}>
          Rewards system will be implemented here
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div 
        className="p-8 text-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <FaSpinner 
          className="animate-spin mx-auto mb-4" 
          size={32}
          style={{ color: 'var(--brand-primary)' }}
        />
        <p style={{ color: 'var(--text-secondary)' }}>Loading gamification data...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Gamification Hub
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Track your progress, earn coins, and unlock rewards!
            </p>
          </div>
          
          <motion.div
            className="flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
              color: 'var(--text-on-brand)'
            }}
            whileHover={{ scale: 1.05 }}
          >
            <FaCoins className="text-lg" />
            <span className="font-bold text-xl">{coinBalance.toLocaleString()}</span>
            <span className="text-sm opacity-80">coins</span>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'shadow-lg' : ''
              }`}
              style={{
                backgroundColor: activeTab === tab.id 
                  ? 'var(--brand-primary)' 
                  : 'var(--bg-secondary)',
                color: activeTab === tab.id 
                  ? 'var(--text-on-brand)' 
                  : 'var(--text-primary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'achievements' && renderAchievementsTab()}
            {activeTab === 'leaderboard' && renderLeaderboardTab()}
            {activeTab === 'rewards' && renderRewardsTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      {isSpinWheelOpen && <SpinWheel />}
      {isWalletModalOpen && <WalletModal />}
    </div>
  );
};

export default GamificationDashboard;
