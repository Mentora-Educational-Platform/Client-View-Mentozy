import { Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';


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
    { label: 'Projects', path: '/projects' },
    { label: 'Pricing', path: '/plans' },
    { label: 'Tracks', path: '/tracks' },
    { label: 'Careers', path: '/careers' },
    { label: 'About', path: '/about' },
    { label: 'Library', path: '/library' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl transition-all duration-500">
      {/* Soft Maintenance Banner */}
      <div className="bg-amber-50/80 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.15em] border-b border-amber-100/50 dark:border-amber-900/30">
        🚀 Our mentor onboarding is currently being upgraded. Student accounts are fully active.
      </div>
      <div className="container mx-auto px-6 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">Mentozy</span>
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
          </Link>

          <nav className="hidden xl:flex items-center gap-10">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `text-[13px] font-bold uppercase tracking-[0.1em] transition-all hover:translate-y-[-1px] ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Theme Toggle (Soft) */}
            <button
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
              className="p-3 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 rounded-2xl transition-all duration-300"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className={`hidden sm:flex items-center transition-all duration-500 ${isSearchOpen ? 'w-72' : 'w-auto'}`}>
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="relative w-full flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anything..."
                    className="w-full pl-5 pr-12 py-3 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all text-sm dark:text-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-3 p-2 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-400 dark:text-gray-500 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center justify-center p-3 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 rounded-2xl transition-all duration-300"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-3 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors text-gray-600 dark:text-gray-400"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link
              to="/login"
              className="hidden md:block px-5 py-3 text-gray-500 dark:text-gray-400 text-sm font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Log In
            </Link>

            <Link
              to="/signup"
              className="hidden md:block px-7 py-3 bg-gray-900 dark:bg-amber-500 hover:bg-gray-800 dark:hover:bg-amber-400 text-white dark:text-slate-900 text-sm font-bold rounded-2xl transition-all shadow-xl shadow-gray-200/50 dark:shadow-amber-500/10 hover:translate-y-[-2px]"
            >
              Join Mentozy
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Refined) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="xl:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 absolute w-full inset-x-0 shadow-2xl pb-8"
          >
            <nav className="flex flex-col p-6 gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-5 py-4 rounded-2xl text-sm font-bold tracking-wide transition-colors ${isActive ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="flex flex-col gap-4 mt-4 pt-6 border-t border-gray-100 dark:border-slate-800">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-4 text-center text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-900 rounded-2xl transition-colors border border-gray-200 dark:border-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-4 text-center bg-gray-900 dark:bg-amber-500 text-white dark:text-slate-900 font-bold rounded-2xl hover:bg-gray-800 dark:hover:bg-amber-400 transition-colors shadow-lg"
                >
                  Join the Community
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}