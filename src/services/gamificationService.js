/**
 * Gamification Service
 * Handles all gamification-related API calls including wallet, coins, rewards, and spin wheel
 */

import api from './api';
import { API_URL } from '../utils/constants';

class GamificationService {
    constructor() {
        this.baseURL = `${API_URL}/users`;
    }   

    // Wallet Management
    async getWallet() {
        try {
            const response = await api.get('/users/wallet/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch wallet data'
            };
        }
    }

    async addCoins(amount, reason, description = '') {
        try {
            const response = await api.post('/users/wallet/add-coins/', {
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
            const response = await api.post('/users/rewards/spin-wheel/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Spin wheel failed'
            };
        }
    }

    // Gamification Status
    async getGamificationStatus() {
        try {
            const response = await api.get('/users/gamification/status/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to fetch gamification status'
            };
        }
    }

    // Leaderboard
    async getLeaderboard() {
        try {
            const response = await api.get('/users/rewards/leaderboard/');
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
