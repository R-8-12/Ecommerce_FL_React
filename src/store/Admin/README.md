# Admin Store Directory Structure

This directory contains the store files for the admin section of the application. Here's an overview of the key files:

## Active Files

- `useUnifiedAdminStore.js` - The main store that handles all admin state
- `useOptimizedAdminStore.js` - Wrapper for the unified store (for backward compatibility)
- `useAdminStore.js` - Legacy store that has been updated to use the unified store

## Legacy Files

The `legacy` directory contains older versions of store files that are kept for reference but are no longer actively used.

## Migration Strategy

The application has undergone the following migrations:

1. Original store implementation with separate stores for different features
2. Migration to optimized store with Firebase optimization
3. Final migration to unified store with Backend Gateway Pattern

## Notes on Backup Files

- Files with `.backup.js` extension are backups from before the migration
- The `backup_original_stores` directory was intended for backups but wasn't used

## Future Improvements

- Complete the migration of all components to use `optimizedApiService`
- Remove redundant store files once all components are migrated
- Simplify the store structure to just use the unified store directly
