"use client";
import { BookOpen, Clock, BarChart, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTracks, Track, enrollInTrack, getStudentEnrollments } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const [enrolledTrackIds, setEnrolledTrackIds] = useState<number[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getTracks();
      setTracks(data);

      if (user) {
        const enrollments = await getStudentEnrollments(user.id);
        setEnrolledTrackIds(enrollments.map(e => e.track_id));
      }

      setLoading(false);
    }
    loadData();
  }, [user]);

  const handleEnroll = async (trackId: number | undefined, title: string) => {
    if (!trackId) return;

    if (!user) {
      toast.error("Please log in to enroll in a track");
      router.push('/login');
      return;
    }

    const success = await enrollInTrack(user.id, trackId);
    if (success) {
      toast.success(`Successfully enrolled in ${title}`);
      setEnrolledTrackIds(prev => [...prev, trackId]);
      router.push('/student-dashboard');
    } else {
      toast.error("Failed to enroll. You might already be enrolled.");
    }
  };

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-6">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-semibold tracking-wider text-sm uppercase mb-3 block">
            Curriculum
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Structured Learning Tracks
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive roadmaps designed by industry experts to take you from zero to job-ready.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-8 max-w-5xl mx-auto">
            {tracks.map((track, index) => {
              const isEnrolled = track.id && enrolledTrackIds.includes(track.id);
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{track.title}</h2>
                      <p className="text-gray-600 leading-relaxed max-w-2xl">{track.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BarChart className="w-4 h-4 text-amber-500" /> {track.level}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 text-amber-500" /> {track.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BookOpen className="w-4 h-4 text-amber-500" /> {track.projects} Projects
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Syllabus Highlights</h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {track.modules.map((mod, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          {mod}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button className="text-gray-500 font-medium hover:text-gray-900 transition-colors">
                      View Details
                    </button>

                    {isEnrolled ? (
                      <button
                        onClick={() => router.push('/student-dashboard')}
                        className="px-6 py-2.5 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(track.id, track.title)}
                        className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        Start Track <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  );
}
