import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  GraduationCap, 
  PlaySquare, 
  Video,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { LearningVideo, getLearningVideos } from '../../lib/api';
import { LearningVideoCard } from '../components/learning/LearningVideoCard';
import { VideoPlayerModal } from '../components/learning/VideoPlayerModal';
import { toast } from 'sonner';

export function LearnWithUsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { mode, activeOrganization } = useOrganizationMode();

  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<LearningVideo | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // 1. Guard against non-individual students (Organization isolation)
  const isOrgStudent = mode === 'organization' && activeOrganization;

  useEffect(() => {
    if (!authLoading && isOrgStudent) {
      toast.error('The "Learn with us" video library is only available for individual student accounts.');
      navigate('/student-dashboard', { replace: true });
    }
  }, [authLoading, isOrgStudent, navigate]);

  // 2. Fetch published learning videos
  useEffect(() => {
    let isMounted = true;
    async function loadVideos() {
      setLoading(true);
      try {
        const data = await getLearningVideos();
        if (isMounted) {
          setVideos(data);
        }
      } catch (err) {
        console.error('Failed to load learning videos:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!isOrgStudent) {
      loadVideos();
    }

    return () => {
      isMounted = false;
    };
  }, [isOrgStudent]);

  // 3. Extract dynamic Grade and Subject options from content
  const grades = useMemo(() => {
    const set = new Set<string>();
    videos.forEach(v => {
      if (v.grade) set.add(v.grade.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [videos]);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    videos.forEach(v => {
      // If a specific grade is selected, only show subjects available for that grade
      if (selectedGrade === 'all' || v.grade.toLowerCase() === selectedGrade.toLowerCase()) {
        if (v.subject) set.add(v.subject.trim());
      }
    });
    return Array.from(set).sort();
  }, [videos, selectedGrade]);

  // 4. Combined Filtering logic (Search + Grade + Subject)
  const filteredVideos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return videos.filter(video => {
      // Grade filter
      if (selectedGrade !== 'all' && video.grade.toLowerCase() !== selectedGrade.toLowerCase()) {
        return false;
      }

      // Subject filter
      if (selectedSubject !== 'all' && video.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }

      // Search matching title, subject, chapter, or grade
      if (q) {
        const matchesTitle = video.title.toLowerCase().includes(q);
        const matchesSubject = video.subject.toLowerCase().includes(q);
        const matchesChapter = (video.chapter || '').toLowerCase().includes(q);
        const matchesGrade = video.grade.toLowerCase().includes(q);
        const matchesDescription = (video.description || '').toLowerCase().includes(q);

        if (!matchesTitle && !matchesSubject && !matchesChapter && !matchesGrade && !matchesDescription) {
          return false;
        }
      }

      return true;
    });
  }, [videos, searchQuery, selectedGrade, selectedSubject]);

  // Recently added videos (top 3 newest created)
  const recentVideoIds = useMemo(() => {
    const sorted = [...videos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return new Set(sorted.slice(0, 3).map(v => v.id));
  }, [videos]);

  const isFiltered = searchQuery.trim() !== '' || selectedGrade !== 'all' || selectedSubject !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGrade('all');
    setSelectedSubject('all');
  };

  const handleVideoSelect = (video: LearningVideo) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  // If organization student, show nothing while redirecting
  if (isOrgStudent) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="font-mono text-gray-900 min-h-screen bg-[#FAF9F6] p-4 sm:p-8 rounded-3xl border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] select-none space-y-8 text-left">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-gray-900 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#eff3ff] border-2 border-gray-900 text-[10px] font-black uppercase text-indigo-700 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                Video Library
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Self-Paced Learning
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">📚</span>
              Learn with us
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1.5">
              Explore educational videos and learn something new.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="bg-white border-2 border-gray-900 px-3.5 py-2 rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFD166] border border-gray-900 flex items-center justify-center font-black text-gray-900">
                {videos.length}
              </div>
              <div>
                <span className="block text-[10px] uppercase font-black text-gray-500">Available Videos</span>
                <span className="block text-xs font-black text-gray-900">{grades.length} Grades · {subjects.length} Subjects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            
            {/* 1. Search Field */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, subject, chapter, or grade..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl focus:outline-none focus:bg-white font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-900"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 2. Grade Filter Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="grade-filter" className="sr-only">Filter by Grade</label>
              <select
                id="grade-filter"
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedSubject('all'); // Reset subject when grade changes
                }}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer focus:outline-none"
              >
                <option value="all">All Grades</option>
                {grades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* 3. Subject Filter Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="subject-filter" className="sr-only">Filter by Subject</label>
              <select
                id="subject-filter"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer focus:outline-none"
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 4. Clear Filters Button */}
            {isFiltered && (
              <button
                onClick={handleClearFilters}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-gray-900 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>

          {/* Filter Pills Quick Access */}
          {grades.length > 0 && (
            <div className="pt-2 border-t-2 border-gray-100 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase text-gray-500 mr-1">Quick Grade:</span>
              <button
                onClick={() => setSelectedGrade('all')}
                className={`px-2.5 py-1 text-[10px] font-black rounded-lg border-2 border-gray-900 cursor-pointer transition-all shadow-[1px_1px_0px_rgba(0,0,0,1)] ${
                  selectedGrade === 'all'
                    ? 'bg-[#FFD166] text-gray-900'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {grades.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg border-2 border-gray-900 cursor-pointer transition-all shadow-[1px_1px_0px_rgba(0,0,0,1)] ${
                    selectedGrade === g
                      ? 'bg-[#FFD166] text-gray-900'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video Cards Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={i} 
                className="bg-white rounded-3xl border-4 border-gray-900 p-5 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-pulse"
              >
                <div className="aspect-video bg-gray-200 rounded-2xl border-2 border-gray-900"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
          <div>
            {/* Result count indicator */}
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-xs font-black uppercase text-gray-500">
                Showing {filteredVideos.length} {filteredVideos.length === 1 ? 'Video' : 'Videos'}
                {isFiltered && ' (Filtered)'}
              </span>
              {isFiltered && (
                <span className="text-xs font-bold text-indigo-700">
                  Filters applied
                </span>
              )}
            </div>

            {/* Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredVideos.map(video => (
                <LearningVideoCard
                  key={video.id}
                  video={video}
                  onSelect={handleVideoSelect}
                  isRecent={recentVideoIds.has(video.id)}
                />
              ))}
            </div>
          </div>
        ) : isFiltered ? (
          /* Empty Search / Filter State */
          <div className="bg-white rounded-3xl border-4 border-gray-900 p-8 sm:p-12 text-center space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-[#eff3ff] border-4 border-gray-900 rounded-2xl flex items-center justify-center mx-auto shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              <Search className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-gray-900">No videos found</h3>
              <p className="text-xs font-bold text-gray-500 max-w-md mx-auto">
                No educational videos match your current search and filter settings. Try adjusting your search term or clearing filters.
              </p>
            </div>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 bg-[#f39c12] hover:bg-[#e08e0b] border-2 border-gray-900 rounded-xl text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Empty Library State */
          <div className="bg-white rounded-3xl border-4 border-gray-900 p-8 sm:p-12 text-center space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-amber-100 border-4 border-gray-900 rounded-2xl flex items-center justify-center mx-auto shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              <Video className="w-8 h-8 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-gray-900">No learning videos available yet</h3>
              <p className="text-xs font-bold text-gray-500 max-w-md mx-auto">
                Our team is currently preparing educational video lessons. Check back soon for new content!
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Embedded YouTube Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false);
          setSelectedVideo(null);
        }}
      />
    </DashboardLayout>
  );
}

export default LearnWithUsPage;
