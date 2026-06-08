import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Search, Filter, MoreVertical, Mail, GraduationCap, CheckCircle2, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getOrgStudents, searchStudentsForOrg, sendOrgStudentInvite, Profile } from '../../lib/api';

export function OrgStudentsPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('All');
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [studentResults, setStudentResults] = useState<Profile[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        async function loadStudents() {
            if (user) {
                setIsLoading(true);
                const data = await getOrgStudents(user.id);
                setStudents(data);
                setIsLoading(false);
            }
        }
        loadStudents();
    }, [user]);

    // Student Search Effect
    useEffect(() => {
        if (studentSearchQuery.length < 2) {
            setStudentResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            const results = await searchStudentsForOrg(studentSearchQuery);
            // Filter out ones already in students list
            const existingIds = students.map(s => s.student_id);
            setStudentResults(results.filter(r => !existingIds.includes(r.id)));
            setIsSearching(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [studentSearchQuery, students]);

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = filterGrade === 'All' || student.grade === filterGrade;
        return matchesSearch && matchesGrade;
    });

    const grades = ['All', ...Array.from(new Set(students.map(s => s.grade))).sort()];

    const handleSendStudentInvite = async (student: Profile) => {
        if (!user) return;
        try {
            setIsSubmitting(true);
            const success = await sendOrgStudentInvite(user.id, student.id);
            if (success) {
                toast.success(`Invitation sent successfully to ${student.full_name}!`);
                setIsModalOpen(false);
                setStudentSearchQuery('');
                setStudentResults([]);
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
                        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Students Directory</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Manage and view all students enrolled in your organisation.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Invite New Student
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-900 rounded-xl bg-[#FAF9F6] outline-none font-bold text-gray-905 focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl text-xs font-bold text-gray-700">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filterGrade}
                                onChange={(e) => setFilterGrade(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 cursor-pointer outline-none font-bold"
                            >
                                {grades.map(grade => (
                                    <option key={grade} value={grade}>{grade}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="bg-white border-2 border-gray-900 rounded-3xl overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF9F6] border-b-2 border-gray-900">
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider">Student Name</th>
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider">Grade</th>
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider">Joined Date</th>
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider">Performance</th>
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-6 text-xs font-black text-gray-650 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-gray-900">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        {student.avatar ? (
                                                            <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-900" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-gray-900 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-extrabold text-gray-900">{student.name}</p>
                                                            <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                                                <Mail className="w-3 h-3" /> {student.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-extrabold bg-[#F3E8FF] border border-purple-200 text-purple-950 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                        <GraduationCap className="w-3.5 h-3.5" />
                                                        {student.grade}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm font-bold text-gray-600">
                                                    {student.joinDate}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl border-2 border-gray-900 font-black text-xs shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] ${student.performance.startsWith('A') ? 'bg-[#DCFCE7] text-green-800' :
                                                        student.performance.startsWith('B') ? 'bg-[#EFF3FF] text-blue-800' :
                                                            'bg-[#FEF3C7] text-amber-800'
                                                        }`}>
                                                        {student.performance}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold border-2 border-gray-900 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] ${student.status === 'Active' ? 'bg-[#DCFCE7] text-green-800' : 'bg-gray-105 bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {student.status === 'Active' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg bg-white border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]" title="More options">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-gray-400 font-bold italic">
                                                {searchTerm ? "No students found matching your search." : "No students found. Invite your first student!"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Placeholder */}
                        <div className="p-4 border-t-2 border-gray-900 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <p>Showing {filteredStudents.length} students</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Invite Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity font-mono">
                    <div className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-md shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col">
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
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Invite Student</h2>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                Search for a registered student on Mentozy to invite them to your organisation.
                            </p>

                            <div>
                                <label className="block text-xs font-black text-gray-550 uppercase tracking-widest pl-1 mb-1.5">Search Student by Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={studentSearchQuery}
                                        onChange={e => setStudentSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-900 rounded-xl focus:ring-2 focus:ring-blue-150 bg-white font-bold pl-10"
                                        placeholder="Type name (e.g. Jane Doe)..."
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {isSearching ? <Loader2 className="h-5 w-5 text-blue-500 animate-spin" /> : <Search className="h-5 w-5 text-gray-400" />}
                                    </div>
                                </div>
                            </div>

                            {/* Search Results */}
                            {studentSearchQuery.length >= 2 && (
                                <div className="mt-4 space-y-2">
                                    <h3 className="text-xs font-black text-gray-450 uppercase tracking-widest pl-1">Results</h3>
                                    {isSearching ? (
                                        <div className="text-sm text-gray-400 font-bold flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Searching...
                                        </div>
                                    ) : studentResults.length === 0 ? (
                                        <div className="text-xs text-gray-400 font-bold italic py-3 bg-white border-2 border-gray-900 rounded-xl px-4 shadow-inner">
                                            No students found matching "{studentSearchQuery}".
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {studentResults.map(student => (
                                                <div key={student.id} className="flex items-center justify-between p-3 border-2 border-gray-900 rounded-xl bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                                    <div className="flex items-center gap-3">
                                                        {student.avatar_url ? (
                                                            <img src={student.avatar_url} alt={student.full_name} className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-300" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-gray-900 text-blue-600 flex items-center justify-center font-bold">
                                                                {student.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-extrabold text-gray-900 text-sm">{student.full_name}</div>
                                                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{student.grade || 'Student'}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSendStudentInvite(student)}
                                                        disabled={isSubmitting}
                                                        className="px-4 py-2 bg-[#818CF8] text-white border-2 border-gray-900 font-bold rounded-xl text-xs hover:bg-indigo-600 transition-colors disabled:opacity-50 shadow-[1px_1px_0px_rgba(0,0,0,1)]"
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

export default OrgStudentsPage;

