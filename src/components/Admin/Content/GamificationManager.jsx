/**
 * Admin Gamification Manager
 * Allows admins to customize gamification features including rewards, spin wheel, and coin economy
 * Uses admin theme variables for consistent styling
 */

import React, { useState, useEffect } from 'react';
import { 
  FiSettings, FiGift, FiTarget, FiTrendingUp, FiUsers,
  FiSave, FiRefreshCw, FiEye, FiEyeOff, FiPlus, FiTrash2, FiEdit
} from 'react-icons/fi';
import { FaCoins } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../../services/api';
import useFrontendCacheStore from '../../../store/useFrontendCacheStore';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';

const GamificationManager = () => {
  const [activeTab, setActiveTab] = useState('rewards');
  const [isLoading, setIsLoading] = useState(false);
  const { updateGamification } = useFrontendCacheStore(); // For cache invalidation
  const [settings, setSettings] = useState({
    rewards: {
      signup_bonus: 100,
      login_bonus: 5,
      wishlist_bonus: 2,
      review_bonus: 10,
      referral_bonus: 50,
      purchase_percentage: 1, // 1% of purchase amount
      daily_login_streak_bonus: 10
    },
    spinWheel: {
      enabled: true,
      daily_spins: 1,
      rewards: [
        { id: 1, type: 'coins', value: 10, weight: 30, label: '10 Coins', color: '#FFD700', textColor: '#333333' },
        { id: 2, type: 'coins', value: 25, weight: 20, label: '25 Coins', color: '#4ECDC4', textColor: '#FFFFFF' },
        { id: 3, type: 'coins', value: 50, weight: 15, label: '50 Coins', color: '#96CEB4', textColor: '#FFFFFF' },
        { id: 4, type: 'discount', value: 5, weight: 15, label: '5% Discount', color: '#FFEAA7', textColor: '#2D3436' },
        { id: 5, type: 'discount', value: 10, weight: 10, label: '10% Discount', color: '#45B7D1', textColor: '#FFFFFF' },
        { id: 6, type: 'freebie', value: 'shipping', weight: 8, label: 'Free Shipping', color: '#FF6B6B', textColor: '#FFFFFF' },
        { id: 7, type: 'coins', value: 100, weight: 2, label: '100 Coins (Jackpot!)', color: '#DDA0DD', textColor: '#FFFFFF' }
      ]
    },
    economy: {
      coin_to_currency_rate: 10, // 10 coins = ₹1
      min_redeem_coins: 100,
      max_redeem_percentage: 50, // Max 50% of order can be paid with coins
      coin_expiry_days: 365
    },
    features: {
      leaderboard_enabled: true,
      achievements_enabled: true,
      referral_system_enabled: true,
      daily_rewards_enabled: true
    }
  });

  const [editingReward, setEditingReward] = useState(null);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);

  const tabs = [
    { id: 'rewards', label: 'Coin Rewards', icon: <FaCoins /> },
    { id: 'spinwheel', label: 'Spin Wheel', icon: <FiGift /> },
    { id: 'economy', label: 'Coin Economy', icon: <FiTrendingUp /> },
    { id: 'features', label: 'Features', icon: <FiSettings /> },
    { id: 'analytics', label: 'Analytics', icon: <FiUsers /> }
  ];

  useEffect(() => {
    loadGamificationSettings();
  }, []);

  const loadGamificationSettings = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.get('/admin/gamification/settings/');
      
      if (response.data.success) {
        setSettings(response.data.settings);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load gamification settings:', err);
      toast.error('Failed to load gamification settings');
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.post('/admin/gamification/settings/update/', {
        settings: settings
      });
      
      if (response.data.success) {
        toast.success('Gamification settings saved successfully!');
        
        // Invalidate frontend cache to force refresh of gamification data
        updateGamification();
      } else {
        toast.error('Failed to save settings');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save settings');
      setIsLoading(false);
    }
  };

  const updateRewardsSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        [key]: value
      }
    }));
  };

  const updateSpinWheelSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      spinWheel: {
        ...prev.spinWheel,
        [key]: value
      }
    }));
  };

  const updateEconomySetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      economy: {
        ...prev.economy,
        [key]: value
      }
    }));
  };

  const updateFeatureSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value
      }
    }));
  };

  const _addSpinWheelReward = (reward) => {
    const newReward = {
      ...reward,
      id: Math.max(...settings.spinWheel.rewards.map(r => r.id)) + 1
    };
    setSettings(prev => ({
      ...prev,
      spinWheel: {
        ...prev.spinWheel,
        rewards: [...prev.spinWheel.rewards, newReward]
      }
    }));
  };

  const _updateSpinWheelReward = (id, updatedReward) => {
    setSettings(prev => ({
      ...prev,
      spinWheel: {
        ...prev.spinWheel,
        rewards: prev.spinWheel.rewards.map(r => 
          r.id === id ? { ...r, ...updatedReward } : r
        )
      }
    }));
  };

  const deleteSpinWheelReward = (id) => {
    if (settings.spinWheel.rewards.length <= 3) {
      toast.error('Minimum 3 rewards required for spin wheel');
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      spinWheel: {
        ...prev.spinWheel,
        rewards: prev.spinWheel.rewards.filter(r => r.id !== id)
      }
    }));
  };

  const handleSaveReward = (rewardData) => {
    if (editingReward) {
      // Update existing reward
      _updateSpinWheelReward(editingReward.id, rewardData);
      toast.success('Reward updated successfully');
    } else {
      // Add new reward
      if (settings.spinWheel.rewards.length >= 8) {
        toast.error('Maximum 8 rewards allowed for optimal spin wheel display');
        return;
      }
      _addSpinWheelReward(rewardData);
      toast.success('Reward added successfully');
    }
    
    setRewardModalOpen(false);
    setEditingReward(null);
  };

  const renderRewardsTab = () => (
    <div className="space-y-6">
      <h3 
        className="text-lg font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Coin Reward Configuration
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(settings.rewards).map(([key, value]) => (
          <div key={key}>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => updateRewardsSetting(key, parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-md border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpinWheelTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Spin Wheel Configuration
        </h3>
        <Button
          onClick={() => {
            setEditingReward(null);
            setRewardModalOpen(true);
          }}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <FiPlus /> <span>Add Reward</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.spinWheel.enabled}
              onChange={(e) => updateSpinWheelSetting('enabled', e.target.checked)}
            />
            <span style={{ color: 'var(--text-primary)' }}>Enable Spin Wheel</span>
          </label>
        </div>
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Daily Spins Allowed
          </label>
          <input
            type="number"
            value={settings.spinWheel.daily_spins}
            onChange={(e) => updateSpinWheelSetting('daily_spins', parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded-md border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      <div>
        <h4 
          className="text-md font-medium mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Spin Wheel Rewards
        </h4>
        <div className="space-y-3">
          {settings.spinWheel.rewards.map((reward) => (
            <div 
              key={reward.id}
              className="flex items-center justify-between p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div className="flex items-center space-x-3">
                {/* Color Preview */}
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: reward.color }}
                >
                  <span 
                    className="text-xs font-bold"
                    style={{ color: reward.textColor }}
                  >
                    {reward.type === 'coins' ? '🪙' : reward.type === 'discount' ? '%' : '🚚'}
                  </span>
                </div>
                
                <div>
                  <span 
                    className="font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {reward.label}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Weight: {reward.weight}%
                    </span>
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: `${reward.color}20`,
                        color: reward.color
                      }}
                    >
                      {reward.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setEditingReward(reward);
                    setRewardModalOpen(true);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  <FiEdit />
                </Button>
                <Button
                  onClick={() => deleteSpinWheelReward(reward.id)}
                  variant="danger"
                  size="sm"
                >
                  <FiTrash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEconomyTab = () => (
    <div className="space-y-6">
      <h3 
        className="text-lg font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Coin Economy Settings
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(settings.economy).map(([key, value]) => (
          <div key={key}>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => updateEconomySetting(key, parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-md border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        ))}
      </div>

      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: 'var(--bg-accent-light)',
          borderColor: 'var(--warning-color)'
        }}
      >
        <h4 
          className="font-medium mb-2"
          style={{ color: 'var(--warning-color)' }}
        >
          Economy Preview
        </h4>
        <p style={{ color: 'var(--text-secondary)' }}>
          • {settings.economy.coin_to_currency_rate} coins = ₹1<br/>
          • Minimum redemption: {settings.economy.min_redeem_coins} coins<br/>
          • Maximum order payment with coins: {settings.economy.max_redeem_percentage}%<br/>
          • Coins expire after: {settings.economy.coin_expiry_days} days
        </p>
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <h3 
        className="text-lg font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Gamification Features
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(settings.features).map(([key, value]) => (
          <div key={key}>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateFeatureSetting(key, e.target.checked)}
                style={{ accentColor: 'var(--brand-primary)' }}
              />
              <span style={{ color: 'var(--text-primary)' }}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h3 
        className="text-lg font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        Gamification Analytics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="p-6 rounded-lg border text-center"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <FiUsers 
            size={32} 
            style={{ color: 'var(--brand-primary)' }} 
            className="mx-auto mb-2"
          />
          <h4 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            1,234
          </h4>
          <p style={{ color: 'var(--text-secondary)' }}>Active Users</p>
        </div>

        <div 
          className="p-6 rounded-lg border text-center"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <FaCoins 
            size={32} 
            style={{ color: 'var(--warning-color)' }} 
            className="mx-auto mb-2"
          />
          <h4 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            45,678
          </h4>
          <p style={{ color: 'var(--text-secondary)' }}>Total Coins Earned</p>
        </div>

        <div 
          className="p-6 rounded-lg border text-center"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <FiGift 
            size={32} 
            style={{ color: 'var(--success-color)' }} 
            className="mx-auto mb-2"
          />
          <h4 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            892
          </h4>
          <p style={{ color: 'var(--text-secondary)' }}>Spins This Week</p>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="p-6"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Gamification Manager
        </h2>
        <Button
          onClick={saveSettings}
          variant="primary"
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
          <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'shadow-md' : ''
            }`}
            style={{
              backgroundColor: activeTab === tab.id 
                ? 'var(--brand-primary)' 
                : 'var(--bg-secondary)',
              color: activeTab === tab.id 
                ? 'var(--text-on-brand)' 
                : 'var(--text-primary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div 
        className="rounded-lg border p-6"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        {activeTab === 'rewards' && renderRewardsTab()}
        {activeTab === 'spinwheel' && renderSpinWheelTab()}
        {activeTab === 'economy' && renderEconomyTab()}
        {activeTab === 'features' && renderFeaturesTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>

      {/* Reward Edit Modal */}
      <Modal
        isOpen={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        title={editingReward ? 'Edit Reward' : 'Add New Reward'}
      >
        <RewardFormModal
          reward={editingReward}
          onSave={handleSaveReward}
          onCancel={() => setRewardModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Reward Form Modal Component
const RewardFormModal = ({ reward, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: reward?.type || 'coins',
    value: reward?.value || 0,
    label: reward?.label || '',
    weight: reward?.weight || 10,
    color: reward?.color || '#FFD700',
    textColor: reward?.textColor || '#333333',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }
    
    if (formData.type !== 'freebie' && formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }
    
    if (formData.weight < 1 || formData.weight > 50) {
      newErrors.weight = 'Weight must be between 1 and 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Reward Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          className="w-full px-3 py-2 rounded-md border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="coins">Coins</option>
          <option value="discount">Discount %</option>
          <option value="freebie">Free Shipping</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Value {formData.type === 'discount' ? '(%)' : formData.type === 'coins' ? '(amount)' : ''}
        </label>
        <input
          type="number"
          value={formData.value}
          onChange={(e) => setFormData(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
          className="w-full px-3 py-2 rounded-md border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
          disabled={formData.type === 'freebie'}
        />
        {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Display Label
        </label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
          className="w-full px-3 py-2 rounded-md border"
          placeholder="e.g., 10 Coins, 5% Off, Free Shipping"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        />
        {errors.label && <p className="text-red-500 text-sm mt-1">{errors.label}</p>}
      </div>

      {/* Color Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-12 h-10 rounded-md border cursor-pointer"
              style={{ borderColor: 'var(--border-primary)' }}
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-md border text-sm"
              placeholder="#FFD700"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Text Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={formData.textColor}
              onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
              className="w-12 h-10 rounded-md border cursor-pointer"
              style={{ borderColor: 'var(--border-primary)' }}
            />
            <input
              type="text"
              value={formData.textColor}
              onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-md border text-sm"
              placeholder="#FFFFFF"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Color Preview */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Preview
        </label>
        <div 
          className="inline-block px-4 py-2 rounded-lg font-medium text-center min-w-32"
          style={{ 
            backgroundColor: formData.color,
            color: formData.textColor,
            border: '1px solid var(--border-primary)'
          }}
        >
          {formData.label || 'Sample Text'}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Weight (Probability %)
        </label>
        <input
          type="number"
          value={formData.weight}
          onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) || 1 }))}
          min="1"
          max="50"
          className="w-full px-3 py-2 rounded-md border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        />
        {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          Higher weight = more likely to appear
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {reward ? 'Update' : 'Add'} Reward
        </Button>
      </div>
    </form>
  );
};

export default GamificationManager;
