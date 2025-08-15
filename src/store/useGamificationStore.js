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
        (set, get) => {
            // Flag to prevent multiple event listener registrations
            let eventListenersRegistered = false;
            
            // Set up event listeners for coin awards and login streaks
            if (typeof window !== 'undefined' && !eventListenersRegistered) {
                const handleCoinsAwarded = (event) => {
                    const { amount, total } = event.detail;
                    const currentStore = get();
                    set({ 
                        coinBalance: total || (currentStore.coinBalance + amount)
                    });
                    // Only refresh if we have a significant change
                    if (amount > 0) {
                        setTimeout(() => currentStore.fetchWallet(), 500);
                    }
                };

                const handleRefreshGamification = (event) => {
                    const { newBalance, bonusAmount, streakCount } = event.detail;
                    
                    // Update coin balance immediately
                    if (newBalance !== undefined) {
                        set({ coinBalance: newBalance });
                    }
                    
                    // Show toast for login streak bonus
                    if (bonusAmount && streakCount) {
                        toast.success(`🔥 ${streakCount} day login streak! +${bonusAmount} coins!`, {
                            duration: 4000,
                            icon: '🔥'
                        });
                    }
                    
                    // Only refresh if there's actually new data
                    if (newBalance !== undefined || bonusAmount) {
                        const currentStore = get();
                        setTimeout(() => {
                            currentStore.fetchWallet();
                            currentStore.fetchGamificationStatus();
                        }, 1000); // Increased delay to prevent rapid calls
                    }
                };

                window.addEventListener('coinsAwarded', handleCoinsAwarded);
                window.addEventListener('refreshGamification', handleRefreshGamification);
                eventListenersRegistered = true;
                
                // Cleanup function (though Zustand doesn't have built-in cleanup)
                if (window.gamificationCleanup) {
                    window.gamificationCleanup();
                }
                window.gamificationCleanup = () => {
                    window.removeEventListener('coinsAwarded', handleCoinsAwarded);
                    window.removeEventListener('refreshGamification', handleRefreshGamification);
                    eventListenersRegistered = false;
                };
            }

            return {
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

                // Internal state for debouncing
                _fetchTimeout: null,
                _isCurrentlyFetching: false,

            // Actions
            fetchWallet: async () => {
                const currentState = get();
                
                // Prevent multiple simultaneous fetches
                if (currentState._isCurrentlyFetching) {
                    console.log('Wallet fetch already in progress, skipping...');
                    return;
                }
                
                // Clear any pending fetch timeout
                if (currentState._fetchTimeout) {
                    clearTimeout(currentState._fetchTimeout);
                }
                
                set({ isLoading: true, error: null, _isCurrentlyFetching: true });
                
                try {
                    const result = await gamificationService.getWallet();
                    
                    if (result.success) {
                        const walletData = result.data;
                        const newCoinBalance = walletData.wallet?.balance || walletData.coin_balance || 0;
                        
                        set({
                            wallet: walletData.wallet || walletData,
                            coinBalance: newCoinBalance,
                            userLevel: walletData.level || 'Bronze',
                            achievements: walletData.achievements || [],
                            spinStatus: {
                                canSpin: walletData.can_spin || true,
                                spinsLeft: walletData.spins_left || 3,
                                lastSpinDate: walletData.last_spin_date
                            },
                            isLoading: false,
                            _isCurrentlyFetching: false
                        });
                        
                        // Only log wallet fetch success once every 30 seconds for admin users
                        const isAdmin = localStorage.getItem('admin_user') && localStorage.getItem('admin_token');
                        if (!isAdmin) {
                            console.log('Wallet fetched successfully:', { 
                                balance: newCoinBalance, 
                                wallet: walletData 
                            });
                        } else {
                            const lastLogTime = window._lastWalletSuccessLog || 0;
                            const now = Date.now();
                            if (now - lastLogTime > 30000) {
                                console.log('Wallet fetched successfully (admin):', { 
                                    balance: newCoinBalance 
                                });
                                window._lastWalletSuccessLog = now;
                            }
                        }
                    } else {
                        set({ error: result.error, isLoading: false, _isCurrentlyFetching: false });
                        console.error('Failed to fetch wallet:', result.error);
                    }
                } catch (error) {
                    set({ error: error.message, isLoading: false, _isCurrentlyFetching: false });
                    console.error('Wallet fetch error:', error);
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
                        
                        // Debounced refresh wallet data
                        get().debouncedFetchWallet();
                        
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

            // Debounced fetch wallet to prevent rapid API calls
            debouncedFetchWallet: () => {
                const currentState = get();
                
                // Clear existing timeout
                if (currentState._fetchTimeout) {
                    clearTimeout(currentState._fetchTimeout);
                }
                
                // Set new timeout
                const timeoutId = setTimeout(() => {
                    get().fetchWallet();
                }, 1000); // 1 second debounce
                
                set({ _fetchTimeout: timeoutId });
            },

            spinWheel: async () => {
                set({ isLoading: true });
                
                try {
                    const result = await gamificationService.spinWheel();
                    
                    if (result.success) {
                        const spinResult = result.data;
                        
                        // Update coin balance if reward is coins
                        if (spinResult.reward?.type === 'coins') {
                            const currentBalance = get().coinBalance;
                            set({ 
                                coinBalance: currentBalance + spinResult.reward.value 
                            });
                            
                            // Debounced refresh wallet data
                            get().debouncedFetchWallet();
                        }
                        
                        // Update gamification status to reflect spin used
                        setTimeout(() => get().fetchGamificationStatus(), 1500);
                        
                        set({ isLoading: false });
                        
                        // Show reward toast with appropriate icon
                        const rewardIcon = spinResult.reward?.type === 'coins' ? '🪙' : 
                                         spinResult.reward?.type === 'discount' ? '🎟️' : 
                                         spinResult.reward?.type === 'freebie' ? '🚚' : '🎁';
                        
                        const rewardMessage = spinResult.reward?.type === 'discount' 
                            ? `🎉 You won ${spinResult.reward.label}! Check your coupons.`
                            : `🎉 You won ${spinResult.reward?.label || 'a reward'}!`;
                        
                        toast.success(rewardMessage, {
                            icon: rewardIcon,
                            duration: 4000
                        });
                        
                        return result;
                    } else {
                        set({ isLoading: false });
                        
                        // Handle specific error messages
                        if (result.error && result.error.includes('Daily spin limit')) {
                            toast.error('Daily spin limit reached. Come back tomorrow! 🌅', {
                                duration: 4000,
                                icon: '⏰'
                            });
                        } else {
                            toast.error(result.error || 'Spin failed');
                        }
                        
                        return result;
                    }
                } catch (error) {
                    console.error('Spin wheel error:', error);
                    set({ isLoading: false });
                    toast.error('Spin failed');
                    return { success: false, error: 'Failed to spin wheel' };
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

            fetchAchievements: async () => {
                try {
                    const result = await gamificationService.getAchievements();
                    
                    if (result.success) {
                        set({ achievements: result.data.achievements || [] });
                        return result.data;
                    }
                } catch (err) {
                    console.error('Failed to fetch achievements:', err);
                }
            },

            fetchReferralData: async () => {
                try {
                    const result = await gamificationService.getReferralData();
                    
                    if (result.success) {
                        return result.data;
                    }
                } catch (err) {
                    console.error('Failed to fetch referral data:', err);
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
        };
        },
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
