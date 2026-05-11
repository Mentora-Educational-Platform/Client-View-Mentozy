import { motion } from 'motion/react';
import { Rocket, Code2, Heart, Users, ExternalLink, Github, ArrowRight, Sparkles, Zap, Smartphone, Globe, Brain, Plus, Music, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CommunityProjectsPage() {
  return (
    <div className="pt-40 pb-32 min-h-screen bg-[#fcfcfc] dark:bg-slate-950 transition-colors duration-700 overflow-hidden relative">
      {/* Soft, Sophisticated Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-gradient-to-b from-amber-50/20 dark:from-amber-900/5 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-200/10 dark:bg-amber-500/5 rounded-full blur-[140px] -z-10 animate-blob" />
      <div className="absolute top-[20%] left-[-5%] w-[500px] h-[500px] bg-indigo-100/10 dark:bg-indigo-500/5 rounded-full blur-[120px] -z-10 animate-blob animation-delay-2000" />

      <div className="container mx-auto px-8 relative z-10">
        {/* Soft, Minimalist Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center mb-32"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-[0.25em] mb-10 shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> The Innovation Lab
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-medium text-gray-900 dark:text-white mb-12 tracking-tight leading-[1.02]">
            Build the <span className="italic font-serif">future</span> with us.
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 leading-relaxed max-w-2xl mx-auto font-light tracking-tight">
            A collaborative space for students and mentors to turn creative prototypes into world-class products.
          </p>
        </motion.div>

        {/* Clean, Professional Grid - Centered single project */}
        <div className="flex justify-center max-w-7xl mx-auto mb-32">
          
          {/* Featured Project: Melody Mentor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -12 }}
            className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3.5rem] p-12 border border-amber-100/50 dark:border-amber-500/20 flex flex-col h-full min-h-[500px] w-full max-w-xl transition-all duration-700 shadow-[0_30px_60px_rgba(245,158,11,0.05)] dark:shadow-none"
          >
            <div className="w-20 h-20 bg-amber-500 rounded-[2rem] flex items-center justify-center text-white mb-10 shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform duration-500">
              <Music className="w-10 h-10" />
            </div>
            
            <div className="flex-grow">
               <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg">LIVE BETA</span>
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">Entertainment</span>
               </div>
               <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">Melody Mentor</h3>
               <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                 Stay tuned to Mentozy for unlimited music without ad-break and completely free, grab your cell and connect headphones and listen before we add pricing!
               </p>
            </div>

            <div className="pt-8 border-t border-gray-50 dark:border-slate-800/50">
               <a 
                 href="https://melodymentor.mentozy.app/#" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-full py-5 bg-gray-900 dark:bg-amber-500 text-white dark:text-slate-950 font-black rounded-2xl flex items-center justify-center gap-3 group/btn transition-all hover:bg-amber-600 dark:hover:bg-amber-400 shadow-xl shadow-gray-900/10 dark:shadow-amber-500/10"
               >
                 Launch Melody <Headphones className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
               </a>
            </div>

            {/* Glowing Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>

        {/* Professional CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-6xl mx-auto rounded-[4.5rem] bg-gray-900 dark:bg-slate-950 p-20 md:p-32 text-center text-white relative overflow-hidden shadow-[0_80px_150px_rgba(0,0,0,0.4)]"
        >
          {/* Luxury Ambient Glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
            <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px]" />
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-[11px] font-black uppercase tracking-[0.4em] mb-12">
              Join the Movement
            </div>
            <h2 className="text-5xl md:text-7xl font-medium mb-10 tracking-tight leading-tight">
              From <span className="italic font-serif">Prototype</span> to Product.
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-16 leading-relaxed font-light tracking-tight">
              Whether you're a student with a vision or a mentor with experience, this is the place to build something that lasts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link 
                to="/contact" 
                className="w-full sm:w-auto px-16 py-7 bg-amber-500 text-slate-950 text-lg font-bold rounded-[2rem] hover:bg-amber-400 hover:scale-[1.03] active:scale-95 transition-all shadow-[0_20px_60px_rgba(245,158,11,0.3)] flex items-center justify-center gap-4 group animate-glow-amber"
              >
                Launch with Us <Rocket className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="https://discord.gg/ruztUQ3B" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-16 py-7 bg-white/5 text-white text-lg font-bold rounded-[2rem] hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-4 backdrop-blur-xl"
              >
                <Users className="w-6 h-6 text-gray-400" /> Discord Hub
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
