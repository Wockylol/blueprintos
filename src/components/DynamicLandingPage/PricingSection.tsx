import { PricingTier, LandingPageConfig } from '../../lib/supabase';
import { Check } from 'lucide-react';

type PricingSectionProps = {
  tiers: PricingTier[];
  config?: LandingPageConfig['pricing_display'];
  onGetStarted: () => void;
};

export function PricingSection({ tiers, config, onGetStarted }: PricingSectionProps) {
  const layoutStyle = config?.layout_style || 'cards';

  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-white">Choose Your Path</h2>
          <p className="text-xl text-gray-400">Investment in your transformation</p>
        </div>
        <div className={`grid grid-cols-1 ${tiers.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-8 max-w-6xl mx-auto`}>
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`card-glass hover:scale-105 transition-all duration-300 ${
                tier.is_featured ? 'border-2 border-primary-500 relative' : ''
              }`}
            >
              {tier.is_featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-blue px-4 py-1 rounded-full text-sm font-semibold text-white">
                  MOST POPULAR
                </div>
              )}
              <div className="text-sm text-primary-400 font-semibold mb-2">
                {tier.name.toUpperCase()}
              </div>
              <div className="text-4xl font-bold text-white mb-4">
                ${tier.price.toLocaleString()}
              </div>
              <div className="text-gray-400 mb-6">{tier.duration_weeks} Weeks</div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className={tier.is_featured ? 'btn-primary w-full' : 'btn-secondary w-full'}
              >
                {tier.is_featured ? 'Get Started' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
