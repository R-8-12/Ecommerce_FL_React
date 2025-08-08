import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

// Create axios instance for public API calls (no auth required)
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

const usePublicBrandsStore = create(
  devtools(
    (set, get) => ({
      // State
      brands: [],
      loading: false,
      error: null,
      
      // Mock data for fallback when API fails
      getMockBrands: () => [
        {
          brand_id: 'mock-apple',
          name: 'Apple',
          slug: 'apple',
          description: 'Premium smartphones, tablets, and accessories',
          logo_url: '/brands/apple-logo.png',
          website_url: 'https://www.apple.com',
          featured: true,
          display_order: 1,
          product_count: 25,
          meta_data: { color: '#000000', category: 'Premium' }
        },
        {
          brand_id: 'mock-samsung',
          name: 'Samsung',
          slug: 'samsung',
          description: 'Innovative Android devices and accessories',
          logo_url: '/brands/samsung-logo.png',
          website_url: 'https://www.samsung.com',
          featured: true,
          display_order: 2,
          product_count: 32,
          meta_data: { color: '#1f2937', category: 'Android' }
        },
        {
          brand_id: 'mock-oneplus',
          name: 'OnePlus',
          slug: 'oneplus',
          description: 'Fast and smooth Android smartphones',
          logo_url: '/brands/oneplus-logo.png',
          website_url: 'https://www.oneplus.com',
          featured: true,
          display_order: 3,
          product_count: 18,
          meta_data: { color: '#dc2626', category: 'Android' }
        },
        {
          brand_id: 'mock-xiaomi',
          name: 'Xiaomi',
          slug: 'xiaomi',
          description: 'Value-for-money smartphones and accessories',
          logo_url: '/brands/xiaomi-logo.png',
          website_url: 'https://www.mi.com',
          featured: true,
          display_order: 4,
          product_count: 28,
          meta_data: { color: '#f59e0b', category: 'Android' }
        },
        {
          brand_id: 'mock-realme',
          name: 'Realme',
          slug: 'realme',
          description: 'Youth-focused smartphones with latest features',
          logo_url: '/brands/realme-logo.png',
          website_url: 'https://www.realme.com',
          featured: true,
          display_order: 5,
          product_count: 22,
          meta_data: { color: '#eab308', category: 'Android' }
        },
        {
          brand_id: 'mock-oppo',
          name: 'Oppo',
          slug: 'oppo',
          description: 'Camera-focused smartphones and accessories',
          logo_url: '/brands/oppo-logo.png',
          website_url: 'https://www.oppo.com',
          featured: false,
          display_order: 6,
          product_count: 15,
          meta_data: { color: '#22c55e', category: 'Android' }
        },
        {
          brand_id: 'mock-vivo',
          name: 'Vivo',
          slug: 'vivo',
          description: 'Selfie-focused smartphones with style',
          logo_url: '/brands/vivo-logo.png',
          website_url: 'https://www.vivo.com',
          featured: false,
          display_order: 7,
          product_count: 19,
          meta_data: { color: '#3b82f6', category: 'Android' }
        },
        {
          brand_id: 'mock-google',
          name: 'Google',
          slug: 'google',
          description: 'Pure Android experience with Pixel devices',
          logo_url: '/brands/google-logo.png',
          website_url: 'https://store.google.com',
          featured: false,
          display_order: 8,
          product_count: 8,
          meta_data: { color: '#6366f1', category: 'Android' }
        }
      ],

      // Actions
      fetchPublicBrands: async (featuredOnly = false, limit = null) => {
        set({ loading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (featuredOnly) params.append('featured_only', 'true');
          if (limit) params.append('limit', limit.toString());
          
          const response = await api.get(`/brands/public/?${params.toString()}`);
          
          console.log('Public brands response:', response.data);
          
          if (response.status === 200) {
            // Transform brands data to include link paths for navigation
            const brandsWithLinks = response.data.brands.map(brand => ({
              ...brand,
              link: `/category/smartphones?brand=${encodeURIComponent(brand.name)}`,
              logo: brand.logo_url,
              productCount: brand.product_count
            }));
            
            set({ 
              brands: brandsWithLinks,
              loading: false,
              error: null
            });
            return brandsWithLinks;
          }
        } catch (error) {
          console.error('Error fetching public brands:', error);
          
          // Use mock data as fallback
          console.log('API failed, using mock data as fallback');
          const mockBrands = get().getMockBrands().map(brand => ({
            ...brand,
            link: `/category/smartphones?brand=${encodeURIComponent(brand.name)}`,
            logo: brand.logo_url,
            productCount: brand.product_count
          }));
          
          set({ 
            brands: mockBrands,
            loading: false,
            error: 'API unavailable - using mock data'
          });
          
          return mockBrands;
        }
      },

      // Get brand by slug
      getBrandBySlug: async (slug) => {
        set({ loading: true, error: null });
        try {
          const response = await api.get(`/brands/public/${slug}/`);
          
          if (response.status === 200) {
            set({ loading: false, error: null });
            return response.data.brand;
          }
        } catch (error) {
          console.error('Error fetching brand details:', error);
          
          // Try to find in current brands
          const { brands } = get();
          const brand = brands.find(b => b.slug === slug);
          
          set({ 
            loading: false,
            error: brand ? null : 'Brand not found'
          });
          
          return brand || null;
        }
      },

      // Get featured brands only
      getFeaturedBrands: () => {
        const { brands } = get();
        return brands.filter(brand => brand.featured);
      },

      // Get brands sorted by display order
      getSortedBrands: () => {
        const { brands } = get();
        return [...brands].sort((a, b) => a.display_order - b.display_order);
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Get brand statistics
      getBrandStats: () => {
        const { brands } = get();
        return {
          total: brands.length,
          featured: brands.filter(b => b.featured).length,
          totalProducts: brands.reduce((sum, b) => sum + (b.product_count || 0), 0)
        };
      }
    }),
    {
      name: 'public-brands-store'
    }
  )
);

export default usePublicBrandsStore;
