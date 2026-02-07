import { Code2, Target, ArrowRight, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';

export function LearningTracks() {
  const roadmapSteps = [
    { number: '01', title: 'Learn', desc: 'Master core concepts' },
    { number: '02', title: 'Build', desc: 'Create real projects' },
    { number: '03', title: 'Connect', desc: 'Find expert mentors' },
    { number: '04', title: 'Grow', desc: 'Ace your career' },
  ];

  const tracks = [
    {
      title: 'Software Engineering',
      tag: 'Most Popular',
      icon: <Code2 className="w-6 h-6 text-amber-600" />,
      desc: 'From coding basics to system design. Master the stack used by top tech companies.',
      includes: ['Full Stack Web Dev', 'Data Structures', 'System Design'],
    },
    {
      title: 'Competitive Exams',
      tag: 'Structured',
      icon: <Trophy className="w-6 h-6 text-amber-600" />,
      desc: 'Rigorous preparation paths for JEE, NEET, and UPSC with rank-holder strategies.',
      includes: ['Daily Mock Tests', 'Performance Analytics', 'Exam Strategy'],
    },
    {
      title: 'Career Growth',
      tag: 'Professional',
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      desc: 'For working professionals looking to switch domains or accelerate promotion.',
      includes: ['Resume Reviews', 'Salary Negotiation', 'Leadership Skills'],
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="mb-20 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Target className="w-3 h-3" /> Learning Pathways
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Designed for <span className="text-amber-600">Outcome</span>
          </h2>
          <p className="text-gray-600 text-lg">
            We don't just sell courses. We provide structured roadmaps to take you from beginner to expert.
          </p>
        </div>

        {/* Roadmap Steps - Simplified */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {roadmapSteps.map((step, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center group hover:bg-amber-50 hover:border-amber-100 transition-colors">
              <div className="text-4xl font-black text-gray-200 group-hover:text-amber-200 mb-2 transition-colors">
                {step.number}
              </div>
              <h3 className="font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Tracks Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {tracks.map((track, i) => (
            <div key={i} className="flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100/20 transition-all duration-300 p-8 group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  {track.icon}
                </div>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                  {track.tag}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{track.title}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {track.desc}
              </p>

              <div className="mt-auto">
                <ul className="space-y-3 mb-8">
                  {track.includes.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" /> {item}
                    </li>
                  ))}
                </ul>
                
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:border-amber-600 hover:text-amber-600 hover:bg-white transition-all">
                  Explore Track <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}