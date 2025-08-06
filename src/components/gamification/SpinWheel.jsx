/**
 * Spin Wheel Component
 * Interactive spin wheel for daily rewards and gamification
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGift, FaCoins, FaPercent, FaShippingFast } from 'react-icons/fa';
import useGamificationStore from '../../store/useGamificationStore';
import toast from 'react-hot-toast';

const SpinWheel = ({ isOpen, onClose }) => {
  const { spinWheel, isLoading } = useGamificationStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState(null);
  const wheelRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  // Spin wheel segments with colors
  const segments = [
    { label: '10 Coins', type: 'coins', value: 10, color: '#FFD700', icon: FaCoins },
    { label: '5% Off', type: 'discount', value: 5, color: '#FF6B6B', icon: FaPercent },
    { label: '25 Coins', type: 'coins', value: 25, color: '#4ECDC4', icon: FaCoins },
    { label: '10% Off', type: 'discount', value: 10, color: '#45B7D1', icon: FaPercent },
    { label: '50 Coins', type: 'coins', value: 50, color: '#96CEB4', icon: FaCoins },
    { label: 'Free Ship', type: 'freebie', value: 'shipping', color: '#FFEAA7', icon: FaShippingFast },
    { label: '15% Off', type: 'discount', value: 15, color: '#DDA0DD', icon: FaPercent },
    { label: '100 Coins', type: 'coins', value: 100, color: '#FF7675', icon: FaCoins },
  ];

  const handleSpin = async () => {
    if (isSpinning || isLoading) return;

    setIsSpinning(true);
    
    try {
      // Generate random rotation (5-10 full spins + random position)
      const spins = 5 + Math.random() * 5;
      const finalRotation = rotation + (spins * 360) + Math.random() * 360;
      setRotation(finalRotation);

      // Wait for spin animation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Call backend API
      const result = await spinWheel();
      
      if (result.success) {
        setWonReward(result.data.reward);
        toast.success('🎉 Congratulations!');
      } else {
        toast.error(result.error || 'Spin failed');
      }
    } catch (error) {
      console.error('Spin wheel error:', error);
      toast.error('Something went wrong!');
    } finally {
      setIsSpinning(false);
    }
  };

  const resetAndClose = () => {
    setWonReward(null);
    setRotation(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={resetAndClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FaGift className="text-2xl" />
                <h2 className="text-2xl font-bold">Daily Spin Wheel</h2>
              </div>
              <button
                onClick={resetAndClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <p className="text-purple-200 mt-2">
              Spin the wheel for your daily reward!
            </p>
          </div>

          {/* Wheel Container */}
          <div className="p-8 text-center">
            <div className="relative mx-auto w-64 h-64 mb-6">
              {/* Wheel */}
              <motion.div
                ref={wheelRef}
                className="w-full h-full rounded-full border-4 border-gray-300 shadow-lg relative overflow-hidden"
                animate={{ rotate: rotation }}
                transition={{ duration: 3, ease: "easeOut" }}
              >
                {/* Segments */}
                {segments.map((segment, index) => {
                  const angle = (360 / segments.length) * index;
                  const nextAngle = (360 / segments.length) * (index + 1);
                  
                  return (
                    <div
                      key={index}
                      className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs"
                      style={{
                        background: `conic-gradient(from ${angle}deg, ${segment.color} ${angle}deg, ${segment.color} ${nextAngle}deg, transparent ${nextAngle}deg)`,
                        clipPath: `polygon(50% 50%, ${50 + 45 * Math.cos((angle * Math.PI) / 180)}% ${50 + 45 * Math.sin((angle * Math.PI) / 180)}%, ${50 + 45 * Math.cos((nextAngle * Math.PI) / 180)}% ${50 + 45 * Math.sin((nextAngle * Math.PI) / 180)}%)`
                      }}
                    >
                      <div 
                        className="absolute text-center"
                        style={{
                          transform: `rotate(${angle + (360 / segments.length) / 2}deg)`,
                          top: '25%',
                          left: '50%',
                          transformOrigin: '0 100%'
                        }}
                      >
                        <segment.icon className="text-lg mb-1" />
                        <div className="text-xs">{segment.label}</div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
              </div>

              {/* Center Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-300">
                  <FaGift className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <motion.button
              onClick={handleSpin}
              disabled={isSpinning || isLoading}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                isSpinning || isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
              }`}
              whileHover={!isSpinning && !isLoading ? { scale: 1.05 } : {}}
              whileTap={!isSpinning && !isLoading ? { scale: 0.95 } : {}}
            >
              {isSpinning ? 'Spinning...' : 'SPIN NOW!'}
            </motion.button>
          </div>

          {/* Result Display */}
          <AnimatePresence>
            {wonReward && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center text-center p-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                    {wonReward.type === 'coins' && <FaCoins className="text-4xl text-white" />}
                    {wonReward.type === 'discount' && <FaPercent className="text-4xl text-white" />}
                    {wonReward.type === 'freebie' && <FaShippingFast className="text-4xl text-white" />}
                  </div>
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Congratulations! 🎉
                </h3>
                <p className="text-xl text-purple-600 font-semibold mb-6">
                  You won {wonReward.label}!
                </p>

                <motion.button
                  onClick={resetAndClose}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Awesome! Continue Shopping
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SpinWheel;
