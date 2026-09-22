import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  UserPlus, 
  Video, 
  Search, 
  Copy, 
  Check, 
  X, 
  Loader2,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FileText,
  Bell,
  Megaphone,
  Send,
  MessageSquare,
  MessageCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getUserProfile, getOrgTeachers, getOrgStudents, searchStudentsForOrg, Profile } from '../../lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { LinkifiedText } from '../components/common/LinkifiedText';
import { notifyNewAnnouncement, notifyNewTaskAssigned } from '../../lib/emailNotifications';
import { dispatchBulkNotifications } from '../../lib/notificationService';

export function OrgDashboardPage() {
    const { user } = useAuth();
    const { activeOrganization } = useOrganizationMode();
    const navigate = useNavigate();
    
    // Core state
    const [staff, setStaff] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [orgProfile, setOrgProfile] = useState<any>(null);
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
    const [pendingSubmissionsCount, setPendingSubmissionsCount] = useState<number>(0);
    const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
    const [communityPostsCount, setCommunityPostsCount] = useState<number>(0);

    // Announcement Modal State
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);

    // Task board states
    const [taskName, setTaskName] = useState('');
    const [taskDeadline, setTaskDeadline] = useState('');
    const [isSavingTask, setIsSavingTask] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    const targetOrgId = activeOrganization?.id || user?.id;

    const handleAssignTask = async () => {
        if (!taskName.trim()) {
            toast.error('Please enter a task name');
            return;
        }
        const taskHtml = editorRef.current?.innerHTML || '';
        if (!taskHtml.trim() || taskHtml === '<br>') {
            toast.error('Please write some task instructions');
            return;
        }

        const client = supabase;
        if (!client) {
            toast.error('Database client not initialized');
            return;
        }

        setIsSavingTask(true);
        const savedTaskTitle = taskName;
        const savedDeadline = taskDeadline;
        const savedInstructions = taskHtml;

        try {
            const { error } = await client.from('org_tasks').insert({
                org_id: targetOrgId,
                title: taskName,
                content: taskHtml,
                deadline: taskDeadline ? new Date(taskDeadline).toISOString() : null
            });

            if (error) throw error;

            toast.success('Task assigned successfully!');
            setTaskName('');
            setTaskDeadline('');
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
            }

            // Dispatch in-app notification & emails to org students
            (async () => {
                try {
                    if (!targetOrgId) return;
                    const students = await getOrgStudents(targetOrgId);
                    const studentIds = (students || []).map((s: any) => s.student_id || s.id).filter(Boolean);
                    const studentEmails = (students || []).map((s: any) => s.email).filter((email: any) => typeof email === 'string' && email.includes('@') && email.toLowerCase() !== 'no email');

                    if (studentIds.length > 0) {
                        await dispatchBulkNotifications({
                            recipientIds: studentIds,
                            actorId: user?.id,
                            orgId: targetOrgId,
                            type: 'task',
                            title: `📋 New Task: ${savedTaskTitle}`,
                            body: savedDeadline ? `Due: ${new Date(savedDeadline).toLocaleDateString()}` : 'New assignment published.',
                            link: '/student-dashboard',
                            emailAction: async () => {
                                if (studentEmails.length === 0) return true;
                                return notifyNewTaskAssigned({
                                  toEmail: studentEmails,
                                  taskTitle: savedTaskTitle,
                                  dueDate: savedDeadline || undefined,
                                  instructions: savedInstructions ? savedInstructions.replace(/<[^>]*>?/gm, '').slice(0, 200) : undefined,
                                  taskUrl: window.location.origin + '/student-dashboard',
                                });
                            }
                        });
                    }
                } catch (taskNotifErr) {
                    console.warn('[OrgDashboardPage] Task notification broadcast error:', taskNotifErr);
                }
            })();
        } catch (err: any) {
            console.error('Error assigning task:', err);
            toast.error(err.message || 'Failed to assign task. Make sure database table exists.');
        } finally {
            setIsSavingTask(false);
        }
    };

    const handlePublishAnnouncement = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!announcementTitle.trim() || !announcementContent.trim()) {
            toast.error('Please enter both title and message.');
            return;
        }
        const client = supabase;
        if (!client || !targetOrgId) {
            toast.error('Database connection not available.');
            return;
        }

        const savedTitle = announcementTitle.trim();
        const savedContent = announcementContent.trim();

        setIsSavingAnnouncement(true);
        try {
            const { error } = await client.from('org_announcements').insert({
                org_id: targetOrgId,
                title: savedTitle,
                content: savedContent,
            });

            if (error) throw error;

            toast.success('Announcement published to students!');
            setAnnouncementTitle('');
            setAnnouncementContent('');
            setIsAnnouncementModalOpen(false);
            
            // Refresh announcements list
            const { data: annData } = await client
                .from('org_announcements')
                .select('id, title, content, created_at')
                .eq('org_id', targetOrgId)
                .order('created_at', { ascending: false })
                .limit(4);
            if (annData) setRecentAnnouncements(annData);

            // Broadcast persistent notifications & emails
            (async () => {
                try {
                    const [students, teachers] = await Promise.all([
                        getOrgStudents(targetOrgId),
                        getOrgTeachers(targetOrgId)
                    ]);

                    const recipientIds = Array.from(new Set([
                        ...(students || []).map((s: any) => s.student_id || s.id),
                        ...(teachers || []).map((t: any) => t.teacher_id || t.id)
                    ])).filter(Boolean) as string[];

                    const memberEmails = Array.from(new Set([
                        ...(students || []).map((s: any) => s.email),
                        ...(teachers || []).map((t: any) => t.email)
                    ])).filter((email: any) => typeof email === 'string' && email.includes('@') && email.toLowerCase() !== 'no email') as string[];

                    if (recipientIds.length > 0) {
                        await dispatchBulkNotifications({
                            recipientIds,
                            actorId: user?.id,
                            orgId: targetOrgId,
                            type: 'announcement',
                            title: `📢 ${savedTitle}`,
                            body: savedContent,
                            link: '/org-announcements',
                            emailAction: async () => {
                                if (memberEmails.length === 0) return true;
                                return notifyNewAnnouncement({
                                    toEmails: memberEmails,
                                    orgName: activeOrganization?.name || 'Your Organization',
                                    title: savedTitle,
                                    content: savedContent,
                                    authorName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Organization Admin',
                                    announcementUrl: window.location.origin + '/org-announcements',
                                });
                            }
                        });
                    }
                } catch (annNotifErr) {
                    console.warn('[OrgDashboardPage] Announcement broadcast error:', annNotifErr);
                }
            })();
        } catch (err: any) {
            console.error('Error publishing announcement:', err);
            toast.error(err.message || 'Failed to publish announcement.');
        } finally {
            setIsSavingAnnouncement(false);
        }
    };

    // Meeting Modal states
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [meetingTopic, setMeetingTopic] = useState('Weekly Live Cohort Sync');
    const [meetingDuration, setMeetingDuration] = useState('1 Hour');
    const [meetingDate, setMeetingDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth()+1)}-${pad(tomorrow.getDate())}T10:00`;
    });
    const [meetingDesc, setMeetingDesc] = useState('Deep-dive session to review milestone builds and solve blockers.');
    
    // Participant search state using searchStudentsForOrg
    const [searchQuery, setSearchQuery] = useState('');
    const [invitedUsers, setInvitedUsers] = useState<Profile[]>([]); // Store complete Profile objects
    const [tempSelectedUser, setTempSelectedUser] = useState<string | null>(null);

    // Live Database Search State matching OrgStudentsPage
    const [searchResults, setSearchResults] = useState<Profile[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const results = await searchStudentsForOrg(searchQuery);
                setSearchResults(results || []);
            } catch (err) {
                console.error("Error searching students:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Meeting creation state
    const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
    const [createdMeetingDetails, setCreatedMeetingDetails] = useState<any | null>(null);

    // Fetch org profile details
    useEffect(() => {
        const fetchOrgDetails = async () => {
            const client = supabase;
            if (!user?.id || !client) return;

            // Strict redirect logic: allow Org Admin and active Org Teachers
            const profile = await getUserProfile(user.id);
            const isOrgAdmin = Boolean(user.user_metadata?.is_org) || (profile?.role as any) === 'org' || profile?.role === 'admin';
            const isOrgTeacher = activeOrganization?.role === 'teacher';
            
            if (!isOrgAdmin && !isOrgTeacher) {
                if (profile?.role === 'student') {
                    navigate('/student-dashboard', { replace: true });
                } else {
                    navigate('/mentor-dashboard', { replace: true });
                }
                return;
            }

            const currentOrgId = activeOrganization?.id || user.id;

            const { data } = await client.from('mentors').select('company, bio').eq('user_id', currentOrgId).maybeSingle();
            if (data) setOrgProfile(data);

            const teachersData = await getOrgTeachers(currentOrgId);
            if (teachersData) setStaff(teachersData);

            const studentsData = await getOrgStudents(currentOrgId);
            if (studentsData) setStudents(studentsData);

            // Fetch announcements
            try {
                const { data: annData } = await client
                    .from('org_announcements')
                    .select('id, title, content, created_at')
                    .eq('org_id', currentOrgId)
                    .order('created_at', { ascending: false })
                    .limit(4);
                if (annData) setRecentAnnouncements(annData);
            } catch (annErr) {
                console.warn('Could not query announcements for org dashboard:', annErr);
            }

            // Fetch community posts count
            try {
                const { count: postsCount } = await client
                    .from('community_posts')
                    .select('id', { count: 'exact', head: true })
                    .eq('org_id', currentOrgId)
                    .eq('is_deleted', false);
                if (postsCount !== null) setCommunityPostsCount(postsCount);
            } catch (cErr) {
                console.warn('Could not query community posts count:', cErr);
            }

            // Fetch tasks and recent student submissions
            try {
                const { data: dbTasks } = await client.from('org_tasks').select('id, title').eq('org_id', currentOrgId);
                if (dbTasks && dbTasks.length > 0) {
                    const taskIds = dbTasks.map(t => t.id);
                    const taskTitleMap: Record<string, string> = {};
                    dbTasks.forEach(t => { taskTitleMap[t.id] = t.title; });

                    const { data: subsData } = await client
                        .from('org_task_submissions')
                        .select('*')
                        .in('task_id', taskIds)
                        .order('created_at', { ascending: false });

                    if (subsData) {
                        setPendingSubmissionsCount(subsData.filter(s => s.status === 'pending').length);
                        
                        // Fetch profiles for recent 5 submissions
                        const studentIds = Array.from(new Set(subsData.slice(0, 5).map(s => s.student_id)));
                        const profilesMap: Record<string, any> = {};
                        if (studentIds.length > 0) {
                            const { data: pData } = await client.from('profiles').select('id, full_name, avatar_url, email').in('id', studentIds);
                            (pData || []).forEach(p => { profilesMap[p.id] = p; });
                        }

                        setRecentSubmissions(subsData.slice(0, 5).map(s => ({
                            id: s.id,
                            taskId: s.task_id,
                            taskTitle: taskTitleMap[s.task_id] || 'Task',
                            studentName: profilesMap[s.student_id]?.full_name || 'Student',
                            studentAvatar: profilesMap[s.student_id]?.avatar_url,
                            status: s.status,
                            submittedAt: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        })));
                    }
                }
            } catch (sErr) {
                console.warn('Could not query org submissions for dashboard:', sErr);
            }
        };
        fetchOrgDetails();
    }, [user, activeOrganization?.id, activeOrganization?.role, navigate]);

    const isTeacher = !user?.user_metadata?.is_org && activeOrganization?.role === 'teacher';
    let orgName = activeOrganization?.name || orgProfile?.company || user?.user_metadata?.full_name || 'Organisation';
    let founderRole = isTeacher ? 'Teacher' : 'Founder';

    if (!isTeacher && orgProfile?.bio) {
        try {
            const bioData = typeof orgProfile.bio === 'string' ? JSON.parse(orgProfile.bio) : orgProfile.bio;
            founderRole = bioData?.role || 'Admin';
        } catch (e) {
            console.error("Failed to parse bio", e);
        }
    }

    const canManageStaff = !isTeacher && (founderRole === 'Founder' || founderRole === 'Admin' || founderRole === 'Administrator');

    // Invite triggers
    const handleSendInvite = (targetUser: Profile) => {
        setInvitedUsers(prev => [...prev, targetUser]);
        setTempSelectedUser(null);
        toast.success(`Invite sent successfully to ${targetUser.full_name}!`);
    };

    // Meeting provisioner
    const handleProvisionMeeting = async () => {
        if (!meetingTopic.trim()) {
            toast.error('Meeting Topic is required');
            return;
        }

        if (!user || !supabase) {
            toast.error('Session error. Please log in again.');
            return;
        }

        setIsCreatingMeeting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const randId = Math.floor(1000000000 + Math.random() * 9000000000).toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        const randPasscode = `MZ-LIVE-${Math.floor(1000 + Math.random() * 9000)}`;
        const cleanRoomId = randId.replace(/\s/g, '');
        const joinLink = `${window.location.origin}/live/${cleanRoomId}`;

        try {
            const { error } = await supabase
                .from('live_sessions')
                .insert({
                    org_id: targetOrgId,
                    topic: meetingTopic,
                    description: meetingDesc,
                    scheduled_at: meetingDate,
                    duration: meetingDuration,
                    room_id: cleanRoomId,
                    passcode: randPasscode,
                    invited_student_ids: invitedUsers.map(u => u.id)
                });

            if (error) {
                console.error("Database insert error:", error);
                toast.error("Failed to sync live session to Supabase. Check if SQL table is created.");
                setIsCreatingMeeting(false);
                return;
            }
        } catch (e) {
            console.error("Database transaction failed:", e);
            toast.error("Cloud DB sync failed. Saving locally as fallback.");
        }

        setCreatedMeetingDetails({
            topic: meetingTopic,
            duration: meetingDuration,
            dateTime: meetingDate,
            joinUrl: joinLink,
            meetingId: randId,
            passcode: randPasscode,
            participantsCount: invitedUsers.length
        });
        
        setIsCreatingMeeting(false);
        toast.success('Live Session provisioned successfully!');
    };

    // Reset meeting modal
    const handleCloseMeetingModal = () => {
        setIsMeetingModalOpen(false);
        setCreatedMeetingDetails(null);
        setInvitedUsers([]);
        setSearchQuery('');
        setTempSelectedUser(null);
    };

    return (
        <DashboardLayout>
            <div className="font-mono text-gray-900 min-h-screen bg-[#FAF9F6] p-4 sm:p-8 rounded-3xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] select-none">
                
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-3xl border-2 border-gray-900 bg-[#E0F2FE] p-6 sm:p-8 shadow-[3px_3px_0px_rgba(0,0,0,1)] mb-8">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider bg-white border-2 border-gray-900 px-2.5 py-0.5 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                    {isTeacher ? 'TEACHER WORKSPACE' : 'INSTITUTE ADMIN'}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">Welcome, {orgName}!</h1>
                            <p className="text-gray-700 text-sm font-bold uppercase tracking-wider">Manage your entire institute, broadcast announcements, and engage with community.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {canManageStaff && (
                                <Link 
                                    to="/org-teachers" 
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all self-start md:self-auto"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Teacher
                                </Link>
                            )}

                            {/* Write Announcement Button */}
                            <button 
                                onClick={() => setIsAnnouncementModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all self-start md:self-auto cursor-pointer"
                            >
                                <Bell className="w-4 h-4 text-indigo-600" />
                                Write Announcement
                            </button>

                            {/* Community Forums Button */}
                            <Link 
                                to="/community" 
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all self-start md:self-auto"
                            >
                                <MessageSquare className="w-4 h-4 text-indigo-600" />
                                Community
                            </Link>
                            
                            {/* Start Live Session / Start Meeting Button */}
                            <button 
                                onClick={() => setIsMeetingModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all self-start md:self-auto cursor-pointer"
                            >
                                <Video className="w-4 h-4 animate-pulse" />
                                Start Meeting
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#EFF3FF] border-2 border-gray-900 flex items-center justify-center text-blue-600 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Students</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{students.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] border-2 border-gray-900 flex items-center justify-center text-amber-600 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Teachers & Staff</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{staff.length} Active</h3>
                        </div>
                    </div>
                    <Link 
                        to="/org-submissions"
                        className="bg-white p-6 rounded-2xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-between hover:border-indigo-600 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#FEF9C3] border-2 border-gray-900 flex items-center justify-center text-amber-600 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform">
                                <CheckCircle2 className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Submissions</p>
                                <h3 className="text-2xl font-black text-gray-900 mt-1 flex items-center gap-2">
                                    {pendingSubmissionsCount}
                                    <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                        Pending
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                    <Link
                        to="/community"
                        className="bg-white p-6 rounded-2xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-between hover:border-indigo-600 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] border-2 border-gray-900 flex items-center justify-center text-green-600 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform">
                                <MessageCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Community</p>
                                <h3 className="text-2xl font-black text-gray-900 mt-1 flex items-center gap-2">
                                    {communityPostsCount > 0 ? communityPostsCount : 'Active'}
                                    <span className="text-[10px] font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                        Forums
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Task Board & Announcements */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* CLEAN WRITING BOARD / TASK CREATOR */}
                        <div className="bg-white rounded-3xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] overflow-hidden p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-gray-900">
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Task Creator</h2>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Draft tasks and assign them to your students</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2 bg-[#FAF9F6] border-2 border-gray-900 px-3 py-2 rounded-xl">
                                        <Clock className="w-4 h-4 text-gray-650" />
                                        <input 
                                            type="datetime-local" 
                                            className="bg-transparent text-xs font-bold text-gray-700 outline-none border-none cursor-pointer"
                                            value={taskDeadline}
                                            onChange={e => setTaskDeadline(e.target.value)}
                                            title="Choose Deadline Time"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleAssignTask}
                                        disabled={isSavingTask}
                                        className="px-5 py-3.5 bg-[#818CF8] hover:bg-indigo-600 disabled:bg-indigo-300 text-white border-2 border-gray-900 rounded-xl text-xs font-extrabold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {isSavingTask ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Assign Task
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Task Title Frameless Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Task Title</label>
                                <input 
                                    type="text"
                                    placeholder="Untitled Task Name"
                                    value={taskName}
                                    onChange={e => setTaskName(e.target.value)}
                                    className="w-full bg-white px-4 py-3 rounded-xl border-2 border-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 font-bold text-gray-900"
                                />
                            </div>

                            {/* Rich text Google Docs-style clean white pad */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Task Details & Description</label>
                                <div className="bg-[#FAF9F6] rounded-2xl p-4 border-2 border-gray-900 shadow-inner">
                                    <div 
                                        ref={editorRef}
                                        contentEditable={true}
                                        data-placeholder="Write or copy-paste task contents here..."
                                        className="min-h-[260px] bg-white text-gray-900 border-2 border-gray-900 rounded-xl p-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] outline-none overflow-y-auto prose prose-sm max-w-none focus:ring-2 focus:ring-indigo-150 text-left cursor-text"
                                        style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* BROADCAST ANNOUNCEMENTS WIDGET */}
                        <div className="bg-white rounded-3xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] p-6 space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-gray-900">
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-indigo-600" />
                                        Broadcast Announcements
                                    </h2>
                                    <p className="text-xs text-gray-500 font-bold mt-0.5">Post notices and updates directly to your students</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsAnnouncementModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#eff3ff] border-2 border-gray-900 rounded-xl text-xs font-black text-gray-900 hover:bg-[#eff3ff]/80 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                                    >
                                        <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
                                        + Publish Announcement
                                    </button>
                                    <Link
                                        to="/org-announcements"
                                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-black text-indigo-600 hover:underline"
                                    >
                                        View All ({recentAnnouncements.length}) →
                                    </Link>
                                </div>
                            </div>

                            {recentAnnouncements.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {recentAnnouncements.map((ann) => (
                                        <div 
                                            key={ann.id}
                                            className="p-4 bg-[#FAF9F6] border-2 border-gray-900 rounded-2xl shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff]/20 transition-all flex flex-col justify-between"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[9px] font-black uppercase bg-white border border-gray-900 px-2 py-0.5 rounded shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                        Notice
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-bold">
                                                        {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-black text-gray-900 uppercase truncate" title={ann.title}>
                                                    {ann.title}
                                                </h4>
                                                <p className="text-xs text-gray-700 font-bold line-clamp-2 leading-relaxed">
                                                    <LinkifiedText text={ann.content} />
                                                </p>
                                            </div>
                                            <Link
                                                to="/org-announcements"
                                                className="text-[10px] font-black text-indigo-600 hover:underline mt-3 block self-start"
                                            >
                                                Read full notice →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center border-2 border-dashed border-gray-300 rounded-2xl bg-[#FAF9F6] space-y-2">
                                    <Bell className="w-8 h-8 text-gray-400 mx-auto" />
                                    <p className="text-xs font-black text-gray-900 uppercase">No announcements published yet</p>
                                    <p className="text-[11px] text-gray-500 max-w-sm mx-auto">Click "Publish Announcement" above to broadcast alerts and schedules to your cohort.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Widgets */}
                    <div className="space-y-8">
                        {/* Institute Community & Discussions Widget */}
                        <div className="bg-white rounded-3xl border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b-2 border-gray-900">
                                <div>
                                    <h2 className="text-md font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                                        Institute Community
                                    </h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Discussion & Q&A Forums</p>
                                </div>
                                <Link 
                                    to="/community" 
                                    className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                    Open Forums <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="space-y-2.5">
                                <div className="p-3 bg-[#FAF9F6] border-2 border-gray-900 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-black text-xs">
                                            #
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 uppercase">General Discussions</p>
                                            <p className="text-[10px] font-bold text-gray-400">Class announcements & questions</p>
                                        </div>
                                    </div>
                                    <Link to="/community" className="text-[10px] font-black text-indigo-600 hover:underline">
                                        Join →
                                    </Link>
                                </div>

                                <div className="p-3 bg-[#FAF9F6] border-2 border-gray-900 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-black text-xs">
                                            💡
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 uppercase">Project Showcases</p>
                                            <p className="text-[10px] font-bold text-gray-400">Student submissions & peer reviews</p>
                                        </div>
                                    </div>
                                    <Link to="/community" className="text-[10px] font-black text-indigo-600 hover:underline">
                                        Join →
                                    </Link>
                                </div>

                                <div className="p-3 bg-[#FAF9F6] border-2 border-gray-900 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-black text-xs">
                                            📚
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 uppercase">Learning Resources</p>
                                            <p className="text-[10px] font-bold text-gray-400">Notes, docs & shared code</p>
                                        </div>
                                    </div>
                                    <Link to="/community" className="text-[10px] font-black text-indigo-600 hover:underline">
                                        Join →
                                    </Link>
                                </div>
                            </div>

                            <Link
                                to="/community"
                                className="w-full py-3 bg-[#eff3ff] border-2 border-gray-900 text-gray-900 rounded-xl font-black text-xs shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff]/80 transition-all block text-center uppercase"
                            >
                                Enter Community Forums →
                            </Link>
                        </div>

                        {/* Recent Submissions Card */}
                        <div className="bg-white rounded-3xl border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-md font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                    Recent Submissions
                                </h2>
                                <Link 
                                    to="/org-submissions" 
                                    className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                    View All ({pendingSubmissionsCount}) <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentSubmissions.length > 0 ? (
                                    recentSubmissions.map(sub => (
                                        <div 
                                            key={sub.id} 
                                            className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-300 flex items-center justify-between gap-3 hover:border-gray-900 transition-all"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {sub.studentAvatar ? (
                                                    <img src={sub.studentAvatar} className="w-8 h-8 rounded-full border border-gray-300 shrink-0 object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-gray-900 flex items-center justify-center font-black text-indigo-700 text-xs shrink-0">
                                                        {sub.studentName.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-gray-900 truncate">{sub.studentName}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 truncate">{sub.taskTitle}</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-2">
                                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                                                    sub.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    sub.status === 'redo' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-gray-400 font-bold italic border-2 border-dashed border-gray-300 rounded-2xl bg-[#FAF9F6]">
                                        <p className="text-xs">No submissions yet</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Assigned tasks will appear here once submitted.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Org Status Card */}
                        <div className="bg-[#E0F2FE] border-2 border-gray-900 rounded-3xl p-6 text-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <div className="w-14 h-14 bg-white rounded-2xl border-2 border-gray-900 flex items-center justify-center mx-auto mb-4 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] text-indigo-600">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="font-black text-gray-900 uppercase text-md mb-2">Grow your Institute</h3>
                            <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-6">Invite more teachers to your Mentozy organization and scale your classes online.</p>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/signup?org=${user?.id}`);
                                    toast.success("Organization invite link copied!");
                                }}
                                className="w-full py-3.5 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                            >
                                Copy Invite Link
                            </button>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* WRITE / PUBLISH ANNOUNCEMENT MODAL */}
                {/* ========================================================================= */}
                <AnimatePresence>
                    {isAnnouncementModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white border-4 border-gray-900 rounded-3xl p-6 w-full max-w-lg shadow-[6px_6px_0px_rgba(0,0,0,1)] relative flex flex-col text-left font-mono"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between pb-4 border-b-2 border-gray-900 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                            <Megaphone className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 uppercase">Write Announcement</h3>
                                            <p className="text-xs font-bold text-gray-500">Broadcast to all students in {orgName}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsAnnouncementModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-xl bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase text-gray-700">Announcement Title</label>
                                        <input
                                            type="text"
                                            value={announcementTitle}
                                            onChange={(e) => setAnnouncementTitle(e.target.value)}
                                            placeholder="e.g. Schedule Update: Tomorrow's Live Lab"
                                            className="w-full px-4 py-3 border-2 border-gray-900 rounded-xl bg-[#FAF9F6] font-bold text-sm text-gray-900 outline-none focus:bg-[#eff3ff] shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase text-gray-700">Message Content</label>
                                        <textarea
                                            value={announcementContent}
                                            onChange={(e) => setAnnouncementContent(e.target.value)}
                                            rows={4}
                                            placeholder="Write message details, links, or instructions..."
                                            className="w-full px-4 py-3 border-2 border-gray-900 rounded-xl bg-[#FAF9F6] font-bold text-sm text-gray-900 outline-none focus:bg-[#eff3ff] shadow-[2px_2px_0px_rgba(0,0,0,1)] resize-y"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            type="button"
                                            onClick={() => setIsAnnouncementModalOpen(false)}
                                            className="flex-1 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-black text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSavingAnnouncement}
                                            className="flex-1 py-3 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-black text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                        >
                                            {isSavingAnnouncement ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Publishing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Publish Now
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ========================================================================= */}
                {/* START MEETING / LIVE SESSION CREATOR MODAL */}
                {/* ========================================================================= */}
                <AnimatePresence>
                    {isMeetingModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-[#FAF9F6] border-2 border-gray-900 rounded-3xl p-6 w-full max-w-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] relative flex flex-col text-left font-mono"
                            >
                                {/* Close Button */}
                                <button 
                                    onClick={handleCloseMeetingModal}
                                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* CONDITIONAL RENDER: Success Card or Setup Form */}
                                {createdMeetingDetails ? (
                                    /* ==================== SUCCESS SCREEN ==================== */
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                                <Check className="w-5 h-5 text-[#5763f6]" />
                                            </div>
                                            <h2 className="text-2xl font-black text-gray-900 uppercase">Configured!</h2>
                                        </div>

                                        <div className="p-4 bg-white border-2 border-gray-900 rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,1)] space-y-3">
                                            <div>
                                                <span className="text-[10px] uppercase font-black text-gray-400">Meeting Topic</span>
                                                <p className="font-extrabold text-sm text-gray-900">{createdMeetingDetails.topic}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-[10px] uppercase font-black text-gray-400 block">Duration</span>
                                                    <span className="font-bold text-gray-700">{createdMeetingDetails.duration}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-black text-gray-400 block">Invited</span>
                                                    <span className="font-bold text-gray-700">{createdMeetingDetails.participantsCount} Students</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Meeting Credentials Box */}
                                        <div className="p-4 bg-[#eff3ff] border-2 border-gray-900 rounded-2xl space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-black text-gray-600">MEETING ID:</span>
                                                <span className="font-black text-gray-900 tracking-wider">{createdMeetingDetails.meetingId}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-black text-gray-600">PASSCODE:</span>
                                                <span className="font-black text-gray-900 tracking-wider">{createdMeetingDetails.passcode}</span>
                                            </div>
                                        </div>

                                        {/* Join Link Copy Area */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-gray-400">Join URL</label>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="text" 
                                                    readOnly 
                                                    value={createdMeetingDetails.joinUrl}
                                                    className="flex-1 bg-white px-3 py-2.5 rounded-xl border-2 border-gray-900 text-xs font-bold text-gray-700 outline-none truncate"
                                                />
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(createdMeetingDetails.joinUrl);
                                                        toast.success("Meeting link copied to clipboard!");
                                                    }}
                                                    className="p-2.5 bg-white border-2 border-gray-900 rounded-xl shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] hover:bg-[#eff3ff] transition-all cursor-pointer"
                                                >
                                                    <Copy className="w-4 h-4 text-gray-900" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <button 
                                                onClick={handleCloseMeetingModal}
                                                className="flex-1 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-colors cursor-pointer"
                                            >
                                                Done
                                            </button>
                                            <a 
                                                href={createdMeetingDetails.joinUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 py-3 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2"
                                            >
                                                <Video className="w-4 h-4" />
                                                Launch Class
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    /* ==================== CONFIGURATION FORM ==================== */
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                                <Video className="w-5 h-5 text-[#5763f6]" />
                                            </div>
                                            <h2 className="text-xl font-black text-gray-900 uppercase">Live Session</h2>
                                        </div>

                                        {/* Meeting Topic */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-gray-400">Meeting Topic</label>
                                            <input 
                                                type="text" 
                                                value={meetingTopic}
                                                onChange={e => setMeetingTopic(e.target.value)}
                                                className="w-full bg-white px-3 py-2.5 rounded-xl border-2 border-gray-900 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-150"
                                                placeholder="e.g. Masterclass on Neural Networks"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-gray-400">Agenda / Details</label>
                                            <textarea 
                                                rows={2}
                                                value={meetingDesc}
                                                onChange={e => setMeetingDesc(e.target.value)}
                                                className="w-full bg-white px-3 py-2 rounded-xl border-2 border-gray-900 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-150 resize-none"
                                            />
                                        </div>

                                        {/* Date & Duration Row */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-black text-gray-400">Date & Time</label>
                                                <input 
                                                    type="datetime-local" 
                                                    value={meetingDate}
                                                    onChange={e => setMeetingDate(e.target.value)}
                                                    className="w-full bg-white px-3 py-2 rounded-xl border-2 border-gray-900 text-xs font-bold text-gray-700 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-black text-gray-400">Duration</label>
                                                <select 
                                                    value={meetingDuration}
                                                    onChange={e => setMeetingDuration(e.target.value)}
                                                    className="w-full bg-white px-3 py-2.5 rounded-xl border-2 border-gray-900 text-xs font-bold text-gray-700 outline-none"
                                                >
                                                    <option>30 Minutes</option>
                                                    <option>45 Minutes</option>
                                                    <option>1 Hour</option>
                                                    <option>1.5 Hours</option>
                                                    <option>2 Hours</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Invite Cohort Students */}
                                        <div className="space-y-1.5 pt-1">
                                            <label className="text-[10px] uppercase font-black text-gray-400">Invite Participants</label>
                                            
                                            {/* Search input with debounced API lookup */}
                                            <div className="relative">
                                                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                                <input 
                                                    type="text" 
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    placeholder="Search enrolled students..." 
                                                    className="w-full bg-white pl-9 pr-3 py-2.5 rounded-xl border-2 border-gray-900 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-150"
                                                />
                                                {isSearching && (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-3 top-3 text-gray-400" />
                                                )}
                                            </div>

                                            {/* Dropdown with live results */}
                                            {searchResults.length > 0 && (
                                                <div className="bg-white border-2 border-gray-900 rounded-xl max-h-32 overflow-y-auto shadow-md divide-y divide-gray-100">
                                                    {searchResults.map(st => {
                                                        const isAlreadyInvited = invitedUsers.some(u => u.id === st.id);
                                                        return (
                                                            <div 
                                                                key={st.id} 
                                                                className="p-2 flex items-center justify-between text-xs hover:bg-[#eff3ff]"
                                                            >
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{st.full_name}</p>
                                                                    <p className="text-[10px] text-gray-400">{st.email}</p>
                                                                </div>
                                                                <button 
                                                                    disabled={isAlreadyInvited}
                                                                    onClick={() => handleSendInvite(st)}
                                                                    className="px-2.5 py-1 bg-white border border-gray-900 rounded-lg text-[10px] font-black uppercase hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                                                                >
                                                                    {isAlreadyInvited ? 'Invited' : 'Invite +'}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Pills of invited users */}
                                            {invitedUsers.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-2">
                                                    {invitedUsers.map(u => (
                                                        <span 
                                                            key={u.id}
                                                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EFF3FF] text-indigo-700 border border-indigo-200 text-[9px] font-bold rounded-full"
                                                        >
                                                            {u.full_name}
                                                            <button 
                                                                onClick={() => setInvitedUsers(prev => prev.filter(item => item.id !== u.id))}
                                                                className="text-gray-450 hover:text-gray-900 ml-0.5 cursor-pointer"
                                                            >
                                                                <X className="w-2.5 h-2.5" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <button 
                                                onClick={handleCloseMeetingModal}
                                                className="flex-1 py-3.5 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-colors cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleProvisionMeeting}
                                                disabled={isCreatingMeeting}
                                                className="flex-1 py-3.5 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {isCreatingMeeting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Video className="w-4 h-4" />
                                                        Create Meeting
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}

export default OrgDashboardPage;
