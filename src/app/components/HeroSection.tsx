import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-[#FAF9F6] border-b-4 border-gray-900 font-mono text-gray-900">
      {/* Premium Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-150/10 rounded-full blur-[140px] animate-blob" />
        <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-blue-150/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-8 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-24 items-center">

          {/* Left Content: Neo-Brutalist Layout */}
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
                <div className="inline-flex items-center gap-2.5 px-4 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                  Next Gen Learning
                </div>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1] tracking-tight uppercase">
                Learn easier.<br />
                <span className="text-[#f39c12]">Teach faster.</span><br />
                <span className="flex flex-wrap items-center gap-4 mt-6">
                   Grow <span className="px-6 py-3 bg-white border-4 border-gray-900 text-gray-900 font-black tracking-tight shadow-[4px_4px_0px_rgba(0,0,0,1)]">Together</span>
                 </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-700 font-bold max-w-xl leading-relaxed uppercase">
                Not just another platform — a real community. Connect with mentors who actually care about your progress.
              </p>
            </div>

            {/* CTAs: Neo-Brutalist Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <Link to="/signup" className="w-full sm:w-auto px-10 py-5 bg-[#eff3ff] text-gray-900 text-lg font-black border-4 border-gray-900 hover:bg-[#eff3ff]/80 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-4 group">
                Start for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-gray-900" />
              </Link>

              <Link
                to="/login"
                className="text-gray-900 font-black text-sm tracking-widest uppercase border-b-4 border-gray-900 pb-1 hover:text-[#f39c12]"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Right Visual: Immersive Video with Neo-Brutalist Border */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative h-[500px] lg:h-[700px] flex items-center justify-center"
          >
            {/* The Video Container with Thick Outlined Border */}
            <div className="relative w-full max-w-[500px] h-full border-4 border-gray-900 overflow-hidden bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)]">
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
              <div className="absolute inset-0 bg-[#eff3ff]/5 pointer-events-none" />
            </div>

            {/* Floating Soft Cards (Neo-Brutalist style) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute top-20 -right-4 lg:-right-12 bg-white border-2 border-gray-900 px-6 py-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] animate-float"
            >
              <div className="flex flex-col gap-1 uppercase">
                 <span className="text-[10px] font-black text-[#f39c12] tracking-wider">Network</span>
                 <span className="text-xl font-black text-gray-900">Global Mentors</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-24 -left-4 lg:-left-12 bg-white border-2 border-gray-900 px-6 py-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] animate-float-delayed"
            >
              <div className="flex flex-col gap-1 uppercase">
                 <span className="text-[10px] font-black text-[#f39c12] tracking-wider">Community</span>
                 <span className="text-xl font-black text-gray-900">Active Learners</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

