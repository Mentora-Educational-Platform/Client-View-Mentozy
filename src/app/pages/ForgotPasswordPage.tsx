import { useState } from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error("Supabase client not initialized");

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            toast.success("Password reset email sent! Check your inbox.");
            setEmail('');
        } catch (error: any) {
            console.error('Reset Error:', error);
            toast.error(error.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex font-mono">
            {/* Left Side - Visual / Brand Area */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#eff3ff] items-center justify-center relative border-r-4 border-gray-900">
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12">
                    <div className="w-full max-w-md aspect-square bg-white border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop')] bg-cover bg-center mix-blend-multiply opacity-80"></div>
                        <div className="absolute inset-0 bg-[#f39c12]/20 mix-blend-overlay"></div>
                    </div>
                    <div className="text-center max-w-lg">
                        <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase">
                            Forgot your password?
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed font-bold uppercase">
                            "No worries, we'll send you reset instructions."
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-[#FAF9F6] relative">
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="flex items-center gap-2 text-gray-900 transition-colors border-2 border-gray-900 bg-white px-2 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <span className="text-xl font-black tracking-tight uppercase">Mentozy</span>
                        <div className="w-2.5 h-2.5 bg-[#f39c12] border border-gray-900"></div>
                    </Link>
                </div>

                <div className="absolute top-8 right-8 hidden lg:flex items-center gap-1 cursor-pointer">
                    <Link to="/" className="flex items-center gap-2 border-2 border-gray-900 bg-white px-3 py-1.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] transition-all">
                        <span className="text-2xl font-black tracking-tight text-gray-900 uppercase">Mentozy</span>
                        <div className="w-3 h-3 bg-[#f39c12] border-2 border-gray-900"></div>
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-sm lg:w-96 border-4 border-gray-900 bg-white p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase">Reset password</h1>
                        <p className="text-gray-700 text-sm font-bold uppercase leading-relaxed">
                            Enter your email to receive a password reset link.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-black text-gray-900 mb-2 uppercase">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-900" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 border-4 border-gray-900 bg-white text-gray-900 placeholder-gray-400 focus:bg-[#eff3ff] focus:outline-none transition-all text-sm font-bold uppercase"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3.5 px-4 border-4 border-gray-900 text-sm font-black text-gray-900 bg-[#f39c12] hover:bg-[#e08e0b] shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Send reset link <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-bold uppercase text-gray-700">
                            Remembered?{' '}
                            <Link
                                to="/login"
                                className="font-black text-gray-900 hover:text-[#f39c12] transition-colors underline decoration-2 decoration-gray-900 underline-offset-4"
                            >
                                Back to login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
