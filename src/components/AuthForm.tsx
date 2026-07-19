import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ArrowRight, Loader2, Zap, BarChart2, Trophy, Clock, Target, Flame, CheckCircle2 } from 'lucide-react';

// SVG icon for Google
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { signIn, signUp, isConfigured, resendConfirmation, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'resend'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex">
        {/* Left panel - branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 dark:bg-black relative overflow-hidden items-center justify-center">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
          
          <div className="relative z-10 max-w-md px-12">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Study Tracker</span>
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight mb-6">
              Track smarter.<br />
              <span className="text-amber-400">Study better.</span>
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed mb-10">
              Focus sessions, task management, and progress analytics — all in one place. Built for students who mean business.
            </p>

            {/* Feature pills */}
            <div className="space-y-3">
              {[
                { icon: Zap, text: 'Pomodoro timer with session notes' },
                { icon: BarChart2, text: 'Visual progress analytics' },
                { icon: Trophy, text: 'Achievements & streaks' },
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <feat.icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative orb */}
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
        </div>

        {/* Right panel - form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            {/* Mobile-only logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">Study Tracker</span>
            </div>

            <div className="animate-slide-up">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Welcome back</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
                Supabase is not configured. Running in demo mode.
              </p>

              <button
                onClick={onSuccess}
                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold py-3 px-6 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Continue in Demo Mode
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4 text-center">
                Data will be stored locally in your browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check your email for a confirmation link!');
          setMode('login');
        }
      } else if (mode === 'resend') {
        const { error } = await resendConfirmation(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Confirmation email sent! Check your inbox.');
          setResendCooldown(60);
          const timer = setInterval(() => {
            setResendCooldown(prev => {
              if (prev <= 1) { clearInterval(timer); return 0; }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onSuccess?.();
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  const handleOAuth = async () => {
    setSocialLoading(true);
    setError(null);
    const { error } = await signInWithOAuth('google');
    if (error) {
      setError(error.message);
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] bg-neutral-900 dark:bg-black relative overflow-hidden items-center justify-center">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        
        <div className="relative z-10 max-w-lg px-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Study Tracker</span>
          </div>

          {/* Headline */}
          <h2 className="text-[2.75rem] font-bold text-white leading-[1.1] mb-5 tracking-tight">
            Focus. Track.<br />
            <span className="text-amber-400">Achieve.</span>
          </h2>
          <p className="text-neutral-400 text-[15px] leading-relaxed mb-10 max-w-md">
            The minimal study companion that helps you build consistency, stay focused, and actually see your progress over time.
          </p>

          {/* Mock Dashboard Preview */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-5 mb-10">
            {/* Mini stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: Flame, label: 'Streak', value: '12 days', color: 'text-orange-400' },
                { icon: Clock, label: 'This week', value: '8.5h', color: 'text-amber-400' },
                { icon: Target, label: 'Level', value: '14', color: 'text-emerald-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-neutral-900/60 rounded-xl p-3 text-center">
                  <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1.5`} />
                  <p className="text-white text-sm font-bold">{stat.value}</p>
                  <p className="text-neutral-500 text-[10px] font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Mini task list */}
            <div className="space-y-2">
              {[
                { text: 'Review Chapter 5 notes', done: true },
                { text: 'Practice problem set', done: true },
                { text: 'Write essay introduction', done: false },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-neutral-900/40 rounded-lg px-3 py-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${task.done ? 'text-emerald-400' : 'text-neutral-600'}`} />
                  <span className={`text-xs ${task.done ? 'text-neutral-500 line-through' : 'text-neutral-300'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom features */}
          <div className="flex items-center gap-6 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Pomodoro Timer
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              Analytics
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Achievements
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-amber-500/8 blur-[100px]" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[300px] h-[300px] rounded-full bg-amber-600/5 blur-[80px]" />
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">Study Tracker</span>
          </div>

          <div className="animate-slide-up">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Resend confirmation'}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
              {mode === 'login'
                ? 'Sign in to sync your study data across devices'
                : mode === 'signup'
                  ? 'Start tracking your study progress'
                  : 'Enter the email you signed up with'}
            </p>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleOAuth}
              disabled={loading || socialLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-200 font-medium text-sm hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {socialLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-stone-50 dark:bg-neutral-950 text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-medium">
                  or
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                  />
                </div>
              )}

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                />
              </div>

              {mode !== 'resend' && (
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                  />
                </div>
              )}

              {/* Error/Success */}
              {error && (
                <div className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2.5 rounded-xl">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || (mode === 'resend' && resendCooldown > 0)}
                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold py-3 px-6 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating...' : 'Sending...'}</span>
                  </>
                ) : mode === 'resend' && resendCooldown > 0 ? (
                  <span>Resend in {resendCooldown}s</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send confirmation email'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
              {mode === 'login' && (
                <div className="space-y-2">
                  <p>
                    <button
                      onClick={() => { setMode('signup'); resetForm(); }}
                      className="text-neutral-900 dark:text-white font-medium hover:underline underline-offset-4"
                    >
                      Create an account
                    </button>
                  </p>
                  <p>
                    <button
                      onClick={() => { setMode('resend'); resetForm(); }}
                      className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 text-xs"
                    >
                      Didn't receive confirmation email?
                    </button>
                  </p>
                </div>
              )}
              {mode === 'signup' && (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('login'); resetForm(); }}
                    className="text-neutral-900 dark:text-white font-medium hover:underline underline-offset-4"
                  >
                    Sign in
                  </button>
                </p>
              )}
              {mode === 'resend' && (
                <button
                  onClick={() => { setMode('login'); resetForm(); }}
                  className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 text-xs"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
