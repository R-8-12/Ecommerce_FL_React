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
  }, [isOpen, fetchWallet, fetchGamificationStatus]);

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
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FaCoins className="text-3xl text-yellow-300" />
                <div>
                  <h2 className="text-2xl font-bold">My Wallet</h2>
                  <p className="text-blue-200">Manage your coins and rewards</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading wallet...</p>
              </div>
            ) : (
              <>
                {/* Balance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Current Balance</p>
                        <p className="text-2xl font-bold">{wallet?.balance || 0}</p>
                      </div>
                      <FaCoins className="text-3xl text-green-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Earned</p>
                        <p className="text-2xl font-bold">{wallet?.total_earned || 0}</p>
                      </div>
                      <FaArrowUp className="text-3xl text-blue-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">User Level</p>
                        <p className="text-2xl font-bold">{gamificationStatus?.level || 1}</p>
                      </div>
                      <FaStar className="text-3xl text-purple-200" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => {
                        onClose();
                        openSpinWheel();
                      }}
                      className="flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!gamificationStatus?.daily_spin_available}
                    >
                      <FaGift />
                      <span>
                        {gamificationStatus?.daily_spin_available ? 'Daily Spin' : 'Spin Used Today'}
                      </span>
                    </motion.button>

                    <motion.button
                      className="flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all"
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
                    <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {gamificationStatus.achievements.slice(0, 4).map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <p className="font-medium text-gray-800">{achievement.title}</p>
                            <p className="text-sm text-gray-600">Achievement unlocked!</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                  {wallet?.recent_transactions?.length > 0 ? (
                    <div className="space-y-3">
                      {wallet.recent_transactions.map((transaction, index) => (
                        <motion.div
                          key={transaction.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type, transaction.action)}
                            <div>
                              <p className="font-medium text-gray-800">
                                {transaction.description || 'Transaction'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatDate(transaction.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                            </p>
                            <p className="text-xs text-gray-500">coins</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaCoins className="text-4xl mx-auto mb-2 text-gray-300" />
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
