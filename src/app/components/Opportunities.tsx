import { Building2, ArrowRight, Sparkles, Users, Trophy } from 'lucide-react';

export function Opportunities() {
  const opportunities = [
    {
      id: 1,
      role: 'Frontend Fellowship',
      partner: 'TechCorp Inc.',
      type: 'Exclusive',
      description: '3-month paid fellowship with direct mentorship from TechCorp engineering leads.',
      tags: ['Mentor Referral', 'remote'],
      color: 'bg-blue-50 border-blue-100 text-blue-700',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      id: 2,
      role: 'Product Design Sprint',
      partner: 'Creative Studio',
      type: 'Hackathon',
      description: 'Join a 48-hour design sprint. Winning team gets a guaranteed interview loop.',
      tags: ['Portfolio Builder', 'Hybrid'],
      color: 'bg-purple-50 border-purple-100 text-purple-700',
      icon: <Trophy className="w-5 h-5" />
    },
    {
      id: 3,
      role: 'Shadowing Program',
      partner: 'FinTech Solutions',
      type: 'Learning',
      description: 'Shadow a Senior PM for a week. Learn day-to-day operations and strategy.',
      tags: ['Alumni Network', 'On-site'],
      color: 'bg-amber-50 border-amber-100 text-amber-700',
      icon: <Users className="w-5 h-5" />
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
        {/* Abstract decoration */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-gray-50/50 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header - Centered */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3" /> Community Perks
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Unlock exclusive <span className="text-amber-600">access</span>
          </h2>
          <p className="text-lg text-gray-600">
            Mentozy members get more than just courses. Gain access to hidden opportunities, referrals, and specialized programs.
          </p>
        </div>

        {/* Opportunities Cards */}
        <div className="grid md:grid-cols-3 gap-8">
            {opportunities.map((opp) => (
                <div key={opp.id} className="group flex flex-col bg-white rounded-2xl p-8 border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/10 transition-all duration-300">
                    
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${opp.color}`}>
                            {opp.icon}
                        </div>
                        <span className="px-3 py-1 rounded-full bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wide border border-gray-100">
                            {opp.type}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                        {opp.role}
                    </h3>
                    <p className="text-sm font-semibold text-gray-500 mb-4">{opp.partner}</p>
                    
                    <p className="text-gray-600 leading-relaxed mb-8 text-sm">
                        {opp.description}
                    </p>

                    <div className="mt-auto">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {opp.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-50 rounded text-[10px] font-medium text-gray-500 uppercase tracking-wide border border-gray-100">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        
                        <button className="flex items-center gap-2 text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                            View Details <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </section>
  );
}