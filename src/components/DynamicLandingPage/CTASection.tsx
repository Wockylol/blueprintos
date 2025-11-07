import { Workspace } from '../../lib/supabase';
import { ArrowRight } from 'lucide-react';

type CTASectionProps = {
  workspace: Workspace;
  onGetStarted: () => void;
};

export function CTASection({ workspace, onGetStarted }: CTASectionProps) {
  return (
    <section className="py-20 px-6 bg-dark-800/30">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="mb-6 text-white">Ready to Transform?</h2>
        <p className="text-xl text-gray-400 mb-8" style={{ lineHeight: '1.5' }}>
          {workspace.tagline || 'Your transformation starts with a single decision. Get started today.'}
        </p>
        <button onClick={onGetStarted} className="btn-primary flex items-center space-x-2 mx-auto">
          <span>Start Your Journey</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
