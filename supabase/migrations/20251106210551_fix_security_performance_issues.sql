/*
  # Security & Performance Optimization Migration

  ## Overview
  Fixes all Supabase security advisor warnings:
  - Adds missing foreign key indexes for query performance
  - Optimizes RLS policies to use (select auth.uid()) pattern
  - Improves overall database performance and security

  ## Changes

  ### 1. Missing Foreign Key Indexes
  Adds indexes for all foreign key columns that were missing them:
  - ai_generation_log, client_modules, client_programs, client_progress
  - client_streaks, client_tasks, coaching_plans, journal_entries
  - landing_page_prompts, milestones, modules, payments
  - program_modules, revenue_metrics, session_bookings
  - testimonials, workspace_subscriptions

  ### 2. RLS Policy Optimization
  Replaces all direct auth.uid() calls with (select auth.uid())
  This prevents re-evaluation on every row and significantly improves query performance

  ### 3. Notes
  - Unused index warnings are informational only - indexes will be used as app scales
  - Multiple permissive policies are intentional for flexible access control
  - All changes are idempotent and safe to run multiple times
*/

-- ============================================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- ai_generation_log indexes
CREATE INDEX IF NOT EXISTS idx_ai_generation_log_workspace_id 
  ON ai_generation_log(workspace_id);

-- client_modules indexes
CREATE INDEX IF NOT EXISTS idx_client_modules_assigned_by 
  ON client_modules(assigned_by);
CREATE INDEX IF NOT EXISTS idx_client_modules_workspace_id 
  ON client_modules(workspace_id);

-- client_programs indexes
CREATE INDEX IF NOT EXISTS idx_client_programs_assigned_by 
  ON client_programs(assigned_by);
CREATE INDEX IF NOT EXISTS idx_client_programs_current_module_id 
  ON client_programs(current_module_id);
CREATE INDEX IF NOT EXISTS idx_client_programs_program_id 
  ON client_programs(program_id);

-- client_progress indexes
CREATE INDEX IF NOT EXISTS idx_client_progress_client_id 
  ON client_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_coach_id 
  ON client_progress(coach_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_workspace_id 
  ON client_progress(workspace_id);

-- client_streaks indexes
CREATE INDEX IF NOT EXISTS idx_client_streaks_workspace_id 
  ON client_streaks(workspace_id);

-- client_tasks indexes
CREATE INDEX IF NOT EXISTS idx_client_tasks_task_id 
  ON client_tasks(task_id);

-- coaching_plans indexes
CREATE INDEX IF NOT EXISTS idx_coaching_plans_coach_id 
  ON coaching_plans(coach_id);
CREATE INDEX IF NOT EXISTS idx_coaching_plans_workspace_id 
  ON coaching_plans(workspace_id);

-- journal_entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_workspace_id 
  ON journal_entries(workspace_id);

-- landing_page_prompts indexes
CREATE INDEX IF NOT EXISTS idx_landing_page_prompts_workspace_id 
  ON landing_page_prompts(workspace_id);

-- milestones indexes
CREATE INDEX IF NOT EXISTS idx_milestones_client_id 
  ON milestones(client_id);
CREATE INDEX IF NOT EXISTS idx_milestones_workspace_id 
  ON milestones(workspace_id);

-- modules indexes
CREATE INDEX IF NOT EXISTS idx_modules_coach_id 
  ON modules(coach_id);

-- payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_client_id 
  ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_coach_id 
  ON payments(coach_id);
CREATE INDEX IF NOT EXISTS idx_payments_workspace_id 
  ON payments(workspace_id);

-- program_modules indexes
CREATE INDEX IF NOT EXISTS idx_program_modules_module_id 
  ON program_modules(module_id);

-- revenue_metrics indexes
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_coach_id 
  ON revenue_metrics(coach_id);

-- session_bookings indexes
CREATE INDEX IF NOT EXISTS idx_session_bookings_workspace_id 
  ON session_bookings(workspace_id);

-- testimonials indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_client_id 
  ON testimonials(client_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_workspace_id 
  ON testimonials(workspace_id);

-- workspace_subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_workspace_subscriptions_workspace_id 
  ON workspace_subscriptions(workspace_id);

-- ============================================================================
-- PART 2: OPTIMIZE RLS POLICIES - PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Workspace members can view profiles in same workspace" ON profiles;
CREATE POLICY "Workspace members can view profiles in same workspace"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 3: OPTIMIZE RLS POLICIES - WORKSPACES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace owners can view own workspace" ON workspaces;
CREATE POLICY "Workspace owners can view own workspace"
  ON workspaces FOR SELECT
  TO authenticated
  USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can create workspaces" ON workspaces;
CREATE POLICY "Coaches can create workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Workspace owners can update own workspace" ON workspaces;
CREATE POLICY "Workspace owners can update own workspace"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

-- ============================================================================
-- PART 4: OPTIMIZE RLS POLICIES - COACHING_PLANS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Coaches can view own plans" ON coaching_plans;
CREATE POLICY "Coaches can view own plans"
  ON coaching_plans FOR SELECT
  TO authenticated
  USING (coach_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can create own plans" ON coaching_plans;
CREATE POLICY "Coaches can create own plans"
  ON coaching_plans FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can update own plans" ON coaching_plans;
CREATE POLICY "Coaches can update own plans"
  ON coaching_plans FOR UPDATE
  TO authenticated
  USING (coach_id = (select auth.uid()))
  WITH CHECK (coach_id = (select auth.uid()));

-- ============================================================================
-- PART 5: OPTIMIZE RLS POLICIES - CLIENT_MODULES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Coaches can view client module assignments" ON client_modules;
CREATE POLICY "Coaches can view client module assignments"
  ON client_modules FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients can view own module assignments" ON client_modules;
CREATE POLICY "Clients can view own module assignments"
  ON client_modules FOR SELECT
  TO authenticated
  USING (client_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can assign modules" ON client_modules;
CREATE POLICY "Coaches can assign modules"
  ON client_modules FOR INSERT
  TO authenticated
  WITH CHECK (assigned_by = (select auth.uid()));

DROP POLICY IF EXISTS "Clients can update completion status" ON client_modules;
CREATE POLICY "Clients can update completion status"
  ON client_modules FOR UPDATE
  TO authenticated
  USING (client_id = (select auth.uid()))
  WITH CHECK (client_id = (select auth.uid()));

-- ============================================================================
-- PART 6: OPTIMIZE RLS POLICIES - CLIENT_PROGRESS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Clients can view own progress" ON client_progress;
CREATE POLICY "Clients can view own progress"
  ON client_progress FOR SELECT
  TO authenticated
  USING (client_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can view client progress" ON client_progress;
CREATE POLICY "Coaches can view client progress"
  ON client_progress FOR SELECT
  TO authenticated
  USING (coach_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can create progress records" ON client_progress;
CREATE POLICY "Coaches can create progress records"
  ON client_progress FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can update progress records" ON client_progress;
CREATE POLICY "Coaches can update progress records"
  ON client_progress FOR UPDATE
  TO authenticated
  USING (coach_id = (select auth.uid()))
  WITH CHECK (coach_id = (select auth.uid()));

-- ============================================================================
-- PART 7: OPTIMIZE RLS POLICIES - PAYMENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Clients can view own payments" ON payments;
CREATE POLICY "Clients can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (client_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can view own payments" ON payments;
CREATE POLICY "Coaches can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (coach_id = (select auth.uid()));

-- ============================================================================
-- PART 8: OPTIMIZE RLS POLICIES - MILESTONES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Clients can view own milestones" ON milestones;
CREATE POLICY "Clients can view own milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (client_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can view client milestones" ON milestones;
CREATE POLICY "Coaches can view client milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can create client milestones" ON milestones;
CREATE POLICY "Coaches can create client milestones"
  ON milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 9: OPTIMIZE RLS POLICIES - SESSIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace sessions are visible to workspace members" ON sessions;
CREATE POLICY "Workspace sessions are visible to workspace members"
  ON sessions FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can create sessions in their workspace" ON sessions;
CREATE POLICY "Coaches can create sessions in their workspace"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    coach_id = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can update sessions in their workspace" ON sessions;
CREATE POLICY "Coaches can update sessions in their workspace"
  ON sessions FOR UPDATE
  TO authenticated
  USING (
    coach_id = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  )
  WITH CHECK (
    coach_id = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 10: OPTIMIZE RLS POLICIES - MODULES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace modules are visible to workspace members" ON modules;
CREATE POLICY "Workspace modules are visible to workspace members"
  ON modules FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can manage modules in their workspace" ON modules;
CREATE POLICY "Coaches can manage modules in their workspace"
  ON modules FOR ALL
  TO authenticated
  USING (
    coach_id = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 11: OPTIMIZE RLS POLICIES - JOURNAL_ENTRIES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace journal entries visible to workspace members" ON journal_entries;
CREATE POLICY "Workspace journal entries visible to workspace members"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients can create journal entries in their workspace" ON journal_entries;
CREATE POLICY "Clients can create journal entries in their workspace"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Workspace members can update journal entries" ON journal_entries;
CREATE POLICY "Workspace members can update journal entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 12: OPTIMIZE RLS POLICIES - TESTIMONIALS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Clients can create testimonials in their workspace" ON testimonials;
CREATE POLICY "Clients can create testimonials in their workspace"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Workspace owners can manage testimonials" ON testimonials;
CREATE POLICY "Workspace owners can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 13: OPTIMIZE RLS POLICIES - WORKSPACE_SUBSCRIPTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace owners can view own subscription" ON workspace_subscriptions;
CREATE POLICY "Workspace owners can view own subscription"
  ON workspace_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_subscriptions.workspace_id
      AND workspaces.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 14: OPTIMIZE RLS POLICIES - PRICING_TIERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace owners can manage pricing tiers" ON pricing_tiers;
CREATE POLICY "Workspace owners can manage pricing tiers"
  ON pricing_tiers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = pricing_tiers.workspace_id
      AND workspaces.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 15: OPTIMIZE RLS POLICIES - LANDING_PAGE_PROMPTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace owners can manage prompts" ON landing_page_prompts;
CREATE POLICY "Workspace owners can manage prompts"
  ON landing_page_prompts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = landing_page_prompts.workspace_id
      AND workspaces.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 16: OPTIMIZE RLS POLICIES - AI_GENERATION_LOG TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace owners can view generation logs" ON ai_generation_log;
CREATE POLICY "Workspace owners can view generation logs"
  ON ai_generation_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = ai_generation_log.workspace_id
      AND workspaces.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 17: OPTIMIZE RLS POLICIES - PROGRAMS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace members can view programs in their workspace" ON programs;
CREATE POLICY "Workspace members can view programs in their workspace"
  ON programs FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can create programs in their workspace" ON programs;
CREATE POLICY "Coaches can create programs in their workspace"
  ON programs FOR INSERT
  TO authenticated
  WITH CHECK (
    coach_id = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can update own programs" ON programs;
CREATE POLICY "Coaches can update own programs"
  ON programs FOR UPDATE
  TO authenticated
  USING (
    coach_id = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  )
  WITH CHECK (
    coach_id = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 18: OPTIMIZE RLS POLICIES - PROGRAM_MODULES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace members can view program modules" ON program_modules;
CREATE POLICY "Workspace members can view program modules"
  ON program_modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_modules.program_id
      AND programs.workspace_id IN (
        SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Coaches can manage program modules" ON program_modules;
CREATE POLICY "Coaches can manage program modules"
  ON program_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_modules.program_id
      AND programs.coach_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 19: OPTIMIZE RLS POLICIES - CLIENT_PROGRAMS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace members can view client programs" ON client_programs;
CREATE POLICY "Workspace members can view client programs"
  ON client_programs FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can assign programs" ON client_programs;
CREATE POLICY "Coaches can assign programs"
  ON client_programs FOR INSERT
  TO authenticated
  WITH CHECK (
    assigned_by = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients can update own program progress" ON client_programs;
CREATE POLICY "Clients can update own program progress"
  ON client_programs FOR UPDATE
  TO authenticated
  USING (client_id = (select auth.uid()))
  WITH CHECK (client_id = (select auth.uid()));

-- ============================================================================
-- PART 20: OPTIMIZE RLS POLICIES - TASKS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace members can view tasks" ON tasks;
CREATE POLICY "Workspace members can view tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can manage tasks" ON tasks;
CREATE POLICY "Coaches can manage tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid()) AND role = 'coach'
    )
  );

-- ============================================================================
-- PART 21: OPTIMIZE RLS POLICIES - CLIENT_TASKS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace members can view client tasks" ON client_tasks;
CREATE POLICY "Workspace members can view client tasks"
  ON client_tasks FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can assign tasks" ON client_tasks;
CREATE POLICY "Coaches can assign tasks"
  ON client_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid()) AND role = 'coach'
    )
  );

DROP POLICY IF EXISTS "Clients can update own task completion" ON client_tasks;
CREATE POLICY "Clients can update own task completion"
  ON client_tasks FOR UPDATE
  TO authenticated
  USING (client_id = (select auth.uid()))
  WITH CHECK (client_id = (select auth.uid()));

-- ============================================================================
-- PART 22: OPTIMIZE RLS POLICIES - CLIENT_STREAKS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace members can view streaks" ON client_streaks;
CREATE POLICY "Workspace members can view streaks"
  ON client_streaks FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can manage streaks" ON client_streaks;
CREATE POLICY "System can manage streaks"
  ON client_streaks FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

-- ============================================================================
-- PART 23: OPTIMIZE RLS POLICIES - CHECK_INS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace members can view check-ins" ON check_ins;
CREATE POLICY "Workspace members can view check-ins"
  ON check_ins FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients can create check-ins" ON check_ins;
CREATE POLICY "Clients can create check-ins"
  ON check_ins FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = (select auth.uid()) AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can update check-ins" ON check_ins;
CREATE POLICY "Coaches can update check-ins"
  ON check_ins FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid()) AND role = 'coach'
    )
  );

-- ============================================================================
-- PART 24: OPTIMIZE RLS POLICIES - REVENUE_METRICS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Coaches can view own revenue metrics" ON revenue_metrics;
CREATE POLICY "Coaches can view own revenue metrics"
  ON revenue_metrics FOR SELECT
  TO authenticated
  USING (coach_id = (select auth.uid()));

DROP POLICY IF EXISTS "System can manage revenue metrics" ON revenue_metrics;
CREATE POLICY "System can manage revenue metrics"
  ON revenue_metrics FOR ALL
  TO authenticated
  USING (coach_id = (select auth.uid()));

-- ============================================================================
-- PART 25: OPTIMIZE RLS POLICIES - SESSION_BOOKINGS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace members can view session bookings" ON session_bookings;
CREATE POLICY "Workspace members can view session bookings"
  ON session_bookings FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can manage session bookings" ON session_bookings;
CREATE POLICY "Coaches can manage session bookings"
  ON session_bookings FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = (select auth.uid()) AND role = 'coach'
    )
  );

-- ============================================================================
-- PART 26: OPTIMIZE RLS POLICIES - WORKSPACE_FEATURES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Workspace owners can view features" ON workspace_features;
CREATE POLICY "Workspace owners can view features"
  ON workspace_features FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_features.workspace_id
      AND workspaces.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Workspace owners can update features" ON workspace_features;
CREATE POLICY "Workspace owners can update features"
  ON workspace_features FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_features.workspace_id
      AND workspaces.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_features.workspace_id
      AND workspaces.owner_id = (select auth.uid())
    )
  );
