import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
    LayoutDashboard, BookOpen, Calendar, MessageSquare, PieChart, Award, 
    LogOut, X, User, Users, PlusCircle, Settings, GraduationCap, 
    CalendarDays, BookMarked, Building2, Bell, PanelLeftClose, 
    ChevronDown, Check, CheckCircle2, Plus, CalendarRange, 
    CheckSquare, FileText, Clock, HelpCircle, StickyNote, Terminal 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useOrganizationMode } from '../../../context/OrganizationModeContext';
import { getUserProfile } from '../../../lib/api';
import { getSupabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isDesktopCollapsed?: boolean;
    onToggleDesktop?: () => void;
}

export function Sidebar({ isOpen, onClose, isDesktopCollapsed, onToggleDesktop }: SidebarProps) {
    const location = useLocation();
    const { signOut, user } = useAuth();
    const { mode, setMode, activeOrganization, setActiveOrganization } = useOrganizationMode();
    const [profileRole, setProfileRole] = useState<string | null>(null);

    // Dynamic Org Student Sidebar stats
    const [orgTaskCount, setOrgTaskCount] = useState(0);
    const [orgProgress, setOrgProgress] = useState(0);

    useEffect(() => {
        if (user?.id) {
            getUserProfile(user.id).then(profile => {
                if (profile?.role) {
                    setProfileRole(profile.role);
                }
            });
        }
    }, [user]);

    // Query active organization task stats to populate the sidebar progress bar in real-time
    useEffect(() => {
        if (mode === 'organization' && activeOrganization && user?.id) {
            const supabase = getSupabase();
            if (supabase) {
                Promise.all([
                    supabase.from('org_tasks').select('id').eq('org_id', activeOrganization.id),
                    supabase.from('org_task_submissions').select('task_id, status').eq('student_id', user.id)
                ]).then(([tasksRes, subsRes]) => {
                    const tasks = tasksRes.data || [];
                    const subs = subsRes.data || [];
                    setOrgTaskCount(tasks.length);
                    const completed = subs.filter(s => s.status === 'passed').length;
                    setOrgProgress(tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0);
                }).catch(err => console.warn('Could not query stats for sidebar', err));
            }
        }
    }, [mode, activeOrganization?.id, user?.id, location.pathname]);

    const isActive = (path: string) => location.pathname === path;
    const role = profileRole || user?.user_metadata?.role || 'student';

    // Personal mode navigation items
    const studentItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student-dashboard' },
        { icon: BookOpen, label: 'Courses', path: '/courses' },
        { icon: Users, label: 'Mentors', path: '/dashboard-mentors' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: Users, label: 'Community', path: '/community' },
        { icon: PieChart, label: 'Analytics', path: '/analytics' },
        { icon: Award, label: 'Certifications', path: '/certifications' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: StickyNote, label: 'Notes', path: '/notes' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const mentorItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor-dashboard' },
        { icon: BookOpen, label: 'My Courses', path: '/mentor-courses' },
        { icon: PlusCircle, label: 'Create Course', path: '/mentor-create-course' },
        { icon: Calendar, label: 'Calendar', path: '/mentor-calendar' },
        { icon: MessageSquare, label: 'Messages', path: '/mentor-messages' },
        { icon: Users, label: 'Community', path: '/mentor-community' },
        { icon: PieChart, label: 'Analytics', path: '/mentor-analytics' },
        { icon: Award, label: 'Achievements', path: '/mentor-achievements' },
        { icon: User, label: 'Profile', path: '/mentor-profile' },
        { icon: StickyNote, label: 'Notes', path: '/mentor-notes' },
        { icon: Settings, label: 'Settings', path: '/mentor-settings' },
    ];

    // Organization mode navigation items (for org admins viewing org dashboard)
    const orgItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/org-dashboard' },
        { icon: GraduationCap, label: 'Students', path: '/org-students' },
        { icon: Calendar, label: 'Calendar', path: '/org-calendar' },
        { icon: Users, label: 'Teachers', path: '/org-teachers' },
        { icon: CalendarDays, label: 'Events', path: '/org-events' },
        { icon: Bell, label: 'Announcements', path: '/org-announcements' },
        { icon: CheckCircle2, label: 'Submissions', path: '/org-submissions' },
        { icon: BookOpen, label: 'Courses', path: '/org-courses' },
        { icon: BookMarked, label: 'Study Materials', path: '/org-materials' },
        { icon: Terminal, label: 'IDE Sandbox', path: '/org-ide' },
        { icon: Settings, label: 'Settings', path: '/org-settings' },
    ];

    // Organization mode navigation for students (viewing as org student)
    const orgStudentItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student-dashboard' },
        { icon: BookOpen, label: 'My Courses', path: '/courses' },
        { icon: Calendar, label: 'Sessions', path: '/calendar' },
        { icon: BookMarked, label: 'Study Materials', path: '/org-materials' },
        { icon: Terminal, label: 'IDE Sandbox', path: '/org-ide' },
        { icon: Bell, label: 'Announcements', path: '/org-announcements' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: Users, label: 'Community', path: '/community' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: StickyNote, label: 'Notes', path: '/notes' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    // Organization mode navigation for teachers (viewing as org teacher)
    const orgTeacherItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor-dashboard' },
        { icon: GraduationCap, label: 'My Students', path: '/org-students' },
        { icon: BookOpen, label: 'My Courses', path: '/mentor-courses' },
        { icon: BookMarked, label: 'Study Materials', path: '/org-materials' },
        { icon: Terminal, label: 'IDE Sandbox', path: '/org-ide' },
        { icon: Calendar, label: 'Sessions', path: '/mentor-calendar' },
        { icon: Bell, label: 'Announcements', path: '/org-announcements' },
        { icon: MessageSquare, label: 'Messages', path: '/mentor-messages' },
        { icon: Users, label: 'Community', path: '/mentor-community' },
        { icon: User, label: 'Profile', path: '/mentor-profile' },
        { icon: StickyNote, label: 'Notes', path: '/mentor-notes' },
        { icon: Settings, label: 'Settings', path: '/mentor-settings' },
    ];

    const isMentorPath = location.pathname.startsWith('/mentor-');
    const isOrgPath = location.pathname.startsWith('/org-');
    const isOrg = user?.user_metadata?.is_org || isOrgPath;
    const isMentor = (role === 'mentor' && !isOrg) || role === 'organization' || isMentorPath;

    // Determine nav items based on mode and role
    const getNavItems = () => {
        if (mode === 'organization' && activeOrganization) {
            if (activeOrganization.role === 'teacher') {
                return orgTeacherItems;
            } else {
                return orgStudentItems;
            }
        }
        if (isOrg) return orgItems;
        if (isMentor) return mentorItems;
        return studentItems;
    };

    const getSubtitle = () => {
        if (mode === 'organization') return 'WORKSPACE MODE';
        if (isOrg) return 'ADMIN MODE';
        if (isMentor) return 'MENTOR MODE';
        return 'PERSONAL MODE';
    };

    const getQuickActions = () => {
        if (isOrg || activeOrganization?.role === 'teacher') {
            return [
                { label: 'Create Course', icon: Plus, path: isOrg ? '/org-create-course' : '/mentor-create-course' },
                { label: 'Schedule Session', icon: CalendarRange, path: isOrg ? '/org-calendar' : '/mentor-calendar' },
                { label: 'Open Messages', icon: Users, path: isOrg ? '/messages' : '/mentor-messages' },
            ];
        }
        if (isMentor) {
            return [
                { label: 'Create Course', icon: Plus, path: '/mentor-create-course' },
                { label: 'Schedule Session', icon: CalendarRange, path: '/mentor-calendar' },
                { label: 'Open Messages', icon: Users, path: '/mentor-messages' },
            ];
        }
        return [
            { label: 'Explore Courses', icon: Plus, path: '/courses' },
            { label: 'Book Session', icon: CalendarRange, path: '/calendar' },
            { label: 'Open Messages', icon: Users, path: '/messages' },
        ];
    };

    const getBadge = (label: string) => {
        if (label === 'Tasks' && orgTaskCount > 0) return orgTaskCount;
        if (label === 'Tasks') return null;
        if (label === 'Submissions') return 3;
        if (label === 'Messages') return 2;
        return null;
    };

    const getProgressRate = () => {
        if (mode === 'organization' && activeOrganization?.role !== 'teacher') {
            return { label: 'Approval Rate', value: orgProgress || 100 };
        }
        if (isOrg || activeOrganization?.role === 'teacher') {
            return { label: 'Org Health', value: 98 };
        }
        if (isMentor) {
            return { label: 'Student Pass Rate', value: 94 };
        }
        return { label: 'Task Progress', value: 85 };
    };

    const rateInfo = getProgressRate();
    const numActive = Math.round(rateInfo.value / 10);
    const navItems = getNavItems();

    // Get active highlighting color classes based on the active role/mode
    const getActiveStyles = () => {
        if (isOrg) {
            return {
                bg: 'bg-[#fff8eb]',
                text: 'text-[#ea580c] font-bold',
                icon: 'text-[#ea580c]'
            };
        }
        return {
            bg: 'bg-[#eff2fc]',
            text: 'text-[#4f46e5] font-bold',
            icon: 'text-[#4f46e5]'
        };
    };

    const activeStyles = getActiveStyles();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isDesktopCollapsed ? 'md:w-20' : 'md:w-64'}
                w-64
            `}>
                <div className="h-full flex flex-col overflow-x-hidden font-mono text-xs select-none">
                    
                    {/* Header */}
                    {isDesktopCollapsed ? (
                        <div className="p-4 flex flex-col items-center border-b border-slate-100 shrink-0 gap-3">
                            <div onClick={onToggleDesktop} className="w-11 h-11 bg-white border-2 border-slate-900 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" title="Expand Sidebar">
                                <svg className="w-7 h-7 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                    <circle cx="6" cy="10" r="1.2" fill="currentColor" />
                                    <circle cx="18" cy="10" r="1.2" fill="currentColor" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 border-b border-slate-100 flex items-center gap-3 shrink-0">
                            <div className="w-11 h-11 bg-white border-2 border-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-7 h-7 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                    <circle cx="6" cy="10" r="1.2" fill="currentColor" />
                                    <circle cx="18" cy="10" r="1.2" fill="currentColor" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link to="/" className="font-extrabold text-sm text-slate-900 uppercase tracking-wider block hover:opacity-80 transition-opacity">
                                    Mentozy
                                </Link>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                                    {getSubtitle()}
                                </span>
                            </div>
                            {onToggleDesktop && (
                                <button onClick={onToggleDesktop} className="hidden md:flex p-1.5 text-gray-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Collapse Sidebar">
                                    <PanelLeftClose className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Main Scrollable Content */}
                    {isDesktopCollapsed ? (
                        <div className="flex-1 py-4 flex flex-col items-center gap-2 overflow-y-auto hide-scrollbar">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className={`p-2.5 rounded-full transition-all cursor-pointer ${
                                            active
                                                ? `${activeStyles.bg} ${activeStyles.icon}`
                                                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                        title={item.label}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-between overflow-y-auto hide-scrollbar">
                            {/* Quick Actions Panel */}
                            <div className="px-5 pt-5 space-y-3 shrink-0">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100/60">Quick Action</h4>
                                <div className="space-y-2.5 pt-1">
                                    {getQuickActions().map((action, index) => {
                                        const Icon = action.icon;
                                        return (
                                            <Link 
                                                key={index}
                                                to={action.path}
                                                onClick={() => window.innerWidth < 768 && onClose()}
                                                className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-full font-bold text-[11px] text-slate-700 transition-all hover:shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                                            >
                                                <Icon className="w-4 h-4 text-[#4f46e5] flex-shrink-0" />
                                                <span>{action.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Navigation Links */}
                            <div className="px-5 pt-6 flex-1 shrink-0 pb-4 space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100/60">Navigation</h4>
                                <div className="space-y-1.5 pt-1">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.path);
                                        const badgeVal = getBadge(item.label);
                                        return (
                                            <Link 
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => window.innerWidth < 768 && onClose()}
                                                className={`flex items-center justify-between px-5 py-2.5 rounded-full text-[11.5px] transition-all cursor-pointer ${
                                                    active
                                                        ? `${activeStyles.bg} ${activeStyles.text}`
                                                        : 'text-slate-700 hover:bg-slate-50/80 hover:text-slate-900 font-medium'
                                                }`}
                                            >
                                                <span className="flex items-center gap-3 truncate">
                                                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? activeStyles.icon : 'text-slate-400'}`} />
                                                    <span className="truncate">{item.label}</span>
                                                </span>
                                                {badgeVal !== null && (
                                                    <span className="text-[9px] bg-[#eff2fc] text-[#4f46e5] px-2 py-0.5 rounded font-bold flex-shrink-0 min-w-5 text-center">
                                                        {badgeVal}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Section */}
                    {isDesktopCollapsed ? (
                        <div className="p-4 border-t border-slate-100 flex flex-col items-center gap-3 shrink-0">
                            <button
                                onClick={() => signOut()}
                                className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-all cursor-pointer"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="p-5 border-t border-slate-100 shrink-0 space-y-3.5 bg-white">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 px-1">
                                <span>{rateInfo.label}</span>
                                <span className="text-[#4f46e5] font-bold">{rateInfo.value}%</span>
                            </div>
                            
                            {/* 10 vertical blocks progress bar */}
                            <div className="flex justify-center gap-1.5 bg-[#f5f7ff] p-2 rounded-xl border border-slate-100">
                                {Array.from({ length: 10 }).map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`w-2.5 h-4.5 rounded-[3px] transition-colors duration-300 ${
                                            idx < numActive 
                                                ? 'bg-[#4f46e5]' 
                                                : 'bg-indigo-100'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Switch back to Personal view if org mode and user is not an org admin */}
                            {!isOrg && mode === 'organization' && activeOrganization && (
                                <button 
                                    onClick={() => {
                                        setMode('personal');
                                        setActiveOrganization(null);
                                        toast.success("Returned to Personal Dashboard!");
                                    }}
                                    className="w-full mt-1.5 py-2 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full font-bold text-[10px] transition-all cursor-pointer"
                                >
                                    Switch to Personal
                                </button>
                            )}

                            {/* Sign Out Button */}
                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-2 justify-center w-full px-4 py-2 mt-1 text-[10px] font-bold text-red-500 hover:text-red-600 bg-red-50/30 hover:bg-red-50 rounded-full border border-transparent hover:border-red-200 transition-all cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}

                </div>
            </aside>
        </>
    );
}
