import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen, ChevronRight, Clock, Calendar, Bell,
    GraduationCap, Building2, Users, CheckCircle2,
    TrendingUp, Award, HelpCircle, Dna, FlaskConical, 
    Calculator, Atom, Briefcase, Plus, CheckSquare, 
    CalendarRange, FileText, Check, Dumbbell, Sparkles, Pin, ExternalLink,
    Video, ArrowRight, X, Megaphone
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useOrganizationMode } from '../../../context/OrganizationModeContext';
import { 
    getStudentEnrollments, getStudentBookings, Enrollment, Booking,
    StudentUpcomingLiveSession, getUpcomingStudentLiveSessions 
} from '../../../lib/api';
import { getSupabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { LinkifiedText } from '../common/LinkifiedText';

interface Submission {
    task_id: string;
    status: string;
}

export function OrgStudentDashboard() {
    const { user } = useAuth();
    const { activeOrganization } = useOrganizationMode();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [orgTasks, setOrgTasks] = useState<any[]>([]);
    const [orgTeachers, setOrgTeachers] = useState<any[]>([]);
    const [taskSubmissions, setTaskSubmissions] = useState<Record<string, string>>({});
    const [upcomingLiveSessions, setUpcomingLiveSessions] = useState<StudentUpcomingLiveSession[]>([]);
    const [loading, setLoading] = useState(true);

    const orgName = activeOrganization?.name || 'Your Organization';
    const orgEmail = (activeOrganization as any)?.email || 'academy.support@krishnaite.dev';

    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
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

                    // Fetch upcoming WebRTC live sessions
                    try {
                        const sessions = await getUpcomingStudentLiveSessions(user.id, activeOrganization.id);
                        if (sessions && sessions.length > 0) {
                            setUpcomingLiveSessions(sessions);
                        } else {
                            const allSessions = await getUpcomingStudentLiveSessions(user.id);
                            setUpcomingLiveSessions(allSessions);
                        }
                    } catch (sessErr) {
                        console.warn('Could not query live sessions for student:', sessErr);
                    }
                }
            } catch (e) {
                console.error('Error loading org student data:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();

        // Subscribe to live_sessions realtime changes
        const supabase = getSupabase();
        if (supabase && user?.id) {
            const channel = supabase
                .channel(`org_student_live_sessions_${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'live_sessions'
                    },
                    async () => {
                        const sessions = await getUpcomingStudentLiveSessions(user.id, activeOrganization?.id);
                        if (sessions && sessions.length > 0) {
                            setUpcomingLiveSessions(sessions);
                        } else {
                            const allSessions = await getUpcomingStudentLiveSessions(user.id);
                            setUpcomingLiveSessions(allSessions);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user?.id, activeOrganization?.id]);

    const formatLiveSessionTime = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return { dateLabel: 'Upcoming', timeLabel: '', status: 'Upcoming', isLive: false, isSoon: false };

        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const isTomorrow = d.toDateString() === tomorrow.toDateString();

        const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeLabel = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        const diffMinutes = Math.floor((d.getTime() - Date.now()) / (1000 * 60));

        let status = 'Upcoming';
        let isLive = false;
        let isSoon = false;

        if (diffMinutes <= 0 && diffMinutes > -90) {
            status = 'Live';
            isLive = true;
        } else if (diffMinutes > 0 && diffMinutes <= 15) {
            status = 'Starting soon';
            isSoon = true;
        }

        return { dateLabel, timeLabel, status, isLive, isSoon };
    };

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

                {/* Live Sessions Card (Dynamic - Upcoming session or friendly empty state) */}
                {!loading && (
                    upcomingLiveSessions.length > 0 ? (() => {
                        const primarySession = upcomingLiveSessions[0];
                        const { dateLabel, timeLabel, status, isLive, isSoon } = formatLiveSessionTime(primarySession.scheduled_at);

                        return (
                            <div className="bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-700 rounded-3xl p-5 sm:p-6 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all">
                                {/* Top accent bar */}
                                <div className={`absolute top-0 left-0 right-0 h-1.5 ${isLive ? 'bg-red-500 animate-pulse' : isSoon ? 'bg-amber-400' : 'bg-[#818CF8]'}`} />

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Header info / live indicators */}
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-ping' : isSoon ? 'bg-amber-500 animate-pulse' : 'bg-[#818CF8]'}`} />
                                                UPCOMING LIVE SESSION
                                            </span>

                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-gray-900 dark:border-gray-600 ${
                                                isLive 
                                                    ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-500 font-extrabold' 
                                                    : isSoon 
                                                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-500 font-extrabold' 
                                                    : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40 font-bold'
                                            }`}>
                                                {status}
                                            </span>

                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 flex items-center gap-1">
                                                <Video className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> VIDEO SESSION
                                            </span>
                                        </div>

                                        {/* Session Title with 🎥 */}
                                        <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight uppercase truncate flex items-center gap-2">
                                            <span>🎥</span>
                                            <span className="truncate">{primarySession.topic}</span>
                                        </h3>

                                        {/* Mentor Name & Scheduled Time */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">
                                            <span>with <span className="text-gray-900 dark:text-white font-extrabold">{primarySession.hostName}</span></span>
                                            <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">•</span>
                                            <span className="flex items-center gap-1 text-gray-900 dark:text-white">
                                                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                {dateLabel} · {timeLabel}
                                            </span>
                                            {primarySession.duration && (
                                                <>
                                                    <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">•</span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">({primarySession.duration})</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="shrink-0 flex items-center">
                                        <button
                                            onClick={() => navigate(`/live/${primarySession.room_id}`)}
                                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-2xl border-2 border-gray-900 text-sm font-black text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer ${
                                                isLive 
                                                    ? 'bg-red-600 hover:bg-red-700' 
                                                    : isSoon 
                                                    ? 'bg-[#5763f6] hover:bg-indigo-700' 
                                                    : 'bg-gray-900 hover:bg-black'
                                            }`}
                                        >
                                            <span>{isLive ? 'Join Live Session' : 'Join Session'}</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Multiple Sessions Notice */}
                                {upcomingLiveSessions.length > 1 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] font-bold">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            + {upcomingLiveSessions.length - 1} more upcoming session{upcomingLiveSessions.length > 2 ? 's' : ''}
                                        </span>
                                        <Link 
                                            to="/org-calendar" 
                                            className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                        >
                                            View all sessions <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        );
                    })() : (
                        /* Friendly Empty State */
                        <div className="bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-700 rounded-3xl p-5 sm:p-6 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all">
                            {/* Top accent bar */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#818CF8]" />

                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <Video className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    LIVE SESSIONS
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                                        <span>✨</span> Great! You don't have any upcoming sessions.
                                    </h3>
                                    <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
                                        When a mentor invites you to a live video session, it will appear here.
                                    </p>
                                </div>

                                <Link
                                    to="/org-calendar"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border-2 border-gray-900 text-xs font-black text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none transition-all cursor-pointer whitespace-nowrap"
                                >
                                    <span>Check Calendar</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    )
                )}

                {/* Tasks Section Styled like the Courses card in the screenshot */}
                <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                                Active Task Spaces
                            </h2>
                            <Link 
                                to="/org-submissions" 
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                My Submissions →
                            </Link>
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
                                                onClick={() => {
                                                    setSelectedAnnouncement(ann);
                                                    setIsAnnouncementModalOpen(true);
                                                }}
                                                className="p-3.5 border-2 border-gray-900 rounded-2xl bg-white dark:bg-gray-900 space-y-2 hover:bg-[#eff3ff]/40 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="text-xs font-black text-gray-950 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{ann.title}</h4>
                                                    <span className="text-[9px] text-gray-500 font-black bg-[#FAF9F6] border border-gray-900 px-1.5 py-0.5 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] flex-shrink-0">
                                                        {new Date(ann.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed font-bold">
                                                    <LinkifiedText text={ann.content} />
                                                </p>
                                                <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 dark:text-indigo-400 group-hover:underline pt-0.5">
                                                    <span>Open full notice</span>
                                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
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

            {/* Full Announcement Detail Modal */}
            {isAnnouncementModalOpen && selectedAnnouncement && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsAnnouncementModalOpen(false);
                            setSelectedAnnouncement(null);
                        }
                    }}
                >
                    <div className="bg-white border-4 border-gray-900 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-h-[85vh] flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        
                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-4 border-b-2 border-gray-900 pb-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFD166] border border-gray-900 px-2 py-0.5 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                        INSTITUTE BULLETIN
                                    </span>
                                    <span className="text-xs font-bold text-gray-500">
                                        {new Date(selectedAnnouncement.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                                    {selectedAnnouncement.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAnnouncementModalOpen(false);
                                    setSelectedAnnouncement(null);
                                }}
                                className="p-2 bg-[#FF6B6B] text-white border-2 border-gray-900 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#ff5252] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer flex-shrink-0"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body: Full Content */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-mono text-sm leading-relaxed text-gray-800 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl p-4 sm:p-5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <div className="whitespace-pre-wrap font-bold">
                                <LinkifiedText 
                                    text={selectedAnnouncement.content} 
                                    showIcon
                                    linkClassName="text-indigo-600 hover:text-indigo-800 underline font-black"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <Link
                                to="/org-announcements"
                                onClick={() => setIsAnnouncementModalOpen(false)}
                                className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1"
                            >
                                <span>Go to Announcements Board</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            <button
                                onClick={() => {
                                    setIsAnnouncementModalOpen(false);
                                    setSelectedAnnouncement(null);
                                }}
                                className="px-5 py-2.5 bg-gray-900 text-white border-2 border-gray-900 rounded-xl text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-800 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                            >
                                GOT IT
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default OrgStudentDashboard;
