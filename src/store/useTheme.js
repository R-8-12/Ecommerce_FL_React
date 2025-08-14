import { create } from 'zustand';

const useThemeStore = create((set, get) => ({
  theme: 'light', 
  isDarkMode: false,
  
  
  setTheme: (theme) => {
    set({ theme });
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      set({ isDarkMode: systemPrefersDark });
      updateDocumentClass(systemPrefersDark);
    } else {
      const isDark = theme === 'dark';
      set({ isDarkMode: isDark });
      updateDocumentClass(isDark);
    }
    
    // Only store the theme mode if user manually sets it
    // Don't store automatic theme changes from admin customizations
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      localStorage.setItem('anand-mobiles-theme', theme);
    }
  },
  
  
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },
  
  initializeTheme: () => {
    
    document.documentElement.classList.add('no-transitions');
    
    const savedTheme = localStorage.getItem('anand-mobiles-theme') || 'light';
    get().setTheme(savedTheme);
    
    
    setTimeout(() => {
      document.documentElement.classList.remove('no-transitions');
    }, 100);
  }
}));


const updateDocumentClass = (isDark) => {
  const docElement = document.documentElement;
  
  if (isDark) {
    docElement.classList.add('dark');
  
    document.body.classList.add('dark');
  } else {
    docElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }
};


if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (_e) => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      useThemeStore.getState().setTheme('system');
    }
  });
}

export default useThemeStore;
