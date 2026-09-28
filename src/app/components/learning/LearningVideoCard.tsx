import { useState } from 'react';
import { Play, Layers, Sparkles } from 'lucide-react';
import { LearningVideo } from '../../../lib/api';
import { getYouTubeThumbnailUrl } from '../../../lib/youtube';

interface LearningVideoCardProps {
  video: LearningVideo;
  onSelect: (video: LearningVideo) => void;
  isRecent?: boolean;
}

export function LearningVideoCard({ video, onSelect, isRecent }: LearningVideoCardProps) {
  const [imageError, setImageError] = useState(false);
  const thumbnailUrl = video.thumbnail_url || getYouTubeThumbnailUrl(video.youtube_video_id);

  return (
    <div
      onClick={() => onSelect(video)}
      className="group bg-white rounded-3xl border-4 border-gray-900 p-4 sm:p-5 hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-pointer transition-all duration-200 flex flex-col justify-between select-none relative overflow-hidden text-left font-mono"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(video);
        }
      }}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-gray-900 bg-gray-900 mb-4 shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        {!imageError ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400 p-4 text-center">
            <Play className="w-8 h-8 text-amber-400 mb-1" />
            <span className="text-[10px] uppercase font-bold">{video.subject}</span>
          </div>
        )}

        {/* Hover / Play Overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f39c12] group-hover:bg-[#FFD166] text-gray-900 border-2 border-gray-900 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform duration-200">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-gray-900 translate-x-0.5" />
          </div>
        </div>

        {/* Recent Badge */}
        {isRecent && (
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#06D6A0] text-gray-950 text-[9px] font-black uppercase rounded border border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-2.5 h-2.5" /> New
            </span>
          </div>
        )}

        {/* Grade Badge */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="px-2 py-0.5 bg-white/95 text-gray-900 text-[10px] font-black uppercase rounded border border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] backdrop-blur-xs">
            {video.grade}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Grade & Subject line */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wide">
              {video.grade} · {video.subject}
            </span>
          </div>

          {/* Video Title */}
          <h3 className="text-sm sm:text-base font-black text-gray-900 leading-snug uppercase line-clamp-2 mb-2 group-hover:text-[#b45309] transition-colors">
            {video.title}
          </h3>

          {/* Optional Chapter/Topic */}
          {video.chapter && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF9F6] border-2 border-gray-900 rounded-lg text-[10px] font-bold text-gray-700 shadow-[1px_1px_0px_rgba(0,0,0,1)] mb-3">
              <Layers className="w-3 h-3 text-[#f39c12]" />
              <span className="truncate max-w-[200px]">{video.chapter}</span>
            </div>
          )}
        </div>

        {/* Card Footer: Action Button */}
        <div className="pt-3 border-t-2 border-gray-100 flex items-center justify-between mt-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase">
            Educational Video
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF9F6] group-hover:bg-[#FFD166] text-gray-900 border-2 border-gray-900 rounded-xl text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-colors">
            Watch Now →
          </span>
        </div>
      </div>
    </div>
  );
}
