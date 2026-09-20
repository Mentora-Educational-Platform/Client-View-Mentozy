// WebRTC Utility Module for Mentozy Live Sessions

export type CallState =
  | 'idle'
  | 'calling'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'
  | 'ended';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'reconnecting';

export interface DeviceList {
  videoInputs: MediaDeviceInfo[];
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
}

export interface ConnectionMetrics {
  quality: ConnectionQuality;
  rttMs?: number;
  packetsLost?: number;
  fractionLost?: number;
  jitterMs?: number;
  bitrateKbps?: number;
}

/**
 * Returns standard STUN servers and optional TURN server configuration
 * from environment variables if provided.
 */
export function getIceServers(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' }
  ];

  const turnUrl = import.meta.env.VITE_TURN_URL;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  if (turnUrl) {
    iceServers.push({
      urls: turnUrl,
      ...(turnUsername && { username: turnUsername }),
      ...(turnCredential && { credential: turnCredential })
    });
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10
  };
}

/**
 * Formats browser media/WebRTC errors into human-readable user messages.
 */
export function formatWebRtcError(error: unknown): string {
  if (!error) return 'An unknown WebRTC error occurred.';

  const err = error as { name?: string; message?: string };
  const name = err.name || '';

  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Camera/Microphone permission was denied. Please allow access in your browser settings.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No camera or microphone was found on this device.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Your camera or microphone is currently being used by another application.';
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'The selected camera or microphone does not support the requested resolution or settings.';
    case 'SecurityError':
      return 'Security restrictions blocked access to media devices. Make sure HTTPS is enabled.';
    case 'AbortError':
      return 'Media device access was aborted.';
    default:
      return err.message || 'Unable to access audio/video devices.';
  }
}

/**
 * Queries the browser for all connected camera, microphone, and speaker devices.
 */
export async function enumerateMediaDevices(): Promise<DeviceList> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return { videoInputs: [], audioInputs: [], audioOutputs: [] };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      videoInputs: devices.filter(d => d.kind === 'videoinput'),
      audioInputs: devices.filter(d => d.kind === 'audioinput'),
      audioOutputs: devices.filter(d => d.kind === 'audiooutput')
    };
  } catch (err) {
    console.warn('[WebRTC] Could not enumerate media devices:', err);
    return { videoInputs: [], audioInputs: [], audioOutputs: [] };
  }
}

/**
 * Calculates connection quality classification from RTCPeerConnection getStats().
 */
export function calculateConnectionQuality(statsReport: RTCStatsReport | null): ConnectionMetrics {
  if (!statsReport) {
    return { quality: 'good' };
  }

  let rttMs: number | undefined;
  let packetsLost: number | undefined;
  let fractionLost: number | undefined;
  let jitterMs: number | undefined;

  statsReport.forEach(report => {
    // Check candidate pair for current RTT
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      if (typeof report.currentRoundTripTime === 'number') {
        rttMs = Math.round(report.currentRoundTripTime * 1000);
      }
    }

    // Check inbound RTP for packet loss and jitter
    if (report.type === 'inbound-rtp' && report.kind === 'video') {
      if (typeof report.packetsLost === 'number') {
        packetsLost = report.packetsLost;
      }
      if (typeof report.fractionLost === 'number') {
        fractionLost = report.fractionLost;
      }
      if (typeof report.jitter === 'number') {
        jitterMs = Math.round(report.jitter * 1000);
      }
    }
  });

  // Calculate classification
  let quality: ConnectionQuality = 'excellent';

  if (rttMs !== undefined) {
    if (rttMs > 400 || (fractionLost !== undefined && fractionLost > 0.15)) {
      quality = 'poor';
    } else if (rttMs > 200 || (fractionLost !== undefined && fractionLost > 0.05)) {
      quality = 'fair';
    } else if (rttMs > 100) {
      quality = 'good';
    } else {
      quality = 'excellent';
    }
  }

  return { quality, rttMs, packetsLost, fractionLost, jitterMs };
}

/**
 * Formats a duration in seconds into MM:SS format.
 */
export function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const mm = mins < 10 ? `0${mins}` : `${mins}`;
  const ss = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mm}:${ss}`;
}

/**
 * Detects whether the current client is a mobile device, tablet, or touch-constrained viewport.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
  const isTouchScreen = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
  const isSmallViewport = window.innerWidth < 768;
  return isMobileUA || (isTouchScreen && isSmallViewport);
}

export interface MediaConstraintOptions {
  isMobile?: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
  facingMode?: 'user' | 'environment';
}

/**
 * Returns optimal media constraints.
 * Desktop retains the exact existing HD (1280x720) settings.
 * Mobile uses resilient, battery-efficient resolution and native audio processing.
 */
export function getOptimalMediaConstraints(options: MediaConstraintOptions = {}): MediaStreamConstraints {
  const isMobile = options.isMobile ?? isMobileDevice();

  if (isMobile) {
    return {
      video: options.videoDeviceId
        ? { deviceId: { exact: options.videoDeviceId } }
        : {
            facingMode: options.facingMode || 'user',
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 24, max: 30 }
          },
      audio: options.audioDeviceId
        ? { deviceId: { exact: options.audioDeviceId } }
        : {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
    };
  }

  // Desktop (Preserved exactly as existing)
  return {
    video: options.videoDeviceId
      ? { deviceId: { exact: options.videoDeviceId } }
      : { width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: options.audioDeviceId
      ? { deviceId: { exact: options.audioDeviceId } }
      : true
  };
}

/**
 * Resilient getUserMedia wrapper with multi-tier fallback for mobile browsers.
 */
export async function resilientGetUserMedia(
  constraints: MediaStreamConstraints,
  isMobile: boolean = isMobileDevice()
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('getUserMedia is not supported on this browser.');
  }

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (initialErr: any) {
    // If not mobile or not a constraint issue, bubble the error
    if (!isMobile || (initialErr.name !== 'OverconstrainedError' && initialErr.name !== 'ConstraintNotSatisfiedError')) {
      throw initialErr;
    }

    console.warn('[WebRTC] Mobile constraint error, falling back to relaxed constraints:', initialErr);

    // Tier 2 Fallback: relaxed facingMode or basic constraints
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: { echoCancellation: true }
      });
    } catch (fallbackErr: any) {
      console.warn('[WebRTC] Tier 2 fallback failed, attempting basic media:', fallbackErr);
      // Tier 3 Fallback: most permissive
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
    }
  }
}

/**
 * Mobile Screen Wake Lock helper to keep display alive during video call.
 */
export async function requestScreenWakeLock(): Promise<any> {
  if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && (navigator as any).wakeLock?.request) {
    try {
      const sentinel = await (navigator as any).wakeLock.request('screen');
      console.log('[WebRTC] Screen Wake Lock acquired');
      return sentinel;
    } catch (err) {
      console.warn('[WebRTC] Could not acquire Wake Lock:', err);
      return null;
    }
  }
  return null;
}

export function releaseScreenWakeLock(sentinel: any): void {
  if (sentinel && typeof sentinel.release === 'function') {
    sentinel.release().catch((e: any) => console.warn('[WebRTC] Wake lock release error:', e));
    console.log('[WebRTC] Screen Wake Lock released');
  }
}
