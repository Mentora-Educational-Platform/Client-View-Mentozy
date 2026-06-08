import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function CTASection() {
  return (
    <section className="py-24 bg-[#FAF9F6] border-t-4 border-gray-900 relative overflow-hidden font-mono text-gray-900">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative bg-white border-4 border-gray-900 px-6 py-16 md:px-16 md:py-24 text-center shadow-[6px_6px_0px_rgba(0,0,0,1)]"
        >
          {/* Ambient Backgrounds */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-8 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"
            >
              <Sparkles className="w-4 h-4 text-gray-900" /> Start your journey
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-black text-gray-900 mb-8 uppercase tracking-tight leading-none"
            >
              Ready to meet your <span className="text-[#f39c12]">mentor?</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-base md:text-lg text-gray-700 font-bold mb-12 leading-relaxed max-w-2xl mx-auto uppercase"
            >
              Join a growing community of builders who are mastering new skills and advancing their careers with real, human-led guidance.
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-10 py-5 bg-[#eff3ff] text-gray-900 border-4 border-gray-900 font-black text-lg hover:bg-[#eff3ff]/80 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4 uppercase"
              >
                Join for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/tracks"
                className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border-4 border-gray-900 font-black text-lg hover:bg-gray-100 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4 uppercase"
              >
                Explore Tracks
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs text-gray-900 font-black uppercase tracking-wider">
              <div className="flex items-center gap-2 border-2 border-gray-900 bg-[#FAF9F6] px-3 py-1.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="w-4 h-4 text-gray-900" /> No credit card
              </div>
              <div className="flex items-center gap-2 border-2 border-gray-900 bg-[#FAF9F6] px-3 py-1.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="w-4 h-4 text-gray-900" /> Expert Verified
              </div>
              <div className="flex items-center gap-2 border-2 border-gray-900 bg-[#FAF9F6] px-3 py-1.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="w-4 h-4 text-gray-900" /> Cancel anytime
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}