import { GraduationCap, Briefcase, Code, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function WhoItsFor() {
  const audiences = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: 'School & Exam Learners',
      description: 'Navigate the pressure of board exams and entrance tests with clarity.',
      benefits: ['Exam strategy planning', 'Subject-specific doubt clearing', 'College selection guidance']
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'College Students',
      description: 'Bridge the gap between academic theory and industry reality.',
      benefits: ['Real-world project reviews', 'Internship preparation', 'Tech stack roadmaps']
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Early Professionals',
      description: 'Make your first career transitions smooth and informed.',
      benefits: ['Resume & portfolio review', 'Salary negotiation tips', 'Role transition advice']
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
    <section className="py-16 md:py-24 bg-[#FAF9F6] border-t-4 border-gray-900 relative overflow-hidden font-mono text-gray-900">
      <div className="absolute left-0 top-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-[#eff3ff]/10 rounded-full blur-3xl -z-10 pointer-events-none animate-blob" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
            Who Mentozy Is For
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-6">
            Built for learners at every stage
          </h2>
          <p className="text-sm md:text-base text-gray-700 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
            Whether you're just starting out or looking to pivot, we connect you with mentors who have walked your path.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-white border-4 border-gray-900 p-6 md:p-8 hover:bg-[#eff3ff]/10 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col h-full"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-[#eff3ff] border-2 border-gray-900 flex items-center justify-center text-gray-900 mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-300">
                {audience.icon}
              </div>

              {/* Header */}
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-4">
                {audience.title}
              </h3>
              <p className="text-gray-750 font-bold leading-relaxed text-xs mb-8 uppercase flex-1">
                {audience.description}
              </p>

              {/* Benefits List */}
              <div className="mt-auto">
                <ul className="space-y-3 mb-8">
                  {audience.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-gray-700 font-bold uppercase">
                      <CheckCircle2 className="w-4 h-4 text-gray-950 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Card Action */}
                <Link to="/mentors" className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 font-black text-xs transition-all hover:bg-[#eff3ff] shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] uppercase">
                  <span>Find mentors</span>
                  <ArrowRight className="w-4 h-4 text-gray-900" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
export default WhoItsFor;
