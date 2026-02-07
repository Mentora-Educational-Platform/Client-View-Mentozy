import { useState, useEffect } from 'react';
import {
    BookOpen, Search, Filter, Clock, BarChart,
    ChevronRight, PlayCircle, MoreVertical, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Enrollment, getStudentEnrollments } from '../../lib/api';
import { Link } from 'react-router-dom';

export function CoursesPage() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        const loadEnrollments = async () => {
            if (!user) return;
            try {
                const data = await getStudentEnrollments(user.id);
                setEnrollments(data);
            } catch (error) {
                console.error("Failed to load enrollments", error);
            } finally {
                setLoading(false);
            }
        };
        loadEnrollments();
    }, [user]);

    const filteredEnrollments = enrollments.filter(e => {
        const matchesSearch = e.tracks?.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || e.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
                        <p className="text-gray-500 mt-1">Manage and continue your enrolled tracks.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                            />
                        </div>
                        <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                            {(['all', 'active', 'completed'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${filter === f
                                            ? 'bg-amber-100 text-amber-900'
                                            : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-4 animate-pulse">
                                <div className="h-40 bg-gray-50 rounded-2xl"></div>
                                <div className="h-6 bg-gray-50 rounded-lg w-3/4"></div>
                                <div className="h-4 bg-gray-50 rounded-lg w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredEnrollments.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEnrollments.map((enrollment) => (
                            <div key={enrollment.id} className="group bg-white rounded-[2rem] border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col relative overflow-hidden">
                                {/* Status Chip */}
                                <div className="absolute top-6 right-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${enrollment.status === 'completed'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                        }`}>
                                        {enrollment.status}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                        {enrollment.tracks?.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                                        {enrollment.tracks?.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            {enrollment.tracks?.duration}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                            <BarChart className="w-3.5 h-3.5" />
                                            {enrollment.tracks?.level}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-50">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-gray-400">Progress</span>
                                        <span className="text-indigo-600">{enrollment.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${enrollment.progress}%` }}
                                        ></div>
                                    </div>
                                    <Link
                                        to={`/tracks`}
                                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200"
                                    >
                                        <PlayCircle className="w-4 h-4" />
                                        {enrollment.status === 'completed' ? 'Review Content' : 'Continue Learning'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <BookOpen className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
                        <p className="text-gray-500 mb-8 max-w-xs text-center">
                            {searchQuery ? "We couldn't find any courses matching your search." : "You haven't enrolled in any tracks yet."}
                        </p>
                        <Link to="/tracks" className="px-8 py-3 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-xl shadow-amber-200">
                            Browse Library
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
