import { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../lib/api';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useAuth(); // Keep auth context active

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error("Supabase client not initialized");

            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            if (data.user) {
                // Check User Role
                // Check User Role
                const profile = await getUserProfile(data.user.id);
                const role = profile?.role || data.user.user_metadata?.role;

                console.log("LOGIN DEBUG: User Profile Loaded:", profile);
                console.log("LOGIN DEBUG: Detected Role:", role);

                if (role === 'mentor' || role === 'teacher') {
                    navigate('/mentor-dashboard');
                    toast.success("Welcome back, Mentor!");
                } else {
                    navigate('/student-dashboard');
                    toast.success("Successfully logged in!");
                }
            } else {
                navigate('/student-dashboard'); // Fallback
            }

        } catch (error: any) {
            console.error('Login Error:', error);
            toast.error(error.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error("Supabase client not initialized");

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'https://mentozy.netlify.app/auth/callback'
                }
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Google Login Error:', error);
            toast.error(error.message || "Failed to initiate Google login");
        }
    };

    return (
        <div className="min-h-screen bg-white flex font-sans">
            {/* Left Side - Visual / Brand Area */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center relative overflow-hidden">
                {/* Abstract shapes or image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-100/40 rounded-full blur-3xl" />
                </div>

                {/* Image Container */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
                    <div className="w-full max-w-md aspect-square bg-gradient-to-tr from-amber-50 to-orange-50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex items-center justify-center mb-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop')] bg-cover bg-center opacity-90 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay"></div>
                    </div>

                    <div className="text-center max-w-lg">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Learn from the best.
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            "Mentorship is the shortcut to experience. Connect with those who have walked the path before you."
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
                {/* Mobile Back/Home Button */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <span className="text-xl font-bold tracking-tight text-gray-900">Mentozy</span>
                        <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
                    </Link>
                </div>

                {/* Desktop Logo (Top Right of container) */}
                <div className="absolute top-8 right-8 hidden lg:flex items-center gap-1 cursor-pointer">
                    <Link to="/" className="flex items-center gap-1">
                        <span className="text-2xl font-bold tracking-tight text-gray-900">Mentozy</span>
                        <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back</h1>
                        <p className="text-gray-500 text-sm">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <a href="#" className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className="block w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign in <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-400 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                            >
                                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
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

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-bold text-gray-900 hover:text-amber-600 transition-colors underline decoration-transparent hover:decoration-amber-600 underline-offset-4"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}