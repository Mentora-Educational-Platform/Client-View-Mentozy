"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Briefcase, User, Building, Award, CheckCircle2, ArrowRight, ArrowLeft, DollarSign, Calendar, Linkedin, Globe, Upload, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function MentorOnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        fullName: '',
        email: '',
        password: '',
        // Step 2: Professional Details
        role: '',
        company: '',
        yearsExperience: '',
        hourlyRate: '',
        // Step 3: Skills & Bio
        expertise: '',
        bio: '',
        // Step 4: Online Presence
        linkedin: '',
        website: '',
        avatarUrl: ''
    });

    const totalSteps = 4;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
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
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (signInError) throw new Error("Account exists but password was incorrect.");
                authData = signInData;
                authError = null;
            }

            if (authError) throw authError;
            if (!authData.user) throw new Error("No user returned from signup");
            if (!authData.session) throw new Error("Please check your email to confirm your account before creating a profile.");

            // 2. Create/Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    full_name: formData.fullName,
                    avatar_url: formData.avatarUrl || null,
                    role: 'mentor'
                });

            if (profileError) throw profileError;

            // 3. Create Mentor Record
            const { data: mentorData, error: mentorError } = await supabase
                .from('mentors')
                .upsert({
                    user_id: authData.user.id,
                    bio: formData.bio || formData.role,
                    company: formData.company,
                    years_experience: parseInt(formData.yearsExperience) || 0,
                    hourly_rate: parseFloat(formData.hourlyRate) || 0,
                    linkedin: formData.linkedin || null,
                    website: formData.website || null,
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

                    const { error: expertiseError } = await supabase
                        .from('mentor_expertise')
                        .upsert(expertiseInserts, { onConflict: 'mentor_id,skill' });

                    if (expertiseError) throw expertiseError;
                }
            }

            toast.success("🎉 Welcome, Mentor! Your profile is live!");

            // Show success animation before redirect
            setTimeout(() => {
                router.push('/mentor-dashboard');
            }, 1500);

        } catch (error: any) {
            console.error('Mentor Signup Error:', error);
            toast.error(error.message || "Failed to create mentor account");
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.fullName && formData.email && formData.password.length >= 6;
            case 2:
                return formData.role && formData.company && formData.yearsExperience && formData.hourlyRate;
            case 3:
                return formData.expertise && formData.bio;
            case 4:
                return true; // Step 4 is optional
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-0 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-rose-300/20 rounded-full blur-3xl"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/50 relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-500/30"
                    >
                        <Briefcase className="w-8 h-8" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-gray-900 mb-3">Join as a Mentor</h2>
                    <p className="text-gray-600 font-medium">Share your knowledge and inspire the next generation</p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-3">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: currentStep === step ? 1.1 : 1,
                                        backgroundColor: currentStep >= step ? '#f59e0b' : '#e5e7eb'
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${currentStep >= step ? 'text-white shadow-lg shadow-amber-500/30' : 'text-gray-400'
                                        }`}
                                >
                                    {currentStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                                </motion.div>
                                {step < 4 && (
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            backgroundColor: currentStep > step ? '#f59e0b' : '#e5e7eb'
                                        }}
                                        className="h-1 flex-1 mx-2 rounded-full transition-all"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 px-1">
                        <span className={currentStep === 1 ? 'text-amber-600' : ''}>Basic Info</span>
                        <span className={currentStep === 2 ? 'text-amber-600' : ''}>Professional</span>
                        <span className={currentStep === 3 ? 'text-amber-600' : ''}>Skills & Bio</span>
                        <span className={currentStep === 4 ? 'text-amber-600' : ''}>Online</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            name="fullName"
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                            placeholder="Ex. Jane Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Work Email *</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                        placeholder="jane@company.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Password *</label>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Professional Details */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Job Role *</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                            <input
                                                name="role"
                                                type="text"
                                                required
                                                value={formData.role}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                                placeholder="Sr. Engineer"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Company *</label>
                                        <div className="relative group">
                                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                            <input
                                                name="company"
                                                type="text"
                                                required
                                                value={formData.company}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                                placeholder="Tech Corp"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Years Experience *</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                            <input
                                                name="yearsExperience"
                                                type="number"
                                                required
                                                min="0"
                                                max="50"
                                                value={formData.yearsExperience}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                                placeholder="10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Hourly Rate ($) *</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                            <input
                                                name="hourlyRate"
                                                type="number"
                                                required
                                                min="15"
                                                max="500"
                                                step="5"
                                                value={formData.hourlyRate}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                                placeholder="50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Skills & Bio */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Key Expertise (comma separated) *</label>
                                    <div className="relative group">
                                        <Award className="absolute left-4 top-6 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            name="expertise"
                                            type="text"
                                            required
                                            value={formData.expertise}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                            placeholder="React, System Design, Leadership"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        About You *
                                        <span className="text-xs text-gray-500 font-normal ml-2">
                                            ({formData.bio.length}/500 characters)
                                        </span>
                                    </label>
                                    <textarea
                                        name="bio"
                                        required
                                        rows={6}
                                        maxLength={500}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none resize-none transition-all"
                                        placeholder="Tell students about your background, expertise, and what you're passionate about teaching..."
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Online Presence */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                <div className="text-center mb-4">
                                    <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 font-medium">Optional: Boost your credibility!</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn Profile</label>
                                    <div className="relative group">
                                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input
                                            name="linkedin"
                                            type="url"
                                            value={formData.linkedin}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                            placeholder="https://linkedin.com/in/yourprofile"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Personal Website</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            name="website"
                                            type="url"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Avatar URL</label>
                                    <div className="relative group">
                                        <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            name="avatarUrl"
                                            type="url"
                                            value={formData.avatarUrl}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all"
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Optional: Add a profile picture URL</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8">
                        {currentStep > 1 && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                type="button"
                                onClick={prevStep}
                                className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back
                            </motion.button>
                        )}

                        {currentStep < totalSteps ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={nextStep}
                                disabled={!isStepValid()}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                Next Step
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-green-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating Profile...
                                    </>
                                ) : (
                                    <>
                                        Create Mentor Profile
                                        <CheckCircle2 className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
