import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Profile, Session } from '../../lib/supabase';
import {
  Users,
  Calendar,
  TrendingUp,
  Award,
  LogOut,
  Bell,
  BookOpen,
  MessageSquare,
  Globe,
  LayoutDashboard
} from 'lucide-react';
import { LandingPageBuilder } from './LandingPageBuilder';

type Tab = 'overview' | 'landing' | 'clients' | 'modules' | 'journals';

export function CoachDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [clients, setClients] = useState<Profile[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeSessions: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!profile) return;

    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*, client:profiles!sessions_client_id_fkey(full_name, avatar_url)')
      .eq('coach_id', profile.id)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5);

    if (sessionsData) {
      setUpcomingSessions(sessionsData);

      const uniqueClients = new Set(sessionsData.map(s => s.client_id));
      setStats(prev => ({
        ...prev,
        totalClients: uniqueClients.size,
        activeSessions: sessionsData.length,
      }));
    }

    const { data: clientsData } = await supabase
      .from('sessions')
      .select('client:profiles!sessions_client_id_fkey(*)')
      .eq('coach_id', profile.id);

    if (clientsData) {
      const uniqueClients = Array.from(
        new Map(clientsData.map(item => [item.client.id, item.client])).values()
      );
      setClients(uniqueClients);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-luxury">
      <nav className="bg-dark-900/80 backdrop-blur-xl border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">BlueprintOS</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-blue rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {profile?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
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
          <p className="text-gray-400">Here's what's happening with your coaching practice</p>
        </div>

        <div className="flex items-center space-x-4 mb-8 border-b border-dark-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-6 py-3 flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'landing'
                ? 'border-primary-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span>Landing Page</span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-3 flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'clients'
                ? 'border-primary-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Clients</span>
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-6 py-3 flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'modules'
                ? 'border-primary-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Modules</span>
          </button>
          <button
            onClick={() => setActiveTab('journals')}
            className={`px-6 py-3 flex items-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'journals'
                ? 'border-primary-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Journals</span>
          </button>
        </div>

        {activeTab === 'landing' && <LandingPageBuilder />}

        {activeTab === 'overview' && (
          <div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">Active Clients</div>
              <Users className="w-6 h-6 text-primary-500" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.totalClients}</div>
            <div className="text-sm text-gray-500">Total clients</div>
          </div>

          <div className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">Upcoming Sessions</div>
              <Calendar className="w-6 h-6 text-accent-500" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.activeSessions}</div>
            <div className="text-sm text-gray-500">This week</div>
          </div>

          <div className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">Completion Rate</div>
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">95%</div>
            <div className="text-sm text-gray-500">Client progress</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-glass">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Upcoming Sessions</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            {upcomingSessions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No upcoming sessions scheduled</p>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-dark-800/50 rounded-lg p-4 hover:bg-dark-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-blue rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {session.client?.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{session.client?.full_name}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(session.scheduled_at).toLocaleDateString()} at{' '}
                            {new Date(session.scheduled_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">{session.duration_minutes} min</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-glass">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Active Clients</h3>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            {clients.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No clients yet</p>
            ) : (
              <div className="space-y-4">
                {clients.slice(0, 5).map((client) => (
                  <div
                    key={client.id}
                    className="bg-dark-800/50 rounded-lg p-4 hover:bg-dark-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-violet rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {client.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{client.full_name}</div>
                          <div className="text-sm text-gray-400">{client.role}</div>
                        </div>
                      </div>
                      <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <button className="card-glass hover:shadow-glow-blue transition-all duration-300 text-left">
            <BookOpen className="w-8 h-8 text-primary-500 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Manage Modules</h4>
            <p className="text-gray-400 text-sm">Create and assign content to your clients</p>
          </button>

          <button className="card-glass hover:shadow-glow-violet transition-all duration-300 text-left">
            <MessageSquare className="w-8 h-8 text-accent-500 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">Review Journals</h4>
            <p className="text-gray-400 text-sm">Read and respond to client reflections</p>
          </button>

          <button className="card-glass hover:shadow-glow-blue transition-all duration-300 text-left">
            <TrendingUp className="w-8 h-8 text-primary-500 mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">View Analytics</h4>
            <p className="text-gray-400 text-sm">Track client progress and engagement</p>
          </button>
        </div>
          </div>
        )}
      </div>
    </div>
  );
}
