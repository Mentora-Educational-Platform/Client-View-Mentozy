
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Mentor } from '../../../lib/api';
import { User, Building2, MapPin, Star, ShieldCheck, Award, Briefcase, Zap, Calendar } from 'lucide-react';

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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-0 gap-0 border-none shadow-2xl">

                {/* Header / Cover */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-2xl flex-shrink-0 text-5xl font-black">
                            {mentor.image ? (
                                <span className={mentor.image}>{mentor.initials}</span>
                            ) : (
                                <span className="text-white">{mentor.initials}</span>
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tight mb-2">{mentor.name}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-medium text-gray-300">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full">
                                    <Building2 className="w-4 h-4 text-amber-500" /> {mentor.company || 'Independent'}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full">
                                    <Briefcase className="w-4 h-4 text-amber-500" /> {mentor.role}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Status Absolute */}
                    <div className="absolute top-6 right-6">
                        <div className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full ${mentor.status === 'unavailable' ? 'bg-gray-700 text-gray-400' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'}`}>
                            {mentor.status === 'unavailable' ? 'Offline' : 'Available Now'}
                        </div>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                </div>

                {/* Body Content */}
                <div className="p-8 space-y-8">

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-lg">
                                <Star className="w-4 h-4 fill-current" /> {mentor.rating}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Rating</div>
                        </div>
                        <div className="text-center space-y-1 border-x border-gray-200">
                            <div className="font-black text-gray-900 text-lg">{mentor.reviews}</div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Reviews</div>
                        </div>
                        <div className="text-center space-y-1">
                            <div className="font-black text-gray-900 text-lg">{mentor.years_experience ? `${mentor.years_experience}+` : '5+'} <span className="text-xs text-gray-400 font-medium">yrs</span></div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Experience</div>
                        </div>
                    </div>

                    {/* About */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" /> About
                        </h3>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            {mentor.bio || `Experienced ${mentor.role} at ${mentor.company}. Passionate about mentoring and helping students achieve their career goals.`}
                        </p>
                    </div>

                    {/* Expertise */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" /> Expertise
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {mentor.expertise.map((skill, i) => (
                                <span key={i} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="flex-1">
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Session Fee</p>
                            <div className="text-2xl font-black text-gray-900">${mentor.hourly_rate || 150}</div>
                        </div>
                        <button
                            onClick={() => {
                                onClose();
                                onBook(mentor);
                            }}
                            disabled={mentor.status === 'unavailable'}
                            className={`flex-[2] py-4 text-white text-sm font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${mentor.status === 'unavailable'
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                                : 'bg-gray-900 hover:bg-amber-600 hover:scale-[1.02] active:scale-95'}`}
                        >
                            {mentor.status === 'unavailable' ? 'Currently Unavailable' : (
                                <>
                                    <Calendar className="w-5 h-5" /> Book Session
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
