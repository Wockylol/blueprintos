import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Workspace } from '../../lib/supabase';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Palette,
  FileText,
  CreditCard,
  Eye,
  Sparkles
} from 'lucide-react';
import { generateLandingPageConfig, CoachingNiche, promptTemplates, toneOptions } from '../../lib/aiLandingPageGenerator';
import { generateSubdomainFromName, checkSubdomainAvailability } from '../../lib/workspace';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export function CoachOnboardingWizard() {
  const { profile, workspace, refreshWorkspace } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [launched, setLaunched] = useState(false);

  const [workspaceData, setWorkspaceData] = useState({
    name: '',
    subdomain: '',
    tagline: '',
    aboutText: '',
  });

  const [branding, setBranding] = useState({
    logoUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<CoachingNiche | ''>('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [generatingAI, setGeneratingAI] = useState(false);

  const [pricingTiers, setPricingTiers] = useState([
    { name: 'Starter', price: 497, duration: 4, features: ['2 x 1:1 Sessions', 'Custom Action Plan', 'Weekly Check-ins'] },
    { name: 'Elite', price: 1997, duration: 12, features: ['Weekly 1:1 Sessions', 'Full Module Access', 'Daily Accountability'], featured: true },
    { name: 'Mastermind', price: 4997, duration: 24, features: ['Everything in Elite', '2x Weekly Sessions', 'Group Mastermind'] },
  ]);

  const handleWorkspaceNameChange = async (name: string) => {
    setWorkspaceData({ ...workspaceData, name });
    const subdomain = generateSubdomainFromName(name);
    const available = await checkSubdomainAvailability(subdomain);
    if (available) {
      setWorkspaceData(prev => ({ ...prev, subdomain }));
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setGeneratingAI(true);
    try {
      const config = await generateLandingPageConfig(aiPrompt, selectedNiche || undefined, selectedTone);

      if (config.hero) {
        setWorkspaceData(prev => ({
          ...prev,
          tagline: config.hero!.subheadline,
        }));
      }

      if (config.about) {
        setWorkspaceData(prev => ({
          ...prev,
          aboutText: config.about!.description,
        }));
      }

      if (!profile?.workspace_id) {
        console.error('No workspace found');
        return;
      }

      await supabase
        .from('workspaces')
        .update({ landing_page_config: config })
        .eq('id', profile.workspace_id);

      alert('Landing page generated successfully!');
    } catch (error) {
      console.error('Error generating landing page:', error);
      alert('Failed to generate landing page. Using default template.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const saveStep = async () => {
    if (!profile?.workspace_id) return;

    setLoading(true);
    try {
      const updates: Partial<Workspace> = {};
      const stepUpdates: Record<string, boolean> = {};

      if (currentStep === 1) {
        updates.name = workspaceData.name;
        updates.subdomain = workspaceData.subdomain;
        stepUpdates.step1 = true;
      } else if (currentStep === 2) {
        updates.logo_url = branding.logoUrl;
        updates.primary_color = branding.primaryColor;
        updates.secondary_color = branding.secondaryColor;
        stepUpdates.step2 = true;
      } else if (currentStep === 3) {
        updates.tagline = workspaceData.tagline;
        updates.about_text = workspaceData.aboutText;
        stepUpdates.step3 = true;
      } else if (currentStep === 4) {
        stepUpdates.step4 = true;

        await Promise.all(
          pricingTiers.map((tier, index) =>
            supabase.from('pricing_tiers').insert({
              workspace_id: profile.workspace_id!,
              name: tier.name,
              price: tier.price,
              duration_weeks: tier.duration,
              features: tier.features,
              is_featured: tier.featured || false,
              order_index: index,
              is_active: true,
            })
          )
        );
      } else if (currentStep === 5) {
        stepUpdates.step5 = true;
      }

      const { data: currentWorkspace } = await supabase
        .from('workspaces')
        .select('onboarding_steps')
        .eq('id', profile.workspace_id)
        .single();

      await supabase
        .from('workspaces')
        .update({
          ...updates,
          onboarding_steps: {
            ...currentWorkspace?.onboarding_steps,
            ...stepUpdates,
          },
        })
        .eq('id', profile.workspace_id);

      await refreshWorkspace();
    } catch (error) {
      console.error('Error saving step:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    await saveStep();
    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      console.log('[Onboarding] Starting final completion...');
      await saveStep();

      if (!profile?.workspace_id) {
        console.error('[Onboarding] No workspace_id found on profile');
        alert('Error: Workspace not found. Please contact support.');
        setLoading(false);
        return;
      }

      console.log('[Onboarding] Updating workspace onboarding steps...');
      const { error: workspaceError } = await supabase
        .from('workspaces')
        .update({
          onboarding_steps: { step1: true, step2: true, step3: true, step4: true, step5: true, step6: true },
        })
        .eq('id', profile.workspace_id);

      if (workspaceError) {
        console.error('[Onboarding] Workspace update error:', workspaceError);
      }

      console.log('[Onboarding] Marking profile onboarding as complete...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', profile.id);

      if (profileError) {
        console.error('[Onboarding] Profile update error:', profileError);
        alert('Error completing onboarding. Please try again.');
        setLoading(false);
        return;
      }

      console.log('[Onboarding] Onboarding complete! Refreshing workspace...');
      await refreshWorkspace();

      setLoading(false);
      setLaunched(true);
    } catch (error) {
      console.error('[Onboarding] Exception during completion:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Business Info', icon: FileText },
    { number: 2, title: 'Branding', icon: Palette },
    { number: 3, title: 'Landing Page', icon: Sparkles },
    { number: 4, title: 'Pricing', icon: CreditCard },
    { number: 5, title: 'Stripe Connect', icon: CreditCard },
    { number: 6, title: 'Review', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="card-glass p-8">
          <div className="mb-8">
            <h1 className="text-white mb-2">Welcome to BlueprintOS</h1>
            <p className="text-gray-400">Set up your coaching workspace in 6 quick steps</p>
          </div>

          <div className="flex items-center justify-between mb-12">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      currentStep === step.number
                        ? 'bg-gradient-blue text-white'
                        : currentStep > step.number
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-700 text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs text-gray-400 text-center">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-12 mx-2 mb-6 ${
                      currentStep > step.number ? 'bg-primary-500' : 'bg-dark-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-white mb-4">Business Information</h2>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceData.name}
                    onChange={(e) => handleWorkspaceNameChange(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    placeholder="Your Coaching Business"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Subdomain</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={workspaceData.subdomain}
                      onChange={(e) => setWorkspaceData({ ...workspaceData, subdomain: e.target.value })}
                      className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-l-lg text-white focus:border-primary-500 focus:outline-none"
                      placeholder="yourname"
                    />
                    <span className="px-4 py-3 bg-dark-700 border border-dark-700 rounded-r-lg text-gray-400">
                      .blueprintos.com
                    </span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-white mb-4">Branding</h2>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Logo URL</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={branding.logoUrl}
                      onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                      className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      placeholder="https://example.com/logo.png"
                    />
                    <button className="btn-secondary flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Primary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Secondary Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-white mb-4">AI Landing Page Builder</h2>
                <p className="text-gray-400 mb-4">
                  Describe your coaching business and we'll generate a professional landing page for you
                </p>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Coaching Niche (Optional)</label>
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
                    <p className="text-sm text-gray-400 mb-2">Template:</p>
                    <p className="text-white">{promptTemplates[selectedNiche as CoachingNiche]}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Describe Your Coaching Business</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    placeholder="I help busy professionals lose weight and build confidence through sustainable fitness habits and mindset coaching..."
                  />
                </div>

                <button
                  onClick={handleGenerateWithAI}
                  disabled={!aiPrompt.trim() || generatingAI}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{generatingAI ? 'Generating...' : 'Generate Landing Page with AI'}</span>
                </button>

                <div className="space-y-4 pt-6 border-t border-dark-700">
                  <h3 className="text-lg text-white">Manual Entry</h3>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={workspaceData.tagline}
                      onChange={(e) => setWorkspaceData({ ...workspaceData, tagline: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      placeholder="Transform your life with elite coaching"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">About Text</label>
                    <textarea
                      value={workspaceData.aboutText}
                      onChange={(e) => setWorkspaceData({ ...workspaceData, aboutText: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                      placeholder="Describe your coaching approach and what makes you unique..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-white mb-4">Pricing Tiers</h2>
                <p className="text-gray-400 mb-6">Define your coaching packages</p>

                {pricingTiers.map((tier, index) => (
                  <div key={index} className="p-6 bg-dark-800/50 rounded-lg border border-dark-700 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Package Name</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => {
                            const updated = [...pricingTiers];
                            updated[index].name = e.target.value;
                            setPricingTiers(updated);
                          }}
                          className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Price ($)</label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => {
                            const updated = [...pricingTiers];
                            updated[index].price = parseInt(e.target.value);
                            setPricingTiers(updated);
                          }}
                          className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Duration (weeks)</label>
                        <input
                          type="number"
                          value={tier.duration}
                          onChange={(e) => {
                            const updated = [...pricingTiers];
                            updated[index].duration = parseInt(e.target.value);
                            setPricingTiers(updated);
                          }}
                          className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6 text-center">
                <h2 className="text-2xl text-white mb-4">Connect Stripe</h2>
                <p className="text-gray-400 mb-6">
                  Connect your Stripe account to accept payments from clients
                </p>
                <div className="p-8 bg-dark-800/50 rounded-lg border border-dark-700">
                  <CreditCard className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                  <p className="text-white mb-6">Stripe Connect integration coming soon</p>
                  <button className="btn-secondary">Skip for Now</button>
                </div>
              </div>
            )}

            {currentStep === 6 && !launched && (
              <div className="space-y-6">
                <h2 className="text-2xl text-white mb-4">Review & Launch</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                    <h3 className="text-white mb-2">Workspace</h3>
                    <p className="text-gray-400">{workspaceData.name}</p>
                    <p className="text-sm text-primary-400">{workspaceData.subdomain}.blueprintos.com</p>
                  </div>
                  <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                    <h3 className="text-white mb-2">Pricing Tiers</h3>
                    <p className="text-gray-400">{pricingTiers.length} packages configured</p>
                  </div>
                  <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                    <h3 className="text-white mb-2">Status</h3>
                    <p className="text-primary-400">Ready to launch!</p>
                  </div>
                </div>
                <button
                  onClick={completeOnboarding}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Launching...</span>
                    </>
                  ) : (
                    <span>Launch My Workspace</span>
                  )}
                </button>
              </div>
            )}

            {currentStep === 6 && launched && (
              <div className="space-y-8 text-center py-8">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-gradient-blue rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl text-white mb-2">🎉 Workspace Launched!</h2>
                  <p className="text-xl text-gray-400">
                    Your coaching platform is now live at{' '}
                    <span className="text-primary-400 font-medium">blueprintos.com</span>
                  </p>
                </div>

                {workspace?.subdomain && (
                  <div className="p-6 bg-dark-800/50 rounded-lg border border-dark-700">
                    <p className="text-sm text-gray-400 mb-2">Your Live Site:</p>
                    <a
                      href={`https://${workspace.subdomain}.blueprintos.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 text-lg font-medium underline inline-flex items-center space-x-2"
                    >
                      <span>{workspace.subdomain}.blueprintos.com</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2"
                  >
                    <span>Go to My Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full sm:w-auto px-6 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>

          {!launched && (
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-dark-700">
              <button
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              {currentStep < 6 ? (
                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>{loading ? 'Saving...' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
