
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, loading } = useAuth();

    if (loading) return null; // Or a loading spinner
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="md:ml-64 min-h-screen flex flex-col">
                {/* Mobile Header */}
                <header className="md:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                        Mentozy
                        <div className="w-1.5 h-1.5 bg-primary rounded-sm"></div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-muted-foreground hover:bg-muted rounded-lg"
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
