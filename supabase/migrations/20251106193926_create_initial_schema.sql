/*
  # The Blueprint - Initial Database Schema
  
  ## Overview
  Creates the complete database structure for a premium coaching and mindset mentorship SaaS platform.
  Designed for single-coach MVP with future multi-coach scalability.
  
  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, references auth.users)
  - `role` (text) - 'coach', 'client', or 'admin'
  - `full_name` (text)
  - `avatar_url` (text)
  - `bio` (text)
  - `timezone` (text)
  - `phone` (text)
  - `onboarding_completed` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. coaching_plans
  - `id` (uuid, primary key)
  - `coach_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `duration_weeks` (integer)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  
  ### 3. sessions
  - `id` (uuid, primary key)
  - `coach_id` (uuid, references profiles)
  - `client_id` (uuid, references profiles)
  - `scheduled_at` (timestamptz)
  - `duration_minutes` (integer)
  - `status` (text) - 'scheduled', 'completed', 'cancelled'
  - `notes` (text)
  - `recording_url` (text)
  - `created_at` (timestamptz)
  
  ### 4. modules
  - `id` (uuid, primary key)
  - `coach_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `video_url` (text)
  - `content` (text)
  - `order_index` (integer)
  - `created_at` (timestamptz)
  
  ### 5. client_modules
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `module_id` (uuid, references modules)
  - `assigned_by` (uuid, references profiles)
  - `assigned_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `is_unlocked` (boolean)
  
  ### 6. journal_entries
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `entry_text` (text)
  - `audio_url` (text)
  - `mood_rating` (integer) - 1-5 scale
  - `is_reviewed` (boolean)
  - `coach_feedback` (text)
  - `created_at` (timestamptz)
  
  ### 7. client_progress
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `coach_id` (uuid, references profiles)
  - `week_number` (integer)
  - `tasks_completed` (integer)
  - `tasks_total` (integer)
  - `check_in_completed` (boolean)
  - `notes` (text)
  - `created_at` (timestamptz)
  
  ### 8. testimonials
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `client_name` (text)
  - `client_title` (text)
  - `testimonial_text` (text)
  - `rating` (integer)
  - `image_url` (text)
  - `is_featured` (boolean)
  - `is_approved` (boolean)
  - `created_at` (timestamptz)
  
  ### 9. payments
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `coach_id` (uuid, references profiles)
  - `amount` (numeric)
  - `currency` (text)
  - `status` (text) - 'pending', 'completed', 'failed', 'refunded'
  - `stripe_payment_id` (text)
  - `stripe_subscription_id` (text)
  - `payment_type` (text) - 'one_time', 'subscription'
  - `created_at` (timestamptz)
  
  ### 10. milestones
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `badge_icon` (text)
  - `achieved_at` (timestamptz)
  - `created_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Coaches can view/manage only their assigned clients
  - Clients can view/edit only their own data
  - Admins have full access
  - Public read access for testimonials (approved only)
*/

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('coach', 'client', 'admin')),
  full_name text NOT NULL,
  avatar_url text,
  bio text DEFAULT '',
  timezone text DEFAULT 'America/New_York',
  phone text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coaching_plans table
CREATE TABLE IF NOT EXISTS coaching_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  duration_weeks integer DEFAULT 12,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text DEFAULT '',
  recording_url text,
  created_at timestamptz DEFAULT now()
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text,
  content text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create client_modules junction table
CREATE TABLE IF NOT EXISTS client_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  is_unlocked boolean DEFAULT true,
  UNIQUE(client_id, module_id)
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  entry_text text DEFAULT '',
  audio_url text,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  is_reviewed boolean DEFAULT false,
  coach_feedback text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create client_progress table
CREATE TABLE IF NOT EXISTS client_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  tasks_completed integer DEFAULT 0,
  tasks_total integer DEFAULT 0,
  check_in_completed boolean DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_title text DEFAULT '',
  testimonial_text text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  image_url text,
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id text,
  stripe_subscription_id text,
  payment_type text DEFAULT 'one_time' CHECK (payment_type IN ('one_time', 'subscription')),
  created_at timestamptz DEFAULT now()
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  badge_icon text DEFAULT 'trophy',
  achieved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Coaches can view their clients"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'client' AND EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.coach_id = auth.uid()
      AND sessions.client_id = profiles.id
    )
  );

-- RLS Policies for coaching_plans table
CREATE POLICY "Coaches can view own plans"
  ON coaching_plans FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "Coaches can create own plans"
  ON coaching_plans FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update own plans"
  ON coaching_plans FOR UPDATE
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- RLS Policies for sessions table
CREATE POLICY "Coaches can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "Clients can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Coaches can manage own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- RLS Policies for modules table
CREATE POLICY "Coaches can view own modules"
  ON modules FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "Clients can view assigned modules"
  ON modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_modules
      WHERE client_modules.module_id = modules.id
      AND client_modules.client_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can create modules"
  ON modules FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update own modules"
  ON modules FOR UPDATE
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- RLS Policies for client_modules table
CREATE POLICY "Coaches can view client module assignments"
  ON client_modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      WHERE modules.id = client_modules.module_id
      AND modules.coach_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view own module assignments"
  ON client_modules FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Coaches can assign modules"
  ON client_modules FOR INSERT
  TO authenticated
  WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Clients can update completion status"
  ON client_modules FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- RLS Policies for journal_entries table
CREATE POLICY "Clients can view own journal entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Coaches can view client journal entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.coach_id = auth.uid()
      AND sessions.client_id = journal_entries.client_id
    )
  );

CREATE POLICY "Clients can create own journal entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Coaches can update journal feedback"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.coach_id = auth.uid()
      AND sessions.client_id = journal_entries.client_id
    )
  );

-- RLS Policies for client_progress table
CREATE POLICY "Clients can view own progress"
  ON client_progress FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Coaches can view client progress"
  ON client_progress FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "Coaches can create progress records"
  ON client_progress FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update progress records"
  ON client_progress FOR UPDATE
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- RLS Policies for testimonials table
CREATE POLICY "Anyone can view approved testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "Clients can create own testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Coaches can approve testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'coach'
    )
  );

-- RLS Policies for payments table
CREATE POLICY "Clients can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Coaches can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "System can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for milestones table
CREATE POLICY "Clients can view own milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Coaches can view client milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.coach_id = auth.uid()
      AND sessions.client_id = milestones.client_id
    )
  );

CREATE POLICY "Coaches can create client milestones"
  ON milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.coach_id = auth.uid()
      AND sessions.client_id = milestones.client_id
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_sessions_coach_id ON sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_client_modules_client_id ON client_modules(client_id);
CREATE INDEX IF NOT EXISTS idx_client_modules_module_id ON client_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_client_id ON journal_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved, is_featured);
