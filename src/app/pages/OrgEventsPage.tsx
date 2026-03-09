import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Calendar, Users, MapPin, Video, Search, Filter } from 'lucide-react';
import { useState } from 'react';

export function OrgEventsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [events] = useState<any[]>([]);

    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col flex-wrap md:flex-nowrap md:items-center justify-between gap-4">
                    <div className="w-full md:w-auto">
                        <h1 className="text-2xl font-bold text-gray-900">Events Directory</h1>
                        <p className="text-gray-500">View and manage all upcoming conferences, trainings, and physical events.</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search events by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium items-center">
                        <Filter className="w-4 h-4" /> Filter Events
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                    {filteredEvents.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            No events currently scheduled.
                        </div>
                    ) : (
                        filteredEvents.map((event, i) => (
                            <div key={event.id} className={`p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-gray-50 transition-colors ${i === filteredEvents.length - 1 ? 'border-b-0' : ''}`}>

                                <div className="flex gap-6 w-full lg:w-2/3">
                                    <div className="hidden sm:flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-2xl text-indigo-700 min-w-[80px]">
                                        <span className="text-xs font-bold uppercase tracking-wider">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                        <span className="text-2xl font-black">{new Date(event.date).getDate()}</span>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{event.description}</p>

                                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 pt-2">
                                            <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                                                <Calendar className="w-3.5 h-3.5" /> {event.date}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                                                <Users className="w-3.5 h-3.5" /> {event.type.toUpperCase()}
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                                                {event.location.includes('Online') || event.location.includes('Zoom') ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                                {event.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start lg:items-end gap-3 lg:w-1/3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                                        event.status === 'Scheduled' || event.status === 'Upcoming' ? 'bg-green-100 text-green-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {event.status}
                                    </span>
                                    <button className="px-5 py-2 w-full lg:w-auto border border-gray-200 text-gray-700 bg-white font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors">
                                        Manage Event
                                    </button>
                                </div>

                            </div>
                        ))
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}

export default OrgEventsPage;
