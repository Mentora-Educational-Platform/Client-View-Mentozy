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
