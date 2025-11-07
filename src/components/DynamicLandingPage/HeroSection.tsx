import { ArrowRight, PlayCircle, Award } from 'lucide-react';
import { Workspace, LandingPageConfig } from '../../lib/supabase';

type HeroSectionProps = {
  workspace: Workspace;
  config?: LandingPageConfig['hero'];
  onGetStarted: () => void;
};

export function HeroSection({ workspace, config, onGetStarted }: HeroSectionProps) {
  const headline = config?.headline || 'Transform Your Life';
  const subheadline = config?.subheadline || workspace.tagline || 'Elite coaching for high performers ready to level up';
  const ctaPrimary = config?.cta_primary_text || 'Get Started';
  const ctaSecondary = config?.cta_secondary_text || 'Learn More';

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {workspace.logo_url ? (
              <img src={workspace.logo_url} alt={workspace.name} className="w-10 h-10 rounded-lg" />
            ) : (
              <div className="w-10 h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            )}
            <span className="text-2xl font-bold gradient-text">{workspace.name}</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-gray-300 hover:text-primary-400 transition-colors">
              About
            </a>
            <a href="#how-it-works" className="text-gray-300 hover:text-primary-400 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-primary-400 transition-colors">
              Pricing
            </a>
          </div>
          <button onClick={onGetStarted} className="btn-primary">
            Apply
          </button>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="mb-6">
              <span className="block text-white">{headline}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto" style={{ lineHeight: '1.5' }}>
              {subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button onClick={onGetStarted} className="btn-primary flex items-center space-x-2">
                <span>{ctaPrimary}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <PlayCircle className="w-5 h-5" />
                <span>{ctaSecondary}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
