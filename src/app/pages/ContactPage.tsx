import { Mail, Send, Linkedin, Twitter, Youtube, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
                    <a href="mailto:hello@mentozy.app" className="font-medium hover:text-amber-400 transition-colors">hello@mentozy.app</a>
                  </div>
                </div>

                {/* Career CTA */}
                <Link
                  to="/careers"
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
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {submitStatus === 'success' && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="font-medium">Message sent successfully! We'll be in touch soon.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-medium">Failed to send message. Please try again or email us directly.</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">First Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" 
                    placeholder="John" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" 
                    placeholder="Doe" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Email <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" 
                  placeholder="john@example.com" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Message <span className="text-red-500">*</span></label>
                <textarea 
                  rows={4} 
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none" 
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'} 
                {!isSubmitting && <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}