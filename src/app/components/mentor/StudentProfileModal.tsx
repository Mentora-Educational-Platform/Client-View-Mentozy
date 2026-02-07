
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Profile } from '../../../lib/api';
import { User, MapPin, GraduationCap, Clock, Target, Zap, BookOpen, BrainCircuit } from 'lucide-react';

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile | null;
}

export function StudentProfileModal({ isOpen, onClose, profile }: StudentProfileModalProps) {
    if (!profile) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-0 gap-0 border-none shadow-2xl">

                {/* Header / Cover */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-xl">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name || 'Student'} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{profile.full_name || 'Student'}</h2>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm font-medium text-indigo-100">
                                {profile.grade && (
                                    <span className="flex items-center gap-1">
                                        <GraduationCap className="w-4 h-4" /> {profile.grade}
                                    </span>
                                )}
                                {profile.age && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> {profile.age} years old
                                    </span>
                                )}
                                {profile.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" /> {profile.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                </div>

                {/* Body Content */}
                <div className="p-8 space-y-8">

                    {/* About */}
                    {(profile.about_me || profile.curiosities) && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">About</h3>
                            {profile.about_me && (
                                <p className="text-gray-600 leading-relaxed text-sm">{profile.about_me}</p>
                            )}
                            {profile.curiosities && (
                                <div className="bg-indigo-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Curious About</p>
                                    <p className="text-indigo-900 font-medium">{profile.curiosities}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Learning Style & Goals */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <Target className="w-5 h-5 text-amber-500" /> Goals
                            </h3>
                            {profile.future_goals && (
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Future Aspirations</p>
                                    <p className="text-gray-700 font-medium">{profile.future_goals}</p>
                                </div>
                            )}
                            {profile.learning_goals && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Learning Target</p>
                                    <p className="text-gray-700 font-medium">{profile.learning_goals}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5 text-emerald-500" /> Preferences
                            </h3>
                            {profile.learning_style && (
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Style</p>
                                    <span className="inline-block mt-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold">
                                        {profile.learning_style}
                                    </span>
                                </div>
                            )}
                            {profile.learning_now && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Currently Learning</p>
                                    <p className="text-gray-700 font-medium">{profile.learning_now}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interests Tags */}
                    {profile.interests && profile.interests.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-rose-500" /> Interests
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.interests.map((interest, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Note: Contact info deliberately omitted as per privacy requirements */}
                </div>

            </DialogContent>
        </Dialog>
    );
}
