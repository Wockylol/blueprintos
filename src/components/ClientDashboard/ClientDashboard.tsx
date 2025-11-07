import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, ClientModule, Module, Session, Milestone } from '../../lib/supabase';
import {
  BookOpen,
  Calendar,
  Trophy,
  TrendingUp,
  LogOut,
  Bell,
  Award,
  CheckCircle,
  Lock,
  Play
} from 'lucide-react';

export function ClientDashboard() {
  const { profile, signOut } = useAuth();
  const [assignedModules, setAssignedModules] = useState<(ClientModule & { module: Module })[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState({
    completedModules: 0,
    totalModules: 0,
    upcomingSessions: 0,
    streak: 7,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!profile) return;

    const { data: modulesData } = await supabase
      .from('client_modules')
      .select('*, module:modules(*)')
      .eq('client_id', profile.id)
      .order('assigned_at', { ascending: true });

    if (modulesData) {
      setAssignedModules(modulesData);
      const completed = modulesData.filter(m => m.completed_at).length;
      setStats(prev => ({
        ...prev,
        completedModules: completed,
        totalModules: modulesData.length,
      }));
    }

    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', profile.id)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(3);

    if (sessionsData) {
      setUpcomingSessions(sessionsData);
      setStats(prev => ({ ...prev, upcomingSessions: sessionsData.length }));
    }

    const { data: milestonesData } = await supabase
      .from('milestones')
      .select('*')
      .eq('client_id', profile.id)
      .order('achieved_at', { ascending: false })
      .limit(5);

    if (milestonesData) {
      setMilestones(milestonesData);
    }
  };

  const progressPercentage = stats.totalModules > 0
    ? Math.round((stats.completedModules / stats.totalModules) * 100)
    : 0;

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
                <div className="text-xs text-gray-400">Client</div>
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
          <p className="text-gray-400">Continue your transformation journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">Progress</div>
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">{progressPercentage}%</div>
            <div className="text-sm text-gray-500">Completion rate</div>
          </div>

          <div className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">Modules</div>
              <BookOpen className="w-6 h-6 text-accent-500" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">
              {stats.completedModules}/{stats.totalModules}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>

          <div className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">Sessions</div>
              <Calendar className="w-6 h-6 text-primary-500" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.upcomingSessions}</div>
            <div className="text-sm text-gray-500">Coming up</div>
          </div>

          <div className="card-glass">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">Streak</div>
              <Trophy className="w-6 h-6 text-accent-500" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.streak}</div>
            <div className="text-sm text-gray-500">Days active</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 card-glass">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">My Learning Path</h3>
              <BookOpen className="w-5 h-5 text-gray-400" />
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Overall Progress</span>
                <span className="text-sm font-semibold text-primary-400">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-blue h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            {assignedModules.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No modules assigned yet. Your coach will assign modules soon.
              </p>
            ) : (
              <div className="space-y-4">
                {assignedModules.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`bg-dark-800/50 rounded-lg p-4 hover:bg-dark-700/50 transition-all ${
                      assignment.is_unlocked ? 'cursor-pointer' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            assignment.completed_at
                              ? 'bg-green-500/20'
                              : assignment.is_unlocked
                              ? 'bg-gradient-blue'
                              : 'bg-dark-700'
                          }`}
                        >
                          {assignment.completed_at ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : assignment.is_unlocked ? (
                            <Play className="w-6 h-6 text-white" />
                          ) : (
                            <Lock className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium mb-1">
                            {assignment.module.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            {assignment.module.description}
                          </div>
                        </div>
                      </div>
                      {assignment.is_unlocked && !assignment.completed_at && (
                        <button className="btn-primary text-sm px-4 py-2">
                          Start
                        </button>
                      )}
                      {assignment.completed_at && (
                        <span className="text-sm text-green-500 font-medium">Completed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card-glass">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Upcoming Sessions</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              {upcomingSessions.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm">No sessions scheduled</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="bg-dark-800/50 rounded-lg p-3">
                      <div className="text-white font-medium mb-1">1:1 Coaching Session</div>
                      <div className="text-sm text-gray-400">
                        {new Date(session.scheduled_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-primary-400">
                        {new Date(session.scheduled_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn-secondary w-full mt-4 text-sm py-2">
                Schedule Session
              </button>
            </div>

            <div className="card-glass">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Milestones</h3>
                <Trophy className="w-5 h-5 text-gray-400" />
              </div>
              {milestones.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm">
                  Complete modules to unlock milestones
                </p>
              ) : (
                <div className="space-y-3">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-violet rounded-full flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{milestone.title}</div>
                        <div className="text-xs text-gray-400">{milestone.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button className="card-glass hover:shadow-glow-blue transition-all duration-300 text-left">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-blue rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-1">Daily Journal</h4>
                <p className="text-gray-400 text-sm">Reflect on your progress and insights</p>
              </div>
            </div>
          </button>

          <button className="card-glass hover:shadow-glow-violet transition-all duration-300 text-left">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-violet rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-1">Weekly Check-in</h4>
                <p className="text-gray-400 text-sm">Track your goals and wins</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
