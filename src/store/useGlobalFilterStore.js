import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useGlobalFilterStore = create(
  devtools(
    (set, get) => ({
      // Global filter state
      globalFilters: {
        brand: null,
        category: null,
        priceMin: null,
        priceMax: null,
        searchQuery: null,
        rating: null,
        sortBy: null,
        type: null,       // For accessories/laptop/mobile types
        resolution: null, // For TVs
        os: null,         // For Android/iOS
        storage: null,    // For storage filters
        ram: null,        // For RAM filters
        color: null       // For color filters
      },

      // Set filters from URL parameters
      setFiltersFromURL: (searchParams) => {
        const filters = {};
        
        // Extract all possible filter parameters
        const brand = searchParams.get('brand');
        const category = searchParams.get('category');
        const priceMin = searchParams.get('price_min');
        const priceMax = searchParams.get('price_max');
        const query = searchParams.get('query');
        const rating = searchParams.get('rating');
        const sortBy = searchParams.get('sort');
        const type = searchParams.get('type');
        const resolution = searchParams.get('resolution');
        const os = searchParams.get('os');
        const storage = searchParams.get('storage');
        const ram = searchParams.get('ram');
        const color = searchParams.get('color');

        // Only set non-null values
        if (brand) filters.brand = brand;
        if (category) filters.category = category;
        if (priceMin) filters.priceMin = parseInt(priceMin);
        if (priceMax) filters.priceMax = parseInt(priceMax);
        if (query) filters.searchQuery = query;
        if (rating) filters.rating = parseInt(rating);
        if (sortBy) filters.sortBy = sortBy;
        if (type) filters.type = type;
        if (resolution) filters.resolution = resolution;
        if (os) filters.os = os;
        if (storage) filters.storage = storage;
        if (ram) filters.ram = ram;
        if (color) filters.color = color;

        set(state => ({
          globalFilters: {
            ...state.globalFilters,
            ...filters
          }
        }));

        return filters;
      },

      // Convert global filters to enhanced product filter format
      toEnhancedProductFilters: () => {
        const { globalFilters } = get();
        
        return {
          brands: globalFilters.brand ? [globalFilters.brand] : [],
          categories: globalFilters.category ? [globalFilters.category] : [],
          priceRange: {
            min: globalFilters.priceMin || 0,
            max: globalFilters.priceMax || 150000
          },
          storage: globalFilters.storage ? [globalFilters.storage] : [],
          ram: globalFilters.ram ? [globalFilters.ram] : [],
          colors: globalFilters.color ? [globalFilters.color] : [],
          rating: globalFilters.rating || 0,
          stockFilters: { inStock: false, outOfStock: false },
          discount: null,
          type: globalFilters.type,
          resolution: globalFilters.resolution,
          os: globalFilters.os
        };
      },

      // Update specific filter
      updateFilter: (key, value) => {
        set(state => ({
          globalFilters: {
            ...state.globalFilters,
            [key]: value
          }
        }));
      },

      // Clear all filters
      clearFilters: () => {
        set({
          globalFilters: {
            brand: null,
            category: null,
            priceMin: null,
            priceMax: null,
            searchQuery: null,
            rating: null,
            sortBy: null,
            type: null,
            resolution: null,
            os: null,
            storage: null,
            ram: null,
            color: null
          }
        });
      },

      // Get active filter count
      getActiveFilterCount: () => {
        const { globalFilters } = get();
        return Object.values(globalFilters).filter(value => 
          value !== null && value !== undefined && value !== ''
        ).length;
      },

      // Get filter description for UI
      getFilterDescription: () => {
        const { globalFilters } = get();
        const parts = [];

        if (globalFilters.brand) parts.push(`Brand: ${globalFilters.brand}`);
        if (globalFilters.category) parts.push(`Category: ${globalFilters.category}`);
        if (globalFilters.type) parts.push(`Type: ${globalFilters.type}`);
        if (globalFilters.priceMin && globalFilters.priceMax) {
          parts.push(`Price: ₹${globalFilters.priceMin} - ₹${globalFilters.priceMax}`);
        } else if (globalFilters.priceMin) {
          parts.push(`Price: Above ₹${globalFilters.priceMin}`);
        } else if (globalFilters.priceMax) {
          parts.push(`Price: Below ₹${globalFilters.priceMax}`);
        }
        if (globalFilters.rating) parts.push(`${globalFilters.rating}+ Stars`);
        if (globalFilters.resolution) parts.push(`Resolution: ${globalFilters.resolution}`);
        if (globalFilters.os) parts.push(`OS: ${globalFilters.os}`);
        if (globalFilters.storage) parts.push(`Storage: ${globalFilters.storage}`);
        if (globalFilters.ram) parts.push(`RAM: ${globalFilters.ram}`);
        if (globalFilters.color) parts.push(`Color: ${globalFilters.color}`);

        return parts.join(', ');
      },

      // Generate URL search params from current filters
      toURLParams: () => {
        const { globalFilters } = get();
        const params = new URLSearchParams();

        Object.entries(globalFilters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            // Convert camelCase keys to snake_case for URL
            const urlKey = key === 'priceMin' ? 'price_min' :
                          key === 'priceMax' ? 'price_max' :
                          key === 'searchQuery' ? 'query' :
                          key === 'sortBy' ? 'sort' : key;
            params.append(urlKey, value.toString());
          }
        });

        return params.toString();
      }
    }),
    {
      name: 'global-filter-store'
    }
  )
);

export default useGlobalFilterStore;
