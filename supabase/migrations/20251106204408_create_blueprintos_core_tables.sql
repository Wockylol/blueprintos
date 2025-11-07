/*
  # BlueprintOS Platform Core Tables

  ## Overview
  Extends the coaching platform into a white-label SaaS where coaches run independent branded workspaces
  with client transformation tracking, program building, and revenue management.

  ## New Tables

  ### 1. programs
  - `id` (uuid, primary key) - Unique program identifier
  - `workspace_id` (uuid, references workspaces) - Workspace isolation
  - `coach_id` (uuid, references profiles) - Program creator
  - `title` (text) - Program name
  - `description` (text) - Program overview
  - `duration_weeks` (integer) - Expected completion time
  - `is_template` (boolean) - Available as template for other coaches
  - `order_index` (integer) - Display order
  - `is_active` (boolean) - Published status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. program_modules
  - `id` (uuid, primary key)
  - `program_id` (uuid, references programs)
  - `module_id` (uuid, references modules)
  - `order_index` (integer) - Order within program
  - `unlock_after_days` (integer) - Days before module unlocks (0 = immediate)
  - `required_previous_completion` (boolean) - Must complete previous module
  - `created_at` (timestamptz)

  ### 3. client_programs
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `program_id` (uuid, references programs)
  - `workspace_id` (uuid, references workspaces)
  - `assigned_by` (uuid, references profiles)
  - `assigned_at` (timestamptz)
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `progress_percentage` (integer) - Overall program completion
  - `current_module_id` (uuid, references modules)
  - `created_at` (timestamptz)

  ### 4. tasks
  - `id` (uuid, primary key)
  - `module_id` (uuid, references modules)
  - `workspace_id` (uuid, references workspaces)
  - `title` (text) - Task name
  - `description` (text) - Task details
  - `task_type` (text) - action, journal_prompt, reflection, quiz
  - `order_index` (integer)
  - `is_required` (boolean) - Must complete to finish module
  - `created_at` (timestamptz)

  ### 5. client_tasks
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `task_id` (uuid, references tasks)
  - `workspace_id` (uuid, references workspaces)
  - `assigned_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `response_text` (text) - Client's response/submission
  - `coach_feedback` (text) - Coach's review
  - `is_reviewed` (boolean)
  - `created_at` (timestamptz)

  ### 6. client_streaks
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `workspace_id` (uuid, references workspaces)
  - `current_streak` (integer) - Consecutive days active
  - `longest_streak` (integer) - Best streak ever
  - `last_activity_date` (date) - Last day of activity
  - `total_active_days` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. check_ins
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `workspace_id` (uuid, references workspaces)
  - `week_number` (integer)
  - `mood_rating` (integer) - 1-10 scale
  - `energy_level` (integer) - 1-10 scale
  - `progress_notes` (text)
  - `wins` (text) - Weekly wins
  - `challenges` (text) - Weekly challenges
  - `coach_reviewed` (boolean)
  - `coach_response` (text)
  - `submitted_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 8. revenue_metrics
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, references workspaces)
  - `coach_id` (uuid, references profiles)
  - `metric_date` (date)
  - `total_revenue` (numeric) - Daily revenue
  - `active_clients` (integer)
  - `new_clients` (integer)
  - `churned_clients` (integer)
  - `mrr` (numeric) - Monthly recurring revenue snapshot
  - `created_at` (timestamptz)

  ### 9. session_bookings
  - `id` (uuid, primary key)
  - `session_id` (uuid, references sessions)
  - `workspace_id` (uuid, references workspaces)
  - `booking_url` (text) - Zoom/Meet link
  - `reminder_sent` (boolean)
  - `reminder_sent_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 10. workspace_features
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, references workspaces, unique)
  - `max_clients` (integer) - Client limit based on plan
  - `custom_domain_enabled` (boolean)
  - `white_label_enabled` (boolean)
  - `api_access_enabled` (boolean)
  - `team_members_enabled` (boolean)
  - `ai_generation_credits` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Schema Updates
  - Update milestones table with trigger_type and trigger_value fields
  - Add voice_memo_url and ai_summary to journal_entries

  ## Security
  - Enable RLS on all new tables
  - All queries filtered by workspace_id
  - Coaches can manage their workspace data
  - Clients can view/update only their assigned data
*/

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  duration_weeks integer DEFAULT 12,
  is_template boolean DEFAULT false,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create program_modules junction table
CREATE TABLE IF NOT EXISTS program_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  order_index integer DEFAULT 0,
  unlock_after_days integer DEFAULT 0,
  required_previous_completion boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(program_id, module_id)
);

-- Create client_programs table
CREATE TABLE IF NOT EXISTS client_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  progress_percentage integer DEFAULT 0,
  current_module_id uuid REFERENCES modules(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, program_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  task_type text DEFAULT 'action' CHECK (task_type IN ('action', 'journal_prompt', 'reflection', 'quiz')),
  order_index integer DEFAULT 0,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create client_tasks table
CREATE TABLE IF NOT EXISTS client_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  response_text text DEFAULT '',
  coach_feedback text DEFAULT '',
  is_reviewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create client_streaks table
CREATE TABLE IF NOT EXISTS client_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  total_active_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, workspace_id)
);

-- Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 10),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  progress_notes text DEFAULT '',
  wins text DEFAULT '',
  challenges text DEFAULT '',
  coach_reviewed boolean DEFAULT false,
  coach_response text DEFAULT '',
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create revenue_metrics table
CREATE TABLE IF NOT EXISTS revenue_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  metric_date date NOT NULL,
  total_revenue numeric(10, 2) DEFAULT 0,
  active_clients integer DEFAULT 0,
  new_clients integer DEFAULT 0,
  churned_clients integer DEFAULT 0,
  mrr numeric(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, metric_date)
);

-- Create session_bookings table
CREATE TABLE IF NOT EXISTS session_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  booking_url text DEFAULT '',
  reminder_sent boolean DEFAULT false,
  reminder_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create workspace_features table
CREATE TABLE IF NOT EXISTS workspace_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL UNIQUE,
  max_clients integer DEFAULT 10,
  custom_domain_enabled boolean DEFAULT false,
  white_label_enabled boolean DEFAULT false,
  api_access_enabled boolean DEFAULT false,
  team_members_enabled boolean DEFAULT false,
  ai_generation_credits integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add columns to existing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'milestones' AND column_name = 'trigger_type'
  ) THEN
    ALTER TABLE milestones ADD COLUMN trigger_type text DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'module_completion', 'streak', 'task_count'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'milestones' AND column_name = 'trigger_value'
  ) THEN
    ALTER TABLE milestones ADD COLUMN trigger_value integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'voice_memo_url'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN voice_memo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'ai_summary'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN ai_summary text DEFAULT '';
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for programs
CREATE POLICY "Workspace members can view programs in their workspace"
  ON programs FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Coaches can create programs in their workspace"
  ON programs FOR INSERT
  TO authenticated
  WITH CHECK (
    coach_id = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update own programs"
  ON programs FOR UPDATE
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

-- RLS Policies for program_modules
CREATE POLICY "Workspace members can view program modules"
  ON program_modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_modules.program_id
      AND programs.workspace_id IN (
        SELECT workspace_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Coaches can manage program modules"
  ON program_modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_modules.program_id
      AND programs.coach_id = auth.uid()
    )
  );

-- RLS Policies for client_programs
CREATE POLICY "Workspace members can view client programs"
  ON client_programs FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Coaches can assign programs"
  ON client_programs FOR INSERT
  TO authenticated
  WITH CHECK (
    assigned_by = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Clients can update own program progress"
  ON client_programs FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- RLS Policies for tasks
CREATE POLICY "Workspace members can view tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- RLS Policies for client_tasks
CREATE POLICY "Workspace members can view client tasks"
  ON client_tasks FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Coaches can assign tasks"
  ON client_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid() AND role = 'coach'
    )
  );

CREATE POLICY "Clients can update own task completion"
  ON client_tasks FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- RLS Policies for client_streaks
CREATE POLICY "Workspace members can view streaks"
  ON client_streaks FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can manage streaks"
  ON client_streaks FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for check_ins
CREATE POLICY "Workspace members can view check-ins"
  ON check_ins FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Clients can create check-ins"
  ON check_ins FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update check-ins"
  ON check_ins FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- RLS Policies for revenue_metrics
CREATE POLICY "Coaches can view own revenue metrics"
  ON revenue_metrics FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "System can manage revenue metrics"
  ON revenue_metrics FOR ALL
  TO authenticated
  USING (coach_id = auth.uid());

-- RLS Policies for session_bookings
CREATE POLICY "Workspace members can view session bookings"
  ON session_bookings FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage session bookings"
  ON session_bookings FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- RLS Policies for workspace_features
CREATE POLICY "Workspace owners can view features"
  ON workspace_features FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_features.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can update features"
  ON workspace_features FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_features.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_features.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_programs_workspace_id ON programs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_programs_coach_id ON programs(coach_id);
CREATE INDEX IF NOT EXISTS idx_program_modules_program_id ON program_modules(program_id);
CREATE INDEX IF NOT EXISTS idx_client_programs_client_id ON client_programs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_programs_workspace_id ON client_programs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_module_id ON tasks(module_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_client_tasks_client_id ON client_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tasks_workspace_id ON client_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_client_streaks_client_id ON client_streaks(client_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_client_id ON check_ins(client_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_workspace_id ON check_ins(workspace_id);
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_workspace_id ON revenue_metrics(workspace_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_session_id ON session_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_workspace_features_workspace_id ON workspace_features(workspace_id);
