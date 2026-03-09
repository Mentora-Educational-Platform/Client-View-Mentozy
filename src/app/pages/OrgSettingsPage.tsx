import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { User, Building, ExternalLink, Globe, Lock, Save, Camera, CreditCard, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function OrgSettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const [formData, setFormData] = useState({
        orgName: '',
        founderName: '',
        email: '',
        website: '',
        address: '',
        domain: '',
        bio: '',
        logoUrl: ''
    });

    useEffect(() => {
        const fetchOrgDetails = async () => {
            if (!user?.id || !supabase) return;

            setFormData(prev => ({ ...prev, email: user.email || '' }));

            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (profileData) {
                setFormData(prev => ({ ...prev, orgName: profileData.full_name, logoUrl: profileData.avatar_url || '' }));
            }

            const { data: mentorData } = await supabase.from('mentors').select('*').eq('user_id', user.id).single();
            if (mentorData && mentorData.bio) {
                try {
                    const bioData = typeof mentorData.bio === 'string' ? JSON.parse(mentorData.bio) : mentorData.bio;
                    setFormData(prev => ({
                        ...prev,
                        founderName: bioData.founder || '',
                        website: bioData.website || '',
                        address: bioData.address || '',
                        domain: bioData.domain || '',
                    }));
                } catch (e) {
                    setFormData(prev => ({ ...prev, bio: mentorData.bio }));
                }
            }
        };

        fetchOrgDetails();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!user?.id || !supabase) return;

        try {
            // Update auth email if changed (not implemented fully here, requires extra steps)

            // Update Profile
            await supabase.from('profiles').update({
                full_name: formData.orgName,
                avatar_url: formData.logoUrl
            }).eq('id', user.id);

            // Update Mentor / Org table
            const newBioObj = {
                type: 'online', // Keep orgType safe
                founder: formData.founderName,
                website: formData.website,
                address: formData.address,
                domain: formData.domain,
                logo: formData.logoUrl
            };

            await supabase.from('mentors').update({
                company: formData.orgName,
                bio: JSON.stringify(newBioObj)
            }).eq('user_id', user.id);

            toast.success("Settings saved successfully!");
        } catch (error) {
            toast.error("Failed to save settings");
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Organisation Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your institution profile, billing, and team security.</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar pb-px">
                    <button onClick={() => setActiveTab('profile')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        <Building className="w-4 h-4" /> Institute Profile
                    </button>
                    <button onClick={() => setActiveTab('security')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'security' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        <Lock className="w-4 h-4" /> Security & Passwords
                    </button>
                    <button onClick={() => setActiveTab('billing')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'billing' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        <CreditCard className="w-4 h-4" /> Billing & Plans
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'notifications' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        <Bell className="w-4 h-4" /> Notifications
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">

                    {/* TAB: PROFILE */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

                            {/* Logo Section */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Org Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <button className="absolute -bottom-3 -right-3 p-2 bg-indigo-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-indigo-700">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Institute Logo</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mt-1">This will be displayed on teacher profiles, student dashboards, and your public landing page. Recommended 500x500px.</p>
                                </div>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Organisation Name</label>
                                    <input type="text" name="orgName" value={formData.orgName} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Springfield Academy" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Founder/Admin Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input type="text" name="founderName" value={formData.founderName} onChange={handleChange} className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none" placeholder="Primary Contact" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Official Email</label>
                                    <div className="relative">
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none" placeholder="contact@institute.com" disabled />
                                        <p className="text-xs text-amber-600 mt-1">To change your primary email, contact support.</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Website</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Globe className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none" placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700">Physical Address / Headquarters</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none" placeholder="123 Education Lane..." />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700">Teaching Domain</label>
                                    <input type="text" name="domain" value={formData.domain} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Higher Education, Coding, K-12" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <button className="px-6 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {activeTab !== 'profile' && (
                        <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
                                {activeTab === 'security' && <Lock className="w-8 h-8" />}
                                {activeTab === 'billing' && <CreditCard className="w-8 h-8" />}
                                {activeTab === 'notifications' && <Bell className="w-8 h-8" />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                            <p className="text-gray-500 max-w-md">The {activeTab} settings panel is currently under construction and will be available in the next Mentozy update.</p>
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}

export default OrgSettingsPage;
