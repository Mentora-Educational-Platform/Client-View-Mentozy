import { ExternalLink, Building2, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export function KrishnaiteSection() {
  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6] border-t-4 border-gray-900 text-gray-900 overflow-hidden relative font-mono">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-150/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-150/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
            The Krishnaite Ecosystem
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-gray-900 uppercase tracking-tight">
            Transformative <span className="text-[#f39c12]">Education</span> & Tech
          </h2>
          <p className="text-sm md:text-base text-gray-700 font-bold max-w-xl mx-auto leading-relaxed uppercase">
            Discover the pathways designed to elevate your technical expertise and professional growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Parent Company */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between p-8 bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff]/10 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group"
          >
            <div>
              <div className="w-12 h-12 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center mb-6 text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Our Parent Company</span>
              <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Meet Krishnaite</h3>
              <p className="text-gray-750 font-bold leading-relaxed text-xs mb-8 uppercase">
                Explore a vast ecosystem of events, cutting-edge projects, and official collaborations. 
                As part of the Krishnaite family, Mentozy brings you closer to industry-leading initiatives and transformative opportunities.
              </p>
            </div>
            <a 
              href="https://krishnaite.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-900 text-gray-900 font-black hover:bg-[#eff3ff] transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none uppercase"
            >
              Explore Krishnaite
              <ExternalLink className="w-4 h-4 text-gray-900" />
            </a>
          </motion.div>

          {/* Card 2: Academy */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between p-8 bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff]/10 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group"
          >
            <div>
              <div className="w-12 h-12 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center mb-6 text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <GraduationCap className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Official Academy</span>
              <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Our Official Academy</h3>
              <p className="text-gray-750 font-bold leading-relaxed text-xs mb-8 uppercase">
                Enroll as a Krishnaite to have the best 4 year complete tech journey with us. 
                Here, you learn in an advanced version of teaching directly by the founder, so why late? Join us today!
              </p>
            </div>
            <a 
              href="https://kga.krishnaite.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#eff3ff] border-2 border-gray-900 text-gray-900 font-black hover:bg-[#eff3ff]/80 transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none uppercase"
            >
              Visit Academy
              <ExternalLink className="w-4 h-4 text-gray-900" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

