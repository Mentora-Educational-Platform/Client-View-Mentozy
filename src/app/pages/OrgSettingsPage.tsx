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
            <div className="max-w-4xl mx-auto space-y-8 font-mono text-gray-900">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#eff3ff] border-4 border-gray-900 p-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900">ORGANISATION SETTINGS</h1>
                        <p className="text-sm font-bold text-gray-700 mt-2">Manage your institution profile, billing, and security.</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto border-b-4 border-gray-900 gap-2 pb-0">
                    <button 
                        onClick={() => setActiveTab('profile')} 
                        className={`px-5 py-3 text-sm font-black flex items-center gap-2 whitespace-nowrap transition-colors border-2 border-b-0 border-gray-900 ${
                            activeTab === 'profile' 
                                ? 'bg-[#eff3ff] text-gray-900 translate-y-[4px]' 
                                : 'bg-white text-gray-500 hover:text-gray-900'
                        }`}
                        style={{ borderBottom: activeTab === 'profile' ? '4px solid #FAF9F6' : undefined }}
                    >
                        <Building className="w-4 h-4" /> PROFILE
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')} 
                        className={`px-5 py-3 text-sm font-black flex items-center gap-2 whitespace-nowrap transition-colors border-2 border-b-0 border-gray-900 ${
                            activeTab === 'security' 
                                ? 'bg-[#eff3ff] text-gray-900 translate-y-[4px]' 
                                : 'bg-white text-gray-500 hover:text-gray-900'
                        }`}
                        style={{ borderBottom: activeTab === 'security' ? '4px solid #FAF9F6' : undefined }}
                    >
                        <Lock className="w-4 h-4" /> SECURITY
                    </button>
                    <button 
                        onClick={() => setActiveTab('billing')} 
                        className={`px-5 py-3 text-sm font-black flex items-center gap-2 whitespace-nowrap transition-colors border-2 border-b-0 border-gray-900 ${
                            activeTab === 'billing' 
                                ? 'bg-[#eff3ff] text-gray-900 translate-y-[4px]' 
                                : 'bg-white text-gray-500 hover:text-gray-900'
                        }`}
                        style={{ borderBottom: activeTab === 'billing' ? '4px solid #FAF9F6' : undefined }}
                    >
                        <CreditCard className="w-4 h-4" /> BILLING
                    </button>
                    <button 
                        onClick={() => setActiveTab('notifications')} 
                        className={`px-5 py-3 text-sm font-black flex items-center gap-2 whitespace-nowrap transition-colors border-2 border-b-0 border-gray-900 ${
                            activeTab === 'notifications' 
                                ? 'bg-[#eff3ff] text-gray-900 translate-y-[4px]' 
                                : 'bg-white text-gray-500 hover:text-gray-900'
                        }`}
                        style={{ borderBottom: activeTab === 'notifications' ? '4px solid #FAF9F6' : undefined }}
                    >
                        <Bell className="w-4 h-4" /> NOTIFICATIONS
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 md:p-8">

                    {/* TAB: PROFILE */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8">

                            {/* Logo Section */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b-4 border-gray-900">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-[#FAF9F6] border-4 border-gray-900 flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                        {formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Org Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building className="w-8 h-8 text-gray-900" />
                                        )}
                                    </div>
                                    <button className="absolute -bottom-3 -right-3 p-2 bg-[#eff3ff] border-2 border-gray-900 text-gray-900 rounded-none shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff]/80 transition-colors">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-gray-900 uppercase">Institute Logo</h3>
                                    <p className="text-xs text-gray-600 font-bold max-w-sm mt-2 leading-relaxed">This will be displayed on teacher profiles, student dashboards, and your public landing page. Recommended 500x500px.</p>
                                </div>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-900 uppercase">Organisation Name</label>
                                    <input 
                                        type="text" 
                                        name="orgName" 
                                        value={formData.orgName} 
                                        onChange={handleChange} 
                                        className="w-full p-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] font-bold text-gray-900 bg-[#FAF9F6] shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                                        placeholder="e.g. Springfield Academy" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-900 uppercase">Founder/Admin Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-gray-900" />
                                        </div>
                                        <input 
                                            type="text" 
                                            name="founderName" 
                                            value={formData.founderName} 
                                            onChange={handleChange} 
                                            className="w-full pl-10 p-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] font-bold text-gray-900 bg-[#FAF9F6] shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                                            placeholder="Primary Contact" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-900 uppercase">Official Email</label>
                                    <div className="relative">
                                        <input 
                                            type="email" 
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            className="w-full p-3 border-2 border-gray-900 bg-gray-100 font-bold text-gray-500 shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                                            placeholder="contact@institute.com" 
                                            disabled 
                                        />
                                        <p className="text-[10px] text-rose-600 font-black mt-2 uppercase">To change your primary email, contact support.</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-900 uppercase">Website</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Globe className="h-4 w-4 text-gray-900" />
                                        </div>
                                        <input 
                                            type="text" 
                                            name="website" 
                                            value={formData.website} 
                                            onChange={handleChange} 
                                            className="w-full pl-10 p-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] font-bold text-gray-900 bg-[#FAF9F6] shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                                            placeholder="https://..." 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-black text-gray-900 uppercase">Physical Address / Headquarters</label>
                                    <input 
                                        type="text" 
                                        name="address" 
                                        value={formData.address} 
                                        onChange={handleChange} 
                                        className="w-full p-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] font-bold text-gray-900 bg-[#FAF9F6] shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                                        placeholder="123 Education Lane..." 
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-black text-gray-900 uppercase">Teaching Domain</label>
                                    <input 
                                        type="text" 
                                        name="domain" 
                                        value={formData.domain} 
                                        onChange={handleChange} 
                                        className="w-full p-3 border-2 border-gray-900 focus:outline-none focus:bg-[#eff3ff] font-bold text-gray-900 bg-[#FAF9F6] shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                                        placeholder="e.g. Higher Education, Coding, K-12" 
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t-4 border-gray-900 flex justify-end gap-3">
                                <button className="px-6 py-2.5 border-2 border-gray-900 bg-white text-gray-900 font-black hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                    CANCEL
                                </button>
                                <button 
                                    onClick={handleSave} 
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#eff3ff] border-2 border-gray-900 text-gray-900 font-black hover:bg-[#eff3ff]/80 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"
                                >
                                    <Save className="w-4 h-4" />
                                    SAVE CHANGES
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {activeTab !== 'profile' && (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-[#eff3ff] border-4 border-gray-900 flex items-center justify-center text-gray-900 mb-6 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                {activeTab === 'security' && <Lock className="w-8 h-8" />}
                                {activeTab === 'billing' && <CreditCard className="w-8 h-8" />}
                                {activeTab === 'notifications' && <Bell className="w-8 h-8" />}
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase">Coming Soon</h3>
                            <p className="text-sm font-bold text-gray-600 max-w-md uppercase">The {activeTab} settings panel is currently under construction.</p>
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}

export default OrgSettingsPage;

