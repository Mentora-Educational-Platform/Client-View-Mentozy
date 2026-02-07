import { Users, BookOpen, Target, Award, Rocket, ShieldCheck } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Expert Mentorship',
      description: 'Connect directly with seniors, alumni, and industry professionals who provide real-world guidance, not just theory.'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Practical Learning',
      description: 'Access curriculum designed around real projects and case studies, moving beyond passive video watching.'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Career Outcomes',
      description: 'Focused pathways for internships, job preparation, and resume building to help you land your dream role.'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Verified Skills',
      description: 'Earn recognition for your capabilities through project reviews and skill assessments by mentors.'
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Structured Tracks',
      description: 'Follow clear, step-by-step learning paths tailored for competitive exams, tech roles, and career pivots.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Trusted Community',
      description: 'Join a safe, verified network of ambitious learners and ethical mentors committed to mutual growth.'
    }
  ];

  return (
    <section className="py-24 bg-gray-50/50">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
            Why Mentozy?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Learning made <span className="text-amber-600">Powerful</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We bridge the gap between academic education and professional success by connecting you with the right people and the right resources.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/10 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 mb-6 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors duration-300">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}