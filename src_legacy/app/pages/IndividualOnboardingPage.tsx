
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4 | 5;

export function IndividualOnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        designation: '', // Student, Graduate, Working Professional, Certified Mentor
        email: '',
        password: '',
        phone: '',
        subjects: [] as string[],
        strengths: '',
        experience: '',
        hourlyRate: 30, // Default mid-range
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Helper to update form data
    const updateData = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const toggleSubject = (subject: string) => {
        const current = formData.subjects;
        if (current.includes(subject)) {
            updateData('subjects', current.filter(s => s !== subject));
        } else {
            updateData('subjects', [...current, subject]);
        }
    };

    const handleNext = () => {
        // Validation Logic
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.fullName) newErrors.fullName = "Full Name is required";
            if (!formData.designation) newErrors.designation = "Please select your designation";
        }
        if (step === 2) {
            if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid Email is required";
            if (!formData.password || formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
            if (!formData.phone) newErrors.phone = "Phone number is required";
        }
        if (step === 3) {
            if (formData.subjects.length === 0) newErrors.subjects = "Select at least one subject";
        }
        // Step 4 (Pricing) has default, no validation needed usually

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (step < 5) setStep(prev => (prev + 1) as Step);
        else handleSubmit();
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error("Supabase not initialized");

            // 1. Sign Up User (or handle existing)
            // Note: For this demo flow we assume new user. Ideally handle "User already exists" logic
            let { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                // Remove options to prevent trigger errors
            });

            if (authError) {
                if (authError.message.includes("already registered")) {
                    // Auto-login fallback logic could go here if we had password field
                    throw new Error("User already registered. Please login.");
                }
                throw authError;
            }

            if (!authData.user) throw new Error("No user created");

            // 2. Upsert Profile
            await supabase.from('profiles').upsert({
                id: authData.user.id,
                full_name: formData.fullName,
                role: 'mentor',
                phone: formData.phone
            });

            // 3. Upsert Mentor Record
            const { data: mentorData, error: mentorError } = await supabase
                .from('mentors')
                .upsert({
                    user_id: authData.user.id,
                    bio: formData.designation, // Storing designation in bio for now
                    years_experience: 0, // Default or parse from experience text
                    hourly_rate: formData.hourlyRate,
                    rating: 5.0,
                    total_reviews: 0
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (mentorError) throw mentorError;

            // 4. Insert Subjects (Expertise)
            const expertiseInserts = formData.subjects.map(s => ({
                mentor_id: mentorData.id,
                skill: s
            }));

            await supabase.from('mentor_expertise').upsert(expertiseInserts, { onConflict: 'mentor_id,skill' });

            navigate('/teacher-success?status=active');

        } catch (error: any) {
            console.error('Signup Error:', error);
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    const subjectOptions = [
        "Mathematics", "Physics", "Chemistry", "Computer Science",
        "English", "History", "Business Studies", "Design", "Economics", "Biology"
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-gray-900">Mentozy</span>
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-sm"></div>
                    </div>
                    <div className="text-sm font-medium text-gray-500">Step {step} of 5</div>
                </div>
            </div>

            <div className="flex-grow flex justify-center p-6">
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-1">
                        <div
                            className="bg-amber-500 h-1 transition-all duration-300"
                            style={{ width: `${(step / 5) * 100}%` }}
                        />
                    </div>

                    <div className="p-8 md:p-12 flex-grow">
                        {step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            value={formData.fullName}
                                            onChange={(e) => updateData('fullName', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                                            placeholder="e.g. Dr. Sarah Smith"
                                        />
                                        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Designation</label>
                                        <div className="relative">
                                            <select
                                                value={formData.designation}
                                                onChange={(e) => updateData('designation', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none appearance-none bg-white"
                                            >
                                                <option value="">Select your designation</option>
                                                <option value="Student">Student (Peer Mentor)</option>
                                                <option value="Graduate">Recent Graduate</option>
                                                <option value="Professional">Working Professional</option>
                                                <option value="Certified">Certified Mentor / Teacher</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors.designation && <p className="text-xs text-red-500">{errors.designation}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900">How can we reach you?</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateData('email', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                                            placeholder="email@example.com"
                                        />
                                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => updateData('phone', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                                            placeholder="+1 234 567 8900"
                                        />
                                        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Create Password</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => updateData('password', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                                            placeholder="Min. 6 characters"
                                        />
                                        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900">Your Teaching Expertise</h2>
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-gray-700 block">Subjects you teach</label>
                                    <div className="flex flex-wrap gap-2">
                                        {subjectOptions.map(sub => (
                                            <button
                                                key={sub}
                                                onClick={() => toggleSubject(sub)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${formData.subjects.includes(sub)
                                                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-amber-200'
                                                    }`}
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.subjects && <p className="text-xs text-red-500">{errors.subjects}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Areas of Strength</label>
                                    <input
                                        value={formData.strengths}
                                        onChange={(e) => updateData('strengths', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                                        placeholder="e.g. Exam Prep, Career Guidance, Project Support"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Teaching Experience <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <textarea
                                        value={formData.experience}
                                        onChange={(e) => updateData('experience', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none min-h-[100px]"
                                        placeholder="Briefly describe your experience..."
                                    />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Set your teaching price</h2>
                                    <p className="text-gray-500">You can update this later from your dashboard.</p>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 flex flex-col items-center justify-center">
                                    <div className="text-5xl font-bold text-amber-600 mb-2 flex items-start">
                                        <span className="text-2xl mt-2 mr-1">$</span>
                                        {formData.hourlyRate}
                                        <span className="text-lg text-gray-500 font-medium self-end mb-2 ml-1">/ hr</span>
                                    </div>

                                    <input
                                        type="range"
                                        min="15"
                                        max="75"
                                        step="5"
                                        value={formData.hourlyRate}
                                        onChange={(e) => updateData('hourlyRate', Number(e.target.value))}
                                        className="w-full max-w-md h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600 mt-6"
                                    />
                                    <div className="w-full max-w-md flex justify-between text-xs text-gray-500 mt-2 font-medium">
                                        <span>$15</span>
                                        <span>$75</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900">Review your profile</h2>
                                <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
                                    <ReviewRow label="Name" value={formData.fullName} onEdit={() => setStep(1)} />
                                    <ReviewRow label="Designation" value={formData.designation} onEdit={() => setStep(1)} />
                                    <ReviewRow label="Email" value={formData.email} onEdit={() => setStep(2)} />
                                    <ReviewRow label="Subjects" value={formData.subjects.join(", ")} onEdit={() => setStep(3)} />
                                    <ReviewRow label="Hourly Rate" value={`$${formData.hourlyRate}/hr`} onEdit={() => setStep(4)} />
                                </div>
                                <p className="text-xs text-center text-gray-500">
                                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
                        <button
                            onClick={() => step === 1 ? navigate('/teacher-type') : setStep(prev => (prev - 1) as Step)}
                            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={loading}
                            className="px-8 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
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
    );
}

function ReviewRow({ label, value, onEdit }: { label: string, value: string, onEdit: () => void }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-gray-900 font-medium">{value}</p>
            </div>
            <button onClick={onEdit} className="text-xs font-bold text-amber-600 hover:underline">Edit</button>
        </div>
    );
}
