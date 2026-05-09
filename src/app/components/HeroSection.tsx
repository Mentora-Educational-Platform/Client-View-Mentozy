import { ArrowRight, Sun, Moon, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useTheme } from "../../context/ThemeContext";

export function HeroSection() {
  const { isDarkMode, setTheme } = useTheme();

  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-[#fcfcfc] dark:bg-slate-950 transition-colors duration-700">
      {/* Premium Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-100/20 dark:bg-amber-500/5 rounded-full blur-[140px] animate-blob" />
        <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-indigo-100/10 dark:bg-indigo-500/5 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-8 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-24 items-center">

          {/* Left Content: Soft & Professional */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-12"
          >
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-5"
              >
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-[0.3em] shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Next Gen Learning
                </div>
              </motion.div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-gray-900 dark:text-white leading-[0.95] tracking-tighter">
                Learn easier.<br />
                <span className="italic font-serif text-amber-500">Teach faster.</span><br />
                <span className="flex items-center gap-4 mt-6">
                   Grow <span className="px-6 py-2 bg-gray-900 dark:bg-amber-500 text-white dark:text-slate-950 rounded-[2rem] text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight shadow-2xl shadow-amber-500/20">Together</span>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 max-w-xl leading-relaxed font-light tracking-tight">
                Not just another platform — a real community. Connect with mentors who actually care about your progress.
              </p>
            </div>

            {/* CTAs: Professional Rounded-3xl */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <Link to="/signup" className="w-full sm:w-auto px-12 py-6 bg-amber-500 text-slate-950 text-base font-bold rounded-[2rem] hover:bg-amber-400 hover:scale-[1.03] active:scale-95 transition-all shadow-[0_20px_50px_rgba(245,158,11,0.2)] flex items-center justify-center gap-4 group animate-glow-amber">
                Start for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-bold tracking-widest uppercase border-b border-transparent hover:border-gray-200"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Right Visual: Immersive & Soft */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative h-[500px] lg:h-[700px] flex items-center justify-center"
          >
            {/* The Video Container with Soft Glassmorphism */}
            <div className="relative w-full max-w-[500px] h-full rounded-[4rem] overflow-hidden bg-white dark:bg-slate-900 shadow-[0_50px_100px_rgba(0,0,0,0.1)] dark:shadow-none border border-gray-100 dark:border-slate-800">
              <video
                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/HeroSection.mp4" type="video/mp4" />
              </video>

              {/* Ultra-soft gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-indigo-500/5 pointer-events-none" />
            </div>

            {/* Floating Soft Cards (Replacing Demo Numbers) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute top-20 -right-4 lg:-right-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] px-8 py-6 shadow-2xl border border-white dark:border-slate-800 animate-float"
            >
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.3em]">Network</span>
                 <span className="text-2xl font-bold text-gray-900 dark:text-white">Global Mentors</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-24 -left-4 lg:-left-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] px-8 py-6 shadow-2xl border border-white dark:border-slate-800 animate-float-delayed"
            >
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">Community</span>
                 <span className="text-2xl font-bold text-gray-900 dark:text-white">Active Learners</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
