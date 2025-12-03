import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase, Profile, Workspace } from '../lib/supabase';
import { resolveWorkspace, generateSubdomainFromName } from '../lib/workspace';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  workspace: Workspace | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  signUp: (email: string, password: string, fullName: string, role: 'coach' | 'client', workspaceName?: string) => Promise<{ error: AuthError | null; workspaceId?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  retryLoadProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Set a maximum loading timeout of 10 seconds
    const timeout = setTimeout(() => {
      console.error('[AuthContext] Loading timeout - forcing loading to false');
      setLoading(false);
    }, 10000);
    setLoadingTimeout(timeout);

    const initAuth = async () => {
      try {
        console.log('[AuthContext] Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AuthContext] Session:', session ? 'Found' : 'None');
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          await loadWorkspace();
          setLoading(false);
        }
        console.log('[AuthContext] Init complete');
      } catch (error) {
        console.error('[AuthContext] Init error:', error);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] Auth state changed:', _event, session ? 'has session' : 'no session');
      setUser(session?.user ?? null);

      // Use async IIFE to handle the async operations properly
      (async () => {
        try {
          if (session?.user) {
            await loadProfile(session.user.id);
          } else {
            setProfile(null);
            setWorkspace(null);
            await loadWorkspace();
            setLoading(false);
          }
        } catch (error) {
          console.error('[AuthContext] Auth state change error:', error);
          setLoading(false);
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, []);

  const loadProfile = async (userId: string, retries = 5, attempt = 1) => {
    setProfileLoading(true);
    setProfileError(null);

    const delays = [200, 500, 1000, 2000, 3000];
    const delay = delays[attempt - 1] || 3000;

    try {
      console.log(`[AuthContext] Loading profile for user: ${userId} (attempt ${attempt}/${retries + 1})`);
      const startTime = Date.now();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const loadTime = Date.now() - startTime;
      console.log(`[AuthContext] Profile query completed in ${loadTime}ms`);

      if (error) {
        console.error(`[AuthContext] Profile fetch error (attempt ${attempt}):`, error);
        if (retries > 0) {
          console.warn(`[AuthContext] Retrying profile load in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return loadProfile(userId, retries - 1, attempt + 1);
        }
        setProfileError(`Failed to load profile: ${error.message}`);
        setProfile(null);
        setProfileLoading(false);
        setLoading(false);
        return;
      }

      if (!data) {
        if (retries > 0) {
          console.warn(`[AuthContext] No profile found (attempt ${attempt}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return loadProfile(userId, retries - 1, attempt + 1);
        }
        console.error(`[AuthContext] Profile not found after ${attempt} attempts for user: ${userId}`);
        setProfileError('Profile not found after multiple retries');
        setProfile(null);
        setProfileLoading(false);
        setLoading(false);
        return;
      }

      console.log('[AuthContext] Profile loaded successfully:', {
        role: data.role,
        workspace_id: data.workspace_id,
        onboarding_completed: data.onboarding_completed,
        attempt,
      });
      setProfile(data);
      setProfileError(null);

      if (data?.workspace_id) {
        console.log('[AuthContext] Loading workspace by ID:', data.workspace_id);
        await loadWorkspaceById(data.workspace_id);
      } else {
        console.log('[AuthContext] No workspace_id, loading default workspace');
        await loadWorkspace();
      }
    } catch (error) {
      console.error(`[AuthContext] Exception loading profile (attempt ${attempt}):`, error);
      if (retries > 0) {
        console.warn(`[AuthContext] Retrying after exception in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return loadProfile(userId, retries - 1, attempt + 1);
      }
      setProfileError(error instanceof Error ? error.message : 'Unknown error');
      setProfile(null);
    } finally {
      console.log('[AuthContext] Profile loading complete');
      if (loadingTimeout) clearTimeout(loadingTimeout);
      setProfileLoading(false);
      setLoading(false);
    }
  };

  const loadWorkspace = async () => {
    try {
      const resolved = await resolveWorkspace();
      setWorkspace(resolved);
    } catch (error) {
      console.error('Error resolving workspace:', error);
    }
  };

  const loadWorkspaceById = async (workspaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .maybeSingle();

      if (error) throw error;
      setWorkspace(data);
    } catch (error) {
      console.error('Error loading workspace:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('[AuthContext] Refreshing profile...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        if (data.workspace_id) {
          await loadWorkspaceById(data.workspace_id);
        }
      }
    }
  };

  const refreshWorkspace = async () => {
    if (profile?.workspace_id) {
      await loadWorkspaceById(profile.workspace_id);
    } else {
      await loadWorkspace();
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'coach' | 'client',
    workspaceName?: string
  ) => {
    try {
      console.log('[AuthContext] Starting atomic signup via Edge Function for:', email, 'as', role);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/signup-coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          workspaceName: role === 'coach' ? workspaceName : undefined,
        }),
      });

      const result = await response.json();
      console.log('[AuthContext] Signup Edge Function response:', result);

      if (!result.success) {
        console.error('[AuthContext] Signup failed:', result.error);
        return {
          error: {
            message: result.error || 'Signup failed',
            status: response.status,
          } as AuthError
        };
      }

      console.log('[AuthContext] Signup successful, signing in user...');

      // Sign in the newly created user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[AuthContext] Auto sign-in failed:', signInError);
        return { error: signInError };
      }

      console.log('[AuthContext] User signed in successfully');
      return { error: null, workspaceId: result.workspaceId };
    } catch (error) {
      console.error('[AuthContext] Signup exception:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      console.log('[AuthContext] Updating profile:', updates);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      const newProfile = profile ? { ...profile, ...updates } : null;
      setProfile(newProfile);
      console.log('[AuthContext] Profile updated successfully');

      if (updates.workspace_id && updates.workspace_id !== profile?.workspace_id) {
        console.log('[AuthContext] Workspace changed, reloading workspace data');
        await loadWorkspaceById(updates.workspace_id);
      }

      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Error updating profile:', error);
      return { error: error as Error };
    }
  };

  const retryLoadProfile = async () => {
    if (user) {
      console.log('[AuthContext] Manual retry triggered');
      await loadProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    workspace,
    loading,
    profileLoading,
    profileError,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    refreshWorkspace,
    retryLoadProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
