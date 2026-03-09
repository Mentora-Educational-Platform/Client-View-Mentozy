import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Users, GraduationCap, DollarSign, UserPlus, Settings, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getUserProfile } from '../../lib/api';

export function OrgDashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [staff] = useState<any[]>([]);
    const [orgProfile, setOrgProfile] = useState<any>(null);

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

    return (
        <DashboardLayout>
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-500/10 mb-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome, {orgName}!</h1>
                        <p className="text-blue-100 text-lg">Manage your entire institute from one place.</p>
                    </div>
                    {canManageStaff && (
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-full font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm self-start md:self-auto">
                            <UserPlus className="w-5 h-5" />
                            Add Teacher
                        </button>
                    )}
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
                        <h3 className="text-2xl font-bold text-gray-900">0</h3>
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
                                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All Staff &rarr;</button>
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
        </DashboardLayout>
    );
}

export default OrgDashboardPage;
