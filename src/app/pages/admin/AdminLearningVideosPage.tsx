import { useState, useEffect, useMemo } from 'react';
import { 
  Video, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Check, 
  X, 
  Sparkles, 
  Layers, 
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  LearningVideo, 
  getAllLearningVideosAdmin, 
  createLearningVideo, 
  updateLearningVideo, 
  deleteLearningVideo, 
  togglePublishLearningVideo 
} from '../../../lib/api';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, isValidYouTubeUrl } from '../../../lib/youtube';
import { VideoPlayerModal } from '../../components/learning/VideoPlayerModal';
import { toast } from 'sonner';

interface VideoFormData {
  grade: string;
  subject: string;
  chapter: string;
  title: string;
  youtube_url: string;
  description: string;
  display_order: number;
  published: boolean;
}

const INITIAL_FORM: VideoFormData = {
  grade: 'Grade 10',
  subject: 'Mathematics',
  chapter: '',
  title: '',
  youtube_url: '',
  description: '',
  display_order: 0,
  published: true,
};

export function AdminLearningVideosPage() {
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<LearningVideo | null>(null);
  const [formData, setFormData] = useState<VideoFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Preview player state
  const [previewVideo, setPreviewVideo] = useState<LearningVideo | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load videos
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await getAllLearningVideosAdmin();
      setVideos(data);
    } catch (err) {
      console.error('Error fetching admin learning videos:', err);
      toast.error('Failed to load learning videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Dynamic grades and subjects for filter and datalist suggestions
  const existingGrades = useMemo(() => {
    const set = new Set<string>(['Grade 10', 'Grade 9', 'Grade 8', 'Grade 11', 'Grade 12', 'JEE', 'NEET']);
    videos.forEach(v => v.grade && set.add(v.grade.trim()));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [videos]);

  const existingSubjects = useMemo(() => {
    const set = new Set<string>(['Mathematics', 'Science', 'Social Science', 'Physics', 'Chemistry', 'Biology', 'English']);
    videos.forEach(v => v.subject && set.add(v.subject.trim()));
    return Array.from(set).sort();
  }, [videos]);

  // Combined Filtering
  const filteredVideos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return videos.filter(v => {
      if (selectedGrade !== 'all' && v.grade.toLowerCase() !== selectedGrade.toLowerCase()) return false;
      if (selectedSubject !== 'all' && v.subject.toLowerCase() !== selectedSubject.toLowerCase()) return false;
      if (filterPublished === 'published' && !v.published) return false;
      if (filterPublished === 'draft' && v.published) return false;

      if (q) {
        const matchTitle = v.title.toLowerCase().includes(q);
        const matchSubject = v.subject.toLowerCase().includes(q);
        const matchChapter = (v.chapter || '').toLowerCase().includes(q);
        const matchGrade = v.grade.toLowerCase().includes(q);
        if (!matchTitle && !matchSubject && !matchChapter && !matchGrade) return false;
      }

      return true;
    });
  }, [videos, searchQuery, selectedGrade, selectedSubject, filterPublished]);

  // Form helpers
  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setFormData({
      ...INITIAL_FORM,
      display_order: videos.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (video: LearningVideo) => {
    setEditingVideo(video);
    setFormData({
      grade: video.grade,
      subject: video.subject,
      chapter: video.chapter || '',
      title: video.title,
      youtube_url: video.youtube_url,
      description: video.description || '',
      display_order: video.display_order,
      published: video.published,
    });
    setIsModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a video title');
      return;
    }
    if (!formData.grade.trim()) {
      toast.error('Please specify a grade');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('Please specify a subject');
      return;
    }

    const videoId = extractYouTubeVideoId(formData.youtube_url);
    if (!videoId) {
      toast.error('Invalid YouTube URL or video ID. Please check the URL format.');
      return;
    }

    const thumbnailUrl = getYouTubeThumbnailUrl(videoId);
    setSubmitting(true);

    try {
      if (editingVideo) {
        // Update
        const updated = await updateLearningVideo(editingVideo.id, {
          grade: formData.grade.trim(),
          subject: formData.subject.trim(),
          chapter: formData.chapter.trim() || null,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          youtube_url: formData.youtube_url.trim(),
          youtube_video_id: videoId,
          thumbnail_url: thumbnailUrl,
          published: formData.published,
          display_order: Number(formData.display_order) || 0,
        });

        if (updated) {
          toast.success('Educational video updated successfully!');
          await fetchVideos();
          setIsModalOpen(false);
        } else {
          toast.error('Failed to update video');
        }
      } else {
        // Create
        await createLearningVideo({
          grade: formData.grade.trim(),
          subject: formData.subject.trim(),
          chapter: formData.chapter.trim() || null,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          youtube_url: formData.youtube_url.trim(),
          youtube_video_id: videoId,
          thumbnail_url: thumbnailUrl,
          published: formData.published,
          display_order: Number(formData.display_order) || 0,
        });

        toast.success('New video published to Learn with us library!');
        await fetchVideos();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving video:', err);
      toast.error('An error occurred while saving the video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (video: LearningVideo) => {
    const nextStatus = !video.published;
    const ok = await togglePublishLearningVideo(video.id, nextStatus);
    if (ok) {
      setVideos(prev => prev.map(v => v.id === video.id ? { ...v, published: nextStatus } : v));
      toast.success(nextStatus ? 'Video published to students!' : 'Video converted to draft');
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (video: LearningVideo) => {
    if (window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
      const ok = await deleteLearningVideo(video.id);
      if (ok) {
        setVideos(prev => prev.filter(v => v.id !== video.id));
        toast.success('Video removed from library');
      } else {
        toast.error('Failed to delete video');
      }
    }
  };

  // Live extracted ID for the form modal preview
  const liveVideoId = extractYouTubeVideoId(formData.youtube_url);

  return (
    <AdminLayout activeTab="videos">
      <div className="space-y-8 text-left font-mono">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-4 border-gray-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#eff3ff] border-2 border-gray-900 text-[10px] font-black uppercase text-indigo-700">
                Content Management
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase">Individual Student Library</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-3">
              <span>📚</span>
              Learn with us — Videos
            </h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
              Manage educational videos shared with all individual students.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-[#f39c12] hover:bg-[#e08e0b] border-2 sm:border-4 border-gray-900 text-gray-900 text-xs font-black uppercase shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add New Video
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 md:border-4 border-gray-900 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Total Videos</span>
            <span className="text-2xl font-black text-gray-900">{videos.length}</span>
          </div>
          <div className="bg-white border-2 md:border-4 border-gray-900 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Published</span>
            <span className="text-2xl font-black text-emerald-600">
              {videos.filter(v => v.published).length}
            </span>
          </div>
          <div className="bg-white border-2 md:border-4 border-gray-900 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Drafts</span>
            <span className="text-2xl font-black text-amber-600">
              {videos.filter(v => !v.published).length}
            </span>
          </div>
          <div className="bg-white border-2 md:border-4 border-gray-900 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase text-gray-500 block">Grades Active</span>
            <span className="text-2xl font-black text-indigo-600">{existingGrades.length}</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white border-2 md:border-4 border-gray-900 p-4 sm:p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title, subject, chapter, or grade..."
                className="w-full pl-10 pr-4 py-2 bg-[#FAF9F6] border-2 border-gray-900 font-bold text-xs focus:outline-none focus:bg-white"
              />
            </div>

            {/* Grade Filter */}
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="px-3 py-2 bg-[#FAF9F6] border-2 border-gray-900 font-bold text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">All Grades</option>
              {existingGrades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-[#FAF9F6] border-2 border-gray-900 font-bold text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {existingSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Published / Draft filter */}
            <div className="flex border-2 border-gray-900 bg-gray-100 p-0.5">
              {(['all', 'published', 'draft'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterPublished(tab)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all cursor-pointer ${
                    filterPublished === tab
                      ? 'bg-[#FFD166] text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {(searchQuery || selectedGrade !== 'all' || selectedSubject !== 'all' || filterPublished !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGrade('all');
                  setSelectedSubject('all');
                  setFilterPublished('all');
                }}
                className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border-2 border-gray-900 text-xs font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Video Table */}
        <div className="bg-white border-2 md:border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <div className="w-8 h-8 border-4 border-[#f39c12] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-black uppercase">Loading Educational Videos...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-3">
              <p className="font-black text-sm uppercase text-gray-900">No videos found</p>
              <p className="text-xs font-bold max-w-sm mx-auto">
                No educational videos match the current filters. Click "Add New Video" to publish your first video.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-[#f39c12] border-2 border-gray-900 text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                + Add Video Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold">
                <thead>
                  <tr className="border-b-2 border-gray-900 bg-gray-50 text-[11px] font-black uppercase text-gray-600">
                    <th className="p-3.5">Video</th>
                    <th className="p-3.5">Grade & Subject</th>
                    <th className="p-3.5">Chapter / Topic</th>
                    <th className="p-3.5">Order</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-100">
                  {filteredVideos.map(video => {
                    const thumb = video.thumbnail_url || getYouTubeThumbnailUrl(video.youtube_video_id);

                    return (
                      <tr key={video.id} className="hover:bg-[#FAF9F6] transition-colors">
                        
                        {/* Thumbnail & Title */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3 min-w-[260px]">
                            <div 
                              onClick={() => {
                                setPreviewVideo(video);
                                setIsPreviewOpen(true);
                              }}
                              className="relative w-20 h-12 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-900 shrink-0 cursor-pointer group"
                              title="Click to preview video"
                            >
                              <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                <Play className="w-4 h-4 text-white fill-white" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-gray-900 text-xs leading-snug truncate max-w-xs uppercase">
                                {video.title}
                              </p>
                              <span className="text-[10px] text-gray-400 font-mono">
                                ID: {video.youtube_video_id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Grade & Subject */}
                        <td className="p-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-block px-2 py-0.5 bg-[#FFD166] text-gray-900 text-[10px] font-black uppercase border border-gray-900 rounded w-fit">
                              {video.grade}
                            </span>
                            <span className="text-[11px] font-bold text-indigo-700">
                              {video.subject}
                            </span>
                          </div>
                        </td>

                        {/* Chapter */}
                        <td className="p-3.5 text-gray-700">
                          {video.chapter ? (
                            <span className="inline-flex items-center gap-1 text-[11px] bg-white px-2 py-0.5 border border-gray-400 rounded">
                              <Layers className="w-3 h-3 text-[#f39c12]" />
                              {video.chapter}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Display Order */}
                        <td className="p-3.5 font-mono text-gray-600">
                          #{video.display_order}
                        </td>

                        {/* Published Toggle */}
                        <td className="p-3.5">
                          <button
                            onClick={() => handleTogglePublish(video)}
                            className={`px-2.5 py-1 border-2 border-gray-900 text-[10px] font-black uppercase shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer transition-all ${
                              video.published
                                ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title={video.published ? 'Click to unpublish' : 'Click to publish'}
                          >
                            {video.published ? '● Published' : '○ Draft'}
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setPreviewVideo(video);
                                setIsPreviewOpen(true);
                              }}
                              className="p-1.5 bg-white hover:bg-amber-100 border border-gray-900 text-gray-800 shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer"
                              title="Preview Video Player"
                            >
                              <Play className="w-3.5 h-3.5 fill-gray-800" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(video)}
                              className="p-1.5 bg-white hover:bg-indigo-100 border border-gray-900 text-gray-800 shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer"
                              title="Edit Video Metadata"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(video)}
                              className="p-1.5 bg-white hover:bg-rose-100 border border-gray-900 text-rose-600 shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm select-none"
          onClick={() => !submitting && setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-white border-4 border-gray-900 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[92vh] font-mono text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b-4 border-gray-900 bg-[#FAF9F6]">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700 bg-[#eff3ff] px-2 py-0.5 border border-gray-900 rounded">
                  {editingVideo ? 'Edit Mode' : 'New Content'}
                </span>
                <h2 className="text-lg font-black uppercase text-gray-900 mt-1">
                  {editingVideo ? 'Edit Educational Video' : 'Add Educational Video'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="w-8 h-8 bg-white hover:bg-gray-100 border-2 border-gray-900 rounded-lg flex items-center justify-center text-gray-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVideo} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              
              {/* Grade & Subject Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-700 mb-1">
                    Grade <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="grades-list"
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="e.g. Grade 10"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl font-bold text-xs focus:outline-none focus:bg-white"
                  />
                  <datalist id="grades-list">
                    {existingGrades.map(g => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-700 mb-1">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="subjects-list"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl font-bold text-xs focus:outline-none focus:bg-white"
                  />
                  <datalist id="subjects-list">
                    {existingSubjects.map(s => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Chapter / Topic */}
              <div>
                <label className="block text-[11px] font-black uppercase text-gray-700 mb-1">
                  Chapter / Topic <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.chapter}
                  onChange={e => setFormData({ ...formData, chapter: e.target.value })}
                  placeholder="e.g. Real Numbers, Chemical Reactions, Optics..."
                  className="w-full px-3 py-2 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl font-bold text-xs focus:outline-none focus:bg-white"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-black uppercase text-gray-700 mb-1">
                  Video Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Real Numbers — Complete Chapter & Exercise Solutions"
                  className="w-full px-3 py-2 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl font-bold text-xs focus:outline-none focus:bg-white"
                />
              </div>

              {/* YouTube URL with Live Thumbnail Preview */}
              <div>
                <label className="block text-[11px] font-black uppercase text-gray-700 mb-1">
                  YouTube URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.youtube_url}
                  onChange={e => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-3 py-2 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl font-bold text-xs focus:outline-none focus:bg-white"
                />

                {/* Validation Indicator & Live Thumbnail Preview */}
                {formData.youtube_url && (
                  <div className="mt-2.5 p-2.5 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl flex items-center gap-3">
                    {liveVideoId ? (
                      <>
                        <img 
                          src={getYouTubeThumbnailUrl(liveVideoId)} 
                          alt="Thumbnail preview"
                          className="w-20 h-12 object-cover rounded border border-gray-900 shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-emerald-700 uppercase flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Valid YouTube Video ID: {liveVideoId}
                          </span>
                          <span className="text-[10px] text-gray-500 block truncate">
                            Thumbnail will be automatically cached.
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Please enter a valid YouTube URL (e.g. youtube.com/watch?v=... or youtu.be/...)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-black uppercase text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview or key concepts covered in this video lesson..."
                  className="w-full px-3 py-2 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl font-bold text-xs focus:outline-none focus:bg-white"
                />
              </div>

              {/* Display Order & Published Toggle */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border-2 border-gray-900 rounded-xl font-bold text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <label className="text-[11px] font-black uppercase text-gray-700 mb-1.5">
                    Visibility
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={e => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 rounded border-2 border-gray-900 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-black uppercase text-gray-900">
                      {formData.published ? 'Publish immediately' : 'Save as Draft'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-gray-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-white hover:bg-gray-100 border-2 border-gray-900 rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !liveVideoId}
                  className="px-5 py-2 bg-[#f39c12] hover:bg-[#e08e0b] disabled:opacity-50 border-2 border-gray-900 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {submitting ? 'Saving...' : editingVideo ? 'Update Video' : 'Publish Video'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      <VideoPlayerModal
        video={previewVideo}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewVideo(null);
        }}
      />
    </AdminLayout>
  );
}

export default AdminLearningVideosPage;
