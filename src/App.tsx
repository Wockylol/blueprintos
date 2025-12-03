import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';
import { LandingPage } from './components/LandingPage';
import { DynamicLandingPage } from './components/DynamicLandingPage/DynamicLandingPage';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { NewCoachDashboard } from './components/CoachDashboard/NewCoachDashboard';
import { CoachOnboardingWizard } from './components/CoachOnboarding/CoachOnboardingWizard';
import { ClientDashboard } from './components/ClientDashboard/ClientDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

type View = 'landing' | 'login' | 'signup' | 'dashboard';

function AppContent() {
  const [view, setView] = useState<View>('landing');
  const { user, profile, workspace, loading, profileLoading, profileError, retryLoadProfile } = useAuth();

  console.log('[App] Render state:', { loading, profileLoading, hasUser: !!user, hasProfile: !!profile, profileError, role: profile?.role, onboardingComplete: profile?.onboarding_completed, view });

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-luxury">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">
            {loading ? 'Loading authentication...' : 'Loading your profile...'}
          </p>
          {profileLoading && (
            <p className="text-gray-500 text-sm mt-2">This may take a moment...</p>
          )}
        </div>
      </div>
    );
  }

  if (user && profile) {
    console.log('[App] Authenticated user detected, role:', profile.role);

    if (profile.role === 'coach') {
      console.log('[App] Coach account, onboarding_completed:', profile.onboarding_completed);
      if (!profile.onboarding_completed) {
        console.log('[App] Showing onboarding wizard');
        return <CoachOnboardingWizard />;
      }
      console.log('[App] Showing coach dashboard');
      return (
        <ProtectedRoute requiredRole="coach">
          <NewCoachDashboard />
        </ProtectedRoute>
      );
    } else if (profile.role === 'client') {
      console.log('[App] Client account, showing client dashboard');
      return (
        <ProtectedRoute requiredRole="client">
          <ClientDashboard />
        </ProtectedRoute>
      );
    } else if (profile.role === 'admin' || profile.role === 'superadmin') {
      console.log('[App] Admin account detected');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-luxury px-6">
          <div className="card-glass max-w-md text-center">
            <h2 className="text-white mb-4">Admin Dashboard</h2>
            <p className="text-gray-400 mb-6">Admin dashboard coming soon</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Reload</button>
          </div>
        </div>
      );
    }
  }

  if (user && !profile && !profileLoading) {
    console.log('[App] User exists but no profile found');
    const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-luxury px-6">
        <div className="card-glass max-w-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Account Setup Issue</h2>
            <p className="text-gray-400">
              We're having trouble loading your profile. This usually resolves automatically.
            </p>
          </div>

          {profileError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{profileError}</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <button
              onClick={retryLoadProfile}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Retry Loading Profile</span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
            >
              Reload Page
            </button>

            <a
              href={`mailto:support@blueprintos.com?subject=Account Setup Issue&body=User ID: ${user.id}`}
              className="block w-full px-4 py-3 text-gray-400 hover:text-gray-300 rounded-lg transition-colors text-center underline"
            >
              Contact Support
            </a>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="w-full px-4 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
            >
              Return to Landing Page
            </button>

            {isDev && (
              <button
                onClick={async () => {
                  if (!confirm('Admin Recovery: Create missing profile for this user?')) return;
                  try {
                    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                    const response = await fetch(`${supabaseUrl}/functions/v1/admin-create-profile`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                      },
                      body: JSON.stringify({ userId: user.id }),
                    });
                    const result = await response.json();
                    if (result.success) {
                      alert('Profile created! Reloading...');
                      window.location.reload();
                    } else {
                      alert(`Recovery failed: ${result.message}`);
                    }
                  } catch (error) {
                    alert('Recovery request failed');
                  }
                }}
                className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Admin: Create Missing Profile</span>
              </button>
            )}
          </div>

          {isDev && (
            <div className="border-t border-dark-600 pt-6">
              <details className="text-left">
                <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300 mb-3">
                  Debug Information
                </summary>
                <div className="bg-dark-900 rounded-lg p-4 text-xs font-mono text-gray-500">
                  <div>User ID: {user.id}</div>
                  <div>Email: {user.email}</div>
                  <div>Profile Loading: {profileLoading ? 'Yes' : 'No'}</div>
                  <div>Profile Error: {profileError || 'None'}</div>
                  <div>Timestamp: {new Date().toISOString()}</div>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }

  console.log('[App] No authenticated user, showing public views');

  if (workspace && view === 'landing') {
    return <DynamicLandingPage workspace={workspace} onGetStarted={() => setView('signup')} />;
  }

  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('signup')} />;
  }

  if (view === 'login') {
    return <LoginForm onSwitchToSignup={() => setView('signup')} />;
  }

  if (view === 'signup') {
    return <SignupForm onSwitchToLogin={() => setView('login')} />;
  }

  return workspace ? (
    <DynamicLandingPage workspace={workspace} onGetStarted={() => setView('signup')} />
  ) : (
    <LandingPage onGetStarted={() => setView('signup')} />
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
