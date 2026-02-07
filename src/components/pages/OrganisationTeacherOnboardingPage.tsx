"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Globe, MapPin, UploadCloud, Loader2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4 | 5 | 6;
type OrgType = 'online' | 'offline';

export function OrganisationTeacherOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);

    // Branching Logic State
    const [orgType, setOrgType] = useState<OrgType | null>(null);

    const [formData, setFormData] = useState({
        orgName: '',
        orgType: '' as OrgType | '',
        officialEmail: '',
        password: '',
        role: '', // Founder, Admin, Instructor, Manager
        teachingDomain: '', // Single/Multi
        website: '',
        founderName: '',
        address: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateData = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleNext = () => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.orgName) newErrors.orgName = "Organisation Name is required";
        }

        if (step === 2) {
            if (!formData.orgType) newErrors.orgType = "Please select an organisation type";
        }

        // Branch A: Online Institute
        if (orgType === 'online') {
            if (step === 3) {
                // Email Validation: .com, .in, .edu only
                const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|edu)$/;
                if (!formData.officialEmail || !emailRegex.test(formData.officialEmail)) {
                    newErrors.officialEmail = "Enter a valid official email (.com, .in, .edu)";
                }
                if (!formData.password || formData.password.length < 6) {
                    newErrors.password = "Password must be at least 6 characters";
                }
            }
            if (step === 4) {
                if (!formData.role) newErrors.role = "Please select your role";
            }
        }

        // Branch B: Offline Campus
        if (orgType === 'offline') {
            if (step === 4) { // Step 3 is just a notice
                if (!formData.founderName) newErrors.founderName = "Founder Name is required";
                if (!formData.officialEmail) newErrors.officialEmail = "Email is required";
                if (!formData.password || formData.password.length < 6) newErrors.password = "Password is required (min 6 chars)";
                if (!formData.address) newErrors.address = "Address is required";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Navigation Logic
        // Navigation Logic
        if (step === 2) {
            setOrgType(formData.orgType as OrgType);
            setStep(3);
            return;
        }

        const isFinishedOnline = orgType === 'online' && step === 6;
        const isFinishedOffline = orgType === 'offline' && step === 5;

        if (isFinishedOnline || isFinishedOffline) {
            handleSubmit();
        } else {
            setStep(prev => (prev + 1) as Step);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error("Supabase not initialized");

            // Signup Logic
            let { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.officialEmail,
                password: formData.password,
                // Remove options to prevent trigger errors
            });

            if (authError && authError.message.includes("already registered")) {
                // For MVP, just fail or toast
                throw new Error("Account already exists for this email.");
            }
            if (authError) throw authError;
            if (!authData.user) throw new Error("No user created");

            // Create Profile
            await supabase.from('profiles').upsert({
                id: authData.user.id,
                full_name: formData.orgName,
                role: 'mentor',
            });

            // Create Mentor (Org) Record
            // Logic: Store Org details in company/bio
            const status = orgType === 'online' ? 'active' : 'pending';

            await supabase.from('mentors').upsert({
                user_id: authData.user.id,
                company: formData.orgName,
                bio: JSON.stringify({
                    type: orgType,
                    role: formData.role,
                    website: formData.website,
                    domain: formData.teachingDomain,
                    address: formData.address,
                    founder: formData.founderName,
                    status: status // Storing status in JSON
                }),
                rating: 0,
            }, { onConflict: 'user_id' });

            // Redirect based on status
            router.push(`/teacher-success?status=${status}`);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight text-gray-900">Mentozy Org</span>
                        <div className="h-4 w-[1px] bg-gray-300"></div>
                        <span className="text-sm font-medium text-gray-500">Partner Onboarding</span>
                    </div>
                </div>
            </div>

            <div className="flex-grow flex justify-center p-6">
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-8 md:p-12 flex-grow">

                        {/* Step 1: Identity */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h1 className="text-3xl font-bold text-gray-900">Tell us about your organisation</h1>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Organisation Name</label>
                                        <input
                                            value={formData.orgName}
                                            onChange={(e) => updateData('orgName', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                            placeholder="e.g. Springfield Academy"
                                        />
                                        {errors.orgName && <p className="text-xs text-red-500">{errors.orgName}</p>}
                                    </div>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                                        <UploadCloud className="w-8 h-8 mb-2" />
                                        <span className="text-sm font-medium">Upload Organisation Logo</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Type Selection */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h1 className="text-3xl font-bold text-gray-900">What type of organisation are you?</h1>
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={() => updateData('orgType', 'online')}
                                        className={`p-6 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${formData.orgType === 'online' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-100 hover:border-blue-200'}`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Online Institute / New Institute</h3>
                                            <p className="text-sm text-gray-500">For digital-first academies and coaching centers.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => updateData('orgType', 'offline')}
                                        className={`p-6 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${formData.orgType === 'offline' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-100 hover:border-blue-200'}`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Offline Public Campus</h3>
                                            <p className="text-sm text-gray-500">For physical schools, universities, and campuses.</p>
                                        </div>
                                    </button>
                                </div>
                                {errors.orgType && <p className="text-xs text-red-500">{errors.orgType}</p>}
                            </div>
                        )}

                        {/* BRANCH A: Online Institute Steps */}
                        {orgType === 'online' && step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900">Organisation verification</h2>
                                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                                    Please use an official organisation email (e.g. admin@academy.com). Generic emails like gmail.com are not accepted.
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Official Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.officialEmail}
                                        onChange={(e) => updateData('officialEmail', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                        placeholder="admin@myinstitute.com"
                                    />
                                    {errors.officialEmail && <p className="text-xs text-red-500">{errors.officialEmail}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Create Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => updateData('password', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                        placeholder="Min. 6 characters"
                                    />
                                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                </div>
                            </div>
                        )}

                        {orgType === 'online' && step === 4 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900">Your role</h2>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Role in Organisation</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => updateData('role', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                                    >
                                        <option value="">Select Role</option>
                                        <option value="Founder">Founder</option>
                                        <option value="Admin">Administrator</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Instructor">Head Instructor</option>
                                    </select>
                                    {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                                </div>
                            </div>
                        )}

                        {orgType === 'online' && step === 5 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900">Organisation Profile</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">What does your organisation teach?</label>
                                        <input
                                            value={formData.teachingDomain}
                                            onChange={(e) => updateData('teachingDomain', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                            placeholder="e.g. Coding, Business, Design"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Website <span className="text-gray-400 font-normal">(Optional)</span></label>
                                        <input
                                            value={formData.website}
                                            onChange={(e) => updateData('website', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                                            placeholder="https://"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {orgType === 'online' && step === 6 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900">Review & Join</h2>
                                <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                                    <p><span className="font-semibold">Org Name:</span> {formData.orgName}</p>
                                    <p><span className="font-semibold">Email:</span> {formData.officialEmail}</p>
                                    <p><span className="font-semibold">Role:</span> {formData.role}</p>
                                </div>
                                <p className="text-sm text-gray-500">Creating your account will grant you immediate access to the Partner Dashboard.</p>
                            </div>
                        )}

                        {/* BRANCH B: Offline Campus Steps */}
                        {orgType === 'offline' && step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                                    <h3 className="text-lg font-bold text-amber-800 mb-2">Application Required</h3>
                                    <p className="text-amber-700">
                                        Public offline campuses require manual verification before onboarding on Mentozy.
                                        You will need to submit an application with supporting documents.
                                    </p>
                                </div>
                            </div>
                        )}

                        {orgType === 'offline' && step === 4 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900">Application Form</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Founder / Head of Institution</label>
                                        <input
                                            value={formData.founderName}
                                            onChange={(e) => updateData('founderName', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                        />
                                        {errors.founderName && <p className="text-xs text-red-500">{errors.founderName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Official Email</label>
                                        <input
                                            type="email"
                                            value={formData.officialEmail}
                                            onChange={(e) => updateData('officialEmail', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                        />
                                        {errors.officialEmail && <p className="text-xs text-red-500">{errors.officialEmail}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Create Password</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => updateData('password', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                            placeholder="Min. 6 characters"
                                        />
                                        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => updateData('address', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                        />
                                        {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                                    </div>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50">
                                        <p className="text-sm font-medium text-blue-600">Upload Registration / Legal Documents</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, JPG up to 10MB</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {orgType === 'offline' && step === 5 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900">Confirm Submission</h2>
                                <p className="text-gray-600">
                                    Your application for <strong>{formData.orgName}</strong> is ready to submit.
                                    Our team will review your documents and contact you at <strong>{formData.officialEmail}</strong>.
                                </p>
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
                        <button
                            onClick={() => step === 1 ? router.push('/teacher-type') : setStep(prev => (prev - 1) as Step)}
                            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={loading}
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    {(orgType === 'offline' && step === 5) || (orgType === 'online' && step === 6) ? 'Submit' : 'Next'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
