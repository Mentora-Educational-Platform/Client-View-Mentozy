import { Users, BookOpen, Target, Award, Rocket, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Expert Mentorship',
      description: 'Connect directly with seniors, alumni, and industry professionals who provide real-world guidance, not just theory.'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Practical Learning',
      description: 'Access curriculum designed around real projects and case studies, moving beyond passive video watching.'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Career Outcomes',
      description: 'Focused pathways for internships, job preparation, and resume building to help you land your dream role.'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Verified Skills',
      description: 'Earn recognition for your capabilities through project reviews and skill assessments by mentors.'
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Structured Tracks',
      description: 'Follow clear, step-by-step learning paths tailored for competitive exams, tech roles, and career pivots.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Trusted Community',
      description: 'Join a safe, verified network of ambitious learners and ethical mentors committed to mutual growth.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50/50 dark:bg-slate-900/50 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            Why Mentozy?
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Why <span className="text-amber-600 dark:text-amber-500">Mentozy</span>?
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            We bridge the gap between academic education and professional success by connecting you with the right people and the right resources.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-100/10 dark:hover:shadow-amber-500/5 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gray-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 mb-6 group-hover:bg-amber-50 dark:group-hover:bg-amber-500 group-hover:text-amber-600 dark:group-hover:text-slate-900 transition-colors duration-300">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                {feature.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}