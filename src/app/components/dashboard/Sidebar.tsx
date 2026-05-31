import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Calendar, MessageSquare, PieChart, Award, LogOut, X, User, Users, PlusCircle, Settings, GraduationCap, CalendarDays, BookMarked, Building2, Bell, PanelLeftClose, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useOrganizationMode } from '../../../context/OrganizationModeContext';
import { getUserProfile } from '../../../lib/api';
import { toast } from 'sonner';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isDesktopCollapsed?: boolean;
    onToggleDesktop?: () => void;
}

const DoodleIcon = ({ label, className, active }: { label: string, className?: string, active?: boolean }) => {
    // Custom hand-drawn paths for doodle feel
    const icons: Record<string, React.ReactNode> = {
        'Dashboard': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M3.5 3.5h7c.5 0 1 .5 1 1v7c0 .5-.5 1-1 1h-7c-.5 0-1-.5-1-1v-7c0-.5.5-1 1-1Z" />
                <path d="M13.5 3.5h7c.5 0 1 .5 1 1v4c0 .5-.5 1-1 1h-7c-.5 0-1-.5-1-1v-4c0-.5.5-1 1-1Z" />
                <path d="M13.5 12.5h7c.5 0 1 .5 1 1v7c0 .5-.5 1-1 1h-7c-.5 0-1-.5-1-1v-7c0-.5.5-1 1-1Z" />
                <path d="M3.5 15.5h7c.5 0 1 .5 1 1v4c0 .5-.5 1-1 1h-7c-.5 0-1-.5-1-1v-4c0-.5.5-1 1-1Z" />
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
        'Settings': (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
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

    useEffect(() => {
        if (user?.id) {
            getUserProfile(user.id).then(profile => {
                if (profile?.role) {
                    setProfileRole(profile.role);
                }
            });
        }
    }, [user]);

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
        { icon: BookOpen, label: 'Courses', path: '/org-courses' },
        { icon: BookMarked, label: 'Study Materials', path: '/org-materials' },
        { icon: Settings, label: 'Settings', path: '/org-settings' },
    ];

    // Organization mode navigation for students (viewing as org student)
    const orgStudentItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student-dashboard' },
        { icon: BookOpen, label: 'My Courses', path: '/courses' },
        { icon: Calendar, label: 'Sessions', path: '/calendar' },
        { icon: Bell, label: 'Announcements', path: '/org-announcements' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: Users, label: 'Community', path: '/community' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    // Organization mode navigation for teachers (viewing as org teacher)
    const orgTeacherItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor-dashboard' },
        { icon: GraduationCap, label: 'My Students', path: '/org-my-students' },
        { icon: BookOpen, label: 'My Courses', path: '/mentor-courses' },
        { icon: Calendar, label: 'Sessions', path: '/mentor-calendar' },
        { icon: Bell, label: 'Announcements', path: '/org-announcements' },
        { icon: MessageSquare, label: 'Messages', path: '/mentor-messages' },
        { icon: Users, label: 'Community', path: '/mentor-community' },
        { icon: User, label: 'Profile', path: '/mentor-profile' },
        { icon: Settings, label: 'Settings', path: '/mentor-settings' },
    ];

    const isMentorPath = location.pathname.startsWith('/mentor-');
    const isOrgPath = location.pathname.startsWith('/org-');
    const isOrg = user?.user_metadata?.is_org || isOrgPath;
    const isMentor = (role === 'mentor' && !isOrg) || role === 'organization' || isMentorPath;

    // Determine nav items based on mode and role
    const getNavItems = () => {
        // If user is in organization mode
        if (mode === 'organization' && activeOrganization) {
            // Check the user's role within the organization
            if (activeOrganization.role === 'teacher') {
                return orgTeacherItems;
            } else {
                return orgStudentItems;
            }
        }
        
        // Personal mode - use existing logic
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
                fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isDesktopCollapsed ? 'md:w-20' : 'md:w-64'}
                w-64
            `}>
                <div className="h-full flex flex-col overflow-x-hidden">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
                        <div className={`flex items-center transition-all duration-300 overflow-hidden ${isDesktopCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100 w-auto'}`}>
                            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 whitespace-nowrap">
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

                    {/* Organization Mode Badge / Dropdown */}
                    {mode === 'organization' && activeOrganization && (
                        <div className="relative mx-4 my-3 flex flex-col">
                            <div 
                                onClick={() => userOrganizations.length > 1 && setIsOrgDropdownOpen(prev => !prev)}
                                className={`p-3 bg-indigo-50 rounded-2xl border border-indigo-100 transition-all duration-300 flex flex-col justify-center ${userOrganizations.length > 1 ? 'cursor-pointer hover:bg-indigo-100/50' : ''} ${isDesktopCollapsed ? 'md:px-2 md:py-2 md:h-12 items-center' : ''}`}
                            >
                                <div className="flex items-center justify-between w-full flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                                        <span className={`text-xs font-bold text-indigo-700 whitespace-nowrap transition-all duration-300 text-left ${isDesktopCollapsed ? 'md:hidden' : 'block'}`}>{activeOrganization.name}</span>
                                    </div>
                                    {userOrganizations.length > 1 && !isDesktopCollapsed && (
                                        <ChevronDown className={`w-3.5 h-3.5 text-indigo-500 transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
                                    )}
                                </div>
                                <span className={`text-[10px] font-semibold text-indigo-500 uppercase tracking-wider bg-indigo-100 px-2 py-0.5 rounded-full mt-1.5 transition-all duration-300 self-start whitespace-nowrap ${isDesktopCollapsed ? 'md:hidden' : 'inline-block'}`}>
                                    {activeOrganization.role === 'teacher' ? 'Teacher View' : 'Student View'}
                                </span>
                            </div>

                            {/* Floating Dropdown */}
                            {isOrgDropdownOpen && userOrganizations.length > 1 && !isDesktopCollapsed && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-3 py-1.5 border-b border-slate-800 text-left">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Switch Organisation</span>
                                    </div>
                                    {userOrganizations.map(org => {
                                        const isActiveOrg = org.id === activeOrganization.id;
                                        return (
                                            <button
                                                key={org.id}
                                                onClick={() => {
                                                    setActiveOrganization(org);
                                                    setIsOrgDropdownOpen(false);
                                                    toast.success(`Switched workspace to ${org.name}!`);
                                                }}
                                                className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${isActiveOrg ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="truncate">{org.name}</span>
                                                </div>
                                                {isActiveOrg ? (
                                                    <Check className="w-3 h-3 text-white shrink-0" />
                                                ) : (
                                                    <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded shrink-0">
                                                        {org.role === 'teacher' ? 'Teacher' : 'Student'}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Nav Items */}
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

                    {/* Footer / Sign Out */}
                    <div className="p-4 border-t border-gray-100 flex-shrink-0">
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
                </div>
            </aside>
        </>
    );
}
