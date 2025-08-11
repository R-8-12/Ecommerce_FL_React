/**
 * Canvas-based Spin Wheel Component
import React, { useState, useRef, useEffect, useCallback } from 'react';

  // Initialize segments when component mounts or gamification status changes
  useEffect(() => {
    if (gamificationStatus?.spin_wheel_rewards) {
      // Use backend rewards if available
      const backendSegments = gamificationStatus.spin_wheel_rewards.map((reward, index) => ({
        label: reward.label,
        type: reward.type,
        value: reward.value,
        color: getSegmentColor(index),
        textColor: getTextColor(getSegmentColor(index))
      }));
      setSegments(backendSegments);
    } else {
      // Use default segments as fallback
      setSegments(DEFAULT_SEGMENTS);
    }
  }, [gamificationStatus]); wheel for daily rewards and gamification
 * Based on canvas rendering with precise mathematical calculations
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaGift, FaCoins, FaPercent, FaShippingFast, FaTrophy } from 'react-icons/fa';
import useGamificationStore from '../../store/useGamificationStore';
import toast from 'react-hot-toast';

// Default segments (fallback if API fails) - moved outside component to prevent re-creation
const DEFAULT_SEGMENTS = [
  { label: '10 Coins', type: 'coins', value: 10, color: '#FFD700', textColor: '#333333' },
  { label: '5% Off', type: 'discount', value: 5, color: '#FF6B6B', textColor: '#FFFFFF' },
  { label: '25 Coins', type: 'coins', value: 25, color: '#4ECDC4', textColor: '#333333' },
  { label: '10% Off', type: 'discount', value: 10, color: '#45B7D1', textColor: '#FFFFFF' },
  { label: '50 Coins', type: 'coins', value: 50, color: '#96CEB4', textColor: '#333333' },
  { label: 'Free Ship', type: 'freebie', value: 'shipping', color: '#FFEAA7', textColor: '#333333' },
  { label: '15% Off', type: 'discount', value: 15, color: '#DDA0DD', textColor: '#333333' },
  { label: '100 Coins', type: 'coins', value: 100, color: '#FF7675', textColor: '#FFFFFF' },
];

const SpinWheelCanvas = ({ isOpen, onClose }) => {
  const { spinWheel, isLoading, gamificationStatus } = useGamificationStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState(null);
  const [segments, setSegments] = useState([]);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [angularVelocity, setAngularVelocity] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [spinButtonClicked, setSpinButtonClicked] = useState(false);
  
  // Use refs to avoid dependencies in animation loop
  const segmentsRef = useRef([]);
  const isOpenRef = useRef(false);
  const velocityRef = useRef(0);
  const angleRef = useRef(0);
  const spinClickedRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);
  
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);
  
  useEffect(() => {
    velocityRef.current = angularVelocity;
  }, [angularVelocity]);
  
  useEffect(() => {
    angleRef.current = currentAngle;
  }, [currentAngle]);
  
  useEffect(() => {
    spinClickedRef.current = spinButtonClicked;
  }, [spinButtonClicked]);

  // Check if daily spin is available
  const dailySpinAvailable = gamificationStatus?.daily_spin_available !== false;

  // Canvas drawing constants
  const CANVAS_SIZE = 400;
  const RADIUS = CANVAS_SIZE / 2;
  const PI = Math.PI;
  const TAU = 2 * PI;
  const FRICTION = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard

  // Initialize segments when component mounts or gamification status changes
  useEffect(() => {
    if (gamificationStatus?.spin_wheel_rewards) {
      // Use backend rewards if available
      const backendSegments = gamificationStatus.spin_wheel_rewards.map((reward, index) => ({
        label: reward.label,
        type: reward.type,
        value: reward.value,
        color: getSegmentColor(index),
        textColor: getTextColor(getSegmentColor(index))
      }));
      setSegments(backendSegments);
    } else {
      // Use default segments as fallback
      setSegments(DEFAULT_SEGMENTS);
    }
  }, [gamificationStatus]);

  // Helper function to get segment color based on index
  const getSegmentColor = (index) => {
    const colors = [
      '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', 
      '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF7675'
    ];
    return colors[index % colors.length];
  };

  // Helper function to determine text color based on background
  const getTextColor = (backgroundColor) => {
    // Simple contrast detection
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#333333' : '#FFFFFF';
  };

  // Get current winning segment index
  const getCurrentSegmentIndex = useCallback(() => {
    if (segments.length === 0) return 0;
    return Math.floor(segments.length - (currentAngle / TAU) * segments.length) % segments.length;
  }, [currentAngle, segments.length, TAU]);

  // Draw a single segment on canvas
  const drawSegment = useCallback((ctx, segment, index, isWinning = false) => {
    const arc = TAU / segments.length;
    const angle = arc * index;
    
    ctx.save();
    
    // Draw segment background
    ctx.beginPath();
    ctx.fillStyle = isWinning ? '#FFD700' : segment.color;
    ctx.moveTo(RADIUS, RADIUS);
    ctx.arc(RADIUS, RADIUS, RADIUS, angle, angle + arc);
    ctx.lineTo(RADIUS, RADIUS);
    ctx.fill();
    
    // Draw segment border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw text
    ctx.translate(RADIUS, RADIUS);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = isWinning ? '#333333' : segment.textColor;
    ctx.font = 'bold 18px "Lato", sans-serif';
    
    // Handle long text by splitting
    const words = segment.label.split(' ');
    if (words.length > 1) {
      ctx.fillText(words[0], RADIUS - 20, -5);
      ctx.fillText(words.slice(1).join(' '), RADIUS - 20, 15);
    } else {
      ctx.fillText(segment.label, RADIUS - 20, 5);
    }
    
    ctx.restore();
  }, [segments.length, TAU, RADIUS]);

  // Render the wheel
  const renderWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    const currentSegment = getCurrentSegmentIndex();
    
    // Draw all segments
    segments.forEach((segment, index) => {
      drawSegment(ctx, segment, index, index === currentSegment && !angularVelocity);
    });
    
    // Update canvas rotation
    canvas.style.transform = `rotate(${currentAngle - PI / 2}rad)`;
    
  }, [segments, currentAngle, angularVelocity, drawSegment, getCurrentSegmentIndex, PI]);

  // Animation frame loop - simplified to avoid infinite re-renders
  const animate = useCallback(() => {
    if (!angularVelocity && spinButtonClicked) {
      // Wheel has stopped spinning
      const finalSegment = segments[getCurrentSegmentIndex()];
      setSpinButtonClicked(false);
      setIsSpinning(false);
      setWonReward(finalSegment);
      return;
    }
    
    if (angularVelocity > 0) {
      // Update physics
      let newVelocity = angularVelocity * FRICTION;
      if (newVelocity < 0.002) newVelocity = 0;
      
      setAngularVelocity(newVelocity);
      setCurrentAngle(prev => (prev + newVelocity) % TAU);
    }
    
    if (animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [angularVelocity, spinButtonClicked, segments, FRICTION, TAU]);

  // Initialize canvas and start animation loop - simplified
  useEffect(() => {
    if (isOpen && segments.length > 0) {
      renderWheel();
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isOpen, segments.length]); // Simplified dependencies

  // Update wheel rendering when angle changes - debounced
  useEffect(() => {
    if (isOpen && segments.length > 0) {
      renderWheel();
    }
  }, [currentAngle, isOpen, segments.length]); // Simplified dependencies

  const handleSpin = async () => {
    if (isSpinning || isLoading || angularVelocity > 0) return;

    // Check if daily spin is available
    if (!dailySpinAvailable) {
      toast.error('Daily spin limit reached. Come back tomorrow! 🌅', {
        duration: 4000,
        icon: '⏰'
      });
      return;
    }

    setIsSpinning(true);
    setWonReward(null);
    setSpinButtonClicked(true);
    
    try {
      // Call backend API first to get the actual reward
      const result = await spinWheel();
      
      if (result.success) {
        const reward = result.data.reward;
        
        // Find the segment that matches the won reward
        const winningSegmentIndex = segments.findIndex(segment => 
          segment.type === reward.type && 
          segment.value === reward.value &&
          segment.label === reward.label
        );

        if (winningSegmentIndex !== -1) {
          // Set initial velocity to reach the target
          const initialVelocity = 0.3 + Math.random() * 0.2;
          setAngularVelocity(initialVelocity);
          
          toast.success(`🎯 Spinning for ${reward.label}!`, { duration: 2000 });
        } else {
          // Fallback to random spin
          const initialVelocity = 0.25 + Math.random() * 0.2;
          setAngularVelocity(initialVelocity);
          toast.success('🎯 Good luck!', { duration: 2000 });
        }
      } else {
        // Handle specific error messages from backend
        if (result.error && result.error.includes('Daily spin limit')) {
          toast.error('Daily spin limit reached!', { duration: 3000 });
        } else {
          toast.error(result.error || 'Spin failed. Please try again.');
        }
        setIsSpinning(false);
        setSpinButtonClicked(false);
      }
    } catch (error) {
      console.error('Spin wheel error:', error);
      toast.error('Something went wrong!');
      setIsSpinning(false);
      setSpinButtonClicked(false);
    }
  };

  const resetAndClose = () => {
    setWonReward(null);
    setCurrentAngle(0);
    setAngularVelocity(0);
    setSpinButtonClicked(false);
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
          className="absolute inset-0 backdrop-blur-md"
          onClick={resetAndClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="relative rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)'
          }}
        >
          {/* Header */}
          <div 
            className="text-white p-6 rounded-t-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-primary) 100%)'
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FaGift className="text-2xl" style={{ color: 'var(--warning-color)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-on-brand)' }}>Daily Spin Wheel</h2>
              </div>
              <button
                onClick={resetAndClose}
                className="transition-colors hover:opacity-70"
                style={{ color: 'var(--text-on-brand)' }}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <p className="opacity-80 mt-2" style={{ color: 'var(--text-on-brand)' }}>
              Spin the wheel for your daily reward!
            </p>
          </div>

          {/* Wheel Container */}
          <div className="p-8 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="relative mx-auto mb-6" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
              {/* Canvas Wheel */}
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="block rounded-full shadow-lg border-4"
                style={{ borderColor: 'var(--border-primary)' }}
              />
              
              {/* Center Button */}
              <motion.button
                onClick={handleSpin}
                disabled={isSpinning || isLoading || !dailySpinAvailable || angularVelocity > 0}
                className="absolute w-24 h-24 rounded-full shadow-lg flex items-center justify-center border-4 font-bold transition-all"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: (isSpinning || isLoading || !dailySpinAvailable || angularVelocity > 0)
                    ? 'var(--bg-tertiary)'
                    : 'var(--bg-primary)',
                  borderColor: (isSpinning || isLoading || !dailySpinAvailable || angularVelocity > 0)
                    ? 'var(--border-secondary)'
                    : 'var(--brand-primary)',
                  color: (isSpinning || isLoading || !dailySpinAvailable || angularVelocity > 0)
                    ? 'var(--text-secondary)'
                    : 'var(--brand-primary)',
                  cursor: (isSpinning || isLoading || !dailySpinAvailable || angularVelocity > 0) ? 'not-allowed' : 'pointer',
                  zIndex: 20
                }}
                whileHover={!isSpinning && !isLoading && dailySpinAvailable && angularVelocity === 0 ? { scale: 1.05 } : {}}
                whileTap={!isSpinning && !isLoading && dailySpinAvailable && angularVelocity === 0 ? { scale: 0.95 } : {}}
              >
                {isSpinning || angularVelocity > 0
                  ? 'SPIN'
                  : !dailySpinAvailable 
                    ? 'DONE' 
                    : 'SPIN'
                }
              </motion.button>

              {/* Pointer - positioned above center button */}
              <div 
                className="absolute z-30 pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) translateY(-60px)',
                }}
              >
                <div 
                  className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent"
                  style={{ borderBottomColor: 'var(--error-color)' }}
                ></div>
              </div>
            </div>

            {/* Helper Text */}
            {!dailySpinAvailable && (
              <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
                You've already used your daily spin. Return tomorrow for another chance!
              </p>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--brand-primary)' }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>Processing...</span>
              </div>
            )}
          </div>

          {/* Result Display */}
          <AnimatePresence>
            {wonReward && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center text-center p-8"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="mb-6"
                >
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--warning-color) 0%, var(--brand-primary) 100%)' 
                    }}
                  >
                    {wonReward.type === 'coins' && <FaCoins className="text-4xl" style={{ color: 'var(--text-on-brand)' }} />}
                    {wonReward.type === 'discount' && <FaPercent className="text-4xl" style={{ color: 'var(--text-on-brand)' }} />}
                    {wonReward.type === 'freebie' && <FaShippingFast className="text-4xl" style={{ color: 'var(--text-on-brand)' }} />}
                    {wonReward.type === 'jackpot' && <FaTrophy className="text-4xl" style={{ color: 'var(--text-on-brand)' }} />}
                  </div>
                </motion.div>

                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Congratulations! 🎉
                </h3>
                <p className="text-xl font-semibold mb-6" style={{ color: 'var(--brand-primary)' }}>
                  You won {wonReward.label}!
                </p>

                {/* Reward-specific message */}
                {wonReward.type === 'discount' && (
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Your discount code has been added to your account!
                  </p>
                )}

                {wonReward.type === 'freebie' && (
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Free shipping will be applied to your next order!
                  </p>
                )}

                <motion.button
                  onClick={resetAndClose}
                  className="px-6 py-3 rounded-lg font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--success-color) 0%, var(--brand-primary) 100%)',
                    color: 'var(--text-on-brand)'
                  }}
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

export default SpinWheelCanvas;
