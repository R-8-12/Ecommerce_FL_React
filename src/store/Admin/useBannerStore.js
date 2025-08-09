import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { adminApi } from "../../services/api";
import useFrontendCacheStore from "../useFrontendCacheStore";

// Banner store
export const useBannerStore = create(
  devtools((set, get) => ({
    // State
    banners: [],
    loading: false,
    error: null,

    // Actions
    setBanners: (banners) => set({ banners }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Fetch all banners (admin only)
    fetchBanners: async () => {
      set({ loading: true, error: null });
      try {
        const response = await adminApi.get("/admin/banners/");

        if (response.status === 200) {
          const fresh = response.data.banners || [];
          set({ banners: fresh, loading: false });
          // Sync public cache so homepage reflects updates immediately
          try {
            useFrontendCacheStore.getState().updateBanners(fresh);
          } catch (e) {
            console.warn('Failed to sync frontend banner cache after fetchBanners:', e?.message || e);
          }
          return response.data.banners;
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        set({
          error: error.response?.data?.error || "Failed to fetch banners",
          loading: false,
        });
        throw error;
      }
    },

    // Fetch public banners (no auth required)
    fetchPublicBanners: async () => {
      const currentState = get();
      // Prevent duplicate fetches
      if (currentState.loading || currentState.banners.length > 0) {
        return currentState.banners;
      }
      
      set({ loading: true, error: null });
      try {
        const response = await adminApi.get("/admin/banners/public/");
        if (response.status === 200) {
          set({ banners: response.data.banners || [], loading: false });
          return response.data.banners;
        }
      } catch (error) {
        console.error("Error fetching public banners:", error);
        set({
          error:
            error.response?.data?.error || "Failed to fetch public banners",
          loading: false,
        });
        throw error;
      }
    }, // Add new banner
  addBanner: async (bannerData) => {
      set({ loading: true, error: null });
      try {
        const response = await adminApi.post(
          "/admin/banners/add/",
          bannerData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 201) {
          // Refresh the banner list and sync frontend cache
          const updated = await get().fetchBanners();
          try {
            useFrontendCacheStore.getState().updateBanners(updated || []);
          } catch (e) {
            console.warn('Failed to sync frontend banner cache after addBanner:', e?.message || e);
          }

          set({ loading: false });
          return response.data;
        }
      } catch (error) {
        console.error("Error adding banner:", error);
        set({
          error: error.response?.data?.error || "Failed to add banner",
          loading: false,
        });
        throw error;
      }
    }, // Edit banner
  editBanner: async (bannerId, bannerData) => {
      set({ loading: true, error: null });
      try {
        const isFormData = bannerData instanceof FormData;
        let headers = {};

        // Set content-type header if data is FormData
        if (isFormData) {
          headers = { "Content-Type": "multipart/form-data" };
        }

        const response = await adminApi.patch(
          `/admin/banners/edit/${bannerId}/`,
          bannerData,
          { headers }
        );

        if (response.status === 200) {
          // Refresh banner list to get updated data including new image URL and sync cache
          const updated = await get().fetchBanners();
          try {
            useFrontendCacheStore.getState().updateBanners(updated || []);
          } catch (e) {
            console.warn('Failed to sync frontend banner cache after editBanner:', e?.message || e);
          }
          set({ loading: false });
          return response.data;
        }
      } catch (error) {
        console.error("Error editing banner:", error);
        set({
          error: error.response?.data?.error || "Failed to edit banner",
          loading: false,
        });
        throw error;
      }
    },

    // Delete banner
  deleteBanner: async (bannerId) => {
      set({ loading: true, error: null });
      try {
        const response = await adminApi.delete(
          `/admin/banners/delete/${bannerId}/`
        );

        if (response.status === 200) {
          // Remove from local state
          const { banners } = get();
          const updatedBanners = banners.filter(
            (banner) => banner.id !== bannerId
          );
          set({ banners: updatedBanners, loading: false });
          try {
            useFrontendCacheStore.getState().updateBanners(updatedBanners);
          } catch (e) {
            console.warn('Failed to sync frontend banner cache after deleteBanner:', e?.message || e);
          }

          return response.data;
        }
      } catch (error) {
        console.error("Error deleting banner:", error);
        set({
          error: error.response?.data?.error || "Failed to delete banner",
          loading: false,
        });
        throw error;
      }
    },

    // Toggle banner active status
  toggleBannerActive: async (bannerId) => {
      set({ loading: true, error: null });
      try {
        const response = await adminApi.patch(
          `/admin/banners/toggle/${bannerId}/`
        );

        if (response.status === 200) {
          // Update local state
          const { banners } = get();
          const updatedBanners = banners.map((banner) =>
            banner.id === bannerId
              ? { ...banner, active: response.data.active }
              : banner
          );
          set({ banners: updatedBanners, loading: false });
          try {
            useFrontendCacheStore.getState().updateBanners(updatedBanners);
          } catch (e) {
            console.warn('Failed to sync frontend banner cache after toggleBannerActive:', e?.message || e);
          }

          return response.data;
        }
      } catch (error) {
        console.error("Error toggling banner:", error);
        set({
          error: error.response?.data?.error || "Failed to toggle banner",
          loading: false,
        });
        throw error;
      }
    },

    // Get banners by position
    getBannersByPosition: (position) => {
      const { banners } = get();
      return banners.filter(
        (banner) => banner.position === position && banner.active
      );
    }, // Get hero banners
    getHeroBanners: () => {
      const { banners } = get();
      return banners
        .filter((banner) => banner.position === "hero" && banner.active)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    },

    // Get carousel banners
    getCarouselBanners: () => {
      const { banners } = get();
      let carouselBanners = banners
        .filter(
          (banner) =>
            ["home-middle", "home-bottom", "carousel"].includes(
              banner.position
            ) && banner.active
        )
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      return carouselBanners;
    },

    // Get dropdown banners by category
    getDropdownBanners: (categoryName) => {
      const { banners } = get();
      return banners
        .filter(
          (banner) => 
            banner.position === "dropdown" && 
            banner.active && 
            banner.category === categoryName
        )
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .slice(0, 2); // Limit to 2 banners per dropdown
    },

    // Clear error
    clearError: () => set({ error: null }),
  }))
);

export default useBannerStore;
