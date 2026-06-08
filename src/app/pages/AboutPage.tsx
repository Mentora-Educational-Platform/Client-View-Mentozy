import {
  Target, Heart, Users, Rocket, ShieldCheck, Cpu, Globe,
  Award, Zap, BookOpen, Briefcase, MessageSquare,
  CheckCircle2, TrendingUp, Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="pt-32 pb-32 bg-[#FAF9F6] min-h-screen font-mono relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-24"
        >
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight uppercase leading-none">
            Mentozy: Learning and <span className="bg-[#f39c12] border-4 border-gray-900 px-2 py-1 rotate-1 inline-block">Mentorship</span>
          </h1>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto font-bold uppercase">
            Bridging the gap between education, real-world skills, and meaningful career guidance.
          </p>
        </motion.div>

        {/* Overview Section */}
        <section className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-black text-gray-900 uppercase">Platform Overview</h2>
              <div className="text-gray-700 font-bold uppercase text-xs space-y-4 leading-relaxed">
                <p>
                  Mentozy is designed to connect students with senior students, alumni, and professionals who are willing to teach, mentor, and guide based on <strong className="text-gray-900 font-black">real experience</strong> rather than theory alone.
                </p>
                <p>
                  The core idea is simple: learning becomes powerful when it is accessible, practical, and guided by people who have already walked the path.
                </p>
                <p>
                  Instead of limiting education to expensive institutions or pre-recorded content, Mentozy focuses on <strong className="text-gray-900 font-black">human-led learning</strong> supported by structured systems and technology.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-10 border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden"
            >
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-black text-gray-900 uppercase">Vision and Scope</h3>
                <p className="text-gray-755 text-xs font-bold uppercase leading-relaxed">Supporting learners across all stages, from school-level to professional domains.</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: BookOpen, label: "Academic Subjects" },
                    { icon: Award, label: "Exam Prep" },
                    { icon: Cpu, label: "Technology & AI" },
                    { icon: Briefcase, label: "Career Guidance" },
                    { icon: Users, label: "Internships" },
                    { icon: Layers, label: "Resume Building" },
                    { icon: MessageSquare, label: "Interview Prep" },
                    { icon: TrendingUp, label: "Skill Development" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-[#eff3ff] border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <item.icon className="w-5 h-5 text-gray-900" />
                      <span className="text-[10px] font-black text-gray-900 uppercase">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Core Pillars Section */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase">Core Pillars</h2>
            <p className="text-gray-700 text-xs font-bold uppercase max-w-xl mx-auto">The foundation upon which we build the future of mentorship.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Pillar 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300"
            >
              <div className="w-16 h-16 bg-[#eff3ff] border-4 border-gray-900 flex items-center justify-center text-gray-900 mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <Heart className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase">Mentorship at the Center</h3>
              <p className="text-gray-755 font-bold uppercase text-xs mb-8 leading-relaxed">Direct interaction through multiple channels, ensuring clarity, accountability, and personalized support.</p>
              <ul className="space-y-3">
                {[
                  "Recorded courses and content",
                  "Shared notes and resources",
                  "Live sessions and real-time interaction",
                  "One-on-one personalized appointments"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-900 text-xs font-black uppercase">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-10 border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300"
            >
              <div className="w-16 h-16 bg-[#eff3ff] border-4 border-gray-900 flex items-center justify-center text-gray-900 mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <Rocket className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase">Growth Ecosystem</h3>
              <p className="text-gray-755 font-bold uppercase text-xs mb-8 leading-relaxed">An integrated network of learning, exposure, guidance, and community for holistic progress.</p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { title: "Practice", desc: "Quizzes, assignments, crash courses" },
                  { title: "Exposure", desc: "Internships, hackathons, activities" },
                  { title: "Guidance", desc: "Direct access and structured paths" },
                  { title: "Community", desc: "Supportive network of builders" }
                ].map((item, i) => (
                  <div key={i} className="space-y-1 bg-[#FAF9F6] border-2 border-gray-900 p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <h4 className="font-black text-gray-900 text-xs uppercase">{item.title}</h4>
                    <p className="text-[10px] font-bold text-gray-700 uppercase leading-tight">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Comparison Table */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden"
          >
            <div className="p-10 border-b-4 border-gray-900 bg-[#eff3ff]">
              <h2 className="text-2xl font-black text-gray-900 uppercase">Platform Features</h2>
              <p className="text-gray-755 font-bold uppercase mt-2 text-xs">Enabling structured learning through a curated feature set.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b-4 border-gray-900">
                    <th className="p-6 font-black text-gray-900 uppercase text-xs tracking-wider">Feature</th>
                    <th className="p-6 font-black text-gray-900 uppercase text-xs tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-900">
                  {[
                    ["Recorded Courses", "Asynchronous learning with structured curriculum"],
                    ["Live Sessions", "Real-time interaction and doubt-clearing sessions"],
                    ["One-on-One Mentorship", "Personalized guidance and career advice"],
                    ["Practice Materials", "Quizzes, assignments, and problem sets"],
                    ["Community Notes", "Shared resources and collaborative learning"],
                    ["Career Tools", "Resume reviews, interview prep, job matching"],
                    ["Opportunity Board", "Internships, competitions, and hackathons"],
                    ["Crash Courses", "Intensive learning tracks for specific skills"]
                  ].map(([title, desc], idx) => (
                    <tr key={idx} className="hover:bg-[#eff3ff]/50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-[#f39c12] border border-gray-900" />
                          <span className="font-black text-gray-900 text-xs uppercase">{title}</span>
                        </div>
                      </td>
                      <td className="p-6 text-gray-755 font-bold uppercase text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

        {/* Values & Philosophy */}
        <section className="mb-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="bg-white p-8 border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] grid grid-cols-2 gap-6">
                {[
                  { title: "Trust", desc: "Genuine relationships", icon: Globe },
                  { title: "Ethics", desc: "Fairness & Transparency", icon: ShieldCheck },
                  { title: "Value", desc: "Learning over Profit", icon: Award },
                  { title: "Progress", desc: "Shared Success", icon: Zap }
                ].map((value, i) => (
                  <div key={i} className="text-center p-4 border-2 border-gray-900 bg-[#eff3ff] shadow-[3px_3px_0px_rgba(0,0,0,1)] group">
                    <div className="w-12 h-12 bg-white border-2 border-gray-900 flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <value.icon className="w-6 h-6 text-gray-900" />
                    </div>
                    <h4 className="font-black text-gray-900 text-xs uppercase">{value.title}</h4>
                    <p className="text-[10px] font-bold text-gray-755 uppercase leading-none mt-1">{value.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2 space-y-6"
            >
              <h2 className="text-3xl font-black text-gray-900 uppercase">Values & Philosophy</h2>
              <div className="text-gray-755 font-bold uppercase text-xs leading-relaxed space-y-4">
                <p>
                  We prioritize genuine learning outcomes, contributor growth, and community-driven progress. Our philosophy centers on building genuine relationships between learners and mentors.
                </p>
                <p>
                  Maintaining transparency and ethics in all interactions is non-negotiable. We are building Mentozy for the long-term, focusing on collective growth.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Technology & Team */}
        <section className="mb-32">
          <div className="grid lg:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-12 border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="px-3 py-1 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-[10px] font-black uppercase tracking-wider inline-block">Supportive Tech</div>
                <h3 className="text-2xl font-black text-gray-900 uppercase">Role of Technology</h3>
                <p className="text-gray-755 font-bold uppercase text-xs leading-relaxed">
                  AI enhances but does not replace human connection. We use modern architecture and AI-assisted personalization to assist mentorship, keeping humans at the center.
                </p>
                <div className="flex flex-wrap gap-2 pt-4">
                  {["Scalable Architecture", "Data Protection", "AI Recommendation", "Human Interaction"].map(t => (
                    <span key={t} className="px-3 py-1.5 border-2 border-gray-900 bg-[#FAF9F6] text-xs font-black uppercase tracking-wider">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#f39c12] p-12 border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="px-3 py-1 border-2 border-gray-900 bg-white text-gray-900 text-[10px] font-black uppercase tracking-wider inline-block">Team Culture</div>
                <h3 className="text-2xl font-black text-gray-900 uppercase">Ownership & Growth</h3>
                <p className="text-gray-900 font-bold uppercase text-xs leading-relaxed">
                  Our early team is structured as an internship-driven environment where contributors gain real startup experience and portfolio-ready work.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-2 text-gray-900 text-xs font-black uppercase">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Practical Startup Knowledge</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-900 text-xs font-black uppercase">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Professional Mentorship</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vision for the Future */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white p-12 border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center mb-32"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase">Vision for the Future</h2>
            <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-12 font-bold uppercase">
              Our long-term goal is a global network where practical education, meaningful mentorship, and career growth are accessible to everyone, regardless of their starting point.
            </p>
            <div className="grid sm:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
              {[
                { title: "Guided Learning", desc: "Education that feels truly personalized and relevant." },
                { title: "Achievable Careers", desc: "Bridge the gap between potential and opportunity." },
                { title: "Value Contribution", desc: "Skills and mentorship matter more than credentials." }
              ].map((v, i) => (
                <div key={i} className="p-6 border-4 border-gray-900 bg-[#FAF9F6] shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <h4 className="font-black text-gray-900 text-xs uppercase mb-2">{v.title}</h4>
                  <p className="text-[10px] font-bold text-gray-700 uppercase leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Conclusion */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase">Conclusion</h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-12 italic font-bold uppercase">
            "Mentozy represents a fundamental shift in how learning and career guidance can be delivered. It's not just about acquiring knowledge—it's about building skills, gaining confidence, and discovering genuine career pathways through the guidance of people who have walked the same path."
          </p>
          <Link
            to="/signup"
            className="inline-block px-10 py-5 border-4 border-gray-900 bg-[#f39c12] text-gray-900 font-black text-lg shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all uppercase"
          >
            Join the Ecosystem
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
