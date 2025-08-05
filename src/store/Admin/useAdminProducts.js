import { create } from "zustand";
import { adminApi } from "../../services/api";

export const useAdminProducts = create((set, get) => ({
  products: {
    list: [],
    filteredList: null, // null indicates no filtering has been applied yet
    loading: false,
    error: null,
  },

  // Fetch all products and initialize filtered list
  fetchProducts: async () => {
    const { products } = get();
    if (products.list && products.list.length > 0) {
      return;
    }
    set((state) => ({
      products: {
        ...state.products,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await adminApi.get("/admin/get_all_products");
      const products = response.data.products;
      console.log(products)
      set({
        products: {
          list: products,
          filteredList: null, // Reset to null so all products are shown initially
          loading: false,
          error: null,
        },
      });
    } catch (error) {
      set((state) => ({
        products: {
          ...state.products,
          loading: false,
          error: error.response?.data?.error || "Failed to fetch products",
        },
      }));
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    set((state) => ({
      products: {
        ...state.products,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await adminApi.delete(
        `/admin/delete-product/${productId}/`
      );

      if (response.status === 200) {
        // Remove the product from both lists on success
        set((state) => ({
          products: {
            ...state.products,
            list: state.products.list.filter(
              (product) => product.id !== productId
            ),
            filteredList: state.products.filteredList
              ? state.products.filteredList.filter(
                  (product) => product.id !== productId
                )
              : null,
            loading: false,
            error: null,
          },
        }));
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      set((state) => ({
        products: {
          ...state.products,
          loading: false,
          error: error.response?.data?.error || "Failed to delete product",
        },
      }));
      return {
        success: false,
        message: error.response?.data?.error || "Failed to delete product",
      };
    }
  },

  // Toggle featured status of a product
  toggleProductFeatured: async (productId) => {
    set((state) => ({
      products: {
        ...state.products,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await adminApi.patch(
        `/admin/toggle-featured/${productId}/`
      );

      if (response.status === 200) {
        // Update the product in both lists
        const updateProduct = (list) =>
          list.map((product) =>
            product.id === productId
              ? { ...product, featured: response.data.featured }
              : product
          );
        set((state) => ({
          products: {
            ...state.products,
            list: updateProduct(state.products.list),
            filteredList: state.products.filteredList
              ? updateProduct(state.products.filteredList)
              : null,
            loading: false,
            error: null,
          },
        }));
        return {
          success: true,
          message: response.data.message,
          featured: response.data.featured,
        };
      }
    } catch (error) {
      set((state) => ({
        products: {
          ...state.products,
          loading: false,
          error:
            error.response?.data?.error || "Failed to update featured status",
        },
      }));
      return {
        success: false,
        message:
          error.response?.data?.error || "Failed to update featured status",
      };
    }
  },

  // Update a product
  updateProduct: async (productId, productData) => {
    set((state) => ({
      products: {
        ...state.products,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await adminApi.patch(
        `/admin/products/edit/${productId}/`,
        productData
      );
      if (response.status === 200) {
        // Update the product in both lists
        const updateProduct = (list) =>
          list.map((product) =>
            product.id === productId ? { ...product, ...productData } : product
          );

        set((state) => ({
          products: {
            ...state.products,
            list: updateProduct(state.products.list),
            filteredList: state.products.filteredList
              ? updateProduct(state.products.filteredList)
              : null,
            loading: false,
            error: null,
          },
        }));
        set((state) => ({
          products: {
            ...state.products,
            list: updateProduct(state.products.list),
            filteredList: state.products.filteredList
              ? updateProduct(state.products.filteredList)
              : null,
            loading: false,
            error: null,
          },
        }));
        return {
          success: true,
          message: response.data.message || "Product updated successfully",
          product_id: response.data.product_id || productId,
        };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update product";

      set((state) => ({
        products: {
          ...state.products,
          loading: false,
          error: errorMessage,
        },
      }));

      return {
        success: false,
        message: errorMessage,
        status: error.response?.status,
      };
    }
  },

  // Add a new product
  addProduct: async (productData) => {
    set((state) => ({
      products: {
        ...state.products,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await adminApi.post("admin/products/add/", productData);

      if (response.status === 201) {
        // Create a new product object with the returned ID and the submitted data
        const newProduct = {
          ...productData,
          id: response.data.product_id,
        }; // Add the new product to both lists
        set((state) => ({
          products: {
            ...state.products,
            list: [...state.products.list, newProduct],
            filteredList: state.products.filteredList
              ? [...state.products.filteredList, newProduct]
              : null,
            loading: false,
            error: null,
          },
        }));
        return {
          success: true,
          message: response.data.message || "Product added successfully",
          product_id: response.data.product_id,
        };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to add product";

      set((state) => ({
        products: {
          ...state.products,
          loading: false,
          error: errorMessage,
        },
      }));

      return {
        success: false,
        message: errorMessage,
        status: error.response?.status,
      };
    }
  }, // Filter and sort products
  filterAndSortProducts: (category, searchQuery, sortOption) => {
    const { list } = get().products;

    // Check if any filtering is applied
    const hasFilters =
      (category && category !== "all") || (searchQuery && searchQuery.trim());

    // If no filters are applied and sorting is "newest" (default), reset to show all products
    if (!hasFilters && sortOption === "newest") {
      set((state) => ({
        products: {
          ...state.products,
          filteredList: null, // Show all products in their original order
        },
      }));
      return;
    }

    let filteredProducts = [...list];

    // Apply category filter
    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        filteredProducts.sort(
          (a, b) =>
            new Date(b.createdAt || b.created_at || 0) -
            new Date(a.createdAt || a.created_at || 0)
        );
        break;
      case "price-asc":
        filteredProducts.sort(
          (a, b) => parseFloat(a.price) - parseFloat(b.price)
        );
        break;
      case "price-desc":
        filteredProducts.sort(
          (a, b) => parseFloat(b.price) - parseFloat(a.price)
        );
        break;
      case "name-asc":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "stock-asc":
        filteredProducts.sort((a, b) => parseInt(a.stock) - parseInt(b.stock));
        break;
      default:
        break;
    }

    // Update the filtered list in the store
    set((state) => ({
      products: {
        ...state.products,
        filteredList: filteredProducts,
      },
    }));
  },
  // Reset filters to show all products
  resetFilters: () => {
    set((state) => ({
      products: {
        ...state.products,
        filteredList: null,
      },
    }));
  },

  // Upload product image
  uploadProductImage: async (imageFile) => {
    try {
      // Check if admin is authenticated
      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) {
        return {
          success: false,
          message: "Admin authentication required. Please log in as admin first.",
        };
      }

      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await adminApi.post(
        "/admin/products/upload-image/",
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
      let errorMessage = "Failed to upload image";
      
      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in as admin and try again.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || "Invalid image file or request.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Update variant stock for a product
  updateVariantStock: async (productId, variantUpdates) => {
    set((state) => ({
      products: {
        ...state.products,
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await adminApi.patch(
        `/admin/products/${productId}/update-variant-stock/`,
        { variant_updates: variantUpdates }
      );

      if (response.status === 200) {
        // Refresh products to get updated data
        await get().fetchProducts();

        return {
          success: true,
          message:
            response.data.message || "Variant stock updated successfully",
          updatedVariants: response.data.updated_variants,
        };
      }
    } catch (error) {
      set((state) => ({
        products: {
          ...state.products,
          loading: false,
          error:
            error.response?.data?.error || "Failed to update variant stock",
        },
      }));
      return {
        success: false,
        message:
          error.response?.data?.error || "Failed to update variant stock",
      };
    }
  },
}));

export default useAdminProducts;
