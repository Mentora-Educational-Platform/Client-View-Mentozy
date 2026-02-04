"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Briefcase, User, Building, Award, CheckCircle2 } from 'lucide-react';

export function MentorOnboardingPage() {
    const router = useRouter();
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
            const supabase = getSupabase();
            if (!supabase) throw new Error("Supabase client not initialized");

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
            router.push('/mentor-dashboard');

        } catch (error: any) {
            console.error('Mentor Signup Error:', error);
            toast.error(error.message || "Failed to create mentor account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Join as a Mentor</h2>
                    <p className="mt-2 text-gray-600">Share your knowledge and guide the next generation.</p>
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
    );
}
