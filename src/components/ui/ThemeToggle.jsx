import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'; // Used for JSX motion elements
import { FiSun, FiMoon, FiMonitor, FiChevronDown } from 'react-icons/fi';
import useThemeStore from '../../store/useTheme';

const ThemeToggle = () => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const themes = [
    { value: 'light', icon: FiSun, label: 'Light' },
    { value: 'dark', icon: FiMoon, label: 'Dark' },
    { value: 'system', icon: FiMonitor, label: 'System' }
  ];

  const getCurrentIcon = () => {
    const currentTheme = themes.find(t => t.value === theme);
    return currentTheme ? currentTheme.icon : FiSun;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = (selectedTheme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 border"
        style={{ 
          color: "var(--text-primary)",
          backgroundColor: isOpen ? "var(--bg-secondary)" : "var(--bg-primary)",
          borderColor: "var(--border-primary)",
          boxShadow: "var(--shadow-medium)"
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="Change theme"
      >
        <motion.div
          key={theme} 
          initial={{ 
            scale: 0.8, 
            opacity: 0,
            rotate: theme === 'light' ? 180 : 0 
          }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            rotate: 0 
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <CurrentIcon className="w-5 h-5" />
        </motion.div>
        <FiChevronDown 
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 py-2 rounded-lg shadow-lg border min-w-[120px] z-50"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-primary)",
              boxShadow: "var(--shadow-large)"
            }}
          >

            {/* FIX: Changed 'icon: _Icon' to 'icon: Icon' to match the usage below */}

            {themes.map(({ value, icon: Icon, label }) => (
              <motion.button
                key={value}
                onClick={() => handleThemeSelect(value)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  theme === value ? 'font-medium' : ''
                }`}
                style={{
                  color: theme === value ? "var(--brand-primary)" : "var(--text-primary)",
                  backgroundColor: theme === value ? "var(--bg-secondary)" : "transparent"
                }}
                whileHover={{ x: 2 }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{label}</span>
                {theme === value && (
                  <motion.div
                    layoutId="selected-indicator"
                    className="w-2 h-2 rounded-full ml-auto"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;