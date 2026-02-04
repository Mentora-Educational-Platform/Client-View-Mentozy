"use client";
import { Mail, Send, Linkedin, Twitter, Youtube, Briefcase } from 'lucide-react';
import Link from 'next/link';

export function ContactPage() {
  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6">

        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

          {/* Info Side */}
          <div className="md:w-5/12 bg-gray-900 p-10 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get in touch</h2>
              <p className="text-gray-400 mb-10 leading-relaxed">
                Have questions about our mentorship programs or want to partner with us? We'd love to hear from you.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-amber-500 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email us at</p>
                    <a href="mailto:wearementozy@gmail.com" className="font-medium hover:text-amber-400 transition-colors">wearementozy@gmail.com</a>
                  </div>
                </div>

                {/* Career CTA */}
                <Link href="/careers"
                  className="flex items-center gap-4 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-amber-500 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Want to join the team?</p>
                    <p className="font-medium text-amber-400 group-hover:text-amber-300 transition-colors underline decoration-amber-400/30 underline-offset-4">
                      Check out our Career Page
                    </p>
                  </div>
                </Link>
              </div>

              {/* Social Links */}
              <div className="mt-10 pt-8 border-t border-gray-800">
                <p className="text-sm text-gray-400 mb-4">Follow us</p>
                <div className="flex gap-4">
                  <a
                    href="https://www.linkedin.com/company/mentozy?trk=public_jobs_topcard_logo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-amber-600 hover:text-white transition-all"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="https://x.com/wearementozy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-amber-600 hover:text-white transition-all"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.youtube.com/@MentozyOfficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-amber-600 hover:text-white transition-all"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 md:mt-0">
              <p className="text-sm text-gray-500">© 2026 Mentozy Inc.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-7/12 p-10 md:p-12">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">First Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" placeholder="john@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none" placeholder="Tell us how we can help..."></textarea>
              </div>

              <button className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-600/20 flex items-center justify-center gap-2">
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
