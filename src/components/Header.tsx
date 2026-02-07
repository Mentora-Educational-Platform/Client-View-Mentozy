"use client";
import { Search, Menu, LogOut, User as UserIcon, AlertTriangle, Bell, Check } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getNotifications, markNotificationRead, Notification } from '@/lib/api';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Optional: Poll every minute
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  async function loadNotifications() {
    if (!user) return;
    const data = await getNotifications(user.id);
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationRead(notification.id);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setShowNotifDropdown(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Mentors', path: '/mentors' },
    { label: 'Pricing', path: '/plans' },
    { label: 'Tracks', path: '/tracks' },
    { label: 'Careers', path: '/careers' },
    { label: 'About', path: '/about' },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-gray-700 transition-colors">Mentozy</span>
            <div className="w-2 h-2 bg-amber-500 rounded-sm group-hover:rotate-45 transition-transform duration-300"></div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.label}
                  href={item.path}
                  className={`text-sm font-medium transition-colors ${isActive ? 'text-amber-600' : 'text-gray-600 hover:text-amber-600'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center justify-center p-2.5 hover:bg-amber-50 text-gray-600 hover:text-amber-600 rounded-xl transition-all duration-200">
              <Search className="w-5 h-5" />
            </button>

            <button className="md:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-700">
              <Menu className="w-6 h-6" />
            </button>

            {user ? (
              <div className="flex items-center gap-3">

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <span className="text-xs text-gray-500">{unreadCount} new</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${!notif.read ? 'bg-amber-50/50' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-amber-500' : 'bg-transparent'}`} />
                                <div>
                                  <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(notif.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Verification Warning */}
                {!user.email_confirmed_at && (
                  <button
                    onClick={async () => {
                      const { getSupabase } = await import('@/lib/supabase');
                      const supabase = getSupabase();
                      if (supabase && user.email) {
                        const { error } = await supabase.auth.resend({
                          type: 'signup',
                          email: user.email,
                        });
                        if (error) {
                          toast.error("Failed to send verification email: " + error.message);
                        } else {
                          toast.success("Verification email sent! Please check your inbox.");
                        }
                      }
                    }}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100 hover:bg-amber-100 transition-colors animate-pulse"
                    title="Email unsent. Click to resend verification link."
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Verify Email
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                      <img
                        src={user.user_metadata.avatar_url || user.user_metadata.picture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <UserIcon className="w-6 h-6" />
                      </div>
                    )}
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.user_metadata?.full_name || user.email}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-amber-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" /> My Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:block px-4 py-2.5 text-gray-600 font-bold hover:text-gray-900 transition-colors"
                >
                  Log In
                </Link>

                <Link
                  href="/signup"
                  className="hidden md:block px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}