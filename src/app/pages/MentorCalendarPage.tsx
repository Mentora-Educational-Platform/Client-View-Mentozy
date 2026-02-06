import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { getMentorBookings, Booking } from '../../lib/api';

export function MentorCalendarPage() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // Derived state for calendar grid
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calendar Navigation
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    useEffect(() => {
        if (user) {
            getMentorBookings(user.id).then(setBookings).catch(console.error);
        }
    }, [user]);

    const getBookingsForDate = (date: Date) => {
        return bookings.filter(b => isSameDay(parseISO(b.scheduled_at), date));
    };

    const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex gap-8">

                {/* Left Panel: Calendar Grid */}
                <div className="flex-1 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">{format(currentDate, 'MMMM yyyy')}</h2>
                            <p className="text-gray-500 font-medium">Manage your availability and sessions.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors">
                                Today
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-2">
                        {/* Empty cells for padding start of month */}
                        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}

                        {daysInMonth.map(day => {
                            const dayBookings = getBookingsForDate(day);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isCurrentDay = isToday(day);

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        relative rounded-2xl p-2 flex flex-col items-center justify-center transition-all group
                                        ${isSelected ? 'bg-gray-900 text-white shadow-lg' : 'hover:bg-gray-50 text-gray-700'}
                                        ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isCurrentDay && !isSelected ? 'text-indigo-600' : ''}`}>
                                        {format(day, 'd')}
                                    </span>

                                    {/* Indicators */}
                                    <div className="flex gap-1 mt-1 h-1.5">
                                        {dayBookings.slice(0, 3).map((b, i) => (
                                            <div
                                                key={i}
                                                className={`w-1.5 h-1.5 rounded-full ${b.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                            />
                                        ))}
                                        {dayBookings.length > 3 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: Daily Schedule */}
                <div className="w-96 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}
                            </h3>
                            <p className="text-sm font-bold text-gray-400">
                                {selectedDateBookings.length} sessions scheduled
                            </p>
                        </div>
                        <button onClick={() => toast.info("Add event dialog coming soon")} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {selectedDateBookings.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-300 space-y-4">
                                <CalendarIcon className="w-16 h-16 opacity-20" />
                                <p className="font-medium">No sessions scheduled<br />for this day</p>
                            </div>
                        ) : (
                            selectedDateBookings.map(booking => (
                                <div key={booking.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group hover:border-indigo-100 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg text-xs font-bold text-gray-600 shadow-sm">
                                            <Clock className="w-3 h-3 text-indigo-500" />
                                            {format(parseISO(booking.scheduled_at), 'h:mm a')}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                            booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-gray-200 text-gray-600'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">Session with Student</h4>
                                    <p className="text-xs text-gray-500 font-medium mb-3">Topic discussion & Mentoring</p>

                                    <div className="flex gap-2">
                                        <button onClick={() => toast.info("Rescheduling feature coming soon")} className="flex-1 py-1.5 bg-white text-gray-700 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                            Reschedule
                                        </button>
                                        <button onClick={() => toast.info("Cancellation feature coming soon")} className="py-1.5 px-3 bg-white text-rose-500 rounded-lg border border-gray-200 hover:bg-rose-50 hover:border-rose-100 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
