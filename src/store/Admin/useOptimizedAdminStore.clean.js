/**
 * OPTIMIZED ADMIN STORE - UNIFIED STORE WRAPPER
 * 
 * This file now redirects to the unified admin store for backward compatibility.
 * All existing optimized store imports continue to work without any changes.
 * 
 * MIGRATION: All optimization functionality consolidated into useUnifiedAdminStore
 */

import { useUnifiedAdminStore } from "./useUnifiedAdminStore";

// Export the unified store as the optimized admin store
export const useOptimizedAdminStore = useUnifiedAdminStore;

// Default export for compatibility
export default useUnifiedAdminStore;
