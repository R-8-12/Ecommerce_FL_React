import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

// Create axios instance for public API calls
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache duration constants (in milliseconds)
const CACHE_DURATION = {
  THEME: 24 * 60 * 60 * 1000, // 24 hours
  BANNERS: 12 * 60 * 60 * 1000, // 12 hours
  FOOTER: 24 * 60 * 60 * 1000, // 24 hours
  HOMEPAGE_SECTIONS: 2 * 60 * 60 * 1000, // 2 hours
  BRANDS: 12 * 60 * 60 * 1000, // 12 hours
  CATEGORIES: 12 * 60 * 60 * 1000, // 12 hours
  LOGO: 24 * 60 * 60 * 1000, // 24 hours
  PAGES: 12 * 60 * 60 * 1000, // 12 hours
};

// Storage keys for localStorage persistence
const STORAGE_KEYS = {
  THEME: 'frontend_cache_theme',
  BANNERS: 'frontend_cache_banners',
  FOOTER: 'frontend_cache_footer',
  HOMEPAGE_SECTIONS: 'frontend_cache_homepage_sections',
  BRANDS: 'frontend_cache_brands',
  CATEGORIES: 'frontend_cache_categories',
  LOGO: 'frontend_cache_logo',
  PAGES: 'frontend_cache_pages',
  LAST_FETCH: 'frontend_cache_last_fetch',
  CONTEXT_CACHE: 'frontend_cache_context_tracking', // Track what context loaded what data
};

// Helper functions for localStorage
const getStoredData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

const setStoredData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing ${key} to localStorage:`, error);
  }
};

const getLastFetchTime = (key) => {
  const lastFetch = getStoredData(STORAGE_KEYS.LAST_FETCH) || {};
  return lastFetch[key] || 0;
};

const setLastFetchTime = (key) => {
  const lastFetch = getStoredData(STORAGE_KEYS.LAST_FETCH) || {};
  lastFetch[key] = Date.now();
  setStoredData(STORAGE_KEYS.LAST_FETCH, lastFetch);
};

const isDataStale = (key, maxAge) => {
  const lastFetch = getLastFetchTime(key);
  return (Date.now() - lastFetch) > maxAge;
};

// Default/fallback data
const DEFAULT_DATA = {
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter',
  },
  banners: [],
  footer: {
    companyInfo: {
      name: 'Anand Mobiles',
      description: 'Your trusted mobile store',
      address: 'Bhopal, Madhya Pradesh',
      phone: '+91 9876543210',
      email: 'contact@anandmobiles.com',
    },
    links: {
      quickLinks: [],
      customerService: [],
      legal: [],
    },
    socialLinks: [],
    newsletter: true,
  },
  homepageSections: [],
  brands: [],
  categories: [],
  logo: null,
  pages: {},
};

const useFrontendCacheStore = create(
  devtools(
    (set, get) => ({
      // Cache state - Initialize with DEFAULT_DATA, will be populated from API
      cache: {
        theme: DEFAULT_DATA.theme,
        banners: DEFAULT_DATA.banners,
        footer: DEFAULT_DATA.footer,
        homepageSections: DEFAULT_DATA.homepageSections,
        brands: DEFAULT_DATA.brands,
        categories: DEFAULT_DATA.categories,
        logo: DEFAULT_DATA.logo,
        pages: DEFAULT_DATA.pages,
      },
      
      // Context tracking - track what context loaded what data
      contextCache: getStoredData(STORAGE_KEYS.CONTEXT_CACHE) || {
        homepage: {},
        admin: {},
        delivery: {},
        shared: {}
      },
      
      // Track recent initializations to prevent duplicates
      recentInitializations: {},
      
      // Loading states
      loading: {
        theme: false,
        banners: false,
        footer: false,
        homepageSections: false,
        brands: false,
        categories: false,
        logo: false,
        pages: false,
      },

      // Error states
      errors: {},

      // Initialization state
      initialized: false,

      // Context-aware initialization to prevent duplicate calls
      initializeCacheWithContext: async (context = 'homepage', force = false) => {
        const { contextCache, recentInitializations } = get();
        const now = Date.now();
        
        // Prevent duplicate initializations within 5 seconds
        const DEBOUNCE_TIME = 5000; // 5 seconds
        if (!force && recentInitializations[context] && (now - recentInitializations[context]) < DEBOUNCE_TIME) {
          console.log(`⏳ ${context}: Skipping initialization - recently completed (${(now - recentInitializations[context])/1000}s ago)`);
          return get().cache;
        }
        
        // Mark this context as being initialized
        set(state => ({
          recentInitializations: {
            ...state.recentInitializations,
            [context]: now
          }
        }));
        
        // Check if this context already has loaded data
        const contextData = contextCache[context] || {};
        
        // Define what data each context needs
        const contextRequirements = {
          homepage: ['theme', 'banners', 'footer', 'homepageSections', 'brands', 'categories', 'logo'],
          admin: ['theme', 'footer', 'logo'], // Admin should NOT call banners/homepage sections/brands/categories
          delivery: ['theme', /*'footer', 'logo'*/], // Delivery partners need theme, footer, and logo like admin - expanded for better theme consistency
          shared: ['theme', 'footer', 'logo'] // Minimal shared data
        };
        
        const requiredData = contextRequirements[context] || contextRequirements.shared;
        
        console.log(`🎯 Initializing ${context} context cache with requirements:`, requiredData);
        console.log(`📊 Current context cache state:`, contextCache);
        
        // Check what data is missing or stale for this context
        const fetchPromises = [];
        const needsFetch = {};
        
        for (const dataType of requiredData) {
          const lastFetch = contextData[dataType] || 0;
          const maxAge = CACHE_DURATION[dataType.toUpperCase()] || CACHE_DURATION.THEME;
          const isStale = (now - lastFetch) > maxAge;
          
          // Check if ANY context has recently fetched this data (cross-context sharing)
          const allContexts = Object.values(contextCache);
          const anyRecentFetch = allContexts.some(ctx => ctx[dataType] && (now - ctx[dataType]) < maxAge);
          
          // Also check if data exists in our current cache
          const hasDataInCache = get().cache[dataType] && (
            Array.isArray(get().cache[dataType]) ? get().cache[dataType].length > 0 : 
            typeof get().cache[dataType] === 'object' ? Object.keys(get().cache[dataType]).length > 0 :
            get().cache[dataType] !== null
          );
          
          if (force || (!lastFetch && !anyRecentFetch && !hasDataInCache) || (isStale && !anyRecentFetch && !hasDataInCache)) {
            needsFetch[dataType] = true;
            console.log(`📥 ${context}: Fetching ${dataType}... (lastFetch: ${lastFetch}, isStale: ${isStale}, hasCache: ${hasDataInCache})`);
          } else if (anyRecentFetch || hasDataInCache) {
            console.log(`✅ ${context}: Using cached ${dataType} (anyRecentFetch: ${anyRecentFetch}, hasCache: ${hasDataInCache})`);
          } else {
            console.log(`✅ ${context}: Using context cached ${dataType}`);
          }
        }
        
        // Fetch only what's needed
        Object.keys(needsFetch).forEach(dataType => {
          const fetchMethod = `fetch${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`;
          if (get()[fetchMethod]) {
            // Pass context to fetch method for context-aware API selection
            fetchPromises.push(get()[fetchMethod](context));
          }
        });
        
        // Execute fetches
        if (fetchPromises.length > 0) {
          try {
            await Promise.all(fetchPromises);
            
            // Update context cache tracking for ALL contexts that need this data
            const updatedContextCache = { ...get().contextCache };
            
            // Update the current context
            updatedContextCache[context] = { ...contextData };
            Object.keys(needsFetch).forEach(dataType => {
              updatedContextCache[context][dataType] = now;
            });
            
            // Also update other contexts that require the same data (cross-context sharing)
            Object.keys(contextRequirements).forEach(ctxName => {
              if (ctxName !== context) {
                const ctxRequiredData = contextRequirements[ctxName];
                updatedContextCache[ctxName] = updatedContextCache[ctxName] || {};
                
                Object.keys(needsFetch).forEach(dataType => {
                  if (ctxRequiredData.includes(dataType)) {
                    updatedContextCache[ctxName][dataType] = now;
                    console.log(`🔄 Cross-context update: ${ctxName} now has cached ${dataType}`);
                  }
                });
              }
            });
            
            set({ contextCache: updatedContextCache });
            setStoredData(STORAGE_KEYS.CONTEXT_CACHE, updatedContextCache);
            
            console.log(`✅ ${context} context cache updated successfully`);
          } catch (error) {
            console.error(`❌ Error initializing ${context} cache:`, error);
          }
        }
        
        return get().cache;
      },

      // Initialize cache with minimal API calls
      initializeCache: async (force = false) => {
        const { cache, loading } = get();
        
        // Don't initialize if already in progress
        if (!force && Object.values(loading).some(Boolean)) {
          return cache;
        }

        // Check if this is the first initialization (no previous cache)
        const isFirstLoad = !get().initialized;
        
        console.log('🚀 Initializing frontend cache...', isFirstLoad ? '(First load - fetching fresh data)' : '(Using cache policy)');
        
        // Batch fetch data
        const fetchPromises = [];
        
        // On first load, always fetch fresh data
        // On subsequent loads, only fetch stale data
        if (isFirstLoad || force || isDataStale(STORAGE_KEYS.THEME, CACHE_DURATION.THEME)) {
          console.log('📥 Fetching theme data...');
          fetchPromises.push(get().fetchTheme());
        } else {
          // Load from localStorage if available
          const cachedTheme = getStoredData(STORAGE_KEYS.THEME);
          if (cachedTheme) {
            set(state => ({ cache: { ...state.cache, theme: cachedTheme } }));
            
            // Apply cached theme colors to CSS variables
            if (cachedTheme && cachedTheme.colors) {
              console.log('🎨 Applying cached theme colors to document:', cachedTheme.colors);
              try {
                // Dynamic import to avoid circular dependencies
                import('../utils/colorUtils.js').then(({ applyColorsToDocument }) => {
                  applyColorsToDocument(cachedTheme.colors);
                  console.log('✅ Cached theme colors applied successfully');
                });
              } catch (error) {
                console.error('❌ Failed to apply cached theme colors:', error);
              }
            }
          }
        }
        
        if (isFirstLoad || force || isDataStale(STORAGE_KEYS.BANNERS, CACHE_DURATION.BANNERS)) {
          console.log('📥 Fetching banners data...');
          fetchPromises.push(get().fetchBanners());
        } else {
          const cachedBanners = getStoredData(STORAGE_KEYS.BANNERS);
          if (cachedBanners) {
            set(state => ({ cache: { ...state.cache, banners: cachedBanners } }));
          }
        }
        
        if (isFirstLoad || force || isDataStale(STORAGE_KEYS.FOOTER, CACHE_DURATION.FOOTER)) {
          console.log('📥 Fetching footer data...');
          fetchPromises.push(get().fetchFooter());
        } else {
          const cachedFooter = getStoredData(STORAGE_KEYS.FOOTER);
          if (cachedFooter) {
            set(state => ({ cache: { ...state.cache, footer: cachedFooter } }));
          }
        }
        
        if (isFirstLoad || force || isDataStale(STORAGE_KEYS.HOMEPAGE_SECTIONS, CACHE_DURATION.HOMEPAGE_SECTIONS)) {
          console.log('📥 Fetching homepage sections data...');
          fetchPromises.push(get().fetchHomepageSections());
        } else {
          const cachedSections = getStoredData(STORAGE_KEYS.HOMEPAGE_SECTIONS);
          if (cachedSections) {
            set(state => ({ cache: { ...state.cache, homepageSections: cachedSections } }));
          }
        }
        
        if (isFirstLoad || force || isDataStale(STORAGE_KEYS.BRANDS, CACHE_DURATION.BRANDS)) {
          console.log('📥 Fetching brands data...');
          fetchPromises.push(get().fetchBrands());
        } else {
          const cachedBrands = getStoredData(STORAGE_KEYS.BRANDS);
          if (cachedBrands) {
            set(state => ({ cache: { ...state.cache, brands: cachedBrands } }));
          }
        }
        
        if (isFirstLoad || force || isDataStale(STORAGE_KEYS.CATEGORIES, CACHE_DURATION.CATEGORIES)) {
          console.log('📥 Fetching categories data...');
          fetchPromises.push(get().fetchCategories());
        } else {
          const cachedCategories = getStoredData(STORAGE_KEYS.CATEGORIES);
          if (cachedCategories) {
            set(state => ({ cache: { ...state.cache, categories: cachedCategories } }));
          }
        }
        
        if (isFirstLoad || force || isDataStale(STORAGE_KEYS.LOGO, CACHE_DURATION.LOGO)) {
          console.log('📥 Fetching logo data...');
          fetchPromises.push(get().fetchLogo());
        } else {
          const cachedLogo = getStoredData(STORAGE_KEYS.LOGO);
          if (cachedLogo) {
            set(state => ({ cache: { ...state.cache, logo: cachedLogo } }));
          }
        }

        // Execute all fetches in parallel
        try {
          if (fetchPromises.length > 0) {
            console.log(`🔄 Executing ${fetchPromises.length} API calls...`);
            await Promise.allSettled(fetchPromises);
          } else {
            console.log('📦 Using cached data (no API calls needed)');
          }
          
          set({ initialized: true });
          console.log('✅ Frontend cache initialized successfully');
        } catch (error) {
          console.error('❌ Error initializing frontend cache:', error);
        }

        return get().cache;
      },

      // Individual fetch methods (context-aware API calls)
      fetchTheme: async (context = 'homepage') => {
        if (get().loading.theme) return get().cache.theme;
        
        set(state => ({ loading: { ...state.loading, theme: true } }));
        
        try {
          console.log(`🎨 Fetching theme from API (${context} context)...`);
          
          // Use different endpoints based on context
          const endpoint = context === 'admin' ? '/admin/theme/public/' : '/admin/theme/public/';
          const response = await api.get(endpoint);
          const themeData = response.data.theme || DEFAULT_DATA.theme;
          
          console.log('🎨 Theme data received:', themeData);
          
          // Apply theme colors to CSS variables immediately
          if (themeData && themeData.colors) {
            console.log('🎨 Applying theme colors to document:', themeData.colors);
            try {
              // Dynamic import to avoid circular dependencies
              const { applyColorsToDocument } = await import('../utils/colorUtils.js');
              applyColorsToDocument(themeData.colors);
              console.log('✅ Theme colors applied successfully');
            } catch (error) {
              console.error('❌ Failed to apply theme colors:', error);
            }
          }
          
          set(state => ({
            cache: { ...state.cache, theme: themeData },
            loading: { ...state.loading, theme: false },
            errors: { ...state.errors, theme: null }
          }));
          
          setStoredData(STORAGE_KEYS.THEME, themeData);
          setLastFetchTime(STORAGE_KEYS.THEME);
          
          return themeData;
        } catch (error) {
          console.warn('🎨 Using default theme data:', error.message);
          set(state => ({
            loading: { ...state.loading, theme: false },
            errors: { ...state.errors, theme: error.message }
          }));
          return get().cache.theme;
        }
      },

      fetchBanners: async (context = 'homepage') => {
        if (get().loading.banners) return get().cache.banners;
        
        set(state => ({ loading: { ...state.loading, banners: true } }));
        
        try {
          console.log(`🎯 Fetching banners from API (${context} context)...`);
          
          // Use different endpoints based on context
          const endpoint = context === 'admin' ? '/admin/banners/public/' : '/admin/banners/public/';
          const response = await api.get(endpoint);
          const bannersData = response.data.banners || DEFAULT_DATA.banners;
          
          console.log('🎯 Banners data received:', bannersData);
          
          // Ensure we're getting real banners, filter out any null or incomplete entries
          const validBanners = bannersData.filter(banner => 
            banner && banner.image && (banner.title || banner.subtitle || banner.description)
          );
          
          if (validBanners.length > 0) {
            console.log('🎯 Valid banners found:', validBanners.length);
            
            set(state => ({
              cache: { ...state.cache, banners: validBanners },
              loading: { ...state.loading, banners: false },
              errors: { ...state.errors, banners: null }
            }));
            
            setStoredData(STORAGE_KEYS.BANNERS, validBanners);
            setLastFetchTime(STORAGE_KEYS.BANNERS);
            
            return validBanners;
          } else {
            console.warn('🎯 No valid banners found in API response, using default banners');
            set(state => ({
              loading: { ...state.loading, banners: false },
              errors: { ...state.errors, banners: 'No valid banners found' }
            }));
            return get().cache.banners;
          }
        } catch (error) {
          console.warn('🎯 Using cached banner data:', error.message);
          set(state => ({
            loading: { ...state.loading, banners: false },
            errors: { ...state.errors, banners: error.message }
          }));
          return get().cache.banners;
        }
      },

      fetchFooter: async (context = 'homepage') => {
        if (get().loading.footer) return get().cache.footer;
        
        set(state => ({ loading: { ...state.loading, footer: true } }));
        
        try {
          console.log(`🦶 Fetching footer from API (${context} context)...`);
          
          // Use different endpoints based on context
          const endpoint = context === 'admin' ? '/admin/footer/' : '/admin/footer/';
          const response = await api.get(endpoint);
          // Fix: Extract footer_config from API response
          const footerData = response.data.footer_config || DEFAULT_DATA.footer;
          
          console.log('🦶 Footer data received:', footerData);
          
          set(state => ({
            cache: { ...state.cache, footer: footerData },
            loading: { ...state.loading, footer: false },
            errors: { ...state.errors, footer: null }
          }));
          
          setStoredData(STORAGE_KEYS.FOOTER, footerData);
          setLastFetchTime(STORAGE_KEYS.FOOTER);
          
          return footerData;
        } catch (error) {
          console.warn('🦶 Using default footer data:', error.message);
          set(state => ({
            loading: { ...state.loading, footer: false },
            errors: { ...state.errors, footer: error.message }
          }));
          return get().cache.footer;
        }
      },

      fetchHomepageSections: async (context = 'homepage') => {
        if (get().loading.homepageSections) return get().cache.homepageSections;
        
        set(state => ({ loading: { ...state.loading, homepageSections: true } }));
        
        try {
          console.log(`🏠 Fetching homepage sections from API (${context} context)...`);
          
          // Use different endpoints based on context
          const endpoint = context === 'admin' ? '/admin/homepage/sections/public/' : '/admin/homepage/sections/public/';
          const response = await api.get(endpoint);
          const sectionsData = response.data.sections || DEFAULT_DATA.homepageSections;
          
          console.log('🏠 Homepage sections data received:', sectionsData);
          
          set(state => ({
            cache: { ...state.cache, homepageSections: sectionsData },
            loading: { ...state.loading, homepageSections: false },
            errors: { ...state.errors, homepageSections: null }
          }));
          
          setStoredData(STORAGE_KEYS.HOMEPAGE_SECTIONS, sectionsData);
          setLastFetchTime(STORAGE_KEYS.HOMEPAGE_SECTIONS);
          
          return sectionsData;
        } catch (error) {
          console.warn('🏠 Using cached homepage sections:', error.message);
          set(state => ({
            loading: { ...state.loading, homepageSections: false },
            errors: { ...state.errors, homepageSections: error.message }
          }));
          return get().cache.homepageSections;
        }
      },

      fetchBrands: async (context = 'homepage') => {
        if (get().loading.brands) return get().cache.brands;
        
        set(state => ({ loading: { ...state.loading, brands: true } }));
        
        try {
          console.log(`🏷️ Fetching brands from API (${context} context)...`);
          
          // Use different endpoints based on context
          const endpoint = context === 'admin' ? '/admin/brands/public/' : '/admin/brands/public/';
          const response = await api.get(endpoint);
          const brandsData = response.data.brands || DEFAULT_DATA.brands;
          
          console.log('🏷️ Brands data received:', brandsData);
          
          // Transform brands data to include navigation links
          const transformedBrands = brandsData.map(brand => ({
            ...brand,
            link: `/category/smartphones?brand=${encodeURIComponent(brand.name)}`,
            logo: brand.logo_url,
            productCount: brand.product_count
          }));
          
          set(state => ({
            cache: { ...state.cache, brands: transformedBrands },
            loading: { ...state.loading, brands: false },
            errors: { ...state.errors, brands: null }
          }));
          
          setStoredData(STORAGE_KEYS.BRANDS, transformedBrands);
          setLastFetchTime(STORAGE_KEYS.BRANDS);
          
          return transformedBrands;
        } catch (error) {
          console.warn('🏷️ Using cached brands data:', error.message);
          set(state => ({
            loading: { ...state.loading, brands: false },
            errors: { ...state.errors, brands: error.message }
          }));
          return get().cache.brands;
        }
      },

      fetchCategories: async (context = 'homepage') => {
        if (get().loading.categories) return get().cache.categories;
        
        set(state => ({ loading: { ...state.loading, categories: true } }));
        
        try {
          console.log(`📁 Fetching categories from API (${context} context)...`);
          
          // Categories use the same endpoint for both contexts (products API)
          const response = await api.get('/products/categories/');
          const categoriesData = response.data.categories || DEFAULT_DATA.categories;
          
          set(state => ({
            cache: { ...state.cache, categories: categoriesData },
            loading: { ...state.loading, categories: false },
            errors: { ...state.errors, categories: null }
          }));
          
          setStoredData(STORAGE_KEYS.CATEGORIES, categoriesData);
          setLastFetchTime(STORAGE_KEYS.CATEGORIES);
          
          return categoriesData;
        } catch (error) {
          console.warn('Using cached categories data:', error.message);
          set(state => ({
            loading: { ...state.loading, categories: false },
            errors: { ...state.errors, categories: error.message }
          }));
          return get().cache.categories;
        }
      },

      fetchLogo: async (context = 'homepage') => {
        if (get().loading.logo) return get().cache.logo;
        
        set(state => ({ loading: { ...state.loading, logo: true } }));
        
        try {
          console.log(`🏷️ Fetching logo from API (${context} context)...`);
          
          // Use different endpoints based on context
          const endpoint = context === 'admin' ? '/admin/content/logo/' : '/admin/content/logo/';
          const response = await api.get(endpoint);
          // Fix: Extract logo_url from API response
          const logoData = response.data.logo_url || DEFAULT_DATA.logo;
          
          console.log('🏷️ Logo data received:', logoData);
          
          set(state => ({
            cache: { ...state.cache, logo: logoData },
            loading: { ...state.loading, logo: false },
            errors: { ...state.errors, logo: null }
          }));
          
          setStoredData(STORAGE_KEYS.LOGO, logoData);
          setLastFetchTime(STORAGE_KEYS.LOGO);
          
          return logoData;
        } catch (error) {
          console.warn('🏷️ Using cached logo data:', error.message);
          set(state => ({
            loading: { ...state.loading, logo: false },
            errors: { ...state.errors, logo: error.message }
          }));
          return get().cache.logo;
        }
      },

      fetchPage: async (pagePath) => {
        const { cache, loading } = get();
        
        if (loading.pages) return cache.pages[pagePath];
        if (cache.pages[pagePath] && !isDataStale(`page_${pagePath}`, CACHE_DURATION.PAGES)) {
          return cache.pages[pagePath];
        }
        
        set(state => ({ loading: { ...state.loading, pages: true } }));
        
        try {
          console.log(`📄 Fetching page '${pagePath}' from API...`);
          const response = await api.get(`/admin/content/pages/${pagePath}/`);
          // Fix: Extract content from API response
          const pageData = response.data.content || response.data.page || null;
          
          console.log(`📄 Page '${pagePath}' data received:`, pageData);
          
          set(state => ({
            cache: { 
              ...state.cache, 
              pages: { ...state.cache.pages, [pagePath]: pageData }
            },
            loading: { ...state.loading, pages: false },
            errors: { ...state.errors, pages: null }
          }));
          
          // Store individual page data
          const allPages = { ...cache.pages, [pagePath]: pageData };
          setStoredData(STORAGE_KEYS.PAGES, allPages);
          setLastFetchTime(`page_${pagePath}`);
          
          return pageData;
        } catch (error) {
          console.warn(`📄 Using cached page data for ${pagePath}:`, error.message);
          set(state => ({
            loading: { ...state.loading, pages: false },
            errors: { ...state.errors, pages: error.message }
          }));
          return cache.pages[pagePath] || null;
        }
      },

      // Force refresh specific data type
      refreshData: async (dataType) => {
        const fetchMethods = {
          theme: 'fetchTheme',
          banners: 'fetchBanners',
          footer: 'fetchFooter',
          homepageSections: 'fetchHomepageSections',
          brands: 'fetchBrands',
          categories: 'fetchCategories',
          logo: 'fetchLogo',
        };
        
        if (fetchMethods[dataType]) {
          return await get()[fetchMethods[dataType]]();
        }
      },

      // Admin update methods (called when admin makes changes)
      updateTheme: (newTheme) => {
        set(state => ({
          cache: { ...state.cache, theme: newTheme }
        }));
        setStoredData(STORAGE_KEYS.THEME, newTheme);
        setLastFetchTime(STORAGE_KEYS.THEME);
      },

      updateBanners: (newBanners) => {
        set(state => ({
          cache: { ...state.cache, banners: newBanners }
        }));
        setStoredData(STORAGE_KEYS.BANNERS, newBanners);
        setLastFetchTime(STORAGE_KEYS.BANNERS);
      },

      updateFooter: (newFooter) => {
        set(state => ({
          cache: { ...state.cache, footer: newFooter }
        }));
        setStoredData(STORAGE_KEYS.FOOTER, newFooter);
        setLastFetchTime(STORAGE_KEYS.FOOTER);
      },

      updateHomepageSections: (newSections) => {
        set(state => ({
          cache: { ...state.cache, homepageSections: newSections }
        }));
        setStoredData(STORAGE_KEYS.HOMEPAGE_SECTIONS, newSections);
        setLastFetchTime(STORAGE_KEYS.HOMEPAGE_SECTIONS);
      },

      updateBrands: (newBrands) => {
        const transformedBrands = newBrands.map(brand => ({
          ...brand,
          link: `/category/smartphones?brand=${encodeURIComponent(brand.name)}`,
          logo: brand.logo_url,
          productCount: brand.product_count
        }));
        
        set(state => ({
          cache: { ...state.cache, brands: transformedBrands }
        }));
        setStoredData(STORAGE_KEYS.BRANDS, transformedBrands);
        setLastFetchTime(STORAGE_KEYS.BRANDS);
      },

      updateLogo: (newLogo) => {
        set(state => ({
          cache: { ...state.cache, logo: newLogo }
        }));
        setStoredData(STORAGE_KEYS.LOGO, newLogo);
        setLastFetchTime(STORAGE_KEYS.LOGO);
      },

      // Clear cache (useful for debugging or admin forcing refresh)
      clearCache: () => {
        console.log('🗑️ Clearing all cache...');
        
        // Clear localStorage completely
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ Cleared localStorage key: ${key}`);
        });
        
        set({
          cache: {
            theme: DEFAULT_DATA.theme,
            banners: DEFAULT_DATA.banners,
            footer: DEFAULT_DATA.footer,
            homepageSections: DEFAULT_DATA.homepageSections,
            brands: DEFAULT_DATA.brands,
            categories: DEFAULT_DATA.categories,
            logo: DEFAULT_DATA.logo,
            pages: DEFAULT_DATA.pages,
          },
          loading: {
            theme: false,
            banners: false,
            footer: false,
            homepageSections: false,
            brands: false,
            categories: false,
            logo: false,
            pages: false,
          },
          errors: {},
          initialized: false,
        });
        
        console.log('✅ Cache cleared successfully');
      },

      updateGamification: () => {
        console.log('♻️ Invalidating gamification cache...');
        // Clear any gamification related cached data
        // This will force frontend components to refetch gamification settings
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gamificationUpdated'));
        }
      },

      // Get methods for easy access
      getTheme: () => get().cache.theme,
      getBanners: () => get().cache.banners,
      getFooter: () => get().cache.footer,
      getHomepageSections: () => get().cache.homepageSections,
      getBrands: () => get().cache.brands,
      getCategories: () => get().cache.categories,
      getLogo: () => get().cache.logo,
      getPage: (pagePath) => get().cache.pages[pagePath],
      
      // Check if data is loading
      isLoading: (dataType) => get().loading[dataType] || false,
      
      // Force refresh all data (ignores cache duration)
      forceRefresh: async () => {
        console.log('🔄 Force refreshing all frontend data...');
        get().clearCache();
        await get().initializeCache(true);
        console.log('✅ Force refresh completed');
      },
      
      // Get cache stats
      getCacheStats: () => {
        const lastFetch = getStoredData(STORAGE_KEYS.LAST_FETCH) || {};
        const now = Date.now();
        
        return Object.keys(CACHE_DURATION).reduce((stats, key) => {
          const storageKey = STORAGE_KEYS[key];
          const lastFetchTime = lastFetch[storageKey] || 0;
          const age = now - lastFetchTime;
          const maxAge = CACHE_DURATION[key];
          
          stats[key.toLowerCase()] = {
            lastFetch: new Date(lastFetchTime).toISOString(),
            age: Math.round(age / 1000 / 60), // minutes
            maxAge: Math.round(maxAge / 1000 / 60), // minutes
            isStale: age > maxAge,
          };
          
          return stats;
        }, {});
      },
    }),
    {
      name: 'frontend-cache-store',
    }
  )
);

export default useFrontendCacheStore;
