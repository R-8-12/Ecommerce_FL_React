import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";
import { useAuthStore } from "./useAuth";
import toast from "react-hot-toast";
import { awardCoins } from "../utils/gamificationUtils";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      // Fetch wishlist from server (for authenticated users)
      fetchWishlist: async () => {
        try {
          set({ isLoading: true, error: null });

          // Check if user is authenticated
          const isAuthenticated = useAuthStore.getState().isAuthenticated;

          if (isAuthenticated) {
            const response = await api.get("/users/wishlist/");
            const wishlistItems = response.data.wishlist.map((item) => ({
              id: item.product_id,
              item_id: item.item_id,
              name: item.name,
              price: item.price, // This now comes from variant or product pricing from backend
              image: item.image_url,
              stock: item.stock || 1, // This now comes from variant or product stock
              category: item.category || "Product",
              added_at: item.added_at,
              variant_id: item.variant_id,
              variant: item.variant, // Full variant details
            }));

            set({
              items: wishlistItems,
              isLoading: false,
            });

            return wishlistItems;
          } else {
            // For guests, just return items from localStorage
            set({ isLoading: false });
            return get().items;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.error || "Failed to fetch wishlist",
          });
          return get().items;
        }
      },

      // Add an item to the wishlist
      addItem: async (product) => {
        try {
          set({ isLoading: true, error: null });
          const isAuthenticated = useAuthStore.getState().isAuthenticated;

          // Check if item already exists to prevent redundant API calls
          const { items } = get();
          const existingItem = items.find((item) => item.id === product.id);

          if (existingItem) {
            set({ isLoading: false });
            return true; // Item already in wishlist
          }
          if (isAuthenticated) {
            // Send to server first
            await api.post(`/users/wishlist/add/${product.id}/`, {
              variant_id: product.variant_id || null,
            });
          }

          // Then update local state
          set({
            items: [...items, product],
            isLoading: false,
          });
          
          // Award coins for adding to wishlist (only for authenticated users)
          if (isAuthenticated) {
            awardCoins('wishlist');
          }
          
          toast.success("Item added to wishlist");
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error.response?.data?.error || "Failed to add item to wishlist",
          });
          return false;
        }
      },

      // Remove an item from the wishlist
      removeItem: async (itemId) => {
        try {
          set({ isLoading: true, error: null });
          const isAuthenticated = useAuthStore.getState().isAuthenticated;

          if (isAuthenticated) {
            // Remove from server first using item_id
            const response = await api.delete(
              `/users/wishlist/remove/${itemId}/`
            );

            // Show success message
            if (response.data.message) {
              toast.success(response.data.message);
            }
          }

          // Then update local state
          const { items } = get();
          const removedItem = items.find((item) => item.item_id === itemId);

          set({
            items: items.filter((item) => item.item_id !== itemId),
            isLoading: false,
          });

          // Show success for guest users
          if (!isAuthenticated && removedItem) {
            toast.success(`${removedItem.name} removed from wishlist`);
          }

          return true;
        } catch (error) {
          const errorMessage =
            error.response?.data?.error ||
            "Failed to remove item from wishlist";
          set({
            isLoading: false,
            error: errorMessage,
          });

          // Show error toast
          toast.error(errorMessage);
          return false;
        }
      },

      // Check if an item is in the wishlist
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((item) => item.id === productId);
      },

      // Clear the entire wishlist
      clearWishlist: async () => {
        try {
          set({ isLoading: true, error: null });
          const isAuthenticated = useAuthStore.getState().isAuthenticated;
          if (isAuthenticated) {
            // Clear server wishlist by removing each item using item_id
            const { items } = get();
            const deletePromises = items.map((item) =>
              api.delete(`/users/wishlist/remove/${item.item_id}/`)
            );
            await Promise.all(deletePromises);
          }

          // Clear local state
          set({
            items: [],
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.error || "Failed to clear wishlist",
          });
          return false;
        }
      },

      // Clear any errors
      clearError: () => set({ error: null }),
    }),
    {
      name: "wishlist-storage", // unique name for localStorage
    }
  )
);
