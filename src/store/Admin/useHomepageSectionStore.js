import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api, { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

const useHomepageSectionStore = create(
  devtools(
    (set, get) => ({
      // State
      sections: [],
      loading: false,
      error: null,
      selectedSection: null,

      // Available section types and templates
      sectionTypes: [
        'hero_banner',
        'category_list',
        'featured_products',
        'banner_carousel',
        'best_selling',
        'new_releases',
        'static_promo_banners',
        'newsletter',
        'testimonials'
      ],

      designTemplates: {
        category_list: ['grid', 'carousel', 'list', 'cards'],
        featured_products: ['grid', 'carousel', 'list'],
        banner_carousel: ['auto', 'manual', 'fade', 'slide'],
        hero_banner: ['single', 'slideshow', 'video'],
        best_selling: ['grid', 'carousel', 'compact'],
        new_releases: ['grid', 'carousel', 'featured'],
        static_promo_banners: ['horizontal', 'vertical', 'mixed'],
        newsletter: ['minimal', 'detailed', 'popup'],
        testimonials: ['carousel', 'grid', 'masonry']
      },

      // Mock data for fallback when API fails
      getMockSections: () => [
        {
          section_id: 'mock-hero',
          section_type: 'hero_banner',
          title: 'Hero Banner',
          enabled: true,
          display_order: 1,
          design_template: 'slideshow',
          config: {}
        },
        {
          section_id: 'mock-categories',
          section_type: 'category_list',
          title: 'Shop by Category',
          enabled: true,
          display_order: 2,
          design_template: 'grid',
          config: {}
        },
        {
          section_id: 'mock-featured',
          section_type: 'featured_products',
          title: 'Featured Products',
          enabled: true,
          display_order: 3,
          design_template: 'grid',
          config: {}
        },
        {
          section_id: 'mock-best-selling',
          section_type: 'best_selling',
          title: 'Best Selling Products',
          enabled: true,
          display_order: 4,
          design_template: 'grid',
          config: {
            description: 'Discover our most popular products loved by customers'
          }
        },
        {
          section_id: 'mock-new-releases',
          section_type: 'new_releases',
          title: 'New Releases',
          enabled: true,
          display_order: 5,
          design_template: 'grid',
          config: {
            description: 'Check out the latest additions to our product lineup'
          }
        }
      ],

      // Actions
      fetchSections: async (enabledOnly = false, usePublicEndpoint = false) => {
        set({ loading: true, error: null });
        try {
          if (get().sections.length > 0) {
            console.log('Using cached sections data');
            set({ loading: false });
            return get().sections;
          }
          let response;
          if (usePublicEndpoint) {
            // Use public endpoint for homepage display
            console.log('Fetching homepage sections from public endpoint...');
            response = await api.get('/admin/homepage/sections/public/');
          } else {
            // Use admin endpoint for management
            console.log('Fetching homepage sections from admin endpoint...');
            response = await adminApi.get(`/admin/homepage/sections/?enabled_only=${enabledOnly}`);
          }
          
          console.log('Homepage sections response:', response.data);
          
          if (response.status === 200) {
            const sections = (response.data.sections || []).filter(Boolean); // Filter out null/undefined values
            console.log(`Successfully loaded ${sections.length} homepage sections`);
            set({ 
              sections: sections,
              loading: false 
            });
            return sections;
          }
        } catch (error) {
          console.error('Error fetching homepage sections:', error);
          console.error('Error response:', error.response?.data);
          
          // Always use mock data as fallback for admin interface
          console.log('API failed, using mock data as fallback');
          const mockSections = get().getMockSections();
          set({ 
            sections: mockSections,
            loading: false,
            error: usePublicEndpoint ? null : 'API unavailable - using mock data' // Only show error in admin
          });
          
          if (!usePublicEndpoint) {
            toast.error('Could not connect to server - using demo data');
          }
          
          return mockSections;
        }
      },

      // Add new section
      addSection: async (sectionData) => {
        set({ loading: true, error: null });
        try {
          const response = await adminApi.post('/admin/homepage/sections/add/', sectionData);
          
          if (response.status === 201) {
            const newSection = response.data.section;
            const { sections } = get();
            set({ 
              sections: [...sections, newSection],
              loading: false 
            });
            toast.success('Homepage section created successfully');
            return newSection;
          }
        } catch (error) {
          console.error('Error creating homepage section:', error);
          
          // Fallback: Create mock section locally
          const { sections } = get();
          const mockSection = {
            section_id: `mock-${Date.now()}`,
            ...sectionData,
            display_order: sections.length + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          set({ 
            sections: [...sections, mockSection],
            loading: false,
            error: 'Created locally - changes not saved to server'
          });
          
          toast.success('Section created locally (demo mode)');
          return mockSection;
        }
      },

      // Edit section
      editSection: async (sectionId, sectionData) => {
        set({ loading: true, error: null });
        try {
          const response = await adminApi.put(`/admin/homepage/sections/${sectionId}/edit/`, sectionData);
          
          if (response.status === 200) {
            const updatedSection = response.data.section;
            const { sections } = get();
            const updatedSections = sections.map(section => 
              section && section.section_id === sectionId ? updatedSection : section
            ).filter(Boolean); // Remove any null/undefined sections
            set({ 
              sections: updatedSections,
              loading: false 
            });
            toast.success('Homepage section updated successfully');
            return updatedSection;
          }
        } catch (error) {
          console.error('Error updating homepage section:', error);
          
          // Fallback: Update mock section locally
          const { sections } = get();
          const updatedSections = sections.map(section => 
            section && section.section_id === sectionId 
              ? { ...section, ...sectionData, updated_at: new Date().toISOString() }
              : section
          ).filter(Boolean); // Remove any null/undefined sections
          
          set({ 
            sections: updatedSections,
            loading: false,
            error: 'Updated locally - changes not saved to server'
          });
          
          toast.success('Section updated locally (demo mode)');
          return updatedSections.find(s => s.section_id === sectionId);
        }
      },

      // Delete section
      deleteSection: async (sectionId) => {
        set({ loading: true, error: null });
        try {
          const response = await adminApi.delete(`/admin/homepage/sections/${sectionId}/delete/`);
          
          if (response.status === 200) {
            const { sections } = get();
            const updatedSections = sections.filter(section => section.section_id !== sectionId);
            set({ 
              sections: updatedSections,
              loading: false 
            });
            toast.success('Homepage section deleted successfully');
            return true;
          }
        } catch (error) {
          console.error('Error deleting homepage section:', error);
          
          // Fallback: Delete mock section locally
          const { sections } = get();
          const updatedSections = sections.filter(section => section.section_id !== sectionId);
          
          set({ 
            sections: updatedSections,
            loading: false,
            error: 'Deleted locally - changes not saved to server'
          });
          
          toast.success('Section deleted locally (demo mode)');
          return true;
        }
      },

      // Toggle section enabled status
      toggleSection: async (sectionId) => {
        set({ loading: true, error: null });
        try {
          // First validate the section exists
          const { sections } = get();
          const existingSection = sections.find(s => s && s.section_id === sectionId);
          
          if (!existingSection) {
            console.error('Available sections:', sections);
            throw new Error(`Section with ID ${sectionId} not found`);
          }

          // Ensure enabled property exists and has a default value
          if (typeof existingSection.enabled === 'undefined') {
            existingSection.enabled = true; // Default to enabled
            console.warn(`Section ${sectionId} had undefined enabled property, defaulting to true`);
          }

          const response = await adminApi.post(`/admin/homepage/sections/${sectionId}/toggle/`);
          
          if (response.status === 200) {
            const updatedSection = response.data.section;
            const updatedSections = sections.map(section => 
              section && section.section_id === sectionId ? updatedSection : section
            ).filter(Boolean); // Remove any null/undefined sections
            set({ 
              sections: updatedSections,
              loading: false 
            });
            toast.success(`Section ${updatedSection.enabled ? 'enabled' : 'disabled'} successfully`);
            return updatedSection;
          }
        } catch (error) {
          console.error('Error toggling homepage section:', error);
          
          // Fallback: Toggle mock section locally with validation
          const { sections } = get();
          const existingSection = sections.find(s => s && s.section_id === sectionId);
          
          if (!existingSection) {
            set({ 
              loading: false,
              error: `Section with ID ${sectionId} not found`
            });
            toast.error(`Section not found: ${sectionId}`);
            throw error;
          }

          // Ensure enabled property exists
          if (typeof existingSection.enabled === 'undefined') {
            existingSection.enabled = true;
          }

          // Ensure enabled property exists
          const currentEnabled = existingSection.enabled || false;
          
          const fallbackUpdatedSections = sections.map(section => 
            section && section.section_id === sectionId 
              ? { ...section, enabled: !currentEnabled, updated_at: new Date().toISOString() }
              : section
          ).filter(Boolean); // Remove any null/undefined sections
          
          set({ 
            sections: fallbackUpdatedSections,
            loading: false,
            error: 'Toggled locally - changes not saved to server'
          });
          
          const toggledSection = fallbackUpdatedSections.find(s => s.section_id === sectionId);
          toast.success(`Section ${toggledSection.enabled ? 'enabled' : 'disabled'} locally (demo mode)`);
          return toggledSection;
        }
      },

      // Reorder sections
      reorderSections: async (sectionOrders) => {
        set({ loading: true, error: null });
        try {
          const response = await adminApi.post('/admin/homepage/sections/reorder/', {
            section_orders: sectionOrders
          });
          
          if (response.status === 200) {
            // Fetch updated sections to ensure correct order
            await get().fetchSections();
            toast.success('Sections reordered successfully');
            return true;
          }
        } catch (error) {
          console.error('Error reordering homepage sections:', error);
          const errorMessage = error.response?.data?.error || 'Failed to reorder homepage sections';
          set({ 
            error: errorMessage
          });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Get available templates for a section type
      getSectionTemplates: async (sectionType) => {
        try {
          const response = await adminApi.get(`/admin/homepage/templates/${sectionType}/`);
          
          if (response.status === 200) {
            return response.data.templates;
          }
        } catch (error) {
          console.error('Error fetching section templates:', error);
          // Use fallback templates from designTemplates
          const fallbackTemplates = get().designTemplates[sectionType] || ['default'];
          console.log(`Using fallback templates for ${sectionType}:`, fallbackTemplates);
          return fallbackTemplates;
        }
      },

      // Initialize default sections
      initializeDefaultSections: async () => {
        set({ loading: true, error: null });
        try {
          const response = await adminApi.post('/admin/homepage/h15/initialize/');
          
          if (response.status === 201) {
            set({ 
              sections: response.data.sections || [],
              loading: false 
            });
            toast.success('Default homepage sections initialized successfully');
            return response.data.sections;
          } else if (response.status === 200) {
            // Sections already exist
            toast.info('Homepage sections already exist');
            await get().fetchSections();
            return get().sections;
          }
        } catch (error) {
          console.error('Error initializing default sections:', error);
          set({ 
            loading: false,
            error: error.response?.data?.error || error.message 
          });
          
          // Handle authentication errors specifically
          if (error.response?.status === 401 || error.response?.status === 403) {
            toast.error('Authentication required. Please login as admin first.');
            return false;
          }
          
          // Fallback: Create mock sections for development
          console.log('API failed, creating mock sections for development...');
          const mockSections = get().getMockSections();
          set({ 
            sections: mockSections,
            loading: false,
            error: 'Using mock data - API authentication failed'
          });
          toast.warning('Using mock data - Please ensure backend is running and you are logged in as admin');
          return mockSections;
        }
      },

      // MISSING METHOD - Add alias for initializeSections
      initializeSections: async () => {
        return get().initializeDefaultSections();
      },

      // Get section type display name
      getSectionTypeDisplayName: (sectionType) => {
        const displayNames = {
          hero_banner: 'Hero Banner',
          category_list: 'Category List',
          featured_products: 'Featured Products',
          banner_carousel: 'Banner Carousel',
          best_selling: 'Best Selling',
          new_releases: 'New Releases',
          static_promo_banners: 'Promotional Banners',
          newsletter: 'Newsletter',
          testimonials: 'Testimonials'
        };
        return displayNames[sectionType] || sectionType;
      },

      // Set selected section
      setSelectedSection: (section) => {
        set({ selectedSection: section });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Get sections sorted by order
      getSortedSections: () => {
        const { sections } = get();
        return [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
      },

      // Get enabled sections only
      getEnabledSections: () => {
        const { sections } = get();
        return sections.filter(section => section.enabled);
      },

      // Get sections by type
      getSectionsByType: (sectionType) => {
        const { sections } = get();
        return sections.filter(section => section.section_type === sectionType);
      },

      // Update section order locally (for drag and drop)
      updateSectionOrderLocally: (sectionId, newOrder) => {
        const { sections } = get();
        const updatedSections = sections.map(section => 
          section && section.section_id === sectionId 
            ? { ...section, order: newOrder }
            : section
        ).filter(Boolean); // Remove any null/undefined sections
        set({ sections: updatedSections });
      }
    }),
    {
      name: 'homepage-section-store'
    }
  )
);

export default useHomepageSectionStore;

// Also export as named export for compatibility
export { useHomepageSectionStore };
