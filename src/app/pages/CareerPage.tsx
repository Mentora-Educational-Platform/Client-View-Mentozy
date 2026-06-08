import { useState } from 'react';
import { ArrowRight, CheckCircle2, Code2, Database, CreditCard } from 'lucide-react';
import { ApplicationFormModal } from '../components/ApplicationFormModal';

export function CareerPage() {
  const [applyingFor, setApplyingFor] = useState<string | null>(null);
  const jobs = [
    {
      id: 'backend',
      role: 'Backend Lead / Developer',
      type: 'Internship',
      mode: 'Remote',
      icon: <Database className="w-6 h-6" />,
      description: 'Design and maintain core backend infrastructure using Node.js and Supabase/PostgreSQL.',
      stack: ['Node.js', 'Supabase', 'PostgreSQL', 'REST APIs'],
      responsibilities: [
        'Design and optimize database schemas and tables',
        'Implement authentication and role-based access',
        'Ensure data integrity and security',
        'Collaborate with frontend team for API integration'
      ]
    },
    {
      id: 'fullstack',
      role: 'Full Stack Developer',
      type: 'Internship',
      mode: 'Remote',
      icon: <Code2 className="w-6 h-6" />,
      description: 'Contribute to end-to-end development, building reliable features across frontend and backend.',
      stack: ['React / Vite', 'Node.js', 'Supabase', 'GitHub'],
      responsibilities: [
        'Develop full stack features and APIs',
        'Implement platform functionality and auth flows',
        'Maintain clean, documented, scalable codebase',
        'Participate in code reviews and debugging'
      ]
    },
    {
      id: 'payment',
      role: 'Payment Integration Engineer',
      type: 'Internship',
      mode: 'Remote',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Design and implement secure payment workflows, subscriptions, and transaction logic.',
      stack: ['Razorpay', 'Webhooks', 'Node.js', 'Security'],
      responsibilities: [
        'Integrate payment gateways (Razorpay)',
        'Implement subscription models and refunds',
        'Secure webhooks for verification',
        'Debug payment failures and edge cases'
      ]
    }
  ];

  const perks = [
    'Verified Internship Certificate',
    'LinkedIn Recommendation',
    'Performance-based Equity',
    'Official Team Page Feature',
    'Real Startup Experience',
    'Priority for Future Paid Roles'
  ];

  return (
    <div className="pt-32 pb-20 bg-[#FAF9F6] min-h-screen font-mono">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            We are hiring
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight uppercase leading-none">
            Build the future of <span className="bg-[#f39c12] border-4 border-gray-900 px-2 py-1 rotate-1 inline-block">Mentorship</span> with us
          </h1>
          <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed font-bold uppercase">
            Join Mentozy as we bridge the gap between education and real-world skills.
            We are looking for builders who want real startup experience.
          </p>
        </div>

        {/* Perks Section */}
        <div className="mb-24 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {perks.map((perk, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-black text-gray-900 text-xs uppercase">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 uppercase">Open Positions</h2>
            <span className="text-xs font-black text-gray-900 bg-[#eff3ff] border-2 border-gray-900 px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {jobs.length} Roles Available
            </span>
          </div>

          {jobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white border-4 border-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-14 h-14 border-4 border-gray-900 bg-[#f39c12] flex items-center justify-center text-gray-900 shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {job.icon}
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-[#f39c12] transition-colors uppercase">
                      {job.role}
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider">
                        {job.type}
                      </span>
                      <span className="px-3 py-1 border-2 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase tracking-wider">
                        {job.mode}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-750 font-bold uppercase text-xs leading-relaxed mb-6">
                    {job.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.stack.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#eff3ff] border-2 border-gray-900 text-xs font-black text-gray-900 uppercase">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Responsibilities */}
                  <div className="bg-[#FAF9F6] border-4 border-gray-900 p-5 mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <h4 className="text-xs font-black text-gray-900 mb-3 uppercase tracking-wider">Key Responsibilities</h4>
                    <ul className="space-y-2">
                      {job.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-bold uppercase text-gray-700">
                          <div className="w-2 h-2 bg-gray-950 mt-1 shrink-0 border border-gray-900" />
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t-4 border-gray-900">
                <div className="text-xs text-gray-500 font-bold uppercase">
                  Submissions go to applications.mentozy.app
                </div>
                <button
                  type="button"
                  onClick={() => setApplyingFor(job.role)}
                  className="inline-flex items-center gap-2 px-6 py-3 border-4 border-gray-900 bg-[#f39c12] text-gray-900 text-xs font-black uppercase hover:bg-[#e08e0b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <ApplicationFormModal
          open={!!applyingFor}
          onOpenChange={(open) => !open && setApplyingFor(null)}
          role={applyingFor ?? ''}
        />

        {/* Footer Note */}
        <div className="mt-20 text-center max-w-2xl mx-auto">
          <p className="text-gray-700 text-xs font-bold uppercase leading-relaxed">
            Note: These are unpaid internships focused on learning, equity, and long-term growth.
            We prioritize candidates who value ownership and want to build real systems.
          </p>
        </div>

      </div>
    </div>
  );
}