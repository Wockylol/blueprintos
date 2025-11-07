import { supabase, Workspace, LandingPageConfig } from './supabase';

export function getSubdomainFromHost(hostname: string): string | null {
  const parts = hostname.split('.');

  if (parts.length < 2) return null;

  if (parts.length === 2) return null;

  const subdomain = parts[0];

  if (subdomain === 'www' || subdomain === 'app' || subdomain === 'admin') {
    return null;
  }

  return subdomain;
}

export async function getWorkspaceBySubdomain(subdomain: string): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching workspace by subdomain:', error);
    return null;
  }

  return data;
}

export async function getWorkspaceByCustomDomain(domain: string): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('custom_domain', domain)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching workspace by custom domain:', error);
    return null;
  }

  return data;
}

export async function resolveWorkspace(): Promise<Workspace | null> {
  const hostname = window.location.hostname;

  const customWorkspace = await getWorkspaceByCustomDomain(hostname);
  if (customWorkspace) return customWorkspace;

  const subdomain = getSubdomainFromHost(hostname);
  if (!subdomain) return null;

  return getWorkspaceBySubdomain(subdomain);
}

export function generateSubdomainFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30);
}

export async function checkSubdomainAvailability(subdomain: string): Promise<boolean> {
  const { data } = await supabase
    .from('workspaces')
    .select('id')
    .eq('subdomain', subdomain)
    .maybeSingle();

  return !data;
}

export function applyWorkspaceTheme(workspace: Workspace) {
  const root = document.documentElement;

  root.style.setProperty('--workspace-primary', workspace.primary_color);
  root.style.setProperty('--workspace-secondary', workspace.secondary_color);

  if (workspace.landing_page_config?.theme?.primary_color) {
    root.style.setProperty('--workspace-primary', workspace.landing_page_config.theme.primary_color);
  }
  if (workspace.landing_page_config?.theme?.secondary_color) {
    root.style.setProperty('--workspace-secondary', workspace.landing_page_config.theme.secondary_color);
  }
}

export function getDefaultLandingPageConfig(): LandingPageConfig {
  return {
    hero: {
      headline: 'Transform Your Life',
      subheadline: 'Elite coaching for high performers ready to level up',
      cta_primary_text: 'Start Your Journey',
      cta_secondary_text: 'Learn More',
      background_style: 'gradient'
    },
    about: {
      title: 'About Your Coach',
      description: 'Experience transformation through proven coaching methodologies.',
      bullet_points: [
        'Personalized coaching plans',
        'Weekly 1:1 sessions',
        'Progress tracking and accountability'
      ],
      image_placement: 'right'
    },
    how_it_works: {
      title: 'How It Works',
      steps: [
        {
          title: 'Book Your Call',
          description: 'Schedule a discovery session to discuss your goals',
          icon_name: 'Calendar'
        },
        {
          title: 'Get Your Plan',
          description: 'Receive a personalized coaching roadmap',
          icon_name: 'BookOpen'
        },
        {
          title: 'Transform',
          description: 'Execute with guidance and accountability',
          icon_name: 'TrendingUp'
        }
      ]
    },
    testimonials: {
      layout: 'slider',
      max_visible: 3,
      rotation_enabled: true
    },
    pricing_display: {
      layout_style: 'cards',
      show_comparison: false
    },
    theme: {
      primary_color: '#3B82F6',
      secondary_color: '#8B5CF6',
      font_pairing: 'inter',
      button_style: 'rounded'
    },
    sections_enabled: ['hero', 'about', 'how_it_works', 'testimonials', 'pricing', 'cta']
  };
}
