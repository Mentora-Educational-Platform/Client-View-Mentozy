import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMentorCreatedCourses, Track } from '../../lib/api';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { BookOpen, Clock, Edit, FileText, Globe, Loader2, Plus } from 'lucide-react';

export function MentorCoursesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'published' | 'draft'>('published');

    useEffect(() => {
        async function fetchCourses() {
            if (!user) {
                navigate('/login');
                return;
            }
            try {
                const data = await getMentorCreatedCourses(user.id);
                setCourses(data);
            } catch (e) {
                console.error("Failed to load mentor courses", e);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, [user, navigate]);

    const displayCourses = courses.filter(c => c.status === activeTab);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            My Courses
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">Manage your published tracks and unfinished drafts.</p>
                    </div>
                    <button
                        onClick={() => navigate('/create-course')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Course
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('published')}
                        className={`pb-4 font-bold text-lg flex items-center gap-2 transition-all ${activeTab === 'published' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <Globe className="w-5 h-5" />
                        Published <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{courses.filter(c => c.status === 'published').length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('draft')}
                        className={`pb-4 font-bold text-lg flex items-center gap-2 transition-all ${activeTab === 'draft' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <FileText className="w-5 h-5" />
                        Drafts <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{courses.filter(c => c.status === 'draft').length}</span>
                    </button>
                </div>

                {/* Course Grid */}
                {displayCourses.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            {activeTab === 'published' ? <Globe className="w-10 h-10 text-gray-300" /> : <FileText className="w-10 h-10 text-gray-300" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} courses found</h3>
                        <p className="text-gray-500 max-w-md">
                            {activeTab === 'published'
                                ? "You haven't published any courses yet. Start creating your first learning track to share with students!"
                                : "You don't have any drafts in progress. Keep up the good work!"}
                        </p>
                        {activeTab === 'published' && (
                            <button
                                onClick={() => navigate('/create-course')}
                                className="mt-6 text-blue-600 font-bold hover:underline"
                            >
                                Start Creating Now →
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {course.image_url ? (
                                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                            <BookOpen className="w-12 h-12 text-blue-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${activeTab === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {activeTab === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{course.level}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {course.duration}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{course.description}</p>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                            <BookOpen className="w-4 h-4" />
                                            {course.modules?.length || 0} Modules
                                        </div>
                                        <button
                                            onClick={() => navigate(`/create-course?edit=${course.id}`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Course"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
