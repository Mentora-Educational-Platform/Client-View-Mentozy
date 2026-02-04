import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, Profile } from '../../lib/api';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import {
    Loader2, User, Save, Building, DollarSign,
    Briefcase, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { getSupabase } from '../../lib/supabase';

export function MentorProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Mentor specific state
    const [mentorDetails, setMentorDetails] = useState({
        hourly_rate: '',
        company: '',
        bio: '',
        expertise: ''
    });

    const [formData, setFormData] = useState({
        full_name: '',
        title: '',
        location: '',
    });

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;
            try {
                const data = await getUserProfile(user.id);
                if (data) {
                    setProfile(data);
                    setFormData({
                        full_name: data.full_name || '',
                        title: data.curiosities || '', // Reusing curiosities field for Title/Role for simplicity in this demo
                        location: data.location || '',
                    });
                }

                // Load detail mentor stats
                const supabase = getSupabase();
                if (supabase) {
                    const { data: mentorData } = await supabase
                        .from('mentors')
                        .select('hourly_rate, company, bio')
                        .eq('user_id', user.id)
                        .single();

                    if (mentorData) {
                        setMentorDetails({
                            hourly_rate: mentorData.hourly_rate || '',
                            company: mentorData.company || '',
                            bio: mentorData.bio || '',
                            expertise: 'AI, Machine Learning, Data Science' // Hardcoded for demo if not in DB
                        });
                    }
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name in formData) {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            setMentorDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        try {
            // Update Base Profile
            await updateUserProfile(user.id, {
                full_name: formData.full_name,
                location: formData.location,
                curiosities: formData.title // Mapping Title back to curiosities
            });

            // Update Mentor Details (Mocking the DB update for mentor table if API is not fully exposed)
            const supabase = getSupabase();
            if (supabase) {
                await supabase.from('mentors').update({
                    hourly_rate: parseFloat(mentorDetails.hourly_rate),
                    company: mentorDetails.company,
                    bio: mentorDetails.bio
                }).eq('user_id', user.id);
            }

            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto pb-20">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Header Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20"></div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar */}
                            <div className="w-32 h-32 rounded-[2rem] bg-indigo-100 flex items-center justify-center border-4 border-white shadow-lg text-indigo-500">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-[2rem]" />
                                ) : (
                                    <User className="w-12 h-12" />
                                )}
                            </div>

                            {/* Main Info Inputs */}
                            <div className="flex-1 w-full space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="w-full text-3xl font-black text-gray-900 bg-transparent border-none p-0 focus:ring-0 placeholder-gray-300"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Briefcase className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Professional Title</span>
                                        </div>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-700 focus:ring-0"
                                            placeholder="Ex. Senior AI Researcher"
                                        />
                                    </div>
                                    <div className="bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Building className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Company / Org</span>
                                        </div>
                                        <input
                                            type="text"
                                            name="company"
                                            value={mentorDetails.company}
                                            onChange={handleChange}
                                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-700 focus:ring-0"
                                            placeholder="Ex. DeepMind"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Bio & About - Spans 2 cols */}
                        <div className="md:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    About & Expertise
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Short Bio</label>
                                        <textarea
                                            name="bio"
                                            value={mentorDetails.bio}
                                            onChange={handleChange}
                                            rows={6}
                                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                            placeholder="Tell potential students about your experience and teaching style..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Key Skills (Comma separated)</label>
                                        <input
                                            type="text"
                                            value={mentorDetails.expertise}
                                            readOnly // For now
                                            className="w-full bg-indigo-50 border-indigo-100 rounded-xl p-3 text-sm font-bold text-indigo-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Settings */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Settings</h3>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hourly Rate ($)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                                            <input
                                                type="number"
                                                name="hourly_rate"
                                                value={mentorDetails.hourly_rate}
                                                onChange={handleChange}
                                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border-gray-100 rounded-xl font-bold text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full mt-8 bg-gray-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-gray-900/20 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </DashboardLayout>
    );
}
