import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Compass, 
  FileText, 
  Layout, 
  Video, 
  TrendingUp, 
  Zap, 
  Award, 
  ChevronRight,
  Workflow,
  Flame,
  Tag,
  Trophy,
  Percent,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function KrishnaiteAICoursePage() {
  const phases = [
    {
      phase: 'PHASE 01',
      title: 'ORIENTATION',
      color: 'bg-[#eff3ff]',
      description: 'Understand Krishnaite, Mentozy, the learning environment, the 18-day structure, and how hands-on tasks work.',
      icon: Compass
    },
    {
      phase: 'PHASE 02',
      title: 'CREATE WITH AI',
      color: 'bg-amber-50',
      description: 'Explore practical AI workflows for images, documents, PDFs, and creative assets.',
      icon: Sparkles
    },
    {
      phase: 'PHASE 03',
      title: 'BUILD WITH AI',
      color: 'bg-emerald-50',
      description: 'Explore how AI can help transform ideas into websites, interfaces, and practical digital projects.',
      icon: Layout
    },
    {
      phase: 'PHASE 04',
      title: 'CREATE CONTENT',
      color: 'bg-purple-50',
      description: 'Explore AI-assisted storytelling, visual content, advertising, video, and other creative workflows.',
      icon: Video
    },
    {
      phase: 'PHASE 05',
      title: 'AI FOR WORK & CAREER',
      color: 'bg-rose-50',
      description: 'Explore how AI can help with productivity, workflows, freelancing, projects, and professional opportunities.',
      icon: TrendingUp
    },
    {
      phase: 'PHASE 06',
      title: 'FINAL CHALLENGE',
      color: 'bg-[#FAF9F6]',
      description: 'Bring the skills together and create something of your own.',
      icon: Award
    }
  ];

  const experienceCards = [
    {
      title: 'AI PRODUCTIVITY',
      description: 'Discover practical ways to use AI in everyday work, learning, planning, research, writing, and repetitive tasks.',
      icon: Zap,
      accent: 'border-indigo-900 bg-indigo-50/60'
    },
    {
      title: 'AI AUTOMATION',
      description: 'Learn how AI can help reduce repetitive manual work and create smarter workflows.',
      icon: Workflow,
      accent: 'border-blue-900 bg-blue-50/60'
    },
    {
      title: 'AI IMAGE CREATION',
      description: 'Create wallpapers, visual assets, creative images, and other graphics using accessible AI tools.',
      icon: Sparkles,
      accent: 'border-amber-900 bg-amber-50/60'
    },
    {
      title: 'AI DOCUMENT CREATION',
      description: 'Create professional resumes, letters, reports, and beautifully formatted documents using AI-assisted workflows.',
      icon: FileText,
      accent: 'border-emerald-900 bg-emerald-50/60'
    },
    {
      title: 'AI WEBSITE CREATION',
      description: 'Explore how AI can help turn ideas into websites and modern user interfaces.',
      icon: Layout,
      accent: 'border-violet-900 bg-violet-50/60'
    },
    {
      title: 'AI ADVERTISING',
      description: 'Learn how to turn a product, brand, or niche into creative advertising concepts and visual campaigns.',
      icon: Flame,
      accent: 'border-rose-900 bg-rose-50/60'
    },
    {
      title: 'AI VIDEO & CONTENT',
      description: 'Explore AI-assisted storytelling, visual content, animation, and video creation.',
      icon: Video,
      accent: 'border-orange-900 bg-orange-50/60'
    },
    {
      title: 'AI FOR CAREER',
      description: 'Discover practical ways AI skills can become useful in freelancing, projects, creative work, and professional life.',
      icon: TrendingUp,
      accent: 'border-teal-900 bg-teal-50/60'
    }
  ];

  const scholarshipCards = [
    {
      badge: 'AIvantage QUIZ',
      badgeColor: 'bg-emerald-300 text-gray-900',
      heading: 'FIRST 40 WINNERS',
      scholarship: '100% SCHOLARSHIP',
      originalPrice: '₹10,000',
      discountedPrice: '₹0',
      label: 'COMPLETELY FREE',
      labelColor: 'bg-emerald-400 text-gray-900',
      description: 'The first 40 winners of the AIvantage Quiz receive a 100% scholarship for the Krishnaite 18-Day Practical AI Course.',
      featured: true,
      cardBg: 'bg-emerald-50/80'
    },
    {
      badge: 'NEXT 80',
      badgeColor: 'bg-[#eff3ff] text-gray-900',
      heading: '75% SCHOLARSHIP',
      scholarship: '75% SCHOLARSHIP',
      originalPrice: '₹10,000',
      discountedPrice: '₹2,500',
      label: '75% OFF',
      labelColor: 'bg-indigo-100 text-indigo-900',
      description: 'The next 80 eligible applicants receive a 75% scholarship toward the course.',
      featured: false,
      cardBg: 'bg-white'
    },
    {
      badge: 'GENERAL APPLICATION',
      badgeColor: 'bg-amber-100 text-gray-900',
      heading: '50% SCHOLARSHIP',
      scholarship: '50% SCHOLARSHIP',
      originalPrice: '₹10,000',
      discountedPrice: '₹5,000',
      label: '50% OFF',
      labelColor: 'bg-amber-200 text-amber-900',
      description: 'New applicants who do not fall within the first two scholarship groups can receive a 50% scholarship toward the course.',
      featured: false,
      cardBg: 'bg-white'
    }
  ];

  const workflowSteps = [
    { num: '01', title: 'LIVE CLASS', desc: 'Interactive concept session' },
    { num: '02', title: 'LIVE DEMONSTRATION', desc: 'Real-world workflow shown' },
    { num: '03', title: 'YOUR HANDS-ON TASK', desc: 'Direct practical exercise' },
    { num: '04', title: 'SUBMIT THROUGH MENTOZY', desc: 'Upload proof & outputs' },
    { num: '05', title: 'REVIEW / FEEDBACK', desc: 'Actionable guidance' },
    { num: '06', title: 'NEXT CHALLENGE', desc: 'Continuous progression' }
  ];

  const practicalOutputs = [
    'AI-generated visual assets',
    'Professional documents',
    'Modern resumes',
    'Creative advertisements',
    'Video content',
    'Websites & UI concepts',
    'AI-assisted workflows',
    'Personal projects',
    'Smart automations',
    'Final challenge project'
  ];

  const targetAudiences = [
    'STUDENTS',
    'CREATORS',
    'DESIGNERS',
    'DEVELOPERS',
    'FREELANCERS',
    'ENTREPRENEURS',
    'BEGINNERS',
    'AI CURIOUS PEOPLE'
  ];

  const applicationSteps = [
    {
      step: '01',
      title: 'APPLY',
      description: 'Submit your application through Mentozy.'
    },
    {
      step: '02',
      title: 'REVIEW',
      description: 'The Krishnaite team reviews applications.'
    },
    {
      step: '03',
      title: 'SELECTION',
      description: 'Selected participants receive further instructions.'
    },
    {
      step: '04',
      title: 'START',
      description: 'Begin the 18-day practical AI journey.'
    }
  ];

  return (
    <div className="bg-[#FAF9F6] text-gray-900 font-mono min-h-screen selection:bg-[#f39c12] selection:text-black">
      
      {/* 1. HERO SECTION */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 border-b-4 border-gray-900 relative overflow-hidden bg-[#FAF9F6]">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            
            {/* Small Eyebrow */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 border-2 sm:border-4 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs sm:text-sm font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            >
              <Sparkles className="w-4 h-4 text-indigo-700" />
              KRISHNAITE PRESENTS
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-gray-900 leading-[0.95]"
            >
              18 DAYS <br />
              <span className="text-[#f39c12] inline-block mt-1">OF PRACTICAL AI</span>
            </motion.h1>

            {/* Supporting Headline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-800"
            >
              Learn. Create. Automate. Build.
            </motion.p>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm sm:text-base md:text-lg text-gray-700 font-bold max-w-2xl mx-auto leading-relaxed"
            >
              A hands-on AI experience designed to help you discover what modern AI can actually do — and, more importantly, learn how to use it yourself.
            </motion.p>

            {/* Value & Scholarships Badges */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white border-2 sm:border-4 border-gray-900 text-gray-900 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                  ₹10,000 COURSE VALUE
                </div>
                <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-emerald-300 border-2 sm:border-4 border-gray-900 text-gray-900 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                  SCHOLARSHIPS AVAILABLE
                </div>
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">
                AIvantage Quiz Winners • Next 80 • New Applicants
              </p>
            </motion.div>

            {/* Primary CTA Area */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-2 space-y-3"
            >
              <Link
                to="/krishnaite/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-12 py-4 sm:py-5 bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-base sm:text-lg uppercase tracking-wider border-2 sm:border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all cursor-pointer min-h-[48px]"
              >
                APPLY NOW <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide">
                18-Day Practical AI Experience • ₹10,000 Value • Scholarships Available
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. PROGRAM INTRODUCTION */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            
            <div className="text-center space-y-3">
              <span className="px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                PRACTICAL PHILOSOPHY
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
                THIS ISN'T JUST AN AI COURSE.
              </h2>
            </div>

            <div className="bg-[#FAF9F6] border-2 sm:border-4 border-gray-900 p-6 sm:p-10 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-6">
              <p className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed">
                Over 18 days, you'll learn by actually using AI. Instead of spending the entire program listening to theory, you'll experiment with modern AI tools, complete practical hands-on activities, create real outputs, and submit your work through Mentozy.
              </p>

              <div className="border-t-2 border-gray-900 pt-6">
                <p className="text-xs sm:text-sm font-black uppercase text-gray-600 mb-4 tracking-wider">
                  You will progressively explore how AI can help you:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-bold">
                  {[
                    'Work smarter & eliminate friction',
                    'Automate repetitive daily tasks',
                    'Create high-impact visual content',
                    'Create professional documents & resumes',
                    'Build websites and modern interfaces',
                    'Create advertisements & campaign concepts',
                    'Produce creative storytelling content',
                    'Explore AI-assisted workflows & career opportunities'
                  ].map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-white border-2 border-gray-900 p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-100 border-2 sm:border-4 border-gray-900 p-4 sm:p-6 text-center shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                <p className="text-sm sm:text-base font-black uppercase text-gray-900 tracking-tight">
                  "The goal isn't to memorize AI tools. The goal is to learn what you can accomplish with them."
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. COURSE VALUE & SCHOLARSHIP OPPORTUNITIES */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="px-3.5 py-1.5 bg-white border-2 border-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <Tag className="w-3.5 h-3.5 text-[#f39c12]" />
                VALUE & ACCESSIBILITY
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
                THE COURSE IS VALUED AT ₹10,000.
              </h2>
              <p className="text-xs sm:text-sm md:text-base font-bold text-gray-700 leading-relaxed max-w-2xl mx-auto">
                The Krishnaite 18-Day Practical AI Course has an actual value of ₹10,000. However, we're making the first cohort significantly more accessible through scholarship opportunities.
              </p>
            </div>

            {/* Three Scholarship Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {scholarshipCards.map((sc, idx) => (
                <div 
                  key={idx}
                  className={`border-2 sm:border-4 border-gray-900 p-6 sm:p-7 flex flex-col justify-between space-y-6 relative transition-all ${
                    sc.featured 
                      ? 'bg-emerald-50 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] ring-4 ring-emerald-400/50 md:-translate-y-2' 
                      : 'bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {sc.featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-400 border-2 border-gray-900 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      ★ BEST SCHOLARSHIP ★
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b-2 border-gray-900 pb-3">
                      <span className={`px-2.5 py-1 border-2 border-gray-900 text-[10px] font-black uppercase tracking-wider ${sc.badgeColor}`}>
                        {sc.badge}
                      </span>
                      <span className={`px-2.5 py-1 border border-gray-900 text-[10px] font-black uppercase ${sc.labelColor}`}>
                        {sc.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900">
                        {sc.heading}
                      </h3>
                      <p className="text-xs font-black uppercase text-[#f39c12] mt-0.5 tracking-wider">
                        {sc.scholarship}
                      </p>
                    </div>

                    {/* Pricing Display */}
                    <div className="bg-white border-2 border-gray-900 p-3.5 text-center shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-400 line-through">
                          {sc.originalPrice}
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                          {sc.discountedPrice}
                        </span>
                      </div>
                      {sc.featured && (
                        <span className="inline-block text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                          100% OFF • 40 SEATS ONLY
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed">
                      {sc.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/krishnaite/apply"
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-900 font-black text-xs uppercase tracking-wider transition-all min-h-[44px] cursor-pointer ${
                        sc.featured
                          ? 'bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5'
                          : 'bg-white hover:bg-[#eff3ff] text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      Apply For Scholarship <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Clarification Box */}
            <div className="bg-white border-2 sm:border-4 border-gray-900 p-4 sm:p-5 text-center shadow-[3px_3px_0px_rgba(0,0,0,1)] max-w-3xl mx-auto">
              <p className="text-xs font-bold text-gray-700 uppercase leading-relaxed">
                Scholarship availability is limited and subject to the applicable participant category and selection process.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. THE 18-DAY JOURNEY */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3 py-1 bg-amber-100 border-2 border-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                CURRICULUM ARCHITECTURE
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
                THE 18-DAY JOURNEY
              </h2>
              <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase">
                A progressive, milestone-driven roadmap across 6 practical phases.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {phases.map((ph, idx) => {
                const IconComponent = ph.icon;
                return (
                  <div 
                    key={idx}
                    className={`border-2 sm:border-4 border-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4 ${ph.color} transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b-2 border-gray-900 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                          {ph.phase}
                        </span>
                        <IconComponent className="w-5 h-5 text-gray-900" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-gray-900">
                        {ph.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed">
                        {ph.description}
                      </p>
                    </div>
                    <div className="pt-2 text-[10px] font-black uppercase text-gray-500 flex items-center gap-1">
                      <span>Hands-on milestone</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* 5. WHAT STUDENTS WILL EXPERIENCE */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3 py-1 bg-emerald-100 border-2 border-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                PRACTICAL CAPABILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
                WHAT YOU WILL EXPERIENCE
              </h2>
              <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase">
                Direct hands-on skills tailored for projects, creativity, and work.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {experienceCards.map((exp, idx) => {
                const IconComp = exp.icon;
                return (
                  <div 
                    key={idx}
                    className={`border-2 sm:border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4 ${exp.accent} transition-all`}
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 border-2 border-gray-900 bg-white flex items-center justify-center text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-gray-900">
                        {exp.title}
                      </h3>
                      <p className="text-xs font-bold text-gray-700 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* 6. HOW THE 18 DAYS WORK (LEARNING METHODOLOGY) */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3 py-1 bg-purple-100 border-2 border-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                METHODOLOGY
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
                NOT JUST WATCHING.
              </h2>
              <p className="text-xs sm:text-sm font-bold text-gray-700 uppercase max-w-xl mx-auto leading-relaxed">
                Every learning experience is designed around doing, not simply watching. Participants see a workflow demonstrated and then immediately reproduce, experiment, and create their own result.
              </p>
            </div>

            {/* Workflow Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowSteps.map((st, idx) => (
                <div 
                  key={idx}
                  className="bg-[#FAF9F6] border-2 sm:border-4 border-gray-900 p-5 shadow-[3px_3px_0px_rgba(0,0,0,1)] space-y-2"
                >
                  <div className="flex items-center justify-between border-b-2 border-gray-900 pb-1.5">
                    <span className="text-[10px] font-black text-[#f39c12] uppercase tracking-widest">
                      STEP {st.num}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-black uppercase text-gray-900 tracking-tight">
                    {st.title}
                  </h3>
                  <p className="text-xs font-bold text-gray-600">
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 7. MENTOZY IS YOUR LEARNING HOME */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#eff3ff] border-2 sm:border-4 border-gray-900 p-6 sm:p-12 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-6">
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg sm:text-xl font-black uppercase text-gray-900">Mentozy</span>
                <div className="w-3 h-3 bg-[#f39c12] border-2 border-gray-900" />
                <span className="text-xs font-bold text-gray-500 uppercase">× Krishnaite</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-gray-900">
                YOUR 18-DAY JOURNEY RUNS THROUGH MENTOZY.
              </h2>

              <p className="text-xs sm:text-sm md:text-base font-bold text-gray-700 leading-relaxed">
                Mentozy provides the learning environment where participants can access their program experience, discover tasks, submit their work, and interact with the learning workflow.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white border-2 border-gray-900 p-3.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-1">
                  <p className="font-black text-xs uppercase text-gray-900">Task Discovery</p>
                  <p className="text-[11px] font-bold text-gray-600">Clear daily prompts & milestones</p>
                </div>
                <div className="bg-white border-2 border-gray-900 p-3.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-1">
                  <p className="font-black text-xs uppercase text-gray-900">Work Submission</p>
                  <p className="text-[11px] font-bold text-gray-600">Upload and showcase outputs</p>
                </div>
                <div className="bg-white border-2 border-gray-900 p-3.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-1">
                  <p className="font-black text-xs uppercase text-gray-900">Cohort Interaction</p>
                  <p className="text-[11px] font-bold text-gray-600">Progress with active peers</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 8. WHAT YOU DON'T NEED VS WHAT YOU DO NEED */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3 py-1 bg-amber-100 border-2 border-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                PREREQUISITES & ACCESS
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
                YOU DON'T NEED TO BE AN AI EXPERT.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* What you DON'T need */}
              <div className="bg-rose-50/70 border-2 sm:border-4 border-gray-900 p-6 sm:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-rose-900 flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  YOU DON'T NEED:
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm font-bold text-gray-800">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-600 shrink-0" /> Advanced programming knowledge
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-600 shrink-0" /> Expensive AI subscriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-600 shrink-0" /> Professional design equipment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-600 shrink-0" /> Previous professional AI experience
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-600 shrink-0" /> A huge collection of AI tools
                  </li>
                </ul>
              </div>

              {/* What you DO need */}
              <div className="bg-emerald-50/70 border-2 sm:border-4 border-gray-900 p-6 sm:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-emerald-900 flex items-center gap-2 border-b-2 border-gray-900 pb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  YOU DO NEED:
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm font-bold text-gray-800">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 shrink-0" /> Curiosity
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 shrink-0" /> Reliable internet access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 shrink-0" /> A computer / device to participate
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 shrink-0" /> Willingness to experiment & fail forward
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 shrink-0" /> Commitment to complete practical tasks
                  </li>
                </ul>
              </div>

            </div>

            <div className="bg-[#FAF9F6] border-2 border-gray-900 p-4 text-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-black uppercase text-gray-700">
                💡 We prioritize accessible and free AI tools wherever practical.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 9. WHAT YOU MAY CREATE */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                TANGIBLE OUTPUTS
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
                YOU WON'T LEAVE WITH JUST NOTES.
              </h2>
              <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase">
                Depending on the activities and projects you choose, you may create:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {practicalOutputs.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white border-2 border-gray-900 p-3.5 sm:p-4 text-center shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center"
                >
                  <p className="font-black text-xs uppercase text-gray-900">
                    {item}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 10. WHO SHOULD JOIN */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-10 text-center">
            
            <div className="space-y-3">
              <span className="px-3 py-1 bg-amber-100 border-2 border-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                AUDIENCE
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
                WHO IS THIS FOR?
              </h2>
              <p className="text-xs sm:text-sm font-bold text-gray-700 uppercase max-w-lg mx-auto">
                You don't need to already know everything about AI. You need curiosity and the willingness to learn by doing.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              {targetAudiences.map((aud, idx) => (
                <span 
                  key={idx}
                  className="px-4 py-2 bg-[#FAF9F6] border-2 sm:border-4 border-gray-900 font-black text-xs sm:text-sm uppercase text-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                >
                  {aud}
                </span>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 11. THE FIRST 40 — AIvantage QUIZ WINNERS */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-[#f39c12] text-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            <div className="inline-block px-3 py-1 bg-white border-2 border-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              AIvantage QUIZ SELECTION
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight">
              FIRST 40 AIvantage QUIZ WINNERS
            </h2>

            <div className="py-2 space-y-2">
              <div className="bg-white border-4 border-gray-900 p-5 sm:p-7 inline-block shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#f39c12] block">
                  100% SCHOLARSHIP
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl sm:text-3xl font-bold text-gray-400 line-through">
                    ₹10,000
                  </span>
                  <span className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 tracking-tight">
                    → ₹0
                  </span>
                </div>
                <div className="inline-block px-3 py-1 bg-emerald-300 border-2 border-gray-900 text-xs sm:text-sm font-black uppercase tracking-wider">
                  COMPLETELY FREE
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-base md:text-lg font-black uppercase leading-relaxed max-w-xl mx-auto">
              The first 40 winners of the AIvantage Quiz receive a complete scholarship for the Krishnaite 18-Day Practical AI Course.
            </p>

            <p className="text-xs font-bold uppercase tracking-wider text-gray-900/90 max-w-lg mx-auto bg-white/40 border-2 border-gray-900 p-3">
              The remaining scholarship opportunities are available according to the applicable participant category.
            </p>

          </div>
        </div>
      </section>

      {/* 12. APPLICATION PROCESS */}
      <section className="py-16 sm:py-24 border-b-4 border-gray-900 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                SELECTION WORKFLOW
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
                APPLICATION PROCESS
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {applicationSteps.map((appStep, idx) => (
                <div 
                  key={idx}
                  className="bg-[#FAF9F6] border-2 sm:border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3"
                >
                  <span className="text-2xl sm:text-3xl font-black text-[#f39c12] block">
                    {appStep.step}
                  </span>
                  <h3 className="text-sm sm:text-base font-black uppercase text-gray-900">
                    {appStep.title}
                  </h3>
                  <p className="text-xs font-bold text-gray-600 leading-relaxed">
                    {appStep.description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 13. FINAL CTA */}
      <section className="py-20 sm:py-28 bg-[#FAF9F6] relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8 bg-white border-4 border-gray-900 p-8 sm:p-14 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            
            <span className="px-4 py-1.5 bg-emerald-300 border-2 border-gray-900 font-black text-xs uppercase tracking-wider inline-block shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              ₹10,000 VALUE • SCHOLARSHIPS AVAILABLE
            </span>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-gray-900 leading-none">
              READY TO SEE WHAT YOU CAN BUILD WITH AI?
            </h2>

            <p className="text-sm sm:text-base md:text-lg font-bold text-gray-700 uppercase">
              Your 18-day practical AI journey starts here.
            </p>

            <div>
              <Link
                to="/krishnaite/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-12 py-4 sm:py-5 bg-[#f39c12] hover:bg-[#e08e0b] text-gray-900 font-black text-base sm:text-lg uppercase tracking-wider border-2 sm:border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer min-h-[48px]"
              >
                APPLY FOR THE 18-DAY AI COURSE <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <p className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
              First 40 AIvantage Quiz Winners (100% Scholarship) • Next 80 (75% Scholarship) • New Applicants (50% Scholarship)
            </p>

          </div>
        </div>
      </section>

    </div>
  );
}

export default KrishnaiteAICoursePage;
