import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  UserPlus, 
  Settings, 
  BookOpen, 
  Video, 
  Search, 
  Calendar, 
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
    const navigate = useNavigate();
    
    // Core state
    const [staff, setStaff] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [orgProfile, setOrgProfile] = useState<any>(null);

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
                setSearchResults(results);
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
            if (!user?.id || !supabase) return;

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

            const { data } = await supabase.from('mentors').select('company, bio').eq('user_id', user.id).single();
            if (data) setOrgProfile(data);

            const teachersData = await getOrgTeachers(user.id);
            if (teachersData) setStaff(teachersData);

            const studentsData = await getOrgStudents(user.id);
            if (studentsData) setStudents(studentsData);
        };
        fetchOrgDetails();
    }, [user, navigate]);

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

        setIsCreatingMeeting(true);
        // Simulate API call to provision Zoom/Native secure room
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Random meeting parameters
        const randId = Math.floor(1000000000 + Math.random() * 9000000000).toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        const randPasscode = `MZ-LIVE-${Math.floor(1000 + Math.random() * 9000)}`;
        const joinLink = `https://mentozy.app/live/${randId.replace(/\s/g, '')}`;

        const newSession = {
            id: `live-${Date.now()}`,
            topic: meetingTopic,
            instructor: orgName,
            time: 'Active Now',
            roomId: randId.replace(/\s/g, ''),
            duration: meetingDuration,
            isActive: true
        };

        try {
            const stored = localStorage.getItem('mentozy_live_sessions');
            const parsed = stored ? JSON.parse(stored) : [];
            localStorage.setItem('mentozy_live_sessions', JSON.stringify([newSession, ...parsed]));
        } catch (e) {
            console.error("Failed to save live session to localStorage", e);
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
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-500/10 mb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome, {orgName}!</h1>
                        <p className="text-blue-100 text-lg">Manage your entire institute from one place.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {canManageStaff && (
                            <Link to="/org-teachers" className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-full font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm self-start md:self-auto">
                                <UserPlus className="w-5 h-5" />
                                Add Teacher
                            </Link>
                        )}
                        
                        {/* Start Live Session / Start Meeting Button */}
                        <button 
                            onClick={() => setIsMeetingModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-full font-bold hover:bg-slate-100 transition-all shadow-lg shadow-indigo-800/10 self-start md:self-auto"
                        >
                            <Video className="w-5 h-5 text-indigo-600 animate-pulse" />
                            Start Meeting
                        </button>
                    </div>
                </div>
                {/* Decoration Circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-xl"></div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <GraduationCap className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                        <h3 className="text-2xl font-bold text-gray-900">{students.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Teachers & Staff</p>
                        <h3 className="text-2xl font-bold text-gray-900">{staff.length} Active</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                        <DollarSign className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900">$0</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Staff Management */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Staff & Teachers</h2>
                            {canManageStaff && (
                                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                                    Admin Privileges Active
                                </span>
                            )}
                        </div>
                        <div className="divide-y divide-gray-100">
                            {staff.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No staff members added yet.
                                </div>
                            ) : (
                                staff.map((teacher) => (
                                    <div key={teacher.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-lg">
                                                {teacher.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{teacher.name}</h4>
                                                <p className="text-sm text-gray-500">{teacher.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${teacher.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {teacher.status}
                                            </span>
                                            {canManageStaff && (
                                                <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="Manage Role">
                                                    <Settings className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {canManageStaff && (
                            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                                <Link to="/org-teachers" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All Staff &rarr;</Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Access to Courses */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Organisation Courses</h3>
                                <p className="text-sm text-gray-500">Manage all courses taught by your staff</p>
                            </div>
                        </div>
                        <Link to="/org-courses" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors whitespace-nowrap">
                            Manage Courses
                        </Link>
                    </div>
                </div>

                {/* Right Column: Widgets */}
                <div className="space-y-8">
                    {/* Recent Registrations */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Enrollments</h2>
                        <div className="space-y-4">
                            <div className="py-4 text-center text-gray-500 text-sm border border-dashed border-gray-200 rounded-xl bg-gray-50">
                                No recent enrollments
                            </div>
                        </div>
                    </div>

                    {/* Org Status Card */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-indigo-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Grow your Institute</h3>
                        <p className="text-sm text-indigo-700/80 mb-6">Invite more teachers to your Mentozy organization and scale your classes online.</p>
                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors">
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden text-left relative"
                        >
                            {/* Accent Glow Ring */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                            {/* Close Button */}
                            <button 
                                onClick={handleCloseMeetingModal}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* CONDITIONAL RENDER: Success Card or Setup Form */}
                            {createdMeetingDetails ? (
                                /* ==================== SUCCESS SCREEN ==================== */
                                <div className="p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-slate-100">
                                    <div className="text-center space-y-2">
                                        <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto">
                                            <Check className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Live Session Configured!</h3>
                                        <p className="text-slate-400 text-sm">Meeting credentials successfully provisioned.</p>
                                    </div>

                                    <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-5 space-y-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Topic</span>
                                            <span className="text-sm font-bold text-white">{createdMeetingDetails.topic}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Duration</span>
                                                <span className="text-xs font-semibold text-slate-200">{createdMeetingDetails.duration}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Invited Participants</span>
                                                <span className="text-xs font-semibold text-indigo-400">{createdMeetingDetails.participantsCount} Users</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-900 pt-3 space-y-3">
                                            {/* Join Link */}
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Join URL</span>
                                                <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                                                    <span className="text-xs text-indigo-300 truncate flex-1">{createdMeetingDetails.joinUrl}</span>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(createdMeetingDetails.joinUrl);
                                                            toast.success('Meeting link copied to clipboard!');
                                                        }}
                                                        className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-850"
                                                        title="Copy Link"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Meeting Credentials */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Meeting ID</span>
                                                    <div className="flex items-center gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-900 justify-between">
                                                        <span className="text-xs font-bold text-white">{createdMeetingDetails.meetingId}</span>
                                                        <button 
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(createdMeetingDetails.meetingId.replace(/\s/g, ''));
                                                                toast.success('Meeting ID copied!');
                                                            }}
                                                            className="text-slate-500 hover:text-slate-300"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Passcode</span>
                                                    <div className="flex items-center gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-900 justify-between">
                                                        <span className="text-xs font-bold text-amber-400">{createdMeetingDetails.passcode}</span>
                                                        <button 
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(createdMeetingDetails.passcode);
                                                                toast.success('Meeting Passcode copied!');
                                                            }}
                                                            className="text-slate-500 hover:text-slate-300"
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
                                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all text-center"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ==================== SETUP FORM SCREEN ==================== */
                                <div className="p-6 md:p-8 space-y-5 text-slate-100 max-h-[85vh] overflow-y-auto">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                                            <Video className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                                                Start Zoom Cohort Sync
                                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                            </h3>
                                            <p className="text-xs text-slate-400">Setup topic, duration, and invite active Mentozy members.</p>
                                        </div>
                                    </div>

                                    {/* Topic */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Session Topic</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                                            value={meetingTopic}
                                            onChange={e => setMeetingTopic(e.target.value)}
                                            placeholder="e.g. System Design live architecture build"
                                        />
                                    </div>

                                    {/* Date and Duration */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Start Time</label>
                                            <input 
                                                type="datetime-local" 
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none select-none"
                                                value={meetingDate}
                                                onChange={e => setMeetingDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</label>
                                            <select 
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
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
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Agenda / Description</label>
                                        <textarea 
                                            rows={2}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none resize-none"
                                            value={meetingDesc}
                                            onChange={e => setMeetingDesc(e.target.value)}
                                            placeholder="Explain what items will be discussed..."
                                        />
                                    </div>

                                    {/* Invite People Section */}
                                    <div className="space-y-2 border-t border-slate-800/80 pt-4">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Invite Cohort Members</label>
                                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                                {invitedUsers.length} Invited
                                            </span>
                                        </div>

                                        {/* Search Input Box */}
                                        <div className="relative">
                                            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                                            <input 
                                                type="text" 
                                                placeholder="Search by name (min 2 characters)..."
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        {/* Registered User Search Results */}
                                        {searchQuery.length >= 2 && (
                                            <div className="bg-slate-950 rounded-xl border border-slate-850 p-2 max-h-40 overflow-y-auto space-y-1">
                                                {isSearching ? (
                                                    <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs">
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                                        Searching live members...
                                                    </div>
                                                ) : searchResults.length === 0 ? (
                                                    <p className="text-[10px] text-slate-500 py-3 text-center">No registered members found under "{searchQuery}"</p>
                                                ) : (
                                                    searchResults.map(member => {
                                                        const isAlreadyInvited = invitedUsers.some(item => item.id === member.id);
                                                        const avatarInitials = (member.full_name || 'Student').split(' ').map((n: string) => n[0]).join('').substring(0, 2);
                                                        return (
                                                            <div 
                                                                key={member.id}
                                                                className="flex items-center justify-between p-2 hover:bg-slate-900/60 rounded-lg transition-all"
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    {member.avatar_url ? (
                                                                        <img src={member.avatar_url} alt={member.full_name} className="w-7 h-7 rounded-full object-cover border border-slate-850" />
                                                                    ) : (
                                                                        <div className="w-7 h-7 bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 rounded-full flex items-center justify-center font-bold text-xs">
                                                                            {avatarInitials}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <h5 className="text-xs font-bold text-white">
                                                                            {member.full_name}
                                                                        </h5>
                                                                        <p className="text-[9px] text-slate-500">{member.grade || 'Student'}</p>
                                                                    </div>
                                                                </div>

                                                                {isAlreadyInvited ? (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                                                        <Check className="w-3 h-3" />
                                                                        Invited
                                                                    </span>
                                                                ) : tempSelectedUser === member.id ? (
                                                                    <button 
                                                                        onClick={() => handleSendInvite(member)}
                                                                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[10px] font-bold transition-all"
                                                                    >
                                                                        Send Invite
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => setTempSelectedUser(member.id)}
                                                                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-[10px] font-bold transition-all"
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
                                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full"
                                                    >
                                                        {u.full_name}
                                                        <button 
                                                            onClick={() => setInvitedUsers(prev => prev.filter(item => item.id !== u.id))}
                                                            className="text-slate-400 hover:text-white"
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
                                            className="flex-1 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-2xl font-bold text-xs border border-slate-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleProvisionMeeting}
                                            disabled={isCreatingMeeting}
                                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isCreatingMeeting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Provisioning Room...
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
        </DashboardLayout>
    );
}

export default OrgDashboardPage;
