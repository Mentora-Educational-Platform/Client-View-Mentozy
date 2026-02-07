
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, getMentorBookings, updateBookingStatus, acceptBooking, updateMentorStatus, Profile, Booking } from '../../lib/api';
import { getSupabase } from '../../lib/supabase';
import {
    Loader2, Calendar, Clock, User, CheckCircle2,
    DollarSign, ChevronRight, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { AcceptSessionModal } from '../components/booking/AcceptSessionModal';
import { StudentProfileModal } from '../components/mentor/StudentProfileModal';

export function MentorDashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [profile, setProfile] = useState<Profile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [mentorDetails, setMentorDetails] = useState<any>(null); // { hourly_rate, company }
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal State
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [viewProfileModalOpen, setViewProfileModalOpen] = useState(false);
    const [viewProfileData, setViewProfileData] = useState<Profile | null>(null);

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

                // 1. Parallel Fetch: Profile & Bookings
                const [userProfile, userBookings] = await Promise.all([
                    getUserProfile(user.id),
                    getMentorBookings(user.id)
                ]);

                if (userProfile) {
                    // Redirect if accessing wrong dashboard
                    if (userProfile.role === 'student') {
                        navigate('/student-dashboard');
                        return;
                    }
                    setProfile(userProfile);
                }

                setBookings(userBookings);

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

    const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
        setProcessingId(bookingId);
        try {
            const success = await updateBookingStatus(bookingId, action);
            if (success) {
                toast.success(action === 'confirmed' ? 'Session Accepted' : 'Session Declined');
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

    const handleAcceptClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setAcceptModalOpen(true);
    };

    const handleConfirmAccept = async (meetingLink: string, note: string, paymentLink: string) => {
        if (!selectedBooking) return false;

        const success = await acceptBooking(selectedBooking.id, meetingLink, note, paymentLink);

        if (success) {
            toast.success("Session Accepted Successfully");
            // Optimistic Update
            setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'confirmed' } : b));
            setSelectedBooking(null);
            return true;
        } else {
            toast.error("Failed to accept session");
            return false;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-500/10 mb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
                        <p className="text-blue-100/90 text-lg">You have <span className="font-bold text-white">{pendingBookings.length} pending requests</span> to review.</p>
                    </div>
                </div>
                {/* Decoration Circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-xl"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Earnings</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">${estimatedEarnings}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Upcoming</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{confirmedBookings.length}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Pending</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{pendingBookings.length}</p>
                </div>

                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-5 rounded-2xl border border-violet-500/20 shadow-lg shadow-violet-500/20 relative overflow-hidden group text-white">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-violet-100">Completed</span>
                        </div>
                        <p className="text-3xl font-black">{completedBookings.length}</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Requests & Schedule */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Pending Requests */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            Requests <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{pendingBookings.length}</span>
                        </h2>
                        {pendingBookings.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 border-dashed">
                                <p className="text-gray-500 text-sm">No pending requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingBookings.map(booking => (
                                    <div key={booking.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div
                                                    className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                                                    onClick={() => {
                                                        setViewProfileData(booking.profiles || null);
                                                        setViewProfileModalOpen(true);
                                                    }}
                                                >
                                                    {booking.profiles?.avatar_url ? (
                                                        <img src={booking.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-gray-400" />
                                                    )}
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
                                                            {booking.profiles?.full_name || 'Unknown Student'}
                                                        </h4>
                                                        <button
                                                            onClick={() => {
                                                                setViewProfileData(booking.profiles || null);
                                                                setViewProfileModalOpen(true);
                                                            }}
                                                            className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                        >
                                                            View Profile
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(booking.scheduled_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-5 pt-4 border-t border-gray-50">
                                            <button
                                                onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                                disabled={processingId === booking.id}
                                                className="flex-1 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleAcceptClick(booking)}
                                                disabled={processingId === booking.id}
                                                className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {processingId === booking.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Schedule */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Schedule</h2>
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {confirmedBookings.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <p className="text-sm">No upcoming sessions.</p>
                                    </div>
                                ) : (
                                    confirmedBookings.map(booking => (
                                        <div key={booking.id} className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex flex-col items-center justify-center font-bold border border-indigo-100 flex-shrink-0">
                                                    <span className="text-[10px] uppercase opacity-70 leading-tight">{new Date(booking.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                    <span className="text-lg leading-none">{new Date(booking.scheduled_at).getDate()}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4
                                                            className="font-bold text-gray-900 text-sm hover:text-indigo-600 cursor-pointer"
                                                            onClick={() => {
                                                                setViewProfileData(booking.profiles || null);
                                                                setViewProfileModalOpen(true);
                                                            }}
                                                        >
                                                            {booking.profiles?.full_name}
                                                        </h4>
                                                        <button
                                                            onClick={() => {
                                                                setViewProfileData(booking.profiles || null);
                                                                setViewProfileModalOpen(true);
                                                            }}
                                                            className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href={booking.meeting_link || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Profile/Quick Actions (Placeholder) */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 text-sm font-medium text-gray-700">
                                <span>Availability</span>
                                <button
                                    onClick={async () => {
                                        if (!mentorDetails) return;
                                        const newStatus = mentorDetails.status === 'unavailable' ? 'active' : 'unavailable';

                                        // Optimistic Update
                                        setMentorDetails({ ...mentorDetails, status: newStatus });

                                        const success = await updateMentorStatus(user?.id || '', newStatus);
                                        if (success) {
                                            toast.success(`You are now ${newStatus === 'active' ? 'Online' : 'Offline'}`);
                                        } else {
                                            toast.error("Failed to update status");
                                            setMentorDetails({ ...mentorDetails }); // Revert
                                        }
                                    }}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${mentorDetails?.status === 'unavailable' ? 'bg-gray-200' : 'bg-emerald-500'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mentorDetails?.status === 'unavailable' ? 'translate-x-1' : 'translate-x-6'}`}
                                    />
                                </button>
                            </div>
                            <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

            </div>


            {/* Accept Session Modal */}
            <AcceptSessionModal
                isOpen={acceptModalOpen}
                onClose={() => setAcceptModalOpen(false)}
                studentName={selectedBooking?.profiles?.full_name || 'Student'}
                onConfirm={handleConfirmAccept}
            />

            <StudentProfileModal
                isOpen={viewProfileModalOpen}
                onClose={() => setViewProfileModalOpen(false)}
                profile={viewProfileData}
            />
        </DashboardLayout >
    );
}

export default MentorDashboardPage;
