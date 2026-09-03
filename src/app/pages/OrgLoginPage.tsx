import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const OrgLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signIn, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as org or admin, automatically route to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      const isOrg = profile?.role === 'org' || profile?.role === 'admin' || user?.user_metadata?.is_org;
      if (isOrg) {
        navigate('/org-dashboard', { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your organization email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { user: loggedInUser, profile: loggedInProfile } = await signIn(email.trim(), password);

      toast.success('Welcome back to your Organization Workspace!');
      navigate('/org-dashboard', { replace: true });
    } catch (err: any) {
      console.error('[OrgLogin] Login failed:', err);
      const errMsg = err?.message || 'Invalid organization credentials. Please check your email and password, or contact Mentozy partnerships.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between selection:bg-[#FFE600] selection:text-black">
      {/* Top Banner / Announcement */}
      <div className="bg-[#111] text-white py-2.5 px-4 text-xs font-mono tracking-wider border-b-2 border-black">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">MENTOZY FOR ORGANIZATIONS</span>
            <span className="text-zinc-400 hidden sm:inline">• Official Institutional Portal</span>
          </div>
          <Link
            to="/org-onboarding"
            className="text-[#FFE600] hover:underline font-bold flex items-center gap-1"
          >
            Wanna partner with us? <ArrowRight className="w-3 h-3 inline" />
          </Link>
        </div>
      </div>

      {/* Main Login Card Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-12 h-12 bg-[#FFE600] border-3 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
                <Building2 className="w-6 h-6 text-black" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-black">
                MENTOZY<span className="text-[#FFE600] bg-black px-1.5 ml-0.5">ORG</span>
              </span>
            </Link>
            <h1 className="mt-4 text-2xl sm:text-3xl font-black text-black tracking-tight">
              ORGANIZATION LOGIN
            </h1>
            <p className="mt-1 text-sm font-bold text-zinc-600">
              Access your institutional dashboard and manage your cohorts
            </p>
          </div>

          {/* Neo-brutalist Form Card */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border-3 border-rose-600 text-rose-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                <div className="text-xs font-bold leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                  Organization Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@yourorganization.edu"
                    className="w-full pl-10 pr-3 py-3 bg-[#FAF8F5] border-3 border-black font-mono text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE600] transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-zinc-600 hover:text-black underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-[#FAF8F5] border-3 border-black font-mono text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE600] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-black focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[48px] bg-[#FFE600] hover:bg-[#ffe100] active:translate-x-0.5 active:translate-y-0.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none font-black text-sm uppercase tracking-wider text-black py-3.5 px-6 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    LOGIN TO ORGANIZATION <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-5 border-t-2 border-zinc-200 flex items-center gap-2 text-xs font-bold text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Encrypted institutional authentication via Supabase Auth</span>
            </div>
          </div>

          {/* Partnership Card / No Self-Registration Notice */}
          <div className="mt-6 bg-[#EFF6FF] border-3 border-black p-5 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#3B82F6] text-white border-2 border-black flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-black text-sm uppercase tracking-tight text-black">
                  Don't have an organization account yet?
                </h2>
                <p className="mt-1 text-xs text-zinc-700 font-medium leading-relaxed">
                  Organization accounts are provisioned exclusively through approved partnerships.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link
                    to="/org-onboarding"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-blue-900 bg-white border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFE600] transition-colors"
                  >
                    Partner With Us →
                  </Link>
                  <Link
                    to="/login"
                    className="text-xs font-bold text-zinc-600 hover:text-black underline"
                  >
                    Student / Mentor Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Minimal */}
      <div className="py-4 px-4 text-center border-t-2 border-black bg-white">
        <p className="text-xs font-mono text-zinc-600 font-bold">
          © {new Date().getFullYear()} Mentozy Education Inc. • Organization Access Portal
        </p>
      </div>
    </div>
  );
};
