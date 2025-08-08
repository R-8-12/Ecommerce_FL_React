/**
 * Spin Wheel Component - Canvas Implementation
 * Interactive spin wheel for daily rewards and gamification
 * Using canvas-based rendering with precise mathematical calculations
 */

import SpinWheelCanvas from './SpinWheelCanvas';

const SpinWheel = ({ isOpen, onClose }) => {
  return <SpinWheelCanvas isOpen={isOpen} onClose={onClose} />;
};

export default SpinWheel;
