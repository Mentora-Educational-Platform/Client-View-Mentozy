import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated as admin, redirect to /admin
  useEffect(() => {
    async function checkExistingAdminSession() {
      if (!user || !supabase) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin' || user.app_metadata?.role === 'admin') {
          navigate('/admin');
        }
      } catch (err) {
        // Not admin or no profile
      }
    }

    checkExistingAdminSession();
  }, [user, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized.');
      }

      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (authError) {
        throw authError;
      }

      const authUser = authData.user;
      if (!authUser) {
        throw new Error('Authentication failed. No user profile returned.');
      }

      // 2. Verify Administrative Privileges strictly from database profile role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      const isAdmin = (!profileError && profileData?.role === 'admin') || authUser.app_metadata?.role === 'admin';

      if (!isAdmin) {
        // Sign out non-admin user
        await supabase.auth.signOut();
        setErrorMessage('Access Denied: This account does not possess administrative privileges.');
        toast.error('Access Denied: Administrator account required.');
        setLoading(false);
        return;
      }

      toast.success('Authenticated as Mentozy Administrator');
      navigate('/admin');
    } catch (err: any) {
      console.error('[Admin Auth Error]:', err);
      setErrorMessage(err.message || 'Invalid credentials or connection failure.');
      toast.error(err.message || 'Failed to authenticate administrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-mono text-gray-900 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="bg-white border-b-4 border-gray-900 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 px-3.5 py-1.5 border-2 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-50 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Platform
          </button>
          
          <div 
            className="flex items-center gap-3 cursor-pointer group border-4 border-gray-900 bg-white px-3 py-1 shadow-[3px_3px_0px_rgba(0,0,0,1)]" 
            onClick={() => navigate('/')}
          >
            <span className="text-lg font-black tracking-tight text-gray-900 uppercase">Mentozy</span>
            <div className="w-3 h-3 bg-[#f39c12] border-2 border-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-md w-full bg-white border-4 border-gray-900 p-8 md:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6 text-left">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
              <Shield className="w-3.5 h-3.5 text-[#f39c12]" /> Internal Admin Access
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
              Admin Login
            </h1>
            <p className="text-xs font-bold text-gray-600 uppercase">
              Authenticate with your verified Mentozy administrative credentials.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-600 text-rose-800 text-xs font-bold flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-bold">
            <div className="space-y-1.5">
              <label className="block font-black uppercase text-gray-900">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="founder@mentozy.app"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 pl-10 pr-3 py-3 font-bold text-xs focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-black uppercase text-gray-900">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 pointer-events-none" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full bg-[#FAF9F6] border-2 border-gray-900 pl-10 pr-10 py-3 font-bold text-xs focus:bg-white outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-xs uppercase border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to Admin Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-[11px] font-bold text-gray-500 uppercase">
        Mentozy Internal Systems · Authorized Personnel Only
      </div>
    </div>
  );
}

export default AdminLoginPage;
