"use client";
import { Search, Menu, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

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
