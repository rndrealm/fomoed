# Supabase Auth Client Migration

## Overview

This commit implements a significant change to our authentication system by migrating to a new Supabase Auth Client architecture. This is potentially a **breaking change** that affects how authentication works throughout the application.

## Key Changes

### 1. New Provider Structure

- Added a new `SupabaseAuthProvider` that manages auth state with React Context
- Created a new `Providers` component that wraps the application with all necessary providers in a consistent order
- Implemented `useSupabaseAuth()` hook for accessing authentication state from anywhere in the app

### 2. Authentication Flow Changes

- Updated middleware to use the new Supabase SSR client
- Modified auth session handling across the application
- Cached auth state is now managed through the provider rather than individual components
- Added route protection for dashboard and signals routes, automatically redirecting unauthenticated users to login

### 3. Component Updates

- Updated all components that previously referenced auth directly to use the new provider
- Major changes to profile components, sidebars, and navigation components
- Added `auth-status.tsx` component for consistent auth state visualization

### 4. Server Actions

- Refactored all server actions across multiple modules to work with the new auth system:
  - home/server-actions.ts
  - layouts/actions.ts
  - news/actions.ts
  - settings/actions.ts
  - subscriptions/actions.ts
  - tabs/actions.ts
  - widgets/actions.ts

## Potential Breaking Changes

1. **Auth State Access**: Components that directly accessed auth state now need to use the `useSupabaseAuth()` hook
2. **Server Actions**: All server actions have been modified to work with the new auth system
3. **Middleware**: The middleware has been updated to use the new client

## Migration Guide for Developers

1. **Using Authentication State**:

   ```tsx
   // Old way
   // const { data: { session } } = await supabase.auth.getSession()

   // New way
   import { useSupabaseAuth } from "@/components/providers";

   function YourComponent() {
     const { session, isLoading, signOut } = useSupabaseAuth();
     // Use session, isLoading, or signOut as needed
   }
   ```

2. **Server Components**:
   Server components should continue to use the server client methods, but be aware that the implementation has changed.

3. **Protected Routes**:
   The SupabaseAuthProvider now automatically protects routes under `/dashboard/*` and `/signals/*`. Users without a valid session will be redirected to the login page. No additional code is needed in your components to handle this basic protection.

4. **Profile and Navigation Components**:
   If you're working with profile or navigation components, be aware these have been refactored to use the new auth provider.

## Documentation

The new architecture follows a standard provider pattern:

- Auth state is initialized once at the top level
- Auth state changes are propagated through React Context
- Components access auth through the `useSupabaseAuth()` hook
- Server actions have been updated to work with the new approach
- Protected routes (/dashboard/_ and /signals/_) automatically redirect to login page if user is not authenticated

## Current Limitations & Next Steps

We still need to migrate login and sign up functions to the client side. This hasn't been completed yet because profile creation logic cannot live on the client side.

**Next steps in the migration plan:**

1. Move profile creation to the database level using PostgreSQL triggers
2. Once triggers are in place, move all remaining auth functions to the client side

**Temporary Solution:**

- We have turned off caching for all auth pages in `next.config.ts` as a temporary measure
- This ensures proper auth flow while we complete the migration

## Testing

When testing, ensure:

1. Authentication flow works end-to-end
2. Profile components display correctly for authenticated and unauthenticated users
3. Restricted pages properly redirect unauthenticated users to the login page
4. Server actions correctly handle authentication state
5. Verify route protection works by trying to access dashboard and signals routes when not logged in
