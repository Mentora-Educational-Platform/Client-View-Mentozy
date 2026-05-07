import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function CTASection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-amber-50 dark:bg-slate-800 rounded-3xl overflow-hidden px-6 py-20 md:px-20 md:py-24 text-center border border-amber-100 dark:border-slate-700 shadow-xl shadow-amber-100/50 dark:shadow-none"
        >

          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-blob" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/60 dark:bg-slate-900/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 animate-blob animation-delay-2000" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm"
            >
              Start your journey
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight"
            >
              Book Verified Mentors
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              Join 50,000+ learners who are mastering new skills, getting hired, and advancing their careers with Mentozy.
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-900 rounded-xl font-bold text-lg hover:bg-amber-700 dark:hover:bg-amber-400 transition-all hover:scale-105 shadow-lg shadow-amber-600/25 dark:shadow-none flex items-center justify-center gap-2 animate-glow-amber"
              >
                Get Started for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/tracks"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl font-bold text-lg hover:border-amber-200 dark:hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                View Learning Tracks
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-500" /> No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-500" /> 7-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-500" /> Cancel anytime
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}