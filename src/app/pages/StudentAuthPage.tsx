import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function StudentAuthPage() {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        if (!supabase) {
            toast.error("Supabase not configured");
            return;
        }
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 transform rotate-12">
                        <span className="text-white font-black text-2xl -rotate-12">M</span>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Student Portal</h2>
                    <p className="text-gray-500 font-medium">Start your learning journey today</p>
                </div>

                <div className="bg-white py-10 px-10 shadow-2xl shadow-gray-200/[0.5] rounded-[2.5rem] border border-gray-100">
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 p-4 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    <span>Continue with Google</span>
                                </>
                            )}
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-400 font-medium">Or</span>
                            </div>
                        </div>

                        <Link to="/signup?role=student" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                            Create New Account
                        </Link>

                        <Link to="/login" className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 p-4 rounded-2xl font-bold hover:bg-indigo-100 transition-all">
                            Log In
                        </Link>
                    </div>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-gray-400">
                            By continuing, you agree to our{' '}
                            <a href="#" className="font-medium text-gray-600 hover:text-gray-900 underline">Terms</a>{' '}
                            and{' '}
                            <a href="#" className="font-medium text-gray-600 hover:text-gray-900 underline">Privacy Policy</a>
                        </p>
                    </div>

                    <div className="mt-8 text-center">
                        <Link to="/signup" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                            ← Back to role selection
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
