import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ChevronLeft, ChevronRight, Plus, MapPin, Video, Users, Clock, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export function OrgCalendarPage() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        location: '',
        type: 'Meeting',
        description: ''
    });

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Fetch Events
    useEffect(() => {
        if (!user || !supabase) return;
        
        const fetchEvents = async () => {
            if (!supabase) return;
            setIsLoading(true);
            const { data, error } = await supabase
                .from('org_events')
                .select('*')
                .eq('org_id', user.id)
                .order('date', { ascending: true })
                .order('time', { ascending: true });
                
            if (error) {
                console.error("Error fetching events:", error);
                toast.error("Failed to load events.");
            } else {
                setEvents(data || []);
            }
            setIsLoading(false);
        };
        fetchEvents();
    }, [user, currentDate.getMonth(), currentDate.getFullYear()]);

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !supabase) return;
        if (!newEvent.title.trim() || !newEvent.date || !newEvent.time || !newEvent.location) {
            toast.error("Please fill all required fields.");
            return;
        }

        setIsSubmitting(true);
        const { data, error } = await supabase
            .from('org_events')
            .insert({
                org_id: user.id,
                title: newEvent.title,
                date: newEvent.date,
                time: newEvent.time,
                location: newEvent.location,
                type: newEvent.type,
                description: newEvent.description,
                status: 'Scheduled'
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating event:", error);
            toast.error("Failed to create event.");
        } else if (data) {
            toast.success("Event created successfully!");
            setEvents(prev => [...prev, data]);
            setIsModalOpen(false);
            setNewEvent({
                title: '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                location: '',
                type: 'Meeting',
                description: ''
            });
        }
        setIsSubmitting(false);
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const renderCalendarDays = () => {
        const days = [];
        const today = new Date();

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-gray-50/50 border border-gray-100/50"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = today.getDate() === i && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
            
            // Check for events on this day
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);

            days.push(
                <div key={i} className={`h-24 md:h-32 p-2 border border-gray-100 hover:bg-gray-50 transition-colors relative cursor-pointer flex flex-col ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium shrink-0 ${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700'}`}>
                        {i}
                    </span>
                    <div className="mt-1 flex-1 overflow-y-auto w-full space-y-1 pr-1" style={{ scrollbarWidth: 'none' }}>
                        {dayEvents.map(ev => (
                            <div key={ev.id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate ${
                                ev.type === 'Meeting' ? 'bg-blue-100 text-blue-700' : 
                                ev.type === 'Conference' ? 'bg-purple-100 text-purple-700' : 
                                'bg-amber-100 text-amber-700'
                            }`} title={ev.title}>
                                {ev.time.substring(0, 5)} {ev.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Organisation Calendar</h1>
                        <p className="text-gray-500">Schedule classes, staff meetings, and track academic events.</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                    >
                        <Plus className="w-5 h-5" />
                        New Event
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left: Calendar View */}
                    <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button onClick={prevMonth} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-bold text-gray-700">
                                    Today
                                </button>
                                <button onClick={nextMonth} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="py-3 text-center text-xs font-bold tracking-wider text-gray-500 uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 bg-gray-200 gap-[1px] flex-1">
                            {renderCalendarDays()}
                        </div>
                    </div>

                    {/* Right: Upcoming Events Sidebar */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden flex flex-col max-h-[600px]">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            Upcoming Events
                        </h2>

                        <div className="space-y-6 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
                            {isLoading ? (
                                <div className="flex justify-center items-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                                    No upcoming events scheduled.
                                </div>
                            ) : (
                                // Filter to show only future events logic could go here; just showing all fetched for now
                                events.map(event => (
                                    <div key={event.id} className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:rounded-full before:bg-indigo-500 pb-6 border-l-2 border-dashed border-gray-100 last:border-0 last:pb-0 font-sans">
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{event.title}</h4>
                                        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded inline-flex mb-2">
                                            {event.date === new Date().toISOString().split('T')[0] ? 'Today' : event.date} • {event.time.substring(0, 5)}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {event.location.includes('Zoom') || event.location.includes('Online') ? (
                                                <Video className="w-3.5 h-3.5" />
                                            ) : (
                                                <MapPin className="w-3.5 h-3.5" />
                                            )}
                                            {event.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {event.type}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for New Event */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-2 border border-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateEvent} className="p-6 overflow-y-auto space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                                    placeholder="e.g. Weekly Staff Meeting"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={newEvent.date}
                                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Time *</label>
                                    <input
                                        type="time"
                                        required
                                        value={newEvent.time}
                                        onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Location / Link *</label>
                                <input
                                    type="text"
                                    required
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                                    placeholder="Zoom Link or Room Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Type *</label>
                                <select
                                    value={newEvent.type}
                                    onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-700"
                                >
                                    <option value="Meeting">Meeting</option>
                                    <option value="Class">Class</option>
                                    <option value="Conference">Conference</option>
                                    <option value="Training">Training</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 resize-none"
                                    placeholder="Add any extra details..."
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Event"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default OrgCalendarPage;
