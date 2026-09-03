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
    { label: 'Academy', path: '/academy' },
    { label: 'Careers', path: '/careers' },
    { label: 'About', path: '/about' },
    { label: 'Library', path: '/library' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-4 border-gray-900 bg-[#FAF9F6] font-mono select-none">
      {/* Neo-brutalist Maintenance Banner */}
      <div className="bg-[#f39c12] text-gray-900 px-3 py-1.5 text-center text-[10px] sm:text-xs font-black uppercase tracking-wider border-b-4 border-gray-900">
        ⚠️ Our mentor applications are under maintenance • Students are completely live
      </div>
      <div className="container mx-auto px-3 sm:px-6 py-2.5 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group border-2 sm:border-4 border-gray-900 bg-white px-2.5 sm:px-3 py-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] shrink-0"
          >
            <span className="text-lg sm:text-xl font-black tracking-tight text-gray-900 uppercase">Mentozy</span>
            <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-[#f39c12] border-2 border-gray-900"></div>
          </Link>

          <nav className="hidden xl:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `text-xs font-black uppercase tracking-wider px-3 py-1.5 border-2 border-transparent transition-all hover:bg-white hover:border-gray-900 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isActive ? 'bg-[#f39c12] border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-gray-900' : 'text-gray-900'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] transition-all text-gray-900 cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <div className={`hidden sm:flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64' : 'w-auto'}`}>
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="relative w-full flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-4 pr-10 py-2 border-2 border-gray-900 bg-white text-gray-900 placeholder-gray-500 focus:outline-none text-xs font-bold uppercase"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-2 p-1 hover:bg-gray-100 border border-gray-900 rounded text-gray-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] transition-all text-gray-900 cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden min-w-[40px] min-h-[40px] flex items-center justify-center bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] text-gray-900 cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Apply Us Button */}
            <Link
              to="/krishnaite/apply"
              className="hidden md:flex items-center px-4 py-2 border-2 sm:border-4 border-gray-900 bg-[#eff3ff] hover:bg-[#dbeafe] text-gray-900 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all min-h-[40px] cursor-pointer"
            >
              Apply Us
            </Link>

            <Link
              to="/login"
              className="hidden md:flex items-center px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] transition-all min-h-[40px]"
            >
              Log In
            </Link>

            <Link
              to="/signup"
              className="hidden md:flex items-center px-5 py-2 border-4 border-gray-900 bg-[#f39c12] text-gray-900 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all min-h-[40px]"
            >
              Join Mentozy
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="xl:hidden border-t-4 border-gray-900 bg-[#FAF9F6] absolute w-full inset-x-0 shadow-[0_4px_0px_rgba(0,0,0,1)] pb-6 max-h-[calc(100vh-100px)] overflow-y-auto"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 border-2 border-gray-900 text-xs font-black uppercase tracking-wider transition-colors min-h-[44px] flex items-center ${isActive ? 'bg-[#f39c12] text-gray-900' : 'bg-white text-gray-900 hover:bg-[#eff3ff]'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="flex flex-col gap-2.5 mt-4 pt-4 border-t-2 border-gray-900">
                <Link
                  to="/krishnaite/apply"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-center border-2 sm:border-4 border-gray-900 bg-[#eff3ff] hover:bg-[#dbeafe] text-gray-900 font-black uppercase tracking-wider transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] min-h-[44px] flex items-center justify-center text-xs cursor-pointer"
                >
                  Apply Us
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-center border-2 border-gray-900 bg-white text-gray-900 font-black uppercase tracking-wider hover:bg-[#eff3ff] transition-colors min-h-[44px] flex items-center justify-center text-xs"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-center border-4 border-gray-900 bg-[#f39c12] text-gray-900 font-black uppercase tracking-wider hover:bg-[#e08e0b] transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] min-h-[44px] flex items-center justify-center text-xs"
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