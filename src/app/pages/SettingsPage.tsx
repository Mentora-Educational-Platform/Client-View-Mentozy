import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { getSupabase } from '../../lib/supabase';
import { getMentorByUserId, updateMentorStatus } from '../../lib/api';

export function SettingsPage() {
    const { user, signOut } = useAuth();
    const location = useLocation();
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
        const nextParam = isMentorView ? '/mentor-settings' : '/settings';
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: `${window.location.origin}/auth/callback?next=${nextParam}`,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password reset email sent!");
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
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
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
                    <div className="mt-1 p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <ItemIcon className="w-4 h-4" />
                    </div>
                )}
                <div className="max-w-[180px] sm:max-w-xs">
                    <h4 className="font-bold text-gray-900 text-sm whitespace-nowrap">{label}</h4>
                    {description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>}
                </div>
            </div>
            {toggle !== undefined ? (
                <button
                    onClick={onToggle}
                    className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isToggled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isToggled ? 'left-7' : 'left-1'}`} />
                </button>
            ) : action ? (
                <button
                    onClick={action}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-indigo-600 flex-shrink-0"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            ) : null}
        </div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
                        <p className="text-gray-500 mt-1 font-medium">Manage your account preferences and security.</p>
                    </div>
                    <div className="px-4 py-2 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-100">
                        {isMentorView ? 'Mentor Account' : 'Student Account'}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="md:col-span-1 space-y-2">
                        <button className="w-full flex items-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-gray-200 transition-transform active:scale-95">
                            <User className="w-5 h-5" />
                            General
                        </button>
                        <button onClick={() => toast.info("Notification settings coming soon")} className="w-full flex items-center gap-3 px-6 py-4 bg-white text-gray-500 hover:bg-gray-50 rounded-[1.5rem] font-bold text-sm transition-all border border-transparent hover:border-gray-100">
                            <Bell className="w-5 h-5" />
                            Notifications
                        </button>
                        <button onClick={() => toast.info("Privacy settings coming soon")} className="w-full flex items-center gap-3 px-6 py-4 bg-white text-gray-500 hover:bg-gray-50 rounded-[1.5rem] font-bold text-sm transition-all border border-transparent hover:border-gray-100">
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
                                action={() => toast.info("Email change requires verification")}
                                icon={Mail}
                            />
                            <div className="pt-6 mt-6 border-t border-red-50 flex flex-col gap-4">
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-3 px-6 py-4 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-2xl font-bold text-sm transition-colors group"
                                >
                                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    Sign Out from Mentozy
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex items-center gap-3 px-6 py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold text-sm transition-colors"
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
                            <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10">
                                    <h4 className="text-xl font-bold mb-2">Need Help?</h4>
                                    <p className="text-indigo-200 text-sm mb-6">Our dedicated support team is available 24/7 to assist you with any questions.</p>
                                    <a
                                        href="mailto:support@mentozy.com"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Contact Support
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <a href="#" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                        <span className="text-sm font-bold text-gray-700">Terms of Service</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-300" />
                                </a>
                                <a href="#" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 transition-all group">
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
