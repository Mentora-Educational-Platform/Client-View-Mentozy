
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Briefcase, User, Building, Award, CheckCircle2 } from 'lucide-react';

export function MentorOnboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: '',
        company: '',
        expertise: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // supabase is imported from lib/supabase
            if (!supabase) {
                toast.error("Supabase not configured");
                throw new Error("Supabase not configured");
            }

            // 1. Sign Up
            let { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'mentor'
                    }
                }
            });

            // Handle "User already registered" by trying to sign in
            if (authError && authError.message.includes("already registered")) {
                // User exists, attempting sign in
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (signInError) throw new Error("Account exists but password was incorrect.");
                authData = signInData; // Use the sign-in data
                authError = null; // Clear error
            }

            if (authError) throw authError;
            if (!authData.user) throw new Error("No user returned from signup");
            if (!authData.session) throw new Error("Please check your email to confirm your account before creating a profile.");

            // 2. Create/Update Profile explicitly
            // We use upsert to handle cases where a trigger might or might not have created the row.
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    full_name: formData.fullName,
                    role: 'mentor'
                });

            if (profileError) throw profileError;

            // 3. Create Mentor Record
            // 3. Create Mentor Record (Direct Insert)
            const { data: mentorData, error: mentorError } = await supabase
                .from('mentors')
                .upsert({
                    user_id: authData.user.id,
                    bio: formData.role,
                    company: formData.company,
                    years_experience: 0,
                    hourly_rate: 0,
                    rating: 5.0,
                    total_reviews: 0
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (mentorError) throw mentorError;

            // 4. Create Mentor Expertise
            if (formData.expertise) {
                const expertiseList = formData.expertise.split(',').map(s => s.trim()).filter(s => s);
                if (expertiseList.length > 0) {
                    const expertiseInserts = expertiseList.map(skill => ({
                        mentor_id: mentorData.id,
                        skill: skill
                    }));

                    // Upsert expertise (ignore duplicates)
                    const { error: expertiseError } = await supabase
                        .from('mentor_expertise')
                        .upsert(expertiseInserts, { onConflict: 'mentor_id,skill' });

                    if (expertiseError) throw expertiseError;
                }
            }

            if (mentorError) throw mentorError;

            toast.success("Welcome, Mentor! account created successfully.");
            navigate('/mentor-dashboard');

        } catch (error: any) {
            console.error('Mentor Signup Error:', error);
            toast.error(error.message || "Failed to create mentor account");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!supabase) {
            toast.error("Supabase not configured");
            return;
        }
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
        if (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 transform rotate-12">
                        <span className="text-white font-black text-2xl -rotate-12">M</span>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Join as Mentor</h2>
                    <p className="text-gray-500 font-medium">Share your expertise and inspire the next generation</p>
                </div>

                <div className="bg-white py-10 px-10 shadow-2xl shadow-gray-200/[0.5] rounded-[2.5rem] border border-gray-100">

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full mb-8 flex items-center justify-center gap-3 bg-white border border-gray-200 p-4 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Sign up with Google</span>
                    </button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400 font-medium">Or using email</span>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                    placeholder="Ex. Jane Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                placeholder="jane@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                placeholder="Min. 6 characters"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="role"
                                        type="text"
                                        required
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                        placeholder="Ex. Sr. Engineer"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="company"
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                        placeholder="Ex. Tech Corp"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Key Expertise (comma separated)</label>
                            <div className="relative">
                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="expertise"
                                    type="text"
                                    required
                                    value={formData.expertise}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                                    placeholder="Ex. React, System Design, Leadership"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Mentor Profile <CheckCircle2 className="w-5 h-5" /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
