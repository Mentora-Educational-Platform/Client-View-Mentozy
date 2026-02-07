import { Video, Radio, Users, FileText, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export function MentorshipFormats() {
  const formats = [
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Recorded Learning',
      description: 'Access a library of structured video courses and tutorials.',
      features: ['24/7 Access', 'Self-paced', 'Lifetime updates'],
      bestFor: 'Self-starters',
      popular: false
    },
    {
      icon: <Radio className="w-6 h-6" />,
      title: 'Live Cohorts',
      description: 'Join interactive workshops and weekly live Q&A sessions.',
      features: ['Real-time feedback', 'Peer learning', 'Weekly schedules'],
      bestFor: 'Active learners',
      popular: false
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '1-on-1 Mentorship',
      description: 'Get a personal mentor to guide your specific career path.',
      features: ['Personalized roadmap', 'Unlimited chat', 'Mock interviews'],
      bestFor: 'Fast growth',
      popular: true
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Resources & Notes',
      description: 'Curated templates, interview cheatsheets, and industry guides.',
      features: ['PDF Downloads', 'Notion templates', 'Interview prep'],
      bestFor: 'Quick revision',
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-white-50/50 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Centered Header Layout */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-amber-600 font-semibold tracking-wider text-sm uppercase mb-3 block">
            Flexible Learning
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Choose your style of <span className="text-amber-600">growth</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Everyone learns differently. We offer multiple formats so you can find the perfect fit for your schedule and goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {formats.map((format, index) => (
            <div
              key={index}
              className={`group relative flex flex-col h-full p-6 rounded-2xl border transition-all duration-300
                ${format.popular 
                  ? 'bg-white border-amber-200 shadow-xl shadow-amber-100/50 scale-[1.02] z-10' 
                  : 'bg-white border-gray-100 hover:border-amber-200 hover:shadow-lg hover:-translate-y-1'
                }
              `}
            >
              {format.popular && (
                <div className="absolute -top-3 inset-x-0 flex justify-center">
                  <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300
                ${format.popular ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-600 group-hover:bg-amber-50 group-hover:text-amber-600'}
              `}>
                {format.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {format.title}
              </h3>
              
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {format.description}
              </p>

              <div className="mt-auto space-y-4">
                <div className="space-y-2">
                  {format.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className={`w-4 h-4 ${format.popular ? 'text-amber-500' : 'text-gray-300 group-hover:text-amber-400'}`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={`pt-4 border-t ${format.popular ? 'border-amber-100' : 'border-gray-50'} flex items-center justify-between`}>
                   <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                     Best for {format.bestFor}
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}