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
  const [chatList, setChatList] = useState<ChatMessage[]>([
    { id: '1', sender: 'Dr. Sarah Jenkins', avatar: 'SJ', text: 'Welcome to Mentozy Live WebRTC Space! Ready to review the milestones.', timestamp: '10:00 AM', isHost: true },
    { id: '2', sender: 'Alex Rivera', avatar: 'AR', text: 'Setting up ICE candidate configurations now.', timestamp: '10:01 AM' }
  ]);

  // Cohort participants roster
  const [participantsList] = useState([
    { id: 'p1', name: 'Dr. Sarah Jenkins', role: 'Host / Instructor', avatar: 'SJ', active: true },
    { id: 'p2', name: 'Alex Rivera', role: 'Student', avatar: 'AR', active: true },
    { id: 'p3', name: 'Sophia Patel', role: 'Student', avatar: 'SP', active: true },
    { id: 'p4', name: 'Ethan Hunt', role: 'Student', avatar: 'EH', active: false }
  ]);

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

  // Toggle audio/video tracks
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
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
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

  // Leave / Exit Meeting Room
  const handleExitMeeting = () => {
    stopSession();
    toast.success('Disconnected from Live Session.');
    navigate('/org-dashboard'); // Redirect to Org Dashboard
  };

  // Chat sender & dynamic response simulator
  const handleSendChat = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'Host (You)',
      avatar: 'H',
      text: chatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: true
    };

    setChatList(prev => [...prev, newMessage]);
    const userMessage = chatMessage;
    setChatMessage('');

    // Dynamic Cohort response simulator
    setTimeout(() => {
      let replyText = 'Got it! Looking forward to reviewing.';
      let responder = 'Sophia Patel';
      let avatar = 'SP';

      if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        replyText = 'Hello professor! Great to connect.';
        responder = 'Alex Rivera';
        avatar = 'AR';
      } else if (userMessage.toLowerCase().includes('webrtc') || userMessage.toLowerCase().includes('link')) {
        replyText = 'Perfect! The native WebRTC latency is incredible compared to Zoom.';
        responder = 'Alex Rivera';
        avatar = 'AR';
      } else if (userMessage.toLowerCase().includes('code') || userMessage.toLowerCase().includes('milestone')) {
        replyText = 'Just committed the milestone solution. All tests passed! 🎉';
        responder = 'Sophia Patel';
        avatar = 'SP';
      }

      setChatList(prev => [...prev, {
        id: `chat-${Date.now() + 1}`,
        sender: responder,
        avatar: avatar,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
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
                    SJ
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-white text-base">Dr. Sarah Jenkins (You)</h4>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">Camera streams paused</p>
                  </div>
                </div>
              )}

              {/* Tag Overlays */}
              <div className="absolute bottom-4 left-4 z-30 bg-slate-950/70 border border-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></div>
                <span className="text-xs font-bold text-white">Host (Instructor View)</span>
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
            <div className="absolute top-4 right-4 w-48 aspect-video rounded-2xl overflow-hidden bg-slate-950/80 border border-white/10 shadow-2xl z-30 pointer-events-auto">
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative">
                
                {/* Simulated live avatar waves */}
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/25 flex items-center justify-center text-xs font-bold shadow-md shadow-purple-600/10">
                  AR
                </div>
                <span className="text-[9px] font-bold text-slate-300 mt-2">Alex Rivera</span>
                
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
                return (
                  <div key={message.id} className={`flex items-start gap-2.5 text-left ${message.isHost ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${message.isHost ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {message.avatar}
                    </div>
                    <div className="max-w-[75%] space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{message.sender}</span>
                        <span className="text-[8px] text-slate-500">{message.timestamp}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${message.isHost ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-950 border border-slate-850 rounded-tl-none text-slate-200'}`}>
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
