import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { 
  Search, Plus, Star, Copy, Share2, MoreVertical, 
  Clock, BarChart, BookOpen, Layers, PlayCircle, FileText, 
  HelpCircle, ChevronRight, X, Sparkles, DollarSign, Users, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { getTracks, Track } from '../../lib/api';

const MOCK_COURSES = [
  {
    id: 101,
    title: "Introduction to Javascript ES6",
    level: "Beginner",
    duration: "4 Weeks",
    instructor: "Sarah Jenkins",
    students: 154,
    rating: 4.8,
    status: "published",
    price: 49,
    description: "Learn the fundamentals of JavaScript, including modern ES6 features, functions, loops, and async operations.",
    modules: [
      {
        title: "Module 1: Getting Started",
        lessons: [
          { title: "Introduction to JS Console", duration: "10 mins" },
          { title: "Variables & Data Types", duration: "15 mins" },
          { title: "Conditionals & Logic", duration: "12 mins" }
        ]
      },
      {
        title: "Module 2: Advanced Control Flow",
        lessons: [
          { title: "For and While Loops", duration: "15 mins" },
          { title: "Array Iteration Methods", duration: "20 mins" },
          { title: "Functions & Scope", duration: "18 mins" }
        ]
      }
    ]
  },
  {
    id: 102,
    title: "React Web App Development",
    level: "Intermediate",
    duration: "6 Weeks",
    instructor: "Alex Rivera",
    students: 312,
    rating: 4.9,
    status: "published",
    price: 79,
    description: "Build interactive single-page web applications using React. Covers components, hooks, state, and routing.",
    modules: [
      {
        title: "Module 1: React Fundamentals",
        lessons: [
          { title: "Understanding JSX", duration: "15 mins" },
          { title: "Creating Components", duration: "20 mins" },
          { title: "Props and State Basics", duration: "25 mins" }
        ]
      },
      {
        title: "Module 2: Advanced React Hooks",
        lessons: [
          { title: "Deep Dive into useEffect", duration: "30 mins" },
          { title: "Custom Hooks Patterns", duration: "25 mins" },
          { title: "Context API for State", duration: "35 mins" }
        ]
      }
    ]
  },
  {
    id: 103,
    title: "UI/UX & Neo-Brutalist Styling",
    level: "All Levels",
    duration: "3 Weeks",
    instructor: "Emma Watson",
    students: 98,
    rating: 4.7,
    status: "draft",
    price: 29,
    description: "Master the art of modern web aesthetics. Learn HSL coloring, grid systems, micro-animations, and flat shadows.",
    modules: [
      {
        title: "Module 1: Neo-Brutalist Layouts",
        lessons: [
          { title: "Typography and Line Heights", duration: "12 mins" },
          { title: "Designing Hard Shadows", duration: "15 mins" },
          { title: "High Contrast Color Palettes", duration: "18 mins" }
        ]
      }
    ]
  }
];

export function OrgCoursesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const tracks = await getTracks();
        if (tracks && tracks.length > 0) {
          // Merge Supabase tracks with mock details to present a complete database-driven catalog
          const merged = tracks.map((t: Track) => {
            const mockMatch = MOCK_COURSES.find(mc => mc.title.toLowerCase() === t.title.toLowerCase());
            return {
              id: t.id,
              title: t.title,
              level: t.level || 'All Levels',
              duration: t.duration || '4 Weeks',
              instructor: mockMatch?.instructor || 'Admin Instructor',
              students: mockMatch?.students || Math.floor(Math.random() * 50) + 10,
              rating: mockMatch?.rating || 4.5,
              status: t.status || 'published',
              price: t.price || mockMatch?.price || 0,
              description: t.description || 'No description provided.',
              modules: t.modules && t.modules.length > 0 ? t.modules : (mockMatch?.modules || [])
            };
          });
          setCourses(merged);
        } else {
          setCourses(MOCK_COURSES);
        }
      } catch (err) {
        console.error("Failed to load courses from Supabase", err);
        setCourses(MOCK_COURSES);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyLink = (courseId: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/learn/${courseId}`);
    toast.success("Course link copied to clipboard!");
  };

  return (
    <DashboardLayout>
      <div className="font-mono text-gray-900 min-h-screen bg-[#FAF9F6] p-4 sm:p-8 rounded-3xl border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] select-none">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-gray-900 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-[#818CF8]" />
              Course Catalog
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
              Coursera-like dashboard featuring published curriculums, modules, and lessons.
            </p>
          </div>
          <button 
            onClick={() => navigate('/org-create-course')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            CREATE COURSE
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-900 rounded-xl bg-[#FAF9F6] outline-none font-bold text-gray-900 focus:bg-white text-xs"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-400 font-bold italic border-4 border-dashed border-gray-300 rounded-3xl bg-white">
                No published courses found.
              </div>
            ) : (
              filteredCourses.map(course => (
                <div 
                  key={course.id} 
                  className="bg-white rounded-3xl overflow-hidden border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all group flex flex-col"
                >
                  {/* Course Header Banner */}
                  <div className="h-36 bg-[#E0F2FE] relative overflow-hidden border-b-4 border-gray-900 p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 text-[9px] font-black uppercase border-2 border-gray-900 rounded-lg bg-white shadow-[1px_1px_0px_rgba(0,0,0,1)] text-gray-900">
                        {course.status}
                      </span>
                      <span className="px-2.5 py-1 text-[9px] font-black uppercase border-2 border-gray-900 rounded-lg bg-[#FFD166] shadow-[1px_1px_0px_rgba(0,0,0,1)] text-gray-900 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        {course.rating}
                      </span>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 text-[8px] font-extrabold uppercase border border-gray-900 rounded-md bg-[#06D6A0] text-black">
                        {course.level}
                      </span>
                      <h3 className="font-black text-base uppercase leading-tight truncate mt-1 text-gray-900">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  {/* Course Details Panel */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <p className="text-[11px] text-gray-600 line-clamp-3 leading-relaxed font-sans">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 bg-[#FAF9F6] p-3 rounded-2xl border-2 border-gray-900 text-[10px]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{course.modules?.length || 0} Modules</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{course.students} Enrolled</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-6 h-6 rounded-lg bg-[#F3E8FF] border-2 border-gray-900 text-purple-950 flex items-center justify-center text-[10px] font-black">
                        {course.instructor.charAt(0)}
                      </div>
                      <p className="font-extrabold text-gray-900 text-xs truncate">Taught by {course.instructor}</p>
                    </div>
                  </div>

                  {/* Actions & Inspection Button */}
                  <div className="bg-[#FAF9F6] p-4 flex justify-between items-center border-t-4 border-gray-900 gap-2 shrink-0">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCopyLink(course.id)}
                        className="p-2 text-gray-700 hover:bg-[#818CF8]/10 hover:text-[#818CF8] rounded-xl bg-white border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer" 
                        title="Copy Student Invite Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => setSelectedCourse(course)}
                      className="px-4 py-2 flex items-center gap-1.5 bg-[#06D6A0] text-black font-extrabold rounded-xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-[10px] cursor-pointer"
                    >
                      SYLLABUS
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Detailed Syllabus Inspector Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#FAF9F6] border-4 border-gray-900 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[8px_8px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-5 border-b-4 border-gray-900 flex justify-between items-center bg-[#E0F2FE]">
                <div>
                  <span className="px-2 py-0.5 text-[8px] font-extrabold uppercase border border-gray-900 rounded-md bg-[#FFD166] text-black">
                    {selectedCourse.level}
                  </span>
                  <h2 className="font-black text-lg text-gray-900 uppercase tracking-tight mt-1">{selectedCourse.title} Syllabus</h2>
                </div>
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 bg-white hover:bg-red-50 hover:text-red-500 rounded-xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 text-black stroke-[3px]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Description</h4>
                  <p className="text-xs text-gray-750 font-sans leading-relaxed bg-white border-2 border-gray-900 p-4 rounded-2xl">
                    {selectedCourse.description}
                  </p>
                </div>

                {/* Modules & Lessons */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Curriculum Structure</h4>
                  
                  {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
                    selectedCourse.modules.map((mod: any, mIdx: number) => {
                      const lessons = mod.lessons || mod.content?.lessons || [];
                      return (
                        <div key={mIdx} className="bg-white border-2 border-gray-900 rounded-2xl overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          {/* Module title header */}
                          <div className="bg-[#FAF9F6] border-b-2 border-gray-900 p-3 flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full border-2 border-gray-900 bg-[#818CF8] text-white flex items-center justify-center font-black text-[10px]">
                              {mIdx + 1}
                            </span>
                            <span className="font-black text-xs uppercase tracking-tight text-gray-900">
                              {mod.title || 'Untitled Module'}
                            </span>
                          </div>

                          {/* Lessons list */}
                          <div className="divide-y-2 divide-gray-100">
                            {lessons.length > 0 ? (
                              lessons.map((lesson: any, lIdx: number) => (
                                <div key={lIdx} className="p-3 pl-6 flex items-center justify-between hover:bg-gray-50/50">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {lesson.videoLink ? (
                                      <PlayCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                    )}
                                    <span className="font-extrabold text-[11px] text-gray-700 truncate">
                                      {lesson.title || `Lesson ${lIdx + 1}`}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase font-mono shrink-0">
                                    {lesson.duration || '10 mins'}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-[10px] text-gray-450 italic text-center">
                                No lessons added for this module.
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-6 text-center text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-2xl">
                      No modules added for this course catalog.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t-4 border-gray-900 bg-[#FAF9F6] flex justify-between items-center rounded-b-3xl">
                <span className="text-[10px] font-black uppercase text-gray-500">
                  Total modules: {selectedCourse.modules?.length || 0}
                </span>
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="px-5 py-2.5 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  CLOSE VIEW
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default OrgCoursesPage;
