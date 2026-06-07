import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Moon, Sun, Key, Mail,
    MessageCircle, LogOut, Trash2,
    ChevronRight, Shield, FileText,
    HelpCircle, ExternalLink, Globe,
    Bell, Lock, User, Briefcase, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { getSupabase } from '../../lib/supabase';
import { getMentorByUserId, updateMentorStatus } from '../../lib/api';

export function SettingsPage() {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { mode, activeOrganization } = useOrganizationMode();
    const isOrgMode = mode === 'organization' && activeOrganization;
    const isMentorView = location.pathname.includes('mentor');

    // Mentor Specific State
    const [mentorData, setMentorData] = useState<any>(null);
    const [mentorLoading, setMentorLoading] = useState(isMentorView);

    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    // Load Mentor Data if applicable
    useEffect(() => {
        const loadMentorData = async () => {
            if (isMentorView && user?.id) {
                const data = await getMentorByUserId(user.id);
                setMentorData(data);
                setMentorLoading(false);
            }
        };
        loadMentorData();
    }, [isMentorView, user]);

    // Toggle Theme
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleForgotPassword = async () => {
        if (!user?.email) return;
        const supabase = getSupabase();
        if (!supabase) return;

        // Dynamic redirect based on view
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password reset email sent!");
        }
    };

    const handleGetVerified = async () => {
        if (!user?.email) return;
        const supabase = getSupabase();
        if (!supabase) return;

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: user.email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) {
            toast.error(error.message || "Failed to send verification email");
        } else {
            toast.success("Verification link sent! Please check your email inbox.");
        }
    };

    const handleToggleAvailability = async () => {
        if (!user?.id || !mentorData) return;
        const newStatus = mentorData.status === 'unavailable' ? 'active' : 'unavailable';

        // Optimistic Update
        setMentorData({ ...mentorData, status: newStatus });

        const success = await updateMentorStatus(user.id, newStatus);
        if (success) {
            toast.success(`Availability updated: You are now ${newStatus === 'active' ? 'Online' : 'Offline'}`);
        } else {
            toast.error("Failed to update availability");
            setMentorData({ ...mentorData }); // Revert
        }
    };

    const handleDeleteAccount = () => {
        toast.error("Account deletion requested. Our support team will process your request within 48 hours for security reasons.");
    };

    const SettingSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon: any }) => (
        <div className={`bg-white border overflow-hidden mb-6 ${isOrgMode ? 'border-2 border-gray-900 rounded-3xl shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]' : 'rounded-[2rem] border-gray-100 shadow-sm'}`}>
            <div className={`px-8 py-6 border-b flex items-center gap-3 ${isOrgMode ? 'border-gray-900 bg-[#E0F2FE]' : 'border-gray-50 bg-indigo-50/10'}`}>
                <div className={`p-2 rounded-xl ${isOrgMode ? 'border-2 border-gray-900 bg-white text-blue-700 shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-gray-900">{title}</h3>
            </div>
            <div className="p-8 space-y-6">
                {children}
            </div>
        </div>
    );

    const SettingItem = ({
        label,
        description,
        action,
        toggle,
        isToggled,
        onToggle,
        icon: ItemIcon
    }: {
        label: string,
        description?: string,
        action?: () => void,
        toggle?: boolean,
        isToggled?: boolean,
        onToggle?: () => void,
        icon?: any
    }) => (
        <div className="flex items-center justify-between group text-left">
            <div className="flex gap-4">
                {ItemIcon && (
                    <div className={`mt-1 p-2 rounded-lg transition-colors ${
                        isOrgMode 
                            ? 'border-2 border-gray-900 bg-white text-gray-800 shadow-[1px_1px_0px_rgba(0,0,0,1)]' 
                            : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                    }`}>
                        <ItemIcon className="w-4 h-4" />
                    </div>
                )}
                <div className="max-w-[180px] sm:max-w-xs">
                    <h4 className="font-black text-gray-900 text-sm whitespace-nowrap">{label}</h4>
                    {description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>}
                </div>
            </div>
            {toggle !== undefined ? (
                <button
                    onClick={onToggle}
                    className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                        isToggled ? 'bg-indigo-650 bg-indigo-600' : 'bg-gray-200'
                    } ${isOrgMode ? 'border-2 border-gray-900' : ''}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isToggled ? 'left-7' : 'left-1'} ${isOrgMode ? 'top-0.5 border border-gray-900' : ''}`} />
                </button>
            ) : action ? (
                <button
                    onClick={action}
                    className={`p-2 rounded-xl transition-colors text-gray-400 hover:text-indigo-600 flex-shrink-0 ${isOrgMode ? 'hover:bg-gray-50 border border-transparent hover:border-gray-900' : 'hover:bg-gray-50'}`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            ) : null}
        </div>
    );

    return (
        <DashboardLayout>
            <div className={`max-w-4xl mx-auto space-y-8 pb-12 ${isOrgMode ? 'font-mono text-gray-900 select-none bg-[#FAF9F6] p-4 sm:p-8 min-h-screen rounded-3xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-gray-150 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
                        <p className="text-gray-500 mt-1 font-medium">Manage your account preferences and security.</p>
                    </div>
                    <div className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest ${isOrgMode ? 'border-2 border-gray-900 rounded-lg bg-[#FFEDD5] text-orange-950' : 'bg-amber-50 text-amber-700 rounded-xl border border-amber-100'}`}>
                        {isMentorView ? 'Mentor Account' : 'Student Account'}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="md:col-span-1 space-y-2">
                        <button className={`w-full flex items-center gap-3 px-6 py-4 font-bold text-sm transition-transform active:scale-95 ${
                            isOrgMode 
                                ? 'bg-gray-900 text-white rounded-xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                                : 'bg-gray-900 text-white rounded-[1.5rem] shadow-xl shadow-gray-200'
                        }`}>
                            <User className="w-5 h-5" />
                            General
                        </button>
                        <button onClick={() => toast.info("Notification settings coming soon")} className={`w-full flex items-center gap-3 px-6 py-4 font-bold text-sm transition-all border ${
                            isOrgMode 
                                ? 'bg-white text-gray-700 border-2 border-gray-900 rounded-xl hover:bg-gray-50' 
                                : 'bg-white text-gray-500 hover:bg-gray-50 border-transparent hover:border-gray-100 rounded-[1.5rem]'
                        }`}>
                            <Bell className="w-5 h-5" />
                            Notifications
                        </button>
                        <button onClick={() => toast.info("Privacy settings coming soon")} className={`w-full flex items-center gap-3 px-6 py-4 font-bold text-sm transition-all border ${
                            isOrgMode 
                                ? 'bg-white text-gray-700 border-2 border-gray-900 rounded-xl hover:bg-gray-50' 
                                : 'bg-white text-gray-500 hover:bg-gray-50 border-transparent hover:border-gray-100 rounded-[1.5rem]'
                        }`}>
                            <Lock className="w-5 h-5" />
                            Privacy
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2">

                        {/* Mentor Preferences */}
                        {isMentorView && (
                            <SettingSection title="Mentor Preferences" icon={Briefcase}>
                                {mentorLoading ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Shield className="w-6 h-6 text-gray-200 animate-pulse" />
                                    </div>
                                ) : (
                                    <>
                                        <SettingItem
                                            label="Public Availability"
                                            description="Toggle your profile visibility in search results."
                                            toggle={true}
                                            isToggled={mentorData?.status !== 'unavailable'}
                                            onToggle={handleToggleAvailability}
                                            icon={User}
                                        />
                                        <div className="pt-4 border-t border-gray-50">
                                            <SettingItem
                                                label="Hourly Rate"
                                                description={`Current: $${mentorData?.hourly_rate || 0}/hr`}
                                                action={() => toast.info("Rate updates coming soon in Profile section")}
                                                icon={DollarSign}
                                            />
                                        </div>
                                    </>
                                )}
                            </SettingSection>
                        )}

                        {/* Appearance */}
                        <SettingSection title="Appearance" icon={Sun}>
                            <SettingItem
                                label="Dark Mode"
                                description="Switch between light and dark themes."
                                toggle={true}
                                isToggled={isDarkMode}
                                onToggle={() => setIsDarkMode(!isDarkMode)}
                                icon={isDarkMode ? Moon : Sun}
                            />
                            <div className="pt-4 border-t border-gray-50">
                                <SettingItem
                                    label="Language"
                                    description="English (United States)"
                                    action={() => toast.info("More languages coming soon!")}
                                    icon={Globe}
                                />
                            </div>
                        </SettingSection>

                        {/* Security */}
                        <SettingSection title="Security" icon={Shield}>
                            <SettingItem
                                label="Change Password"
                                description="Update your account security."
                                action={() => toast.info("Redirecting to password change...")}
                                icon={Key}
                            />
                            <div className="pt-4 border-t border-gray-50">
                                <SettingItem
                                    label="Forgot Password?"
                                    description="Receive a recovery link via email."
                                    action={handleForgotPassword}
                                    icon={HelpCircle}
                                />
                            </div>
                        </SettingSection>

                        {/* Account Management */}
                        <SettingSection title="Account" icon={Mail}>
                            <SettingItem
                                label="Change Email"
                                description={user?.email || "No email linked"}
                                action={() => navigate('/email-update')}
                                icon={Mail}
                            />
                            <div className="pt-4 border-t border-gray-50">
                                <SettingItem
                                    label="Get Verified"
                                    description="Receive a verification link to confirm your email."
                                    action={handleGetVerified}
                                    icon={Shield}
                                />
                            </div>
                            <div className="pt-6 mt-6 border-t border-red-50 flex flex-col gap-4">
                                <button
                                    onClick={() => signOut()}
                                    className={`flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors group ${
                                        isOrgMode 
                                            ? 'bg-white border-2 border-gray-900 text-gray-900 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-50' 
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-2xl'
                                    }`}
                                >
                                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    Sign Out from Mentozy
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className={`flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors ${
                                        isOrgMode 
                                            ? 'bg-rose-50 border-2 border-gray-900 text-rose-700 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-rose-100' 
                                            : 'bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl'
                                    }`}
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Delete My Account
                                </button>
                                <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                                    Account ID: {user?.id}
                                </p>
                            </div>
                        </SettingSection>

                        {/* Legal & Support Footer */}
                        <div className="space-y-6">
                            <div className={`relative overflow-hidden group ${
                                isOrgMode 
                                    ? 'bg-[#FFEDD5] border-2 border-gray-900 rounded-3xl shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] text-gray-900 p-8' 
                                    : 'bg-indigo-900 rounded-[2.5rem] p-8 text-white'
                            }`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10 text-left">
                                    <h4 className="text-xl font-black mb-2">Need Help?</h4>
                                    <p className={`text-sm mb-6 ${isOrgMode ? 'text-gray-650' : 'text-indigo-200'}`}>Our dedicated support team is available 24/7 to assist you with any questions.</p>
                                    <a
                                        href="mailto:support@mentozy.com"
                                        className={`inline-flex items-center gap-2 px-6 py-3 font-bold text-sm transition-colors ${
                                            isOrgMode 
                                                ? 'bg-white border-2 border-gray-900 rounded-xl text-gray-900 hover:bg-gray-50 shadow-[1px_1px_0px_rgba(0,0,0,1)]' 
                                                : 'bg-white text-indigo-900 rounded-xl hover:bg-indigo-50'
                                        }`}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Contact Support
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <a href="/terms-of-service" className={`flex items-center justify-between p-4 transition-all group ${
                                    isOrgMode 
                                        ? 'bg-white border-2 border-gray-900 rounded-xl hover:border-indigo-500 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]' 
                                        : 'bg-white border border-gray-100 rounded-2xl hover:border-indigo-100'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                        <span className="text-sm font-bold text-gray-700">Terms of Service</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-300" />
                                </a>
                                <a href="/privacy-policy" className={`flex items-center justify-between p-4 transition-all group ${
                                    isOrgMode 
                                        ? 'bg-white border-2 border-gray-900 rounded-xl hover:border-indigo-500 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]' 
                                        : 'bg-white border border-gray-100 rounded-2xl hover:border-indigo-100'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                        <span className="text-sm font-bold text-gray-700">Privacy Policy</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-300" />
                                </a>
                            </div>

                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <span className="text-xl font-black text-gray-900">Mentozy</span>
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-sm"></div>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Version 1.0.4 • © 2026 Mentozy Inc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default SettingsPage;
