/**
 * ADMIN STORE - UNIFIED STORE WRAPPER
 * 
 * This file now redirects to the unified admin store for backward compatibility.
 * All existing component imports continue to work without any changes.
 * 
 * MIGRATION: All functionality consolidated into useUnifiedAdminStore
 */

import { useUnifiedAdminStore } from "./useUnifiedAdminStore";

// Export the unified store as the main admin store
export const useAdminStore = useUnifiedAdminStore;

// Default export for compatibility
export default useUnifiedAdminStore;
