import { Video, Radio, Users, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function MentorshipFormats() {
  const formats = [
    {
      icon: <Video className="w-6 h-6 text-gray-900" />,
      title: 'Recorded Learning',
      description: 'Access a library of structured video courses and tutorials.',
      features: ['24/7 Access', 'Self-paced', 'Lifetime updates'],
      bestFor: 'Self-starters',
      popular: false
    },
    {
      icon: <Radio className="w-6 h-6 text-gray-900" />,
      title: 'Live Cohorts',
      description: 'Join interactive workshops and weekly live Q&A sessions.',
      features: ['Real-time feedback', 'Peer learning', 'Weekly schedules'],
      bestFor: 'Active learners',
      popular: false
    },
    {
      icon: <Users className="w-6 h-6 text-gray-900" />,
      title: '1-on-1 Mentorship',
      description: 'Get a personal mentor to guide your specific career path.',
      features: ['Personalized roadmap', 'Unlimited chat', 'Mock interviews'],
      bestFor: 'Fast growth',
      popular: true
    },
    {
      icon: <FileText className="w-6 h-6 text-gray-900" />,
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
    <section className="py-24 bg-[#FAF9F6] border-t-4 border-gray-900 relative overflow-hidden font-mono text-gray-900">
      <div className="container mx-auto px-6 relative z-10">
        {/* Centered Header Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
            Flexible Learning
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight uppercase">
            Choose your style of <span className="text-[#f39c12]">growth</span>
          </h2>
          <p className="text-sm md:text-base text-gray-700 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
            Everyone learns differently. We offer multiple formats so you can find the perfect fit for your schedule and goals.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {formats.map((format, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`group relative flex flex-col h-full p-6 bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:bg-[#eff3ff]/10 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
                ${format.popular ? 'bg-yellow-50/20' : ''}
              `}
            >
              {format.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-white border-2 border-gray-900 text-gray-900 text-[9px] font-black uppercase tracking-widest py-1.5 px-3.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="w-12 h-12 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300">
                {format.icon}
              </div>

              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-3">
                {format.title}
              </h3>

              <p className="text-gray-700 font-bold leading-relaxed text-xs mb-6 uppercase flex-1">
                {format.description}
              </p>

              <div className="mt-auto space-y-4 pt-6 border-t-2 border-gray-900">
                <div className="space-y-2">
                  {format.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-750 font-bold uppercase">
                      <CheckCircle2 className="w-4 h-4 text-gray-900 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t-2 border-gray-900 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wide">
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
export default MentorshipFormats;
