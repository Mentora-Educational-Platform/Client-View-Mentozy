import { useEffect } from 'react';
import { X, Play, BookOpen, Layers } from 'lucide-react';
import { LearningVideo } from '../../../lib/api';
import { getYouTubeEmbedUrl } from '../../../lib/youtube';

interface VideoPlayerModalProps {
  video: LearningVideo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlayerModal({ video, isOpen, onClose }: VideoPlayerModalProps) {
  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !video) return null;

  const embedUrl = getYouTubeEmbedUrl(video.youtube_video_id, true);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm select-none animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div 
        className="w-full max-w-4xl bg-white border-4 border-gray-900 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[92vh] text-left font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-4 border-gray-900 bg-[#FAF9F6] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0 mr-2">
            <span className="px-2.5 py-1 bg-[#FFD166] text-gray-900 text-[10px] sm:text-xs font-black uppercase border-2 border-gray-900 rounded-lg shadow-[1px_1px_0px_rgba(0,0,0,1)]">
              {video.grade}
            </span>
            <span className="px-2.5 py-1 bg-[#eff3ff] text-indigo-900 text-[10px] sm:text-xs font-black uppercase border-2 border-gray-900 rounded-lg shadow-[1px_1px_0px_rgba(0,0,0,1)]">
              {video.subject}
            </span>
            {video.chapter && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-white text-gray-700 text-[10px] sm:text-xs font-bold uppercase border-2 border-gray-900 rounded-lg shadow-[1px_1px_0px_rgba(0,0,0,1)] truncate max-w-[200px]">
                <Layers className="w-3 h-3 text-[#f39c12]" />
                {video.chapter}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-rose-100 border-2 border-gray-900 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center text-gray-900 transition-all cursor-pointer shrink-0"
            title="Close video"
            aria-label="Close video player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="bg-black relative aspect-video w-full shrink-0 border-b-4 border-gray-900">
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video Details Section */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 bg-white flex-1">
          <h2 id="video-modal-title" className="text-base sm:text-xl font-black text-gray-900 leading-snug uppercase">
            {video.title}
          </h2>

          {video.chapter && (
            <div className="sm:hidden flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-300 w-fit">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Chapter: {video.chapter}</span>
            </div>
          )}

          {video.description && (
            <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
              {video.description}
            </p>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-gray-200 text-[11px] text-gray-400 font-bold uppercase">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <BookOpen className="w-3.5 h-3.5" />
              Mentozy Video Library
            </span>
            <span>Added {new Date(video.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
