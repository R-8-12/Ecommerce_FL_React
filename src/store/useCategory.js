import { create } from "zustand";
import { adminApi } from "../services/api";

const useCategory = create((set, get) => ({
  categories: {
    list: [],
    loading: false,
    error: null,
  },

  // Fetch all categories
  fetchCategories: async () => {
    // Only fetch if categories.list is empty
    if (get().categories.list.length > 0) {
      console.log("Using cached categories data");
      set((state) => ({
        categories: {
          ...state.categories,
          loading: false,
          error: null,
        },
      }));
      return { success: true, categories: get().categories.list };
    }

    set((state) => ({
      categories: {
        ...state.categories,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await adminApi.get("/admin/categories/");
      const categories = response.data.categories || [];

      set({
        categories: {
          list: Array.isArray(categories) ? categories : [],
          loading: false,
          error: null,
        },
      });
      return { success: true, categories };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to fetch categories";
      set((state) => ({
        categories: {
          ...state.categories,
          list: [], // Ensure list is always an array
          loading: false,
          error: errorMessage,
        },
      }));
      return { success: false, error: errorMessage };
    }
  },

  // Add a new category
  addCategory: async (categoryData) => {
    set((state) => ({
      categories: {
        ...state.categories,
        loading: true,
        error: null,
      },
    }));

    try {
      // Ensure order is included in the request
      const dataToSend = {
        ...categoryData,
        order: categoryData.order || 0,
      };

      const response = await adminApi.post(
        "/admin/categories/add/",
        dataToSend
      );

      if (response.data.category) {
        set((state) => ({
          categories: {
            ...state.categories,
            list: [...state.categories.list, response.data.category],
            loading: false,
            error: null,
          },
        }));
        return {
          success: true,
          message: response.data.message || "Category added successfully",
          category: response.data.category,
        };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to add category";
      set((state) => ({
        categories: {
          ...state.categories,
          loading: false,
          error: errorMessage,
        },
      }));
      return { success: false, error: errorMessage };
    }
  },

    // Edit a category
    editCategory: async (categoryId, categoryData) => {
      set((state) => ({
        categories: {
          ...state.categories,
          loading: true,
          error: null,
        },
      }));

      try {
        // Ensure order is included in the request
        const dataToSend = {
          ...categoryData,
          order: categoryData.order !== undefined ? categoryData.order : 0,
        };

        const response = await adminApi.put(
          `/admin/categories/edit/${categoryId}/`,
          dataToSend
        );

        if (response.data.category) {
          // Update the category in the list
          set((state) => ({
            categories: {
              ...state.categories,
              list: state.categories.list.map((category) =>
                category.id === categoryId ? response.data.category : category
              ),
              loading: false,
              error: null,
            },
          }));
          return {
            success: true,
            message: response.data.message || "Category updated successfully",
            category: response.data.category,
          };
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || "Failed to update category";
        set((state) => ({
          categories: {
            ...state.categories,
            loading: false,
            error: errorMessage,
          },
        }));
        return { success: false, error: errorMessage };
      }
    },

      // Upload category image
      uploadCategoryImage: async (imageFile) => {
        try {
          const formData = new FormData();
          formData.append("image", imageFile);

          const response = await adminApi.post(
            "/admin/categories/upload-image/",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.data.success) {
            return {
              success: true,
              imageUrl: response.data.image_url,
              message: response.data.message || "Image uploaded successfully",
            };
          } else {
            return {
              success: false,
              message: response.data.error || "Failed to upload image",
            };
          }
        } catch (error) {
          return {
            success: false,
            message:
              error.response?.data?.error ||
              error.message ||
              "Failed to upload image",
          };
        }
      },
}));

export default useCategory;
