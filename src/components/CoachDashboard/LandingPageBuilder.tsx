import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Eye, Save, RefreshCw } from 'lucide-react';
import {
  generateLandingPageConfig,
  saveGeneratedConfig,
  CoachingNiche,
  promptTemplates,
  toneOptions
} from '../../lib/aiLandingPageGenerator';
import { LandingPageConfig } from '../../lib/supabase';

export function LandingPageBuilder() {
  const { workspace, refreshWorkspace } = useAuth();
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<CoachingNiche | ''>('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<LandingPageConfig | null>(null);

  const handleGenerate = async () => {
    if (!aiPrompt.trim() || !workspace) return;

    setGenerating(true);
    try {
      const config = await generateLandingPageConfig(
        aiPrompt,
        selectedNiche || undefined,
        selectedTone
      );
      setPreviewConfig(config);
    } catch (error) {
      console.error('Error generating config:', error);
      alert('Failed to generate landing page. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!previewConfig || !workspace) return;

    setSaving(true);
    try {
      await saveGeneratedConfig(workspace.id, aiPrompt, previewConfig);
      await refreshWorkspace();
      alert('Landing page saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save landing page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-glass">
        <h2 className="text-2xl text-white mb-6">AI Landing Page Builder</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Coaching Niche</label>
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value as CoachingNiche)}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
            >
              <option value="">Select a niche...</option>
              <option value="fitness">Fitness</option>
              <option value="business">Business</option>
              <option value="mindset">Mindset</option>
              <option value="career">Career</option>
              <option value="relationships">Relationships</option>
              <option value="trauma">Trauma</option>
              <option value="spirituality">Spirituality</option>
              <option value="life">Life</option>
              <option value="executive">Executive</option>
              <option value="health">Health</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Tone</label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
            >
              {toneOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {selectedNiche && (
            <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
              <p className="text-sm text-gray-400 mb-2">Template Example:</p>
              <p className="text-white">{promptTemplates[selectedNiche as CoachingNiche]}</p>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Describe Your Coaching Business
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
              placeholder="I help busy professionals lose weight and build confidence through sustainable fitness habits and mindset coaching. My unique approach combines..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleGenerate}
              disabled={!aiPrompt.trim() || generating}
              className="btn-primary flex items-center space-x-2 flex-1"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate with AI</span>
                </>
              )}
            </button>

            {previewConfig && (
              <>
                <button className="btn-secondary flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {previewConfig && (
        <div className="card-glass">
          <h3 className="text-xl text-white mb-4">Generated Content Preview</h3>
          <div className="space-y-6">
            {previewConfig.hero && (
              <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                <h4 className="text-white font-semibold mb-2">Hero Section</h4>
                <p className="text-gray-300 mb-2">
                  <strong>Headline:</strong> {previewConfig.hero.headline}
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Subheadline:</strong> {previewConfig.hero.subheadline}
                </p>
                <p className="text-gray-300">
                  <strong>CTA:</strong> {previewConfig.hero.cta_primary_text}
                </p>
              </div>
            )}

            {previewConfig.about && (
              <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                <h4 className="text-white font-semibold mb-2">About Section</h4>
                <p className="text-gray-300 mb-2">
                  <strong>Title:</strong> {previewConfig.about.title}
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Description:</strong> {previewConfig.about.description}
                </p>
                <ul className="text-gray-300 space-y-1">
                  {previewConfig.about.bullet_points.map((point, i) => (
                    <li key={i}>• {point}</li>
                  ))}
                </ul>
              </div>
            )}

            {previewConfig.how_it_works && (
              <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                <h4 className="text-white font-semibold mb-2">How It Works</h4>
                {previewConfig.how_it_works.steps.map((step, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-gray-300">
                      <strong>Step {i + 1}:</strong> {step.title} - {step.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {workspace?.landing_page_config && (
        <div className="card-glass">
          <h3 className="text-xl text-white mb-4">Current Landing Page</h3>
          <p className="text-gray-400 mb-4">
            Your published landing page is live at:
          </p>
          <a
            href={`https://${workspace.subdomain}.blueprintos.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 underline"
          >
            {workspace.subdomain}.blueprintos.com
          </a>
        </div>
      )}
    </div>
  );
}
