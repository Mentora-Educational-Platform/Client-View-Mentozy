"use client";
import {
  Target, Heart, Users, Rocket, ShieldCheck, Cpu, Globe,
  Award, Zap, BookOpen, Briefcase, MessageSquare,
  CheckCircle2, Sparkles, TrendingUp, Layers
} from 'lucide-react';
import { motion } from 'motion/react';

export function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="pt-32 pb-32 bg-[#fafafa] min-h-screen font-sans relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-600 font-medium text-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>The Future of Human-Led Learning</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
            Mentozy: Learning and <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">Mentorship</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
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
              <h2 className="text-3xl font-bold text-gray-900">Platform Overview</h2>
              <div className="prose prose-lg text-gray-600 space-y-4">
                <p>
                  Mentozy is designed to connect students with senior students, alumni, and professionals who are willing to teach, mentor, and guide based on <strong>real experience</strong> rather than theory alone.
                </p>
                <p>
                  The core idea is simple: learning becomes powerful when it is accessible, practical, and guided by people who have already walked the path.
                </p>
                <p>
                  Instead of limiting education to expensive institutions or pre-recorded content, Mentozy focuses on <strong>human-led learning</strong> supported by structured systems and technology.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-morphism-heavy p-10 rounded-[3rem] border border-white relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-8">
                <Target className="w-20 h-20 text-amber-500/10 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Vision and Scope</h3>
                <p className="text-gray-600">Supporting learners across all stages, from school-level to professional domains.</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: BookOpen, label: "Academic Subjects" },
                    { icon: Award, label: "Exam Prep" },
                    { icon: Cpu, label: "Technology & AI" },
                    { icon: Briefcase, label: "Career Guidance" },
                    { icon: Users, label: "Internships" },
                    { icon: Layers, label: "Resume Building" },
                    { icon: MessageSquare, label: "Interview Prep" },
                    { icon: TrendingUp, label: "Skill development" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-white/20">
                      <item.icon className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Pillars</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">The foundation upon which we build the future of mentorship.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Pillar 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-morphism-heavy p-10 rounded-[3rem] border border-white shadow-xl hover:shadow-amber-100/50 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mb-8 border border-white">
                <Heart className="w-8 h-8 fill-amber-500/20" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mentorship at the Center</h3>
              <p className="text-gray-600 mb-8">Direct interaction through multiple channels ensuring clarity, accountability, and personalized support.</p>
              <ul className="space-y-3">
                {[
                  "Recorded courses and content",
                  "Shared notes and resources",
                  "Live sessions and real-time interaction",
                  "One-on-one personalized appointments"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
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
              className="glass-morphism-heavy p-10 rounded-[3rem] border border-white shadow-xl hover:shadow-orange-100/50 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 mb-8 border border-white">
                <Rocket className="w-8 h-8 fill-orange-500/20" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Growth Ecosystem</h3>
              <p className="text-gray-600 mb-8">An integrated network of learning, exposure, guidance, and community for holistic progress.</p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { title: "Practice", desc: "Quizzes, assignments, crash courses" },
                  { title: "Exposure", desc: "Internships, hackathons, activities" },
                  { title: "Guidance", desc: "Direct access and structured paths" },
                  { title: "Community", desc: "Supportive network of builders" }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <h4 className="font-bold text-gray-900">{i + 1}. {item.title}</h4>
                    <p className="text-sm text-gray-600 leading-tight">{item.desc}</p>
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
            className="glass-morphism-heavy rounded-[3rem] border border-white shadow-2xl overflow-hidden"
          >
            <div className="p-10 border-b border-gray-100 bg-white/30">
              <h2 className="text-3xl font-bold text-gray-900">Platform Features</h2>
              <p className="text-gray-600 mt-2 text-lg">Enabling structured learning through a curated feature set.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-amber-50/50">
                    <th className="p-8 font-bold text-gray-900 uppercase text-xs tracking-widest border-b border-gray-100">Feature</th>
                    <th className="p-8 font-bold text-gray-900 uppercase text-xs tracking-widest border-b border-gray-100">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
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
                    <tr key={idx} className="hover:bg-white/40 transition-colors">
                      <td className="p-8">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="font-bold text-gray-900">{title}</span>
                        </div>
                      </td>
                      <td className="p-8 text-gray-600">{desc}</td>
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
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-100 to-amber-100 rounded-full blur-3xl opacity-30 animate-pulse" />
              <div className="relative glass-morphism p-12 rounded-[3.5rem] border border-white grid grid-cols-2 gap-8">
                {[
                  { title: "Trust", desc: "Genuine relationships", icon: Globe },
                  { title: "Ethics", desc: "Fairness & Transparency", icon: ShieldCheck },
                  { title: "Value", desc: "Learning over Profit", icon: Award },
                  { title: "Progress", desc: "Shared Success", icon: Zap }
                ].map((value, i) => (
                  <div key={i} className="text-center group">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 mx-auto mb-4 group-hover:-translate-y-1 transition-transform duration-300">
                      <value.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">{value.title}</h4>
                    <p className="text-xs text-gray-500">{value.desc}</p>
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
              <h2 className="text-3xl font-bold text-gray-900">Values & Philosophy</h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  We prioritize genuine learning outcomes, contributor growth, and community-driven progress. Our philosophy centeres on building genuine relationships between learners and mentors.
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
              className="bg-slate-900 p-12 rounded-[3rem] text-white overflow-hidden relative"
            >
              <div className="absolute bottom-0 right-0 p-12 opacity-10">
                <Cpu className="w-40 h-40" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-bold uppercase tracking-widest inline-block border border-white/10">Supportive Tech</div>
                <h3 className="text-3xl font-bold">Role of Technology</h3>
                <p className="text-white/70 leading-relaxed text-lg">
                  AI enhances but does not replace human connection. We use modern architecture and AI-assisted personalization to assist mentorship, keeping humans at the center.
                </p>
                <div className="flex flex-wrap gap-3 pt-4">
                  {["Scalable Architecture", "Data Protection", "AI Recommendation", "Human Interaction"].map(t => (
                    <span key={t} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-amber-600 p-12 rounded-[3rem] text-white overflow-hidden relative"
            >
              <div className="absolute bottom-0 left-0 p-12 opacity-10">
                <Users className="w-40 h-40" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest inline-block border border-white/10">Team Culture</div>
                <h3 className="text-3xl font-bold">Ownership & Growth</h3>
                <p className="text-white/90 leading-relaxed text-lg">
                  An early team structured as an internship-driven environment where contributors gain real startup experience and portfolio-ready work.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" />
                    <span className="text-sm">Practical Startup Knowledge</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-1 shrink-0" />
                    <span className="text-sm">Professional Mentorship</span>
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
          className="relative glass-morphism-heavy p-16 rounded-[4rem] text-center border-2 border-white/50 shadow-2xl overflow-hidden mb-32"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-amber-200/20 via-rose-100/10 to-transparent blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Vision for the Future</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Our long-term goal is a global network where practical education, meaningful mentorship, and career growth are accessible to everyone, regardless of their starting point.
            </p>
            <div className="grid sm:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
              {[
                { title: "Guided Learning", desc: "Education that feels truly personalized and relevant." },
                { title: "Achievable Careers", desc: "Bridge the gap between potential and opportunity." },
                { title: "Value Contribution", desc: "Skills and mentorship matter more than credentials." }
              ].map((v, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/40 border border-white/50">
                  <h4 className="font-bold text-gray-900 mb-2">{v.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Conclusion</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-12 italic">
            "Mentozy represents a fundamental shift in how learning and career guidance can be delivered. It's not just about acquiring knowledge—it's about building skills, gaining confidence, and discovering genuine career pathways through the guidance of people who have walked the same path."
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 rounded-full bg-slate-900 text-white font-bold text-lg shadow-2xl shadow-slate-300 hover:shadow-amber-200/50 transition-all duration-300"
          >
            Join the Ecosystem
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}

