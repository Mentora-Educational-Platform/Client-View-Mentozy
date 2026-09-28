/**
 * YouTube URL and Video ID utilities for Mentozy "Learn with us"
 */

/**
 * Extracts and validates an 11-character YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 * - Direct 11-character video ID
 */
export function extractYouTubeVideoId(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // 1. Direct 11-char video ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. URL parsing
  try {
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

    // youtube.com, m.youtube.com, youtube-nocookie.com
    if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
      // ?v=VIDEO_ID
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }

      // /embed/VIDEO_ID or /shorts/VIDEO_ID or /v/VIDEO_ID
      const segments = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'v', 'live'].includes(segments[0]) && segments[1]) {
        const id = segments[1].substring(0, 11);
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
          return id;
        }
      }
    }

    // youtu.be/VIDEO_ID
    if (hostname === 'youtu.be') {
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments[0]) {
        const id = segments[0].substring(0, 11);
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
          return id;
        }
      }
    }
  } catch {
    // Continue to regex fallback
  }

  // 3. Fallback regex match across the input
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regex);
  if (match && match[1] && /^[a-zA-Z0-9_-]{11}$/.test(match[1])) {
    return match[1];
  }

  return null;
}

/**
 * Validates whether an input is a valid YouTube URL or video ID
 */
export function isValidYouTubeUrl(input?: string | null): boolean {
  return extractYouTubeVideoId(input) !== null;
}

/**
 * Returns a high-quality thumbnail image URL for a YouTube video
 */
export function getYouTubeThumbnailUrl(videoIdOrUrl: string): string {
  const videoId = extractYouTubeVideoId(videoIdOrUrl) || videoIdOrUrl;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Returns privacy-friendly YouTube embed URL for iframe playback
 */
export function getYouTubeEmbedUrl(videoIdOrUrl: string, autoplay = true): string {
  const videoId = extractYouTubeVideoId(videoIdOrUrl) || videoIdOrUrl;
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1`;
}
