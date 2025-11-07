# BlueprintOS Signup Flow Fix - Implementation Summary

## Problem Solved
Fixed the "Account Setup Issue" error where users would see a broken state after signup because profile creation was failing or timing out due to race conditions in the client-side signup flow.

## Changes Implemented

### 1. Atomic Server-Side Signup (Edge Function)
**File:** `/supabase/functions/signup-coach/index.ts`

- Created a Supabase Edge Function that handles the entire signup sequence server-side
- Uses service role key to bypass RLS restrictions
- Atomic transaction-like flow:
  1. Create auth user via admin API
  2. Create workspace (for coaches)
  3. Create workspace_subscriptions
  4. Create workspace_features
  5. Create profile with correct workspace_id
- Includes automatic rollback: if profile/workspace creation fails, deletes the auth user to prevent orphaned accounts
- Returns structured response with success status, workspace_id, and detailed error codes

### 2. Enhanced AuthContext
**File:** `/src/contexts/AuthContext.tsx`

- **New State Variables:**
  - `profileLoading`: Separate loading state for profile fetch
  - `profileError`: Detailed error message for profile load failures
  
- **Enhanced Retry Logic:**
  - Exponential backoff: 200ms → 500ms → 1000ms → 2000ms → 3000ms
  - 5 total attempts with detailed logging
  - Tracks attempt number and timing for debugging
  
- **New signUp() Implementation:**
  - Calls the Edge Function instead of direct database inserts
  - Waits for atomic server-side completion
  - Auto sign-in after successful signup
  
- **New retryLoadProfile() Function:**
  - Exposed to UI for manual retry triggers
  - Resets error state before retry

### 3. Smart Routing & Error Recovery
**File:** `/src/App.tsx`

- **Loading State Improvements:**
  - Waits for both `loading` and `profileLoading` to complete
  - Shows different messages: "Loading authentication..." vs "Loading your profile..."
  
- **Enhanced Error Recovery UI:**
  - Actionable error screen with multiple recovery options:
    - "Retry Loading Profile" - triggers manual retry
    - "Admin: Create Missing Profile" - dev-only recovery tool (yellow button)
    - "Reload Page" - full page refresh
    - "Contact Support" - mailto link with user ID pre-filled
  - Shows detailed error messages from profileError state
  - Debug information toggle (dev-only) showing:
    - User ID
    - Email
    - Profile loading status
    - Error details
    - Timestamp

### 4. Signup Form UX
**File:** `/src/components/Auth/SignupForm.tsx`

- **Progress Indicators:**
  - Shows "Creating your account..." during Edge Function call
  - Shows "Account created! Loading your dashboard..." on success
  - Progress message in blue banner with spinner
  - Form stays mounted until profile is confirmed loaded

### 5. Admin Recovery Tool (Edge Function)
**File:** `/supabase/functions/admin-create-profile/index.ts`

- **Security:**
  - Only enabled in development/staging environments
  - Checks ENVIRONMENT variable, blocks in production
  
- **Functionality:**
  - Accepts userId in request body
  - Verifies auth user exists via admin API
  - Checks if profile already exists (idempotent)
  - Creates workspace + profile + subscriptions if missing
  - Extracts user metadata (full_name, role) from auth record
  
- **UI Integration:**
  - Yellow button in error recovery screen (localhost only)
  - Confirmation prompt before execution
  - Success/failure alerts with reload

## How It Works Now

### Coach Signup Flow:
1. User fills form (email, password, name, workspace name)
2. SignupForm calls `signUp()` in AuthContext
3. AuthContext calls Edge Function `/functions/v1/signup-coach`
4. Edge Function (server-side, service role):
   - Creates auth user
   - Creates workspace
   - Creates workspace_subscriptions
   - Creates workspace_features
   - Creates profile with workspace_id
   - Returns success + workspace_id
5. AuthContext signs in the new user
6. Auth state change triggers `loadProfile()` with retry logic
7. App.tsx waits for profile to load completely
8. Redirects to `/coach/onboarding` (or dashboard if onboarding complete)

### Client Signup Flow:
1. Similar to coach, but no workspace creation
2. Profile created with role='client', onboarding_completed=true
3. Redirects directly to `/client/dashboard`

### Error Recovery:
- If profile fails to load after retries:
  - Shows error recovery UI with retry button
  - Dev mode: Shows admin recovery button
  - Admin recovery creates missing profile/workspace
  - User can reload or contact support

## Testing the Fix

### Manual Test:
1. Go to signup page
2. Select "Coach" role
3. Fill in details + workspace name
4. Click "Create Account"
5. Watch progress: "Creating your account..." → "Account created! Loading your dashboard..."
6. Should land on coach onboarding (if first time) or dashboard (if returning)

### Dev Recovery Test:
1. Manually delete a profile row in Supabase
2. Try to login as that user
3. Should see error recovery screen
4. Click "Admin: Create Missing Profile"
5. Profile should be recreated
6. Page reloads and dashboard loads

## Environment Variables
All secrets are auto-configured by Supabase:
- `SUPABASE_URL` - Auto-populated
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-populated (used by Edge Functions)
- `VITE_SUPABASE_URL` - Frontend env var
- `VITE_SUPABASE_ANON_KEY` - Frontend env var

## Database Changes
No migrations required. Existing tables used:
- `auth.users` (Supabase managed)
- `profiles`
- `workspaces`
- `workspace_subscriptions`
- `workspace_features`

## Monitoring Recommendations
- Track Edge Function logs: `/functions/v1/signup-coach`
- Monitor profile load retry rates in browser console
- Set up alerts for signup failures
- Track admin recovery usage

## Known Limitations
- Admin recovery tool only works in development (by design)
- Edge Function rollback may fail if auth.admin.deleteUser fails (rare)
- No UI for bulk profile recovery (would need separate admin dashboard)

## Next Steps (Optional)
- Add automated tests with Playwright/Cypress
- Create monitoring dashboard for signup metrics
- Add email notifications on signup errors
- Implement profile creation database trigger as backup
- Add structured logging/analytics for retry patterns
