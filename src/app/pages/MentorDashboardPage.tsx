
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { OrgMentorDashboard } from '../components/dashboard/OrgMentorDashboard';
import { getUserProfile, getMentorBookings, updateBookingStatus, acceptBooking, updateMentorStatus, Profile, Booking, getPendingOrgInvitesForMentor, respondToOrgInvite } from '../../lib/api';
import { getSupabase } from '../../lib/supabase';
import {
    Loader2, Calendar, Clock, User, CheckCircle2,
    DollarSign, ChevronRight, AlertCircle, TrendingUp, 
    Sparkles, Users, Video, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { StudentProfileModal } from '../components/mentor/StudentProfileModal';
import { LiveSessionModal } from '../components/video/LiveSessionModal';
import { AcceptSessionModal } from '../components/booking/AcceptSessionModal';

export function MentorDashboardPage() {
    const { user } = useAuth();
    const { mode, activeOrganization } = useOrganizationMode();
    const navigate = useNavigate();

    // State
    const [profile, setProfile] = useState<Profile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [mentorDetails, setMentorDetails] = useState<any>(null); // { hourly_rate, company }
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [orgInvites, setOrgInvites] = useState<any[]>([]);

    // Modal State
    const [viewProfileModalOpen, setViewProfileModalOpen] = useState(false);
    const [viewProfileData, setViewProfileData] = useState<Profile | null>(null);
    const [liveSessionOpen, setLiveSessionOpen] = useState(false);
    const [liveSessionParticipantName, setLiveSessionParticipantName] = useState('Student');
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [bookingToAccept, setBookingToAccept] = useState<Booking | null>(null);

    // Derived State
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    const completedBookings = bookings.filter(b => b.status === 'completed');

    // Earnings Calculation (Mock: Completed * Rate)
    // In a real app, this would be more complex transaction history
    const estimatedEarnings = (confirmedBookings.length + completedBookings.length) * (mentorDetails?.hourly_rate || 0);

    const firstName = profile?.full_name?.split(' ')[0] || 'Mentor';

    useEffect(() => {
        async function loadData() {
            if (!user) {
                navigate('/login');
                return;
            }

            // Clear prior state
            setProfile(null);

            try {
                const supabase = getSupabase();

                // 1. Ensure mentor application is approved before dashboard access
                if (supabase) {
                    const { data: applicationData } = await supabase
                        .from('mentor_applications')
                        .select('status')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (applicationData && applicationData.status !== 'approved') {
                        toast.info(`Your mentor application is currently ${applicationData.status}. Dashboard unlocks after approval.`);
                        navigate('/teacher-success?status=pending&type=mentor', { replace: true });
                        return;
                    }
                }

                // 2. Parallel Fetch: Profile & Bookings & Invites
                const [userProfile, userBookings, invitesData] = await Promise.all([
                    getUserProfile(user.id),
                    getMentorBookings(user.id),
                    getPendingOrgInvitesForMentor(user.id)
                ]);

                if (userProfile) {
                    // Redirect if accessing wrong dashboard
                    if (userProfile.role === 'student') {
                        navigate('/student-dashboard', { replace: true });
                        return;
                    }
                    if (user?.user_metadata?.is_org) {
                        navigate('/org-dashboard', { replace: true });
                        return;
                    }
                    setProfile(userProfile);
                }

                setBookings(userBookings || []);
                setOrgInvites(invitesData || []);

                // 2. Fetch Mentor Details (Rate)
                if (supabase) {
                    const { data: mentorData } = await supabase
                        .from('mentors')
                        .select('hourly_rate, company, bio, status')
                        .eq('user_id', user.id)
                        .single();
                    setMentorDetails(mentorData);
                }

            } catch (error) {
                console.error("Failed to load mentor dashboard data", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user, navigate]);

    const handleBookingAction = async (bookingId: string, action: 'accepted' | 'cancelled') => {
        setProcessingId(bookingId);
        try {
            const success = await updateBookingStatus(bookingId, action);
            if (success) {
                toast.success(action === 'accepted' ? 'Session Accepted. Awaiting payment confirmation.' : 'Session Declined');
                // Optimistic Update
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: action } : b));
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            toast.error("Action failed. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleOrgInviteResponse = async (inviteId: string, orgId: string, accept: boolean) => {
        if(!user) return;
        setProcessingId(inviteId);
        try {
            const success = await respondToOrgInvite(inviteId, orgId, user.id, accept);
            if(success) {
                toast.success(accept ? "Joined Organization successfully!" : "Invitation declined.");
                setOrgInvites(prev => prev.filter(i => i.id !== inviteId));
            } else {
                toast.error("Failed to respond to invitation.");
            }
        } finally {
            setProcessingId(null);
        }
    };

    const handleAcceptBooking = async (note: string) => {
        if (!bookingToAccept) return false;
        setProcessingId(bookingToAccept.id);
        console.log(`[Dashboard] Attempting to accept booking: ${bookingToAccept.id}`);
        try {
            const success = await acceptBooking(bookingToAccept.id, {
                note
            });
            if (success) {
                toast.success("Session accepted. Student can now pay and receive class details.");
                setBookings(prev => prev.map(b => b.id === bookingToAccept.id ? {
                    ...b,
                    status: 'accepted',
                    mentor_note: note
                } : b));
                setAcceptModalOpen(false);
                setBookingToAccept(null);
                return true;
            } else {
                console.error(`[Dashboard] Failed to accept booking ${bookingToAccept.id}. See API logs for details.`);
                toast.error("Failed to accept session. Please check your internet connection or try again later.");
                return false;
            }
        } catch (error) {
            console.error(`[Dashboard] Catch block error accepting booking:`, error);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    // Organization mode: show isolated org mentor dashboard
    if (mode === 'organization' && activeOrganization) {
        return (
            <DashboardLayout>
                <OrgMentorDashboard />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 md:p-10 text-white shadow-2xl shadow-indigo-500/20 mb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider">
                                Mentor Dashboard
                            </span>
                            {mentorDetails?.status === 'active' && (
                                <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full backdrop-blur-sm">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    Online
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-3">Welcome back, {firstName}!</h1>
                        <p className="text-indigo-100 text-base md:text-lg max-w-md">
                            {pendingBookings.length > 0 ? (
                                <>You have <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg">{pendingBookings.length} pending requests</span> waiting for your review.</>
                            ) : (
                                <>All caught up! Check your upcoming sessions below.</>
                            )}
                        </p>
                    </div>
                    
                    {/* Quick Stats Mini */}
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[100px] text-center">
                            <p className="text-3xl font-black">${estimatedEarnings}</p>
                            <p className="text-indigo-200 text-xs font-medium">Earnings</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[100px] text-center">
                            <p className="text-3xl font-black">{completedBookings.length + confirmedBookings.length}</p>
                            <p className="text-indigo-200 text-xs font-medium">Sessions</p>
                        </div>
                    </div>
                </div>
                
                {/* Decoration Elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br from-pink-500/30 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-60 h-60 bg-gradient-to-tr from-blue-500/30 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Quick Stats Grid - Enhanced Bento Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Earnings Card - Featured */}
                <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-emerald-200" />
                        </div>
                        <h3 className="text-4xl font-black text-white mb-1">${estimatedEarnings}</h3>
                        <p className="text-emerald-100 font-medium text-sm">Total Earnings</p>
                    </div>
                </div>

                {/* Upcoming Sessions */}
                <div className="group bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6 text-indigo-600" />
                        </div>
                        <Video className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-1">{confirmedBookings.length}</h3>
                    <p className="text-gray-500 font-medium text-sm">Upcoming</p>
                </div>

                {/* Pending Requests */}
                <div className="group bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                    {pendingBookings.length > 0 && (
                        <div className="absolute top-3 right-3">
                            <span className="flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-1">{pendingBookings.length}</h3>
                    <p className="text-gray-500 font-medium text-sm">Pending</p>
                </div>

                {/* Completed - Featured Dark */}
                <div className="group relative bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-3xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <Sparkles className="w-5 h-5 text-violet-200" />
                        </div>
                        <h3 className="text-4xl font-black text-white mb-1">{completedBookings.length}</h3>
                        <p className="text-violet-200 font-medium text-sm">Completed</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Requests & Schedule */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Organization Invites */}
                    {orgInvites.length > 0 && (
                        <div className="mb-2">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                Organization Invites <span className="text-sm font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{orgInvites.length} pending</span>
                            </h2>
                            <div className="space-y-4">
                                {orgInvites.map(invite => (
                                    <div key={invite.id} className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-amber-100 flex flex-col items-center justify-center font-bold overflow-hidden flex-shrink-0">
                                                {invite.org?.avatar_url ? <img src={invite.org.avatar_url} className="w-full h-full object-cover" /> : <User className="text-amber-500 w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{invite.org?.full_name || 'An Organization'}</h4>
                                                <p className="text-sm text-gray-600">Invited you to join their teaching staff.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleOrgInviteResponse(invite.id, invite.org_id, false)}
                                                disabled={processingId === invite.id}
                                                className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleOrgInviteResponse(invite.id, invite.org_id, true)}
                                                disabled={processingId === invite.id}
                                                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
                                            >
                                                {processingId === invite.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pending Requests */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Session Requests</h2>
                                    <p className="text-sm text-gray-500">{pendingBookings.length} awaiting review</p>
                                </div>
                            </div>
                            {pendingBookings.length > 0 && (
                                <span className="flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                    Needs Action
                                </span>
                            )}
                        </div>
                        
                        {pendingBookings.length === 0 ? (
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 text-center border-2 border-dashed border-gray-200">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-7 h-7 text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">All Caught Up</h3>
                                <p className="text-gray-500 text-sm">No pending requests at the moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingBookings.map(booking => (
                                    <div key={booking.id} className="group bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div
                                                    className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all group-hover:scale-105"
                                                    onClick={() => {
                                                        setViewProfileData(booking.profiles || null);
                                                        setViewProfileModalOpen(true);
                                                    }}
                                                >
                                                    {booking.profiles?.avatar_url ? (
                                                        <img src={booking.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-7 h-7 text-indigo-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4
                                                            className="font-bold text-gray-900 hover:text-indigo-600 cursor-pointer text-lg"
                                                            onClick={() => {
                                                                setViewProfileData(booking.profiles || null);
                                                                setViewProfileModalOpen(true);
                                                            }}
                                                        >
                                                            {booking.profiles?.full_name || 'Unknown Student'}
                                                        </h4>
                                                        <button
                                                            onClick={() => {
                                                                setViewProfileData(booking.profiles || null);
                                                                setViewProfileModalOpen(true);
                                                            }}
                                                            className="text-xs bg-indigo-50 px-2.5 py-1 rounded-lg font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            View Profile
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 mt-2">
                                                        <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg font-medium">
                                                            <Calendar className="w-4 h-4 text-gray-500" />
                                                            {new Date(booking.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg font-medium">
                                                            <Clock className="w-4 h-4 text-gray-500" />
                                                            {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                                            <button
                                                onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                                disabled={processingId === booking.id}
                                                className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setBookingToAccept(booking);
                                                    setAcceptModalOpen(true);
                                                }}
                                                disabled={processingId === booking.id}
                                                className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                                            >
                                                {processingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                Accept Session
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Schedule */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                                    <p className="text-sm text-gray-500">{confirmedBookings.length} confirmed</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-lg overflow-hidden">
                            {confirmedBookings.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Video className="w-7 h-7 text-indigo-400" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">No Upcoming Sessions</h3>
                                    <p className="text-gray-500 text-sm">Your confirmed sessions will appear here.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {confirmedBookings.map((booking, index) => (
                                        <div key={booking.id} className="group p-5 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-white transition-all flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 ${index === 0 ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'} rounded-2xl flex flex-col items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                                    <span className={`text-[10px] uppercase ${index === 0 ? 'opacity-80' : 'opacity-70'} leading-tight tracking-wider`}>{new Date(booking.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                    <span className="text-xl font-black leading-none">{new Date(booking.scheduled_at).getDate()}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4
                                                            className="font-bold text-gray-900 hover:text-indigo-600 cursor-pointer"
                                                            onClick={() => {
                                                                setViewProfileData(booking.profiles || null);
                                                                setViewProfileModalOpen(true);
                                                            }}
                                                        >
                                                            {booking.profiles?.full_name}
                                                        </h4>
                                                        {index === 0 && (
                                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                                                                Next Up
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-sm font-medium text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setViewProfileData(booking.profiles || null);
                                                                setViewProfileModalOpen(true);
                                                            }}
                                                            className="text-indigo-600 hover:underline font-semibold"
                                                        >
                                                            View Profile
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setLiveSessionParticipantName(booking.profiles?.full_name || 'Student');
                                                    setLiveSessionOpen(true);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all"
                                            >
                                                <Video className="w-4 h-4" />
                                                <span className="hidden sm:inline">Join</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Profile/Quick Actions */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-xl text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Status
                                </h3>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${mentorDetails?.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700 text-gray-400'}`}>
                                    {mentorDetails?.status === 'active' ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-300">Availability</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Toggle to accept new bookings</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!mentorDetails) return;
                                        const newStatus = mentorDetails.status === 'unavailable' ? 'active' : 'unavailable';
                                        setMentorDetails({ ...mentorDetails, status: newStatus });
                                        const success = await updateMentorStatus(user?.id || '', newStatus);
                                        if (success) {
                                            toast.success(`You are now ${newStatus === 'active' ? 'Online' : 'Offline'}`);
                                        } else {
                                            toast.error("Failed to update status");
                                            setMentorDetails({ ...mentorDetails });
                                        }
                                    }}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${mentorDetails?.status === 'unavailable' ? 'bg-gray-700' : 'bg-emerald-500 shadow-lg shadow-emerald-500/30'}`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${mentorDetails?.status === 'unavailable' ? 'translate-x-1' : 'translate-x-8'}`}
                                    />
                                </button>
                            </div>

                            {/* Hourly Rate */}
                            {mentorDetails?.hourly_rate && (
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <div>
                                        <p className="text-sm font-medium text-gray-300">Hourly Rate</p>
                                        <p className="text-2xl font-black text-white mt-1">${mentorDetails.hourly_rate}</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-emerald-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-lg">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <button className="group w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-white border border-gray-100 hover:border-indigo-200 text-sm font-semibold text-gray-700 transition-all">
                                <span className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <User className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    Edit Profile
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button className="group w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white hover:from-violet-50 hover:to-white border border-gray-100 hover:border-violet-200 text-sm font-semibold text-gray-700 transition-all">
                                <span className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Calendar className="w-4 h-4 text-violet-600" />
                                    </div>
                                    Manage Availability
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button className="group w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white hover:from-emerald-50 hover:to-white border border-gray-100 hover:border-emerald-200 text-sm font-semibold text-gray-700 transition-all">
                                <span className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    View Earnings
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>


            <LiveSessionModal
                isOpen={liveSessionOpen}
                onClose={() => setLiveSessionOpen(false)}
                participantName={liveSessionParticipantName}
            />

            <StudentProfileModal
                isOpen={viewProfileModalOpen}
                onClose={() => setViewProfileModalOpen(false)}
                profile={viewProfileData}
            />

            <AcceptSessionModal
                isOpen={acceptModalOpen}
                onClose={() => {
                    if (processingId) return;
                    setAcceptModalOpen(false);
                    setBookingToAccept(null);
                }}
                studentName={bookingToAccept?.profiles?.full_name || 'Student'}
                onConfirm={handleAcceptBooking}
            />
        </DashboardLayout >
    );
}

export default MentorDashboardPage;
