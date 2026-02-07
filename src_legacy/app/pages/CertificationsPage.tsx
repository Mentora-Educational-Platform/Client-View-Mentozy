import { useEffect, useState } from 'react';
import {
    Award, Download, ExternalLink, ShieldCheck,
    Search, Filter,
    GraduationCap, Loader2
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getStudentEnrollments, getUserProfile, Enrollment, Profile } from '../../lib/api';

export default function CertificationsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        async function loadData() {
            if (!user) return;
            try {
                const [enrollmentsData, profileData] = await Promise.all([
                    getStudentEnrollments(user.id),
                    getUserProfile(user.id)
                ]);
                setEnrollments(enrollmentsData || []);
                setProfile(profileData);
            } catch (error) {
                console.error("Failed to load certifications data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);

    const completedEnrollments = enrollments.filter(e => e.status === 'completed');
    const studentName = profile?.full_name || user?.user_metadata?.full_name || 'Student';

    return (
        <DashboardLayout>
            <div className="space-y-10 pb-16">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            Your Achievements
                            <div className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-bold uppercase tracking-widest border border-amber-200">
                                {completedEnrollments.length} Verified
                            </div>
                        </h1>
                        <p className="text-gray-500 font-medium mt-2 text-lg">Download and share your verifiable learning credentials</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search certificates..."
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 w-64 shadow-sm"
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                            <Filter className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Main Certificates Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {completedEnrollments.length > 0 ? (
                                completedEnrollments.map((enrollment) => (
                                    <div
                                        key={enrollment.id}
                                        className="relative group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden ring-2 ring-indigo-500/10"
                                    >
                                        {/* Decorative Background Elements */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 bg-indigo-600"></div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all duration-500 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                                                    <Award className="w-7 h-7" />
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 mb-1">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Verified
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight min-h-[3.5rem] line-clamp-2">
                                                {enrollment.tracks?.title || 'Course Completion'}
                                            </h3>

                                            <div className="space-y-4 mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                        <GraduationCap className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issued To</p>
                                                        <p className="text-sm font-bold text-gray-700">{studentName}</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-gray-50/50 rounded-2xl mb-8 border border-gray-100/50">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Certificate ID</p>
                                                    <p className="text-xs font-mono font-bold text-gray-600 text-center select-all">MEN-CERT-{enrollment.id.substring(0, 8).toUpperCase()}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button className="flex-1 bg-gray-900 text-white py-3 rounded-2xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200">
                                                    <Download className="w-4 h-4" />
                                                    PDF Download
                                                </button>
                                                <button className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all shadow-sm">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Award className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No Certificates Yet</h3>
                                    <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                                        Complete a course to earn your first professional certificate and showcase your skills.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
