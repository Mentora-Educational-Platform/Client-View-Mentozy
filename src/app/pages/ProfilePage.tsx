import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, Profile } from '../../lib/api';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import {
    Loader2, User, Save, Camera, Mail,
    MapPin, GraduationCap, Award, Clock,
    Target,
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
        interests: [] as string[]
    });

    const [newInterest, setNewInterest] = useState('');

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;
            try {
                const data = await getUserProfile(user.id);
                if (data) {
                    setProfile(data);
                    setFormData({
                        full_name: data.full_name || '',
                        school: data.school || '',
                        grade: data.grade || '',
                        phone: data.phone || '',
                        location: data.location || '',
                        about_me: data.about_me || '',
                        curiosities: data.curiosities || '',
                        learning_now: data.learning_now || '',
                        future_goals: data.future_goals || '',
                        learning_goals: data.learning_goals || '',
                        learning_style: data.learning_style || '',
                        availability: data.availability || '',
                        age: data.age || '',
                        interests: data.interests || []
                    });
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [user]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const updatedProfile = await updateUserProfile(user.id, formData);
            if (updatedProfile) {
                setProfile(updatedProfile);
                toast.success("Profile updated successfully!");
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
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
    const completionPercentage = Math.round((completedFields.length / fieldsToTrack.length) * 100);

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
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-200">
                                        <User className="w-20 h-20" />
                                    </div>
                                )}
                            </div>
                            <button onClick={() => toast.info("Profile photo upload coming soon!")} className="absolute bottom-2 right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all hover:scale-110">
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Name & Basic Info */}
                        <div className="flex-1 text-center lg:text-left space-y-4">
                            <div className="relative group/name inline-block w-full">
                                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1 lg:hidden block">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Your Full Name"
                                    className="text-4xl font-black text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-500 focus:ring-0 rounded-none w-full transition-all placeholder:text-gray-300"
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/name:opacity-100 transition-opacity pointer-events-none">
                                    <span className="text-xs text-gray-400 font-medium">Click to edit</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-gray-500 font-bold text-sm">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl group/field hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 cursor-text" onClick={() => document.getElementsByName('grade')[0]?.focus()}>
                                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                                    <input
                                        type="text"
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        placeholder="Grade"
                                        className="bg-transparent border-none outline-none focus:ring-0 w-24 font-bold text-gray-700 placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl group/field hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 cursor-text" onClick={() => document.getElementsByName('age')[0]?.focus()}>
                                    <Clock className="w-4 h-4 text-rose-500" />
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="Age"
                                        className="bg-transparent border-none outline-none focus:ring-0 w-12 font-bold text-gray-700 placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl group/field hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 cursor-text" onClick={() => document.getElementsByName('location')[0]?.focus()}>
                                    <MapPin className="w-4 h-4 text-amber-500" />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Location"
                                        className="bg-transparent border-none outline-none focus:ring-0 w-32 font-bold text-gray-700 placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl opacity-70 cursor-not-allowed">
                                    <Mail className="w-4 h-4 text-indigo-400" />
                                    {user?.email}
                                </div>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                    <CheckCircle2 className="w-3 h-3" /> Email Verified
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                    <AlertCircle className="w-3 h-3" /> Parent Unverified
                                </span>
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
                        {/* Progress Summary Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-indigo-100/50 relative overflow-hidden">
                            <Layout className="absolute -bottom-6 -right-6 w-32 h-32 text-gray-50 -rotate-12" />
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                                Growth Engine
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>Course Completion</span>
                                        <span className="text-indigo-600">85%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[85%] shadow-sm"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>Skill Points</span>
                                        <span className="text-emerald-600">12,490 XP</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[60%] shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4 relative z-10">
                                <div>
                                    <div className="text-2xl font-black text-gray-900">14</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Streak</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-gray-900">28</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modules</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Badges Placeholder */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-500" />
                                Recent Badges
                            </h3>
                            <div className="flex gap-4">

                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-100 shadow-sm hover:scale-110 transition-transform">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm hover:scale-110 transition-transform">
                                    <Zap className="w-6 h-6" />
                                </div>
                            </div>
                            <button onClick={() => toast.info("Portfolio feature coming soon!")} className="w-full mt-8 py-3 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
                                View Portfolio
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="w-full py-4 bg-gray-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Everything
                            </button>
                            <button onClick={() => { window.location.reload(); toast.info("Changes discarded"); }} className="w-full py-4 bg-white border border-gray-100 text-gray-400 font-bold rounded-[2rem] hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center gap-3">
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
