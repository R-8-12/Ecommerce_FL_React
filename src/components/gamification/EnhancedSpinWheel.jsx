/**
 * Enhanced Spin Wheel Component
 * Combines the visual improvements from the TypeScript version with the existing gamification system
 * Features: Better animations, centered spin button, admin-customizable rewards
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGift, FaRedo } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import useGamificationStore from '../../store/useGamificationStore';
import toast from 'react-hot-toast';

// Default segments (fallback if API fails)
const DEFAULT_SEGMENTS = [
  { id: 1, label: "10% OFF", value: 10, type: "discount", color: "#FF6B6B", textColor: "#FFFFFF" },
  { id: 2, label: "FREE SHIPPING", value: "shipping", type: "freebie", color: "#4ECDC4", textColor: "#FFFFFF" },
  { id: 3, label: "20% OFF", value: 20, type: "discount", color: "#45B7D1", textColor: "#FFFFFF" },
  { id: 4, label: "50 COINS", value: 50, type: "coins", color: "#96CEB4", textColor: "#FFFFFF" },
  { id: 5, label: "5% OFF", value: 5, type: "discount", color: "#FFEAA7", textColor: "#2D3436" },
  { id: 6, label: "100 COINS", value: 100, type: "coins", color: "#DDA0DD", textColor: "#FFFFFF" },
  { id: 7, label: "15% OFF", value: 15, type: "discount", color: "#FD79A8", textColor: "#FFFFFF" },
  { id: 8, label: "TRY AGAIN", value: "none", type: "none", color: "#636E72", textColor: "#FFFFFF" }
];

const EnhancedSpinWheel = ({ isOpen, onClose }) => {
  const { spinWheel, isLoading, gamificationStatus } = useGamificationStore();
  
  // State management
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  const wheelRef = useRef(null);

  // Check if daily spin is available
  const dailySpinAvailable = gamificationStatus?.daily_spin_available !== false;

  // Initialize segments from backend data
  useEffect(() => {
    if (gamificationStatus?.spin_wheel_rewards) {
      const backendSegments = gamificationStatus.spin_wheel_rewards.map((reward, index) => ({
        id: reward.id || index + 1,
        label: reward.label,
        value: reward.value,
        type: reward.type,
        color: reward.color || getSegmentColor(index),
        textColor: reward.textColor || getTextColor(reward.color || getSegmentColor(index))
      }));
      setSegments(backendSegments);
    } else {
      setSegments(DEFAULT_SEGMENTS);
    }
  }, [gamificationStatus]);

  // Listen for gamification updates from admin panel
  useEffect(() => {
    const handleGamificationUpdate = () => {
      console.log('🎰 Gamification settings updated, refreshing...');
      // Force refresh gamification status to get new spin wheel rewards
      setTimeout(() => {
        const { fetchGamificationStatus } = useGamificationStore.getState();
        fetchGamificationStatus();
      }, 1000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('gamificationUpdated', handleGamificationUpdate);
      return () => {
        window.removeEventListener('gamificationUpdated', handleGamificationUpdate);
      };
    }
  }, []);

  // Helper function to generate colors if not provided
  const getSegmentColor = (index) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#FD79A8", "#636E72"];
    return colors[index % colors.length];
  };

  const getTextColor = (backgroundColor) => {
    // Calculate contrast and return appropriate text color
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#2D3436' : '#FFFFFF';
  };

  const segmentAngle = 360 / segments.length;

  // Create SVG path for each segment
  const createSegmentPath = (index) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
    const radius = 150;
    const centerX = 160;
    const centerY = 160;
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Get text position for each segment
  const getTextPosition = (index) => {
    const angle = (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
    const radius = 100;
    const centerX = 160;
    const centerY = 160;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  // Spin wheel function
  const spinWheelHandler = async () => {
    if (isSpinning || isLoading) return;

    // Check if daily spin is available
    if (!dailySpinAvailable) {
      toast.error('Daily spin limit reached. Come back tomorrow! 🌅', {
        duration: 4000,
        icon: '⏰'
      });
      return;
    }

    setIsSpinning(true);
    setSelectedPrize(null);
    
    try {
      // Call backend API first to get the actual reward
      const result = await spinWheel();
      
      if (result.success) {
        const reward = result.data.reward;
        
        // Find the segment that matches the won reward
        let winningSegmentIndex = segments.findIndex(segment => 
          segment.type === reward.type && 
          segment.value === reward.value
        );

        // If exact match not found, find by label
        if (winningSegmentIndex === -1) {
          winningSegmentIndex = segments.findIndex(segment => 
            segment.label === reward.label
          );
        }

        // If still not found, use first matching type
        if (winningSegmentIndex === -1) {
          winningSegmentIndex = segments.findIndex(segment => 
            segment.type === reward.type
          );
        }

        // Fallback to first segment if no match
        if (winningSegmentIndex === -1) {
          winningSegmentIndex = 0;
        }

        // Generate rotation to land on winning segment
        const minSpins = 5;
        const maxSpins = 8;
        const spins = Math.random() * (maxSpins - minSpins) + minSpins;
        
        // Calculate target angle for winning segment (pointer at top)
        // Since pointer is at top (0 degrees), we need to rotate to put winning segment at top
        const targetAngle = -(winningSegmentIndex * segmentAngle);
        
        const totalRotation = spins * 360 + targetAngle;
        setRotation(prev => prev + totalRotation);
        
        toast.success(`🎯 Spinning for ${reward.label}!`, { duration: 2000 });
        
        // Set the prize after animation completes
        setTimeout(() => {
          // Set the actual prize from the backend response
          setSelectedPrize({
            ...reward,
            color: segments[winningSegmentIndex]?.color || '#4ECDC4',
            textColor: segments[winningSegmentIndex]?.textColor || '#FFFFFF'
          });
          setIsSpinning(false);
          setHasSpun(true);
        }, 3000);
        
      } else {
        // Handle errors
        if (result.error && result.error.includes('Daily spin limit')) {
          toast.error('Daily spin limit reached!', { duration: 3000 });
        } else {
          toast.error(result.error || 'Spin failed. Please try again.');
        }
        setIsSpinning(false);
      }
    } catch (error) {
      console.error('Spin wheel error:', error);
      toast.error('Something went wrong!');
      setIsSpinning(false);
    }
  };

  // Reset wheel
  const resetWheel = () => {
    setRotation(0);
    setSelectedPrize(null);
    setHasSpun(false);
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
          className="absolute inset-0 backdrop-blur-md bg-black/30"
          onClick={resetWheel}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="relative rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {/* Header */}
          <div className="text-white p-6 text-center relative">
            <button
              onClick={resetWheel}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <FaTimes className="text-white text-lg" />
            </button>
            
            <div className="flex items-center justify-center gap-3 mb-2">
              <HiSparkles className="text-3xl text-yellow-300" />
              <h1 className="text-4xl font-bold">Spin & Win</h1>
              <HiSparkles className="text-3xl text-yellow-300" />
            </div>
            <p className="text-white/80">Spin the wheel for amazing discounts and prizes!</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-3xl m-6 p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              
              {/* Spin Wheel */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {/* Wheel Container */}
                  <div 
                    ref={wheelRef}
                    className="relative w-80 h-80 rounded-full shadow-2xl"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                    }}
                  >
                    <svg width="320" height="320" className="absolute inset-0">
                      {segments.map((segment, index) => {
                        const textPos = getTextPosition(index);
                        return (
                          <g key={segment.id}>
                            <path
                              d={createSegmentPath(index)}
                              fill={segment.color}
                              stroke="#FFFFFF"
                              strokeWidth="2"
                            />
                            <text
                              x={textPos.x}
                              y={textPos.y}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill={segment.textColor}
                              fontSize="12"
                              fontWeight="bold"
                              transform={`rotate(${index * segmentAngle + segmentAngle / 2}, ${textPos.x}, ${textPos.y})`}
                            >
                              {segment.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  
                  {/* Pointer - Fixed position at top */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500 drop-shadow-lg"></div>
                  </div>
                  
                  {/* Center Button - Properly centered */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <motion.button
                      onClick={spinWheelHandler}
                      disabled={isSpinning || isLoading || !dailySpinAvailable}
                      className="w-20 h-20 rounded-full bg-white text-purple-600 border-4 border-purple-600 hover:bg-purple-50 font-bold text-sm shadow-xl flex items-center justify-center"
                      whileHover={!isSpinning && !isLoading && dailySpinAvailable ? { scale: 1.05 } : {}}
                      whileTap={!isSpinning && !isLoading && dailySpinAvailable ? { scale: 0.95 } : {}}
                      style={{
                        cursor: (isSpinning || isLoading || !dailySpinAvailable) ? 'not-allowed' : 'pointer',
                        opacity: (isSpinning || isLoading || !dailySpinAvailable) ? 0.6 : 1
                      }}
                    >
                      {isSpinning ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      ) : !dailySpinAvailable ? (
                        "DONE"
                      ) : (
                        "SPIN"
                      )}
                    </motion.button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex gap-4">
                  <motion.button
                    onClick={spinWheelHandler}
                    disabled={isSpinning || isLoading || !dailySpinAvailable}
                    className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2"
                    style={{
                      background: (isSpinning || isLoading || !dailySpinAvailable) 
                        ? '#9CA3AF' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      cursor: (isSpinning || isLoading || !dailySpinAvailable) ? 'not-allowed' : 'pointer'
                    }}
                    whileHover={!isSpinning && !isLoading && dailySpinAvailable ? { scale: 1.05 } : {}}
                    whileTap={!isSpinning && !isLoading && dailySpinAvailable ? { scale: 0.95 } : {}}
                  >
                    <FaGift className="w-4 h-4" />
                    {isSpinning ? "Spinning..." : !dailySpinAvailable ? "Daily Limit Reached" : "Spin the Wheel"}
                  </motion.button>
                  
                  {hasSpun && (
                    <motion.button
                      onClick={resetWheel}
                      className="px-6 py-3 rounded-xl font-semibold border-2 border-purple-600 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaRedo className="w-4 h-4" />
                      Close
                    </motion.button>
                  )}
                </div>

                {/* Daily limit message */}
                {!dailySpinAvailable && (
                  <p className="text-sm mt-3 text-gray-600 text-center">
                    You've already used your daily spin. Return tomorrow for another chance!
                  </p>
                )}
              </div>

              {/* Result Display */}
              <div className="space-y-6">
                {selectedPrize ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-green-200 bg-green-50 rounded-2xl p-6"
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <FaGift className="text-3xl text-green-600" />
                        <h2 className="text-3xl font-bold text-green-800">Congratulations!</h2>
                      </div>
                      <p className="text-green-700 mb-6">You've won an amazing prize!</p>
                      
                      <div 
                        className="inline-block px-8 py-4 rounded-2xl text-white font-bold text-2xl mb-6 shadow-lg"
                        style={{ backgroundColor: selectedPrize.color }}
                      >
                        {selectedPrize.label}
                      </div>
                      
                      {/* Prize-specific message */}
                      <div className="mb-6">
                        {selectedPrize.type === 'discount' && (
                          <p className="text-gray-700">
                            🎟️ Your discount code has been added to your account!
                          </p>
                        )}
                        {selectedPrize.type === 'coins' && (
                          <p className="text-gray-700">
                            🪙 {selectedPrize.value} coins have been added to your wallet!
                          </p>
                        )}
                        {selectedPrize.type === 'freebie' && (
                          <p className="text-gray-700">
                            🚚 Free shipping will be applied to your next order!
                          </p>
                        )}
                      </div>
                      
                      <motion.button
                        onClick={resetWheel}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Awesome! Continue Shopping
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="border border-gray-200 bg-gray-50 rounded-2xl p-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Win?</h2>
                      <p className="text-gray-600 mb-6">Click the spin button to try your luck!</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {segments.slice(0, 6).map((segment) => (
                          <div 
                            key={segment.id}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-center border"
                            style={{ 
                              backgroundColor: `${segment.color}20`,
                              color: segment.color,
                              borderColor: `${segment.color}40`
                            }}
                          >
                            {segment.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="border border-gray-200 bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">How to Play</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Click the "Spin the Wheel" button to start</p>
                    <p>• Wait for the wheel to stop spinning</p>
                    <p>• Claim your prize and enjoy your reward!</p>
                    <p>• Each customer gets one spin per day</p>
                  </div>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center justify-center space-x-2 p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="text-gray-600">Processing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnhancedSpinWheel;
