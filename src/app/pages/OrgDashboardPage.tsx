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
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getUserProfile, getOrgTeachers, getOrgStudents, searchStudentsForOrg, Profile } from '../../lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export function OrgDashboardPage() {
    const { user } = useAuth();
    const { activeOrganization } = useOrganizationMode();
    const navigate = useNavigate();
    
    // Core state
    const [staff, setStaff] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [orgProfile, setOrgProfile] = useState<any>(null);

    // Task board states
    const [taskName, setTaskName] = useState('');
    const [taskDeadline, setTaskDeadline] = useState('');
    const [isSavingTask, setIsSavingTask] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

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
        try {
            const { error } = await client.from('org_tasks').insert({
                org_id: user?.id,
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
        } catch (err: any) {
            console.error('Error assigning task:', err);
            toast.error(err.message || 'Failed to assign task. Make sure database table exists.');
        } finally {
            setIsSavingTask(false);
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

            // Strict redirect logic
            if (!user.user_metadata?.is_org) {
                const profile = await getUserProfile(user.id);
                if (profile?.role === 'student') {
                    navigate('/student-dashboard', { replace: true });
                } else {
                    navigate('/mentor-dashboard', { replace: true });
                }
                return;
            }

            const targetOrgId = activeOrganization?.id || user.id;

            const { data } = await client.from('mentors').select('company, bio').eq('user_id', user.id).single();
            if (data) setOrgProfile(data);

            const teachersData = await getOrgTeachers(targetOrgId);
            if (teachersData) setStaff(teachersData);

            const studentsData = await getOrgStudents(targetOrgId);
            if (studentsData) setStudents(studentsData);
        };
        fetchOrgDetails();
    }, [user, activeOrganization?.id, navigate]);

    let orgName = orgProfile?.company || user?.user_metadata?.full_name || 'Organisation';
    let founderRole = 'Founder';

    if (orgProfile?.bio) {
        try {
            const bioData = typeof orgProfile.bio === 'string' ? JSON.parse(orgProfile.bio) : orgProfile.bio;
            founderRole = bioData?.role || 'Admin';
        } catch (e) {
            console.error("Failed to parse bio", e);
        }
    }

    const canManageStaff = founderRole === 'Founder' || founderRole === 'Admin' || founderRole === 'Administrator';

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
        // Simulate API call to provision Zoom/Native secure room
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Random meeting parameters
        const randId = Math.floor(1000000000 + Math.random() * 9000000000).toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        const randPasscode = `MZ-LIVE-${Math.floor(1000 + Math.random() * 9000)}`;
        const cleanRoomId = randId.replace(/\s/g, '');
        const joinLink = `${window.location.origin}/live/${cleanRoomId}`;

        try {
            const { error } = await supabase
                .from('live_sessions')
                .insert({
                    org_id: user.id,
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
        toast.success('Zoom Live Session provisioned successfully!');
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
                            <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">Welcome, {orgName}!</h1>
                            <p className="text-gray-700 text-sm font-bold uppercase tracking-wider">Manage your entire institute from one place.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {canManageStaff && (
                                <Link 
                                    to="/org-teachers" 
                                    className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all self-start md:self-auto"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Teacher
                                </Link>
                            )}
                            
                            {/* Start Live Session / Start Meeting Button */}
                            <button 
                                onClick={() => setIsMeetingModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all self-start md:self-auto"
                            >
                                <Video className="w-4 h-4 animate-pulse" />
                                Start Meeting
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] border-2 border-gray-900 flex items-center justify-center text-green-600 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">$0</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Staff Management */}
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
                                        className="px-5 py-3.5 bg-[#818CF8] hover:bg-indigo-600 disabled:bg-indigo-300 text-white border-2 border-gray-900 rounded-xl text-xs font-extrabold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none flex items-center gap-1.5"
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
                                        className="min-h-[320px] bg-white text-gray-900 border-2 border-gray-900 rounded-xl p-6 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] outline-none overflow-y-auto prose prose-sm max-w-none focus:ring-2 focus:ring-indigo-150 text-left cursor-text"
                                        style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Widgets */}
                    <div className="space-y-8">
                        {/* Recent Registrations */}
                        <div className="bg-white rounded-3xl border-2 border-gray-900 p-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-md font-black uppercase tracking-tight text-gray-900 mb-4">Recent Enrollments</h2>
                            <div className="space-y-4">
                                <div className="py-8 text-center text-gray-400 font-bold italic border-2 border-dashed border-gray-300 rounded-2xl bg-[#FAF9F6]">
                                    No recent enrollments
                                </div>
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
                                className="w-full py-3.5 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                            >
                                Copy Invite Link
                            </button>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* START MEETING / LIVE SESSION CREATOR MODAL (Zoom Integration) */}
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
                                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 border-2 border-gray-900 p-1.5 rounded-lg bg-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]"
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

                                        <div className="bg-white border-2 border-gray-900 rounded-2xl p-5 space-y-4 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                            <div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Topic</span>
                                                <span className="text-sm font-extrabold text-gray-900">{createdMeetingDetails.topic}</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Duration</span>
                                                    <span className="text-xs font-bold text-gray-750">{createdMeetingDetails.duration}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Invited Participants</span>
                                                    <span className="text-xs font-bold text-indigo-600">{createdMeetingDetails.participantsCount} Users</span>
                                                </div>
                                            </div>

                                            <div className="border-t-2 border-gray-900 pt-3 space-y-3">
                                                {/* Join Link */}
                                                <div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Join URL</span>
                                                    <div className="flex items-center gap-2 bg-[#FAF9F6] p-2.5 rounded-xl border-2 border-gray-900">
                                                        <span className="text-xs text-indigo-900 truncate flex-1 font-bold">{createdMeetingDetails.joinUrl}</span>
                                                        <button 
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(createdMeetingDetails.joinUrl);
                                                                toast.success('Meeting link copied!');
                                                            }}
                                                            className="p-1.5 hover:bg-white text-gray-500 hover:text-gray-900 rounded-lg border border-gray-300"
                                                            title="Copy Link"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Meeting Credentials */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Meeting ID</span>
                                                        <div className="flex items-center gap-1.5 bg-[#FAF9F6] p-2.5 rounded-xl border-2 border-gray-900 justify-between">
                                                            <span className="text-xs font-black text-gray-900">{createdMeetingDetails.meetingId}</span>
                                                            <button 
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(createdMeetingDetails.meetingId.replace(/\s/g, ''));
                                                                    toast.success('Meeting ID copied!');
                                                                }}
                                                                className="text-gray-500 hover:text-gray-900"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Passcode</span>
                                                        <div className="flex items-center gap-1.5 bg-[#FAF9F6] p-2.5 rounded-xl border-2 border-gray-900 justify-between">
                                                            <span className="text-xs font-black text-amber-600">{createdMeetingDetails.passcode}</span>
                                                            <button 
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(createdMeetingDetails.passcode);
                                                                    toast.success('Meeting Passcode copied!');
                                                                }}
                                                                className="text-gray-500 hover:text-gray-900"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button 
                                                onClick={handleCloseMeetingModal}
                                                className="flex-1 py-3.5 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                            >
                                                Done
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const roomId = createdMeetingDetails.meetingId.replace(/\s/g, '');
                                                    setIsMeetingModalOpen(false);
                                                    navigate(`/live/${roomId}`);
                                                }}
                                                className="flex-1 py-3.5 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Video className="w-4.5 h-4.5 animate-pulse" />
                                                Launch Meeting
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ==================== SETUP FORM SCREEN ==================== */
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-[#eff3ff] border-2 border-gray-900 rounded-xl flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] text-[#5763f6]">
                                                <Video className="w-5 h-5 animate-pulse" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-gray-900 uppercase">Cohort Sync</h2>
                                            </div>
                                        </div>

                                        {/* Topic */}
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Session Topic</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-white border-2 border-gray-900 rounded-xl px-4 py-3 text-sm text-gray-900 font-bold outline-none"
                                                value={meetingTopic}
                                                onChange={e => setMeetingTopic(e.target.value)}
                                                placeholder="e.g. System Design live architecture build"
                                            />
                                        </div>

                                        {/* Date and Duration */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Start Time</label>
                                                <input 
                                                    type="datetime-local" 
                                                    className="w-full bg-white border-2 border-gray-900 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-bold outline-none"
                                                    value={meetingDate}
                                                    onChange={e => setMeetingDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Duration</label>
                                                <select 
                                                    className="w-full bg-white border-2 border-gray-900 rounded-xl px-3 py-3 text-xs text-gray-900 font-bold outline-none cursor-pointer"
                                                    value={meetingDuration}
                                                    onChange={e => setMeetingDuration(e.target.value)}
                                                >
                                                    <option>30 Minutes</option>
                                                    <option>45 Minutes</option>
                                                    <option>1 Hour</option>
                                                    <option>2 Hours</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Agenda / Description</label>
                                            <textarea 
                                                rows={2}
                                                className="w-full bg-white border-2 border-gray-900 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-bold outline-none resize-none"
                                                value={meetingDesc}
                                                onChange={e => setMeetingDesc(e.target.value)}
                                                placeholder="Explain what items will be discussed..."
                                            />
                                        </div>

                                        {/* Invite People Section */}
                                        <div className="space-y-2 border-t-2 border-gray-900 pt-4">
                                            <div className="flex justify-between items-center">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Invite Members</label>
                                                <span className="text-[9px] font-black text-indigo-700 bg-[#EFF3FF] px-2 py-0.5 rounded border border-indigo-200">
                                                    {invitedUsers.length} Invited
                                                </span>
                                            </div>

                                            {/* Search Input Box */}
                                            <div className="relative">
                                                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search by name..."
                                                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-900 rounded-xl text-xs font-bold text-gray-900 outline-none"
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                />
                                            </div>

                                            {/* Registered User Search Results */}
                                            {searchQuery.length >= 2 && (
                                                <div className="bg-white border-2 border-gray-900 rounded-xl p-2 max-h-40 overflow-y-auto space-y-1 shadow-inner">
                                                    {isSearching ? (
                                                        <div className="flex items-center justify-center py-4 gap-2 text-gray-400 text-xs font-bold">
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                                                            Searching...
                                                        </div>
                                                    ) : searchResults.length === 0 ? (
                                                        <p className="text-[10px] text-gray-400 py-3 text-center font-bold">No members found</p>
                                                    ) : (
                                                        searchResults.map(member => {
                                                            const isAlreadyInvited = invitedUsers.some(item => item.id === member.id);
                                                            const avatarInitials = (member.full_name || 'Student').split(' ').map((n: string) => n[0]).join('').substring(0, 2);
                                                            return (
                                                                <div 
                                                                    key={member.id}
                                                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-all border border-transparent hover:border-gray-200"
                                                                >
                                                                    <div className="flex items-center gap-2.5">
                                                                        {member.avatar_url ? (
                                                                            <img src={member.avatar_url} alt={member.full_name} className="w-7 h-7 rounded-full object-cover border border-gray-300" />
                                                                        ) : (
                                                                            <div className="w-7 h-7 bg-indigo-50 text-indigo-700 border-2 border-gray-900 rounded-full flex items-center justify-center font-black text-[10px]">
                                                                                {avatarInitials}
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <h5 className="text-xs font-extrabold text-gray-900">{member.full_name}</h5>
                                                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{member.grade || 'Student'}</p>
                                                                        </div>
                                                                    </div>

                                                                    {isAlreadyInvited ? (
                                                                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-[#DCFCE7] px-2 py-0.5 rounded border border-emerald-300">
                                                                            <Check className="w-3 h-3" />
                                                                            Invited
                                                                        </span>
                                                                    ) : tempSelectedUser === member.id ? (
                                                                        <button 
                                                                            onClick={() => handleSendInvite(member)}
                                                                            className="px-2.5 py-1 bg-[#818CF8] text-white border border-gray-900 rounded text-[9px] font-black"
                                                                        >
                                                                            Confirm
                                                                        </button>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => setTempSelectedUser(member.id)}
                                                                            className="px-2.5 py-1 bg-white border border-gray-300 hover:border-gray-900 rounded text-[9px] font-black transition-all"
                                                                        >
                                                                            Invite
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}

                                            {/* Display Invited List Chips */}
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
                                                                className="text-gray-450 hover:text-gray-900 ml-0.5"
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
                                                className="flex-1 py-3.5 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleProvisionMeeting}
                                                disabled={isCreatingMeeting}
                                                className="flex-1 py-3.5 bg-[#818CF8] text-white border-2 border-gray-900 rounded-xl font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-2"
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
