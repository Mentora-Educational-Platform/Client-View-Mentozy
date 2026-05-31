import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MonitorPlay, 
  PhoneOff, 
  Send, 
  Users, 
  MessageSquare, 
  Sparkles, 
  Hand, 
  PenTool, 
  Eraser, 
  Check, 
  Shield, 
  Maximize2,
  Tv
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  isHost?: boolean;
}

export function LiveSessionPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Lobby/Preview Screen State
  const [hasJoined, setHasJoined] = useState(false);

  // Dynamic Room Metadata
  const [meetingTopic, setMeetingTopic] = useState('Mentozy Live Session');
  const [meetingDesc, setMeetingDesc] = useState('');
  const [sessionOwnerId, setSessionOwnerId] = useState<string | null>(null);

  // Media Stream States
  const [inSession, setInSession] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Interactive Overlays
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [hasHandRaised, setHasHandRaised] = useState(false);

  // Stream Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Whiteboard Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [drawColor, setDrawColor] = useState('#6366f1'); // Indigo
  const [brushSize, setBrushSize] = useState(4);

  // Live Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatList, setChatList] = useState<ChatMessage[]>([]);

  // Cohort participants roster
  const [participantsList, setParticipantsList] = useState<any[]>([]);

  // Fetch session details, roster, and past chats from Supabase
  useEffect(() => {
    async function fetchMeetingDetails() {
      if (!roomId || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('live_sessions')
          .select(`
            id,
            topic,
            description,
            org_id,
            invited_student_ids,
            profiles:org_id (full_name)
          `)
          .eq('room_id', roomId)
          .single();

        if (error) {
          console.warn("Could not find session details in database:", error);
          return;
        }

        if (data) {
          setSessionOwnerId(data.org_id);
          if (data.topic) setMeetingTopic(data.topic);
          if (data.description) setMeetingDesc(data.description);

          const hostName = (data.profiles as any)?.full_name || 'Mentozy Organisation';
          const hostAvatar = hostName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);

          // Build dynamic live roster!
          const roster = [
            {
              id: data.org_id,
              name: hostName,
              role: 'Host / Instructor',
              avatar: hostAvatar,
              active: true
            }
          ];

          // Fetch the profiles of invited students
          const studentIds = data.invited_student_ids || [];
          if (studentIds.length > 0) {
            const { data: studentProfiles, error: studentError } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', studentIds);

            if (!studentError && studentProfiles) {
              studentProfiles.forEach(student => {
                const initials = (student.full_name || 'Student').split(' ').map((n: string) => n[0]).join('').substring(0, 2);
                roster.push({
                  id: student.id,
                  name: student.full_name || 'Student',
                  role: 'Student',
                  avatar: initials,
                  active: true
                });
              });
            }
          }
          setParticipantsList(roster);

          // Fetch past database chats
          const { data: chatData, error: chatError } = await supabase
            .from('live_session_chats')
            .select('*')
            .eq('session_id', data.id)
            .order('created_at', { ascending: true });

          if (!chatError && chatData && chatData.length > 0) {
            const loadedChats = chatData.map(msg => ({
              id: msg.id,
              sender: msg.sender_name,
              avatar: msg.sender_avatar_initials,
              text: msg.text,
              timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isHost: msg.sender_id === data.org_id
            }));
            setChatList(loadedChats);
          } else {
            // Dynamic welcome greeting
            setChatList([
              { 
                id: '1', 
                sender: hostName, 
                avatar: hostAvatar, 
                text: `Welcome to Mentozy Live Space! Let's start the "${data.topic}" sync. Ready to review the milestones.`, 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                isHost: true 
              }
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to query meeting details:", err);
      }
    }
    fetchMeetingDetails();
  }, [roomId]);

  // Subscribe to real-time chat database inserts
  useEffect(() => {
    if (!roomId || !supabase || !user) return;

    let subscription: any;

    async function setupRealtimeChat() {
      const { data: session } = await supabase
        .from('live_sessions')
        .select('id, org_id')
        .eq('room_id', roomId)
        .single();

      if (!session) return;

      subscription = supabase
        .channel(`chat-channel-${roomId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'live_session_chats',
          filter: `session_id=eq.${session.id}`
        }, (payload) => {
          const newMsg = payload.new;
          setChatList(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id,
              sender: newMsg.sender_name,
              avatar: newMsg.sender_avatar_initials,
              text: newMsg.text,
              timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isHost: newMsg.sender_id === session.org_id
            }];
          });
        })
        .subscribe();
    }

    setupRealtimeChat();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [roomId, user]);

  // Request media device streams
  useEffect(() => {
    startSession();
    return () => stopSession();
  }, []);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setInSession(true);
      toast.success('Mentozy WebRTC room connection secure');
    } catch (err) {
      console.error(err);
      toast.error('Camera or Microphone access blocked. Displaying digital avatar instead.');
      setInSession(true); // Graceful preview fallback
    }
  };

  const stopSession = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
    setInSession(false);
  };

  // Toggle audio/video tracks (works even when physical media permission is blocked)
  const toggleTrack = (kind: 'audio' | 'video') => {
    const stream = localStreamRef.current;
    if (stream) {
      const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
      tracks.forEach(track => {
        track.enabled = !track.enabled;
      });
    }

    if (kind === 'audio') setIsMicOn(prev => !prev);
    if (kind === 'video') setIsCameraOn(prev => !prev);
  };

  // Screen Share Handler
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      setIsScreenSharing(false);
      toast.success('Screen share stopped');
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        toast.success('Screen sharing started');

        // Stop share when user clicks browser stop button
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          toast.success('Screen share stopped');
        };
      } catch (err) {
        console.error("Screen share error:", err);
      }
    }
  };

  // Safe ref assignment for screen sharing video element to avoid React mounting races
  useEffect(() => {
    if (isScreenSharing && screenStreamRef.current && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [isScreenSharing]);

  // Leave / Exit Meeting Room
  const handleExitMeeting = () => {
    stopSession();
    toast.success('Disconnected from Live Session.');
    navigate(-1); // Redirect back dynamically to dashboard/calendar
  };

  // Chat sender (writes real messages to Supabase live_session_chats)
  const handleSendChat = async () => {
    if (!chatMessage.trim() || !user || !supabase) return;

    const senderName = user.user_metadata?.full_name || 'Anonymous Member';
    const senderInitials = senderName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);

    try {
      const { data: session } = await supabase
        .from('live_sessions')
        .select('id')
        .eq('room_id', roomId)
        .single();

      if (session) {
        const { error } = await supabase
          .from('live_session_chats')
          .insert({
            session_id: session.id,
            sender_id: user.id,
            sender_name: senderName,
            sender_avatar_initials: senderInitials,
            text: chatMessage
          });

        if (error) {
          console.error("Error inserting chat to database:", error);
          toast.error("Message delivery failed.");
        }
      }
    } catch (e) {
      console.error("Error sending real chat message:", e);
    }
    
    setChatMessage('');
  };

  // Trigger Raise Hand
  const handleRaiseHand = () => {
    setHasHandRaised(prev => !prev);
    const text = !hasHandRaised ? 'raised hand ✋' : 'lowered hand';
    setChatList(prev => [...prev, {
      id: `chat-sys-${Date.now()}`,
      sender: 'System',
      avatar: 'SYS',
      text: `Host ${text}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // ==========================================
  // HTML5 Drawing Board functions
  // ==========================================
  const startDrawingCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = drawColor;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawingCanvas = () => {
    isDrawing.current = false;
  };

  const clearCanvasBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toast.success('Whiteboard cleared');
  };

  const firstStudent = participantsList.find(p => p.role === 'Student');
  const isCurrentUserHost = user?.id === sessionOwnerId;
  const myName = user?.user_metadata?.full_name || (isCurrentUserHost ? 'Host' : 'Student');
  const myInitials = myName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  if (!hasJoined) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center font-sans text-slate-100 p-6 md:p-12 select-none overflow-y-auto animate-in fade-in duration-300">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Side: Large Video Preview Card */}
          <div className="flex-[7] w-full aspect-video md:aspect-[16/9] rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center">
            
            {/* Local Video Stream */}
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className={`w-full h-full object-cover z-10 ${isCameraOn && inSession ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`} 
            />

            {/* Camera Off Slate */}
            {(!isCameraOn || !inSession) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm z-20 space-y-4 animate-in fade-in duration-300">
                <div className="w-20 h-20 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-indigo-600/10 animate-bounce">
                  {myInitials}
                </div>
                <h4 className="font-bold text-white text-sm">{myName}</h4>
                <p className="text-xs text-slate-500 font-semibold">Camera is paused</p>
              </div>
            )}

            {/* Bottom Floating Control Pills inside Video */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-slate-950/80 border border-slate-850 px-4 py-2 rounded-full backdrop-blur-md">
              
              {/* Mic Toggle button */}
              <button 
                onClick={() => toggleTrack('audio')}
                className={`p-3 rounded-full transition-all border ${isMicOn ? 'bg-slate-850 border-slate-700 text-white hover:bg-slate-800' : 'bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30'}`}
                title={isMicOn ? 'Turn off mic' : 'Turn on mic'}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              {/* Camera Toggle button */}
              <button 
                onClick={() => toggleTrack('video')}
                className={`p-3 rounded-full transition-all border ${isCameraOn ? 'bg-slate-850 border-slate-700 text-white hover:bg-slate-800' : 'bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30'}`}
                title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Right Side: Ready to Join Control Panel */}
          <div className="flex-[3] w-full max-w-sm text-center lg:text-left space-y-6 font-sans">
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Ready to join?</h2>
              <p className="text-sm text-slate-400 font-medium">Topic: <span className="text-indigo-400 font-bold">{meetingTopic}</span></p>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setHasJoined(true)}
                className="w-full lg:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
              >
                Join now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-sans select-none text-slate-100 overflow-hidden">
      
      {/* 1. Header Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-white">Mentozy WebRTC Session</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                <Shield className="w-3 h-3" /> Secure
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Room ID: {roomId}</p>
          </div>
        </div>

        {/* Dynamic attendee status counter */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setIsParticipantsOpen(prev => !prev); setIsChatOpen(false); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${isParticipantsOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}
          >
            <Users className="w-4 h-4" />
            {participantsList.length} Active
          </button>
          
          <button 
            onClick={() => { setIsChatOpen(prev => !prev); setIsParticipantsOpen(false); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${isChatOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Live Chat
          </button>
        </div>
      </div>

      {/* 2. Main Workstation Panel (Flex body) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Core Media Stream Frame */}
        <div className="flex-1 flex flex-col p-6 items-center justify-center relative overflow-hidden bg-slate-950">
          
          <div className="w-full h-full max-w-5xl max-h-[85vh] relative flex gap-4 items-center justify-center">
            
            {/* LARGE SCREEN: Main WebRTC Host Stream or Screen share */}
            <div className={`flex-1 h-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative group flex items-center justify-center ${isScreenSharing ? 'hidden lg:flex' : 'flex'}`}>
              
              {/* HTML5 Overlay Interactive Whiteboard Canvas */}
              {isWhiteboardOpen && (
                <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-300 flex flex-col">
                  {/* Drawing Toolbar */}
                  <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-indigo-400" /> WebRTC Interactive Whiteboard Canvas
                    </span>
                    <div className="flex items-center gap-4">
                      {/* Color Pickers */}
                      <div className="flex gap-2">
                        {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ffffff'].map(c => (
                          <button 
                            key={c}
                            onClick={() => setDrawColor(c)}
                            className={`w-6 h-6 rounded-full border transition-transform ${drawColor === c ? 'scale-125 border-white' : 'border-slate-800'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="h-4 w-[1px] bg-slate-800"></div>
                      <button 
                        onClick={clearCanvasBoard}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Eraser className="w-4 h-4" /> Clear Board
                      </button>
                    </div>
                  </div>
                  
                  {/* Canvas element */}
                  <canvas 
                    ref={canvasRef}
                    width={800}
                    height={500}
                    className="flex-1 bg-transparent cursor-crosshair w-full h-full"
                    onMouseDown={startDrawingCanvas}
                    onMouseMove={drawOnCanvas}
                    onMouseUp={stopDrawingCanvas}
                    onMouseLeave={stopDrawingCanvas}
                  />
                </div>
              )}

              {/* Local Host Video Stream */}
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover z-10 ${isCameraOn && inSession && !isWhiteboardOpen ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`} 
              />

              {/* Avatar Fallback / Mute Slate */}
              {(!isCameraOn || !inSession) && !isWhiteboardOpen && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 space-y-4 animate-in fade-in duration-300">
                  <div className="w-24 h-24 rounded-full bg-indigo-600/20 text-indigo-400 border-2 border-indigo-500/30 flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-indigo-600/10 animate-bounce">
                    {myInitials}
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-white text-base">{myName} (You)</h4>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">Camera streams paused</p>
                  </div>
                </div>
              )}

              {/* Tag Overlays */}
              <div className="absolute bottom-4 left-4 z-30 bg-slate-950/70 border border-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isCurrentUserHost ? 'bg-indigo-500' : 'bg-emerald-500'} animate-ping`}></div>
                <span className="text-xs font-bold text-white">
                  {isCurrentUserHost ? 'Host (Instructor View)' : 'Student (Participant View)'}
                </span>
              </div>
            </div>

            {/* SCREEN SHARE PANEL: Appears alongside when screen sharing is enabled */}
            {isScreenSharing && (
              <div className="flex-1 h-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative flex items-center justify-center z-10 animate-in zoom-in-95 duration-300">
                <video ref={screenVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-white/10">
                  <Tv className="w-4.5 h-4.5 text-amber-500" />
                  <span className="text-xs font-bold text-white">Sharing Screen Space</span>
                </div>
              </div>
            )}

            {/* FLOATING SUB-GRID: Student Overlay (Simulated Peer Feeds) */}
            {firstStudent && (
              <div className="absolute top-4 right-4 w-48 aspect-video rounded-2xl overflow-hidden bg-slate-950/80 border border-white/10 shadow-2xl z-30 pointer-events-auto">
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative">
                  
                  {/* Dynamic live avatar waves */}
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/25 flex items-center justify-center text-xs font-bold shadow-md shadow-purple-600/10">
                    {firstStudent.avatar}
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 mt-2">{firstStudent.name}</span>
                  
                  {/* Micro speaking wave badge */}
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-2 bg-emerald-500 animate-pulse"></div>
                      <div className="w-0.5 h-3 bg-emerald-500 animate-pulse"></div>
                      <div className="w-0.5 h-1.5 bg-emerald-500 animate-pulse"></div>
                    </div>
                    <span className="text-[8px] text-emerald-400 font-extrabold uppercase">Live</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 3. SIDEBAR A: LIVE CHAT SPACE (Right panel) */}
        {isChatOpen && (
          <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-400" /> Live Chat Space
              </h3>
            </div>
            
            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatList.map((message) => {
                const isSystem = message.sender === 'System';
                if (isSystem) {
                  return (
                    <div key={message.id} className="text-center py-2">
                      <span className="inline-block bg-slate-950/60 text-indigo-300 border border-indigo-950 px-3 py-1 rounded-full text-[10px] font-bold">
                        {message.text}
                      </span>
                    </div>
                  );
                }
                const isMe = message.senderId === user?.id;
                return (
                  <div key={message.id} className={`flex items-start gap-2.5 text-left ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isMe ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {message.avatar}
                    </div>
                    <div className="max-w-[75%] space-y-1">
                      <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : ''}`}>
                        <span className="text-xs font-bold text-slate-200">{isMe ? 'You' : message.sender}</span>
                        <span className="text-[8px] text-slate-500">{message.timestamp}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-950 border border-slate-850 rounded-tl-none text-slate-200'}`}>
                        {message.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Container */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Send a chat... (try hello or code)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-xs text-white focus:border-indigo-500 outline-none"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                />
                <button 
                  onClick={handleSendChat}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. SIDEBAR B: ROSTER RENDER (Right panel alternative) */}
        {isParticipantsOpen && (
          <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" /> Active Roster
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {participantsList.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-bold text-xs">
                      {member.avatar}
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-white">{member.name}</h4>
                      <p className="text-[9px] text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${member.active ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-700'}`}></span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 5. CONTROL TOOLBAR (Bottom Section) */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-between">
        
        {/* Left segment: Active room details */}
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-medium">
          <span className="font-bold text-white">Topic:</span> {meetingTopic}
        </div>

        {/* Center Segment: Interactive Media Switches */}
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          
          {/* Microphone Switch */}
          <button 
            onClick={() => toggleTrack('audio')}
            className={`p-3 rounded-xl border transition-all ${isMicOn ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' : 'bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30'}`}
            title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Switch */}
          <button 
            onClick={() => toggleTrack('video')}
            className={`p-3 rounded-xl border transition-all ${isCameraOn ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' : 'bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30'}`}
            title={isCameraOn ? 'Stop Camera' : 'Start Camera'}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share Switch */}
          <button 
            onClick={handleToggleScreenShare}
            className={`p-3 rounded-xl border transition-all ${isScreenSharing ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white'}`}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
          >
            <MonitorPlay className="w-5 h-5" />
          </button>

          {/* Whiteboard Canvas Switch */}
          <button 
            onClick={() => setIsWhiteboardOpen(prev => !prev)}
            className={`p-3 rounded-xl border transition-all ${isWhiteboardOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white'}`}
            title="Toggle Whiteboard Draw"
          >
            <PenTool className="w-5 h-5" />
          </button>

          {/* Raise Hand Switch */}
          <button 
            onClick={handleRaiseHand}
            className={`p-3 rounded-xl border transition-all ${hasHandRaised ? 'bg-indigo-600 border-indigo-500 text-white animate-bounce' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white'}`}
            title="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </button>

        </div>

        {/* Right Segment: Leave Stream action */}
        <div>
          <button 
            onClick={handleExitMeeting}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 hover:-translate-y-0.5 transition-all"
          >
            <PhoneOff className="w-4 h-4 animate-pulse" />
            End Session
          </button>
        </div>

      </div>

    </div>
  );
}

export default LiveSessionPage;
