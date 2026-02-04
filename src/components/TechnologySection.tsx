import { Code2, BrainCircuit, LayoutDashboard, MessageSquare, Library, MonitorPlay, Zap } from 'lucide-react';

export function TechnologySection() {
  const tools = [
    {
      title: 'In-Browser IDE',
      description: 'Practice coding instantly without any local setup. Supports Python, JS, Java, and C++.',
      icon: <Code2 className="w-6 h-6" />
    },
    {
      title: 'AI Doubt Solver',
      description: 'Get 24/7 instant answers to your technical questions while you learn, powered by custom AI.',
      icon: <BrainCircuit className="w-6 h-6" />
    },
    {
      title: 'Live Whiteboard',
      description: 'Collaborate with mentors in real-time for system design and architecture reviews.',
      icon: <MonitorPlay className="w-6 h-6" />
    },
    {
      title: 'Smart Analytics',
      description: 'Track your learning velocity, streak, and skill gaps with detailed performance dashboards.',
      icon: <LayoutDashboard className="w-6 h-6" />
    },
    {
      title: 'Community Hub',
      description: 'Discuss problems, share projects, and find study partners in our dedicated peer forums.',
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      title: 'Curated Library',
      description: 'Access premium articles, cheatsheets, and interview guides handpicked by industry experts.',
      icon: <Library className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
       {/* Background decoration */}
       <div className="absolute left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3 h-3" /> Modern Toolkit
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
            Powered by <span className="text-amber-600">next-gen</span> tools
          </h2>
          <p className="text-lg text-gray-600">
            Learning shouldn't feel like a chore. We provide a suite of modern tools to make your journey smoother, faster, and more interactive.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/10 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 mb-6 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors duration-300">
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                {tool.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}