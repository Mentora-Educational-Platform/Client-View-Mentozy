import { BookOpen, Clock, BarChart, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTracks, Track, enrollInTrack, getStudentEnrollments } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
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
      navigate('/login');
      return;
    }

    const success = await enrollInTrack(user.id, trackId);
    if (success) {
      toast.success(`Successfully enrolled in ${title}`);
      setEnrolledTrackIds(prev => [...prev, trackId]);
      navigate('/student-dashboard');
    } else {
      toast.error("Failed to enroll. You might already be enrolled.");
    }
  };

  return (
    <div className="pt-32 pb-20 bg-[#FAF9F6] min-h-screen font-mono">
      <div className="container mx-auto px-6">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#f39c12] font-black tracking-wider text-xs uppercase mb-3 block">
            Curriculum
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 uppercase tracking-tight leading-none">
            Structured Learning Tracks
          </h1>
          <p className="text-base md:text-lg text-gray-700 font-bold uppercase leading-relaxed max-w-xl mx-auto">
            Comprehensive roadmaps designed by industry experts to take you from zero to job-ready.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 max-w-xl mx-auto border-4 border-gray-900 bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8">
            <div className="relative">
              <div className="w-24 h-24 bg-[#eff3ff] border-4 border-gray-900 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <BookOpen className="w-12 h-12 text-gray-900" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase">Learning Tracks Coming Soon</h2>
              <p className="text-gray-700 font-bold uppercase text-xs leading-relaxed mb-6">
                We're currently curating expert-led learning paths to help you master new skills.
                Follow our social channels or check back soon to be the first to enroll!
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <div className="px-5 py-2.5 border-4 border-gray-900 bg-[#eff3ff] text-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                Data Science
              </div>
              <div className="px-5 py-2.5 border-4 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                Web Development
              </div>
              <div className="px-5 py-2.5 border-4 border-gray-900 bg-white text-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                Full Stack
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 max-w-5xl mx-auto">
            {tracks.map((track, index) => {
              const isEnrolled = track.id && enrolledTrackIds.includes(track.id);
              return (
                <div key={index} className="bg-white border-4 border-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-2xl font-black text-gray-900 uppercase">{track.title}</h2>
                        {track.price !== undefined && (
                          <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-gray-900 ${track.price === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-[#eff3ff] text-indigo-800'}`}>
                              {track.price === 0 ? 'Free' : `$${track.price}`}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-755 font-bold uppercase text-xs leading-relaxed max-w-2xl">{track.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[150px] border-l-4 border-gray-900 pl-4 md:border-l-4 md:pl-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-700">
                        <BarChart className="w-4 h-4 text-gray-900" /> {track.level}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-700">
                        <Clock className="w-4 h-4 text-gray-900" /> {track.duration}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-700">
                        <BookOpen className="w-4 h-4 text-gray-900" /> {track.projects} Projects
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FAF9F6] border-4 border-gray-900 p-6 mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black text-gray-900 mb-4 text-xs uppercase tracking-wider">Detailed Curriculum & Objectives</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {track.modules.map((mod: any, i: number) => {
                        const title = typeof mod === 'string' ? mod : (mod.title || 'Untitled Module');
                        const description = typeof mod === 'object' && mod.description ? mod.description : null;
                        const objectives = typeof mod === 'object' && Array.isArray(mod.objectives) ? mod.objectives : [];
                        const duration = typeof mod === 'object' && mod.duration ? mod.duration : null;

                        return (
                          <div key={i} className="bg-white border-2 border-gray-900 p-4 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black text-gray-900 text-xs uppercase flex items-center gap-2">
                                  <div className="w-6 h-6 border-2 border-gray-900 bg-[#eff3ff] text-gray-900 flex items-center justify-center text-[10px] flex-shrink-0">{i + 1}</div>
                                  {title}
                                </h4>
                                {duration && <span className="text-[10px] font-black text-gray-900 bg-[#f39c12] border border-gray-900 px-2 py-0.5 uppercase">{duration}</span>}
                            </div>
                            {description && <p className="text-[10px] font-bold text-gray-700 uppercase mb-3 leading-relaxed">{description}</p>}
                            {objectives.length > 0 && (
                                <ul className="space-y-1">
                                    {objectives.map((obj: string, j: number) => (
                                        <li key={j} className="flex items-start gap-2 text-[9px] font-bold text-gray-600 uppercase">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                            {obj}
                                        </li>
                                    ))}
                                </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button onClick={() => navigate(`/learn/${track.id}`)} className="text-gray-900 font-black uppercase text-xs underline decoration-2 decoration-gray-900">
                      View Course Details
                    </button>

                    {isEnrolled ? (
                      <button
                        onClick={() => navigate('/student-dashboard')}
                        className="px-6 py-2.5 bg-emerald-100 text-emerald-800 border-2 border-gray-900 font-black uppercase text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(track.id, track.title)}
                        className="px-6 py-2.5 bg-[#f39c12] border-4 border-gray-900 text-gray-900 font-black uppercase text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
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