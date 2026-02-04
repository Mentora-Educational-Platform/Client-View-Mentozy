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
                const profile = await getUserProfile(data.user.id);
                console.log("LOGIN DEBUG: User Profile Loaded:", profile);
                console.log("LOGIN DEBUG: User Role:", profile?.role);

                if (profile?.role === 'mentor' || profile?.role === 'teacher') {
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