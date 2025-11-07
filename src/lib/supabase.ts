import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  role: 'coach' | 'client' | 'admin' | 'superadmin';
  full_name: string;
  avatar_url: string | null;
  bio: string;
  timezone: string;
  phone: string | null;
  onboarding_completed: boolean;
  workspace_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Workspace = {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  owner_id: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  tagline: string;
  about_text: string;
  landing_page_config: LandingPageConfig;
  onboarding_steps: OnboardingSteps;
  stripe_account_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LandingPageConfig = {
  hero?: {
    headline: string;
    subheadline: string;
    cta_primary_text: string;
    cta_secondary_text: string;
    background_style: string;
    hero_image_url?: string;
  };
  about?: {
    title: string;
    description: string;
    bullet_points: string[];
    image_placement: 'left' | 'right' | 'none';
  };
  how_it_works?: {
    title: string;
    steps: Array<{
      title: string;
      description: string;
      icon_name: string;
    }>;
  };
  testimonials?: {
    layout: 'slider' | 'grid' | 'single';
    max_visible: number;
    rotation_enabled: boolean;
  };
  pricing_display?: {
    layout_style: 'cards' | 'table' | 'simple';
    show_comparison: boolean;
    highlight_tier?: string;
  };
  theme?: {
    primary_color: string;
    secondary_color: string;
    font_pairing: string;
    button_style: string;
  };
  sections_enabled: string[];
  override_fields?: Record<string, string>;
};

export type OnboardingSteps = {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
  step5: boolean;
  step6: boolean;
};

export type WorkspaceSubscription = {
  id: string;
  workspace_id: string;
  plan_tier: 'starter' | 'pro' | 'enterprise';
  stripe_subscription_id: string | null;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  billing_cycle: 'monthly' | 'annual';
  mrr: number;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type PricingTier = {
  id: string;
  workspace_id: string;
  name: string;
  price: number;
  currency: string;
  duration_weeks: number;
  features: string[];
  is_featured: boolean;
  order_index: number;
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type LandingPagePrompt = {
  id: string;
  workspace_id: string;
  prompt_text: string;
  generated_config: LandingPageConfig;
  is_active: boolean;
  created_at: string;
};

export type AIGenerationLog = {
  id: string;
  workspace_id: string;
  prompt_type: string;
  tokens_used: number;
  cost: number;
  created_at: string;
};

export type CoachingPlan = {
  id: string;
  coach_id: string;
  title: string;
  description: string;
  duration_weeks: number;
  is_active: boolean;
  created_at: string;
};

export type Session = {
  id: string;
  coach_id: string;
  client_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  recording_url: string | null;
  created_at: string;
};

export type Module = {
  id: string;
  coach_id: string;
  title: string;
  description: string;
  video_url: string | null;
  content: string;
  order_index: number;
  created_at: string;
};

export type ClientModule = {
  id: string;
  client_id: string;
  module_id: string;
  assigned_by: string | null;
  assigned_at: string;
  completed_at: string | null;
  is_unlocked: boolean;
};

export type JournalEntry = {
  id: string;
  client_id: string;
  entry_text: string;
  audio_url: string | null;
  mood_rating: number | null;
  is_reviewed: boolean;
  coach_feedback: string;
  created_at: string;
};

export type ClientProgress = {
  id: string;
  client_id: string;
  coach_id: string;
  week_number: number;
  tasks_completed: number;
  tasks_total: number;
  check_in_completed: boolean;
  notes: string;
  created_at: string;
};

export type Testimonial = {
  id: string;
  client_id: string | null;
  client_name: string;
  client_title: string;
  testimonial_text: string;
  rating: number;
  image_url: string | null;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
};

export type Payment = {
  id: string;
  client_id: string;
  coach_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_id: string | null;
  stripe_subscription_id: string | null;
  payment_type: 'one_time' | 'subscription';
  created_at: string;
};

export type Milestone = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  badge_icon: string;
  achieved_at: string;
  created_at: string;
};
