import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Users,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MessageSquare,
  FileCheck,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const OrganisationTeacherOnboardingPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const contactEmail = 'founder@mentozy.app';
  const emailSubject = 'Mentozy Organization Partnership Inquiry';
  const emailBodyTemplate = `Hello Mentozy Partnerships Team,

We are interested in exploring an institutional partnership with Mentozy. Here are our initial organization details:

1. Organization Name: [Your Organization / School / Academy Name]
2. Organization Type: [School / College / Academy / EdTech / Community / Company]
3. What We Do: [Brief summary of your mission, courses, or audience]
4. Expected Users / Learners: [Approximate number of students/mentors]
5. Primary Use Case for Mentozy: [e.g., Live Cohorts, Mentorship Programs, Course Delivery, Student Tracking]
6. Partnership Idea & Goals: [How you envision collaborating with Mentozy]
7. Contact Person & Role: [Full Name, Title, Phone Number]
8. Timeline & Specific Requirements: [Target launch date, integrations needed, etc.]

We look forward to meeting up and discussing further.

Best regards,
[Your Name / Team]`;

  const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBodyTemplate)}`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const lifecycleStages = [
    { step: '01', title: 'INTERESTED', desc: 'Identify your institution’s mentorship or cohort needs' },
    { step: '02', title: 'CONTACT MENTOZY', desc: 'Send your partnership inquiry directly to founder@mentozy.app' },
    { step: '03', title: 'PARTNERSHIP DISCUSSION', desc: 'Align on cohorts, curriculum requirements & custom workflows' },
    { step: '04', title: 'APPROVED BY MENTOZY', desc: 'Partnership structure finalized and agreement validated' },
    { step: '05', title: 'ACCOUNT PROVISIONED', desc: 'Mentozy admin sets up your secure, dedicated workspace' },
    { step: '06', title: 'ORGANIZATION LOGIN', desc: 'Access your portal with official credentials at /org-login' },
    { step: '07', title: 'ORGANIZATION DASHBOARD', desc: 'Manage your teachers, enroll students, and launch courses' }
  ];

  const partnershipChecklist = [
    { label: 'Organization Name & Type', desc: 'School, College, Academy, Community, or Enterprise initiative' },
    { label: 'Core Mission & Audience', desc: 'Who you teach and what domains you specialize in' },
    { label: 'Expected Cohort Volume', desc: 'Estimated student and mentor roster capacity' },
    { label: 'Key Learning Use Cases', desc: 'Live sessions, mentor matching, grading, or certificate tracking' },
    { label: 'Lead Contact Information', desc: 'Direct email and phone for partnership coordinator' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-black selection:bg-[#FFE600] selection:text-black">
      {/* Top Banner */}
      <div className="bg-black text-white py-2.5 px-4 text-xs font-mono tracking-wider border-b-3 border-black">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse" />
            <span className="font-black text-[#FFE600]">INSTITUTIONAL ONBOARDING</span>
            <span className="text-zinc-400 hidden md:inline">• Dedicated Partner Program</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 hidden sm:inline">Already an approved partner?</span>
            <Link
              to="/org-login"
              className="text-[#FFE600] hover:underline font-black flex items-center gap-1"
            >
              Organization Login <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 mb-8">
          <Link to="/" className="hover:text-black underline">Home</Link>
          <span>/</span>
          <Link to="/teachers/select-type" className="hover:text-black underline">Join Mentozy</Link>
          <span>/</span>
          <span className="text-black bg-[#FFE600] px-2 py-0.5 border border-black font-black">
            Organizations
          </span>
        </div>

        {/* HERO SECTION: WANNA PARTNER WITH US? */}
        <div className="bg-[#FFE600] border-4 border-black shadow-[10px_10px_0px_0px_#000] p-6 sm:p-10 lg:p-12 mb-12 relative overflow-hidden">
          {/* Decorative Badge */}
          <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 text-xs font-mono font-black uppercase tracking-wider mb-6 border-2 border-black">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
            OFFICIAL PARTNERSHIPS ONLY • NO PUBLIC REGISTRATION
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-black mb-4">
            WANNA PARTNER WITH US?
          </h1>
          <p className="text-xl sm:text-2xl font-black text-black/80 font-mono tracking-tight mb-6">
            Why wait? Let's meet up.
          </p>

          <p className="text-base sm:text-lg text-black font-medium leading-relaxed max-w-3xl mb-8">
            Are you an organization, institution, school, academy, community, or initiative interested in partnering with Mentozy? Tell us what you need and how you'd like to work with us. Our team will review your request and get back to you very soon.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
            {/* Primary CTA: Contact Us */}
            <a
              href={mailtoLink}
              className="inline-flex items-center justify-center gap-3 bg-black text-white hover:bg-zinc-800 active:translate-x-0.5 active:translate-y-0.5 border-3 border-black shadow-[4px_4px_0px_0px_#fff] active:shadow-none font-black text-sm uppercase tracking-wider py-4 px-8 min-h-[52px] transition-all cursor-pointer text-center"
            >
              <Mail className="w-5 h-5 text-[#FFE600]" />
              CONTACT US →
            </a>

            {/* Copy Email Button */}
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-100 active:translate-x-0.5 active:translate-y-0.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none font-black text-sm uppercase tracking-wider py-4 px-6 min-h-[52px] transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  COPIED: founder@mentozy.app
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  COPY EMAIL ({contactEmail})
                </>
              )}
            </button>

            {/* Secondary CTA: Organization Login */}
            <Link
              to="/org-login"
              className="inline-flex items-center justify-center gap-2 bg-zinc-900/10 hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 border-3 border-black font-black text-sm uppercase tracking-wider py-4 px-6 min-h-[52px] transition-all text-center"
            >
              <Building2 className="w-4 h-4" />
              ORGANIZATION LOGIN
            </Link>
          </div>
        </div>

        {/* 7-STAGE LIFECYCLE TRACK */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 sm:p-10 mb-12">
          <div className="border-b-3 border-black pb-4 mb-8">
            <span className="text-xs font-mono font-black text-zinc-500 uppercase tracking-widest block mb-1">
              PROVISIONING LIFECYCLE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
              HOW ORGANIZATION ONBOARDING WORKS
            </h2>
            <p className="text-sm font-bold text-zinc-600 mt-1">
              Organization accounts cannot be self-created online. Here is our direct partnership path:
            </p>
          </div>

          <div className="space-y-3">
            {lifecycleStages.map((stage, idx) => (
              <div
                key={stage.step}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-3 border-black bg-[#FAF9F6] hover:bg-[#FFFDF0] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black text-[#FFE600] font-black font-mono flex items-center justify-center text-sm border-2 border-black flex-shrink-0">
                    {stage.step}
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base tracking-tight text-black">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-zinc-600 font-medium mt-0.5">
                      {stage.desc}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center text-xs font-mono font-black text-zinc-400">
                  {idx < lifecycleStages.length - 1 ? (
                    <span className="text-zinc-400 font-bold">NEXT STEP ↓</span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 border border-emerald-800 font-black">
                      ACTIVE PARTNER
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WHAT TO INCLUDE IN YOUR EMAIL PROPOSAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column: Questionnaire checklist */}
          <div className="bg-[#EFF6FF] border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white border-2 border-black flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black">
                  What to Include In Your Inquiry
                </h3>
              </div>
              <p className="text-xs text-zinc-700 font-bold mb-6">
                When emailing <code className="bg-white px-1.5 py-0.5 border border-black font-mono">founder@mentozy.app</code>, please provide:
              </p>

              <ul className="space-y-3 mb-6">
                {partnershipChecklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white p-3 border-2 border-black">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black text-black block">{item.label}</span>
                      <span className="text-xs text-zinc-600 font-medium">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={mailtoLink}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-3 border-black font-black text-xs uppercase tracking-wider py-3.5 px-4 shadow-[3px_3px_0px_0px_#000] active:shadow-none transition-all text-center"
            >
              <Mail className="w-4 h-4" />
              Open Pre-Filled Inquiry Email →
            </a>
          </div>

          {/* Right Column: Why Partner with Mentozy */}
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#FFE600] text-black border-2 border-black flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black">
                  Institutional Capabilities
                </h3>
              </div>
              <p className="text-xs text-zinc-600 font-bold mb-6">
                Everything your educational team needs in one custom branded command center:
              </p>

              <div className="space-y-3 mb-6">
                <div className="p-3 bg-[#FAF9F6] border-2 border-black">
                  <div className="flex items-center gap-2 text-xs font-black text-black mb-1">
                    <Users className="w-3.5 h-3.5 text-zinc-700" />
                    Custom Faculty & Mentor Workspaces
                  </div>
                  <p className="text-xs text-zinc-600">
                    Assign teachers, manage mentor availability, and review student progress reports in real time.
                  </p>
                </div>

                <div className="p-3 bg-[#FAF9F6] border-2 border-black">
                  <div className="flex items-center gap-2 text-xs font-black text-black mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-zinc-700" />
                    Dedicated Student Cohorts
                  </div>
                  <p className="text-xs text-zinc-600">
                    Bulk-enroll students, track attendance, and deliver structured 1-on-1 and group mentorship.
                  </p>
                </div>

                <div className="p-3 bg-[#FAF9F6] border-2 border-black">
                  <div className="flex items-center gap-2 text-xs font-black text-black mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                    Secure Admin-Provisioned Access
                  </div>
                  <p className="text-xs text-zinc-600">
                    Isolated institutional database records protected by verified role guards and audit logging.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-zinc-100 border-2 border-dashed border-zinc-400 text-center">
              <span className="text-xs font-mono font-black text-zinc-700">
                Official Contact: founder@mentozy.app
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM CALLOUT */}
        <div className="bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_#FFE600] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ready to collaborate with Mentozy?
            </h3>
            <p className="text-xs sm:text-sm font-medium text-zinc-300 mt-1 max-w-xl">
              Send us your requirements today. We will schedule a direct alignment call within 24–48 hours.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-center">
            <a
              href={mailtoLink}
              className="bg-[#FFE600] text-black hover:bg-[#ffe100] font-black text-xs uppercase tracking-wider py-3.5 px-6 border-2 border-black shadow-[3px_3px_0px_0px_#fff] active:shadow-none transition-all cursor-pointer"
            >
              SEND INQUIRY EMAIL →
            </a>
            <Link
              to="/org-login"
              className="bg-transparent hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider py-3.5 px-5 border-2 border-white transition-colors"
            >
              ORGANIZATION LOGIN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
