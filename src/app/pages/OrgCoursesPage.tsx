import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Search, Plus, Star, Copy, Share2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export function OrgCoursesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [courses] = useState<any[]>([]);

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
                        <p className="text-gray-500">Oversee all courses, curriculums, and track enrollments.</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                        <Plus className="w-5 h-5" />
                        Create Course
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
                            placeholder="Search courses or instructors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                            No courses found.
                        </div>
                    ) : (
                        filteredCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
                                {/* Course Image Placeholder */}
                                <div className="h-40 bg-gray-200 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${course.status === 'Published' ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
                                            }`}>
                                            {course.status}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <h3 className="font-bold text-lg leading-tight truncate">{course.title}</h3>
                                    </div>
                                </div>

                                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Taught by</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                                {course.instructor.charAt(0)}
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm">{course.instructor}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Students</span>
                                            <span className="font-bold text-gray-900">{course.students} enrolled</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <Star className={`w-4 h-4 ${course.rating > 0 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                                <span className="font-bold text-gray-900">{course.rating > 0 ? course.rating : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="bg-gray-50 p-3 flex justify-between items-center border-t border-gray-100">
                                    <div className="flex gap-2">
                                        <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Copy Link">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Share">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <MoreVertical className="w-4 h-4" />
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

export default OrgCoursesPage;
