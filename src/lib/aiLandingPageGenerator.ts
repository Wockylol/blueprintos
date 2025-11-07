import { LandingPageConfig } from './supabase';

export type CoachingNiche =
  | 'fitness'
  | 'business'
  | 'mindset'
  | 'career'
  | 'relationships'
  | 'trauma'
  | 'spirituality'
  | 'life'
  | 'executive'
  | 'health';

export const promptTemplates: Record<CoachingNiche, string> = {
  fitness: 'I help [target audience] achieve [fitness goals] through [training method]',
  business: 'I help [business owners/entrepreneurs] grow [revenue/scale] through [strategy]',
  mindset: 'I help [professionals/individuals] overcome [limiting beliefs] through [transformation approach]',
  career: 'I help [professionals] transition to [career goals] through [method]',
  relationships: 'I help [couples/individuals] build [relationship outcome] through [coaching style]',
  trauma: 'I help [trauma survivors] heal from [specific trauma] through [healing modality]',
  spirituality: 'I help [seekers] connect with [spiritual goal] through [practice]',
  life: 'I help [demographic] navigate [life transition] through [coaching approach]',
  executive: 'I help [executives/leaders] achieve [leadership goal] through [executive coaching method]',
  health: 'I help [health-conscious individuals] improve [health outcome] through [wellness approach]'
};

export const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'motivational', label: 'Motivational' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'clinical', label: 'Clinical' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'empowering', label: 'Empowering' }
];

export async function generateLandingPageConfig(
  prompt: string,
  niche?: CoachingNiche,
  tone?: string
): Promise<LandingPageConfig> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OpenAI API key not configured, using fallback template');
    return generateFallbackConfig(prompt, niche);
  }

  try {
    const systemPrompt = `You are an expert landing page copywriter specializing in coaching businesses.
Convert the user's coaching description into a structured landing page configuration.

Extract:
1. A compelling headline (5-10 words, benefit-focused)
2. A subheadline (15-25 words, explaining the transformation)
3. Primary CTA text (2-4 words, action-oriented)
4. Secondary CTA text (2-4 words)
5. About section (title, 2-3 sentence description, 3 bullet points)
6. How it works (3 steps with titles and descriptions)
7. Suggest appropriate icon names from lucide-react

Tone: ${tone || 'professional and motivational'}
Niche: ${niche || 'general coaching'}

Return valid JSON matching this structure:
{
  "hero": {
    "headline": "string",
    "subheadline": "string",
    "cta_primary_text": "string",
    "cta_secondary_text": "string",
    "background_style": "gradient"
  },
  "about": {
    "title": "string",
    "description": "string",
    "bullet_points": ["string", "string", "string"],
    "image_placement": "right"
  },
  "how_it_works": {
    "title": "How It Works",
    "steps": [
      {"title": "string", "description": "string", "icon_name": "Calendar"},
      {"title": "string", "description": "string", "icon_name": "BookOpen"},
      {"title": "string", "description": "string", "icon_name": "TrendingUp"}
    ]
  },
  "sections_enabled": ["hero", "about", "how_it_works", "testimonials", "pricing", "cta"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedConfig = JSON.parse(data.choices[0].message.content);

    return {
      ...generatedConfig,
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
      override_fields: {}
    };
  } catch (error) {
    console.error('Error generating landing page config:', error);
    return generateFallbackConfig(prompt, niche);
  }
}

function generateFallbackConfig(prompt: string, niche?: CoachingNiche): LandingPageConfig {
  const nicheDefaults: Record<CoachingNiche, Partial<LandingPageConfig>> = {
    fitness: {
      hero: {
        headline: 'Transform Your Fitness Journey',
        subheadline: 'Achieve your goals with personalized training and expert guidance',
        cta_primary_text: 'Start Training',
        cta_secondary_text: 'View Programs',
        background_style: 'gradient'
      }
    },
    business: {
      hero: {
        headline: 'Scale Your Business with Confidence',
        subheadline: 'Strategic coaching for entrepreneurs ready to break through plateaus',
        cta_primary_text: 'Book Strategy Call',
        cta_secondary_text: 'Learn More',
        background_style: 'gradient'
      }
    },
    mindset: {
      hero: {
        headline: 'Unlock Your Limitless Potential',
        subheadline: 'Transform limiting beliefs into unstoppable momentum',
        cta_primary_text: 'Begin Transformation',
        cta_secondary_text: 'How It Works',
        background_style: 'gradient'
      }
    },
    career: {
      hero: {
        headline: 'Navigate Your Career Transition',
        subheadline: 'Expert guidance to land your dream role and advance your career',
        cta_primary_text: 'Start Your Journey',
        cta_secondary_text: 'View Success Stories',
        background_style: 'gradient'
      }
    },
    relationships: {
      hero: {
        headline: 'Build Deeper Connections',
        subheadline: 'Transform your relationships through communication and understanding',
        cta_primary_text: 'Get Started',
        cta_secondary_text: 'Learn Our Method',
        background_style: 'gradient'
      }
    },
    trauma: {
      hero: {
        headline: 'Healing Is Possible',
        subheadline: 'Compassionate, trauma-informed support for your healing journey',
        cta_primary_text: 'Begin Healing',
        cta_secondary_text: 'About Our Approach',
        background_style: 'gradient'
      }
    },
    spirituality: {
      hero: {
        headline: 'Awaken Your Spiritual Path',
        subheadline: 'Discover deeper meaning and connection in your life',
        cta_primary_text: 'Start Your Practice',
        cta_secondary_text: 'Explore',
        background_style: 'gradient'
      }
    },
    life: {
      hero: {
        headline: 'Navigate Life\'s Transitions',
        subheadline: 'Expert coaching for the moments that matter most',
        cta_primary_text: 'Book Your Session',
        cta_secondary_text: 'Learn More',
        background_style: 'gradient'
      }
    },
    executive: {
      hero: {
        headline: 'Lead with Impact',
        subheadline: 'Executive coaching for leaders driving organizational transformation',
        cta_primary_text: 'Schedule Consultation',
        cta_secondary_text: 'Our Approach',
        background_style: 'gradient'
      }
    },
    health: {
      hero: {
        headline: 'Optimize Your Wellbeing',
        subheadline: 'Holistic health coaching for sustainable lifestyle transformation',
        cta_primary_text: 'Start Your Plan',
        cta_secondary_text: 'View Programs',
        background_style: 'gradient'
      }
    }
  };

  const baseConfig: LandingPageConfig = {
    hero: {
      headline: 'Transform Your Life',
      subheadline: 'Elite coaching for high performers ready to level up',
      cta_primary_text: 'Get Started',
      cta_secondary_text: 'Learn More',
      background_style: 'gradient'
    },
    about: {
      title: 'About Your Coach',
      description: prompt.length > 50 ? prompt.substring(0, 200) : 'Experience transformation through proven coaching methodologies tailored to your unique goals.',
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
          description: 'Schedule a discovery session to discuss your goals and challenges',
          icon_name: 'Calendar'
        },
        {
          title: 'Get Your Plan',
          description: 'Receive a personalized coaching roadmap designed for you',
          icon_name: 'BookOpen'
        },
        {
          title: 'Transform',
          description: 'Execute with guidance, support, and accountability',
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
    sections_enabled: ['hero', 'about', 'how_it_works', 'testimonials', 'pricing', 'cta'],
    override_fields: {}
  };

  if (niche && nicheDefaults[niche]) {
    return {
      ...baseConfig,
      ...nicheDefaults[niche]
    };
  }

  return baseConfig;
}

export async function saveGeneratedConfig(
  workspaceId: string,
  prompt: string,
  config: LandingPageConfig
) {
  const { supabase } = await import('./supabase');

  await supabase
    .from('landing_page_prompts')
    .update({ is_active: false })
    .eq('workspace_id', workspaceId);

  const { data, error } = await supabase
    .from('landing_page_prompts')
    .insert({
      workspace_id: workspaceId,
      prompt_text: prompt,
      generated_config: config,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('workspaces')
    .update({ landing_page_config: config })
    .eq('id', workspaceId);

  return data;
}
