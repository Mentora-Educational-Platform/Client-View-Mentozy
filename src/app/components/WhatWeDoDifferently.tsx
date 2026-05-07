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
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 relative transition-colors duration-300">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-800 to-transparent" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <span className="text-amber-600 dark:text-amber-400 font-semibold tracking-wider text-sm uppercase mb-3 block">
              Our Approach
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Why Mentozy is different
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Core principles we stand by
              </h3>
              <div className="space-y-6">
                {principles.map((principle, index) => (
                  <motion.div key={index} variants={listItemVariants} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                      <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 font-medium pt-1">
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
                className="pt-10"
              >
                <div className="relative p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden group">
                  {/* Decorative background glow */}
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />

                  {/* Decorative quote mark */}
                  <span className="absolute -top-4 -left-4 text-5xl text-gray-200 dark:text-slate-800 select-none">
                    “
                  </span>

                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed text-sm md:text-base lg:text-lg">
                    Education is not just about consuming content,
                    <span className="text-gray-900 dark:text-white font-medium">
                      {" "}it’s about connecting with those who have walked the path before you.
                    </span>
                  </p>

                  {/* Philosophy Marker */}
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">— Mentozy Philosophy</p>
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
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-2 border-b border-gray-100 dark:border-slate-700">
                  <div className="p-6 text-center bg-gray-50/50 dark:bg-slate-900/50 border-r border-gray-100 dark:border-slate-700">
                    <p className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">Typical Platforms</p>
                  </div>
                  <div className="p-6 text-center bg-amber-50/30 dark:bg-amber-900/20">
                    <p className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide text-xs">Mentozy Experience</p>
                  </div>
                </div>

                {/* Comparison Rows */}
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                  {comparisons.map((item, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      className="grid grid-cols-2 group hover:bg-gray-50/30 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      {/* Typical Side */}
                      <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-3 border-r border-gray-100 dark:border-slate-700">
                        <X className="w-5 h-5 text-gray-400 dark:text-gray-600 shrink-0" />
                        <span className="text-gray-500 dark:text-gray-500 text-sm sm:text-base line-through decoration-gray-300 dark:decoration-slate-700">
                          {item.typical}
                        </span>
                      </div>

                      {/* Mentozy Side */}
                      <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-3 bg-amber-50/10 dark:bg-amber-900/5 relative">
                        {/* Hover Highlight */}
                        <div className="absolute inset-0 bg-amber-50/50 dark:bg-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <Check className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 relative z-10" />
                        <span className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base relative z-10">
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
