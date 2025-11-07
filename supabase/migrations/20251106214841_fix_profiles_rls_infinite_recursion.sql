/*
  # Fix Infinite Recursion in Profiles RLS Policy

  ## Problem
  The policy "Workspace members can view profiles in same workspace" causes infinite recursion
  because it queries the profiles table within a SELECT policy on the profiles table:
  
  ```sql
  workspace_id IN (
    SELECT workspace_id FROM profiles WHERE id = auth.uid()
  )
  ```

  This creates a circular dependency where:
  1. User tries to SELECT from profiles
  2. RLS evaluates the policy
  3. Policy needs to SELECT from profiles (to get workspace_id)
  4. RLS evaluates the policy again (infinite loop)

  ## Solution
  Remove the recursive policy entirely. The "Users can view own profile" policy is sufficient
  for the current use case. If workspace-wide profile visibility is needed later, we can:
  
  Option A: Use a materialized view or cache the current user's workspace_id
  Option B: Use a security definer function to break the recursion
  Option C: Store workspace_id in JWT claims and use auth.jwt()

  For now, we'll simply drop the problematic policy since the atomic signup Edge Function
  creates profiles correctly and users only need to see their own profile.

  ## Changes
  - Drop the recursive policy: "Workspace members can view profiles in same workspace"
  - Keep the safe policies: insert own, update own, view own
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Workspace members can view profiles in same workspace" ON profiles;

-- The remaining policies are safe and sufficient:
-- 1. "Users can view own profile" - allows users to see their own profile
-- 2. "Users can update own profile" - allows users to update their own profile
-- 3. "Users can insert own profile" - allows users to create their own profile

-- Note: If cross-workspace profile visibility is needed in the future, implement it using
-- a security definer function or by storing workspace_id in JWT claims to avoid recursion.
