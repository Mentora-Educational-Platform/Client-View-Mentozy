import { Briefcase, Database, Code2, CreditCard, Building2, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function Opportunities() {
  const navigate = useNavigate();

  // Updated data to match the PDF content
  const opportunities = [
    {
      id: 1,
      role: 'Backend Lead / Developer',
      company: 'Mentozy Core Team',
      type: 'Internship',
      location: 'Remote',
      salary: 'Equity / Unpaid',
      logo: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
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
      logo: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
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
      logo: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
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
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Building2 className="w-3 h-3" /> Join the Team
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Teach & Earn as a Mentor
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              We are looking for passionate builders who want real startup experience.
              Help us democratize mentorship.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/careers"
              className="px-5 py-2.5 bg-gray-900 dark:bg-amber-500 text-white dark:text-slate-900 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-amber-400 transition-colors shadow-lg shadow-gray-200 dark:shadow-none flex items-center justify-center"
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
          className="flex flex-col gap-4"
        >
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
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
              className="group relative bg-white dark:bg-slate-800/50 md:bg-gray-50/30 dark:md:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 md:px-6 md:py-5 transition-all duration-300 hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-amber-500/5 hover:border-amber-200 dark:hover:border-amber-500 cursor-pointer"
            >
              <div className="md:grid md:grid-cols-12 md:gap-4 items-center">
                <div className="col-span-5 flex items-center gap-4 mb-4 md:mb-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${job.logo}`}>
                    {job.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg md:text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {job.role}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{job.company}</span>
                      {job.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 uppercase tracking-wide border border-amber-200 dark:border-amber-800">
                          Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-3 mb-3 md:mb-0 border-b md:border-0 border-gray-50 dark:border-slate-700 pb-3 md:pb-0">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      {job.location}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 mb-5 md:mb-0 flex items-center">
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg md:bg-transparent md:p-0">
                    {job.salary}
                  </div>
                </div>

                <div className="col-span-2 flex justify-end">
                  <button className="w-full md:w-auto px-6 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:bg-amber-600 dark:group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-slate-900 group-hover:border-amber-600 dark:group-hover:border-amber-500 transition-all shadow-sm">
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