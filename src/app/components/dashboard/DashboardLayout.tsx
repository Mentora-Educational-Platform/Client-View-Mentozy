
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ModeToggle } from './ModeToggle';
import { Menu, Building2, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useOrganizationMode } from '../../../context/OrganizationModeContext';
import { Navigate } from 'react-router-dom';
import { getSupabase } from '../../../lib/supabase';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');

    const toggleDesktopSidebar = () => {
        setIsDesktopCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('sidebarCollapsed', String(newState));
            return newState;
        });
    };
    const { user, loading } = useAuth();
    const { mode, activeOrganization, hasOrganizations } = useOrganizationMode();
    const [orgName, setOrgName] = useState('Mentozy');

    useEffect(() => {
        if (!user) return;

        if (mode === 'organization' && activeOrganization) {
            setOrgName(activeOrganization.name);
            return;
        }

        const fetchCompanyName = async () => {
            const supabase = getSupabase();
            if (!supabase) return;
            const { data } = await supabase.from('mentors').select('company').eq('user_id', user.id).single();
            if (data?.company) {
                setOrgName(data.company);
            } else {
                setOrgName('Mentozy');
            }
        };
        fetchCompanyName();
    }, [user, mode, activeOrganization]);

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    const isOrgMode = mode === 'organization' && activeOrganization;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)}
                isDesktopCollapsed={isDesktopCollapsed}
                onToggleDesktop={toggleDesktopSidebar}
            />

            {/* Main Content */}
            <div className={`transition-all duration-300 ${isDesktopCollapsed ? 'md:ml-20' : 'md:ml-64'} min-h-screen flex flex-col`}>

                {/* Organization Mode Banner — always visible when in org mode */}
                {isOrgMode && (
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 md:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-white text-sm font-semibold truncate">
                                {activeOrganization.name}
                            </span>
                            <span className="hidden sm:inline text-xs text-indigo-200 bg-white/10 px-2 py-0.5 rounded-full capitalize">
                                {activeOrganization.role === 'teacher' ? 'Teacher' : 'Student'} · Organization Mode
                            </span>
                        </div>
                        <div className="flex-shrink-0">
                            <ModeToggle compact />
                        </div>
                    </div>
                )}

                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-lg text-gray-900 truncate">
                            {isOrgMode ? activeOrganization.name : orgName}
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-sm flex-shrink-0"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasOrganizations && !isOrgMode && <ModeToggle />}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Desktop Header — only show in personal mode (org mode has the banner) */}
                {!isOrgMode && hasOrganizations && (
                    <header className="hidden md:flex bg-white border-b border-gray-200 px-6 py-3 items-center justify-between sticky top-0 z-30">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            <span>Personal Mode</span>
                        </div>
                        <ModeToggle />
                    </header>
                )}



                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
