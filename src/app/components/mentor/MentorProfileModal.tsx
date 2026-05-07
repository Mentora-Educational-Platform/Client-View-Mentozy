import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Mentor } from '../../../lib/api';
import { User, Building2, Briefcase, Zap, Calendar, X, ShieldCheck, Stars, Globe, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MentorProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    mentor: Mentor | null;
    onBook: (mentor: Mentor) => void;
}

export function MentorProfileModal({ isOpen, onClose, mentor, onBook }: MentorProfileModalProps) {
    if (!mentor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] p-0 border-none shadow-2xl flex flex-col">
                
                {/* Header / Cover Area */}
                <div className="relative bg-gray-900 dark:bg-slate-950 p-8 md:p-12 text-white overflow-hidden flex-shrink-0">
                    {/* Background Gradients & Blobs */}
                    <div className="absolute inset-0 z-0 opacity-50">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] -mr-20 -mt-20 animate-blob" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-20 -mb-20 animate-blob animation-delay-2000" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="relative">
                            <div className={`w-36 h-36 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-5xl font-black shadow-2xl ${mentor.image}`}>
                                {mentor.initials}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-lg">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>

                        <div className="text-center md:text-left pt-2">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-500/20">
                                    Verified Mentor
                                </span>
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                                    Top 1% Expert
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{mentor.name}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-gray-300">
                                <span className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-amber-500" /> {mentor.company}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-amber-500" /> {mentor.role}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-amber-500" /> Remote / Global
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Close Button Override */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content (Scrollable) */}
                <div className="flex-grow overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
                    
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 block">Experience</span>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{mentor.years_experience || 5}+ <span className="text-sm font-medium text-gray-400">Yrs</span></p>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 block">Student Rating</span>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">4.9 <span className="text-sm font-medium text-amber-500">★</span></p>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700 hidden md:block">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 block">Sessions</span>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">120+ <span className="text-sm font-medium text-gray-400">Done</span></p>
                        </div>
                    </div>

                    {/* Biography */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-amber-500" /> Biography
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                            {mentor.bio || `A seasoned ${mentor.role} at ${mentor.company} with a track record of building scalable systems and leading high-performing teams. Specialized in ${mentor.expertise.join(', ')} and dedicated to nurturing the next generation of tech talent.`}
                        </p>
                    </section>

                    {/* Skills & Expertise */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" /> Specialized Expertise
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {mentor.expertise.map((skill, i) => (
                                <span key={i} className="px-5 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm hover:border-amber-500 transition-colors">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Mentorship Focus */}
                    <section className="p-8 bg-amber-50/50 dark:bg-slate-800/50 rounded-3xl border border-amber-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
                            <Stars className="w-5 h-5" /> What to expect in a session
                        </h3>
                        <ul className="space-y-3">
                            {['Personalized career roadmap planning', 'In-depth project & code reviews', 'Strategic interview preparation', 'Industry networking advice'].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {item}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Footer Action Bar */}
                <div className="p-8 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-6 flex-shrink-0">
                    <div className="text-center sm:text-left">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 block">Hourly Consultation Fee</span>
                        <div className="text-3xl font-black text-gray-900 dark:text-white">${mentor.hourly_rate || 150} <span className="text-sm font-medium text-gray-400">/ Hour</span></div>
                    </div>
                    <button
                        onClick={() => {
                            onClose();
                            onBook(mentor);
                        }}
                        disabled={mentor.status === 'unavailable'}
                        className={`w-full sm:w-auto px-12 py-5 text-white dark:text-slate-900 text-base font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 animate-glow-amber ${mentor.status === 'unavailable'
                            ? 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed opacity-50 shadow-none'
                            : 'bg-gray-900 dark:bg-amber-500 hover:scale-[1.02] active:scale-95'}`}
                    >
                        {mentor.status === 'unavailable' ? 'Currently Offline' : (
                            <>
                                <Calendar className="w-5 h-5" /> Secure My Slot
                            </>
                        )}
                    </button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
