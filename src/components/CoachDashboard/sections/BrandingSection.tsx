import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Upload, Save, Check } from 'lucide-react';
import { generateSubdomainFromName, checkSubdomainAvailability } from '../../../lib/workspace';

export function BrandingSection() {
  const { profile, workspace, refreshWorkspace } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [branding, setBranding] = useState({
    name: workspace?.name || '',
    subdomain: workspace?.subdomain || '',
    tagline: workspace?.tagline || '',
    bio: workspace?.about_text || '',
    logoUrl: workspace?.logo_url || '',
    primaryColor: workspace?.primary_color || '#3B82F6',
    secondaryColor: workspace?.secondary_color || '#8B5CF6',
    niche: '',
  });

  useEffect(() => {
    if (workspace) {
      setBranding({
        name: workspace.name || '',
        subdomain: workspace.subdomain || '',
        tagline: workspace.tagline || '',
        bio: workspace.about_text || '',
        logoUrl: workspace.logo_url || '',
        primaryColor: workspace.primary_color || '#3B82F6',
        secondaryColor: workspace.secondary_color || '#8B5CF6',
        niche: '',
      });
    }
  }, [workspace]);

  const handleNameChange = async (name: string) => {
    setBranding({ ...branding, name });
    if (!workspace?.subdomain || workspace.subdomain === generateSubdomainFromName(workspace.name)) {
      const subdomain = generateSubdomainFromName(name);
      const available = await checkSubdomainAvailability(subdomain);
      if (available) {
        setBranding(prev => ({ ...prev, subdomain }));
      }
    }
  };

  const handleSave = async () => {
    if (!workspace?.id) return;

    setLoading(true);
    setSaved(false);

    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: branding.name,
          subdomain: branding.subdomain,
          tagline: branding.tagline,
          about_text: branding.bio,
          logo_url: branding.logoUrl,
          primary_color: branding.primaryColor,
          secondary_color: branding.secondaryColor,
        })
        .eq('id', workspace.id);

      if (error) throw error;

      await refreshWorkspace();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Failed to save branding settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Branding Setup</h2>
          <p className="text-gray-400">Customize your workspace appearance and identity</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || saved}
          className="btn-primary flex items-center space-x-2"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </>
          )}
        </button>
      </div>

      <div className="card-glass p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Business Name</label>
              <input
                type="text"
                value={branding.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                placeholder="Your Coaching Business"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Subdomain</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={branding.subdomain}
                  onChange={(e) => setBranding({ ...branding, subdomain: e.target.value })}
                  className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-l-lg text-white focus:border-primary-500 focus:outline-none"
                  placeholder="yourname"
                />
                <span className="px-4 py-3 bg-dark-700 border border-dark-700 rounded-r-lg text-gray-400">
                  .elevateos.com
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Tagline</label>
              <input
                type="text"
                value={branding.tagline}
                onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                placeholder="Transform your life with expert coaching"
              />
              <p className="text-xs text-gray-500 mt-1">Appears on your landing page hero section</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Coaching Niche</label>
              <select
                value={branding.niche}
                onChange={(e) => setBranding({ ...branding, niche: e.target.value })}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
              >
                <option value="">Select your niche...</option>
                <option value="fitness">Fitness & Health</option>
                <option value="business">Business & Entrepreneurship</option>
                <option value="mindset">Mindset & Performance</option>
                <option value="career">Career Development</option>
                <option value="relationships">Relationships</option>
                <option value="life">Life Coaching</option>
                <option value="executive">Executive Coaching</option>
                <option value="spirituality">Spirituality</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Coach Bio</label>
              <textarea
                value={branding.bio}
                onChange={(e) => setBranding({ ...branding, bio: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                placeholder="Tell your story. What makes you unique? What results have you helped clients achieve?"
              />
              <p className="text-xs text-gray-500 mt-1">This appears on your About section</p>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-700 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Visual Identity</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Logo</label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-dark-800 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dark-700">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={branding.logoUrl}
                    onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none mb-2"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-gray-500">Upload your logo or paste image URL</p>
                </div>
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
                    className="w-16 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Main brand color for buttons and accents</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="w-16 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:border-primary-500 focus:outline-none font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Used for gradients and highlights</p>
              </div>
            </div>

            <div className="p-6 bg-dark-800/50 rounded-lg border border-dark-700">
              <div className="text-sm text-gray-400 mb-3">Preview</div>
              <div className="flex items-center space-x-4">
                <button
                  className="px-6 py-3 rounded-lg font-semibold text-white transition-all"
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
                >
                  Primary Button
                </button>
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
                />
                <div className="flex space-x-2">
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: branding.primaryColor }} />
                  <div className="w-8 h-8 rounded" style={{ backgroundColor: branding.secondaryColor }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Preview Your Brand</h3>
        <div className="p-8 bg-gradient-luxury rounded-lg border border-dark-700">
          <div className="flex items-center space-x-4 mb-6">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
              >
                {branding.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-2xl font-bold text-white">{branding.name || 'Your Business Name'}</div>
              <div className="text-gray-400">{branding.tagline || 'Your tagline here'}</div>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            {branding.bio || 'Your coach bio will appear here. Share your story and expertise.'}
          </p>
        </div>
      </div>
    </div>
  );
}
