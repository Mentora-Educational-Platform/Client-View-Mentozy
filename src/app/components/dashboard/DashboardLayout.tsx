
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getSupabase } from '../../../lib/supabase';
import { useEffect } from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, loading } = useAuth();
    const [orgName, setOrgName] = useState('Mentozy');

    useEffect(() => {
        if (!user) return;
        const fetchCompanyName = async () => {
            const supabase = getSupabase();
            if (!supabase) return;
            const { data } = await supabase.from('mentors').select('company').eq('user_id', user.id).single();
            if (data?.company) {
                setOrgName(data.company);
            }
        };
        fetchCompanyName();
    }, [user]);

    if (loading) return null; // Or a loading spinner
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="md:ml-64 min-h-screen flex flex-col">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-2 font-bold text-lg text-gray-900 truncate">
                        {orgName}
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-sm flex-shrink-0"></div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
