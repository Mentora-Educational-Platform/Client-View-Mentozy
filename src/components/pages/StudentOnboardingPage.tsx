"use client";
import { useState } from 'react';
import { ArrowRight, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4 | 5;

export function StudentOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        phone: '',
        email: '',
        password: '',
        grade: '',
        school: '',
        interests: [] as string[],
        parentEmail: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateData = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const toggleInterest = (interest: string) => {
        const current = formData.interests;
        if (current.includes(interest)) {
            updateData('interests', current.filter(i => i !== interest));
        } else {
            updateData('interests', [...current, interest]);
        }
    };

    const isMinor = parseInt(formData.age) < 16;

    const handleNext = () => {
        const newErrors: Record<string, string> = {};
        if (step === 1) {
            if (!formData.fullName) newErrors.fullName = 'Full Name is required';
            if (!formData.age) newErrors.age = 'Age is required';
            if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid Email is required';
            if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
            if (!formData.phone) newErrors.phone = 'Phone is required';
        }
        if (step === 2) {
            if (!formData.grade) newErrors.grade = 'Please select your grade';
        }
        if (step === 3) {
            if (formData.interests.length === 0) newErrors.interests = 'Select at least one interest';
        }
        if (step === 4) {
            if (isMinor && (!formData.parentEmail || !/^\S+@\S+\.\S+$/.test(formData.parentEmail))) {
                newErrors.parentEmail = 'Parent email is required for students under 16';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (step === 1) setStep(2);
        else if (step === 2) setStep(3);
        else if (step === 3) setStep(isMinor ? 4 : 5);
        else if (step === 4) setStep(5);
        else if (step === 5) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error("Supabase not initialized");

            let { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (error && error.message.includes("already registered")) {
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });
                if (signInError) throw new Error("Account exists but password was incorrect.");
                data = signInData;
                error = null;
            }

            if (error) throw error;
            if (!data.user) throw new Error("No user created");

            const { error: profileError } = await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: formData.fullName,
                grade: formData.grade,
                school: formData.school,
                phone: formData.phone,
                interests: formData.interests,
                role: 'student'
            });

            if (profileError) {
                console.error("Profile creation failed:", profileError);
                toast.error("Account created but profile setup had issues. Please contact support.");
            }

            router.push('/student-dashboard');
        } catch (error: any) {
            console.error('Signup failed:', error);
            toast.error(error.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const supabase = getSupabase();
            if (!supabase) throw new Error("Supabase client not initialized");

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/student-dashboard`,
                }
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Google Login Error:', error);
            toast.error(error.message || "Failed to sign in with Google");
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 1) router.push('/student-auth');
        else if (step === 2) setStep(1);
        else if (step === 3) setStep(2);
        else if (step === 4) setStep(3);
        else if (step === 5) setStep(isMinor ? 4 : 3);
    };

    const interestOptions = [
        'Computer Science', 'Mathematics', 'Physics', 'Literature',
        'Design', 'Business', 'Robotics', 'Psychology', 'History', 'Music'
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-gray-900">Mentozy</span>
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-sm"></div>
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        Step {step} of 5
                    </div>
                </div>
            </div>

            <div className="flex-grow flex items-center justify-center p-6">
                <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                    <div className="md:w-5/12 bg-gray-900 p-10 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4 leading-tight">
                                {step === 1 && "Tell us about yourself"}
                                {step === 2 && "Your academic details"}
                                {step === 3 && "What are you interested in learning?"}
                                {step === 4 && "Parent/Guardian Details"}
                                {step === 5 && "Review & Confirm"}
                            </h2>
                            <p className="text-gray-400 text-lg">
                                {step === 1 && "Let's get the basics down so we can personalize your experience."}
                                {step === 2 && "Help us understand where you are in your education."}
                                {step === 3 && "Select topics you want to learn more about."}
                                {step === 4 && "For safety, we need to keep your guardians in the loop."}
                                {step === 5 && "Almost there! Double check your details below."}
                            </p>
                        </div>
                        <div className="flex gap-2 mt-8 md:mt-0">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-amber-500' : i < step ? 'w-8 bg-amber-500/50' : 'w-2 bg-gray-700'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="md:w-7/12 p-10 md:p-14 flex flex-col">
                        <div className="flex-grow">
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900">Full Name</label>
                                        <input value={formData.fullName} onChange={(e) => updateData('fullName', e.target.value)} type="text" className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.fullName ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'} outline-none transition-all`} placeholder="e.g. John Doe" />
                                        {errors.fullName && <p className="text-xs text-red-500 font-medium">{errors.fullName}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-900">Age</label>
                                            <input value={formData.age} onChange={(e) => updateData('age', e.target.value)} type="number" className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.age ? 'border-red-300' : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'} outline-none transition-all`} placeholder="18" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-900">Phone</label>
                                            <input value={formData.phone} onChange={(e) => updateData('phone', e.target.value)} type="tel" className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.phone ? 'border-red-300' : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'} outline-none transition-all`} placeholder="+1 234..." />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900">Email Address</label>
                                        <input value={formData.email} onChange={(e) => updateData('email', e.target.value)} type="email" className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.email ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'} outline-none transition-all`} placeholder="john@example.com" />
                                        {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900">Create Password</label>
                                        <input value={formData.password} onChange={(e) => updateData('password', e.target.value)} type="password" className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.password ? 'border-red-300' : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'} outline-none transition-all`} placeholder="Min. 6 characters" />
                                        {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                                    </div>

                                    <div className="relative mt-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                                        </div>
                                    </div>

                                    <button type="button" onClick={handleGoogleLogin} disabled={loading} className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all font-semibold">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Google
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900">Current Grade / Class</label>
                                        <div className="relative">
                                            <select value={formData.grade} onChange={(e) => updateData('grade', e.target.value)} className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.grade ? 'border-red-300' : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'} outline-none transition-all appearance-none cursor-pointer`}>
                                                <option value="">Select your grade</option>
                                                <option value="9">Grade 9</option>
                                                <option value="10">Grade 10</option>
                                                <option value="11">Grade 11</option>
                                                <option value="12">Grade 12</option>
                                                <option value="college">College / University</option>
                                                <option value="grad">Graduate</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors.grade && <p className="text-xs text-red-500 font-medium">{errors.grade}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900">School / Institution <span className="text-gray-400 font-normal">(Optional)</span></label>
                                        <input value={formData.school} onChange={(e) => updateData('school', e.target.value)} type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" placeholder="Enter school name" />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-900 block mb-4">Select topics you enjoy</label>
                                        <div className="flex flex-wrap gap-3">
                                            {interestOptions.map((interest) => (
                                                <button key={interest} onClick={() => toggleInterest(interest)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${formData.interests.includes(interest) ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-amber-200 hover:bg-gray-50'}`}>{interest}</button>
                                            ))}
                                        </div>
                                        {errors.interests && <p className="text-xs text-red-500 font-medium mt-2">{errors.interests}</p>}
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-800">
                                            Since you are under 16, we require a parent or guardian email for safety and communication purposes.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900">Parent / Guardian Email</label>
                                        <input value={formData.parentEmail} onChange={(e) => updateData('parentEmail', e.target.value)} type="email" className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.parentEmail ? 'border-red-300' : 'border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'} outline-none transition-all`} placeholder="parent@example.com" />
                                        {errors.parentEmail && <p className="text-xs text-red-500 font-medium">{errors.parentEmail}</p>}
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <ReviewItem label="Name" value={formData.fullName} onEdit={() => setStep(1)} />
                                        <ReviewItem label="Email" value={formData.email} onEdit={() => setStep(1)} />
                                        <ReviewItem label="Grade" value={formData.grade} onEdit={() => setStep(2)} />
                                        <ReviewItem label="Interests" value={formData.interests.join(', ')} onEdit={() => setStep(3)} />
                                        {isMinor && <ReviewItem label="Guardian Email" value={formData.parentEmail} onEdit={() => setStep(4)} />}
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-4">
                                        By creating an account, you agree to our <a href="#" className="text-amber-600 underline">Terms</a> & <a href="#" className="text-amber-600 underline">Privacy Policy</a>.
                                    </p>
                                </div>
                            )}

                        </div>

                        <div className="mt-10 flex items-center justify-between">
                            <button onClick={handleBack} className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">Back</button>
                            <button onClick={handleNext} disabled={loading} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        {step === 5 ? 'Create Account' : 'Next'}
                                        {step === 5 ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReviewItem({ label, value, onEdit }: { label: string, value: string, onEdit: () => void }) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-gray-900 font-medium">{value}</p>
            </div>
            <button onClick={onEdit} className="text-xs font-bold text-amber-600 hover:text-amber-700">Edit</button>
        </div>
    );
}
