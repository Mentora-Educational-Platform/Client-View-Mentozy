import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Calendar, MessageSquare, PieChart, Award, LogOut, X, User, Users, PlusCircle, Settings } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getUserProfile } from '../../../lib/api';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const { signOut, user } = useAuth();
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

    const studentItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student-dashboard' },
        { icon: BookOpen, label: 'Courses', path: '/courses' },
        { icon: Users, label: 'Mentors', path: '/dashboard-mentors' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: PieChart, label: 'Analytics', path: '/analytics' },
        { icon: Award, label: 'Certifications', path: '/certifications' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const mentorItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor-dashboard' },
        { icon: PlusCircle, label: 'Create Course', path: '/mentor-create-course' },
        { icon: Calendar, label: 'Calendar', path: '/mentor-calendar' },
        { icon: MessageSquare, label: 'Messages', path: '/mentor-messages' },
        { icon: PieChart, label: 'Analytics', path: '/mentor-analytics' },
        { icon: Award, label: 'Achievements', path: '/mentor-achievements' },
        { icon: User, label: 'Profile', path: '/mentor-profile' },
        { icon: Settings, label: 'Settings', path: '/mentor-settings' },
    ];

    const isMentorPath = location.pathname.startsWith('/mentor-');
    const isMentor = role === 'mentor' || role === 'organization' || isMentorPath;

    const navItems = isMentor ? mentorItems : studentItems;

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
            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-sidebar-foreground">
                            Mentozy
                            <div className="w-1.5 h-1.5 bg-primary rounded-sm"></div>
                        </Link>
                        <button onClick={onClose} className="md:hidden p-1 text-sidebar-foreground/50 hover:bg-sidebar-accent/50 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && onClose()}
                                className={`
                                    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all
                                    ${isActive(item.path)
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}
                                `}
                            >
                                <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'}`} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer / Sign Out */}
                    <div className="p-4 border-t border-sidebar-border">
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl w-full transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
