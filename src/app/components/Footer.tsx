import { memo } from 'react';
import { Twitter, Linkedin, Instagram, Send, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiCrunchbase, SiProducthunt } from 'react-icons/si';

export const Footer = memo(function Footer() {
  const links = {
    platform: [
      { label: 'Browse Mentors', path: '/mentors' },
      { label: 'Learning Tracks', path: '/tracks' },
      { label: 'Open Library', path: '/library' },
      { label: 'Blog', path: '/blog' },
      { label: 'Success Stories', path: '/#opportunities' },
      { label: 'Pricing', path: '/#pricing' }
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Contact', path: '/contact' },
      { label: 'Become a Mentor', path: '/mentor/apply' },
      { label: 'Partner With Us', path: '/org-onboarding' },
      { label: 'Organization Login', path: '/org-login' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy-policy' },
      { label: 'Terms of Service', path: '/terms-of-service' },
      { label: 'Cookie Policy', path: '/cookie-policy' },
      { label: 'Documentation', path: '/docs' }
    ]
  };

  return (
    <footer className="bg-[#FAF9F6] pt-12 md:pt-20 pb-10 border-t-4 border-gray-900 font-mono select-none">
      <div className="container mx-auto px-4 md:px-6">

        <div className="grid lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-6 cursor-pointer border-2 border-gray-900 bg-white px-2 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            >
              <div className="w-6 h-6 bg-[#f39c12] border border-gray-900 flex items-center justify-center text-gray-900 font-black text-sm">
                M
              </div>
              <span className="text-lg font-black text-gray-900 tracking-tight uppercase">Mentozy</span>
            </Link>
            <p className="text-gray-700 text-xs font-bold uppercase leading-relaxed mb-6">
              Democratizing mentorship for everyone. We connect ambitious learners with world-class experts.
            </p>

            <div className="relative mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-4 pr-12 py-3 border-4 border-gray-900 bg-white text-gray-900 placeholder-gray-500 text-xs font-bold uppercase focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#f39c12] border-2 border-gray-900 text-gray-900 hover:bg-[#e08e0b] shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-900 hover:text-[#f39c12] transition-colors">
              <Mail className="w-4 h-4 text-gray-900" />
              <a href="mailto:hello@mentozy.app" className="underline decoration-2 decoration-gray-900">hello@mentozy.app</a>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div>
              <h4 className="font-black text-gray-900 uppercase text-sm tracking-wider mb-6">Platform</h4>
              <ul className="space-y-4 text-xs font-bold uppercase text-gray-700">
                {links.platform.map((link, i) => (
                  <li key={i}>
                    <Link to={link.path} className="hover:text-[#f39c12] hover:underline decoration-2 transition-all block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-gray-900 uppercase text-sm tracking-wider mb-6">Company</h4>
              <ul className="space-y-4 text-xs font-bold uppercase text-gray-700">
                {links.company.map((link, i) => (
                  <li key={i}>
                    <Link to={link.path} className="hover:text-[#f39c12] hover:underline decoration-2 transition-all block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-gray-900 uppercase text-sm tracking-wider mb-6">Legal</h4>
              <ul className="space-y-4 text-xs font-bold uppercase text-gray-700">
                {links.legal.map((link, i) => (
                  <li key={i}>
                    <Link to={link.path} className="hover:text-[#f39c12] hover:underline decoration-2 transition-all block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t-4 border-gray-900 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          <p className="text-xs font-black uppercase text-gray-900 text-center md:text-left">
            © {new Date().getFullYear()} Mentozy Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <a href="https://x.com/wearementozy" className="p-2 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] text-gray-900 transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/company/mentozy?trk=public_jobs_topcard_logo" className="p-2 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] text-gray-900 transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://www.crunchbase.com/organization/mentozy" className="p-2 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] text-gray-900 transition-all" target="_blank" rel="noopener noreferrer">
              <SiCrunchbase className="w-4 h-4" />
            </a>
            <a href="https://www.producthunt.com/products/mentozy" className="p-2 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] text-gray-900 transition-all" target="_blank" rel="noopener noreferrer">
              <SiProducthunt className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] text-gray-900 transition-all">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});