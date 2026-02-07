"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile, Profile } from '@/lib/api';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import {
    Loader2, User, Save, Camera, Mail,
    MapPin, GraduationCap, Award, Clock,
    Sparkles, Target,
    CheckCircle2, AlertCircle, X, Plus,
    Layout, Zap
} from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        school: '',
        grade: '',
        phone: '',
        location: '',
        about_me: '',
        curiosities: '',
        learning_now: '',
        future_goals: '',
        learning_goals: '',
        learning_style: '',
        availability: '',
        age: '',
        dob: '',
        interests: [] as string[]
    });

    const [newInterest, setNewInterest] = useState('');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    // Pre-defined Animal Avatars (using DiceBear for extensive, cute options)
    const ANIMAL_AVATARS = [
        "https://api.dicebear.com/7.x/notionists/svg?seed=Bear&backgroundColor=e5f3ff",
        "https://api.dicebear.com/7.x/notionists/svg?seed=Cat&backgroundColor=ffe5ec",
        "https://api.dicebear.com/7.x/notionists/svg?seed=Dog&backgroundColor=e6fffa",
        "https://api.dicebear.com/7.x/notionists/svg?seed=Fox&backgroundColor=fffbeb",
        "https://api.dicebear.com/7.x/notionists/svg?seed=Rabbit&backgroundColor=f3e8ff",
        "https://api.dicebear.com/7.x/notionists/svg?seed=Lion&backgroundColor=ffedd5",
        "https://api.dicebear.com/7.x/notionists/svg?seed=Panda&backgroundColor=f1f5f9",
        "https://api.dicebear.com/7.x/notionists/svg?seed=Koala&backgroundColor=e0e7ff"
    ];

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;

            try {
                const data = await getUserProfile(user.id);
                if (data) {
                    setProfile(data);
                    setAvatarUrl(data.avatar_url || '');
                    setFormData({
                        full_name: String(data.full_name || user.user_metadata?.full_name || ''),
                        school: String(data.school || ''),
                        grade: String(data.grade || ''),
                        phone: String(data.phone || ''),
                        location: String(data.location || ''),
                        about_me: String(data.about_me || ''),
                        curiosities: String(data.curiosities || ''),
                        learning_now: String(data.learning_now || ''),
                        future_goals: String(data.future_goals || ''),
                        learning_goals: String(data.learning_goals || ''),
                        learning_style: String(data.learning_style || ''),
                        availability: String(data.availability || ''),
                        age: String(data.age || ''),
                        dob: String(data.dob || ''),
                        interests: Array.isArray(data.interests) ? data.interests : []
                    });
                } else {
                    // Pre-fill with Google Metadata if no saved profile exists
                    setFormData(prev => ({
                        ...prev,
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                    }));
                    setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || '');
                }
            } catch (error: any) {
                console.error("Detailed error loading profile:", {
                    message: error?.message,
                    error: error,
                    stack: error?.stack
                });
                toast.error(`Failed to load profile: ${error?.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [user]);

    const handleAvatarSelect = (url: string) => {
        setAvatarUrl(url);
        setShowAvatarPicker(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
                setShowAvatarPicker(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addInterest = () => {
        if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
            setFormData(prev => ({
                ...prev,
                interests: [...prev.interests, newInterest.trim()]
            }));
            setNewInterest('');
        }
    };

    const removeInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== interest)
        }));
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                full_name: String(profile.full_name || user?.user_metadata?.full_name || ''),
                school: String(profile.school || ''),
                grade: String(profile.grade || ''),
                phone: String(profile.phone || ''),
                location: String(profile.location || ''),
                about_me: String(profile.about_me || ''),
                curiosities: String(profile.curiosities || ''),
                learning_now: String(profile.learning_now || ''),
                future_goals: String(profile.future_goals || ''),
                learning_goals: String(profile.learning_goals || ''),
                learning_style: String(profile.learning_style || ''),
                availability: String(profile.availability || ''),
                age: String(profile.age || ''),
                dob: String(profile.dob || ''),
                interests: Array.isArray(profile.interests) ? profile.interests : []
            });
            setAvatarUrl(profile.avatar_url || '');
            toast.info("Changes discarded");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const updates = {
                ...formData,
                avatar_url: avatarUrl
            };
            const updatedProfile = await updateUserProfile(user.id, updates);
            if (updatedProfile) {
                setProfile(updatedProfile);
                toast.success("Profile updated successfully!");
            } else {
                throw new Error("Update failed");
            }
        } catch (error: any) {
            console.error("Detailed error updating profile:", {
                message: error?.message,
                error: error,
                stack: error?.stack
            });
            toast.error(`Failed to update profile: ${error?.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    // Calculate Completion
    const fieldsToTrack = [
        'full_name', 'school', 'grade', 'location',
        'about_me', 'curiosities', 'learning_now',
        'future_goals', 'learning_goals', 'learning_style'
    ];
    const completedFields = fieldsToTrack.filter(f => !!formData[f as keyof typeof formData]);
    const completionPercentage = fieldsToTrack.length > 0 ? Math.round((completedFields.length / fieldsToTrack.length) * 100) : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10 pb-20">

                {/* 1. Identity & Trust (Above the fold) */}
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-40 group-hover:opacity-60 transition-opacity"></div>

                    <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
                        {/* Profile Photo */}
                        <div className="relative group/avatar">
                            <div className="w-44 h-44 rounded-[2.5rem] bg-indigo-50 overflow-hidden border-8 border-white shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-200">
                                        <User className="w-20 h-20" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    if (user?.email_confirmed_at) {
                                        setShowAvatarPicker(true);
                                    } else {
                                        toast.error("Please verify your email to change your avatar.");
                                    }
                                }}
                                className={`absolute bottom-2 right-2 p-3 rounded-2xl shadow-xl transition-all ${user?.email_confirmed_at
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110 cursor-pointer'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                title={user?.email_confirmed_at ? "Change Avatar" : "Verify email to change avatar"}
                            >
                                <Camera className="w-5 h-5" />
                            </button>

                            {/* Avatar Picker Modal - Full Screen Overlay */}
                            {showAvatarPicker && user?.email_confirmed_at && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-indigo-100 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                                        {/* Close button */}
                                        <button
                                            onClick={() => setShowAvatarPicker(false)}
                                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>

                                        <h4 className="text-xl font-bold text-gray-900 mb-6">Choose Your Avatar</h4>

                                        {/* Upload Custom */}
                                        <div className="mb-6">
                                            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Upload Custom Image</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                    className="block w-full text-sm text-slate-700 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer transition-all border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-indigo-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="flex-1 h-px bg-gray-200"></div>
                                            <span className="text-xs font-bold text-gray-400 uppercase">Or Choose</span>
                                            <div className="flex-1 h-px bg-gray-200"></div>
                                        </div>

                                        {/* Animal Avatars */}
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Pick an Animal Avatar</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {ANIMAL_AVATARS.map((url, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleAvatarSelect(url)}
                                                        className="aspect-square rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:scale-105 transition-all border-2 border-transparent hover:border-indigo-300 overflow-hidden group"
                                                    >
                                                        <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Name & Basic Info */}
                        <div className="flex-1 text-center lg:text-left space-y-4">
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name || ''}
                                onChange={handleChange}
                                placeholder="Your Full Name"
                                className="text-4xl font-black text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl w-full"
                            />
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-gray-500 font-bold text-sm">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl group/field">
                                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                                    <input
                                        type="text"
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        placeholder="Grade/Level"
                                        className="bg-transparent border-none outline-none focus:ring-0 w-24 font-bold"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <Clock className="w-4 h-4 text-rose-500" />
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="Age"
                                        className="bg-transparent border-none outline-none focus:ring-0 w-12 font-bold"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="bg-transparent border-none outline-none focus:ring-0 w-32 font-bold text-xs"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <MapPin className="w-4 h-4 text-amber-500" />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Location"
                                        className="bg-transparent border-none outline-none focus:ring-0 w-24 font-bold"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <Mail className="w-4 h-4 text-indigo-400" />
                                    {user?.email}
                                </div>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                                {user?.email_confirmed_at ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                        <CheckCircle2 className="w-3 h-3" /> Email Verified
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                            <AlertCircle className="w-3 h-3" /> Email Unverified
                                        </span>
                                        <button
                                            onClick={async () => {
                                                const { getSupabase } = await import('@/lib/supabase');
                                                const supabase = getSupabase();
                                                if (supabase && user?.email) {
                                                    const { error } = await supabase.auth.resend({
                                                        type: 'signup',
                                                        email: user.email,
                                                    });
                                                    if (error) toast.error("Failed to send verification email: " + error.message);
                                                    else toast.success("Verification email sent! Check your inbox.");
                                                }
                                            }}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                                        >
                                            Resend Link
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Completion */}
                        <div className="w-full lg:w-72 bg-amber-50 rounded-[2.5rem] p-8 text-gray-900 border border-amber-100 shadow-lg relative overflow-hidden">
                            <Zap className="absolute -bottom-8 -right-8 w-32 h-32 text-amber-500/20 -rotate-12" />
                            <div className="relative z-10 text-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Profile Strength</div>
                                <div className="text-4xl font-black mb-4 text-gray-900">{completionPercentage}%</div>
                                <div className="h-3 w-full bg-amber-200/50 rounded-full overflow-hidden mb-4 p-0.5">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                        style={{ width: `${completionPercentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold">Complete your profile to unlock premium teacher recommendations</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    <div className="lg:col-span-2 space-y-10">
                        {/* 2. About Me Section (Human) */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-amber-500" />
                                About Me
                            </h2>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Brief Intro</label>
                                    <textarea
                                        name="about_me"
                                        value={formData.about_me}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="E.g. Class 11 student interested in AI and startups..."
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-gray-700 resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">What I'm Curious About</label>
                                        <input
                                            name="curiosities"
                                            value={formData.curiosities}
                                            onChange={handleChange}
                                            placeholder="Quantum Physics, Ethics, etc."
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">What I'm Learning Right Now</label>
                                        <input
                                            name="learning_now"
                                            value={formData.learning_now}
                                            onChange={handleChange}
                                            placeholder="React Native, Calculus..."
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-gray-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Future Goals</label>
                                    <input
                                        name="future_goals"
                                        value={formData.future_goals}
                                        onChange={handleChange}
                                        placeholder="I want to become a Lead AI Engineer or founder..."
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Learning Preferences & Interests */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <Target className="w-6 h-6 text-indigo-500" />
                                Learning Preferences
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Learning Goal</label>
                                    <select
                                        name="learning_goals"
                                        value={formData.learning_goals}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select a goal</option>
                                        <option value="Exam Prep">Exam Preparation</option>
                                        <option value="Skill Building">Skill Building</option>
                                        <option value="Career Exploration">Career Exploration</option>
                                        <option value="Personal Projects">Building Projects</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Preferred Style</label>
                                    <select
                                        name="learning_style"
                                        value={formData.learning_style}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select a style</option>
                                        <option value="1-on-1">1-on-1 Mentorship</option>
                                        <option value="Small Group">Small Group Session</option>
                                        <option value="Recorded + Live">Self-paced + Live Q&A</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Availability</label>
                                    <select
                                        name="availability"
                                        value={formData.availability}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                                    >
                                        <option value="">Select availability</option>
                                        <option value="Weekdays">Weekdays Only</option>
                                        <option value="Weekends">Weekends Only</option>
                                        <option value="Evenings">Evenings (6 PM - 10 PM)</option>
                                        <option value="Flexible">I'm Flexible</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium text-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Interests (Tags) */}
                            <div className="mt-8 space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Interests (Skills & Hobbies)</label>
                                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-[2rem] border border-gray-100 focus-within:bg-white transition-all">
                                    {formData.interests.map(interest => (
                                        <span key={interest} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold group">
                                            {interest}
                                            <button onClick={() => removeInterest(interest)} className="hover:text-indigo-200 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <div className="flex items-center flex-1 min-w-[120px]">
                                        <input
                                            type="text"
                                            value={newInterest}
                                            onChange={(e) => setNewInterest(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                                            placeholder="Type and hit Enter..."
                                            className="w-full bg-transparent border-none focus:outline-none text-sm px-2 font-medium"
                                        />
                                        <button onClick={addInterest} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                                            <Plus className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: 4. Activity & Progress Summary */}
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="w-full py-4 bg-gray-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Everything
                            </button>
                            <button
                                onClick={handleCancel}
                                className="w-full py-4 bg-white border border-gray-100 text-gray-400 font-bold rounded-[2rem] hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center gap-3"
                            >
                                <X className="w-5 h-5" />
                                Cancel Changes
                            </button>
                        </div>

                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}

export default ProfilePage;
