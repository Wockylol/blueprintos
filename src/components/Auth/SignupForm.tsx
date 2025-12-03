import { useState } from 'react';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../ThemeToggle';

type SignupFormProps = {
  onSwitchToLogin: () => void;
};

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'coach' | 'client'>('client');
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<string>('');
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (role === 'coach' && !workspaceName.trim()) {
      setError('Please provide a workspace name for your coaching business');
      setLoading(false);
      return;
    }

    try {
      setSignupStep('Creating your account...');

      const { error } = await signUp(email, password, fullName, role, role === 'coach' ? workspaceName : undefined);

      if (error) {
        setError(error.message);
        setSignupStep('');
      } else {
        setSignupStep('Account created! Loading your dashboard...');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setSignupStep('');
    } finally {
      setLoading(false);
    }
  };

  // Removed success state - App component handles automatic redirect after auth

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-luxury px-6 py-12">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-gray-900 dark:text-white mb-2">Start Your Journey</h2>
          <p className="text-gray-600 dark:text-gray-400">Create your account to begin transformation</p>
        </div>

        <div className="card-glass">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'client'
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-dark-600 bg-dark-800/50 text-gray-400 hover:border-primary-500/50'
                  }`}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Client</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('coach')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'coach'
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-dark-600 bg-dark-800/50 text-gray-400 hover:border-primary-500/50'
                  }`}
                >
                  <UserPlus className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Coach</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-luxury pl-11"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {role === 'coach' && (
              <div>
                <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-300 mb-2">
                  Coaching Business Name
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="workspaceName"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="input-luxury pl-11"
                    placeholder="My Coaching Business"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This will be used to create your workspace and subdomain
                </p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-luxury pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-luxury pl-11"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
            </div>

            {signupStep && (
              <div className="bg-primary-500/10 border border-primary-500/50 rounded-lg p-4 flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <p className="text-primary-400 text-sm font-medium">{signupStep}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
