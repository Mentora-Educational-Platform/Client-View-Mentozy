import { ArrowRight, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useTheme } from "../../context/ThemeContext";

export function HeroSection() {
  const { isDarkMode, setTheme } = useTheme();

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-white dark:from-slate-900 via-amber-50/40 dark:via-slate-800/40 to-white dark:to-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10 relative z-10"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-4 py-1.5 rounded-full w-fit">
                  Learn • Connect • Grow
                </p>
                
                {/* Hero Specific Theme Toggle */}
                <button
                  onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-sm group"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Switch to Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-600" />
                      <span>Switch to Dark</span>
                    </>
                  )}
                </button>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Learn easier,<br />
                <span className="inline-block ml-8 md:ml-16">Teach faster</span><br />
                <span className="inline-flex items-center gap-2 md:gap-3 mt-2 md:mt-4 whitespace-nowrap">
                  And
                  <span className="relative inline-block">
                    <span className="relative z-10 px-3 py-1 md:px-5 md:py-2 rounded-2xl bg-amber-300 dark:bg-amber-500 text-gray-900">
                      Grow together
                    </span>
                    <span className="absolute inset-0 bg-amber-400 rounded-2xl blur-md opacity-30 dark:opacity-50" />
                  </span>
                </span>
              </h1>

              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
                Not just courses — real people, real guidance.
                Learn from seniors, mentors, and professionals who genuinely want to help you grow.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Link to="/signup" className="w-full sm:w-auto justify-center group inline-flex items-center gap-4 bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-gray-900 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 animate-glow-amber">
                Start learning for free
                <span className="bg-white rounded-full p-2 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-gray-900" />
                </span>
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto text-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline underline-offset-4 decoration-gray-300 dark:decoration-gray-700 py-2 sm:py-0"
              >
                Already on Mentozy? Log in
              </Link>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] sm:h-[480px] lg:h-[620px] flex items-center justify-center mt-8 lg:mt-0"
          >

            {/* Video Card */}
            <div className="relative w-full max-w-[460px] h-full rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700">
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-12 right-0 lg:-right-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-gray-900 dark:text-white rounded-2xl px-6 py-4 shadow-lg border border-gray-200 dark:border-slate-700 animate-float"
            >
              <p className="text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                Mentors
              </p>
              <p className="text-3xl font-bold">12,456</p>
            </motion.div>

            {/* Floating Stat – Learners */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-16 left-0 lg:-left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur text-gray-900 dark:text-white rounded-2xl px-6 py-4 shadow-lg border border-gray-200 dark:border-slate-700 animate-float-delayed"
            >
              <p className="text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                Learners
              </p>
              <p className="text-3xl font-bold">1,599</p>
            </motion.div>

            {/* Soft Ambient Blobs */}
            <div className="absolute -z-10 top-24 left-10 w-40 h-40 bg-amber-200 dark:bg-amber-500/20 rounded-full blur-3xl opacity-40 animate-blob" />
            <div className="absolute -z-10 bottom-20 right-12 w-40 h-40 bg-cyan-200 dark:bg-cyan-500/20 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
