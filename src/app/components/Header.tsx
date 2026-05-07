import { Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';


export function Header() {
  const { theme, setTheme, isDarkMode } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Mentors', path: '/mentors' },
    { label: 'Pricing', path: '/plans' },
    { label: 'Tracks', path: '/tracks' },
    { label: 'Careers', path: '/careers' },
    { label: 'About', path: '/about' },
    { label: 'Library', path: '/library' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-all duration-300">
      {/* Maintenance Banner */}
      <div className="bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 px-4 py-2 text-center text-sm font-semibold border-b border-amber-200 dark:border-amber-800">
        🚧 Our mentor flow is currently under maintenance. You can still make accounts as students!
      </div>
      <div className="container mx-auto px-4 sm:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Mentozy</span>
            <div className="w-2 h-2 bg-amber-500 rounded-sm group-hover:rotate-45 transition-transform duration-300"></div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 rounded-xl transition-all duration-200"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className={`hidden sm:flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64' : 'w-auto'}`}>
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="relative w-full flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search query..."
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm dark:text-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-2 p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center justify-center p-2.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 rounded-xl transition-all duration-200"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-700 dark:text-gray-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link
              to="/login"
              className="hidden md:block px-4 py-2.5 text-gray-600 dark:text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Log In
            </Link>

            <Link
              to="/signup"
              className="hidden md:block px-5 py-2.5 bg-gray-900 dark:bg-amber-500 hover:bg-gray-800 dark:hover:bg-amber-400 text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 absolute w-full inset-x-0 shadow-lg pb-4">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-slate-800">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-center text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-gray-200 dark:border-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-center bg-gray-900 dark:bg-amber-500 text-white dark:text-slate-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-amber-400 transition-colors shadow-md"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}