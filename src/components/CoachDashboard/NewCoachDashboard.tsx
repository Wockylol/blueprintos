import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Users,
  Calendar,
  Award,
  LogOut,
  Bell,
  Palette,
  Package,
  Globe,
  Target,
  Sparkles,
  LayoutDashboard,
  DollarSign,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { BrandingSection } from './sections/BrandingSection';
import { OfferBuilderSection } from './sections/OfferBuilderSection';
import { FunnelBuilderSection } from './sections/FunnelBuilderSection';
import { ClientCRMSection } from './sections/ClientCRMSection';
import { MilestoneTrackerSection } from './sections/MilestoneTrackerSection';
import { CalendarSection } from './sections/CalendarSection';
import { AIAssistantSection } from './sections/AIAssistantSection';

type Tab = 'overview' | 'branding' | 'offers' | 'funnel' | 'clients' | 'milestones' | 'calendar' | 'ai-assistant';

export function NewCoachDashboard() {
  const { profile, workspace, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    completionRate: 0,
    upcomingSessions: 0,
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    if (!profile?.workspace_id) return;

    const { data: clientsData } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('workspace_id', profile.workspace_id)
      .eq('role', 'client');

    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .eq('workspace_id', profile.workspace_id)
      .eq('coach_id', profile.id)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true });

    const { data: revenueData } = await supabase
      .from('revenue_metrics')
      .select('mrr')
      .eq('workspace_id', profile.workspace_id)
      .eq('coach_id', profile.id)
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    setStats({
      totalClients: clientsData?.length || 0,
      activeClients: clientsData?.length || 0,
      monthlyRevenue: revenueData?.mrr || 0,
      completionRate: 87,
      upcomingSessions: sessionsData?.length || 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-luxury">
      <nav className="bg-dark-900/80 backdrop-blur-xl border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">ElevateOS</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-dark-800 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              {workspace?.logo_url ? (
                <img src={workspace.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {profile?.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-white">{profile?.full_name}</div>
                <div className="text-xs text-gray-400">Coach</div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-white mb-2">Welcome back, {profile?.full_name}</h1>
          <p className="text-gray-400">Manage your coaching business from one powerful dashboard</p>
        </div>

        <div className="flex items-start space-x-6">
          <div className="w-64 flex-shrink-0">
            <div className="card-glass sticky top-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'overview'
                      ? 'bg-gradient-blue text-white'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('branding')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'branding'
                      ? 'bg-gradient-blue text-white'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <Palette className="w-5 h-5" />
                  <span className="font-medium">Branding</span>
                </button>

                <button
                  onClick={() => setActiveTab('offers')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'offers'
                      ? 'bg-gradient-blue text-white'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Offers</span>
                </button>

                <button
                  onClick={() => setActiveTab('funnel')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'funnel'
                      ? 'bg-gradient-blue text-white'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Website</span>
                </button>

                <button
                  onClick={() => setActiveTab('clients')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'clients'
                      ? 'bg-gradient-blue text-white'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Clients</span>
                </button>

                <button
                  onClick={() => setActiveTab('milestones')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'milestones'
                      ? 'bg-gradient-blue text-white'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Milestones</span>
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'calendar'
                      ? 'bg-gradient-blue text-white'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Calendar</span>
                </button>

                <button
                  onClick={() => setActiveTab('ai-assistant')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'ai-assistant'
                      ? 'bg-gradient-violet text-white'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">AI Assistant</span>
                  <span className="ml-auto text-xs px-2 py-0.5 bg-accent-500/20 text-accent-400 rounded-full">
                    Soon
                  </span>
                </button>
              </nav>
            </div>
          </div>

          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="card-glass">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-gray-400 text-sm">Total Clients</div>
                      <Users className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.totalClients}</div>
                    <div className="text-xs text-gray-500">{stats.activeClients} active</div>
                  </div>

                  <div className="card-glass">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-gray-400 text-sm">Monthly Revenue</div>
                      <DollarSign className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">${stats.monthlyRevenue.toLocaleString()}</div>
                    <div className="text-xs text-primary-400">MRR</div>
                  </div>

                  <div className="card-glass">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-gray-400 text-sm">Completion Rate</div>
                      <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.completionRate}%</div>
                    <div className="text-xs text-gray-500">Client progress</div>
                  </div>

                  <div className="card-glass">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-gray-400 text-sm">Upcoming Sessions</div>
                      <Clock className="w-5 h-5 text-accent-500" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.upcomingSessions}</div>
                    <div className="text-xs text-gray-500">This week</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card-glass">
                    <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('offers')}
                        className="w-full flex items-center space-x-4 p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg transition-all text-left"
                      >
                        <div className="w-12 h-12 bg-gradient-blue rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">Create New Offer</div>
                          <div className="text-sm text-gray-400">Add a coaching package</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('funnel')}
                        className="w-full flex items-center space-x-4 p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg transition-all text-left"
                      >
                        <div className="w-12 h-12 bg-gradient-violet rounded-lg flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">Generate Landing Page</div>
                          <div className="text-sm text-gray-400">Use AI to create your site</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('clients')}
                        className="w-full flex items-center space-x-4 p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg transition-all text-left"
                      >
                        <div className="w-12 h-12 bg-gradient-blue rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">Manage Clients</div>
                          <div className="text-sm text-gray-400">View and track progress</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="card-glass">
                    <h3 className="text-xl font-semibold text-white mb-4">Getting Started</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs text-white font-bold">1</span>
                        </div>
                        <div>
                          <div className="text-white font-medium mb-1">Set up your branding</div>
                          <div className="text-sm text-gray-400 mb-2">
                            Upload logo, choose colors, add your bio
                          </div>
                          <button
                            onClick={() => setActiveTab('branding')}
                            className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                          >
                            Configure →
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs text-white font-bold">2</span>
                        </div>
                        <div>
                          <div className="text-white font-medium mb-1">Create your offers</div>
                          <div className="text-sm text-gray-400 mb-2">
                            Define coaching packages with pricing
                          </div>
                          <button
                            onClick={() => setActiveTab('offers')}
                            className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                          >
                            Build offers →
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs text-gray-400 font-bold">3</span>
                        </div>
                        <div>
                          <div className="text-white font-medium mb-1">Generate your website</div>
                          <div className="text-sm text-gray-400 mb-2">
                            Let AI create a professional landing page
                          </div>
                          <button
                            onClick={() => setActiveTab('funnel')}
                            className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                          >
                            Generate now →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-glass">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Your Workspace</h3>
                    <Globe className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Live URL</div>
                      <div className="flex items-center space-x-2">
                        <code className="px-3 py-2 bg-dark-800/50 rounded text-primary-400 text-sm flex-1">
                          {workspace?.subdomain}.elevateos.com
                        </code>
                        <button className="btn-secondary text-sm py-2 px-4">
                          Visit
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Custom Domain</div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="yourdomain.com"
                          className="flex-1 px-3 py-2 bg-dark-800 border border-dark-700 rounded text-white text-sm focus:border-primary-500 focus:outline-none"
                        />
                        <button className="btn-primary text-sm py-2 px-4">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'branding' && <BrandingSection />}
            {activeTab === 'offers' && <OfferBuilderSection />}
            {activeTab === 'funnel' && <FunnelBuilderSection />}
            {activeTab === 'clients' && <ClientCRMSection />}
            {activeTab === 'milestones' && <MilestoneTrackerSection />}
            {activeTab === 'calendar' && <CalendarSection />}
            {activeTab === 'ai-assistant' && <AIAssistantSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
