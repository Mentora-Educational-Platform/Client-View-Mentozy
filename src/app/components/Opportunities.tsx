import { Briefcase, Database, Code2, CreditCard, Building2, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function Opportunities() {
  const navigate = useNavigate();

  const opportunities = [
    {
      id: 1,
      role: 'Backend Lead / Developer',
      company: 'Mentozy Core Team',
      type: 'Internship',
      location: 'Remote',
      salary: 'Equity / Unpaid',
      logo: 'bg-[#eff3ff] text-gray-900 border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]',
      icon: <Database className="w-5 h-5" />,
      featured: true
    },
    {
      id: 2,
      role: 'Full Stack Developer',
      company: 'Mentozy Engineering',
      type: 'Internship',
      location: 'Remote',
      salary: 'Equity / Unpaid',
      logo: 'bg-[#eff3ff] text-gray-900 border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]',
      icon: <Code2 className="w-5 h-5" />,
      featured: true
    },
    {
      id: 3,
      role: 'Payment Integration Engineer',
      company: 'Mentozy Fintech',
      type: 'Internship',
      location: 'Remote',
      salary: 'Equity / Unpaid',
      logo: 'bg-[#eff3ff] text-gray-900 border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]',
      icon: <CreditCard className="w-5 h-5" />,
      featured: false
    }
  ];

  const handleClick = () => {
    navigate('/careers');
  };

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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6] border-t-4 border-gray-900 font-mono text-gray-900">
      <div className="container mx-auto px-6">

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
              <Building2 className="w-4 h-4" /> Join the Team
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-4">
              Teach & Earn as a Mentor
            </h2>
            <p className="text-sm md:text-base text-gray-700 font-bold leading-relaxed uppercase">
              We are looking for passionate builders who want real startup experience. Help us democratize mentorship.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/careers"
              className="px-6 py-3.5 bg-white border-2 border-gray-900 text-gray-900 text-xs font-black hover:bg-[#eff3ff] transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none uppercase"
            >
              View Full Details
            </Link>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col gap-6"
        >
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-black text-gray-900 uppercase tracking-wider">
            <div className="col-span-5">Role & Team</div>
            <div className="col-span-3">Location & Type</div>
            <div className="col-span-2">Compensation</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {opportunities.map((job) => (
            <motion.div
              key={job.id}
              variants={itemVariants}
              onClick={handleClick}
              className="group bg-white border-4 border-gray-900 p-6 hover:bg-[#eff3ff]/10 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300 shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <div className="md:grid md:grid-cols-12 md:gap-4 items-center">
                <div className="col-span-5 flex items-center gap-4 mb-4 md:mb-0">
                  <div className={`w-12 h-12 flex items-center justify-center font-bold text-lg ${job.logo}`}>
                    {job.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg md:text-base uppercase tracking-tight group-hover:text-[#f39c12] transition-colors">
                      {job.role}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-600 font-bold uppercase">{job.company}</span>
                      {job.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-gray-900 bg-[#eff3ff] text-[9px] font-black text-gray-900 uppercase tracking-wide shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                          Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-3 mb-3 md:mb-0 pb-3 md:pb-0">
                  <div className="flex flex-col gap-1.5 text-xs font-bold text-gray-700 uppercase">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-900" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-900" />
                      {job.location}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 mb-5 md:mb-0 flex items-center">
                  <div className="inline-flex items-center gap-1.5 text-xs font-black text-gray-900 border-2 border-gray-900 bg-[#eff3ff] px-3 py-1.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] uppercase">
                    {job.salary}
                  </div>
                </div>

                <div className="col-span-2 flex justify-end">
                  <button className="w-full md:w-auto px-5 py-2.5 bg-white border-2 border-gray-900 text-gray-900 font-black text-xs hover:bg-[#eff3ff] transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none uppercase">
                    View Role
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
export default Opportunities;
