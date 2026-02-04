import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, MessageSquare, PieChart, Award, LogOut, X, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const { signOut, user } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const role = user?.user_metadata?.role || 'student';

    const studentItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student-dashboard' },
        { icon: BookOpen, label: 'Courses', path: '/courses' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: PieChart, label: 'Analytics', path: '/analytics' },
        { icon: Award, label: 'Certifications', path: '/certifications' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    const mentorItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor-dashboard' },
        { icon: Calendar, label: 'Calendar', path: '/mentor-calendar' },
        { icon: MessageSquare, label: 'Messages', path: '/mentor-messages' },
        { icon: PieChart, label: 'Analytics', path: '/mentor-analytics' },
        { icon: Award, label: 'Achievements', path: '/mentor-achievements' },
        { icon: User, label: 'Profile', path: '/mentor-profile' },
    ];

    const isMentorPath = location.pathname.startsWith('/mentor');
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
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                            Mentozy
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-sm"></div>
                        </Link>
                        <button onClick={onClose} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-lg">
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
                                        ? 'bg-amber-50 text-amber-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                `}
                            >
                                <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-amber-500' : 'text-gray-400'}`} />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer / Sign Out */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={() => signOut()}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 w-full transition-colors"
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
