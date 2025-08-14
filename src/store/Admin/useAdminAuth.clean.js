/**
 * ADMIN AUTH STORE - UNIFIED STORE WRAPPER
 * 
 * This file now redirects to the unified admin store for backward compatibility.
 * All existing authentication-related imports continue to work without any changes.
 * 
 * MIGRATION: All authentication functionality consolidated into useUnifiedAdminStore
 */

import { useUnifiedAdminStore } from "./useUnifiedAdminStore";

// Export the unified store as the admin auth store
export const useAdminAuthStore = useUnifiedAdminStore;

// Default export for compatibility
export default useUnifiedAdminStore;
