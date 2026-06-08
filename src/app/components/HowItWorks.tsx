import { Search, BookOpen, TrendingUp } from 'lucide-react';
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
    <section id="how-it-works" className="py-16 md:py-24 bg-[#FAF9F6] border-t-4 border-gray-900 relative overflow-hidden font-mono text-gray-900">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-150/10 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 md:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] animate-bounce">
            Process
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-6">
            How It Works
          </h2>
          <p className="text-sm md:text-base text-gray-700 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
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
          <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-1 bg-gray-900 z-0" />

          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} className="relative group">
              {/* Card Container */}
              <div className="bg-white border-4 border-gray-900 p-6 md:p-8 hover:bg-[#eff3ff]/10 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300 shadow-[4px_4px_0px_rgba(0,0,0,1)] h-full relative z-10 flex flex-col pt-12">

                {/* Step Number Badge */}
                <div className="absolute -top-4 left-6 bg-white border-2 border-gray-900 text-gray-900 text-xs font-black py-1.5 px-3.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] uppercase">
                  Step {step.id}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center text-gray-900 mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-700 font-bold leading-relaxed text-xs flex-1 uppercase">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
