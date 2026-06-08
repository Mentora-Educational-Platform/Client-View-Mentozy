import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';

export function WhatWeDoDifferently() {
  const principles = [
    'Mentorship over mass content',
    'Quality guidance over quantity of courses',
    'Real outcomes over completion certificates',
    'Human connection over algorithms'
  ];

  const comparisons = [
    {
      aspect: 'Focus',
      typical: 'Course completion',
      mentozy: 'Learning outcomes'
    },
    {
      aspect: 'Support',
      typical: 'Q&A forums',
      mentozy: 'Direct mentor access'
    },
    {
      aspect: 'Content',
      typical: 'Pre-recorded lectures',
      mentozy: 'Guided learning paths'
    },
    {
      aspect: 'Goals',
      typical: 'Sell more courses',
      mentozy: 'Long-term growth'
    }
  ];

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6] border-t-4 border-gray-900 font-mono text-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
              Our Approach
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-6">
              Why Mentozy is different
            </h2>
            <p className="text-sm md:text-base text-gray-700 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
              We believe in a learning model that prioritizes your growth, not just your subscription.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left: Principles List */}
            <motion.div 
              variants={listContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-8 pt-4"
            >
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Core principles we stand by
              </h3>
              <div className="space-y-6">
                {principles.map((principle, index) => (
                  <motion.div key={index} variants={listItemVariants} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center shrink-0 mt-0.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                      <Check className="w-4 h-4 text-gray-900" />
                    </div>
                    <p className="text-sm text-gray-700 font-black uppercase pt-1">
                      {principle}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="pt-6"
              >
                <div className="relative p-6 md:p-8 bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <p className="text-gray-900 font-bold italic leading-relaxed text-xs uppercase">
                    Education is not just about consuming content,
                    <span className="font-black text-[#f39c12]">
                      {" "}it’s about connecting with those who have walked the path before you.
                    </span>
                  </p>
                  <p className="mt-4 text-[10px] text-gray-500 font-black uppercase tracking-wider">— Mentozy Philosophy</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Comparison Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7"
            >
              <div className="bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-2 border-b-4 border-gray-900">
                  <div className="p-6 text-center bg-[#eff3ff] border-r-4 border-gray-900">
                    <p className="font-black text-gray-900 uppercase tracking-wide text-xs">Typical Platforms</p>
                  </div>
                  <div className="p-6 text-center bg-white">
                    <p className="font-black text-[#f39c12] uppercase tracking-wide text-xs">Mentozy Experience</p>
                  </div>
                </div>

                {/* Comparison Rows */}
                <div className="divide-y-2 divide-gray-900">
                  {comparisons.map((item, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      className="grid grid-cols-2 group hover:bg-[#eff3ff]/10 transition-colors"
                    >
                      {/* Typical Side */}
                      <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-3 border-r-4 border-gray-900">
                        <X className="w-5 h-5 text-gray-500 shrink-0" />
                        <span className="text-gray-500 font-bold text-xs uppercase line-through">
                          {item.typical}
                        </span>
                      </div>

                      {/* Mentozy Side */}
                      <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-3 bg-white relative">
                        <Check className="w-5 h-5 text-[#f39c12] shrink-0 relative z-10" />
                        <span className="text-gray-900 font-black text-xs uppercase relative z-10">
                          {item.mentozy}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default WhatWeDoDifferently;

