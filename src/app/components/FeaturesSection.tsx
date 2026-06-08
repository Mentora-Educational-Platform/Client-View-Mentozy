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
    <section className="py-16 md:py-24 bg-[#FAF9F6] border-t-4 border-gray-900 overflow-hidden font-mono text-gray-900">
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
            Why Mentozy?
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-6">
            Why <span className="text-[#f39c12]">Mentozy</span>?
          </h2>
          <p className="text-sm md:text-base text-gray-700 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
            We bridge the gap between academic education and professional success by connecting you with the right people and resources.
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
              className="group bg-white border-4 border-gray-900 p-6 md:p-8 hover:bg-[#eff3ff]/10 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col"
            >
              <div className="w-12 h-12 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center text-gray-900 mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:bg-[#f39c12] group-hover:text-gray-900 transition-colors duration-300">
                {feature.icon}
              </div>

              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4">
                {feature.title}
              </h3>

              <p className="text-gray-700 font-bold leading-relaxed text-xs flex-1 uppercase">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
export default FeaturesSection;
