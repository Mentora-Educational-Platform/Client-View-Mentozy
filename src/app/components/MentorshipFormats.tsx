import { Video, Radio, Users, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function MentorshipFormats() {
  const formats = [
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Recorded Learning',
      description: 'Access a library of structured video courses and tutorials.',
      features: ['24/7 Access', 'Self-paced', 'Lifetime updates'],
      bestFor: 'Self-starters',
      popular: false
    },
    {
      icon: <Radio className="w-6 h-6" />,
      title: 'Live Cohorts',
      description: 'Join interactive workshops and weekly live Q&A sessions.',
      features: ['Real-time feedback', 'Peer learning', 'Weekly schedules'],
      bestFor: 'Active learners',
      popular: false
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '1-on-1 Mentorship',
      description: 'Get a personal mentor to guide your specific career path.',
      features: ['Personalized roadmap', 'Unlimited chat', 'Mock interviews'],
      bestFor: 'Fast growth',
      popular: true
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Resources & Notes',
      description: 'Curated templates, interview cheatsheets, and industry guides.',
      features: ['PDF Downloads', 'Notion templates', 'Interview prep'],
      bestFor: 'Quick revision',
      popular: false
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
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-6 relative z-10">
        {/* Centered Header Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-amber-600 dark:text-amber-400 font-semibold tracking-wider text-sm uppercase mb-3 block">
            Flexible Learning
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Choose your style of <span className="text-amber-600 dark:text-amber-400">growth</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Everyone learns differently. We offer multiple formats so you can find the perfect fit for your schedule and goals.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {formats.map((format, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`group relative flex flex-col h-full p-6 rounded-2xl border transition-all duration-300
                ${format.popular
                  ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-500 shadow-xl shadow-amber-100/50 dark:shadow-amber-500/10 scale-[1.02] z-10'
                  : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-500 hover:shadow-lg'
                }
              `}
            >
              {format.popular && (
                <div className="absolute -top-3 inset-x-0 flex justify-center">
                  <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full shadow-sm flex items-center gap-1.5">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300
                ${format.popular ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' : 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-500 group-hover:text-amber-600 dark:group-hover:text-slate-900'}
              `}>
                {format.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {format.title}
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                {format.description}
              </p>

              <div className="mt-auto space-y-4">
                <div className="space-y-2">
                  {format.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className={`w-4 h-4 ${format.popular ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600 group-hover:text-amber-400'}`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={`pt-4 border-t ${format.popular ? 'border-amber-100 dark:border-amber-900/50' : 'border-gray-50 dark:border-slate-700'} flex items-center justify-between`}>
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    Best for {format.bestFor}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}