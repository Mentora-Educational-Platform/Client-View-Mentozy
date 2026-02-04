"use client";
import { Search, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Mentors', path: '/mentors' },
    { label: 'Pricing', path: '/plans' },
    { label: 'Tracks', path: '/tracks' },
    { label: 'Careers', path: '/careers' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/"
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-gray-700 transition-colors">Mentozy</span>
            <div className="w-2 h-2 bg-amber-500 rounded-sm group-hover:rotate-45 transition-transform duration-300"></div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className={`text-sm font-medium transition-colors ${pathname === item.path ? 'text-amber-600' : 'text-gray-600 hover:text-amber-600'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center justify-center p-2.5 hover:bg-amber-50 text-gray-600 hover:text-amber-600 rounded-xl transition-all duration-200">
              <Search className="w-5 h-5" />
            </button>

            <button className="md:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-700">
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/login"
              className="hidden md:block px-4 py-2.5 text-gray-600 font-bold hover:text-gray-900 transition-colors"
            >
              Log In
            </Link>

            <Link href="/signup"
              className="hidden md:block px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}