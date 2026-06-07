import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, ChevronRight, Clock, Calendar, Bell,
    GraduationCap, Building2, Users, CheckCircle2,
    TrendingUp, Award, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useOrganizationMode } from '../../../context/OrganizationModeContext';
import { getStudentEnrollments, getStudentBookings, Enrollment, Booking } from '../../../lib/api';
import { getSupabase } from '../../../lib/supabase';

export function OrgStudentDashboard() {
    const { user } = useAuth();
    const { activeOrganization } = useOrganizationMode();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [orgTasks, setOrgTasks] = useState<any[]>([]);
    const [orgTeachers, setOrgTeachers] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [taskSubmissions, setTaskSubmissions] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Student';
    const orgName = activeOrganization?.name || 'Your Organization';

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id || !activeOrganization?.id) return;
            setLoading(true);
            try {
                const supabase = getSupabase();

                const [enrollmentsData, bookingsData] = await Promise.all([
                    getStudentEnrollments(user.id),
                    getStudentBookings(user.id),
                ]);

                if (enrollmentsData) setEnrollments(enrollmentsData);
                if (bookingsData) setBookings(bookingsData);

                if (supabase) {
                    // 1. Fetch org-specific tasks assigned by this organization
                    const { data: tasksData } = await supabase
                        .from('org_tasks')
                        .select('id, title, content, deadline, created_at')
                        .eq('org_id', activeOrganization.id)
                        .order('created_at', { ascending: false })
                        .limit(10);

                    if (tasksData) setOrgTasks(tasksData);

                    // 2. Fetch student's submissions for these tasks to display statuses
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

                    // 3. Fetch teachers under this org
                    const { data: teachersData } = await supabase
                        .from('org_teachers')
                        .select('id, mentor:profiles!mentor_id(full_name, avatar_url)')
                        .eq('org_id', activeOrganization.id)
                        .eq('status', 'Active')
                        .limit(5);

                    if (teachersData) setOrgTeachers(teachersData);

                    // 4. Fetch announcements
                    try {
                        const { data: announcementsData } = await supabase
                            .from('org_announcements')
                            .select('id, title, content, created_at')
                            .eq('org_id', activeOrganization.id)
                            .order('created_at', { ascending: false })
                            .limit(3);
                        if (announcementsData) setAnnouncements(announcementsData);
                    } catch {}
                }
            } catch (e) {
                console.error('Error loading org student data:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.id, activeOrganization?.id]);

    // Filter only org-confirmed bookings
    const upcomingSessions = bookings
        .filter(b => b.status === 'confirmed')
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 3);

    // Calculate completions & progress from tasks
    const totalTasks = orgTasks.length;
    const completedTasksCount = Object.values(taskSubmissions).filter(status => status === 'passed').length;
    const pendingReviewCount = Object.values(taskSubmissions).filter(status => status === 'pending').length;
    const revisionCount = Object.values(taskSubmissions).filter(status => status === 'redo').length;
    
    // Average completion progress based on task approvals
    const completionProgress = totalTasks > 0 
        ? Math.round((completedTasksCount / totalTasks) * 100) 
        : 0;

    return (
        <div className="space-y-8">
            
            {/* Mesh-Gradient Glassmorphic Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-8 text-white shadow-xl border border-white/5 relative">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 uppercase tracking-widest text-indigo-200">
                                <Building2 className="w-3.5 h-3.5" />
                                {orgName}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-400/20">
                                Student Portal
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">{firstName}</span>!
                        </h1>
                        <p className="text-gray-300 text-sm md:text-base max-w-lg leading-relaxed">
                            {totalTasks > 0
                                ? `You have ${totalTasks} active task${totalTasks === 1 ? '' : 's'} assigned by ${orgName}. Click tasks below to view and upload your work.`
                                : `All up to date! There are no tasks currently assigned to you.`}
                        </p>
                    </div>

                    {/* Banner Stats Widget */}
                    <div className="flex gap-4 flex-wrap">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px] hover:bg-white/10 transition-colors cursor-pointer group">
                            <p className="text-3xl font-black text-white group-hover:scale-105 transition-transform">{totalTasks}</p>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Assigned</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px] hover:bg-white/10 transition-colors cursor-pointer group">
                            <p className="text-3xl font-black text-amber-300 group-hover:scale-105 transition-transform">{pendingReviewCount}</p>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Pending</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[100px] hover:bg-white/10 transition-colors cursor-pointer group">
                            <p className="text-3xl font-black text-emerald-400 group-hover:scale-105 transition-transform">{completedTasksCount}</p>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-1">Completed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glowing Bento Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Active Tasks Card */}
                <div className="group bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-[0_8px_30px_rgb(245,158,11,0.06)] hover:border-amber-400 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-amber-600 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">{totalTasks}</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Active Tasks</p>
                </div>

                {/* Passed Card */}
                <div className="group bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-[0_8px_30px_rgb(16,185,129,0.06)] hover:border-emerald-400 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">{completedTasksCount}</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Approved</p>
                </div>

                {/* Sessions Card */}
                <div className="group bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-[0_8px_30px_rgb(14,165,233,0.06)] hover:border-sky-400 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mb-4 text-sky-600 group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">{upcomingSessions.length}</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">Sessions</p>
                </div>

                {/* Progress Card (Featured Gradient Glow) */}
                <div className="group relative bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 text-white">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-black text-white">{completionProgress}%</h3>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mt-1">Task Progress</p>
                    </div>
                </div>
            </div>

            {/* Main Content split column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Side: Tasks & Sessions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Task Bar Workspace Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Task Bar</h2>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Your Task for today</p>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-44 bg-gray-100 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : orgTasks.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {orgTasks.map((task: any) => {
                                    const status = taskSubmissions[task.id];
                                    return (
                                        <Link 
                                            key={task.id} 
                                            to={`/tasks/${task.id}`}
                                            className="group block relative rounded-3xl bg-white border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-400 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between min-h-[180px]"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                                        <BookOpen className="w-4 h-4" />
                                                    </div>
                                                    
                                                    {/* Real Database Submission Badges */}
                                                    {status === 'passed' && (
                                                        <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                            Approved
                                                        </span>
                                                    )}
                                                    {status === 'redo' && (
                                                        <span className="text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                                            Revision Req.
                                                        </span>
                                                    )}
                                                    {status === 'pending' && (
                                                        <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                                            Grading
                                                        </span>
                                                    )}
                                                    {!status && (
                                                        <span className="text-[9px] font-extrabold bg-gray-50 text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                                                            Not Submitted
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="font-extrabold text-gray-900 text-base mb-1.5 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                    {task.title || 'Untitled Task'}
                                                </h3>
                                                <div 
                                                    className="text-xs text-gray-500 line-clamp-2 prose prose-sm overflow-hidden mb-4" 
                                                    dangerouslySetInnerHTML={{ __html: task.content || '' }}
                                                />
                                            </div>

                                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                                                {task.deadline ? (
                                                    <span className={`text-[10px] font-bold flex items-center gap-1 ${
                                                        new Date(task.deadline).getTime() < Date.now() 
                                                            ? 'text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full' 
                                                            : 'text-gray-500'
                                                    }`}>
                                                        <Clock className="w-3 h-3" />
                                                        Due: {new Date(task.deadline).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                        <HelpCircle className="w-3 h-3" />
                                                        No deadline
                                                    </span>
                                                )}
                                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 bg-gradient-to-br from-indigo-50/50 to-white rounded-3xl border border-dashed border-gray-200 text-center">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="w-6 h-6 text-indigo-500" />
                                </div>
                                <h3 className="text-base font-extrabold text-gray-950 mb-1">No Tasks Assigned Yet</h3>
                                <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed">
                                    {orgName} hasn't assigned any tasks yet. Check back soon.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Org Sessions */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Upcoming Sessions</h2>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Scheduled within {orgName}</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : upcomingSessions.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingSessions.map(session => (
                                    <div key={session.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-250 hover:border-sky-300 hover:shadow-md transition-all">
                                        <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0 text-sky-600">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-950 text-xs truncate">
                                                Session with {session.profiles?.full_name || 'Instructor'}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                                {new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                {' · '}
                                                {new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full flex-shrink-0 uppercase tracking-wide">
                                            Confirmed
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
                                <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2 animate-pulse" />
                                <p className="text-gray-500 text-xs font-semibold">No upcoming sessions scheduled.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Sidebar Widgets */}
                <div className="space-y-6">

                    {/* Announcements Board */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-150 flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                                <Bell className="w-4 h-4" />
                            </div>
                            <h3 className="font-extrabold text-gray-950 text-sm">Announcements</h3>
                        </div>
                        <div className="p-5">
                            {announcements.length > 0 ? (
                                <div className="space-y-3.5">
                                    {announcements.map((ann: any) => (
                                        <div key={ann.id} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/40 relative">
                                            <p className="text-xs font-bold text-gray-950">{ann.title}</p>
                                            <p className="text-[11px] text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                                            <div className="flex items-center gap-1.5 mt-2.5 text-[9px] font-bold text-amber-700">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-400 font-semibold">No announcements yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Teachers Card */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-150 flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                <Users className="w-4 h-4" />
                            </div>
                            <h3 className="font-extrabold text-gray-950 text-sm">Your Teachers</h3>
                        </div>
                        <div className="p-5">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
                                </div>
                            ) : orgTeachers.length > 0 ? (
                                <div className="space-y-4">
                                    {orgTeachers.map((t: any) => (
                                        <div key={t.id} className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-purple-200">
                                                {t.mentor?.avatar_url ? (
                                                    <img src={t.mentor.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold text-purple-600">
                                                        {(t.mentor?.full_name || 'T').charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">
                                                    {t.mentor?.full_name || 'Teacher'}
                                                </p>
                                                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Instructor</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-xs text-gray-400 font-semibold">No teachers assigned yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Scorecard */}
                    <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl p-5 border border-indigo-100/80 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 border border-indigo-50">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-gray-900 text-sm">Your Progress</h3>
                                <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">{orgName}</p>
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span>Task Completion</span>
                                <span className="text-indigo-600 font-black">{completionProgress}%</span>
                            </div>
                            <div className="h-2.5 bg-indigo-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${completionProgress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide pt-1">
                                {completedTasksCount} of {totalTasks} tasks approved
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrgStudentDashboard;
