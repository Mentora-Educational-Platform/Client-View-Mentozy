import { Search, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 transition-all duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-1 cursor-pointer group">
            <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-gray-700 transition-colors">Mentozy</span>
            <div className="w-2 h-2 bg-amber-500 rounded-sm group-hover:rotate-45 transition-transform duration-300"></div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium text-gray-900 hover:text-amber-600 transition-colors">
              Home
            </a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors">
              Features
            </a>
            <a href="#solutions" className="text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors">
              Pricing
            </a>
            <a href="#support" className="text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors">
              Support
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 hover:bg-amber-50 text-gray-600 hover:text-amber-600 rounded-xl transition-all duration-200">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors md:hidden text-gray-700">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}