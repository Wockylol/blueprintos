import { LandingPageConfig } from '../../lib/supabase';
import * as Icons from 'lucide-react';

type HowItWorksSectionProps = {
  config: NonNullable<LandingPageConfig['how_it_works']>;
};

export function HowItWorksSection({ config }: HowItWorksSectionProps) {
  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Circle;
    return Icon;
  };

  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-white">{config.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {config.steps.map((step, index) => {
            const Icon = getIcon(step.icon_name);
            return (
              <div
                key={index}
                className="card-glass text-center hover:shadow-glow-blue transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                  {index + 1}
                </div>
                <div className="mb-4">
                  <Icon className="w-8 h-8 text-primary-500 mx-auto" />
                </div>
                <h3 className="text-2xl mb-4 text-white">{step.title}</h3>
                <p className="text-gray-400" style={{ lineHeight: '1.5' }}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
