import { create } from "zustand";
import { API_URL } from "../utils/constants";
import api from "../services/api";
import { reviewService } from "../services/reviewService";

export const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  brands: [],
  featuredProducts: [],
  currentProduct: null,
  loading: false,
  error: null,
  reviewLoading: false,
  reviewError: null,

  // Fetch all products
  fetchProducts: async () => {
    const currentState = get();
    // Prevent duplicate fetches
    if (currentState.loading || currentState.products.length > 0) {
      return currentState.products;
    }
    
    set({ loading: true });

    try {
      const response = await api.get(`${API_URL}/products/products/`);
      //console.log(response.data.products[0]);

      // Extract unique categories and brands
      const categories = Array.from(
        new Set(response.data.products.map((p) => p.category))
      );
      const brands = Array.from(
        new Set(response.data.products.map((p) => p.brand))
      ); // Select featured products - prioritize products marked as featured, then by rating
      const featuredProducts = response.data.products
        .filter((p) => p.featured === true || p.rating >= 4.5)
        .sort((a, b) => {
          // Featured products first
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          // Then by rating
          return (b.rating || 0) - (a.rating || 0);
        })
        .slice(0, 8); // Show up to 8 featured products

      set({
        products: response.data.products,
        categories,
        brands,
        featuredProducts,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      set({
        error: "Failed to fetch products. Please try again later.",
        loading: false,
      });
    }
  },

  // Fetch product categories
  fetchCategories: async () => {
    set({ loading: true });
    try {
      const response = await api.get(`${API_URL}/products/categories`);
      set({ categories: response.data.categories, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  // Get a single product by ID
  getProduct: (id) => {
    const { products } = get();
    return products.find((product) => product.id === parseInt(id, 10));
  },

  // Fetch single product from API
  fetchProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(
        `${API_URL}/products/products/${productId}/`
      );
      set({
        currentProduct: response.data.product,
        loading: false,
      });
      return response.data.product;
    } catch (error) {
      console.error("Error fetching product:", error);
      set({
        error: "Failed to fetch product. Please try again later.",
        loading: false,
      });
      return null;
    }
  },

  // Clear current product
  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },

  // Get products by category
  getProductsByCategory: (category) => {
    const { products } = get();
    return products.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  },

  // Get products by brand
  getProductsByBrand: (brand) => {
    const { products } = get();
    return products.filter(
      (product) => product.brand.toLowerCase() === brand.toLowerCase()
    );
  },
  // Search products
  searchProducts: (query) => {
    const { products } = get();

    if (!query || query.trim() === "") {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const searchTerms = searchTerm.split(/\s+/); // Split into individual words

    // Score each product based on how well it matches the search terms
    const scoredProducts = products.map((product) => {
      let score = 0;

      // Name match (highest weight)
      if (product.name.toLowerCase().includes(searchTerm)) {
        score += 100; // Direct match in name
      }

      // Check individual words in name
      searchTerms.forEach((term) => {
        if (product.name.toLowerCase().includes(term)) {
          score += 50; // Word match in name
        }
      });

      // Brand match
      if (product.brand?.toLowerCase().includes(searchTerm)) {
        score += 40; // Direct match in brand
      }

      // Category match
      if (product.category?.toLowerCase().includes(searchTerm)) {
        score += 30; // Direct match in category
      }

      // Description match
      if (product.description?.toLowerCase().includes(searchTerm)) {
        score += 20; // Direct match in description
      }

      // Individual word matches in description
      searchTerms.forEach((term) => {
        if (product.description?.toLowerCase().includes(term)) {
          score += 10; // Word match in description
        }
      });

      return { product, score };
    });

    // Filter products with score > 0 and sort by score
    return scoredProducts
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);
  },

  // Add review for a product
  addReview: async (productId, reviewData) => {
    set({ reviewLoading: true, reviewError: null });

    try {
      const response = await api.post(
        `/users/add-review/${productId}/`,
        reviewData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // If the review was for the currently loaded product, refresh its data
      // to include the new review and updated rating/review count.
      const store = get();
      // Assuming currentProduct.id is a number (e.g., from API via getProduct which uses parseInt).
      // Ensure productId is compared as a number.
      if (
        store.currentProduct &&
        store.currentProduct.id === Number(productId)
      ) {
        await store.fetchProduct(productId); // This will refresh currentProduct with latest data, including reviews.
      }
      // The previous direct update to currentProduct's rating and reviews_count is removed,
      // as fetchProduct(productId) will provide the comprehensive fresh state.

      set({ reviewLoading: false });
      return {
        success: true,
        data: response.data,
        message: response.data.message || "Review added successfully",
      };
    } catch (error) {
      console.error("Error adding review:", error);

      let errorMessage = "Failed to add review. Please try again later.";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid review data. Please check your input.";
      } else if (error.response?.status === 404) {
        errorMessage = "Product not found.";
      } else if (error.response?.status === 401) {
        errorMessage = "Please log in to add a review.";
      }

      set({
        reviewError: errorMessage,
        reviewLoading: false,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
  // Clear review error
  clearReviewError: () => {
    set({ reviewError: null });
  },

  // Check if user has already reviewed a product
  checkExistingReview: async (productId) => {
    try {
      const response = await api.get(
        `/users/product/${productId}/check_review/`
      );
      return {
        success: true,
        has_reviewed: response.data.has_reviewed || false,
      };
    } catch (error) {
      console.error("Error checking existing review:", error);
      return {
        success: false,
        has_reviewed: false,
        error: error.response?.data?.error || "Failed to check existing review",
      };
    }
  },

  // Mark review as helpful
  markReviewHelpful: async (productId, reviewId) => {
    try {
      const result = await reviewService.markReviewHelpful(productId, reviewId);

      if (result.success) {
        // Update the current product's reviews if it matches
        const { currentProduct } = get();
        if (currentProduct && currentProduct.id === productId) {
          const updatedReviews = currentProduct.reviewsData.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  helpful_count: result.data.helpful_count,
                  is_marked_helpful: result.data.is_marked_helpful,
                }
              : review
          );

          set({
            currentProduct: {
              ...currentProduct,
              reviewsData: updatedReviews,
            },
          });
        }

        return result;
      }

      return result;
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      return {
        success: false,
        error: "Failed to mark review as helpful",
      };
    }
  },

  // Report review
  reportReview: async (productId, reviewId) => {
    try {
      const result = await reviewService.reportReview(productId, reviewId);
      return result;
    } catch (error) {
      console.error("Error reporting review:", error);
      return {
        success: false,
        error: "Failed to report review",
      };
    }
  },

  // Fetch featured products specifically
  fetchFeaturedProducts: async () => {
    set({ loading: true });

    try {
      const response = await api.get(`${API_URL}/products/products/`);

      // Get featured products - first those marked as featured, then high-rated ones
      const featuredProducts = response.data.products
        .filter((p) => p.featured === true || p.rating >= 4.5)
        .sort((a, b) => {
          // Featured products first
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          // Then by rating
          return (b.rating || 0) - (a.rating || 0);
        })
        .slice(0, 8); // Show up to 8 featured products

      set({
        featuredProducts,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching featured products:", error);
      set({
        error: "Failed to fetch featured products. Please try again later.",
        loading: false,
      });
    }
  },
}));
