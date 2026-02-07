import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Bell, Lock, User, Briefcase, DollarSign, Shield, Key, HelpCircle, Mail, LogOut, Trash2, MessageCircle, FileText, ExternalLink, Globe, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getSupabase } from '../../lib/supabase';
import { getMentorByUserId, updateMentorStatus, updateMentorProfile } from '../../lib/api';

export function SettingsPage() {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const isMentorView = location.pathname.includes('mentor');
    const supabase = getSupabase();

    // Mentor Specific State
    const [mentorData, setMentorData] = useState<any>(null);
    const [mentorLoading, setMentorLoading] = useState(isMentorView);
    const [isEditingRate, setIsEditingRate] = useState(false);
    const [newHourlyRate, setNewHourlyRate] = useState<string>('');

    // Account State
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);

    // Preferences State
    const [preferences, setPreferences] = useState({
        emailNotifications: user?.user_metadata?.preferences?.emailNotifications ?? true,
        browserPush: user?.user_metadata?.preferences?.browserPush ?? false,
        profileVisibility: user?.user_metadata?.preferences?.profileVisibility ?? true, // Matches mentorData.status usually
        showEmail: user?.user_metadata?.preferences?.showEmail ?? false,
        language: user?.user_metadata?.preferences?.language ?? 'en-US'
    });

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            // 1. Load Mentor Data
            if (isMentorView && user?.id) {
                const data = await getMentorByUserId(user.id);
                setMentorData(data);
                if (data?.hourly_rate) setNewHourlyRate(data.hourly_rate.toString());
                setMentorLoading(false);
            }

            // 2. Load User Preferences from Metadata
            if (user?.user_metadata?.preferences) {
                setPreferences(prev => ({ ...prev, ...user.user_metadata.preferences }));
            }
        };
        loadData();
    }, [isMentorView, user]);

    /* --- Handlers --- */

    const handleUpdateHourlyRate = async () => {
        if (!user?.id || !newHourlyRate) return;
        const rate = parseFloat(newHourlyRate);
        if (isNaN(rate) || rate < 0) {
            toast.error("Please enter a valid hourly rate");
            return;
        }

        // Call API to update profile
        const success = await updateMentorProfile(user.id, { hourly_rate: rate });

        if (success) {
            toast.success(`Hourly rate updated to $${rate}/hr`);
            setMentorData({ ...mentorData, hourly_rate: rate });
            setIsEditingRate(false);
        } else {
            toast.error("Failed to update hourly rate");
        }
    };

    const handleUpdatePreference = async (key: keyof typeof preferences, value: any) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);

        if (supabase && user) {
            const { error } = await supabase.auth.updateUser({
                data: { preferences: newPrefs }
            });
            if (error) toast.error("Failed to save preference");
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            toast.error("Invalid email address");
            return;
        }
        setEmailLoading(true);
        if (supabase) {
            const { error } = await supabase.auth.updateUser({ email: newEmail });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Confirmation link sent to both emails!");
                setIsChangingEmail(false);
            }
        }
        setEmailLoading(false);
    };

    const handleForgotPassword = async () => {
        if (!user?.email) return;
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
        <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden mb-6">
            <div className="px-8 py-6 border-b border-border flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-card-foreground">{title}</h3>
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
        icon: ItemIcon,
        customRight
    }: {
        label: string,
        description?: string,
        action?: () => void,
        toggle?: boolean,
        isToggled?: boolean,
        onToggle?: () => void,
        icon?: any,
        customRight?: React.ReactNode
    }) => (
        <div className="flex items-center justify-between group text-left">
            <div className="flex gap-4">
                {ItemIcon && (
                    <div className="mt-1 p-2 bg-muted text-muted-foreground rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <ItemIcon className="w-4 h-4" />
                    </div>
                )}
                <div className="max-w-[180px] sm:max-w-xs">
                    <h4 className="font-bold text-card-foreground text-sm whitespace-nowrap">{label}</h4>
                    {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
                </div>
            </div>
            {customRight ? customRight : toggle !== undefined ? (
                <button
                    onClick={onToggle}
                    className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isToggled ? 'bg-indigo-600' : 'bg-muted'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-transform ${isToggled ? 'left-7' : 'left-1'}`} />
                </button>
            ) : action ? (
                <button
                    onClick={action}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-indigo-600 flex-shrink-0"
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
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Settings</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Manage your account preferences and security.</p>
                    </div>
                    <div className="px-4 py-2 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-100">
                        {isMentorView ? 'Mentor Account' : 'Student Account'}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="md:col-span-1 space-y-2">
                        <button className="w-full flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-indigo-200 transition-transform active:scale-95">
                            <User className="w-5 h-5" />
                            General
                        </button>
                        <button onClick={() => toast.info("Notification settings below")} className="w-full flex items-center gap-3 px-6 py-4 bg-card text-muted-foreground hover:bg-muted/50 rounded-[1.5rem] font-bold text-sm transition-all border border-transparent hover:border-border">
                            <Bell className="w-5 h-5" />
                            Notifications
                        </button>
                        <button onClick={() => toast.info("Privacy settings below")} className="w-full flex items-center gap-3 px-6 py-4 bg-card text-muted-foreground hover:bg-muted/50 rounded-[1.5rem] font-bold text-sm transition-all border border-transparent hover:border-border">
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
                                        <Shield className="w-6 h-6 text-muted-foreground animate-pulse" />
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
                                        <div className="pt-4 border-t border-border">
                                            <SettingItem
                                                label="Hourly Rate"
                                                description={`Current: $${mentorData?.hourly_rate || 0}/hr`}
                                                icon={DollarSign}
                                                customRight={
                                                    isEditingRate ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                                                <input
                                                                    type="number"
                                                                    value={newHourlyRate}
                                                                    onChange={(e) => setNewHourlyRate(e.target.value)}
                                                                    className="w-20 pl-6 pr-2 py-1 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                                                                />
                                                            </div>
                                                            <button onClick={handleUpdateHourlyRate} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => setIsEditingRate(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                                                                <span className="text-xs font-bold">✕</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setIsEditingRate(true)}
                                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                    )
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </SettingSection>
                        )}

                        {/* Appearance & Preferences */}
                        <SettingSection title="Preferences" icon={Sun}>
                            <SettingItem
                                label="Email Notifications"
                                description="Receive updates via email"
                                toggle={true}
                                isToggled={preferences.emailNotifications}
                                onToggle={() => handleUpdatePreference('emailNotifications', !preferences.emailNotifications)}
                                icon={Mail}
                            />
                            <div className="pt-4 border-t border-border">
                                <SettingItem
                                    label="Browser Push"
                                    description="Receive push notifications"
                                    toggle={true}
                                    isToggled={preferences.browserPush}
                                    onToggle={() => handleUpdatePreference('browserPush', !preferences.browserPush)}
                                    icon={Bell}
                                />
                            </div>
                            <div className="pt-4 border-t border-border">
                                <SettingItem
                                    label="Show Email publicly"
                                    description="Display email on your profile"
                                    toggle={true}
                                    isToggled={preferences.showEmail}
                                    onToggle={() => handleUpdatePreference('showEmail', !preferences.showEmail)}
                                    icon={User}
                                />
                            </div>
                            <div className="pt-4 border-t border-border">
                                <SettingItem
                                    label="Language"
                                    description="Select your preferred language"
                                    icon={Globe}
                                    customRight={
                                        <select
                                            value={preferences.language}
                                            onChange={(e) => handleUpdatePreference('language', e.target.value)}
                                            className="text-xs font-bold text-muted-foreground bg-muted border-none rounded-lg px-2 py-1.5 focus:ring-0 cursor-pointer"
                                        >
                                            <option value="en-US">English (US)</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                        </select>
                                    }
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
                            <div className="pt-4 border-t border-border">
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
                                icon={Mail}
                                customRight={
                                    isChangingEmail ? (
                                        <div className="flex flex-col gap-2 w-full max-w-[200px]">
                                            <input
                                                type="email"
                                                placeholder="New Email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                className="w-full pl-3 pr-2 py-1.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setIsChangingEmail(false)} className="px-3 py-1 text-xs font-bold text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg">Cancel</button>
                                                <button
                                                    onClick={handleChangeEmail}
                                                    disabled={emailLoading}
                                                    className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded-lg disabled:opacity-50"
                                                >
                                                    {emailLoading ? '...' : 'Verify'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsChangingEmail(true)}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Change
                                        </button>
                                    )
                                }
                            />

                            <div className="pt-6 mt-6 border-t border-red-50 flex flex-col gap-4">
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-3 px-6 py-4 bg-muted/50 text-muted-foreground hover:bg-muted rounded-2xl font-bold text-sm transition-colors group"
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
                                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
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
                                <a href="#" className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-indigo-100 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-muted-foreground group-hover:text-indigo-600" />
                                        <span className="text-sm font-bold text-card-foreground">Terms of Service</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                </a>
                                <a href="#" className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-indigo-100 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-muted-foreground group-hover:text-indigo-600" />
                                        <span className="text-sm font-bold text-card-foreground">Privacy Policy</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                </a>
                            </div>

                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <span className="text-xl font-black text-foreground">Mentozy</span>
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-sm"></div>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Version 1.0.4 • © 2026 Mentozy Inc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default SettingsPage;
