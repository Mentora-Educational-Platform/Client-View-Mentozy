import { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Search, Plus, UserCheck, UserX, Mail, MapPin, Briefcase } from 'lucide-react';

export function OrgTeachersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [teachers] = useState<any[]>([]);

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Staff & Teachers</h1>
                        <p className="text-gray-500">Manage all educators and staff members in your organisation.</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                        <Plus className="w-5 h-5" />
                        Add New Teacher
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-600" /> {teachers.filter(t => t.status === 'Active').length} Active
                        </span>
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <UserX className="w-4 h-4 text-amber-600" /> {teachers.filter(t => t.status !== 'Active').length} On Leave
                        </span>
                    </div>
                </div>

                {/* Teachers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                            No teachers or staff members found.
                        </div>
                    ) : (
                        filteredTeachers.map(teacher => (
                            <div key={teacher.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                {/* Decorative Banner */}
                                <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-indigo-50 to-blue-50/50"></div>

                                <div className="relative flex items-start justify-between mb-4">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-xl text-indigo-700 shadow-sm border-2 border-white">
                                            {teacher.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{teacher.name}</h3>
                                            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md mt-1 inline-block">
                                                {teacher.department}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        {teacher.role}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">{teacher.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        Joined {teacher.joinDate}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Classes</span>
                                        <span className="font-bold text-gray-900">{teacher.classes} Active</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${teacher.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                                        }`}>
                                        {teacher.status}
                                    </span>
                                </div>

                                {/* Hover Actions Overlay */}
                                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-lg text-sm hover:bg-indigo-200 transition-colors">
                                        View Profile
                                    </button>
                                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                        Message
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

export default OrgTeachersPage;
