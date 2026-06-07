import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, ChevronRight, Clock, Calendar, Bell,
    GraduationCap, Building2, Users, CheckCircle2,
    TrendingUp, Award, HelpCircle, Dna, FlaskConical, 
    Calculator, Atom, Briefcase, Plus, CheckSquare, 
    CalendarRange, FileText, Check, Dumbbell, Sparkles, Pin, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useOrganizationMode } from '../../../context/OrganizationModeContext';
import { getStudentEnrollments, getStudentBookings, Enrollment, Booking } from '../../../lib/api';
import { getSupabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface Submission {
    task_id: string;
    status: string;
}

export function OrgStudentDashboard() {
    const { user } = useAuth();
    const { activeOrganization } = useOrganizationMode();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [orgTasks, setOrgTasks] = useState<any[]>([]);
    const [orgTeachers, setOrgTeachers] = useState<any[]>([]);
    const [taskSubmissions, setTaskSubmissions] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const orgName = activeOrganization?.name || 'Your Organization';
    const orgEmail = (activeOrganization as any)?.email || 'academy.support@krishnaite.dev';

    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [orgCourses, setOrgCourses] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id || !activeOrganization?.id) return;
            setLoading(true);
            try {
                const supabase = getSupabase();
                const bookingsData = await getStudentBookings(user.id);
                if (bookingsData) setBookings(bookingsData);

                if (supabase) {
                    // Fetch tasks
                    const { data: tasksData } = await supabase
                        .from('org_tasks')
                        .select('id, title, content, deadline, created_at')
                        .eq('org_id', activeOrganization.id)
                        .order('created_at', { ascending: false })
                        .limit(5);

                    if (tasksData) setOrgTasks(tasksData);

                    // Fetch submissions
                    try {
                        const { data: subData } = await supabase
                            .from('org_task_submissions')
                            .select('task_id, status')
                            .eq('student_id', user.id);
                        
                        if (subData) {
                            const mapping: Record<string, string> = {};
                            subData.forEach(sub => {
                                mapping[sub.task_id] = sub.status;
                            });
                            setTaskSubmissions(mapping);
                        }
                    } catch (subErr) {
                        console.warn('Could not query submissions for badges:', subErr);
                    }

                    // Fetch teachers
                    const { data: teachersData } = await supabase
                        .from('org_teachers')
                        .select('id, mentor:profiles!mentor_id(full_name, avatar_url)')
                        .eq('org_id', activeOrganization.id)
                        .eq('status', 'Active')
                        .limit(5);

                    if (teachersData) setOrgTeachers(teachersData);

                    // Fetch announcements
                    try {
                        const { data: annData } = await supabase
                            .from('org_announcements')
                            .select('id, title, content, created_at')
                            .eq('org_id', activeOrganization.id)
                            .order('created_at', { ascending: false })
                            .limit(3);
                        if (annData) setAnnouncements(annData);
                    } catch (annErr) {
                        console.warn('Could not query announcements for dashboard:', annErr);
                    }

                    // Fetch courses
                    try {
                        const { data: coursesData } = await supabase
                            .from('org_courses')
                            .select('id')
                            .eq('org_id', activeOrganization.id)
                            .limit(1);
                        if (coursesData) setOrgCourses(coursesData);
                    } catch (coursesErr) {
                        console.warn('Could not query courses for dashboard:', coursesErr);
                    }
                }
            } catch (e) {
                console.error('Error loading org student data:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.id, activeOrganization?.id]);

    // Calculate completions & progress from tasks
    const totalTasks = orgTasks.length;
    const completedTasksCount = Object.values(taskSubmissions).filter(status => status === 'passed').length;
    
    // Average completion progress based on task approvals
    const completionProgress = totalTasks > 0 
        ? Math.round((completedTasksCount / totalTasks) * 100) 
        : 0;

    // Helper to generate retro progress bar
    const getRetroProgressBar = (status: string | undefined) => {
        if (status === 'passed') return { bar: '██████████', pct: '100%' };
        if (status === 'pending') return { bar: '█████░░░░░', pct: '50%' };
        if (status === 'redo') return { bar: '██░░░░░░░░', pct: '20%' };
        return { bar: '░░░░░░░░░░', pct: '0%' };
    };

    // Card decorative templates
    const taskThemes = [
        { bg: 'bg-[#F3E8FF] dark:bg-purple-950/20', icon: Dna, color: 'text-purple-600 dark:text-purple-400', badgeBg: 'bg-purple-100/70 text-purple-700' },
        { bg: 'bg-[#DCFCE7] dark:bg-green-950/20', icon: FlaskConical, color: 'text-green-600 dark:text-green-400', badgeBg: 'bg-green-100/70 text-green-700' },
        { bg: 'bg-[#FFEDD5] dark:bg-orange-950/20', icon: Calculator, color: 'text-orange-600 dark:text-orange-400', badgeBg: 'bg-orange-100/70 text-orange-700' },
        { bg: 'bg-[#FEF9C3] dark:bg-yellow-950/20', icon: Atom, color: 'text-yellow-600 dark:text-yellow-400', badgeBg: 'bg-yellow-100/70 text-yellow-700' },
        { bg: 'bg-[#E0F2FE] dark:bg-blue-950/20', icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', badgeBg: 'bg-blue-100/70 text-blue-700' }
    ];

    const upcomingSessions = bookings.filter(b => b.status === 'confirmed');

    return (
        <div className="bg-[#FAF9F6] dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100 p-4 sm:p-8 font-mono select-none">
            
            {/* Top Workspace Identity block */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col items-center justify-between sm:flex-row border-b-2 border-gray-200 dark:border-gray-800 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    {/* SVG logo matching the retro pencil box in the screenshot */}
                    <div className="w-14 h-14 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-xl flex items-center justify-center p-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        <svg className="w-10 h-10 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                            <path d="M12 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor" />
                            <path d="M11 2.5a1 1 0 0 1 2 0" />
                            <path d="M12 7.5v-2" />
                            <path d="M6 9.5l0.5 0.5-0.5 0.5-0.5-0.5z" fill="currentColor" />
                            <path d="M18 9.5l0.5 0.5-0.5 0.5-0.5-0.5z" fill="currentColor" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Student Dashboard</h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Workspace: {orgName}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 px-3.5 py-1.5 rounded-lg font-bold">
                        Student View
                    </span>
                </div>
            </div>

            {/* Main Workspace Layout */}
            <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Tasks Section Styled like the Courses card in the screenshot */}
                    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                                Active Task Spaces
                            </h2>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Assigned Tasks</span>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-48 bg-gray-150 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : orgTasks.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {orgTasks.map((task: any, index: number) => {
                                    const status = taskSubmissions[task.id];
                                    const progressInfo = getRetroProgressBar(status);
                                    
                                    // Map thematic colors/shapes to tasks
                                    const theme = taskThemes[index % taskThemes.length];
                                    const TaskIcon = theme.icon;

                                    return (
                                        <Link
                                            key={task.id}
                                            to={`/tasks/${task.id}`}
                                            className="group block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-400 transition-all duration-300 text-left"
                                        >
                                            {/* Colored Block Header with Centered Line Icon */}
                                            <div className={`h-24 ${theme.bg} flex items-center justify-center border-b border-gray-150 dark:border-gray-800`}>
                                                <TaskIcon className={`w-8 h-8 ${theme.color} group-hover:scale-110 transition-transform`} />
                                            </div>

                                            {/* Card Details */}
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-extrabold text-sm text-gray-950 dark:text-white truncate group-hover:text-indigo-600 transition-colors" title={task.title}>
                                                        {task.title || 'Assigned Task'}
                                                    </h4>
                                                </div>

                                                {/* Task Status Badge */}
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {status === 'passed' && (
                                                        <span className="text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded uppercase tracking-wider">
                                                            Approved
                                                        </span>
                                                    )}
                                                    {status === 'redo' && (
                                                        <span className="text-[9px] font-extrabold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 px-2 py-0.5 rounded uppercase tracking-wider">
                                                            Revision Req.
                                                        </span>
                                                    )}
                                                    {status === 'pending' && (
                                                        <span className="text-[9px] font-extrabold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded uppercase tracking-wider">
                                                            Grading
                                                        </span>
                                                    )}
                                                    {!status && (
                                                        <span className="text-[9px] font-extrabold bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-400 border border-gray-250 dark:border-gray-700 px-2 py-0.5 rounded uppercase tracking-wider">
                                                            Pending Submit
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Retro Text-based Progress Bar */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                                                        <span className="font-mono">{progressInfo.bar}</span>
                                                        <span>{progressInfo.pct}</span>
                                                    </div>
                                                </div>

                                                {/* Bottom details block */}
                                                <div className="pt-2 border-t border-gray-100 dark:border-gray-850 flex items-center justify-between text-[9px] text-gray-400 font-bold">
                                                    <span className="truncate max-w-[140px]" title={orgEmail}>{orgEmail}</span>
                                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="font-bold text-gray-900 dark:text-white">No tasks assigned yet</p>
                                <p className="text-xs text-gray-400 mt-1">Your organization tasks will appear here.</p>
                            </div>
                        )}
                    </div>

                    {/* Resource Pin Board & Bulletin Section */}
                    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Pin className="w-5 h-5 text-indigo-600 rotate-45" />
                                Resource Pin Board & Bulletin
                            </h2>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Workspace Bulletin</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Left Side: Materials & Guides */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Materials & Guides</h3>
                                {orgCourses.length > 0 ? (
                                    <div className="space-y-3">
                                        <a 
                                            href="/org-materials"
                                            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20 group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/20 flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-red-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-gray-900 dark:text-white group-hover:text-indigo-600">Cohort Syllabus 2026</h4>
                                                    <p className="text-[10px] text-gray-400">PDF Document · Pinned by Admin</p>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                        </a>

                                        <a 
                                            href="/org-materials"
                                            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20 group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-gray-900 dark:text-white group-hover:text-indigo-600">Submission Formatting Guide</h4>
                                                    <p className="text-[10px] text-gray-400">PDF Document · Pinned by Teacher</p>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                        </a>

                                        <a 
                                            href="/org-materials"
                                            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20 group transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/20 flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4 text-amber-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-gray-900 dark:text-white group-hover:text-indigo-600">Reference Library & Codes</h4>
                                                    <p className="text-[10px] text-gray-400">External Repository · Pinned by Admin</p>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                        </a>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-xs font-bold text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/20">
                                        nothing to buzz byee 🐝
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Bulletin Feed / Announcements */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Latest Bulletins</h3>
                                    <Link to="/org-announcements" className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline">
                                        View All Bulletins
                                    </Link>
                                </div>
                                
                                <div className="space-y-3">
                                    {announcements.length > 0 ? (
                                        announcements.map((ann) => (
                                            <div 
                                                key={ann.id}
                                                className="p-3 border border-gray-150 dark:border-gray-850 rounded-2xl bg-white dark:bg-gray-900 space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-black text-gray-950 dark:text-white truncate max-w-[200px]">{ann.title}</h4>
                                                    <span className="text-[9px] text-gray-400 font-bold">
                                                        {new Date(ann.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                    {ann.content}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-center space-y-1 bg-gray-50/20">
                                            <Bell className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">No active bulletins</p>
                                            <p className="text-[10px] text-gray-400">Class announcements from your teachers will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

        </div>
    );
}

export default OrgStudentDashboard;
