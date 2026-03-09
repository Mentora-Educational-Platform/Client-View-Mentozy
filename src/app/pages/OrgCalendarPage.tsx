import { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ChevronLeft, ChevronRight, Plus, MapPin, Video, Users, Clock } from 'lucide-react';

export function OrgCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events] = useState<any[]>([]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Keep it simple, just highlight "today" and mock some event dots
    const renderCalendarDays = () => {
        const days = [];
        const today = new Date();

        // Empty cells before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-gray-50/50 border border-gray-100/50"></div>);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = today.getDate() === i && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

            // No mock events
            const hasEvent = false;

            days.push(
                <div key={i} className={`h-24 md:h-32 p-2 border border-gray-100 hover:bg-gray-50 transition-colors relative cursor-pointer ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700'}`}>
                        {i}
                    </span>
                    {hasEvent && (
                        <div className="mt-2 space-y-1">
                            <div className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded truncate"></div>
                        </div>
                    )}
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
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                        <Plus className="w-5 h-5" />
                        New Event
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left: Calendar View (Takes 3 columns) */}
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

                        {/* Days of week header */}
                        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="py-3 text-center text-xs font-bold tracking-wider text-gray-500 uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 bg-gray-200 gap-[1px] flex-1">
                            {renderCalendarDays()}
                        </div>
                    </div>

                    {/* Right: Upcoming Events Sidebar */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            Upcoming Events
                        </h2>

                        <div className="space-y-6">
                            {events.length === 0 ? (
                                <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                                    No upcoming events scheduled.
                                </div>
                            ) : (
                                events.map(event => (
                                    <div key={event.id} className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:rounded-full before:bg-indigo-500 pb-6 border-l-2 border-dashed border-gray-100 last:border-0 last:pb-0 font-sans">
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{event.title}</h4>
                                        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded inline-flex mb-2">
                                            {event.date === new Date().toISOString().split('T')[0] ? 'Today' : event.date} • {event.time}
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
        </DashboardLayout>
    );
}

export default OrgCalendarPage;
