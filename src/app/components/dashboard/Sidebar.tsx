import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
    LayoutDashboard, BookOpen, Calendar, MessageSquare, PieChart, Award, 
    LogOut, X, User, Users, PlusCircle, Settings, GraduationCap, 
    CalendarDays, BookMarked, Building2, Bell, PanelLeftClose, 
    ChevronDown, Check, CheckCircle2, Plus, CalendarRange, 
    CheckSquare, FileText, Clock, HelpCircle, StickyNote 
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

const DoodleIcon = ({ label, className, active }: { label: string, className?: string, active?: boolean }) => {
    const icons: Record<string, React.ReactNode> = {
        'Dashboard': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M3.5 3.5h7c.5 0 1 .5 1 1v7c0 .5-.5 1-1 1h-7c-.5 0-1-.5-1-1v-7c0-.5.5-1 1-1Z" />
                <path d="M13.5 3.5h7c.5 0 1 .5 1 1v4c0 .5-.5 1-1 1h-7c-.5 0-1-.5-1-1v-4c0-.5.5-1 1-1Z" />
                <path d="M13.5 12.5h7c.5 0 1 .5 1 1v7c0 .5-.5 1-1 1h-7c-.5 0-1-.5-1-1v-7c0-.5.5-1 1-1Z" />
                <path d="M3.5 15.5h7c.5 0 1 .5 1 1v4c0 .5-.5 1-1 1h-7c-.5 0-1-.5-1-1v-4c0-.5.5-1 1-1Z" />
            </svg>
        ),
        'Submissions': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        ),
        'Courses': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M2.5 6.5s1-1 3-1 4 1.5 6.5 1.5 4.5-1.5 6.5-1.5 3 1 3 1v12s-1-1-3-1-4 1.5-6.5 1.5-4.5-1.5-6.5-1.5-3 1-3 1V6.5Z" />
                <path d="M12 7v12.5" />
            </svg>
        ),
        'Mentors': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M15.5 12.5h.01m-7 0h.01" />
                <path d="M18.5 21a6.5 6.5 0 0 0-13 0" />
                <path d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                <path d="M18.5 7.5c0 1.5-1 2.5-1.5 2.5s-1.5-1-1.5-2.5 1-2.5 1.5-2.5 1.5 1 1.5 2.5Z" />
                <path d="M7 7.5c0 1.5-1 2.5-1.5 2.5S4 9 4 7.5s1-2.5 1.5-2.5 1.5 1 1.5 2.5Z" />
            </svg>
        ),
        'Calendar': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <rect width="18" height="18" x="3" y="4" rx="3" />
                <path d="M3 10h18M8 2v4M16 2v4M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
            </svg>
        ),
        'Messages': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M21 11.5c0 4.5-4 8.5-9 8.5-1 0-2-.2-3-.5L4 21.5l1.5-5C4 15 3 13.5 3 11.5 3 7 7 3.5 12 3.5s9 3.5 9 8Z" />
                <path d="M8 10h.01M12 10h.01M16 10h.01" />
            </svg>
        ),
        'Community': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M16 19a4 4 0 0 0-8 0" />
                <circle cx="12" cy="11" r="3" />
                <path d="M6 19a3 3 0 0 0-3-3M18 19a3 3 0 0 1 3-3" />
                <circle cx="4.5" cy="12" r="1.5" />
                <circle cx="19.5" cy="12" r="1.5" />
            </svg>
        ),
        'Analytics': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="m3.5 14.5 4.5-4.5 4 4 8.5-8.5M16 5.5h4.5v4.5" />
                <circle cx="12" cy="12" r="9" opacity="0.2" />
            </svg>
        ),
        'Certifications': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <circle cx="12" cy="8" r="6" />
                <path d="M15.42 12.5 17 21.5l-5-3-5 3 1.58-9" />
                <circle cx="12" cy="8" r="2" fill="currentColor" />
            </svg>
        ),
        'Profile': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <circle cx="12" cy="7" r="4.5" />
                <path d="M19.5 21a7.5 7.5 0 0 0-15 0" />
            </svg>
        ),
        'Notes': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" />
                <path d="M15 3v6h6" />
                <path d="M12 11h-4" />
                <path d="M12 15h-4" />
            </svg>
        ),
        'Settings': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
        ),
        'Study Materials': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10M6 10h10" />
            </svg>
        ),
        'LogOut': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
        )
    };

    return icons[label] || <LayoutDashboard className={className} />;
};

export function Sidebar({ isOpen, onClose, isDesktopCollapsed, onToggleDesktop }: SidebarProps) {
    const location = useLocation();
    const { signOut, user } = useAuth();
    const { mode, activeOrganization, userOrganizations, setActiveOrganization } = useOrganizationMode();
    const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
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

    const isOrgStudent = mode === 'organization' && activeOrganization && activeOrganization.role !== 'teacher';

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
        { icon: Settings, label: 'Settings', path: '/org-settings' },
    ];

    // Organization mode navigation for students (viewing as org student)
    const orgStudentItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student-dashboard' },
        { icon: BookOpen, label: 'My Courses', path: '/courses' },
        { icon: Calendar, label: 'Sessions', path: '/calendar' },
        { icon: BookMarked, label: 'Study Materials', path: '/org-materials' },
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
        { icon: GraduationCap, label: 'My Students', path: '/org-my-students' },
        { icon: BookOpen, label: 'My Courses', path: '/mentor-courses' },
        { icon: BookMarked, label: 'Study Materials', path: '/org-materials' },
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

    const navItems = getNavItems();

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
                fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isDesktopCollapsed ? 'md:w-20' : 'md:w-64'}
                w-64
            `}>
                <div className="h-full flex flex-col overflow-x-hidden font-mono text-xs select-none">
                    
                    {/* Retro / Notion Style student sidebar Header */}
                    {isOrgStudent && !isDesktopCollapsed ? (
                        <div className="p-5 border-b border-gray-150 dark:border-gray-850 flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-gray-100 rounded-lg flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                <svg className="w-7 h-7 text-gray-900 dark:text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                    <path d="M12 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor" />
                                    <path d="M11 2.5a1 1 0 0 1 2 0" />
                                    <path d="M12 7.5v-2" />
                                    <path d="M6 9.5l0.5 0.5-0.5 0.5-0.5-0.5z" fill="currentColor" />
                                    <path d="M18 9.5l0.5 0.5-0.5 0.5-0.5-0.5z" fill="currentColor" />
                                </svg>
                            </div>
                            <div>
                                <Link to="/" className="font-black text-sm text-gray-950 dark:text-white uppercase tracking-tight block">
                                    Mentozy
                                </Link>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">Workspace Mode</span>
                            </div>
                        </div>
                    ) : (
                        /* Standard Mentozy Header */
                        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-850 flex-shrink-0">
                            <div className={`flex items-center transition-all duration-300 overflow-hidden ${isDesktopCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100 w-auto'}`}>
                                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white whitespace-nowrap">
                                    Mentozy
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-sm flex-shrink-0"></div>
                                </Link>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {onToggleDesktop && (
                                    <button onClick={onToggleDesktop} className="hidden md:flex p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                        <PanelLeftClose className={`w-5 h-5 transition-transform duration-300 ${isDesktopCollapsed ? 'rotate-180' : ''}`} />
                                    </button>
                                )}
                                <button onClick={onClose} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Org Switch Selector badge (only if not custom org student sidebar) */}
                    {!isOrgStudent && mode === 'organization' && activeOrganization && (
                        <div className="relative mx-4 my-3 flex flex-col">
                            <div 
                                onClick={() => userOrganizations.length > 1 && setIsOrgDropdownOpen(prev => !prev)}
                                className={`p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 transition-all duration-300 flex flex-col justify-center ${userOrganizations.length > 1 ? 'cursor-pointer hover:bg-indigo-100/50' : ''} ${isDesktopCollapsed ? 'md:px-2 md:py-2 md:h-12 items-center' : ''}`}
                            >
                                <div className="flex items-center justify-between w-full flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                                        <span className={`text-xs font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap transition-all duration-300 text-left ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}>{activeOrganization.name}</span>
                                    </div>
                                    {userOrganizations.length > 1 && !isDesktopCollapsed && (
                                        <ChevronDown className={`w-3.5 h-3.5 text-indigo-500 transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* -------------------- CUSTOM ORGANISATION STUDENT SIDEBAR WIDGETS -------------------- */}
                    {isOrgStudent && !isDesktopCollapsed ? (
                        <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-6">
                            
                            {/* Quick Actions Panel */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-1">Quick Action</h4>
                                <div className="space-y-2">
                                    <Link 
                                        to="/courses"
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className="flex items-center gap-2 px-3 py-2 border border-gray-250 dark:border-gray-800 hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 rounded-xl font-bold text-[11px] text-gray-700 dark:text-gray-300 transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-indigo-500" />
                                        Explore Courses
                                    </Link>
                                    <Link 
                                        to="/calendar"
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className="flex items-center gap-2 px-3 py-2 border border-gray-250 dark:border-gray-800 hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 rounded-xl font-bold text-[11px] text-gray-700 dark:text-gray-300 transition-all"
                                    >
                                        <CalendarRange className="w-3.5 h-3.5 text-indigo-500" />
                                        Book Session
                                    </Link>
                                    <Link 
                                        to="/messages"
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className="flex items-center gap-2 px-3 py-2 border border-gray-250 dark:border-gray-800 hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 rounded-xl font-bold text-[11px] text-gray-700 dark:text-gray-300 transition-all"
                                    >
                                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                                        Open Messages
                                    </Link>
                                </div>
                            </div>

                            {/* Custom Navigation Links */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-1">Navigation</h4>
                                <div className="space-y-1">
                                    <Link 
                                        to="/student-dashboard" 
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-[11px] border transition-all ${
                                            isActive('/student-dashboard')
                                                ? 'bg-indigo-50 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 border-transparent'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <CheckSquare className="w-4 h-4" />
                                            Tasks
                                        </span>
                                        <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-black">{orgTaskCount}</span>
                                    </Link>
                                    <Link 
                                        to="/calendar" 
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-[11px] border transition-all ${
                                            isActive('/calendar')
                                                ? 'bg-indigo-50 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 border-transparent'
                                        }`}
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Sessions
                                    </Link>
                                    <Link 
                                        to="/org-materials" 
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-[11px] border transition-all ${
                                            isActive('/org-materials')
                                                ? 'bg-indigo-50 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 border-transparent'
                                        }`}
                                    >
                                        <BookMarked className="w-4 h-4" />
                                        Study Materials
                                    </Link>
                                    <Link 
                                        to="/profile" 
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-[11px] border transition-all ${
                                            isActive('/profile')
                                                ? 'bg-indigo-50 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 border-transparent'
                                        }`}
                                    >
                                        <Users className="w-4 h-4" />
                                        Profiles
                                    </Link>
                                    <Link 
                                        to="/notes" 
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-[11px] border transition-all ${
                                            isActive('/notes')
                                                ? 'bg-indigo-50 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 border-transparent'
                                        }`}
                                    >
                                        <StickyNote className="w-4 h-4" />
                                        Notes
                                    </Link>
                                    <Link 
                                        to="/settings" 
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-[11px] border transition-all ${
                                            isActive('/settings')
                                                ? 'bg-indigo-50 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 border-transparent'
                                        }`}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Link>
                                </div>
                            </div>

                            {/* Retro Status scorecard inside the Sidebar */}
                            <div className="space-y-2 pt-4 border-t border-gray-150 dark:border-gray-800">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                                    <span>Approval Rate</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">{orgProgress}%</span>
                                </div>
                                <div className="font-mono text-xs tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-lg text-center border border-indigo-100/50 dark:border-indigo-900/30">
                                    {orgProgress === 100 ? '██████████' :
                                     orgProgress >= 80 ? '████████░░' :
                                     orgProgress >= 60 ? '██████░░░░' :
                                     orgProgress >= 40 ? '████░░░░░░' :
                                     orgProgress >= 20 ? '██░░░░░░░░' : '░░░░░░░░░░'}
                                </div>
                            </div>

                            {/* Switch back to Personal view */}
                            <div className="pt-4 mt-auto">
                                <button 
                                    onClick={() => {
                                        setActiveOrganization(null);
                                        toast.success("Returned to Personal Dashboard!");
                                    }}
                                    className="w-full py-2.5 border border-indigo-300 text-indigo-700 bg-indigo-50/50 rounded-xl font-bold hover:bg-indigo-100 text-[10px] transition-colors"
                                >
                                    Switch to Personal
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* -------------------- STANDARD / DEFAULT NAVIGATION LIST -------------------- */
                        <>
                            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto hide-scrollbar overflow-x-hidden">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => window.innerWidth < 768 && onClose()}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                                            ${isDesktopCollapsed ? 'md:justify-center md:px-0' : ''}
                                            ${isActive(item.path)
                                                ? mode === 'organization'
                                                    ? 'bg-indigo-50 text-indigo-900'
                                                    : 'bg-amber-50 text-amber-900'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                        `}
                                        title={isDesktopCollapsed ? item.label : undefined}
                                    >
                                        {isDesktopCollapsed ? (
                                            <div className={`p-3 rounded-2xl transition-all duration-300 ${isActive(item.path) ? 'bg-[#fff9e6] shadow-sm' : ''}`}>
                                                <DoodleIcon label={item.label} active={isActive(item.path)} className={`w-6 h-6 flex-shrink-0 transition-colors ${isActive(item.path) ? (mode === 'organization' ? 'text-indigo-500' : 'text-amber-500') : 'text-gray-400 opacity-60'}`} />
                                            </div>
                                        ) : (
                                            <>
                                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive(item.path) ? (mode === 'organization' ? 'text-indigo-500' : 'text-amber-500') : 'text-gray-400'}`} />
                                                <span className={`whitespace-nowrap transition-opacity duration-300 ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}>{item.label}</span>
                                            </>
                                        )}
                                    </Link>
                                ))}
                            </nav>

                            {/* Footer Sign Out */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-850 flex-shrink-0">
                                <button
                                    onClick={() => signOut()}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 w-full transition-all duration-200 ${isDesktopCollapsed ? 'md:justify-center md:px-0' : ''}`}
                                    title={isDesktopCollapsed ? "Sign Out" : undefined}
                                >
                                    {isDesktopCollapsed ? (
                                        <div className="p-3 rounded-2xl bg-red-50/30">
                                            <DoodleIcon label="LogOut" className="w-6 h-6 text-red-400" />
                                        </div>
                                    ) : (
                                        <>
                                            <LogOut className="w-5 h-5 flex-shrink-0" />
                                            <span className={`whitespace-nowrap transition-opacity duration-300 ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}>Sign Out</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </aside>
        </>
    );
}
