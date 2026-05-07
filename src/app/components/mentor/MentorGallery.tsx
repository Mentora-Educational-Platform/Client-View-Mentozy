import { Search, Filter, Linkedin, Loader2, Calendar, User, Building2, ShieldCheck, Bot, Sparkles, Stars, ArrowRight, CheckCircle2, Award } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getMentors, Mentor, createBooking, getUserProfile, Profile } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookingModal } from '../booking/BookingModal';
import { MentorProfileModal } from './MentorProfileModal';

export function MentorGallery() {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentProfile, setStudentProfile] = useState<Profile | null>(null);
    const [aiMatchMode, setAiMatchMode] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadMentors() {
            setLoading(true);
            const data = await getMentors();
            setMentors(data);
            setLoading(false);
        }
        loadMentors();
    }, []);

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;
            const profile = await getUserProfile(user.id);
            setStudentProfile(profile);
        }
        loadProfile();
    }, [user]);

    const scoreMentorForStudent = (mentor: Mentor) => {
        if (!studentProfile) return 55;

        const profileIntent = [
            ...(studentProfile.interests || []),
            studentProfile.learning_goals,
            studentProfile.future_goals,
            studentProfile.learning_now,
            studentProfile.curiosities
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        const mentorCorpus = `${mentor.role} ${mentor.company} ${mentor.expertise.join(' ')} ${mentor.bio || ''}`.toLowerCase();
        const sharedSkills = mentor.expertise.filter(skill => profileIntent.includes(skill.toLowerCase())).length;
        const goalSignal = profileIntent
            .split(/[^a-zA-Z0-9]+/)
            .filter(Boolean)
            .reduce((count, token) => count + (token.length > 3 && mentorCorpus.includes(token) ? 1 : 0), 0);
        const availabilityBoost = mentor.status !== 'unavailable' ? 10 : -10;

        return Math.max(35, Math.min(99, 50 + sharedSkills * 12 + Math.min(18, goalSignal) + availabilityBoost));
    };

    const mentorScores = useMemo(() => {
        const byId: Record<number, number> = {};
        mentors.forEach(m => {
            byId[m.id] = scoreMentorForStudent(m);
        });
        return byId;
    }, [mentors, studentProfile]);

    const filteredMentors = useMemo(() => {
        const filtered = mentors.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.expertise.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        if (!aiMatchMode) return filtered;

        return [...filtered].sort((a, b) => (mentorScores[b.id] || 0) - (mentorScores[a.id] || 0));
    }, [mentors, searchQuery, aiMatchMode, mentorScores]);

    const topAiMatches = useMemo(() => filteredMentors.slice(0, 3), [filteredMentors]);

    const handleBookClick = (mentor: Mentor) => {
        if (!user) {
            toast.error("Please log in to book a session");
            navigate('/login');
            return;
        }
        setSelectedMentor(mentor);
    };

    const handleConfirmBooking = async (date: Date) => {
        if (!selectedMentor || !user) return false;
        const scheduledTime = date.toISOString();
        const success = await createBooking(user.id, selectedMentor.id, scheduledTime);
        if (success) {
            toast.success(`Session requested with ${selectedMentor.name}! Check your dashboard.`);
            navigate('/student-dashboard');
            return true;
        } else {
            toast.error("Failed to book session. Please try again.");
            return false;
        }
    };

    return (
        <div className="container mx-auto px-6 relative z-10 pb-20">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-amber-100/20 dark:from-amber-900/10 to-transparent blur-3xl -z-10 pointer-events-none" />

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Award className="w-3 h-3" /> The Top 1% of Global Talent
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-[1.1]">
                    Learn from the <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 dark:from-amber-400 dark:via-amber-200 dark:to-amber-500">Industry Giants</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto font-medium">
                    Skip years of trial and error. Connect with verified leaders from top tech firms, unicorns, and Fortune 500 companies.
                </p>
            </motion.div>

            {/* AI Recommendation Engine Widget */}
            {user && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-5xl mx-auto mb-12 p-8 rounded-[2.5rem] border border-amber-100 dark:border-slate-800 bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl shadow-2xl shadow-amber-500/5"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Smart Match Engine</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Personalized recommendations based on your unique career goals.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAiMatchMode(prev => !prev)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${aiMatchMode ? 'bg-gray-900 dark:bg-amber-500 text-white dark:text-slate-900' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'}`}
                        >
                            <Sparkles className="w-4 h-4" />
                            {aiMatchMode ? 'Match Mode Active' : 'Enable Matching'}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {topAiMatches.map((mentor) => (
                                <motion.div 
                                    key={`ai-${mentor.id}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-900/50 border border-amber-100/50 dark:border-slate-700/50 group hover:border-amber-300 dark:hover:border-amber-500/50 transition-all cursor-pointer"
                                    onClick={() => {
                                        setSelectedMentor(mentor);
                                        setProfileModalOpen(true);
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg ${mentor.image} flex items-center justify-center text-[10px] font-black text-white`}>
                                                {mentor.initials}
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{mentor.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
                                            {mentorScores[mentor.id]}% Match
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider line-clamp-1">
                                        {mentor.role} @ {mentor.company}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}

            {/* Search & Action Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-5xl mx-auto mb-16 flex flex-col md:flex-row gap-4"
            >
                <div className="relative flex-grow group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for roles, skills, or companies..."
                        className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-[2rem] shadow-xl shadow-gray-100/50 dark:shadow-none focus:ring-2 focus:ring-amber-500/20 outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 font-bold transition-all"
                    />
                </div>
                <button
                    onClick={() => toast.info("Filter sidebar coming soon!")}
                    className="flex items-center justify-center gap-3 px-8 py-5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-[2rem] font-bold hover:border-amber-500 dark:hover:border-amber-500 transition-all shadow-xl shadow-gray-100/50 dark:shadow-none"
                >
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                </button>
            </motion.div>

            {/* Mentor Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                    <p className="text-gray-400 font-bold">Assembling your expert panel...</p>
                </div>
            ) : filteredMentors.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No mentors found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or match mode.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredMentors.map((mentor, index) => (
                            <motion.div
                                key={mentor.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -10 }}
                                className="group h-full"
                            >
                                <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-700 shadow-xl shadow-gray-200/50 dark:shadow-none group-hover:border-amber-300 dark:group-hover:border-amber-500/50 transition-all duration-500 flex flex-col h-full overflow-hidden">
                                    
                                    {/* Top Accents */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Header: Avatar & Info */}
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="relative">
                                            <div className={`w-20 h-20 rounded-2xl ${mentor.image} flex items-center justify-center text-2xl font-black text-white shadow-xl transform group-hover:rotate-6 transition-transform duration-500`}>
                                                {mentor.initials}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-1.5 rounded-lg shadow-md border border-gray-100 dark:border-slate-800">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${mentor.status === 'unavailable' ? 'bg-gray-100 dark:bg-slate-700 text-gray-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                                                {mentor.status === 'unavailable' ? 'Away' : 'Active Now'}
                                            </span>
                                            {aiMatchMode && user && (
                                                <div className="flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                                                    <Stars className="w-3 h-3" /> {mentorScores[mentor.id]}% Match
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Body: Name & Role */}
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                            {mentor.name}
                                        </h3>
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            {mentor.role} <span className="w-1 h-1 bg-gray-300 dark:bg-slate-600 rounded-full" /> {mentor.company}
                                        </p>
                                    </div>

                                    {/* Bio / Expertise */}
                                    <div className="flex-grow">
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 font-medium italic">
                                            "{mentor.bio || `Helping students master ${mentor.expertise[0]} and accelerate their career growth.`}"
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {mentor.expertise.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded-xl border border-gray-100 dark:border-slate-700">
                                                    {skill}
                                                </span>
                                            ))}
                                            {mentor.expertise.length > 3 && (
                                                <span className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 text-[10px] font-bold text-gray-400 rounded-xl">
                                                    +{mentor.expertise.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 dark:border-slate-700 mb-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Experience</span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">{mentor.years_experience || 5}+ <span className="text-sm font-medium text-gray-400">Yrs</span></span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Session Fee</span>
                                            <span className="text-lg font-bold text-amber-600 dark:text-amber-500">${mentor.hourly_rate || 150} <span className="text-sm font-medium text-gray-400">/Hr</span></span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedMentor(mentor);
                                                setProfileModalOpen(true);
                                            }}
                                            className="flex-1 py-4 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <User className="w-4 h-4" /> Profile
                                        </button>
                                        <button
                                            onClick={() => handleBookClick(mentor)}
                                            disabled={mentor.status === 'unavailable'}
                                            className={`flex-[2] py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all animate-glow-amber ${mentor.status === 'unavailable' 
                                                ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed' 
                                                : 'bg-gray-900 dark:bg-amber-500 text-white dark:text-slate-900 hover:scale-[1.02]'}`}
                                        >
                                            <Calendar className="w-4 h-4" /> 
                                            {mentor.status === 'unavailable' ? 'Offline' : 'Book Session'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <BookingModal
                isOpen={!!selectedMentor && !profileModalOpen}
                onClose={() => setSelectedMentor(null)}
                mentorName={selectedMentor?.name || ''}
                userPlan="Free"
                onConfirm={handleConfirmBooking}
            />

            <MentorProfileModal
                isOpen={profileModalOpen}
                onClose={() => {
                    setProfileModalOpen(false);
                    if (!selectedMentor) setSelectedMentor(null);
                }}
                mentor={selectedMentor}
                onBook={(m) => {
                    setProfileModalOpen(false);
                    handleBookClick(m);
                }}
            />
        </div>
    );
}
