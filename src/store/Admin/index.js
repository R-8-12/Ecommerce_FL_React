/**
 * ADMIN STORE COMPATIBILITY WRAPPER
 * 
 * This file provides backward compatibility for all existing admin store imports.
 * It ensures that all components continue to work without any changes while
 * using the new unified admin store underneath.
 * 
 * SUPPORTED IMPORTS:
 * - import useAdminStore from "./useAdminStore"
 * - import { useAdminStore } from "./useAdminStore"
 * - import { useAdminAuthStore } from "./useAdminAuth"
 * - import { useOptimizedAdminStore } from "./useOptimizedAdminStore"
 * 
 * ALL COMPONENT CODE REMAINS UNCHANGED
 */

import { useUnifiedAdminStore } from './useUnifiedAdminStore';

// Default export for: import useAdminStore from "./useAdminStore"
export default useUnifiedAdminStore;

// Named export for: import { useAdminStore } from "./useAdminStore"
export const useAdminStore = useUnifiedAdminStore;

// All other store aliases point to the unified store
export const useAdminAuthStore = useUnifiedAdminStore;
export const useOptimizedAdminStore = useUnifiedAdminStore;
export const useCompatibleAdminStore = useUnifiedAdminStore;

// Individual specialized stores also use unified store
export const useAdminProducts = useUnifiedAdminStore;
export const useAdminOrders = useUnifiedAdminStore;
export const useAdminUsers = useUnifiedAdminStore;
export const useAdminSellPhone = useUnifiedAdminStore;
export const useAdminDeliveryPartners = useUnifiedAdminStore;

console.log('📦 Admin Store Compatibility Layer loaded - all imports redirected to unified store');
