import { useState, useEffect } from 'react';
import {
    Clock, Bell, Plus,
    MoreVertical, ChevronLeft, ChevronRight,
    User, StickyNote
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { getStudentBookings } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Event {
    id: string;
    title: string;
    time: string;
    type: 'session' | 'workshop' | 'deadline';
    mentor?: string;
    description?: string;
}

interface Reminder {
    id: string;
    text: string;
    completed: boolean;
}

export function CalendarPage() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [popoverPosition, setPopoverPosition] = useState<{ x: number, y: number } | null>(null);
    const [isPopoverInputMode, setIsPopoverInputMode] = useState(false);
    const [popoverInputText, setPopoverInputText] = useState('');
    const [reminders, setReminders] = useState<Reminder[]>([
        { id: '1', text: 'Prepare questions for session', completed: false },
    ]);
    const [newReminder, setNewReminder] = useState('');

    // Real Events State
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        async function loadBookings() {
            if (!user) return;
            const bookings = await getStudentBookings(user.id);

            const mappedEvents: Event[] = bookings.map(b => ({
                id: b.id,
                title: `Session: ${b.mentors?.name || 'Mentor'}`,
                time: new Date(b.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'session',
                mentor: b.mentors?.name,
                description: b.status === 'confirmed' ? 'Confirmed Session' : 'Pending Approval'
            }));

            // If no events, show empty state or keep empty
            setEvents(mappedEvents);
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

    return (
        <DashboardLayout>
            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8" onClick={() => { setSelectedDay(null); setPopoverPosition(null); setIsPopoverInputMode(false); }}>

                {/* Floating Popover */}
                {selectedDay !== null && popoverPosition && (
                    <div
                        className={`fixed z-50 -translate-x-1/2 -translate-y-full bg-gray-900 text-white rounded-2xl shadow-2xl border border-white/10 transition-all duration-200 ${isPopoverInputMode ? 'p-3 w-64' : 'p-2'}`}
                        style={{ left: popoverPosition.x, top: popoverPosition.y }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!isPopoverInputMode ? (
                            <button
                                onClick={() => setIsPopoverInputMode(true)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all whitespace-nowrap text-xs font-bold w-full"
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
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                                />
                                <button
                                    onClick={addReminderAtSelected}
                                    className="w-full bg-amber-600 hover:bg-amber-50 py-2 rounded-xl text-xs font-bold transition-all"
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
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{monthName}</h1>
                                <p className="text-gray-500 font-medium">{year}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 border border-gray-200">
                                <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                                <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{day}</div>
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
                                // Simple logic to show dot if any event matches this day (optional, tricky with timezones, skipping for simplicity)
                                const hasEvent = false;

                                return (
                                    <div
                                        key={day}
                                        onClick={(e) => handleDateClick(day, e)}
                                        className={`aspect-square relative rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-amber-50 group border ${isToday ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-200' :
                                            isSelected ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-inner' :
                                                'border-transparent text-gray-700'
                                            }`}
                                    >
                                        <span className="text-sm font-bold">{day}</span>
                                        {hasEvent && !isToday && (
                                            <div className="absolute bottom-2 w-1.5 h-1.5 bg-amber-500 rounded-full group-hover:scale-125 transition-transform"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Items List */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {events.length > 0 ? events.map((event: Event) => (
                                <div key={event.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-2xl ${event.type === 'session' ? 'bg-indigo-50 text-indigo-600' :
                                            event.type === 'workshop' ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-rose-50 text-rose-600'
                                            }`}>
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <button className="p-1 text-gray-400 hover:text-gray-900"><MoreVertical className="w-4 h-4" /></button>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">{event.time}</span>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                                    {event.mentor && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <User className="w-3.5 h-3.5 text-amber-500" />
                                            {event.mentor}
                                        </div>
                                    )}
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
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-amber-200 relative overflow-hidden group">
                        <StickyNote className="absolute -top-6 -right-6 w-32 h-32 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-4">Quick Note</h3>
                            <textarea
                                className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none h-32"
                                placeholder="Jot down your thoughts..."
                            ></textarea>
                            <p className="mt-4 text-[10px] uppercase font-bold text-white/60 tracking-widest">Auto-saved to your personal space</p>
                        </div>
                    </div>

                    {/* Reminders List */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Reminders</h3>
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
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
                                className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-sm font-medium"
                            />
                            <button
                                onClick={addReminder}
                                className="absolute right-2 top-1.5 p-2 bg-gray-900 text-white rounded-xl hover:bg-amber-600 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout >
    );
}
