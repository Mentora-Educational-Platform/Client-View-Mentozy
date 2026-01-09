import { Twitter, Linkedin, Instagram, Github, Send, Mail } from 'lucide-react';

export function Footer() {
  const links = {
    platform: ['Browse Mentors', 'Learning Tracks', 'Success Stories', 'Pricing', 'For Enterprise'],
    resources: ['Blog', 'Community', 'Career Guide', 'Interview Prep', 'Help Center'],
    company: ['About Us', 'Careers', 'Become a Mentor', 'Contact', 'Press Kit'],
    legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security']
  };

  return (
    <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-100">
      <div className="container mx-auto px-6">
        
        <div className="grid lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Mentozy</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Democratizing mentorship for everyone. We connect ambitious learners with world-class experts to bridge the gap between education and career success.
            </p>
            
            {/* Newsletter */}
            <div className="relative mb-6">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-amber-50 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Contact Email */}
            <div className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors">
              <Mail className="w-4 h-4" />
              <a href="mailto:wearementozy@gmail.com">wearementozy@gmail.com</a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                {links.platform.map((link, i) => (
                  <li key={i}><a href="#" className="hover:text-amber-600 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                {links.resources.map((link, i) => (
                  <li key={i}><a href="#" className="hover:text-amber-600 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                {links.company.map((link, i) => (
                  <li key={i}><a href="#" className="hover:text-amber-600 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                {links.legal.map((link, i) => (
                  <li key={i}><a href="#" className="hover:text-amber-600 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Mentozy Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-amber-600 transition-colors hover:scale-110 transform">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-amber-600 transition-colors hover:scale-110 transform">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-amber-600 transition-colors hover:scale-110 transform">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-amber-600 transition-colors hover:scale-110 transform">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}