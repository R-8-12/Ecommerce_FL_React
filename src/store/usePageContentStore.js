import { create } from "zustand";
// import api from "../services/api"; // Removed unused import
import { adminApi } from "../services/api";

export const usePageContentStore = create((set, get) => ({
  // State
  content: null,
  loading: false,
  error: null,
  pages: [], // Store list of available custom pages

  // Fetch all available custom pages
  fetchAvailablePages: async () => {
    const currentState = get();
    // Prevent duplicate fetches
    if (currentState.pages.length > 0) {
      return currentState.pages;
    }
    
    try {
      // Use the public endpoint instead of admin endpoint
      const response = await adminApi.get("/admin/content/pages/");
      if (response.status === 200) {
        set({ pages: response.data.pages || [] });
        return response.data.pages;
      }
    } catch (error) {
      console.error("Error fetching available pages:", error);
      return [];
    }
  },

  // Fetch page content from the API
  fetchPageContent: async (pagePath) => {
    set({ loading: true, error: null, content: null });
    try {
      // Use the public endpoint to get page content
      const response = await adminApi.get(
        `/admin/content/pages/${pagePath.replace(/^\//, "")}/`
      );

      if (response.status === 200) {
        set({
          content: response.data.content,
          loading: false,
        });
        return response.data.content;
      }
    } catch (error) {
      console.error("Error fetching page content:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch page content",
        loading: false,
      });
    }
  },

  // Check if a page exists
  checkPageExists: async (pagePath) => {
    try {
      const response = await adminApi.head(
        `/admin/content/pages/${pagePath.replace(/^\//, "")}/`
      );
      return response.status === 200;
    } catch {
      return false;
    }
  },

  // Clear content when component unmounts
  clearContent: () => {
    set({ content: null, loading: false, error: null });
  },
}));

export default usePageContentStore;
