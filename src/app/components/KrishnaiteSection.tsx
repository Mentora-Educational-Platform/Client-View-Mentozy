import { ExternalLink, Building2, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export function KrishnaiteSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-amber-50 to-white dark:from-gray-950 dark:to-black text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-300">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/50 dark:bg-white/10 border border-amber-200/50 dark:border-white/10 text-amber-800 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-6">
            The Krishnaite Ecosystem
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white">
            Transformative <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500">Education</span> & Tech
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
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
            className="flex flex-col justify-between p-8 rounded-3xl bg-white dark:bg-gray-900/60 border-2 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:border-amber-500/30 hover:border-amber-500/30 transition-all group"
          >
            <div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-700 dark:text-amber-400">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block mb-2">Our Parent Company</span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Meet Krishnaite</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                Explore a vast ecosystem of events, cutting-edge projects, and official collaborations. 
                As part of the Krishnaite family, Mentozy brings you closer to industry-leading initiatives and transformative opportunities.
              </p>
            </div>
            <a 
              href="https://krishnaite.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 dark:bg-gray-850 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-800 transition-all group-hover:-translate-y-0.5"
            >
              Explore Krishnaite
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </motion.div>

          {/* Card 2: Academy */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-gray-900/60 border-2 border-amber-200/50 dark:border-amber-500/20 shadow-sm hover:shadow-xl dark:hover:border-amber-500 hover:border-amber-500 transition-all group"
          >
            <div>
              <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6 text-black" />
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block mb-2">Official Academy</span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Our Official Academy</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                Enroll as a Krishnaite to have the best 4 year complete tech journey with us. 
                Here, you learn in an advanced version of teaching directly by the founder, so why late? Join us today!
              </p>
            </div>
            <a 
              href="https://kga.krishnaite.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 group-hover:-translate-y-0.5"
            >
              Visit Academy
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
