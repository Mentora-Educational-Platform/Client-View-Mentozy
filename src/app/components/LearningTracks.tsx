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
      icon: <Code2 className="w-6 h-6 text-gray-900" />,
      desc: 'From coding basics to system design. Master the stack used by top tech companies.',
      includes: ['Full Stack Web Dev', 'Data Structures', 'System Design'],
    },
    {
      title: 'Competitive Exams',
      tag: 'Structured',
      icon: <Trophy className="w-6 h-6 text-gray-900" />,
      desc: 'Rigorous preparation paths for JEE, NEET, and UPSC with rank-holder strategies.',
      includes: ['Daily Mock Tests', 'Performance Analytics', 'Exam Strategy'],
    },
    {
      title: 'Career Growth',
      tag: 'Professional',
      icon: <TrendingUp className="w-6 h-6 text-gray-900" />,
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
    <section className="py-24 bg-[#FAF9F6] border-t-4 border-gray-900 overflow-hidden font-mono text-gray-900">
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
            <Target className="w-4 h-4" /> Learning Pathways
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-6">
            Designed for <span className="text-[#f39c12]">Outcome</span>
          </h2>
          <p className="text-sm md:text-base text-gray-700 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
            We don't just sell courses. We provide structured roadmaps to take you from beginner to expert.
          </p>
        </motion.div>

        {/* Roadmap Steps */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {roadmapSteps.map((step, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="relative p-6 bg-white border-4 border-gray-900 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff]/10 transition-all duration-300"
            >
              <div className="text-4xl font-black text-gray-900 mb-2">
                {step.number}
              </div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm mb-1">{step.title}</h3>
              <p className="text-xs text-gray-600 font-bold uppercase">{step.desc}</p>
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
              className="flex flex-col bg-white border-4 border-gray-900 hover:bg-[#eff3ff]/10 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300 p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {track.icon}
                </div>
                <span className="px-3 py-1 border-2 border-gray-900 bg-white text-[10px] font-black text-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase">
                  {track.tag}
                </span>
              </div>

              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">{track.title}</h3>
              <p className="text-gray-700 font-bold leading-relaxed text-xs mb-8 uppercase flex-1">
                {track.desc}
              </p>

              <div className="mt-auto">
                <ul className="space-y-3 mb-8 border-t-2 border-gray-900 pt-6">
                  {track.includes.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-bold uppercase">
                      <CheckCircle2 className="w-4 h-4 text-gray-950" /> {item}
                    </li>
                  ))}
                </ul>

                <Link to="/tracks" className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-900 bg-[#eff3ff] hover:bg-[#eff3ff]/80 font-black text-xs text-gray-900 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase">
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
export default LearningTracks;
