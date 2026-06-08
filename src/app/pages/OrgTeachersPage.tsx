import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Search, Plus, UserCheck, UserX, Mail, MapPin, Briefcase, X, Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getOrgTeachers, searchMentorsForOrg, sendOrgMentorInvite, Profile } from '../../lib/api';

export function OrgTeachersPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mentorSearchQuery, setMentorSearchQuery] = useState('');
    const [mentorResults, setMentorResults] = useState<Profile[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        async function loadTeachers() {
            if (user) {
                setIsLoading(true);
                const data = await getOrgTeachers(user.id);
                setTeachers(data);
                setIsLoading(false);
            }
        }
        loadTeachers();
    }, [user]);

    // Mentor Search Effect
    useEffect(() => {
        if (mentorSearchQuery.length < 2) {
            setMentorResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchMentorsForOrg(mentorSearchQuery);
            // Filter out ones already in teachers list
            const existingIds = teachers.map(t => t.mentor_id);
            setMentorResults(results.filter(r => !existingIds.includes(r.id)));
            setIsSearching(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [mentorSearchQuery, teachers]);

    const filteredTeachers = teachers.filter(teacher =>
        (teacher.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMentorInvite = async (mentor: Profile) => {
        if (!user) return;
        try {
            setIsSubmitting(true);
            const success = await sendOrgMentorInvite(user.id, mentor.id);
            if (success) {
                toast.success(`Invitation sent successfully to ${mentor.full_name}!`);
                setIsModalOpen(false);
                setMentorSearchQuery('');
                setMentorResults([]);
            } else {
                toast.error("Failed to send invite. Maybe they are already invited?");
            }
        } catch (err: any) {
            console.error("Invite Error", err);
            toast.error(err.message || "Failed to send invitation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="font-mono text-gray-900 min-h-screen bg-[#FAF9F6] p-4 sm:p-8 rounded-3xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-gray-900 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Staff & Teachers</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Manage all educators and staff members in your organisation.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Invite New Teacher
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-900 rounded-xl bg-[#FAF9F6] outline-none font-bold text-gray-905 focus:bg-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs font-bold text-gray-700 bg-white border-2 border-gray-900 px-3 py-2 rounded-xl flex items-center gap-2 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                            <UserCheck className="w-4 h-4 text-green-600" /> {teachers.filter(t => t.status === 'Active').length} Active
                        </span>
                        <span className="text-xs font-bold text-gray-700 bg-white border-2 border-gray-900 px-3 py-2 rounded-xl flex items-center gap-2 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                            <UserX className="w-4 h-4 text-amber-600" /> {teachers.filter(t => t.status !== 'Active').length} On Leave
                        </span>
                    </div>
                </div>

                {/* Teachers Grid */}
                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeachers.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-400 font-bold italic border-2 border-dashed border-gray-300 rounded-2xl bg-white">
                                {searchTerm ? "No teachers found matching your search." : "No teachers or staff members found. Invite your first teacher!"}
                            </div>
                        ) : (
                            filteredTeachers.map(teacher => (
                                <div key={teacher.id} className="bg-white rounded-3xl p-6 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all relative overflow-hidden group">
                                    {/* Decorative Banner */}
                                    <div className="absolute top-0 left-0 w-full h-16 bg-[#E0F2FE] border-b-2 border-gray-900"></div>

                                    <div className="relative flex items-start justify-between mb-4 mt-8">
                                        <div className="flex gap-4 items-center">
                                            {teacher.avatar ? (
                                                <img src={teacher.avatar} alt={teacher.name} className="w-16 h-16 rounded-full shadow-sm border-2 border-gray-900 object-cover" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-indigo-150 border-2 border-gray-900 flex items-center justify-center font-black text-xl text-indigo-850 shadow-sm">
                                                    {(teacher.name || 'U').charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-black text-gray-900 text-md leading-tight">{teacher.name}</h3>
                                                <span className="text-[10px] font-extrabold bg-[#F3E8FF] border border-purple-250 text-purple-950 px-2 py-0.5 rounded-lg mt-1.5 inline-block shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                    {teacher.department || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-605">
                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                            {teacher.role}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-605">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="truncate">{teacher.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-605">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            Joined {teacher.joinDate}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-900">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black">Classes</span>
                                            <span className="font-extrabold text-sm text-gray-900">{teacher.classes || 0} Active</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg border-2 border-gray-900 text-xs font-black shadow-[1px_1px_0px_rgba(0,0,0,1)] ${teacher.status === 'Active' ? 'bg-[#DCFCE7] text-green-800' : 'bg-[#FEF3C7] text-amber-800'
                                            }`}>
                                            {teacher.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Invite Teacher Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity font-mono">
                    <div className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-md shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col text-left">
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                <Plus className="w-5 h-5 text-[#5763f6]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Invite Instructor</h2>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-gray-550 font-bold uppercase tracking-wider">
                                Search for a registered mentor on Mentozy to invite them to your organisation.
                            </p>

                            <div>
                                <label className="block text-xs font-black text-gray-550 uppercase tracking-widest pl-1 mb-1.5">Search Mentor by Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={mentorSearchQuery}
                                        onChange={e => setMentorSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-900 rounded-xl focus:ring-2 focus:ring-blue-150 bg-white font-bold pl-10"
                                        placeholder="Type name (e.g. John Doe)..."
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {isSearching ? <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" /> : <Search className="h-5 w-5 text-gray-400" />}
                                    </div>
                                </div>
                            </div>

                            {/* Search Results */}
                            {mentorSearchQuery.length >= 2 && (
                                <div className="mt-4 space-y-2">
                                    <h3 className="text-xs font-black text-gray-450 uppercase tracking-widest pl-1">Results</h3>
                                    {isSearching ? (
                                        <div className="text-xs text-gray-400 font-bold flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Searching...
                                        </div>
                                    ) : mentorResults.length === 0 ? (
                                        <div className="text-xs text-gray-400 font-bold italic py-3 bg-white border-2 border-gray-900 rounded-xl px-4 shadow-inner">
                                            No mentors found matching "{mentorSearchQuery}".
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {mentorResults.map(mentor => (
                                                <div key={mentor.id} className="flex items-center justify-between p-3 border-2 border-gray-900 rounded-xl bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                                    <div className="flex items-center gap-3">
                                                        {mentor.avatar_url ? (
                                                            <img src={mentor.avatar_url} alt={mentor.full_name} className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-300" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-gray-900 text-indigo-600 flex items-center justify-center font-bold">
                                                                {mentor.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-extrabold text-gray-900 text-sm">{mentor.full_name}</div>
                                                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{mentor.role || 'Mentor'}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSendMentorInvite(mentor)}
                                                        disabled={isSubmitting}
                                                        className="px-4 py-2 bg-[#818CF8] text-white border-2 border-gray-900 font-bold rounded-xl text-xs hover:bg-indigo-650 transition-colors disabled:opacity-50 shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                                                    >
                                                        Invite
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default OrgTeachersPage;
