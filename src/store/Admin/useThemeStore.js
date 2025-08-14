import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

// Default theme configurations
const defaultThemes = {
  light: {
    primary: '#FF6B35',      // Orange
    primaryHover: '#E55A2B',
    primaryLight: '#FFF3F0',
    secondary: '#6B7280',    // Gray
    accent: '#8B5CF6',       // Purple
    success: '#10B981',      // Green
    warning: '#F59E0B',      // Amber
    error: '#EF4444',        // Red
    info: '#3B82F6',         // Blue
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    
    // Text colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#E5E7EB',
    borderSecondary: '#D1D5DB',
    borderHover: '#9CA3AF',
    
    // Component specific
    navbarBg: '#FFFFFF',
    navbarText: '#111827',
    footerBg: '#1F2937',
    footerText: '#F9FAFB',
    cardBg: '#FFFFFF',
    modalBg: '#FFFFFF',
    
    // Gradients
    primaryGradient: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
    secondaryGradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    heroGradient: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 50%, #D53E22 100%)',
  },
  
  dark: {
    primary: '#FF6B35',      // Keep brand orange
    primaryHover: '#E55A2B',
    primaryLight: '#2D1B16',
    secondary: '#9CA3AF',    // Lighter gray for dark mode
    accent: '#A855F7',       // Lighter purple
    success: '#34D399',      // Lighter green
    warning: '#FBBF24',      // Lighter amber
    error: '#F87171',        // Lighter red
    info: '#60A5FA',         // Lighter blue
    
    // Background colors
    background: '#111827',
    backgroundSecondary: '#1F2937',
    backgroundTertiary: '#374151',
    
    // Text colors
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    textInverse: '#111827',
    
    // Border colors
    border: '#374151',
    borderSecondary: '#4B5563',
    borderHover: '#6B7280',
    
    // Component specific
    navbarBg: '#1F2937',
    navbarText: '#F9FAFB',
    footerBg: '#111827',
    footerText: '#F9FAFB',
    cardBg: '#1F2937',
    modalBg: '#1F2937',
    
    // Gradients
    primaryGradient: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
    secondaryGradient: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
    heroGradient: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 50%, #D53E22 100%)',
  }
};

const useThemeStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        currentTheme: 'light',
        themes: defaultThemes,
        customThemes: {},
        loading: false,
        error: null,
        previewMode: false,
        previewTheme: null,

        // Theme configuration
        themeConfig: {
          enableDarkMode: true,
          autoSwitchByTime: false,
          darkModeStart: '18:00',
          darkModeEnd: '06:00',
          followSystemTheme: false,
        },

        // Actions
        setTheme: (themeName) => {
          const { themes, customThemes } = get();
          const themeExists = themes[themeName] || customThemes[themeName];
          
          if (themeExists) {
            set({ currentTheme: themeName });
            get().applyThemeToDOM(themeName);
            toast.success(`Switched to ${themeName} theme`);
          } else {
            toast.error('Theme not found');
          }
        },

        toggleTheme: () => {
          const { currentTheme } = get();
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        // Apply theme variables to CSS
        applyThemeToDOM: (themeName) => {
          const { themes, customThemes } = get();
          const theme = customThemes[themeName] || themes[themeName];
          
          if (!theme) return;

          const root = document.documentElement;
          
          // Apply CSS custom properties
          Object.entries(theme).forEach(([key, value]) => {
            const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVar, value);
          });

          // Update data attribute for CSS selectors
          document.documentElement.setAttribute('data-theme', themeName);
          
          // Don't store theme-preference in localStorage - this conflicts with user theme settings
          // Only admin theme customizations should persist, not mode switching
          // localStorage.setItem('theme-preference', themeName);
        },

        // Preview theme (temporary, doesn't save)
        setPreviewTheme: (themeName, theme) => {
          set({ previewMode: true, previewTheme: { name: themeName, theme } });
          get().applyThemeToDOM(themeName, theme);
        },

        exitPreview: () => {
          const { currentTheme } = get();
          set({ previewMode: false, previewTheme: null });
          get().applyThemeToDOM(currentTheme);
        },

        // Fetch themes from backend
        fetchThemes: async () => {
          set({ loading: true, error: null });
          try {
            const response = await adminApi.get('/admin/themes/');
            
            if (response.status === 200) {
              const { themes: serverThemes, config } = response.data;
              set({ 
                customThemes: serverThemes || {},
                themeConfig: { ...get().themeConfig, ...config },
                loading: false 
              });
              return serverThemes;
            }
          } catch (error) {
            console.error('Error fetching themes:', error);
            // Use default themes as fallback
            set({ 
              loading: false,
              error: 'Using default themes - server unavailable'
            });
            return get().themes;
          }
        },

        // Save custom theme
        saveTheme: async (themeName, themeData, mode = 'light') => {
          set({ loading: true, error: null });
          try {
            const response = await adminApi.post('/admin/themes/save/', {
              name: themeName,
              theme: themeData,
              mode: mode
            });
            
            if (response.status === 201) {
              const { customThemes } = get();
              set({ 
                customThemes: {
                  ...customThemes,
                  [themeName]: themeData
                },
                loading: false 
              });
              toast.success('Theme saved successfully');
              return true;
            }
          } catch (error) {
            console.error('Error saving theme:', error);
            // Save locally as fallback
            const { customThemes } = get();
            set({ 
              customThemes: {
                ...customThemes,
                [themeName]: themeData
              },
              loading: false,
              error: 'Saved locally - server unavailable'
            });
            toast.success('Theme saved locally');
            return true;
          }
        },

        // Update theme configuration
        updateThemeConfig: async (config) => {
          set({ loading: true, error: null });
          try {
            const response = await adminApi.put('/admin/themes/config/', config);
            
            if (response.status === 200) {
              set({ 
                themeConfig: { ...get().themeConfig, ...config },
                loading: false 
              });
              toast.success('Theme configuration updated');
              return true;
            }
          } catch (error) {
            console.error('Error updating theme config:', error);
            // Update locally as fallback
            set({ 
              themeConfig: { ...get().themeConfig, ...config },
              loading: false,
              error: 'Updated locally - server unavailable'
            });
            toast.success('Configuration updated locally');
            return true;
          }
        },

        // Delete custom theme
        deleteTheme: async (themeName) => {
          set({ loading: true, error: null });
          try {
            const response = await adminApi.delete(`/admin/themes/${themeName}/`);
            
            if (response.status === 200) {
              const { customThemes, currentTheme } = get();
              const updatedThemes = { ...customThemes };
              delete updatedThemes[themeName];
              
              set({ 
                customThemes: updatedThemes,
                loading: false 
              });
              
              // Switch to default theme if current theme was deleted
              if (currentTheme === themeName) {
                get().setTheme('light');
              }
              
              toast.success('Theme deleted successfully');
              return true;
            }
          } catch (error) {
            console.error('Error deleting theme:', error);
            toast.error('Failed to delete theme');
            set({ loading: false });
            return false;
          }
        },

        // Generate theme from primary color
        generateThemeFromColor: (primaryColor, mode = 'light') => {
          // Simple theme generation logic
          // In a real app, you might use a color library like chroma.js
          const baseTheme = defaultThemes[mode];
          
          return {
            ...baseTheme,
            primary: primaryColor,
            primaryHover: adjustColor(primaryColor, -20),
            primaryLight: mode === 'light' ? adjustColor(primaryColor, 90) : adjustColor(primaryColor, -80),
            primaryGradient: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)`,
          };
        },

        // Initialize theme on app load
        initializeTheme: () => {
          // Don't initialize from localStorage theme-preference to avoid conflicts
          // Use frontend cache theme data instead
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const { themeConfig } = get();
          
          let initialTheme = 'light';
          
          if (themeConfig.followSystemTheme) {
            initialTheme = systemPrefersDark ? 'dark' : 'light';
          }
          
          get().setTheme(initialTheme);
          
          // Listen for system theme changes
          if (themeConfig.followSystemTheme) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
              get().setTheme(e.matches ? 'dark' : 'light');
            });
          }
        },

        // Get current theme colors
        getCurrentTheme: () => {
          const { currentTheme, themes, customThemes } = get();
          return customThemes[currentTheme] || themes[currentTheme] || themes.light;
        },

        // Export/Import themes
        exportThemes: () => {
          const { themes, customThemes, themeConfig } = get();
          const exportData = {
            defaultThemes: themes,
            customThemes: customThemes,
            config: themeConfig,
            exportDate: new Date().toISOString()
          };
          
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `themes-export-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          
          toast.success('Themes exported successfully');
        },

        importThemes: (file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const importData = JSON.parse(e.target.result);
              
              if (importData.customThemes) {
                set({ 
                  customThemes: { ...get().customThemes, ...importData.customThemes }
                });
              }
              
              if (importData.config) {
                set({ 
                  themeConfig: { ...get().themeConfig, ...importData.config }
                });
              }
              
              toast.success('Themes imported successfully');
            } catch (error) {
              console.error('Error importing themes:', error);
              toast.error('Invalid theme file');
            }
          };
          reader.readAsText(file);
        },

        // Clear error
        clearError: () => set({ error: null }),
      }),
      {
        name: 'theme-store',
        partialize: (state) => ({
          currentTheme: state.currentTheme,
          customThemes: state.customThemes,
          themeConfig: state.themeConfig,
        }),
      }
    ),
    { name: 'theme-store' }
  )
);

// Helper function to adjust color brightness
function adjustColor(color, amount) {
  // Simple color adjustment - in a real app, use a proper color library
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
  return color;
}

export default useThemeStore;
