import { MapPin, Clock, ArrowRight, Briefcase, Search, Filter, CheckCircle2, Mail, Code2, Database, CreditCard } from 'lucide-react';

export function CareerPage() {
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
      stack: ['React / Next.js', 'Node.js', 'Supabase', 'GitHub'],
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
    <div className="pt-24 pb-20 bg-white min-h-screen font-sans">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-6">
            We are hiring
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Build the future of <br className="hidden md:block" />
            <span className="text-amber-600">Mentorship</span> with us.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join Mentozy as we bridge the gap between education and real-world skills.
            We are looking for builders who want real startup experience.
          </p>
        </div>

        {/* Perks Section */}
        <div className="mb-24">
          <div className="grid md:grid-cols-3 gap-6">
            {perks.map((perk, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className="font-medium text-gray-700 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Open Positions</h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {jobs.length} Roles Available
            </span>
          </div>

          {jobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white rounded-2xl border border-gray-200 p-8 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100/20 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                  {job.icon}
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      {job.role}
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide">
                        {job.type}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wide border border-amber-100">
                        {job.mode}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 text-base leading-relaxed">
                    {job.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.stack.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-500">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Responsibilities */}
                  <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 mb-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Key Responsibilities</h4>
                    <ul className="space-y-2">
                      {job.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="text-xs text-gray-400 font-medium">
                  Application via Email
                </div>
                <a
                  href={`mailto:wearementozy@gmail.com?subject=Application for ${job.role}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Apply Now <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-20 text-center max-w-2xl mx-auto">
          <p className="text-gray-500 text-sm">
            Note: These are unpaid internships focused on learning, equity, and long-term growth.
            We prioritize candidates who value ownership and want to build real systems.
          </p>
        </div>

      </div>
    </div>
  );
}