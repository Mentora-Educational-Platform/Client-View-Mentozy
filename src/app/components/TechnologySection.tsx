import { Code2, BrainCircuit, LayoutDashboard, MessageSquare, Library, MonitorPlay, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function TechnologySection() {
  const tools = [
    {
      title: 'In-Browser IDE',
      description: 'Practice coding instantly without any local setup. Supports Python, JS, Java, and C++.',
      icon: <Code2 className="w-6 h-6 text-gray-900" />
    },
    {
      title: 'AI Doubt Solver',
      description: 'Get 24/7 instant answers to your technical questions while you learn, powered by custom AI.',
      icon: <BrainCircuit className="w-6 h-6 text-gray-900" />
    },
    {
      title: 'Live Whiteboard',
      description: 'Collaborate with mentors in real-time for system design and architecture reviews.',
      icon: <MonitorPlay className="w-6 h-6 text-gray-900" />
    },
    {
      title: 'Smart Analytics',
      description: 'Track your learning velocity, streak, and skill gaps with detailed performance dashboards.',
      icon: <LayoutDashboard className="w-6 h-6 text-gray-900" />
    },
    {
      title: 'Community Hub',
      description: 'Discuss problems, share projects, and find study partners in our dedicated peer forums.',
      icon: <MessageSquare className="w-6 h-6 text-gray-900" />
    },
    {
      title: 'Curated Library',
      description: 'Access premium articles, cheatsheets, and interview guides handpicked by industry experts.',
      icon: <Library className="w-6 h-6 text-gray-900" />
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
            <Zap className="w-4 h-4" /> Modern Toolkit
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-6">
            Powered by <span className="text-[#f39c12]">next-gen</span> tools
          </h2>
          <p className="text-sm md:text-base text-gray-700 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
            Learning shouldn't feel like a chore. We provide a suite of modern tools to make your journey smoother, faster, and more interactive.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-white border-4 border-gray-900 p-8 hover:bg-[#eff3ff]/10 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col"
            >
              <div className="w-12 h-12 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300">
                {tool.icon}
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4">
                {tool.title}
              </h3>
              <p className="text-gray-750 font-bold leading-relaxed text-xs flex-1 uppercase">
                {tool.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
export default TechnologySection;
