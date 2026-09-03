import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, PhoneOff, Mic, MicOff, VideoOff, MonitorPlay, ExternalLink, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { formatWebRtcError } from '../../../lib/webrtc';

interface LiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
  customRoomId?: string;
}

export function LiveSessionModal({ isOpen, onClose, participantName, customRoomId }: LiveSessionModalProps) {
  const navigate = useNavigate();
  const [inSession, setInSession] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const roomId = useMemo(() => customRoomId || `mentozy-${Date.now().toString(36)}`, [customRoomId]);

  useEffect(() => {
    if (!isOpen) {
      stopSession();
    }
  }, [isOpen]);

  const stopSession = () => {
    localStreamRef.current?.getTracks().forEach(track => {
      try { track.stop(); } catch (e) { /* ignore */ }
    });
    localStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setInSession(false);
    setIsMicOn(true);
    setIsCameraOn(true);
  };

  const startWebRtcSession = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error('WebRTC is not supported on this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }
      setInSession(true);
      toast.success(`Live camera preview ready for ${participantName}`);
    } catch (error) {
      toast.error(formatWebRtcError(error));
    }
  };

  const toggleTrack = (kind: 'audio' | 'video') => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
    tracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    if (kind === 'audio') setIsMicOn(prev => !prev);
    if (kind === 'video') setIsCameraOn(prev => !prev);
  };

  const handleEnterFullRoom = () => {
    stopSession();
    onClose();
    navigate(`/live/${roomId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden font-sans">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Mentozy Live Video Space</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black flex items-center gap-1">
                <Shield className="w-3 h-3" /> P2P SECURE
              </span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">1-on-1 Session with {participantName}</h3>
          </div>
          <button 
            onClick={() => { stopSession(); onClose(); }} 
            className="text-gray-500 hover:text-gray-900 font-bold px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl border border-indigo-100 bg-[#eff3ff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-black text-gray-900 text-sm">
                <MonitorPlay className="w-4 h-4 text-indigo-600" /> Mentozy Native WebRTC Room
              </div>
              <p className="text-xs text-gray-600 mt-1 font-semibold">
                Direct P2P video, live chat, interactive whiteboard, and screen sharing.
              </p>
              <p className="text-xs text-indigo-800 mt-1 font-black">Room ID: {roomId}</p>
            </div>

            <button
              onClick={handleEnterFullRoom}
              className="px-5 py-2.5 bg-[#818CF8] hover:bg-[#6366F1] text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-all"
            >
              <span>ENTER FULL LIVE ROOM</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-2xl border-2 border-gray-900 bg-gray-950 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-900 relative">
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover ${isCameraOn && inSession ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`} 
              />
              {(!inSession || !isCameraOn) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 text-sm space-y-2">
                  <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xl font-black">
                    {participantName.charAt(0)}
                  </div>
                  <p className="text-xs text-gray-400 font-bold">
                    {inSession ? 'Camera is paused' : 'Click "Start Camera Preview" to test hardware before entering'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              {!inSession ? (
                <button 
                  onClick={startWebRtcSession} 
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Video className="w-4 h-4" /> Start Camera Preview
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => toggleTrack('audio')} 
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${isMicOn ? 'bg-white/10 text-white hover:bg-white/20 border-white/10' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}
                    title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => toggleTrack('video')} 
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${isCameraOn ? 'bg-white/10 text-white hover:bg-white/20 border-white/10' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}
                    title={isCameraOn ? 'Pause Camera' : 'Start Camera'}
                  >
                    {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={stopSession} 
                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-black text-xs hover:bg-red-700 inline-flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <PhoneOff className="w-4 h-4" /> Stop Preview
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveSessionModal;
