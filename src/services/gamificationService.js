/**
 * Gamification Service
 * Handles all gamification-related API calls including wallet, coins, rewards, and spin wheel
 */

import api, { adminApi } from './api';
import { API_URL } from '../utils/constants';

class GamificationService {
    constructor() {
        this.baseURL = `${API_URL}/users`;
    }

    // Helper method to determine which API instance to use
    getApiInstance() {
        // Check if admin user is authenticated
        const adminUser = localStorage.getItem('admin_user');
        const adminToken = localStorage.getItem('admin_token');
        
        if (adminUser && adminToken) {
            return adminApi;
        }
        
        return api;
    }

    // Wallet Management
    async getWallet() {
        try {
            // Check if this is an admin user
            const adminUser = localStorage.getItem('admin_user');
            const adminToken = localStorage.getItem('admin_token');
            const isAdmin = !!(adminUser && adminToken);
            
            // For admin users, return a mock wallet with placeholder data
            if (isAdmin) {
                console.log('Admin user detected, returning mock wallet data');
                return {
                    success: true,
                    data: {
                        wallet: {
                            balance: 5000, // Admin users get a standard 5000 coins for display
                            user_id: 'admin',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        },
                        level: 'Diamond',
                        achievements: [
                            {
                                id: 'admin_access',
                                title: 'Admin Access',
                                description: 'Has administrator privileges',
                                icon: '👑',
                                date_earned: new Date().toISOString()
                            }
                        ],
                        can_spin: false,
                        daily_spin_available: false
                    }
                };
            }
            
            // For regular users, continue with the normal flow
            const token = localStorage.getItem('anand_mobiles_token');
            if (!token) {
                console.warn('No auth token found when attempting to fetch wallet');
                return {
                    success: false,
                    error: 'Not authenticated'
                };
            }
            
            // Get token payload (encoded in base64)
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    // Check if token has email field (required by backend)
                    if (!payload.email) {
                        console.error('Token missing email field - backend validation will fail');
                        return {
                            success: false,
                            error: 'Invalid token format: missing email field'
                        };
                    }
                }
            } catch (tokenError) {
                console.error('Error parsing token:', tokenError);
            }
            
            const apiInstance = this.getApiInstance();
            const response = await apiInstance.get('/users/wallet/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Wallet fetch error:', error.response?.data?.error || error.message);
            if (error.response?.status === 401 && error.response?.data?.error?.includes('missing email')) {
                // Token is invalid - notify user to log in again
                console.error('Detected invalid token format (missing email field)');
                
                // Dispatch custom event to notify auth store
                window.dispatchEvent(new CustomEvent('tokenError', { 
                    detail: { message: 'Authentication token is invalid. Please log in again.' } 
                }));
            }
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch wallet data'
            };
        }
    }

    async addCoins(amount, reason, description = '') {
        try {
            const apiInstance = this.getApiInstance();
            const response = await apiInstance.post('/users/wallet/add-coins/', {
                amount,
                reason,
                description
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to add coins'
            };
        }
    }

    // Spin Wheel
    async spinWheel() {
        try {
            const apiInstance = this.getApiInstance();
            const response = await apiInstance.post('/users/rewards/spin-wheel/');
            
            // Validate response structure
            if (response.data && response.data.reward) {
                return {
                    success: true,
                    data: response.data
                };
            } else {
                return {
                    success: false,
                    error: 'Invalid response from spin wheel'
                };
            }
        } catch (error) {
            console.error('Spin wheel API error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Spin wheel failed'
            };
        }
    }

    // Gamification Status
    async getGamificationStatus() {
        try {
            // Check if this is an admin user
            const adminUser = localStorage.getItem('admin_user');
            const adminToken = localStorage.getItem('admin_token');
            const isAdmin = !!(adminUser && adminToken);
            
            // For admin users, return mock gamification status
            if (isAdmin) {
                console.log('Admin user detected, returning mock gamification status');
                return {
                    success: true,
                    data: {
                        level: 'Diamond',
                        points: 10000,
                        next_level_points: 15000,
                        progress_percentage: 66,
                        achievements_count: 1,
                        available_achievements: 0,
                        login_streak: 100,
                        daily_spin_available: false,
                        referral_code: 'ADMIN2023',
                        referral_count: 50
                    }
                };
            }
            
            // For regular users, continue with the normal flow
            const token = localStorage.getItem('anand_mobiles_token');
            if (!token) {
                console.warn('No auth token found when attempting to fetch gamification status');
                return {
                    success: false,
                    error: 'Not authenticated'
                };
            }
            
            // Get token payload (encoded in base64)
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    // Check if token has email field (required by backend)
                    if (!payload.email) {
                        console.error('Token missing email field - backend validation will fail');
                        return {
                            success: false,
                            error: 'Invalid token format: missing email field'
                        };
                    }
                }
            } catch (tokenError) {
                console.error('Error parsing token:', tokenError);
            }
            
            const apiInstance = this.getApiInstance();
            const response = await apiInstance.get('/users/gamification/status/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Gamification status error:', error.response?.data?.error || error.message);
            if (error.response?.status === 401 && error.response?.data?.error?.includes('missing email')) {
                // Token is invalid - clear it and notify user to log in again
                console.error('Detected invalid token format (missing email field)');
                
                // Dispatch custom event to notify auth store
                window.dispatchEvent(new CustomEvent('tokenError', { 
                    detail: { message: 'Authentication token is invalid. Please log in again.' } 
                }));
            }
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch gamification status'
            };
        }
    }

    // Leaderboard
    async getLeaderboard() {
        try {
            const apiInstance = this.getApiInstance();
            const response = await apiInstance.get('/users/rewards/leaderboard/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch leaderboard'
            };
        }
    }

    // Achievements
    async getAchievements() {
        try {
            const apiInstance = this.getApiInstance();
            const response = await apiInstance.get('/users/rewards/achievements/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch achievements'
            };
        }
    }

    // Referrals
    async getReferralData() {
        try {
            const apiInstance = this.getApiInstance();
            const response = await apiInstance.get('/users/rewards/referrals/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch referral data'
            };
        }
    }

    // Login Streak
    async checkLoginStreak() {
        try {
            const apiInstance = this.getApiInstance();
            const response = await apiInstance.post('/users/rewards/login-streak/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to check login streak'
            };
        }
    }

    // Award Coins (uses add-coins endpoint)
    async awardCoins(amount, reason, description = '') {
        return this.addCoins(amount, reason, description);
    }

    // Get Spin Status (check if user can spin today)
    async getSpinStatus() {
        try {
            // Use gamification status to check spin availability
            const apiInstance = this.getApiInstance();
            const response = await apiInstance.get('/users/gamification/status/');
            return {
                success: true,
                data: {
                    can_spin: response.data.daily_spin_available || false,
                    spins_remaining: response.data.daily_spin_available ? 1 : 0
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to get spin status'
            };
        }
    }

    // Utility Methods
    formatCoins(amount) {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}K`;
        }
        return amount.toString();
    }

    getLevelColor(level) {
        const colors = {
            'Bronze': '#CD7F32',
            'Silver': '#C0C0C0', 
            'Gold': '#FFD700',
            'Platinum': '#E5E4E2',
            'Diamond': '#B9F2FF'
        };
        return colors[level] || '#6B7280';
    }

    getLevelIcon(level) {
        const icons = {
            'Bronze': '🥉',
            'Silver': '🥈',
            'Gold': '🥇',
            'Platinum': '💎',
            'Diamond': '💠'
        };
        return icons[level] || '🏅';
    }

    // Achievement helpers
    getAchievementIcon(achievement) {
        const icons = {
            'first_purchase': '🛍️',
            'loyal_customer': '💖',
            'social_butterfly': '🦋',
            'reviewer': '⭐',
            'early_bird': '🐦',
            'streak_master': '🔥',
            'big_spender': '💰',
            'referral_master': '👥'
        };
        return icons[achievement] || '🏆';
    }
}

export default new GamificationService();
