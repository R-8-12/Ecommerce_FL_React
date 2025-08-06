/**
 * Gamification Utils
 * Utilities for integrating gamification features throughout the app
 * Automatically awards coins for user actions and triggers UI feedback
 */

import gamificationService from '../services/gamificationService';
import { toast } from 'react-hot-toast';

/**
 * Award coins for user actions with toast notification
 * @param {string} action - The action performed (e.g., 'wishlist', 'review', etc.)
 * @param {number} customAmount - Optional custom coin amount
 * @param {string} description - Optional custom description
 * @returns {Promise} - Result of the coin award operation
 */
export const awardCoins = async (action, customAmount = null, description = null) => {
  try {
    // Default coin rewards for different actions
    const rewardConfig = {
      'login': { amount: 5, message: 'Daily login bonus!' },
      'register': { amount: 100, message: 'Welcome bonus!' },
      'wishlist': { amount: 2, message: 'Added to wishlist!' },
      'review': { amount: 10, message: 'Thanks for your review!' },
      'share': { amount: 3, message: 'Thanks for sharing!' },
      'purchase': { amount: 20, message: 'Purchase reward!' },
      'invite': { amount: 50, message: 'Friend invited!' },
      'streak': { amount: 10, message: 'Login streak bonus!' },
      'default': { amount: 1, message: 'Action completed!' }
    };

    const config = rewardConfig[action] || rewardConfig['default'];
    const amount = customAmount || config.amount;
    const message = description || config.message;

    // Add coins via API
    const result = await gamificationService.addCoins(amount, action, message);
    
    if (result.success) {
      // Show success toast with coin animation
      toast.success(
        `🪙 +${amount} coins! ${message}`,
        {
          duration: 3000,
          style: {
            background: 'var(--success-color)',
            color: 'var(--text-on-brand)',
          },
        }
      );

      // Dispatch custom event for store updates
      window.dispatchEvent(new CustomEvent('coinsAwarded', { 
        detail: { amount, action, total: result.data?.new_balance } 
      }));

      return result.data;
    } else {
      console.error('Failed to award coins:', result.error);
    }
  } catch (error) {
    console.error('Error awarding coins:', error);
  }
};

/**
 * Check and award login streak bonus
 */
export const checkLoginStreakBonus = async () => {
  try {
    const result = await gamificationService.checkLoginStreak();
    
    if (result.success && result.data.bonus_awarded) {
      const { streak_count, bonus_amount } = result.data;
      
      toast.success(
        `🔥 ${streak_count} day streak! +${bonus_amount} coins!`,
        {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, var(--warning-color) 0%, var(--brand-primary) 100%)',
            color: 'var(--text-on-brand)',
          },
        }
      );

      return result.data;
    }
  } catch (error) {
    console.error('Error checking login streak:', error);
  }
};

/**
 * Show gamification welcome popup for new users
 */
export const showWelcomePopup = (coinBalance = 100) => {
  toast.success(
    `🎉 Welcome to Anand Mobiles! You've earned ${coinBalance} welcome coins! 🪙 Use coins for discounts & spin the wheel daily!`,
    {
      duration: 8000,
      style: {
        background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)',
        color: 'var(--text-on-brand)',
        padding: '16px',
        borderRadius: '12px'
      },
    }
  );
};

/**
 * Show spin wheel available notification
 */
export const showSpinWheelNotification = () => {
  toast(
    `🎡 Daily Spin Available! Click your wallet to spin & win rewards!`,
    {
      duration: 5000,
      icon: '🎡',
      style: {
        background: 'var(--brand-primary)',
        color: 'var(--text-on-brand)',
      },
    }
  );
};

/**
 * Show achievement unlocked notification
 */
export const showAchievementNotification = (achievement) => {
  toast.success(
    `🏆 Achievement Unlocked! ${achievement.title} - +${achievement.reward_coins} coins`,
    {
      duration: 6000,
      style: {
        background: 'linear-gradient(135deg, var(--warning-color) 0%, var(--success-color) 100%)',
        color: 'var(--text-on-brand)',
        padding: '16px',
        borderRadius: '12px'
      },
    }
  );
};

/**
 * Show level up notification
 */
export const showLevelUpNotification = (newLevel, coinsEarned = 50) => {
  toast.success(
    `⭐ Level Up! You're now ${newLevel} level! +${coinsEarned} bonus coins!`,
    {
      duration: 8000,
      style: {
        background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--warning-color) 100%)',
        color: 'var(--text-on-brand)',
        padding: '20px',
        borderRadius: '12px',
        fontSize: '16px'
      },
    }
  );
};

/**
 * Show referral success notification
 */
export const showReferralSuccessNotification = (referralCoins = 50, friendName = 'Friend') => {
  toast.success(
    `🎉 ${friendName} joined using your referral! +${referralCoins} coins earned!`,
    {
      duration: 6000,
      style: {
        background: 'var(--success-color)',
        color: 'var(--text-on-brand)',
      },
    }
  );
};

/**
 * Calculate user level based on total coins
 */
export const calculateUserLevel = (totalCoins) => {
  if (totalCoins >= 10000) return 'Diamond';
  if (totalCoins >= 5000) return 'Platinum';
  if (totalCoins >= 2500) return 'Gold';
  if (totalCoins >= 1000) return 'Silver';
  return 'Bronze';
};

/**
 * Get coins needed for next level
 */
export const getCoinsForNextLevel = (currentLevel, currentCoins) => {
  const levelThresholds = {
    'Bronze': 1000,
    'Silver': 2500,
    'Gold': 5000,
    'Platinum': 10000,
    'Diamond': 10000 // Max level
  };

  const threshold = levelThresholds[currentLevel];
  if (currentLevel === 'Diamond') return 0;
  
  return Math.max(0, threshold - currentCoins);
};

/**
 * Format coin display with proper thousands separators
 */
export const formatCoins = (coins) => {
  return coins.toLocaleString();
};

/**
 * Get random encouraging message for actions
 */
export const getEncouragingMessage = () => {
  const messages = [
    "Keep earning those coins! 🚀",
    "You're doing great! 💪",
    "Coins are building up! 📈",
    "Every action counts! ⭐",
    "Your wallet is growing! 💰",
    "Great job shopping! 🛍️",
    "Keep up the momentum! 🔥"
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Check if user can spin wheel today
 */
export const canSpinWheelToday = async () => {
  try {
    const result = await gamificationService.getSpinStatus();
    return result.success ? result.data.can_spin : false;
  } catch (error) {
    console.error('Error checking spin status:', error);
    return false;
  }
};

/**
 * Auto-trigger gamification based on user behavior
 */
export const triggerGamificationEvent = async (eventType, eventData = {}) => {
  try {
    switch (eventType) {
      case 'page_visit':
        // Award coins for important page visits
        if (eventData.page === 'products' && eventData.timeSpent > 30) {
          await awardCoins('browse', 1, 'Browsing products!');
        }
        break;

      case 'search':
        // Award coins for search activity
        if (eventData.query && eventData.query.length > 3) {
          await awardCoins('search', 1, 'Product search!');
        }
        break;

      case 'social_share':
        // Award coins for social sharing
        await awardCoins('share', 5, `Shared on ${eventData.platform}!`);
        break;

      case 'newsletter_signup':
        // Award coins for newsletter subscription
        await awardCoins('newsletter', 25, 'Newsletter subscribed!');
        break;

      default:
        console.log('Unknown gamification event:', eventType);
    }
  } catch (error) {
    console.error('Error triggering gamification event:', error);
  }
};

// Named exports for better tree-shaking and explicit imports
