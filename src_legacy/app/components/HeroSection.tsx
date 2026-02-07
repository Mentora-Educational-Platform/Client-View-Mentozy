import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white via-amber-50/40 to-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div className="space-y-10 relative z-10">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full w-fit">

                Learn • Connect • Grow
              </p>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Learn with
                <span className="relative inline-block ml-3">
                  <span className="relative z-10 px-5 py-2 rounded-2xl bg-amber-300">
                    Experts
                  </span>
                  <span className="absolute inset-0 bg-amber-400 rounded-2xl blur-md opacity-30" />
                </span>
              </h1>

              <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                Not just courses — real people, real guidance.
                Learn from seniors, mentors, and professionals who genuinely want to help you grow.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-6">
              <Link to="/signup" className="group inline-flex items-center gap-4 bg-amber-400 hover:bg-amber-500 text-gray-900 px-8 py-4 rounded-full font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                Start learning for free
                <span className="bg-white rounded-full p-2 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-gray-900" />
                </span>
              </Link>

              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors underline underline-offset-4 decoration-gray-300"
              >
                Already on Mentozy? Log in
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-[520px] lg:h-[620px] flex items-center justify-center">

            {/* Video Card */}
            <div className="relative w-full max-w-[460px] h-full rounded-[2.5rem] overflow-hidden bg-white shadow-xl border border-gray-200">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/HeroSection.mp4" type="video/mp4" />
              </video>

              {/* Soft overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>

            {/* Floating Stat – Mentors */}
            <div className="absolute top-12 right-0 lg:-right-6 bg-white/90 backdrop-blur text-gray-900 rounded-2xl px-6 py-4 shadow-lg border border-gray-200">
              <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1 font-semibold">
                Mentors
              </p>
              <p className="text-3xl font-bold">12,456</p>
            </div>

            {/* Floating Stat – Learners */}
            <div className="absolute bottom-16 left-0 lg:-left-6 bg-white/90 backdrop-blur text-gray-900 rounded-2xl px-6 py-4 shadow-lg border border-gray-200">
              <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1 font-semibold">
                Learners
              </p>
              <p className="text-3xl font-bold">1,599</p>
            </div>



            {/* Soft Ambient Blobs */}
            <div className="absolute -z-10 top-24 left-10 w-40 h-40 bg-amber-200 rounded-full blur-3xl opacity-40" />
            <div className="absolute -z-10 bottom-20 right-12 w-40 h-40 bg-cyan-200 rounded-full blur-3xl opacity-40" />
          </div>
        </div>
      </div>
    </section>
  );
}
