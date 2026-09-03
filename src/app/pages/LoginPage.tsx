import { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
    const navigate = useNavigate();
    const { user, role, isAdmin, loading: authLoading } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Automatically route authenticated users if they visit /login
    useEffect(() => {
        if (user && !authLoading) {
            if (isAdmin || role === 'admin') {
                navigate('/admin', { replace: true });
            } else if (role === 'mentor' || role === 'teacher') {
                navigate('/mentor-dashboard', { replace: true });
            } else if (role === 'org') {
                navigate('/org-dashboard', { replace: true });
            }
        }
    }, [user, isAdmin, role, authLoading, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const supabase = getSupabase();
            if (!supabase) {
                toast.error("Database connection unavailable");
                setSubmitting(false);
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email.trim(),
                password: formData.password,
            });

            if (error) {
                toast.error(error.message || "Failed to sign in");
                setSubmitting(false);
                return;
            }

            if (data?.user) {
                // Fetch profile directly from database
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .maybeSingle();

                const resolvedRole = profileData?.role || data.user.user_metadata?.role || data.user.app_metadata?.role;
                const isOrg = data.user.user_metadata?.is_org || resolvedRole === 'org';

                setSubmitting(false);

                if (resolvedRole === 'admin' || data.user.app_metadata?.role === 'admin') {
                    toast.success("Welcome back, Administrator!");
                    navigate('/admin', { replace: true });
                    return;
                }
                
                if (isOrg) {
                    toast.success("Welcome back, Organisation!");
                    navigate('/org-dashboard', { replace: true });
                    return;
                }
                
                if (resolvedRole === 'mentor' || resolvedRole === 'teacher') {
                    toast.success("Welcome back, Mentor!");
                    navigate('/mentor-dashboard', { replace: true });
                    return;
                }

                // Check if user has an active mentor application
                const { data: applicationData } = await supabase
                    .from('mentor_applications')
                    .select('status')
                    .eq('user_id', data.user.id)
                    .order('submitted_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (applicationData && applicationData.status !== 'approved') {
                    toast.success("Welcome to your Application Portal!");
                    navigate('/mentor/application', { replace: true });
                } else {
                    toast.success("Successfully logged in!");
                    navigate('/student-dashboard', { replace: true });
                }
            } else {
                setSubmitting(false);
                navigate('/student-dashboard', { replace: true });
            }

        } catch (error: any) {
            console.error('Login Error:', error);
            toast.error(error.message || "Failed to login");
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error("Supabase client not initialized");

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Google Login Error:', error);
            toast.error(error.message || "Failed to initiate Google login");
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex font-mono text-gray-900">
            {/* Left Side - Visual / Brand Area */}
            <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center relative overflow-hidden border-r-4 border-gray-900">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
                </div>

                {/* Image Container */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
                    <div className="w-full max-w-md aspect-square bg-[#FAF9F6] border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop')] bg-cover bg-center opacity-90 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
                    </div>

                    <div className="text-center max-w-lg">
                        <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">
                            Learn from the best.
                        </h2>
                        <p className="text-sm text-gray-700 font-bold leading-relaxed uppercase">
                            "Mentorship is the shortcut to experience. Connect with those who have walked the path before you."
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 lg:py-12 bg-[#FAF9F6] relative min-w-0">
                {/* Mobile Back/Home Button */}
                <div className="mb-6 lg:hidden flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-gray-900 uppercase">Mentozy</span>
                        <div className="w-3 h-3 bg-[#f39c12] border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]"></div>
                    </Link>
                </div>

                {/* Desktop Logo */}
                <div className="absolute top-8 right-8 hidden lg:flex items-center gap-1">
                    <Link to="/" className="flex items-center gap-1">
                        <span className="text-3xl font-black tracking-tight text-gray-900 uppercase">Mentozy</span>
                        <div className="w-3 h-3 bg-[#f39c12] border-2 border-gray-900 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"></div>
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-sm lg:w-96 min-w-0">
                    <div className="mb-6 sm:mb-8 bg-[#eff3ff] border-2 sm:border-4 border-gray-900 p-4 sm:p-6 shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight mb-1 sm:mb-2">Welcome back</h1>
                        <p className="text-xs text-gray-700 font-bold uppercase">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-xs sm:text-sm font-black text-gray-900 uppercase mb-1.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full pl-10 sm:pl-11 pr-4 py-3 min-h-[48px] border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] bg-white text-gray-900 font-bold text-xs sm:text-sm shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-xs sm:text-sm font-black text-gray-900 uppercase">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" className="text-[11px] sm:text-xs font-black text-[#f39c12] hover:text-[#f39c12]/80 uppercase">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className="block w-full pl-10 sm:pl-11 pr-11 py-3 min-h-[48px] border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] bg-white text-gray-900 font-bold text-xs sm:text-sm shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer text-gray-900"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="group w-full flex justify-center items-center py-3.5 sm:py-4 min-h-[48px] bg-[#eff3ff] border-2 sm:border-4 border-gray-900 font-black text-xs sm:text-sm text-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#eff3ff]/80 transition-all uppercase disabled:opacity-50 cursor-pointer"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign in <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 sm:mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-gray-900" />
                            </div>
                            <div className="relative flex justify-center text-[10px] sm:text-xs font-black uppercase">
                                <span className="px-3 bg-[#FAF9F6] text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-5 sm:mt-6">
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center px-4 py-3 min-h-[48px] border-2 border-gray-900 bg-white text-gray-900 font-black text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all uppercase cursor-pointer"
                            >
                                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-3 shrink-0" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.18 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </button>
                        </div>
                    </div>

                    {/* Sign Up Link Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs font-bold text-gray-600 uppercase">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-black text-[#f39c12] hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default LoginPage;