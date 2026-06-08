import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Calendar, Users, MapPin, Video, Search, Filter } from 'lucide-react';
import { useState } from 'react';

export function OrgEventsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [events] = useState<any[]>([]);

    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <DashboardLayout>
            <div className="font-mono text-gray-900 space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#eff3ff] border-4 border-gray-900 p-6 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Events Directory</h1>
                        <p className="text-sm font-bold text-gray-700 mt-2">View and manage all upcoming conferences, trainings, and physical events.</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-5 border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="w-5 h-5 text-gray-900 absolute left-3 top-3.5" />
                        <input
                            type="text"
                            placeholder="Search events by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-900 bg-[#FAF9F6] focus:outline-none focus:bg-[#eff3ff] text-sm font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                        />
                    </div>
                    <button className="flex gap-2 text-xs font-black text-gray-900 bg-[#eff3ff] border-2 border-gray-900 px-4 py-2.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] items-center uppercase active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                        <Filter className="w-4 h-4" /> Filter Events
                    </button>
                </div>

                {/* Events List */}
                <div className="bg-white border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {filteredEvents.length === 0 ? (
                        <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-wider">
                            No events currently scheduled.
                        </div>
                    ) : (
                        <div className="divide-y-4 divide-gray-900">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#eff3ff]/10 transition-colors">

                                    <div className="flex gap-6 w-full lg:w-2/3">
                                        <div className="hidden sm:flex flex-col items-center justify-center p-4 bg-[#eff3ff] border-2 border-gray-900 text-gray-900 min-w-[90px] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="text-3xl font-black mt-1">{new Date(event.date).getDate()}</span>
                                        </div>
                                        <div className="space-y-3 flex-1">
                                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{event.title}</h3>
                                            <p className="text-xs text-gray-700 font-bold leading-relaxed">{event.description}</p>

                                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black tracking-wider uppercase text-gray-900 pt-2">
                                                <div className="flex items-center gap-1.5 bg-[#FAF9F6] border-2 border-gray-900 px-3 py-1 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                    <Calendar className="w-3.5 h-3.5" /> {event.date}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-[#FAF9F6] border-2 border-gray-900 px-3 py-1 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                    <Users className="w-3.5 h-3.5" /> {event.type}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-[#FAF9F6] border-2 border-gray-900 px-3 py-1 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                    {event.location.includes('Online') || event.location.includes('Zoom') ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                                    {event.location}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start lg:items-end gap-3 lg:w-1/3">
                                        <span className={`px-3 py-1 border-2 border-gray-900 text-[10px] font-black uppercase tracking-widest shadow-[1px_1px_0px_rgba(0,0,0,1)] ${
                                            event.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                                            event.status === 'Scheduled' || event.status === 'Upcoming' ? 'bg-[#DCFCE7] text-green-800 border-green-900' :
                                            'bg-[#FEF3C7] text-amber-800 border-amber-900'
                                        }`}>
                                            {event.status}
                                        </span>
                                        <button className="px-5 py-2.5 w-full lg:w-auto border-2 border-gray-900 text-gray-900 bg-white font-black text-xs hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                            MANAGE EVENT
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}

export default OrgEventsPage;

