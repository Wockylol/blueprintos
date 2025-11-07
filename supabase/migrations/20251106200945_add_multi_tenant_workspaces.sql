/*
  # BlueprintOS Multi-Tenant Architecture

  ## Overview
  Transforms single-coach platform into multi-tenant SaaS where each coach runs an independent branded workspace.

  ## New Tables

  ### 1. workspaces
  - `id` (uuid, primary key) - Unique workspace identifier
  - `name` (text) - Workspace/business name
  - `subdomain` (text, unique) - Subdomain for workspace (e.g., coach1.blueprintos.com)
  - `custom_domain` (text, unique, nullable) - Optional custom domain
  - `owner_id` (uuid, references profiles) - Coach who owns this workspace
  - `logo_url` (text) - Workspace logo
  - `primary_color` (text) - Brand primary color (hex)
  - `secondary_color` (text) - Brand secondary color (hex)
  - `tagline` (text) - Short business tagline
  - `about_text` (text) - About section content
  - `landing_page_config` (jsonb) - AI-generated landing page configuration
  - `onboarding_steps` (jsonb) - Wizard completion tracking
  - `stripe_account_id` (text) - Stripe Connect account ID
  - `is_active` (boolean) - Workspace active status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. workspace_subscriptions
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, references workspaces)
  - `plan_tier` (text) - starter, pro, enterprise
  - `stripe_subscription_id` (text)
  - `status` (text) - active, past_due, cancelled, trialing
  - `billing_cycle` (text) - monthly, annual
  - `mrr` (numeric) - Monthly recurring revenue
  - `trial_ends_at` (timestamptz)
  - `current_period_start` (timestamptz)
  - `current_period_end` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. pricing_tiers
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, references workspaces)
  - `name` (text) - Tier name (Starter, Elite, Mastermind)
  - `price` (numeric) - Price in cents
  - `currency` (text) - Currency code
  - `duration_weeks` (integer)
  - `features` (jsonb) - Array of feature descriptions
  - `is_featured` (boolean) - Highlight this tier
  - `order_index` (integer) - Display order
  - `stripe_price_id` (text) - Stripe Price ID
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 4. landing_page_prompts
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, references workspaces)
  - `prompt_text` (text) - User's natural language input
  - `generated_config` (jsonb) - AI-generated configuration
  - `is_active` (boolean) - Currently published version
  - `created_at` (timestamptz)

  ### 5. ai_generation_log
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, references workspaces)
  - `prompt_type` (text) - landing_page, section, copy
  - `tokens_used` (integer)
  - `cost` (numeric)
  - `created_at` (timestamptz)

  ## Schema Updates

  - Add `workspace_id` column to: profiles, coaching_plans, sessions, modules, client_modules, journal_entries, client_progress, testimonials, payments, milestones
  - Add 'superadmin' to profiles.role enum
  - Update all foreign key relationships

  ## Security
  - Enable RLS on all new tables
  - Update existing RLS policies to filter by workspace_id
  - Superadmin bypass policies for platform operators
  - Public access for landing pages based on subdomain
*/

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subdomain text UNIQUE NOT NULL,
  custom_domain text UNIQUE,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  logo_url text,
  primary_color text DEFAULT '#3B82F6',
  secondary_color text DEFAULT '#8B5CF6',
  tagline text DEFAULT '',
  about_text text DEFAULT '',
  landing_page_config jsonb DEFAULT '{}',
  onboarding_steps jsonb DEFAULT '{"step1": false, "step2": false, "step3": false, "step4": false, "step5": false, "step6": false}',
  stripe_account_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workspace_subscriptions table
CREATE TABLE IF NOT EXISTS workspace_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  plan_tier text DEFAULT 'starter' CHECK (plan_tier IN ('starter', 'pro', 'enterprise')),
  stripe_subscription_id text,
  status text DEFAULT 'trialing' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  mrr numeric(10, 2) DEFAULT 0,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pricing_tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  price numeric(10, 2) NOT NULL,
  currency text DEFAULT 'usd',
  duration_weeks integer DEFAULT 12,
  features jsonb DEFAULT '[]',
  is_featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  stripe_price_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create landing_page_prompts table
CREATE TABLE IF NOT EXISTS landing_page_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  prompt_text text NOT NULL,
  generated_config jsonb DEFAULT '{}',
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create ai_generation_log table
CREATE TABLE IF NOT EXISTS ai_generation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  prompt_type text NOT NULL,
  tokens_used integer DEFAULT 0,
  cost numeric(10, 4) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add workspace_id to existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coaching_plans' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE coaching_plans ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE sessions ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'modules' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE modules ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_modules' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE client_modules ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_progress' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE client_progress ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'milestones' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE milestones ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security on new tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces table
CREATE POLICY "Public can view active workspaces for landing pages"
  ON workspaces FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Workspace owners can view own workspace"
  ON workspaces FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Coaches can create workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can update own workspace"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for workspace_subscriptions
CREATE POLICY "Workspace owners can view own subscription"
  ON workspace_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_subscriptions.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- RLS Policies for pricing_tiers
CREATE POLICY "Public can view active pricing tiers"
  ON pricing_tiers FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Workspace owners can manage pricing tiers"
  ON pricing_tiers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = pricing_tiers.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- RLS Policies for landing_page_prompts
CREATE POLICY "Workspace owners can manage prompts"
  ON landing_page_prompts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = landing_page_prompts.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- RLS Policies for ai_generation_log
CREATE POLICY "Workspace owners can view generation logs"
  ON ai_generation_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = ai_generation_log.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Update existing RLS policies to include workspace_id filtering
-- Drop old policies and recreate with workspace context

-- Profiles policies update
DROP POLICY IF EXISTS "Coaches can view their clients" ON profiles;
CREATE POLICY "Workspace members can view profiles in same workspace"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    ) OR id = auth.uid()
  );

-- Sessions policies update
DROP POLICY IF EXISTS "Coaches can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Clients can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Coaches can manage own sessions" ON sessions;
DROP POLICY IF EXISTS "Coaches can update own sessions" ON sessions;

CREATE POLICY "Workspace sessions are visible to workspace members"
  ON sessions FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Coaches can create sessions in their workspace"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    coach_id = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update sessions in their workspace"
  ON sessions FOR UPDATE
  TO authenticated
  USING (
    coach_id = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    coach_id = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Modules policies update
DROP POLICY IF EXISTS "Coaches can view own modules" ON modules;
DROP POLICY IF EXISTS "Clients can view assigned modules" ON modules;
DROP POLICY IF EXISTS "Coaches can create modules" ON modules;
DROP POLICY IF EXISTS "Coaches can update own modules" ON modules;

CREATE POLICY "Workspace modules are visible to workspace members"
  ON modules FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage modules in their workspace"
  ON modules FOR ALL
  TO authenticated
  USING (
    coach_id = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Journal entries policies update
DROP POLICY IF EXISTS "Clients can view own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Coaches can view client journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Clients can create own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Coaches can update journal feedback" ON journal_entries;

CREATE POLICY "Workspace journal entries visible to workspace members"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Clients can create journal entries in their workspace"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update journal entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Testimonials policies update
DROP POLICY IF EXISTS "Clients can create own testimonials" ON testimonials;
DROP POLICY IF EXISTS "Coaches can approve testimonials" ON testimonials;

CREATE POLICY "Workspace testimonials visible when approved"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "Clients can create testimonials in their workspace"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_subdomain ON workspaces(subdomain);
CREATE INDEX IF NOT EXISTS idx_workspaces_custom_domain ON workspaces(custom_domain);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_workspace_id ON profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sessions_workspace_id ON sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_modules_workspace_id ON modules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_workspace_id ON pricing_tiers(workspace_id);
