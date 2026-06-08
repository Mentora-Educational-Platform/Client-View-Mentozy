import { motion } from 'motion/react';
import { Rocket, Code2, Heart, Users, ExternalLink, Github, ArrowRight, Sparkles, Zap, Smartphone, Globe, Brain, Plus, Music, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CommunityProjectsPage() {
  return (
    <div className="pt-40 pb-32 min-h-screen bg-[#FAF9F6] font-mono overflow-hidden relative">
      <div className="container mx-auto px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center mb-24"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 border-4 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase tracking-wider mb-10 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          >
            <Sparkles className="w-4 h-4 text-[#f39c12]" /> The Innovation Lab
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight uppercase leading-none">
            Build the future with us
          </h1>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto font-bold uppercase">
            A collaborative space for students and mentors to turn creative prototypes into world-class products.
          </p>
        </motion.div>

        {/* Featured Project */}
        <div className="flex justify-center max-w-7xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white border-4 border-gray-900 p-12 flex flex-col h-full min-h-[500px] w-full max-w-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300"
          >
            <div className="w-20 h-20 bg-[#f39c12] border-4 border-gray-900 flex items-center justify-center text-gray-900 mb-10 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <Music className="w-10 h-10" />
            </div>
            
            <div className="flex-grow">
               <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-[#eff3ff] border-2 border-gray-900 text-gray-900 text-[10px] font-black uppercase tracking-wider">LIVE BETA</span>
                  <span className="px-3 py-1 bg-white border-2 border-gray-900 text-gray-900 text-[10px] font-black uppercase tracking-wider">Entertainment</span>
               </div>
               <h3 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight group-hover:text-[#f39c12] transition-colors">Melody Mentor</h3>
               <p className="text-gray-700 font-bold uppercase text-xs leading-relaxed mb-8">
                 Stay tuned to Mentozy for unlimited music without ad-breaks and completely free. Grab your cell, connect headphones, and listen before we add pricing!
               </p>
            </div>

            <div className="pt-8 border-t-4 border-gray-900">
               <a 
                 href="https://melodymentor.mentozy.app/#" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-full py-4 bg-[#f39c12] hover:bg-[#e08e0b] border-4 border-gray-900 text-gray-900 font-black flex items-center justify-center gap-3 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase text-sm"
               >
                 Launch Melody <Headphones className="w-5 h-5" />
               </a>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto border-4 border-gray-900 bg-white p-16 md:p-24 text-center relative overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)]"
        >
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-3 px-5 py-2 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase tracking-wider mb-10 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              Join the Movement
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-10 tracking-tight leading-none uppercase text-gray-900">
              From Prototype to Product
            </h2>
            <p className="text-base md:text-lg text-gray-700 mb-16 leading-relaxed font-bold uppercase">
              Whether you're a student with a vision or a mentor with experience, this is the place to build something that lasts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to="/contact" 
                className="w-full sm:w-auto px-10 py-5 bg-[#f39c12] border-4 border-gray-900 text-gray-900 text-base font-black uppercase hover:bg-[#e08e0b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4"
              >
                Launch with Us <Rocket className="w-6 h-6" />
              </Link>
              <a 
                href="https://discord.gg/ruztUQ3B" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-5 bg-[#eff3ff] border-4 border-gray-900 text-gray-900 text-base font-black uppercase hover:bg-[#dbe4ff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4"
              >
                <Users className="w-6 h-6" /> Discord Hub
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
