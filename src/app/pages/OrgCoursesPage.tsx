import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Search, Plus, Star, Copy, Share2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function OrgCoursesPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [courses] = useState<any[]>([]);

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="font-mono text-gray-900 min-h-screen bg-[#FAF9F6] p-4 sm:p-8 rounded-3xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-gray-900 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Course Management</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Oversee all courses, curriculums, and track enrollments.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/org-create-course')}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Course
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
                            placeholder="Search courses or instructors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-900 rounded-xl bg-[#FAF9F6] outline-none font-bold text-gray-905 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-400 font-bold italic border-2 border-dashed border-gray-300 rounded-2xl bg-white">
                            No courses found.
                        </div>
                    ) : (
                        filteredCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-3xl overflow-hidden border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all group flex flex-col">
                                {/* Course Image Placeholder */}
                                <div className="h-40 bg-[#E0F2FE] relative overflow-hidden border-b-2 border-gray-900">
                                    <div className="absolute top-4 right-4">
                                        <span className="px-2.5 py-1 text-xs font-black uppercase border-2 border-gray-900 rounded-lg bg-white shadow-[1px_1px_0px_rgba(0,0,0,1)] text-gray-900">
                                            {course.status}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-gray-900">
                                        <h3 className="font-black text-lg uppercase leading-tight truncate">{course.title}</h3>
                                    </div>
                                </div>

                                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                                    <div>
                                        <p className="text-[10px] text-gray-450 uppercase font-black tracking-widest mb-1.5">Taught by</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-[#F3E8FF] border-2 border-gray-900 text-purple-950 flex items-center justify-center text-[10px] font-black">
                                                {course.instructor.charAt(0)}
                                            </div>
                                            <p className="font-extrabold text-gray-900 text-sm">{course.instructor}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-900">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black">Students</span>
                                            <span className="font-extrabold text-sm text-gray-900">{course.students} enrolled</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <Star className={`w-4 h-4 ${course.rating > 0 ? 'fill-amber-400 text-amber-500' : 'text-gray-300'}`} />
                                                <span className="font-black text-sm text-gray-900">{course.rating > 0 ? course.rating : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="bg-[#FAF9F6] p-3 flex justify-between items-center border-t-2 border-gray-900">
                                    <div className="flex gap-2">
                                        <button className="p-2 text-gray-500 hover:text-indigo-650 rounded-lg bg-white border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]" title="Copy Link">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-500 hover:text-indigo-650 rounded-lg bg-white border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]" title="Share">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button className="p-2 text-gray-500 hover:text-indigo-650 rounded-lg bg-white border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
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
