import { useState, useEffect } from 'react';
import {
    BookOpen, Search, Clock, BarChart,
    PlayCircle, Loader2, Star, Layers, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Enrollment, getStudentEnrollments, getOrgStudentEnrollments, getOrgTracks, enrollInTrack } from '../../lib/api';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface StudentEnrollmentView extends Omit<Enrollment, 'status'> {
    status: Enrollment['status'] | 'not_enrolled';
}

export function CoursesPage() {
    const { user } = useAuth();
    const { mode, activeOrganization } = useOrganizationMode();
    const [enrollments, setEnrollments] = useState<StudentEnrollmentView[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [enrollingTrackId, setEnrollingTrackId] = useState<number | null>(null);
    const [reloadTrigger, setReloadTrigger] = useState(0);

    const isOrgMode = mode === 'organization' && activeOrganization;

    useEffect(() => {
        let active = true;

        const loadEnrollments = async () => {
            if (!user) return;
            setLoading(true);
            try {
                let data = [];
                if (isOrgMode) {
                    const enrolled = await getOrgStudentEnrollments(user.id, activeOrganization.id);
                    const orgTracks = await getOrgTracks(activeOrganization.id);
                    
                    const enrolledTrackIds = new Set(enrolled.map(e => e.track_id));
                    
                    const mockEnrollments = orgTracks
                        .filter(track => track.id !== undefined && !enrolledTrackIds.has(track.id))
                        .map(track => ({
                            id: `mock-${track.id}`,
                            user_id: user.id,
                            track_id: track.id!,
                            status: 'not_enrolled' as const,
                            progress: 0,
                            enrolled_at: new Date().toISOString(),
                            tracks: track
                        }));
                    
                    data = [...enrolled, ...mockEnrollments];
                } else {
                    data = await getStudentEnrollments(user.id);
                }
                
                if (active) {
                    setEnrollments(data);
                }
            } catch (error) {
                console.error("Failed to load enrollments", error);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };
        loadEnrollments();

        return () => {
            active = false;
        };
    }, [user, mode, activeOrganization?.id, reloadTrigger]);

    const handleEnroll = async (trackId: number) => {
        if (!user) return;
        setEnrollingTrackId(trackId);
        try {
            const success = await enrollInTrack(user.id, trackId);
            if (success) {
                toast.success("Successfully enrolled in course!");
                setReloadTrigger(prev => prev + 1);
            } else {
                toast.error("Failed to enroll in course. Please try again.");
            }
        } catch (error) {
            console.error("Error during manual enrollment:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setEnrollingTrackId(null);
        }
    };

    const filteredEnrollments = enrollments.filter(e => {
        const matchesSearch = (e.tracks?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || e.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <DashboardLayout>
            <div className="font-mono text-gray-900 min-h-screen bg-[#FAF9F6] p-4 sm:p-8 rounded-3xl border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] select-none space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-gray-900 pb-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-8 h-8 text-[#818CF8]" />
                            {isOrgMode ? 'My Org Courses' : 'My Learning'}
                        </h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                            {isOrgMode 
                                ? `Manage and continue tracks enrolled in ${activeOrganization.name}.` 
                                : "Manage and continue your enrolled tracks."
                            }
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-450" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border-2 border-gray-900 rounded-xl focus:outline-none font-bold text-xs"
                            />
                        </div>
                        <div className="flex bg-white border-2 border-gray-900 rounded-xl p-1 shrink-0">
                            {(['all', 'active', 'completed'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all capitalize cursor-pointer ${filter === f
                                        ? 'bg-[#FFD166] text-gray-900 border border-gray-900'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl border-4 border-gray-900 p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-pulse">
                                <div className="h-32 bg-gray-100 rounded-2xl"></div>
                                <div className="h-6 bg-gray-100 rounded-lg w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredEnrollments.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEnrollments.map((enrollment) => (
                            <div 
                                key={enrollment.id} 
                                className="group bg-white rounded-3xl border-4 border-gray-900 p-6 hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all duration-200 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden"
                            >
                                {/* Status Chip */}
                                <div className="absolute top-6 right-6">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] ${
                                        enrollment.status === 'completed'
                                            ? 'bg-[#06D6A0] text-black'
                                            : enrollment.status === 'not_enrolled'
                                            ? 'bg-[#E2E8F0] text-[#64748B]'
                                            : 'bg-[#FFD166] text-black'
                                        }`}>
                                        {enrollment.status === 'not_enrolled' ? 'not enrolled' : enrollment.status}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <div className="w-12 h-12 bg-[#E0F2FE] border-2 border-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                                        <BookOpen className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-955 mb-2 leading-tight uppercase truncate">
                                        {enrollment.tracks?.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-sans line-clamp-3 leading-relaxed mb-6">
                                        {enrollment.tracks?.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 bg-[#FAF9F6] p-3 rounded-2xl border-2 border-gray-900 text-[10px] font-bold mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                            {enrollment.tracks?.duration}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <BarChart className="w-3.5 h-3.5 text-indigo-500" />
                                            {enrollment.tracks?.level}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t-2 border-gray-900 shrink-0 bg-white">
                                    {enrollment.status === 'not_enrolled' ? (
                                        <>
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase">
                                                <span className="text-gray-400 font-bold">Manual Enrollment</span>
                                                <span className="text-[#818CF8] font-bold">AVAILABLE</span>
                                            </div>
                                            
                                            {/* Spacer to keep card heights consistent */}
                                            <div className="h-4"></div>

                                            <button
                                                onClick={() => handleEnroll(enrollment.track_id)}
                                                disabled={enrollingTrackId === enrollment.track_id}
                                                className="flex items-center justify-center gap-2 w-full py-3 bg-[#FFD166] hover:bg-[#FFD166]/90 text-gray-900 rounded-xl text-xs font-black border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {enrollingTrackId === enrollment.track_id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin text-gray-900" />
                                                        ENROLLING...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4 text-gray-900 stroke-[3px]" />
                                                        ENROLL IN COURSE
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase">
                                                <span className="text-gray-400">Progress</span>
                                                <span className="text-[#818CF8]">{enrollment.progress}%</span>
                                            </div>
                                            
                                            {/* Neo progress bar */}
                                            <div className="h-4 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl overflow-hidden p-0.5">
                                                <div
                                                    className="h-full bg-[#818CF8] border border-gray-900 rounded-lg transition-all duration-500"
                                                    style={{ width: `${enrollment.progress}%` }}
                                                ></div>
                                            </div>
                                            
                                            <Link
                                                to={`/learn/${enrollment.track_id}`}
                                                className="flex items-center justify-center gap-2 w-full py-3 bg-[#818CF8] hover:bg-[#818CF8]/90 text-white rounded-xl text-xs font-black border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                                            >
                                                <PlayCircle className="w-4 h-4 text-white" />
                                                {enrollment.status === 'completed' ? 'REVIEW CONTENT' : 'CONTINUE LEARNING'}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-4 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-[#FAF9F6] rounded-full border-2 border-gray-200 flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">No courses found</h3>
                        <p className="text-xs text-gray-400 mb-6 max-w-xs text-center font-sans">
                            {searchQuery ? "We couldn't find any courses matching your search." : "You haven't enrolled in any tracks inside this organization yet."}
                        </p>
                        <Link to="/tracks" className="px-6 py-3 bg-[#FFD166] text-black border-2 border-gray-900 rounded-xl font-black text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                            BROWSE TRACKS
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
