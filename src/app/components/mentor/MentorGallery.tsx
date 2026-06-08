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
        <div className="container mx-auto px-6 relative z-10 pb-20 font-mono">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase tracking-wider mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <Award className="w-4 h-4 text-[#f39c12]" /> The Top 1% of Global Talent
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight uppercase leading-none">
                    Learn from the <span className="bg-[#f39c12] px-2 py-1 border-4 border-gray-900 inline-block rotate-1">Industry Giants</span>
                </h1>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto font-bold uppercase">
                    Skip years of trial and error. Connect with verified leaders from top tech firms, unicorns, and Fortune 500 companies.
                </p>
            </motion.div>

            {/* AI Recommendation Engine Widget */}
            {user && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-5xl mx-auto mb-12 p-6 md:p-8 bg-white border-4 border-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 border-4 border-gray-900 bg-[#f39c12] flex items-center justify-center text-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase">Smart Match Engine</h3>
                                <p className="text-xs text-gray-700 font-bold uppercase">Personalized recommendations based on your unique career goals.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAiMatchMode(prev => !prev)}
                            className={`flex items-center gap-2 px-6 py-3 border-4 border-gray-900 text-xs font-black uppercase transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] ${aiMatchMode ? 'bg-[#f39c12] text-gray-900' : 'bg-[#eff3ff] text-gray-900'}`}
                        >
                            <Sparkles className="w-4 h-4" />
                            {aiMatchMode ? 'Match Mode Active' : 'Enable Matching'}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {topAiMatches.map((mentor) => (
                                <motion.div 
                                    key={`ai-${mentor.id}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                                    onClick={() => {
                                        setSelectedMentor(mentor);
                                        setProfileModalOpen(true);
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 border-2 border-gray-900 ${mentor.image} flex items-center justify-center text-[10px] font-black text-white`}>
                                                {mentor.initials}
                                            </div>
                                            <span className="font-black text-gray-900 text-xs uppercase">{mentor.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black px-2 py-1 bg-[#f39c12] border border-gray-900 text-gray-900 rounded-sm">
                                            {mentorScores[mentor.id]}% Match
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-700 font-bold uppercase tracking-wider line-clamp-1">
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
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-950" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for roles, skills, or companies..."
                        className="w-full pl-14 pr-6 py-5 bg-white border-4 border-gray-900 text-gray-900 placeholder:text-gray-500 font-bold text-xs uppercase shadow-[6px_6px_0px_rgba(0,0,0,1)] focus:outline-none"
                    />
                </div>
                <button
                    onClick={() => toast.info("Filter sidebar coming soon!")}
                    className="flex items-center justify-center gap-3 px-8 py-5 bg-white border-4 border-gray-900 text-gray-900 font-black uppercase text-xs shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                </button>
            </motion.div>

            {/* Mentor Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-12 h-12 text-gray-900 animate-spin mb-4" />
                    <p className="text-gray-900 font-black uppercase text-sm">Assembling your expert panel...</p>
                </div>
            ) : filteredMentors.length === 0 ? (
                <div className="text-center py-20 border-4 border-gray-900 bg-white max-w-xl mx-auto shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                    <div className="w-20 h-20 bg-[#eff3ff] border-4 border-gray-900 flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        <Search className="w-8 h-8 text-gray-900" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase">No mentors found</h3>
                    <p className="text-gray-700 font-bold uppercase text-xs">Try adjusting your search or match mode.</p>
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
                                className="group h-full"
                            >
                                <div className="bg-white border-4 border-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col h-full overflow-hidden relative">
                                    {/* Header: Avatar & Info */}
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="relative">
                                            <div className={`w-20 h-20 border-4 border-gray-900 ${mentor.image} flex items-center justify-center text-2xl font-black text-white shadow-[4px_4px_0px_rgba(0,0,0,1)]`}>
                                                {mentor.initials}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-white border-2 border-gray-900 p-1">
                                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-3 py-1 border-2 border-gray-900 text-[10px] font-black uppercase tracking-wider mb-2 ${mentor.status === 'unavailable' ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {mentor.status === 'unavailable' ? 'Away' : 'Active'}
                                            </span>
                                            {aiMatchMode && user && (
                                                <div className="flex items-center gap-1 text-[10px] font-black text-[#f39c12] uppercase tracking-wider">
                                                    <Stars className="w-3.5 h-3.5 text-gray-950 fill-current" /> {mentorScores[mentor.id]}% Match
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Body: Name & Role */}
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-black text-gray-900 mb-1 uppercase tracking-tight group-hover:text-[#f39c12] transition-colors">
                                            {mentor.name}
                                        </h3>
                                        <p className="text-xs font-black text-gray-700 uppercase flex items-center gap-2">
                                            {mentor.role} <span className="w-1.5 h-1.5 bg-gray-950 rounded-full" /> {mentor.company}
                                        </p>
                                    </div>

                                    {/* Bio / Expertise */}
                                    <div className="flex-grow">
                                        <p className="text-gray-700 text-xs font-bold leading-relaxed mb-6 line-clamp-3 uppercase italic">
                                            "{mentor.bio || `Helping students master ${mentor.expertise[0]} and accelerate their career growth.`}"
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {mentor.expertise.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-[#eff3ff] text-[10px] font-black text-gray-900 border-2 border-gray-900">
                                                    {skill}
                                                </span>
                                            ))}
                                            {mentor.expertise.length > 3 && (
                                                <span className="px-3 py-1.5 bg-gray-200 text-[10px] font-black text-gray-950 border-2 border-gray-900">
                                                    +{mentor.expertise.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Stats */}
                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t-4 border-gray-900 mb-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Experience</span>
                                            <span className="text-base font-black text-gray-900 uppercase">{mentor.years_experience || 5}+ Yrs</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Session Fee</span>
                                            <span className="text-base font-black text-[#f39c12] uppercase">${mentor.hourly_rate || 150} /Hr</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedMentor(mentor);
                                                setProfileModalOpen(true);
                                            }}
                                            className="flex-1 py-3 bg-[#eff3ff] border-4 border-gray-900 text-gray-900 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
                                        >
                                            <User className="w-4 h-4" /> Profile
                                        </button>
                                        <button
                                            onClick={() => handleBookClick(mentor)}
                                            disabled={mentor.status === 'unavailable'}
                                            className={`flex-[2] py-3 border-4 border-gray-900 text-xs font-black uppercase transition-all shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 ${mentor.status === 'unavailable' 
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none translate-x-0 translate-y-0' 
                                                : 'bg-[#f39c12] text-gray-900 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'}`}
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
