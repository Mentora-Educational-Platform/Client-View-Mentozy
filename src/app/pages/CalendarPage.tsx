import { useState, useEffect } from 'react';
import {
    Clock, Bell, Plus,
    MoreVertical, ChevronLeft, ChevronRight,
    User, StickyNote, Video
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { getStudentBookings, Booking } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { StudentBookingDetailsModal } from '../components/booking/StudentBookingDetailsModal';
import { supabase } from '../../lib/supabase';

interface Reminder {
    id: string;
    text: string;
    completed: boolean;
}

export function CalendarPage() {
    const { user } = useAuth();
    const { mode, activeOrganization } = useOrganizationMode();
    const isOrgMode = mode === 'organization' && activeOrganization;
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [popoverPosition, setPopoverPosition] = useState<{ x: number, y: number } | null>(null);
    const [isPopoverInputMode, setIsPopoverInputMode] = useState(false);
    
    // Live WebRTC Sessions (loading from Supabase)
    const [liveSessions, setLiveSessions] = useState<any[]>([]);

    useEffect(() => {
        async function fetchLiveSessions() {
            if (!user || !supabase) return;
            try {
                const { data, error } = await supabase
                    .from('live_sessions')
                    .select(`
                        id,
                        topic,
                        duration,
                        room_id,
                        scheduled_at,
                        profiles:org_id (full_name)
                    `)
                    .contains('invited_student_ids', [user.id]);

                if (error) {
                    console.error("Error fetching live sessions from database:", error);
                    return;
                }

                const defaultSessions = [
                    {
                        id: 'live-1',
                        topic: 'Advanced Asynchronous Javascript & Event Loop',
                        instructor: 'Dr. Sarah Jenkins',
                        time: 'Starts in 10 minutes',
                        roomId: 'mentozy-live-async-pipeline',
                        duration: '1 Hour',
                        isActive: true
                    },
                    {
                        id: 'live-2',
                        topic: 'Custom WebRTC Architectures & Media Streams',
                        instructor: 'Prof. Marcus Brody',
                        time: 'Tomorrow, 10:00 AM',
                        roomId: 'mentozy-live-webrtc-blueprint',
                        duration: '1.5 Hours',
                        isActive: false
                    }
                ];

                if (data && data.length > 0) {
                    const mapped = data.map((session: any) => {
                        const scheduledDate = new Date(session.scheduled_at);
                        const now = new Date();
                        const diffMs = now.getTime() - scheduledDate.getTime();
                        const oneHour = 60 * 60 * 1000;
                        
                        const isActive = diffMs >= -15 * 60 * 1000 && diffMs <= 2 * oneHour;

                        const timeStr = scheduledDate.toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return {
                            id: session.id,
                            topic: session.topic,
                            instructor: (session.profiles as any)?.full_name || 'Mentozy Instructor',
                            time: timeStr,
                            roomId: session.room_id,
                            duration: session.duration,
                            isActive: isActive
                        };
                    });
                    setLiveSessions([...mapped, ...defaultSessions]);
                } else {
                    setLiveSessions(defaultSessions);
                }
            } catch (err) {
                console.error("Failed to load live sessions:", err);
            }
        }

        fetchLiveSessions();
        const timer = setInterval(fetchLiveSessions, 60000);
        return () => clearInterval(timer);
    }, [user]);
    const [popoverInputText, setPopoverInputText] = useState('');
    const [reminders, setReminders] = useState<Reminder[]>([
        { id: '1', text: 'Prepare questions for session', completed: false },
    ]);
    const [newReminder, setNewReminder] = useState('');

    // Real Bookings State
    const [bookings, setBookings] = useState<Booking[]>([]);

    // Modal State
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    useEffect(() => {
        async function loadBookings() {
            if (!user) return;
            const data = await getStudentBookings(user.id);
            setBookings(data || []);
        }
        loadBookings();
    }, [user]);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const addReminder = () => {
        if (!newReminder.trim()) return;
        setReminders([...reminders, { id: Date.now().toString(), text: newReminder, completed: false }]);
        setNewReminder('');
    };

    const toggleReminder = (id: string) => {
        setReminders(reminders.map((r: Reminder) => r.id === id ? { ...r, completed: !r.completed } : r));
    };

    const handleDateClick = (day: number, e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setSelectedDay(day);
        setIsPopoverInputMode(false);
        setPopoverInputText('');
        setPopoverPosition({
            x: rect.left + window.scrollX + rect.width / 2,
            y: rect.top + window.scrollY - 10
        });
    };

    const addReminderAtSelected = () => {
        if (selectedDay === null) return;
        const textToSave = popoverInputText.trim() || `Reminder for ${monthName.substring(0, 3)} ${selectedDay}`;
        const dateStr = `${monthName.substring(0, 3)} ${selectedDay}`;
        setReminders([...reminders, { id: Date.now().toString(), text: `${dateStr}: ${textToSave}`, completed: false }]);
        setSelectedDay(null);
        setPopoverPosition(null);
        setIsPopoverInputMode(false);
        setPopoverInputText('');
    };

    const handleBookingClick = (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            setSelectedBooking(booking);
            setDetailsModalOpen(true);
        }
    };

    const handleBookingUpdated = (bookingId: string, updates: Partial<Booking>) => {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
        setSelectedBooking(prev => prev && prev.id === bookingId ? { ...prev, ...updates } : prev);
    };

    return (
        <DashboardLayout>
            <div className={`relative grid grid-cols-1 lg:grid-cols-3 gap-8 ${isOrgMode ? 'font-mono text-gray-900 p-4 select-none bg-[#FAF9F6] min-h-screen' : ''}`} onClick={() => { setSelectedDay(null); setPopoverPosition(null); setIsPopoverInputMode(false); }}>

                {/* Floating Popover */}
                {selectedDay !== null && popoverPosition && (
                    <div
                        className={`fixed z-50 -translate-x-1/2 -translate-y-full bg-gray-900 text-white rounded-2xl shadow-2xl border border-white/10 transition-all duration-200 ${isPopoverInputMode ? 'p-3 w-64' : 'p-2'} ${isOrgMode ? 'font-mono border-2 border-gray-900 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)]' : ''}`}
                        style={{ left: popoverPosition.x, top: popoverPosition.y }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!isPopoverInputMode ? (
                            <button
                                onClick={() => setIsPopoverInputMode(true)}
                                className={`flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all whitespace-nowrap text-xs font-bold w-full ${isOrgMode ? 'font-mono' : ''}`}
                            >
                                <Plus className="w-4 h-4 text-amber-500" />
                                Add Reminder Here
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{monthName.substring(0, 3)} {selectedDay}</span>
                                    <button onClick={() => setIsPopoverInputMode(false)} className="text-[10px] font-bold text-white/40 hover:text-white">Cancel</button>
                                </div>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Type your reminder..."
                                    value={popoverInputText}
                                    onChange={(e) => setPopoverInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addReminderAtSelected()}
                                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all ${isOrgMode ? 'font-mono border-gray-700 bg-white/10' : ''}`}
                                />
                                <button
                                    onClick={addReminderAtSelected}
                                    className={`w-full bg-amber-600 hover:bg-amber-50 py-2 rounded-xl text-xs font-bold transition-all ${isOrgMode ? 'border-2 border-gray-900 rounded-lg shadow-[1px_1px_0px_rgba(0,0,0,1)] bg-amber-500 hover:bg-amber-400 text-gray-900' : ''}`}
                                >
                                    Save Reminder
                                </button>
                            </div>
                        )}
                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 border-r border-b border-white/10"></div>
                    </div>
                )}

                {/* Left/Center Column: The Calendar */}
                <div className="lg:col-span-2 space-y-8">
                    <div className={`bg-white ${isOrgMode ? 'border-2 border-gray-900 rounded-3xl p-6 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]' : 'rounded-[2.5rem] border border-gray-100 shadow-xl p-8'}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">{monthName}</h1>
                                <p className="text-gray-500 font-bold tracking-wide">{year}</p>
                            </div>
                            <div className={`flex items-center gap-2 p-1.5 ${isOrgMode ? 'bg-white border-2 border-gray-900 rounded-xl shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'bg-gray-50 rounded-2xl border border-gray-200'}`}>
                                <button onClick={handlePrevMonth} className={`p-2 transition-all ${isOrgMode ? 'hover:bg-indigo-50 border border-transparent hover:border-gray-900 rounded-lg' : 'hover:bg-white rounded-xl'}`}><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                                <button onClick={handleNextMonth} className={`p-2 transition-all ${isOrgMode ? 'hover:bg-indigo-50 border border-transparent hover:border-gray-900 rounded-lg' : 'hover:bg-white rounded-xl'}`}><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: firstDayOfMonth(year, month) }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square"></div>
                            ))}
                            {Array.from({ length: daysInMonth(year, month) }).map((_, i) => {
                                const day = i + 1;
                                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                                const isSelected = selectedDay === day;

                                // Check if any booking falls on this day
                                const hasEvent = bookings.some(b => {
                                    const d = new Date(b.scheduled_at);
                                    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                                });

                                return (
                                    <div
                                        key={day}
                                        onClick={(e) => handleDateClick(day, e)}
                                        className={`aspect-square relative flex flex-col items-center justify-center cursor-pointer transition-all border ${
                                            isToday ? (isOrgMode ? 'bg-indigo-600 text-white border-2 border-gray-900 rounded-xl shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]' : 'bg-amber-600 border-amber-600 text-white rounded-2xl shadow-lg shadow-amber-200') :
                                            isSelected ? (isOrgMode ? 'bg-[#F3E8FF] text-purple-950 border-2 border-gray-900 rounded-xl shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'bg-amber-50 border-amber-200 text-amber-900 rounded-2xl shadow-inner') :
                                            isOrgMode ? 'border-gray-200 text-gray-700 hover:border-gray-900 hover:bg-gray-50 rounded-xl' : 'border-transparent text-gray-700 hover:bg-amber-50 rounded-2xl'
                                        }`}
                                    >
                                        <span className="text-sm font-black">{day}</span>
                                        {hasEvent && !isToday && (
                                            <div className="absolute bottom-2 w-1.5 h-1.5 bg-amber-500 rounded-full group-hover:scale-125 transition-transform"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Live Classes & Sessions */}
                    <div className="space-y-6 mb-8">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Upcoming Live Classes & Sessions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {liveSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`bg-white p-6 ${isOrgMode ? 'border-2 border-gray-900 rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'rounded-3xl border border-gray-100 shadow-sm hover:shadow-md'} transition-all group flex flex-col justify-between min-h-[220px]`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`p-2.5 ${isOrgMode ? 'rounded-xl border-2 border-gray-900 bg-[#E0F2FE] text-blue-700 shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'rounded-xl bg-indigo-50 text-indigo-600'}`}>
                                                <Video className="w-5 h-5" />
                                            </div>
                                            {session.isActive ? (
                                                <span className={`text-[10px] font-bold ${isOrgMode ? 'text-emerald-700 bg-emerald-50 border-2 border-gray-900 px-2.5 py-1 rounded-lg' : 'text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100'} flex items-center gap-1 animate-pulse`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                                    Active Now
                                                </span>
                                            ) : (
                                                <span className={`text-[10px] font-bold ${isOrgMode ? 'text-slate-700 bg-slate-100 border-2 border-gray-900 px-2.5 py-1 rounded-lg' : 'text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100'}`}>
                                                    Scheduled
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                                            {session.time} • {session.duration}
                                        </span>
                                        <h3 className="text-base font-extrabold text-gray-900 mb-1 leading-snug line-clamp-2 text-left">
                                            {session.topic}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-semibold mb-4 text-left">
                                            Taught by {session.instructor}
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => navigate(`/live/${session.roomId}`)}
                                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${session.isActive ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/10 hover:-translate-y-0.5' : 'bg-slate-800 text-slate-200 hover:bg-slate-700 shadow-slate-800/10'} ${isOrgMode ? 'border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none' : ''}`}
                                    >
                                        <Video className="w-4 h-4" />
                                        {session.isActive ? 'Join Live WebRTC Session' : 'Pre-Register / Wait'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Items List */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-gray-900 text-left">Your Schedule</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bookings.length > 0 ? bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    onClick={() => handleBookingClick(booking.id)}
                                    className={`bg-white p-6 ${isOrgMode ? 'border-2 border-gray-900 rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'rounded-3xl border border-gray-100 shadow-sm hover:shadow-md'} transition-all group cursor-pointer`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 ${isOrgMode ? 'border-2 border-gray-900 rounded-xl bg-[#FEF9C3] text-amber-700 shadow-[1px_1px_0px_rgba(0,0,0,1)]' : booking.status === 'confirmed' ? 'bg-indigo-50 text-indigo-600 rounded-2xl' : 'bg-amber-50 text-amber-600 rounded-2xl'}`}>
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <button className="p-1 text-gray-400 hover:text-gray-900"><MoreVertical className="w-4 h-4" /></button>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">
                                        {new Date(booking.scheduled_at).toLocaleDateString()} • {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <h3 className="text-lg font-black text-gray-900 mb-2">Session with {booking.mentors?.name || 'Mentor'}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-3.5 h-3.5 text-amber-500" />
                                        {booking.mentors?.role || 'Mentor'}
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 text-center py-10 text-gray-400 text-sm">
                                    No scheduled sessions.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Reminders & Notes */}
                <div className="space-y-8">
                    {/* Personal Notes Card */}
                    <div className={`p-8 relative overflow-hidden group ${isOrgMode ? 'bg-[#FFEDD5] text-gray-900 border-2 border-gray-900 rounded-3xl shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]' : 'bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] shadow-xl shadow-amber-200 text-white'}`}>
                        <StickyNote className={`absolute -top-6 -right-6 w-32 h-32 ${isOrgMode ? 'text-gray-900/5' : 'text-white/10'} rotate-12 group-hover:scale-110 transition-transform duration-500`} />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-4">Quick Note</h3>
                            <textarea
                                className={`w-full p-4 text-sm transition-all resize-none h-32 rounded-2xl ${isOrgMode ? 'bg-white border-2 border-gray-900 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/55' : 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-white/30'}`}
                                placeholder="Jot down your thoughts..."
                            ></textarea>
                            <p className={`mt-4 text-[10px] uppercase font-bold tracking-widest ${isOrgMode ? 'text-gray-500' : 'text-white/60'}`}>Auto-saved to your personal space</p>
                        </div>
                    </div>

                    {/* Reminders List */}
                    <div className={`bg-white ${isOrgMode ? 'border-2 border-gray-900 rounded-3xl p-6 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]' : 'rounded-[2.5rem] border border-gray-100 shadow-sm p-8'}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Reminders</h3>
                            <div className={`p-2 ${isOrgMode ? 'border-2 border-gray-900 rounded-xl bg-[#DCFCE7] text-green-700 shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'bg-amber-50 text-amber-600 rounded-xl'}`}>
                                <Bell className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            {reminders.map((reminder: Reminder) => (
                                <div
                                    key={reminder.id}
                                    onClick={() => toggleReminder(reminder.id)}
                                    className="flex items-center gap-3 group cursor-pointer"
                                >

                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${reminder.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 group-hover:border-amber-400'
                                        }`}>
                                        {reminder.completed && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                    </div>
                                    <span className={`text-sm font-medium transition-all ${reminder.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                                        }`}>
                                        {reminder.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="relative mt-auto">
                            <input
                                type="text"
                                placeholder="Add a reminder..."
                                value={newReminder}
                                onChange={(e) => setNewReminder(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addReminder()}
                                className={`w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-sm font-medium ${isOrgMode ? 'border-2 border-gray-900 rounded-xl' : ''}`}
                            />
                            <button
                                onClick={addReminder}
                                className={`absolute p-2 bg-gray-900 text-white rounded-xl hover:bg-amber-600 transition-all ${isOrgMode ? 'top-2 right-2 border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]' : 'right-2 top-1.5'}`}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <StudentBookingDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                booking={selectedBooking}
                onBookingUpdated={handleBookingUpdated}
            />
        </DashboardLayout >
    );
}
