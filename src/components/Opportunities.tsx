"use client";
import { Briefcase, Database, Code2, CreditCard, Sparkles, Building2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Opportunities() {
  const router = useRouter();

  // Updated data to match the PDF content
  const opportunities = [
    {
      id: 1,
      role: 'Backend Lead / Developer',
      company: 'Mentozy Core Team',
      type: 'Internship',
      location: 'Remote',
      salary: 'Equity / Unpaid',
      logo: 'bg-amber-100 text-amber-700',
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
      logo: 'bg-blue-100 text-blue-700',
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
      logo: 'bg-green-100 text-green-700',
      icon: <CreditCard className="w-5 h-5" />,
      featured: false
    }
  ];

  const handleClick = () => {
    router.push('/careers');
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Building2 className="w-3 h-3" /> Join the Team
            </div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Build Mentozy with us
            </h2>
            <p className="text-lg text-gray-600">
              We are looking for passionate builders who want real startup experience.
              Help us democratize mentorship.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/careers"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 flex items-center justify-center"
            >
              View Full Details
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-5">Role & Team</div>
            <div className="col-span-3">Location & Type</div>
            <div className="col-span-2">Compensation</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {opportunities.map((job) => (
            <div
              key={job.id}
              onClick={handleClick}
              className="group relative bg-white md:bg-gray-50/30 hover:bg-white border border-gray-100 rounded-2xl p-5 md:px-6 md:py-5 transition-all duration-300 hover:shadow-xl hover:shadow-gray-100 hover:border-amber-200 cursor-pointer"
            >
              <div className="md:grid md:grid-cols-12 md:gap-4 items-center">
                <div className="col-span-5 flex items-center gap-4 mb-4 md:mb-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${job.logo}`}>
                    {job.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg md:text-base group-hover:text-amber-600 transition-colors">
                      {job.role}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 font-medium">{job.company}</span>
                      {job.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide border border-amber-200">
                          <Sparkles className="w-3 h-3" /> Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-3 mb-3 md:mb-0 border-b md:border-0 border-gray-50 pb-3 md:pb-0">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {job.location}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 mb-5 md:mb-0 flex items-center">
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg md:bg-transparent md:p-0">
                    {job.salary}
                  </div>
                </div>

                <div className="col-span-2 flex justify-end">
                  <button className="w-full md:w-auto px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all shadow-sm">
                    View Role
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}