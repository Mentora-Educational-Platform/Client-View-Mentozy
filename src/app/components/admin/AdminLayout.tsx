import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Award, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  ArrowLeft, 
  Menu, 
  X, 
  ExternalLink, 
  Loader2,
  AlertOctagon,
  Clock,
  Sparkles,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: 'dashboard' | 'applications' | 'krishnaite' | 'organizations' | 'mentors' | 'settings';
  pendingCount?: number;
}

export function AdminLayout({ children, activeTab = 'dashboard', pendingCount: explicitPendingCount }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();

  console.log("ADMIN LAYOUT RENDER", { userEmail: user?.email, isAdmin, authLoading });

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [krishnaitePendingCount, setKrishnaitePendingCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Fetch pending counts in the background (non-blocking)
  useEffect(() => {
    async function fetchPendingApplicationsCount() {
      if (!user || !supabase || !isAdmin) return;

      try {
        const { count } = await supabase
          .from('mentor_applications')
          .select('*', { count: 'exact', head: true })
          .in('status', ['under_review', 'pending', 'needs_info']);

        setPendingCount(count || 0);
      } catch (err) {
        console.warn('[Admin Layout] Count fetch error:', err);
      }

      try {
        const { count: kgaCount } = await supabase
          .from('krishnaite_course_applications')
          .select('*', { count: 'exact', head: true })
          .in('status', ['under_review', 'submitted', 'needs_info']);

        setKrishnaitePendingCount(kgaCount || 0);
      } catch (err) {
        // Local storage count fallback
        try {
          const raw = localStorage.getItem('mentozy_krishnaite_apps_local_v1');
          if (raw) {
            const list = JSON.parse(raw);
            const count = list.filter((a: any) => ['under_review', 'submitted', 'needs_info'].includes(a.status)).length;
            setKrishnaitePendingCount(count);
          }
        } catch (e) {
          console.warn('[Admin Layout] Local store count fallback error:', e);
        }
      }
    }

    if (!authLoading && user && isAdmin) {
      fetchPendingApplicationsCount();
    }
  }, [user, authLoading, isAdmin]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      console.log("ADMIN LAYOUT: Logging out...");
      if (supabase) {
        await supabase.auth.signOut();
      }
      await signOut();
      toast.success('Admin session ended');
      navigate('/login');
    } catch (err) {
      navigate('/login');
    }
  };

  // Loading Screen
  if (authLoading) {
    console.log("ADMIN LAYOUT: Rendering loader (authLoading is true)");
    return (
      <div className="min-h-screen bg-[#FAF9F6] font-mono flex items-center justify-center text-gray-900">
        <div className="text-center space-y-3 bg-white p-8 border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#f39c12]" />
          <p className="font-black text-xs uppercase tracking-wider">Verifying Admin Privileges...</p>
        </div>
      </div>
    );
  }

  // Not Logged In -> Redirect to /login using Navigate component
  if (!user) {
    console.log("ADMIN LAYOUT: No authenticated user, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // Unauthorized Screen
  if (!isAdmin) {
    console.log("ADMIN LAYOUT: User is not admin, rendering Access Restricted screen");
    return (
      <div className="min-h-screen bg-[#FAF9F6] font-mono flex items-center justify-center p-6 text-gray-900">
        <div className="max-w-md w-full bg-white border-4 border-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center space-y-5">
          <div className="w-16 h-16 bg-rose-100 border-4 border-gray-900 text-rose-600 flex items-center justify-center mx-auto shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase text-gray-900">Access Restricted</h2>
            <p className="text-xs font-bold text-gray-600 leading-relaxed">
              Your account (<strong>{user.email}</strong>) does not have verified administrative permissions for the Mentozy Admin Dashboard.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button 
              onClick={() => navigate('/')}
              className="w-full py-3 bg-[#f39c12] text-gray-900 font-black text-xs uppercase border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-[#e08e0b]"
            >
              Return to Student / Mentor Workspace
            </button>
            <button 
              onClick={handleLogout}
              className="w-full py-2.5 bg-white text-gray-700 font-bold text-xs uppercase border-2 border-gray-900 hover:bg-gray-50"
            >
              Sign In as Different User
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/admin', 
      icon: LayoutDashboard 
    },
    { 
      id: 'applications', 
      label: 'Mentor Applications', 
      path: '/admin/mentor-applications', 
      icon: FileText,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    { 
      id: 'krishnaite', 
      label: 'Krishnaite AI Course', 
      path: '/admin/krishnaite-applications', 
      icon: Sparkles,
      badge: (explicitPendingCount ?? krishnaitePendingCount) > 0 ? (explicitPendingCount ?? krishnaitePendingCount) : undefined
    },
    { 
      id: 'organizations', 
      label: 'Organizations', 
      path: '/admin/organizations', 
      icon: Building2 
    },
    { 
      id: 'mentors', 
      label: 'Mentors Directory', 
      path: '/mentors', 
      icon: Users 
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-mono text-gray-900 flex flex-col select-none">
      
      {/* 1. Admin Topbar */}
      <header className="bg-white border-b-4 border-gray-900 px-3 sm:px-6 py-2.5 sm:py-3.5 sticky top-0 z-40">
        <div className="flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center border-2 border-gray-900 bg-white active:bg-gray-100 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link 
              to="/admin" 
              className="flex items-center gap-2 border-2 sm:border-4 border-gray-900 bg-white px-2.5 sm:px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] shrink-0"
            >
              <span className="text-sm sm:text-lg font-black tracking-tight text-gray-900 uppercase">Mentozy Admin</span>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#f39c12] border-2 border-gray-900"></div>
            </Link>

            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-wider shrink-0">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Superuser Control
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Admin User Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] truncate max-w-[200px]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <span className="truncate">{user.email || 'Admin'}</span>
            </div>

            {/* Return to platform link */}
            <Link 
              to="/" 
              target="_blank"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 border-2 border-gray-900 bg-white text-gray-700 text-xs font-black uppercase hover:bg-gray-50 shadow-[2px_2px_0px_rgba(0,0,0,1)] min-h-[38px]"
              title="Open public platform"
            >
              Platform <ExternalLink className="w-3 h-3" />
            </Link>

            {/* Logout button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 border-2 border-gray-900 bg-rose-50 text-rose-800 text-[11px] sm:text-xs font-black uppercase hover:bg-rose-100 shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer min-h-[38px] sm:min-h-[40px]"
            >
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Body Grid (Sidebar + Main Content Canvas) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-white border-r-4 border-gray-900 hidden md:flex flex-col justify-between p-5 flex-shrink-0">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3">Admissions & Moderation</p>
              
              <nav className="space-y-1.5 pt-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = location.pathname === item.path || (item.id === 'applications' && location.pathname.startsWith('/admin/mentor-applications'));

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center justify-between px-3.5 py-2.5 border-2 text-xs font-black uppercase transition-all ${
                        isCurrent 
                          ? 'bg-[#f39c12] text-gray-900 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] translate-x-0.5' 
                          : 'bg-white text-gray-700 border-transparent hover:border-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 bg-gray-900 text-white text-[10px] font-black rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Quick System Info Box */}
          <div className="bg-[#FAF9F6] border-2 border-gray-900 p-3.5 text-[10px] font-bold space-y-1 text-gray-600 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between text-gray-900 font-black uppercase">
              <span>Mentozy Core</span>
              <span className="text-emerald-600">v2.4 Live</span>
            </div>
            <p className="truncate">Admin: {user?.email || 'Administrator'}</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMobileMenuOpen(false);
            }}
          >
            <div className="w-[85vw] max-w-xs bg-white border-r-4 border-gray-900 h-full p-5 sm:p-6 flex flex-col justify-between shadow-[8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-left duration-200">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b-4 border-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="font-black uppercase text-sm">Admin Menu</span>
                    <span className="w-2.5 h-2.5 bg-[#f39c12] border border-gray-900"></span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center border-2 border-gray-900 bg-white active:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-[#eff3ff] border-2 border-gray-900 p-2.5 text-[11px] font-black truncate">
                  <span className="text-gray-500 block text-[9px] uppercase">Logged in as</span>
                  <span className="text-gray-900 truncate block">{user.email}</span>
                </div>

                <nav className="space-y-2 pt-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = location.pathname === item.path || (item.id === 'applications' && location.pathname.startsWith('/admin/mentor-applications'));

                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between p-3.5 border-2 border-gray-900 font-black text-xs uppercase min-h-[48px] shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] ${
                          isCurrent ? 'bg-[#f39c12] text-gray-900' : 'bg-white text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" /> {item.label}
                        </div>
                        {item.badge !== undefined && (
                          <span className="px-2 py-0.5 bg-gray-900 text-white text-[10px] font-black">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  <Link
                    to="/"
                    target="_blank"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3.5 border-2 border-gray-900 bg-white font-black text-xs uppercase min-h-[48px] shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink className="w-4 h-4" /> Platform Website
                    </div>
                  </Link>
                </nav>
              </div>

              <div className="pt-4 border-t-2 border-gray-900 space-y-2">
                <button 
                  onClick={handleLogout} 
                  className="w-full min-h-[48px] py-3 bg-rose-100 hover:bg-rose-200 border-2 border-gray-900 text-rose-900 font-black text-xs uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Main Workstation Body */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 lg:p-10 min-w-0">
          <div className="max-w-6xl mx-auto w-full min-w-0">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

export default AdminLayout;
