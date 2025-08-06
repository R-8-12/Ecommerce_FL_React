/**
 * Gamification Integration Component
 * Provides modals and global gamification features
 */

import React from 'react';
import useGamificationStore from '../../store/useGamificationStore';
import WalletModal from './WalletModal';
import SpinWheel from './SpinWheel';

const GamificationIntegration = () => {
  const {
    isWalletModalOpen,
    isSpinWheelOpen,
    closeWalletModal,
    closeSpinWheel
  } = useGamificationStore();

  return (
    <>
      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={closeWalletModal}
      />

      {/* Spin Wheel Modal */}
      <SpinWheel 
        isOpen={isSpinWheelOpen}
        onClose={closeSpinWheel}
      />
    </>
  );
};

export default GamificationIntegration;
