// Color Theme Utilities

// Helper function to adjust color brightness
const adjustColorBrightness = (hex, percent) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse r, g, b values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
  const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
  const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));
  
  // Convert back to hex
  const toHex = (c) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

export const loadCustomColors = () => {
  try {
    const savedColors = localStorage.getItem('customColors');
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      applyColorsToDocument(colors);
      return colors;
    }
  } catch (error) {
    console.error('Error loading custom colors:', error);
  }
  return null;
};

export const applyColorsToDocument = (colors) => {
  try {
    const root = document.documentElement;
    
    // Apply colors to root variables (for light mode)
    if (colors.primary) root.style.setProperty('--brand-primary', colors.primary);
    if (colors.secondary) root.style.setProperty('--brand-secondary', colors.secondary);
    if (colors.success) root.style.setProperty('--success-color', colors.success);
    if (colors.error) root.style.setProperty('--error-color', colors.error);
    if (colors.warning) root.style.setProperty('--warning-color', colors.warning);
    if (colors.info) root.style.setProperty('--accent-color', colors.info);
    
    // Also apply to theme.css variables for consistency
    if (colors.primary) {
      root.style.setProperty('--color-primary', colors.primary);
      // Generate hover color (slightly darker)
      const primaryHover = adjustColorBrightness(colors.primary, -10);
      root.style.setProperty('--color-primary-hover', primaryHover);
      root.style.setProperty('--brand-primary-hover', primaryHover);
    }
    if (colors.secondary) root.style.setProperty('--color-secondary', colors.secondary);
    if (colors.success) root.style.setProperty('--color-success', colors.success);
    if (colors.error) root.style.setProperty('--color-error', colors.error);
    if (colors.warning) root.style.setProperty('--color-warning', colors.warning);
    if (colors.info) root.style.setProperty('--color-info', colors.info);
    
    // Apply missing variables needed by DeliveryLayout
    // Set dark theme variables for sidebar and navigation
    const darkBg = colors.primary ? adjustColorBrightness(colors.primary, -60) : '#1F2937';
    const darkText = '#F9FAFB';
    const darkBorder = colors.primary ? adjustColorBrightness(colors.primary, -40) : '#374151';
    
    root.style.setProperty('--bg-dark', darkBg);
    root.style.setProperty('--text-on-dark-bg', darkText);
    root.style.setProperty('--border-dark', darkBorder);
    
    // Ensure all layout variables are set with proper fallbacks
    if (!root.style.getPropertyValue('--shadow-small')) {
      root.style.setProperty('--shadow-small', '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)');
    }
    if (!root.style.getPropertyValue('--shadow-medium')) {
      root.style.setProperty('--shadow-medium', '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)');
    }
    if (!root.style.getPropertyValue('--rounded-lg')) {
      root.style.setProperty('--rounded-lg', '8px');
    }
    if (!root.style.getPropertyValue('--rounded-md')) {
      root.style.setProperty('--rounded-md', '6px');
    }
    
    // Update gradients to use custom primary color
    if (colors.primary) {
      const primaryHover = adjustColorBrightness(colors.primary, -10);
      const primaryGradient = `linear-gradient(135deg, ${colors.primary} 0%, ${primaryHover} 100%)`;
      const heroGradient = `linear-gradient(135deg, ${colors.primary} 0%, ${primaryHover} 50%, ${adjustColorBrightness(colors.primary, -20)} 100%)`;
      
      root.style.setProperty('--gradient-primary', primaryGradient);
      root.style.setProperty('--color-primary-gradient', primaryGradient);
      root.style.setProperty('--gradient-hero', heroGradient);
    }
    
    // Create dynamic CSS rule to override dark mode variables
    // This ensures custom theme colors work in dark mode too
    let styleElement = document.getElementById('custom-theme-override');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-theme-override';
      document.head.appendChild(styleElement);
    }
    
    // Build CSS to override both light and dark mode variables
    let darkModeOverrides = [];
    
    if (colors.primary) {
      const primaryHover = adjustColorBrightness(colors.primary, -10);
      darkModeOverrides.push(`
        --brand-primary: ${colors.primary} !important;
        --brand-primary-hover: ${primaryHover} !important;
        --color-primary: ${colors.primary} !important;
        --color-primary-hover: ${primaryHover} !important;
        --bg-dark: ${darkBg} !important;
        --text-on-dark-bg: ${darkText} !important;
        --border-dark: ${darkBorder} !important;
      `);
    }
    if (colors.secondary) {
      darkModeOverrides.push(`
        --brand-secondary: ${colors.secondary} !important;
        --color-secondary: ${colors.secondary} !important;
      `);
    }
    if (colors.success) {
      darkModeOverrides.push(`
        --success-color: ${colors.success} !important;
        --color-success: ${colors.success} !important;
      `);
    }
    if (colors.error) {
      darkModeOverrides.push(`
        --error-color: ${colors.error} !important;
        --color-error: ${colors.error} !important;
      `);
    }
    if (colors.warning) {
      darkModeOverrides.push(`
        --warning-color: ${colors.warning} !important;
        --color-warning: ${colors.warning} !important;
      `);
    }
    if (colors.info) {
      darkModeOverrides.push(`
        --accent-color: ${colors.info} !important;
        --color-info: ${colors.info} !important;
      `);
    }
    
    const cssContent = darkModeOverrides.length > 0 
      ? `.dark { ${darkModeOverrides.join('')} } :root { ${darkModeOverrides.join('')} }` 
      : '';
    
    styleElement.textContent = cssContent;
    
    console.log('Colors applied to document (light and dark mode with layout variables):', colors);
    console.log('Added layout variables:', { darkBg, darkText, darkBorder });
  } catch (error) {
    console.error('Error applying colors to document:', error);
  }
};

export const getDefaultColors = () => ({
  primary: '#3b82f6',
  secondary: '#10b981',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#f59e0b',
});

export const saveCustomColors = (colors) => {
  try {
    localStorage.setItem('customColors', JSON.stringify(colors));
    applyColorsToDocument(colors);
    return true;
  } catch (error) {
    console.error('Error saving custom colors:', error);
    return false;
  }
};
