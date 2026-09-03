import { Sparkles, TrendingUp, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function KrishnaiteSection() {
  return (
    <section className="py-14 sm:py-16 md:py-24 bg-[#FAF9F6] border-t-4 border-gray-900 text-gray-900 overflow-hidden relative font-mono">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-150/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-150/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-4 sm:mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            The Krishnaite Ecosystem
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-gray-900 uppercase tracking-tight">
            Transformative <span className="text-[#f39c12]">Education</span> & Tech
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-700 font-bold max-w-xl mx-auto leading-relaxed uppercase">
            Discover the pathways designed to elevate your technical expertise and professional growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* Card 1: 18-Day AI Course */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between p-6 sm:p-8 bg-white border-2 sm:border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all group"
          >
            <div>
              <div className="w-12 h-12 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center mb-5 text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Sparkles className="w-6 h-6 text-indigo-700" />
              </div>
              <span className="text-[10px] sm:text-xs font-black text-[#f39c12] uppercase tracking-widest block mb-2">
                APPLY FOR KRISHNAITE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4 uppercase tracking-tight">
                18-DAY AI COURSE
              </h3>
              <p className="text-gray-700 font-bold leading-relaxed text-xs sm:text-sm mb-6 sm:mb-8 uppercase">
                An intensive 18-day AI journey designed to help you build practical AI skills, work with modern AI tools, and turn what you learn into real projects.
              </p>
            </div>
            <Link 
              to="/academy"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] bg-[#f39c12] hover:bg-[#e08e0b] border-2 sm:border-4 border-gray-900 text-gray-900 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              APPLY
              <ArrowRight className="w-4 h-4 text-gray-900" />
            </Link>
          </motion.div>

          {/* Card 2: Career Acceleration */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between p-6 sm:p-8 bg-white border-2 sm:border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 bg-amber-50 border-2 border-gray-900 flex items-center justify-center text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border-2 border-gray-900 text-[10px] font-black uppercase text-gray-700 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                  <Lock className="w-3 h-3 text-gray-600" /> Locked
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">
                KRISHNAITE EARN
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4 uppercase tracking-tight">
                CAREER ACCELERATION
              </h3>
              <p className="text-gray-700 font-bold leading-relaxed text-xs sm:text-sm mb-6 sm:mb-8 uppercase">
                Build your career with Krishnaite through career-focused opportunities, practical guidance, and a path toward professional growth.
              </p>
            </div>
            <div 
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] bg-gray-100 border-2 sm:border-4 border-gray-900 text-gray-700 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] cursor-not-allowed select-none"
            >
              <Lock className="w-4 h-4 text-gray-600" />
              SOON WILL BE UNLOCKED
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default KrishnaiteSection;

