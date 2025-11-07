import { useEffect, useState } from 'react';
import { Workspace, PricingTier, Testimonial } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { HeroSection } from './HeroSection';
import { AboutSection } from './AboutSection';
import { HowItWorksSection } from './HowItWorksSection';
import { TestimonialsSection } from './TestimonialsSection';
import { PricingSection } from './PricingSection';
import { CTASection } from './CTASection';
import { applyWorkspaceTheme } from '../../lib/workspace';

type DynamicLandingPageProps = {
  workspace: Workspace;
  onGetStarted: () => void;
};

export function DynamicLandingPage({ workspace, onGetStarted }: DynamicLandingPageProps) {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    applyWorkspaceTheme(workspace);
    loadWorkspaceData();
  }, [workspace]);

  const loadWorkspaceData = async () => {
    const { data: tiers } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('workspace_id', workspace.id)
      .eq('is_active', true)
      .order('order_index');

    if (tiers) setPricingTiers(tiers);

    const { data: testimonialData } = await supabase
      .from('testimonials')
      .select('*')
      .eq('workspace_id', workspace.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (testimonialData) setTestimonials(testimonialData);
  };

  const config = workspace.landing_page_config || {};
  const sectionsEnabled = config.sections_enabled || ['hero', 'about', 'how_it_works', 'testimonials', 'pricing', 'cta'];

  return (
    <div className="min-h-screen bg-gradient-luxury">
      {sectionsEnabled.includes('hero') && (
        <HeroSection
          workspace={workspace}
          config={config.hero}
          onGetStarted={onGetStarted}
        />
      )}

      {sectionsEnabled.includes('about') && config.about && (
        <AboutSection workspace={workspace} config={config.about} />
      )}

      {sectionsEnabled.includes('how_it_works') && config.how_it_works && (
        <HowItWorksSection config={config.how_it_works} />
      )}

      {sectionsEnabled.includes('testimonials') && testimonials.length > 0 && (
        <TestimonialsSection
          testimonials={testimonials}
          config={config.testimonials}
        />
      )}

      {sectionsEnabled.includes('pricing') && pricingTiers.length > 0 && (
        <PricingSection
          tiers={pricingTiers}
          config={config.pricing_display}
          onGetStarted={onGetStarted}
        />
      )}

      {sectionsEnabled.includes('cta') && (
        <CTASection workspace={workspace} onGetStarted={onGetStarted} />
      )}
    </div>
  );
}
