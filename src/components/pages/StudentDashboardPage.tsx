"use client";
import { useState, useEffect } from 'react';
import {
    BookOpen, ChevronRight,
    Search,
    Zap, Activity, Award, Cpu, Heart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Enrollment, Profile, Booking, getStudentEnrollments, getUserProfile, getStudentBookings } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';

export function StudentDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            try {
                const [profileData, enrollmentsData, bookingsData] = await Promise.all([
                    getUserProfile(user.id),
                    getStudentEnrollments(user.id),
                    getStudentBookings(user.id)
                ]);

                if (profileData) setProfile(profileData);
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
    const completedCourses = enrollments.filter(e => e.status === 'completed');
    const completedCount = completedCourses.length;

    // Estimate hours: 10 hours per course * (progress / 100)
    const totalHours = Math.round(enrollments.reduce((acc, curr) => acc + (10 * (curr.progress / 100)), 0));
    const lessonsCompleted = Math.round(enrollments.reduce((acc, curr) => acc + (12 * (curr.progress / 100)), 0)); // Approx 12 lessons per course

    // Key Stats
    const streak = profile?.streak || 0;

    const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Student';

    // Sort Bookings by date
    const featureBookings = [...bookings].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    // Calendar Modifiers (Highlight booked dates)
    const bookedDates = featureBookings.map(b => new Date(b.scheduled_at));

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.push(`/tracks?search=${e.currentTarget.value}`);
        }
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
                    <Link href="/tracks" className="flex items-center gap-2 px-4 py-2 bg-white/90 text-amber-900 rounded-full text-sm font-semibold hover:bg-white transition-colors shadow-sm">
                        <Zap className="w-4 h-4 text-amber-500" /> Browse Courses
                    </Link>
                    <Link href="/mentors" className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur-sm">
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

                {/* Plan & Minutes Widget */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-indigo-900">Premium</h3>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-full">Plan</span>
                        </div>
                        <div className="flex items-end gap-1 mb-1">
                            <h3 className="text-3xl font-bold text-indigo-600">30</h3>
                            <span className="text-sm text-gray-400 font-bold mb-1">/ 100m</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Live minutes used</p>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-100 rounded-full blur-xl group-hover:bg-indigo-200 transition-colors"></div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Courses & Activity) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* My Courses Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">My courses</h2>
                            <Link href="/tracks" className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5 mb-10">
                            {loading ? (
                                [1, 2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />)
                            ) : enrollments.length > 0 ? (
                                enrollments.slice(0, 2).map(enrollment => (
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
                                                <Link href={`/tracks`} className="block w-full text-center py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
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
                                    <Link href="/tracks" className="inline-flex items-center justify-center px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors">Start Learning</Link>
                                </div>
                            )}
                        </div>

                        {/* Recommended For You Section */}
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Recommended for you</h2>
                                <Link href="/tracks" className="text-amber-600 font-bold text-sm hover:underline flex items-center gap-1">
                                    View Library <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 relative overflow-hidden group shadow-lg">
                                    <div className="relative z-10">
                                        <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/20 inline-block mb-4">Popular</div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Mastering AI & Data Science</h3>
                                        <p className="text-indigo-100 text-sm mb-6 max-w-[200px]">Unlock the power of intelligence with our most taken track.</p>
                                        <Link href="/tracks" className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">Explorer Now</Link>
                                    </div>
                                    <Cpu className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                                </div>

                                <div className="bg-gradient-to-br from-rose-500 to-orange-600 rounded-3xl p-8 relative overflow-hidden group shadow-lg">
                                    <div className="relative z-10">
                                        <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/20 inline-block mb-4">Trending</div>
                                        <h3 className="text-2xl font-bold text-white mb-2">UX & Branding Mastery</h3>
                                        <p className="text-rose-100 text-sm mb-6 max-w-[200px]">Learn to design products that customers actually love.</p>
                                        <button className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors">Explorer Now</button>
                                    </div>
                                    <Heart className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
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
                                    <div key={booking.id} className="p-3 bg-indigo-50 rounded-xl flex items-start gap-3">
                                        <div className="w-1 h-10 bg-indigo-500 rounded-full"></div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-xs">{booking.mentors?.name || 'Mentor Session'}</h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5">
                                                {new Date(booking.scheduled_at).toLocaleDateString()} at {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
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
                            <Link href="/profile" className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
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
        </DashboardLayout >
    );
}
