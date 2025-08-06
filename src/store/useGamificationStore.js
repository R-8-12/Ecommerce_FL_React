/**
 * Gamification Store
 * Zustand store for managing gamification state including wallet, coins, and rewards
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import gamificationService from '../services/gamificationService';
import toast from 'react-hot-toast';

const useGamificationStore = create(
    persist(
        (set, get) => ({
            // State
            wallet: null,
            coinBalance: 0,
            userLevel: 'Bronze',
            achievements: [],
            isLoading: false,
            error: null,
            spinStatus: {
                canSpin: true,
                spinsLeft: 3,
                lastSpinDate: null
            },
            leaderboard: [],
            
            // UI State
            isWalletModalOpen: false,
            isSpinWheelOpen: false,
            gamificationStatus: null,

            // Actions
            fetchWallet: async () => {
                set({ isLoading: true, error: null });
                
                try {
                    const result = await gamificationService.getWallet();
                    
                    if (result.success) {
                        const walletData = result.data;
                        set({
                            wallet: walletData,
                            coinBalance: walletData.coin_balance || 0,
                            userLevel: walletData.level || 'Bronze',
                            achievements: walletData.achievements || [],
                            spinStatus: {
                                canSpin: walletData.can_spin || true,
                                spinsLeft: walletData.spins_left || 3,
                                lastSpinDate: walletData.last_spin_date
                            },
                            isLoading: false
                        });
                    } else {
                        set({ error: result.error, isLoading: false });
                    }
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                }
            },

            addCoins: async (amount, reason, description = '') => {
                try {
                    const result = await gamificationService.addCoins(amount, reason, description);
                    
                    if (result.success) {
                        // Update local state
                        const currentBalance = get().coinBalance;
                        set({ 
                            coinBalance: currentBalance + amount 
                        });
                        
                        // Show success toast
                        toast.success(`+${amount} coins earned! ${description}`, {
                            icon: '🪙',
                            duration: 3000
                        });
                        
                        // Refresh wallet data
                        get().fetchWallet();
                        
                        return true;
                    } else {
                        toast.error(result.error);
                        return false;
                    }
                } catch (err) {
                    console.error('Failed to add coins:', err);
                    toast.error('Failed to add coins');
                    return false;
                }
            },

            spinWheel: async () => {
                set({ isLoading: true });
                
                try {
                    const result = await gamificationService.spinWheel();
                    
                    if (result.success) {
                        const spinResult = result.data;
                        
                        // Update coin balance
                        if (spinResult.reward_type === 'coins') {
                            const currentBalance = get().coinBalance;
                            set({ 
                                coinBalance: currentBalance + spinResult.reward_value - spinResult.coins_spent 
                            });
                        }
                        
                        // Update spin status
                        set({
                            spinStatus: {
                                canSpin: spinResult.can_spin_again,
                                spinsLeft: spinResult.spins_left,
                                lastSpinDate: new Date().toISOString()
                            },
                            isLoading: false
                        });
                        
                        // Show reward toast
                        const rewardIcon = spinResult.reward_type === 'coins' ? '🪙' : 
                                         spinResult.reward_type === 'discount' ? '🎟️' : '🎁';
                        
                        toast.success(`🎉 You won: ${spinResult.reward_label}!`, {
                            icon: rewardIcon,
                            duration: 4000
                        });
                        
                        return spinResult;
                    } else {
                        set({ isLoading: false });
                        toast.error(result.error);
                        return null;
                    }
                } catch (error) {
                    set({ isLoading: false });
                    toast.error('Spin failed');
                    return null;
                }
            },

            fetchLeaderboard: async () => {
                try {
                    const result = await gamificationService.getLeaderboard();
                    
                    if (result.success) {
                        set({ leaderboard: result.data.leaderboard || [] });
                    }
                } catch (err) {
                    console.error('Failed to fetch leaderboard:', err);
                }
            },

            // Utility actions
            resetError: () => set({ error: null }),
            
            updateLocalCoins: (amount) => {
                const currentBalance = get().coinBalance;
                set({ coinBalance: currentBalance + amount });
            },

            // Auto-reward actions for user interactions
            rewardForAction: async (action, _metadata = {}) => {
                const rewards = {
                    'signup': { amount: 100, description: 'Welcome bonus!' },
                    'first_login': { amount: 5, description: 'First login bonus!' },
                    'daily_login': { amount: 2, description: 'Daily login bonus!' },
                    'profile_complete': { amount: 10, description: 'Profile completion bonus!' },
                    'add_wishlist': { amount: 2, description: 'Added to wishlist!' },
                    'share_product': { amount: 3, description: 'Product shared!' },
                    'review_product': { amount: 5, description: 'Review submitted!' },
                    'first_purchase': { amount: 20, description: 'First purchase bonus!' }
                };

                const reward = rewards[action];
                if (reward) {
                    await get().addCoins(reward.amount, action, reward.description);
                }
            },

            // Level up check
            checkLevelUp: () => {
                const { coinBalance, userLevel } = get();
                const levels = {
                    'Bronze': { min: 0, max: 499 },
                    'Silver': { min: 500, max: 1499 },
                    'Gold': { min: 1500, max: 2999 },
                    'Platinum': { min: 3000, max: 4999 },
                    'Diamond': { min: 5000, max: Infinity }
                };

                for (const [level, range] of Object.entries(levels)) {
                    if (coinBalance >= range.min && coinBalance <= range.max && userLevel !== level) {
                        set({ userLevel: level });
                        toast.success(`🎉 Level up! You're now ${level}!`, {
                            duration: 4000,
                            icon: gamificationService.getLevelIcon(level)
                        });
                        break;
                    }
                }
            },

            // Modal Actions
            openWalletModal: () => set({ isWalletModalOpen: true }),
            closeWalletModal: () => set({ isWalletModalOpen: false }),
            openSpinWheel: () => set({ isSpinWheelOpen: true }),
            closeSpinWheel: () => set({ isSpinWheelOpen: false }),

            // Fetch Gamification Status
            fetchGamificationStatus: async () => {
                try {
                    const result = await gamificationService.getGamificationStatus();
                    
                    if (result.success) {
                        set({ 
                            gamificationStatus: result.data,
                            isLoading: false 
                        });
                    } else {
                        set({ error: result.error, isLoading: false });
                    }
                } catch (err) {
                    console.error('Failed to fetch gamification status:', err);
                    set({ error: err.message, isLoading: false });
                }
            }
        }),
        {
            name: 'gamification-store',
            partialize: (state) => ({
                wallet: state.wallet,
                coinBalance: state.coinBalance,
                userLevel: state.userLevel,
                achievements: state.achievements,
                spinStatus: state.spinStatus
            })
        }
    )
);

export default useGamificationStore;
