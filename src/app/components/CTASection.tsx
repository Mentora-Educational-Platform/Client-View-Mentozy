import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function CTASection() {
  return (
    <section className="py-32 bg-[#fcfcfc] dark:bg-slate-950 relative overflow-hidden transition-colors duration-700">
      <div className="container mx-auto px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative bg-white dark:bg-slate-900 rounded-[4rem] overflow-hidden px-10 py-24 md:px-24 md:py-32 text-center border border-gray-100 dark:border-slate-800 shadow-[0_40px_100px_rgba(0,0,0,0.03)] dark:shadow-none"
        >

          {/* Premium Ambient Backgrounds */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] animate-blob" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-amber-600 dark:text-amber-400 text-[11px] font-black uppercase tracking-[0.3em] mb-12 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Start your journey
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-medium text-gray-900 dark:text-white mb-10 tracking-tight leading-[1.05]"
            >
              Ready to meet your <span className="italic font-serif text-amber-500">mentor?</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 mb-16 leading-relaxed max-w-2xl mx-auto font-light tracking-tight"
            >
              Join a growing community of builders who are mastering new skills and advancing their careers with real, human-led guidance.
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-16 py-7 bg-amber-500 text-slate-950 rounded-[2rem] font-bold text-lg hover:bg-amber-400 transition-all hover:scale-[1.03] active:scale-95 shadow-[0_20px_50px_rgba(245,158,11,0.25)] flex items-center justify-center gap-4 animate-glow-amber"
              >
                Join for Free <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                to="/tracks"
                className="w-full sm:w-auto px-16 py-7 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-100 dark:border-slate-700 rounded-[2rem] font-bold text-lg hover:bg-gray-50 dark:hover:bg-slate-750 transition-all flex items-center justify-center gap-4 backdrop-blur-xl"
              >
                Explore Tracks
              </Link>
            </div>

            {/* Trust Badges - Softer Typography */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.1em]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500/50" /> No credit card
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500/50" /> Expert Verified
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500/50" /> Cancel anytime
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}