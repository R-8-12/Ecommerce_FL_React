import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'; // Used for JSX motion elements
import {
  FiSun,
  FiMoon,
  FiDownload,
  FiUpload,
  FiEye,
  FiSave,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiSettings,
  FiMonitor,
  FiToggleLeft,
  FiToggleRight,
  FiCopy,
  FiCheck,
  FiDroplet
} from 'react-icons/fi';
import { HexColorPicker } from 'react-colorful';
import {useThemeStore} from '../../../store/Admin/useThemeStore';
import useFrontendCacheStore from '../../../store/useFrontendCacheStore';
import { adminApi } from '../../../services/api';
import { loadCustomColors, applyColorsToDocument, getDefaultColors, saveCustomColors } from '../../../utils/colorUtils';
import toast from 'react-hot-toast';
import Button from '../../ui/Button';

const ThemeManager = () => {
  const [colors, setColors] = useState({
    primary: '#3b82f6',
    secondary: '#10b981',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#f59e0b',
  });
  const [originalColors, setOriginalColors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState({});
  const [copiedColor, setCopiedColor] = useState('');
  const [mode, setMode] = useState('light');

  const { _initializeTheme } = useThemeStore();
  const { updateTheme } = useFrontendCacheStore();

  // Load theme settings from backend
  useEffect(() => {
    loadThemeSettings();
  }, [loadThemeSettings]);

  const loadThemeSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to load from backend first
      const response = await adminApi.get('/admin/theme/');
      if (response.data.success) {
        const themeData = response.data.theme;
        setColors(themeData.colors);
        setOriginalColors(themeData.colors);
        setMode(themeData.mode || 'light');
        applyColorsToDocument(themeData.colors);
      }
    } catch {
      console.log('Backend theme not available, loading from localStorage');
      // Fallback to localStorage
      const savedColors = loadCustomColors();
      if (savedColors) {
        setColors(savedColors);
        setOriginalColors(savedColors);
      } else {
        // Load from CSS variables
        loadCurrentColorsFromCSS();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCurrentColorsFromCSS = () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const currentColors = {
      primary: computedStyle.getPropertyValue('--brand-primary').trim() || '#3b82f6',
      secondary: computedStyle.getPropertyValue('--brand-secondary').trim() || '#10b981',
      success: computedStyle.getPropertyValue('--success-color').trim() || '#10b981',
      error: computedStyle.getPropertyValue('--error-color').trim() || '#ef4444',
      warning: computedStyle.getPropertyValue('--warning-color').trim() || '#f59e0b',
      info: computedStyle.getPropertyValue('--accent-color').trim() || '#f59e0b',
    };
    
    setColors(currentColors);
    setOriginalColors(currentColors);
  };

  // Apply colors to CSS variables for preview
  const applyColorsToCSS = (colorValues) => {
    applyColorsToDocument(colorValues);
  };

  // Handle color change
  const handleColorChange = (colorKey, value) => {
    const newColors = { ...colors, [colorKey]: value };
    setColors(newColors);
    
    if (showPreview) {
      applyColorsToCSS(newColors);
    }
  };

  // Toggle preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      applyColorsToCSS(colors);
    } else {
      // Reset to original colors
      applyColorsToCSS(originalColors);
    }
  };

  // Save colors to backend and localStorage
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to backend
      await adminApi.post('/admin/theme/update/', {
        colors: colors,
        mode: mode
      });

      // Save to localStorage as backup
      saveCustomColors(colors);
      
      // Update original colors
      setOriginalColors(colors);
      
      // Apply to document
      applyColorsToCSS(colors);
      
      // Update frontend cache to show changes immediately
      const updatedTheme = {
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        successColor: colors.success,
        errorColor: colors.error,
        warningColor: colors.warning,
        infoColor: colors.info,
        mode: mode
      };
      updateTheme(updatedTheme);
      
      toast.success('Theme settings saved successfully!');
      
    } catch (error) {
      console.error('Error saving theme settings:', error);
      
      // Fallback to localStorage save
      const success = saveCustomColors(colors);
      if (success) {
        setOriginalColors(colors);
        toast.success('Theme saved locally (backend unavailable)');
      } else {
        toast.error('Error saving theme settings. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setShowPreview(false);
    }
  };

  // Reset to default colors
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset to default theme colors?')) {
      return;
    }

    setIsLoading(true);
    try {
      // Reset on backend
      await adminApi.post('/admin/theme/reset/');
      
      // Reset locally
      const defaultColors = getDefaultColors();
      setColors(defaultColors);
      setOriginalColors(defaultColors);
      applyColorsToCSS(defaultColors);
      setShowPreview(false);
      setMode('light');
      
      // Clear saved colors from localStorage
      localStorage.removeItem('customColors');
      
      toast.success('Theme reset to default successfully!');
      
    } catch (error) {
      console.error('Error resetting theme:', error);
      
      // Fallback to local reset
      const defaultColors = getDefaultColors();
      setColors(defaultColors);
      setOriginalColors(defaultColors);
      applyColorsToCSS(defaultColors);
      setShowPreview(false);
      localStorage.removeItem('customColors');
      
      toast.success('Theme reset locally (backend unavailable)');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    toast.success('Color copied to clipboard');
    setTimeout(() => setCopiedColor(''), 2000);
  };

  const colorLabels = {
    primary: 'Brand Primary',
    secondary: 'Brand Secondary', 
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Accent/Info',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <FiDroplet className="mr-3 text-blue-600" />
            Advanced Theme Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Customize your website's complete color scheme and appearance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showPreview ? 'primary' : 'outline'}
            size="sm"
            onClick={togglePreview}
            icon={<FiEye size={16} />}
          >
            {showPreview ? 'Previewing' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {isLoading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800 dark:text-blue-200">Loading theme settings...</span>
          </div>
        </div>
      )}

      {/* Main Color Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
            <FiSettings className="mr-2" />
            Color Customization
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {colorLabels[key]}
                </label>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm cursor-pointer"
                    style={{ backgroundColor: value }}
                    onClick={() => setShowColorPicker({
                      ...showColorPicker,
                      [key]: !showColorPicker[key]
                    })}
                  />
                  <div className="flex-1">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                    />
                    <div className="flex mt-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="#000000"
                      />
                      <button
                        onClick={() => copyToClipboard(value)}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {copiedColor === value ? (
                          <FiCheck className="text-green-600" size={14} />
                        ) : (
                          <FiCopy className="text-gray-600 dark:text-gray-400" size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Color Picker Popup */}
                {showColorPicker[key] && (
                  <div className="absolute z-50 mt-2">
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setShowColorPicker({...showColorPicker, [key]: false})}
                    />
                    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                      <HexColorPicker 
                        color={value} 
                        onChange={(color) => handleColorChange(key, color)} 
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color Preview Section */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-dashed border-blue-300 dark:border-blue-600 p-6"
        >
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <FiEye className="mr-2" />
            Live Preview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 shadow-md"
                  style={{ backgroundColor: value }}
                />
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {colorLabels[key]}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="md"
          onClick={handleReset}
          icon={<FiRefreshCw size={16} />}
        >
          Reset to Default
        </Button>
        
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            isLoading={isLoading}
            icon={<FiSave size={16} />}
          >
            {isLoading ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Theme Management Instructions
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Use color pickers or enter hex values directly to customize colors</li>
          <li>• Click "Preview" to see changes in real-time across the entire website</li>
          <li>• "Save Theme" will apply colors permanently and store them in the database</li>
          <li>• "Reset to Default" will restore the original theme colors</li>
          <li>• Changes are automatically saved to localStorage as backup</li>
        </ul>
      </div>
    </div>
  );
};

export default ThemeManager;
