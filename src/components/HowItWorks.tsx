import { Search, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      id: "01",
      icon: <Search className="w-6 h-6" />,
      title: 'Discover Mentors',
      description: 'Browse expert profiles and find the perfect guide aligned with your career goals.'
    },
    {
      id: "02",
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Learn with Structure',
      description: 'Follow curated learning paths with resources, assignments, and live feedback.'
    },
    {
      id: "03",
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Accelerate Growth',
      description: 'Build real skills, track your progress, and unlock new career opportunities.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white-50 relative overflow-hidden">
      {/* Decorative background blob - Amber based */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="text-amber-600 font-semibold tracking-wider text-sm uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-100 mb-4 inline-block">
            Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Your journey to mastery
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We've simplified the path to professional growth into three actionable steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-amber-200 to-gray-200 border-t border-dashed border-gray-300 z-0" />

          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Card Container */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full relative z-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-amber-100">
                
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-8 bg-gray-900 text-white text-xs font-bold py-1 px-3 rounded-full border-4 border-gray-50 group-hover:bg-amber-500 transition-colors duration-300">
                  Step {step.id}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:shadow-amber-100/50">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Mobile Arrow (Visual cue for flow on mobile) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6 text-gray-300">
                    <ArrowRight className="w-6 h-6 rotate-90" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}