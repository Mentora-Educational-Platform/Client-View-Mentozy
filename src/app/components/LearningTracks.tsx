import { Code2, Target, ArrowRight, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function LearningTracks() {
  const roadmapSteps = [
    { number: '01', title: 'Learn', desc: 'Master core concepts' },
    { number: '02', title: 'Build', desc: 'Create real projects' },
    { number: '03', title: 'Connect', desc: 'Find expert mentors' },
    { number: '04', title: 'Grow', desc: 'Ace your career' },
  ];

  const tracks = [
    {
      title: 'Software Engineering',
      tag: 'Most Popular',
      icon: <Code2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      desc: 'From coding basics to system design. Master the stack used by top tech companies.',
      includes: ['Full Stack Web Dev', 'Data Structures', 'System Design'],
    },
    {
      title: 'Competitive Exams',
      tag: 'Structured',
      icon: <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      desc: 'Rigorous preparation paths for JEE, NEET, and UPSC with rank-holder strategies.',
      includes: ['Daily Mock Tests', 'Performance Analytics', 'Exam Strategy'],
    },
    {
      title: 'Career Growth',
      tag: 'Professional',
      icon: <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      desc: 'For working professionals looking to switch domains or accelerate promotion.',
      includes: ['Resume Reviews', 'Salary Negotiation', 'Leadership Skills'],
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
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Target className="w-3 h-3" /> Learning Pathways
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Designed for <span className="text-amber-600 dark:text-amber-400">Outcome</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            We don't just sell courses. We provide structured roadmaps to take you from beginner to expert.
          </p>
        </motion.div>

        {/* Roadmap Steps - Simplified */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
        >
          {roadmapSteps.map((step, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="relative p-6 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-center group hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-100 dark:hover:border-amber-500 transition-all shadow-sm"
            >
              <div className="text-4xl font-black text-gray-200 dark:text-slate-700 group-hover:text-amber-200 dark:group-hover:text-amber-900/50 mb-2 transition-colors">
                {step.number}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tracks Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {tracks.map((track, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-100/20 dark:hover:shadow-amber-900/20 transition-all duration-300 p-8 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-500 transition-colors">
                  {track.icon}
                </div>
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-400 dark:group-hover:text-slate-900 transition-colors">
                  {track.tag}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{track.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {track.desc}
              </p>

              <div className="mt-auto">
                <ul className="space-y-3 mb-8">
                  {track.includes.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" /> {item}
                    </li>
                  ))}
                </ul>

                <Link to="/tracks" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-slate-700 font-semibold text-gray-700 dark:text-gray-300 hover:border-amber-600 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-900 transition-all">
                  Explore Track <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}