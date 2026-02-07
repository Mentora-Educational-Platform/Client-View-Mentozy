import { User, Linkedin, Twitter } from 'lucide-react';

export function TeamSection() {
  const team = [
    {
      name: 'Harshita Bhaskaruni',
      role: 'Founder & CEO',
      bio: 'Insights, leading, management/ Full stack developer',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      name: 'Kishlaya Mishra',
      role: 'Co-founder',
      bio: 'Team management, expertise in following trends/ Full stack developer',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Abhinash Karan',
      role: 'Tech Lead',
      bio: 'Tech work, development and building/ Full stack developer',
      color: 'bg-purple-100 text-purple-600',
    }
  ];

  return (
    <section className="py-24 bg-white-50/50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-amber-600 font-semibold tracking-wider text-sm uppercase mb-3 block">
            Our People
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
            Built by <span className="text-amber-600">experts</span> for experts
          </h2>
          <p className="text-lg text-gray-600">
            Our team combines decades of experience in education, technology, and career coaching to bring you the best learning experience.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col h-full"
            >
              {/* Avatar/Image Placeholder */}
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 text-2xl font-bold ${member.color} group-hover:scale-105 transition-transform duration-300 ring-4 ring-white shadow-sm`}>
                <User className="w-10 h-10" />
              </div>

              {/* Info */}
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                {member.name}
              </h3>
              <p className="text-xs font-bold text-amber-600 mb-4 uppercase tracking-wider">
                {member.role}
              </p>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow">
                {member.bio}
              </p>

              {/* Socials */}
              <div className="flex justify-center gap-4 pt-6 border-t border-gray-50 opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                <a href="#" className="hover:text-amber-600 hover:scale-110 transition-all text-gray-400">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-amber-600 hover:scale-110 transition-all text-gray-400">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}