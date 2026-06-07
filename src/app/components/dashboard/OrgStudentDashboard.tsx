import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, ChevronRight, Clock, Calendar, Bell,
    GraduationCap, Building2, Users, CheckCircle2,
    TrendingUp, Award
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
    const [orgCourses, setOrgCourses] = useState<any[]>([]);
    const [orgTeachers, setOrgTeachers] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
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

                // Fetch org-specific tasks assigned by this organization
                if (supabase) {
                    const { data: tasksData } = await supabase
                        .from('org_tasks')
                        .select('id, title, content, deadline, created_at')
                        .eq('org_id', activeOrganization.id)
                        .order('created_at', { ascending: false })
                        .limit(10);

                    if (tasksData) setOrgCourses(tasksData);

                    // Fetch teachers under this org
                    const { data: teachersData } = await supabase
                        .from('org_teachers')
                        .select('id, mentor:profiles!mentor_id(full_name, avatar_url)')
                        .eq('org_id', activeOrganization.id)
                        .eq('status', 'Active')
                        .limit(5);

                    if (teachersData) setOrgTeachers(teachersData);

                    // Fetch announcements if table exists
                    try {
                        const { data: announcementsData } = await supabase
                            .from('org_announcements')
                            .select('id, title, content, created_at')
                            .eq('org_id', activeOrganization.id)
                            .order('created_at', { ascending: false })
                            .limit(3);
                        if (announcementsData) setAnnouncements(announcementsData);
                    } catch { }
                }
            } catch (e) {
                console.error('Error loading org student data:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.id, activeOrganization?.id]);

    // Filter only org-confirmed bookings (sessions within org context)
    const upcomingSessions = bookings
        .filter(b => b.status === 'confirmed')
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 3);

    const completedSessions = bookings.filter(b => b.status === 'completed');

    // Compute progress from org courses enrolled
    const orgEnrolledIds = new Set(orgCourses.map((c: any) => c.track?.id).filter(Boolean));
    const orgEnrollments = enrollments.filter(e => orgEnrolledIds.has(e.track_id));
    const avgProgress = orgEnrollments.length > 0
        ? Math.round(orgEnrollments.reduce((acc, e) => acc + e.progress, 0) / orgEnrollments.length)
        : 0;

    const completedOrgCourses = orgEnrollments.filter(e => e.status === 'completed').length;

    return (
        <div>
            {/* Org-Branded Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 md:p-8 text-white shadow-2xl shadow-indigo-500/20 mb-8">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider">
                                    {orgName}
                                </span>
                                <span className="text-xs font-semibold bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full backdrop-blur-sm border border-emerald-400/30">
                                    Student
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                Welcome, {firstName}!
                            </h1>
                            <p className="text-indigo-100/90 text-base">
                                {orgCourses.length > 0
                                    ? `You have ${orgCourses.length} course${orgCourses.length === 1 ? '' : 's'} assigned by ${orgName}.`
                                    : `Continue your learning journey with ${orgName}.`}
                            </p>
                        </div>

                        {/* Quick Progress */}
                        <div className="flex gap-3 flex-wrap">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[90px]">
                                <p className="text-2xl font-black">{orgCourses.length}</p>
                                <p className="text-indigo-200 text-xs font-medium mt-1">Assigned</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[90px]">
                                <p className="text-2xl font-black">{avgProgress}%</p>
                                <p className="text-indigo-200 text-xs font-medium mt-1">Progress</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center min-w-[90px]">
                                <p className="text-2xl font-black">{completedOrgCourses}</p>
                                <p className="text-indigo-200 text-xs font-medium mt-1">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="group bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">{orgCourses.length}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-0.5">Org Courses</p>
                </div>

                <div className="group bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">{completedOrgCourses}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-0.5">Completed</p>
                </div>

                <div className="group bg-white p-5 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">{upcomingSessions.length}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-0.5">Sessions</p>
                </div>

                <div className="group bg-gradient-to-br from-violet-500 to-indigo-600 p-5 rounded-3xl shadow-lg shadow-violet-500/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <div className="relative">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-3xl font-black text-white">{avgProgress}%</h3>
                        <p className="text-violet-200 text-sm font-medium mt-0.5">Avg Progress</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Org Courses */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Org Assigned Courses */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Task Bar</h2>
                                    <p className="text-sm text-gray-500">Your Task for today</p>
                                </div>
                            </div>
                            <Link to="/courses" className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-52 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : orgCourses.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {orgCourses.slice(0, 4).map((task: any, index: number) => {
                                    const gradients = [
                                        'from-indigo-500 to-violet-500',
                                        'from-blue-500 to-cyan-500',
                                        'from-emerald-500 to-teal-500',
                                        'from-amber-500 to-orange-500',
                                    ];
                                    return (
                                        <Link 
                                            key={task.id} 
                                            to={`/tasks/${task.id}`}
                                            className="group block relative overflow-hidden rounded-3xl bg-white border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                        >
                                            {/* Top gradient bar */}
                                            <div className={`h-1.5 bg-gradient-to-r ${gradients[index % 4]}`} />
                                            <div className="p-6">
                                                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradients[index % 4]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                                    <BookOpen className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                    {task.title || 'Untitled Task'}
                                                </h3>
                                                <div 
                                                    className="text-sm text-gray-500 mb-4 line-clamp-3 prose prose-sm overflow-hidden" 
                                                    dangerouslySetInnerHTML={{ __html: task.content || '' }}
                                                />
                                                <div className="flex flex-col gap-2 pt-2 border-t border-gray-55">
                                                    {task.deadline && (
                                                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            Deadline: {new Date(task.deadline).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border-2 border-dashed border-indigo-200 text-center">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="w-8 h-8 text-indigo-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Tasks Assigned Yet</h3>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                    {orgName} hasn't assigned any tasks yet. Check back soon or contact your organization.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Org Sessions */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                                <p className="text-sm text-gray-500">Scheduled within {orgName}</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : upcomingSessions.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingSessions.map(session => (
                                    <div key={session.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">
                                                Session with {session.profiles?.full_name || 'Instructor'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                {' · '}
                                                {new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full flex-shrink-0">
                                            Confirmed
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No upcoming sessions scheduled.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Sidebar Widgets */}
                <div className="space-y-6">

                    {/* Announcements */}
                    <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Bell className="w-4 h-4 text-amber-600" />
                            </div>
                            <h3 className="font-bold text-gray-900">Announcements</h3>
                        </div>
                        <div className="p-5">
                            {announcements.length > 0 ? (
                                <div className="space-y-3">
                                    {announcements.map((ann: any) => (
                                        <div key={ann.id} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                            <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ann.content}</p>
                                            <p className="text-xs text-amber-600 font-medium mt-1.5">
                                                {new Date(ann.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center">
                                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No announcements yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Teachers */}
                    <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                                <Users className="w-4 h-4 text-violet-600" />
                            </div>
                            <h3 className="font-bold text-gray-900">Your Teachers</h3>
                        </div>
                        <div className="p-5">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
                                </div>
                            ) : orgTeachers.length > 0 ? (
                                <div className="space-y-3">
                                    {orgTeachers.map((t: any) => (
                                        <div key={t.id} className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {t.mentor?.avatar_url ? (
                                                    <img src={t.mentor.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold text-violet-600">
                                                        {(t.mentor?.full_name || 'T').charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {t.mentor?.full_name || 'Teacher'}
                                                </p>
                                                <p className="text-xs text-gray-400">Instructor</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-sm text-gray-400">No teachers yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Achievement Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-5 border border-indigo-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                <Award className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Your Progress</h3>
                                <p className="text-xs text-indigo-600">in {orgName}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium text-gray-600">
                                <span>Overall Completion</span>
                                <span className="text-indigo-600 font-bold">{avgProgress}%</span>
                            </div>
                            <div className="h-3 bg-indigo-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${avgProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {completedOrgCourses} of {orgCourses.length} courses completed
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
