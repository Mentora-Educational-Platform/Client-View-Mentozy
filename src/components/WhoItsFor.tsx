import { GraduationCap, Briefcase, Code, CheckCircle2, ArrowRight } from 'lucide-react';

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

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute left-0 top-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-amber-50/60 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-amber-600 font-semibold tracking-wider text-sm uppercase mb-3 block">
            Who Mentozy Is For
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Built for learners at every stage
          </h2>
          <p className="text-lg text-gray-600">
            Whether you're just starting out or looking to pivot, we connect you with mentors who have walked your path.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="group relative bg-white border border-gray-100 rounded-2xl p-8 hover:border-amber-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                {audience.icon}
              </div>

              {/* Header */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-700 transition-colors">
                {audience.title}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {audience.description}
              </p>

              {/* Benefits List */}
              <div className="mt-auto">
                <ul className="space-y-3 mb-8">
                  {audience.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="opacity-90">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Card Action */}
                <div className="flex items-center text-amber-600 font-medium text-sm group-hover:gap-2 transition-all cursor-pointer">
                  <span>Find mentors</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}