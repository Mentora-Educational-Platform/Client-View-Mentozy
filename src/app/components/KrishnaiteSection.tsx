import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export function KrishnaiteSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-amber-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-300">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/50 dark:bg-white/10 border border-amber-200/50 dark:border-white/10 text-amber-800 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-6">
          Our Parent Company
        </div>
        
        <h2 className="text-3xl md:text-5xl font-black mb-6 text-gray-900 dark:text-white">
          Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500">Krishnaite</span>
        </h2>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-10 max-w-3xl mx-auto">
          Explore a vast ecosystem of events, cutting-edge projects, and official collaborations. 
          As part of the Krishnaite family, Mentozy brings you closer to industry-leading initiatives and transformative opportunities.
        </p>
        
        <a 
          href="https://krishnaite.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-amber-500 text-white dark:text-black font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/25 group hover:-translate-y-0.5"
        >
          Explore us
          <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>
      </motion.div>
    </section>
  );
}
