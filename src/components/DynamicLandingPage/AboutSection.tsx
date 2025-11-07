import { Workspace, LandingPageConfig } from '../../lib/supabase';
import { CheckCircle } from 'lucide-react';

type AboutSectionProps = {
  workspace: Workspace;
  config: NonNullable<LandingPageConfig['about']>;
};

export function AboutSection({ workspace, config }: AboutSectionProps) {
  return (
    <section id="about" className="py-20 px-6 bg-dark-800/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="mb-6 text-white">{config.title}</h2>
            <p className="text-xl text-gray-400 mb-8" style={{ lineHeight: '1.5' }}>
              {config.description || workspace.about_text}
            </p>
            <div className="space-y-4">
              {config.bullet_points.map((point, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-300 text-lg">{point}</span>
                </div>
              ))}
            </div>
          </div>
          {config.image_placement !== 'none' && (
            <div className={`${config.image_placement === 'left' ? 'lg:order-first' : ''}`}>
              <div className="aspect-square bg-gradient-blue rounded-2xl" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
