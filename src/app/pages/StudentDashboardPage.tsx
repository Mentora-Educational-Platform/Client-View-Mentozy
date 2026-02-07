import { useState, useEffect } from 'react';
import {
    BookOpen, ChevronRight, Clock,
    Search,
    Activity, Award, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Enrollment, Profile, Booking, getStudentEnrollments, getUserProfile, getStudentBookings } from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar } from '../../components/ui/calendar';
import { StudentBookingDetailsModal } from '../components/booking/StudentBookingDetailsModal';

export function StudentDashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            // Clear previous state to avoid flickering
            setProfile(null);

            try {
                const [profileData, enrollmentsData, bookingsData] = await Promise.all([
                    getUserProfile(user.id),
                    getStudentEnrollments(user.id),
                    getStudentBookings(user.id)
                ]);

                if (profileData) {
                    // Redirect if accessing wrong dashboard
                    if (profileData.role === 'mentor') {
                        navigate('/mentor-dashboard');
                        return;
                    }
                    setProfile(profileData);
                }

                if (enrollmentsData) setEnrollments(enrollmentsData);
                if (bookingsData) setBookings(bookingsData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [user]);

    // Derived Statistics
    // Derived Statistics
    console.log("Dashboard Render: ", { profile, enrollments, bookings, loading });

    const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
    const completedCourses = safeEnrollments.filter(e => e.status === 'completed');
    const completedCount = completedCourses.length;

    // Estimate hours: 10 hours per course * (progress / 100)
    const totalHours = Math.round(safeEnrollments.reduce((acc, curr) => acc + (10 * (curr.progress / 100)), 0));
    const lessonsCompleted = Math.round(safeEnrollments.reduce((acc, curr) => acc + (12 * (curr.progress / 100)), 0)); // Approx 12 lessons per course

    // Key Stats
    const streak = profile?.streak || 0;

    const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Student';

    // Sort Bookings by date
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const featureBookings = [...safeBookings].sort((a, b) => {
        const dateA = new Date(a.scheduled_at).getTime();
        const dateB = new Date(b.scheduled_at).getTime();
        return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });

    // Calendar Modifiers (Highlight booked dates)
    const bookedDates = featureBookings
        .map(b => new Date(b.scheduled_at))
        .filter(d => !isNaN(d.getTime()));

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(`/tracks?search=${e.currentTarget.value}`);
        }
    };

    const handleBookingClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setDetailsModalOpen(true);
    };

    return (
        <DashboardLayout>
            {/* Header / Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white shadow-xl shadow-amber-500/10 mb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
                        <p className="text-amber-100/90 text-lg">Ready to power up your brain today?</p>
                    </div>

                    {/* Search / Quick Action Area */}
                    <div className="flex-1 max-w-xl bg-white/10 backdrop-blur-md rounded-2xl p-2 pl-4 flex items-center border border-white/20 transition-colors focus-within:bg-white/20">
                        <div className="flex-1 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <Search className="w-4 h-4 text-white" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for courses (Press Enter)..."
                                className="bg-transparent border-none text-white placeholder-amber-100/70 focus:outline-none w-full"
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Pills */}
                <div className="relative z-10 flex flex-wrap gap-3 mt-8">
                    <Link to="/tracks" className="flex items-center gap-2 px-4 py-2 bg-white/90 text-amber-900 rounded-full text-sm font-semibold hover:bg-white transition-colors shadow-sm">
                        <Zap className="w-4 h-4 text-amber-500" /> Browse Courses
                    </Link>
                    <Link to="/mentors" className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur-sm">
                        <Activity className="w-4 h-4" /> Find Mentor
                    </Link>
                </div>

                {/* Decoration Circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-xl"></div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{streak}</h3>
                    <p className="text-sm text-gray-500 font-medium">Streak (days)</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{completedCount}</h3>
                    <p className="text-sm text-gray-500 font-medium">Courses completed</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{totalHours}</h3>
                    <p className="text-sm text-gray-500 font-medium">Hours learned</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{lessonsCompleted}</h3>
                    <p className="text-sm text-gray-500 font-medium">Lessons completed</p>
                </div>

                {/* Plan & Minutes Widget - REMOVED (Mock Data) */}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Courses & Activity) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* My Courses Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">My courses</h2>
                            <Link to="/tracks" className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5 mb-10">
                            {loading ? (
                                [1, 2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />)
                            ) : safeEnrollments.length > 0 ? (
                                safeEnrollments.slice(0, 2).map(enrollment => (
                                    <div key={enrollment.id} className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>

                                        <div className="relative p-7 flex flex-col h-full min-h-[220px]">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                        <BookOpen className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Course</span>
                                                </div>
                                                <h3 className="text-xl font-bold mb-2 leading-tight text-gray-900">{enrollment.tracks?.title}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2">{enrollment.tracks?.description || 'Continue your progress.'}</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                                                    <span>{enrollment.tracks?.level}</span>
                                                    <span className="text-indigo-600">{enrollment.progress}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${enrollment.progress}%` }}></div>
                                                </div>
                                                <Link to={`/tracks`} className="block w-full text-center py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                                                    Continue Learning
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 p-10 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 mb-4">No active courses yet.</p>
                                    <Link to="/tracks" className="inline-flex items-center justify-center px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors">Start Learning</Link>
                                </div>
                            )}
                        </div>

                        {/* Recommended For You Section - REMOVED (Mock Data) */}
                    </div>
                </div>

                {/* Right Column (Widgets) */}
                <div className="space-y-8">

                    {/* Calendar Widget (Real Bookings) */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="flex items-center justify-between mb-4 w-full">
                            <h2 className="text-xl font-bold text-gray-900">Calendar</h2>
                        </div>

                        <Calendar
                            mode="single"
                            selected={new Date()}
                            className="rounded-xl border border-gray-100 shadow-none w-full"
                            modifiers={{ booked: bookedDates }}
                            modifiersClassNames={{ booked: "font-bold text-amber-600 bg-amber-50" }}
                        />

                        {/* Events List */}
                        <div className="space-y-3 w-full mt-6">
                            {featureBookings.length > 0 ? (
                                featureBookings.slice(0, 3).map(booking => (
                                    <div
                                        key={booking.id}
                                        onClick={() => handleBookingClick(booking)}
                                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex flex-col items-center justify-center font-bold border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                                            <span className="text-[10px] uppercase opacity-70 leading-tight">{new Date(booking.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="text-lg leading-none">{new Date(booking.scheduled_at).getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm truncate">{booking.mentors?.name || 'Mentor'}</h4>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-400 text-xs">
                                    <p>No upcoming sessions.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Certifications Widget (Real Completed Courses) */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Certifications</h2>
                            <Link to="/profile" className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>

                        {completedCourses.length > 0 ? (
                            completedCourses.map(course => (
                                <div key={course.id} className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-5 shadow-sm mb-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center text-white text-xs font-bold">M</div>
                                        <span className="text-xs font-bold text-gray-500">Mentozy</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{course.tracks?.title}</h3>

                                    <div className="mt-6 flex items-end justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400">Issued to</p>
                                            <p className="text-xs font-bold text-gray-900">{firstName}</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400">Verified</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 text-xs">Complete a course to earn a certificate.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>


            <StudentBookingDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                booking={selectedBooking}
            />
        </DashboardLayout >
    );
}