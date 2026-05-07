import { Search, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function HowItWorks() {
  const steps = [
    {
      id: "01",
      icon: <Search className="w-6 h-6" />,
      title: 'Discover Mentors',
      description: 'Browse expert profiles and find the perfect guide aligned with your career goals.'
    },
    {
      id: "02",
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Learn with Structure',
      description: 'Follow curated learning paths with resources, assignments, and live feedback.'
    },
    {
      id: "03",
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Accelerate Growth',
      description: 'Build real skills, track your progress, and unlock new career opportunities.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Decorative background blob - Amber based */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-100/40 dark:bg-amber-900/10 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 md:mb-20"
        >
          <span className="text-amber-600 dark:text-amber-400 font-semibold tracking-wider text-sm uppercase bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800 mb-4 inline-block">
            Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            We've simplified the path to professional growth into three actionable steps.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 relative"
        >
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-amber-200 dark:via-amber-900 to-gray-200 dark:from-slate-800 dark:to-slate-800 border-t border-dashed border-gray-300 dark:border-slate-700 z-0" />

          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} className="relative group">
              {/* Card Container */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700 h-full relative z-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-100/10 dark:hover:shadow-amber-900/20 hover:border-amber-100 dark:hover:border-amber-900/50">

                {/* Step Number Badge */}
                <div className="absolute -top-4 left-8 bg-gray-900 dark:bg-amber-500 text-white dark:text-slate-900 text-xs font-bold py-1 px-3 rounded-full border-4 border-gray-50 dark:border-slate-900 group-hover:bg-amber-500 dark:group-hover:bg-amber-400 transition-colors duration-300">
                  Step {step.id}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:shadow-amber-100/50">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Mobile Arrow (Visual cue for flow on mobile) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6 text-gray-300 dark:text-gray-600">
                    <ArrowRight className="w-6 h-6 rotate-90" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}