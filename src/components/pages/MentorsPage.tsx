"use client";
import { Search, Filter, Star, Linkedin, Loader2, Calendar, Globe, MapPin, User, Building2, ExternalLink, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getMentors, Mentor, createBooking } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

import { BookingModal } from '../booking/BookingModal';

export function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadMentors() {
      setLoading(true);
      const data = await getMentors();
      setMentors(data);
      setLoading(false);
    }
    loadMentors();
  }, []);

  const { user } = useAuth();
  const router = useRouter();

  const filteredMentors = useMemo(() => {
    return mentors.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.expertise.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [mentors, searchQuery]);

  const handleBookClick = (mentor: Mentor) => {
    if (!user) {
      toast.error("Please log in to book a session");
      router.push('/login');
      return;
    }
    setSelectedMentor(mentor);
  };

  const handleConfirmBooking = async (date: Date, timeSlot: string) => {
    if (!selectedMentor || !user) return false;
    const scheduledTime = date.toISOString();
    const success = await createBooking(user.id, selectedMentor.id, scheduledTime);
    if (success) {
      toast.success(`Session requested with ${selectedMentor.name}! Check your dashboard.`);
      router.push('/student-dashboard');
      return true;
    } else {
      toast.error("Failed to book session. Please try again.");
      return false;
    }
  };

  return (
    <div className="pt-32 pb-32 bg-[#fafafa] min-h-screen font-sans relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            <span>Premium Expert Network</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tighter leading-tight">
            Discovery <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700">Top-Tier</span> Mentors
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed font-medium max-w-2xl mx-auto">
            Skip the guesswork. Learn directly from industry leaders who have already scaled the mountains you're climbing.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-morphism-heavy p-3 rounded-[2.5rem] border border-white/50 shadow-2xl shadow-gray-200/50 mb-20 flex flex-col md:flex-row gap-3 max-w-5xl mx-auto"
        >
          <div className="relative flex-grow group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, company, or specialty..."
              className="w-full pl-14 pr-6 py-5 bg-white/50 border-none rounded-[2rem] focus:ring-2 focus:ring-amber-200 outline-none text-gray-800 placeholder:text-gray-400 font-bold transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black hover:bg-amber-600 hover:scale-[1.02] transition-all shadow-lg active:scale-95 group">
            <Filter className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>Deep Filters</span>
          </button>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-amber-600 animate-spin" />
              <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full" />
            </div>
            <p className="text-gray-400 font-bold text-lg animate-pulse tracking-tight">Curating the best for you...</p>
          </div>
        ) : filteredMentors.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-40 space-y-6"
          >
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <UsersRound className="w-16 h-16 text-amber-500" />
              </div>
              <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-black text-gray-900 mb-3">No Mentors Available Yet</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Our mentor network is growing! Check back soon or be the first to join as a mentor and inspire the next generation.
              </p>
            </div>
            <a
              href="/mentor-onboarding"
              className="mt-6 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black rounded-2xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30 hover:scale-105"
            >
              Become a Mentor
            </a>
          </motion.div>
        ) : (
          /* Mentors Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredMentors.map((mentor, index) => (
                <motion.div
                  key={mentor.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                  className="group relative"
                >
                  {/* Card Main Body */}
                  <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 border border-white border-t-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_80px_rgba(251,191,36,0.15)] transition-all duration-700 flex flex-col h-full relative z-10 overflow-hidden">

                    {/* Glowing Accent */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Mentor Badge */}
                    <div className="absolute top-6 right-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      MENTOR
                    </div>

                    <div className="flex flex-col items-center text-center mb-8 pt-4">
                      <div className="relative mb-6">
                        <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl relative z-10 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110 ${mentor.image}`}>
                          {mentor.initials}
                        </div>
                        {/* Avatar Decor */}
                        <div className="absolute -inset-4 bg-amber-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-1 right-1 bg-white p-2 rounded-2xl shadow-lg border border-gray-100 z-20">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-amber-600 transition-colors mb-2 tracking-tighter">
                        {mentor.name}
                      </h3>

                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                        {mentor.type ? <Building2 className="w-3.5 h-3.5 text-amber-500" /> : <User className="w-3.5 h-3.5 text-amber-500" />}
                        {mentor.role}
                      </div>

                      {mentor.company && mentor.company !== 'Mentozy' && (
                        <p className="text-sm font-bold text-gray-400 flex items-center gap-1">
                          at <span className="text-gray-900">{mentor.company}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-6 flex-grow flex flex-col justify-between">
                      <p className="text-gray-500 text-sm leading-relaxed text-center font-medium line-clamp-3 italic">
                        "{mentor.bio || `Specializing in ${mentor.expertise[0] || 'Modern Technologies'} and industry leadership.`}"
                      </p>

                      <div className="flex flex-wrap justify-center gap-2">
                        {mentor.expertise.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-5 py-2 bg-white rounded-2xl text-[10px] font-black text-gray-600 uppercase tracking-tighter border border-gray-100 shadow-sm transition-all hover:bg-amber-500 hover:text-white hover:border-amber-500 cursor-default">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between py-6 px-4 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-base font-black text-gray-900">{mentor.rating}</span>
                          </div>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Reviews</p>
                          <p className="text-base font-black text-gray-900">{mentor.reviews}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center">
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Fee</p>
                          <p className="text-base font-black text-amber-600">${mentor.hourly_rate || 150}<span className="text-[10px] text-gray-400">/hr</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 flex gap-3">
                      <button
                        onClick={() => handleBookClick(mentor)}
                        className="flex-1 py-5 bg-gray-900 text-white text-sm font-black rounded-[2rem] hover:bg-amber-600 shadow-xl lg:shadow-none lg:hover:shadow-amber-200/50 transition-all active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group/btn"
                      >
                        <Calendar className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Instant Booking</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-500 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                      </button>
                      {mentor.linkedin && (
                        <a
                          href={mentor.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-5 bg-white border border-gray-100 rounded-[2rem] text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm"
                          title="View LinkedIn Profile"
                        >
                          <Linkedin className="w-5 h-5 fill-current" />
                        </a>
                      )}
                      {mentor.website && (
                        <a
                          href={mentor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-5 bg-white border border-gray-100 rounded-[2rem] text-gray-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100 transition-all shadow-sm"
                          title="Visit Website"
                        >
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BookingModal
        isOpen={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
        mentorName={selectedMentor?.name || ''}
        userPlan="Free"
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
