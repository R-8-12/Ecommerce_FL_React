/**
 * Wallet Modal Component
 * Detailed view of user's wallet with transactions and achievements
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaCoins, 
  FaArrowUp, 
  FaArrowDown, 
  FaTrophy, 
  FaStar,
  FaGift,
  FaShoppingCart,
  FaHeart,
  FaUser
} from 'react-icons/fa';
import useGamificationStore from '../../store/useGamificationStore';

const WalletModal = ({ isOpen, onClose }) => {
  const {
    wallet,
    gamificationStatus,
    isLoading,
    fetchWallet,
    fetchGamificationStatus,
    openSpinWheel
  } = useGamificationStore();

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
      fetchGamificationStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only depend on isOpen to prevent infinite loop

  if (!isOpen) return null;

  const getTransactionIcon = (type, action) => {
    if (type === 'earned') {
      switch (action) {
        case 'signup': return <FaUser className="text-blue-500" />;
        case 'add_wishlist': return <FaHeart className="text-red-500" />;
        case 'first_purchase': return <FaShoppingCart className="text-green-500" />;
        case 'spin_wheel': return <FaGift className="text-purple-500" />;
        default: return <FaCoins className="text-yellow-500" />;
      }
    }
    return <FaArrowDown className="text-red-500" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)'
          }}
        >
          {/* Header - Using Admin Theme Colors */}
          <div 
            className="text-white p-6 rounded-t-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-primary) 100%)'
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FaCoins className="text-3xl" style={{ color: 'var(--warning-color)' }} />
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-on-brand)' }}>My Wallet</h2>
                  <p className="opacity-80" style={{ color: 'var(--text-on-brand)' }}>Manage your coins and rewards</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="transition-colors hover:opacity-70"
                style={{ color: 'var(--text-on-brand)' }}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {isLoading ? (
              <div className="text-center py-8">
                <div 
                  className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
                  style={{ borderColor: 'var(--brand-primary)' }}
                ></div>
                <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading wallet...</p>
              </div>
            ) : (
              <>
                {/* Balance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div 
                    className="rounded-xl p-4 text-white"
                    style={{
                      background: 'linear-gradient(135deg, var(--success-color) 0%, var(--brand-primary) 100%)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="opacity-80 text-sm" style={{ color: 'var(--text-on-brand)' }}>Current Balance</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-on-brand)' }}>{wallet?.balance || 0}</p>
                      </div>
                      <FaCoins className="text-3xl opacity-80" style={{ color: 'var(--warning-color)' }} />
                    </div>
                  </div>

                  <div 
                    className="rounded-xl p-4 text-white"
                    style={{
                      background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="opacity-80 text-sm" style={{ color: 'var(--text-on-brand)' }}>Total Earned</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-on-brand)' }}>{wallet?.total_earned || 0}</p>
                      </div>
                      <FaArrowUp className="text-3xl opacity-80" style={{ color: 'var(--success-color)' }} />
                    </div>
                  </div>

                  <div 
                    className="rounded-xl p-4 text-white"
                    style={{
                      background: 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--error-color) 100%)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="opacity-80 text-sm" style={{ color: 'var(--text-on-brand)' }}>User Level</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-on-brand)' }}>{gamificationStatus?.level || 1}</p>
                      </div>
                      <FaStar className="text-3xl opacity-80" style={{ color: 'var(--warning-color)' }} />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => {
                        onClose();
                        openSpinWheel();
                      }}
                      className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all"
                      style={{
                        background: gamificationStatus?.daily_spin_available
                          ? 'linear-gradient(135deg, var(--error-color) 0%, var(--warning-color) 100%)'
                          : 'var(--bg-tertiary)',
                        color: gamificationStatus?.daily_spin_available
                          ? 'var(--text-on-brand)'
                          : 'var(--text-secondary)',
                        cursor: gamificationStatus?.daily_spin_available ? 'pointer' : 'not-allowed'
                      }}
                      whileHover={gamificationStatus?.daily_spin_available ? { scale: 1.02 } : {}}
                      whileTap={gamificationStatus?.daily_spin_available ? { scale: 0.98 } : {}}
                      disabled={!gamificationStatus?.daily_spin_available}
                    >
                      <FaGift />
                      <span>
                        {gamificationStatus?.daily_spin_available ? 'Daily Spin' : 'Spin Used Today'}
                      </span>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        onClose();
                        // Navigate to gamification dashboard achievements tab
                        window.location.href = '/gamification?tab=achievements';
                      }}
                      className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all"
                      style={{
                        background: 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-primary) 100%)',
                        color: 'var(--text-on-brand)'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaTrophy />
                      <span>View Achievements</span>
                    </motion.button>
                  </div>
                </div>

                {/* Achievements */}
                {gamificationStatus?.achievements?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Achievements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {gamificationStatus.achievements.slice(0, 4).map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-3 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--bg-accent-light)',
                            borderColor: 'var(--warning-color)'
                          }}
                        >
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{achievement.title}</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Achievement unlocked!</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
                  {wallet?.recent_transactions?.length > 0 ? (
                    <div className="space-y-3">
                      {wallet.recent_transactions.map((transaction, index) => (
                        <motion.div
                          key={transaction.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-primary)'
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type, transaction.action)}
                            <div>
                              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                {transaction.description || 'Transaction'}
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {formatDate(transaction.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold" style={{
                              color: transaction.type === 'earned' ? 'var(--success-color)' : 'var(--error-color)'
                            }}>
                              {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>coins</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                      <FaCoins className="text-4xl mx-auto mb-2" style={{ color: 'var(--brand-primary)', opacity: '0.3' }} />
                      <p>No transactions yet</p>
                      <p className="text-sm">Start earning coins by exploring the app!</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WalletModal;
