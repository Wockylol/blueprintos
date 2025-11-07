import { useState } from 'react';
import { Globe, Sparkles, Eye } from 'lucide-react';

export function FunnelBuilderSection() {
  const [generating, setGenerating] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Website Builder</h2>
        <p className="text-gray-400">Generate a professional landing page with AI</p>
      </div>

      <div className="card-glass p-8 text-center">
        <div className="w-20 h-20 bg-gradient-violet rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">AI Landing Page Generator</h3>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Describe your coaching business and our AI will create a beautiful, conversion-optimized landing page
          complete with hero section, about, offers, testimonials, and CTA.
        </p>

        <div className="max-w-2xl mx-auto mb-6">
          <textarea
            rows={4}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
            placeholder="I help busy professionals lose weight through sustainable fitness habits and mindset coaching. I've worked with 50+ clients, average result is 20lbs in 12 weeks..."
          />
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setGenerating(true)}
            disabled={generating}
            className="btn-primary flex items-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{generating ? 'Generating...' : 'Generate Landing Page'}</span>
          </button>
          <button className="btn-secondary flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Preview Current Page</span>
          </button>
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Landing Page</h3>
        <div className="aspect-video bg-dark-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No landing page generated yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
