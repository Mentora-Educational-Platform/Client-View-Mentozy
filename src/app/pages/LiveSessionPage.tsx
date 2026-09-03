import { useState, useEffect, useRef, useCallback } from 'react';
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
  Shield, 
  Tv,
  Settings,
  Maximize,
  Minimize,
  RefreshCw,
  Volume2,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  getIceServers, 
  formatWebRtcError, 
  enumerateMediaDevices, 
  calculateConnectionQuality, 
  formatCallDuration,
  CallState, 
  ConnectionQuality, 
  DeviceList 
} from '../../lib/webrtc';

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  isHost?: boolean;
  senderId?: string;
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

  // Call State & Health Monitoring
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>('good');
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Interactive Overlays & Modals
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [hasHandRaised, setHasHandRaised] = useState(false);
  const [isDeviceSettingsOpen, setIsDeviceSettingsOpen] = useState(false);

  // Media Devices State
  const [devices, setDevices] = useState<DeviceList>({ videoInputs: [], audioInputs: [], audioOutputs: [] });
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>('');
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>('');
  const [selectedAudioOutputId, setSelectedAudioOutputId] = useState<string>('');

  // Stream Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const micTrackRef = useRef<MediaStreamTrack | null>(null);

  // WebRTC P2P Streaming States
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isRemoteVideoActive, setIsRemoteVideoActive] = useState(false);
  const [presenceUsers, setPresenceUsers] = useState<any[]>([]);
  const [channelSubscribed, setChannelSubscribed] = useState(false);
  const [remoteTracksCount, setRemoteTracksCount] = useState(0);

  // WebRTC Connection & Signaling Refs
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const webrtcChannelRef = useRef<any>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const makingOfferRef = useRef<boolean>(false);
  const ignoreOfferRef = useRef<boolean>(false);
  const isSettingRemoteAnswerPendingRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<any>(null);
  const statsIntervalRef = useRef<any>(null);
  const isCleaningUpRef = useRef<boolean>(false);

  // Whiteboard Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [drawColor, setDrawColor] = useState('#6366f1');
  const brushSize = 4;

  // Live Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatList, setChatList] = useState<ChatMessage[]>([]);
  const [participantsList, setParticipantsList] = useState<any[]>([]);

  // 1. Fetch Session Details, Roster, and Past Chats from Supabase
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
          console.warn("[WebRTC] Could not find session details in database:", error);
          return;
        }

        if (data) {
          setSessionOwnerId(data.org_id);
          if (data.topic) setMeetingTopic(data.topic);
          if (data.description) setMeetingDesc(data.description);

          const hostName = (data.profiles as any)?.full_name || 'Mentozy Organisation';
          const hostAvatar = hostName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);

          const roster = [
            {
              id: data.org_id,
              name: hostName,
              role: 'Host / Instructor',
              avatar: hostAvatar,
              active: true
            }
          ];

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
              isHost: msg.sender_id === data.org_id,
              senderId: msg.sender_id
            }));
            setChatList(loadedChats);
          } else {
            setChatList([
              { 
                id: '1', 
                sender: hostName, 
                avatar: hostAvatar, 
                text: `Welcome to Mentozy Live Space! Let's start the "${data.topic}" sync. Ready to collaborate.`, 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                isHost: true 
              }
            ]);
          }
        }
      } catch (err) {
        console.error("[WebRTC] Failed to query meeting details:", err);
      }
    }
    fetchMeetingDetails();
  }, [roomId]);

  // 2. Real-time Chat Subscription
  useEffect(() => {
    if (!roomId || !supabase || !user) return;
    const client = supabase;
    let subscription: any;

    async function setupRealtimeChat() {
      const { data: session } = await client
        .from('live_sessions')
        .select('id, org_id')
        .eq('room_id', roomId)
        .single();

      if (!session) return;

      subscription = client
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
              isHost: newMsg.sender_id === session.org_id,
              senderId: newMsg.sender_id
            }];
          });
        })
        .subscribe();
    }

    setupRealtimeChat();

    return () => {
      if (subscription) {
        client.removeChannel(subscription);
      }
    };
  }, [roomId, user]);

  // 3. Load Connected Media Devices
  useEffect(() => {
    async function loadDevices() {
      const devList = await enumerateMediaDevices();
      setDevices(devList);
      if (devList.videoInputs.length > 0 && !selectedVideoDeviceId) {
        setSelectedVideoDeviceId(devList.videoInputs[0].deviceId);
      }
      if (devList.audioInputs.length > 0 && !selectedAudioDeviceId) {
        setSelectedAudioDeviceId(devList.audioInputs[0].deviceId);
      }
      if (devList.audioOutputs.length > 0 && !selectedAudioOutputId) {
        setSelectedAudioOutputId(devList.audioOutputs[0].deviceId);
      }
    }
    loadDevices();

    const handleDeviceChange = () => loadDevices();
    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [selectedVideoDeviceId, selectedAudioDeviceId, selectedAudioOutputId]);

  // 4. Call Duration Timer
  useEffect(() => {
    let timer: any;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (callState === 'idle' || callState === 'ended') {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  // 5. Central Cleanup Function (Idempotent)
  const cleanupWebRTC = useCallback(() => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    console.log("[WebRTC] Performing complete WebRTC session cleanup");

    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { /* ignore */ }
      });
      localStreamRef.current = null;
    }

    // Stop screen share tracks
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { /* ignore */ }
      });
      screenStreamRef.current = null;
    }

    cameraTrackRef.current = null;
    micTrackRef.current = null;

    // Close PeerConnection
    if (pcRef.current) {
      try {
        pcRef.current.ontrack = null;
        pcRef.current.onicecandidate = null;
        pcRef.current.oniceconnectionstatechange = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.onnegotiationneeded = null;
        pcRef.current.close();
      } catch (err) {
        console.warn("[WebRTC] Error closing peer connection:", err);
      }
      pcRef.current = null;
    }

    // Reset video refs
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;

    pendingCandidatesRef.current = [];
    setRemoteStream(null);
    setIsRemoteVideoActive(false);
    setIsScreenSharing(false);
    setInSession(false);
    setCallState('ended');
    isCleaningUpRef.current = false;
  }, []);

  // 6. Create or Retrieve Peer Connection
  const getOrCreatePeerConnection = useCallback((channel: any) => {
    if (pcRef.current) return pcRef.current;

    console.log("[WebRTC] Creating RTCPeerConnection with ICE servers");
    setCallState('connecting');

    const config = getIceServers();
    const pc = new RTCPeerConnection(config);

    // Add local tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          pc.addTrack(track, localStreamRef.current!);
          console.log("[WebRTC] Attached local track to PC:", track.kind);
        } catch (err) {
          console.warn("[WebRTC] Track addition error:", err);
        }
      });
    }

    // ICE Candidate generation
    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && channel) {
        channel.send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: { candidate: event.candidate.toJSON(), sender: user?.id }
        });
      }
    };

    // Remote Track received
    pc.ontrack = (event: RTCTrackEvent) => {
      console.log("[WebRTC] Received remote track:", event.track.kind, event.streams[0]);
      if (event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setIsRemoteVideoActive(true);
        setRemoteTracksCount(prev => prev + 1);
        setCallState('connected');

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.play().catch(err => {
            console.warn("[WebRTC] Remote media autoplay paused:", err);
            if (err.name === 'NotAllowedError') {
              setShowAutoplayPrompt(true);
            }
          });
        }
      }
    };

    // ICE Connection State handling
    pc.oniceconnectionstatechange = () => {
      console.log("[WebRTC] ICE Connection State:", pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setCallState('connected');
        reconnectAttemptsRef.current = 0;
      } else if (pc.iceConnectionState === 'disconnected') {
        setCallState('reconnecting');
      } else if (pc.iceConnectionState === 'failed') {
        setCallState('reconnecting');
        handleIceRecovery(pc, channel);
      }
    };

    // Overall Connection State handling
    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] Connection State:", pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallState('connected');
        startStatsMonitoring(pc);
      } else if (pc.connectionState === 'disconnected') {
        setCallState('reconnecting');
      } else if (pc.connectionState === 'failed') {
        setCallState('failed');
        setIsRemoteVideoActive(false);
      } else if (pc.connectionState === 'closed') {
        setCallState('ended');
      }
    };

    pcRef.current = pc;
    return pc;
  }, [user]);

  // 7. ICE Recovery Handler
  const handleIceRecovery = (pc: RTCPeerConnection, channel: any) => {
    if (reconnectAttemptsRef.current >= 3) {
      console.warn("[WebRTC] Maximum ICE restart attempts reached.");
      setCallState('failed');
      return;
    }

    reconnectAttemptsRef.current += 1;
    console.log(`[WebRTC] Attempting ICE restart (${reconnectAttemptsRef.current}/3)`);

    if (pc.restartIce) {
      pc.restartIce();
    }

    pc.createOffer({ iceRestart: true })
      .then(offer => pc.setLocalDescription(offer))
      .then(() => {
        if (channel) {
          channel.send({
            type: 'broadcast',
            event: 'webrtc-signal',
            payload: { offer: pc.localDescription, sender: user?.id, iceRestart: true }
          });
        }
      })
      .catch(err => {
        console.error("[WebRTC] ICE restart offer failed:", err);
      });
  };

  // 8. Stats & Quality Monitoring
  const startStatsMonitoring = (pc: RTCPeerConnection) => {
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);

    statsIntervalRef.current = setInterval(async () => {
      if (!pc || pc.connectionState !== 'connected') return;
      try {
        const stats = await pc.getStats();
        const metrics = calculateConnectionQuality(stats);
        setConnectionQuality(metrics.quality);
      } catch (err) {
        console.warn("[WebRTC] Error retrieving stats:", err);
      }
    }, 3000);
  };

  // 9. WebRTC Signaling and Presence Setup
  useEffect(() => {
    if (!roomId || !supabase || !user || !hasJoined) return;
    const client = supabase;
    let channel: any;

    async function initializeSignaling() {
      channel = client.channel(`webrtc-room-${roomId}`);

      // Presence Sync: Update active participant list
      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const onlineList: any[] = [];
          Object.values(newState).forEach((presences: any) => {
            presences.forEach((presence: any) => {
              onlineList.push(presence);
            });
          });
          setPresenceUsers(onlineList);
        })
        .on('presence', { event: 'join' }, (event: any) => {
          const { newPresences } = event;
          console.log("[WebRTC] Presence join detected:", newPresences);
          const activePeer = newPresences.find((p: any) => p.id !== user?.id);
          
          if (activePeer) {
            const pc = getOrCreatePeerConnection(channel);
            // Deterministic offer initiation: host initiates, or if metadata is pending, lexicographical comparison
            const shouldInitiate = user?.id === sessionOwnerId || (user?.id > activePeer.id);
            if (shouldInitiate) {
              console.log("[WebRTC] Initiating SDP offer to peer:", activePeer.id);
              makingOfferRef.current = true;
              pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                  channel.send({
                    type: 'broadcast',
                    event: 'webrtc-signal',
                    payload: { offer: pc.localDescription, sender: user?.id }
                  });
                })
                .catch(err => console.error("[WebRTC] Offer generation error:", err))
                .finally(() => { makingOfferRef.current = false; });
            }
          }
        })
        .on('presence', { event: 'leave' }, (event: any) => {
          const { leftPresences } = event;
          console.log("[WebRTC] Presence leave detected:", leftPresences);
          if (leftPresences.some((p: any) => p.id !== user?.id)) {
            setIsRemoteVideoActive(false);
            setRemoteStream(null);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            if (pcRef.current) {
              pcRef.current.close();
              pcRef.current = null;
            }
            setCallState('idle');
          }
        });

      // Broadcast Signaling: Handle Offers, Answers, ICE Candidates, Leave events
      channel.on('broadcast', { event: 'webrtc-signal' }, async ({ payload }: any) => {
        if (!payload || payload.sender === user?.id) return;

        try {
          const pc = getOrCreatePeerConnection(channel);
          const isPolite = user?.id > payload.sender;

          if (payload.join) {
            console.log("[WebRTC] Received join signaling handshake");
            if (user?.id === sessionOwnerId || isPolite) {
              makingOfferRef.current = true;
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              channel.send({
                type: 'broadcast',
                event: 'webrtc-signal',
                payload: { offer: pc.localDescription, sender: user?.id }
              });
              makingOfferRef.current = false;
            }
          } else if (payload.offer) {
            console.log("[WebRTC] Received SDP Offer from:", payload.sender);
            const offerCollision = makingOfferRef.current || pc.signalingState !== 'stable';
            ignoreOfferRef.current = !isPolite && offerCollision;

            if (ignoreOfferRef.current) {
              console.log("[WebRTC] Ignoring colliding offer on impolite peer");
              return;
            }

            await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            channel.send({
              type: 'broadcast',
              event: 'webrtc-signal',
              payload: { answer: pc.localDescription, sender: user?.id }
            });

            // Flush queued ICE candidates safely
            if (pendingCandidatesRef.current.length > 0) {
              console.log(`[WebRTC] Flushing ${pendingCandidatesRef.current.length} queued ICE candidates`);
              for (const cand of pendingCandidatesRef.current) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) {
                  console.warn("[WebRTC] Error adding queued ICE candidate:", e);
                }
              }
              pendingCandidatesRef.current = [];
            }
          } else if (payload.answer) {
            console.log("[WebRTC] Received SDP Answer from:", payload.sender);
            isSettingRemoteAnswerPendingRef.current = true;
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
            isSettingRemoteAnswerPendingRef.current = false;

            // Flush queued ICE candidates safely
            if (pendingCandidatesRef.current.length > 0) {
              console.log(`[WebRTC] Flushing ${pendingCandidatesRef.current.length} queued ICE candidates`);
              for (const cand of pendingCandidatesRef.current) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) {
                  console.warn("[WebRTC] Error adding queued ICE candidate:", e);
                }
              }
              pendingCandidatesRef.current = [];
            }
          } else if (payload.candidate) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
              } catch (e) {
                if (!ignoreOfferRef.current) {
                  console.warn("[WebRTC] Error adding received ICE candidate:", e);
                }
              }
            } else {
              pendingCandidatesRef.current.push(payload.candidate);
            }
          } else if (payload.leave) {
            console.log("[WebRTC] Peer transmitted explicit leave event");
            setIsRemoteVideoActive(false);
            setRemoteStream(null);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            if (pcRef.current) {
              pcRef.current.close();
              pcRef.current = null;
            }
            setCallState('idle');
          }
        } catch (err) {
          console.error("[WebRTC] Error processing signaling signal:", err);
        }
      });

      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          setChannelSubscribed(true);
          console.log("[WebRTC] Signaling channel successfully subscribed");
          
          // Send initial join greeting to provoke offer if student
          channel.send({
            type: 'broadcast',
            event: 'webrtc-signal',
            payload: { join: true, sender: user?.id }
          });
        }
      });

      webrtcChannelRef.current = channel;
    }

    initializeSignaling();

    // Tab close / navigation cleanup
    const handleBeforeUnload = () => {
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: { leave: true, sender: user?.id }
        });
      }
      cleanupWebRTC();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      setChannelSubscribed(false);
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'webrtc-signal',
          payload: { leave: true, sender: user?.id }
        });
        channel.unsubscribe();
      }
      cleanupWebRTC();
    };
  }, [roomId, user, hasJoined, sessionOwnerId, cleanupWebRTC, getOrCreatePeerConnection]);

  // 10. Presence Metadata Tracking (Mic, Camera, ScreenShare status)
  useEffect(() => {
    if (!webrtcChannelRef.current || !channelSubscribed || !hasJoined || !user) return;

    const userMeta = {
      id: user.id,
      name: user.user_metadata?.full_name || 'Participant',
      avatar: (user.user_metadata?.full_name || 'P').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
      role: user.id === sessionOwnerId ? 'Host' : 'Student',
      onlineAt: new Date().toISOString(),
      isMicOn,
      isCameraOn,
      isScreenSharing,
      hasHandRaised
    };
    
    webrtcChannelRef.current.track(userMeta).catch((err: any) => {
      console.warn("[WebRTC] Presence track update:", err);
    });
  }, [isMicOn, isCameraOn, isScreenSharing, hasHandRaised, channelSubscribed, hasJoined, user, sessionOwnerId]);

  // 11. Bind Local Media Stream to Video Element
  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(err => {
        console.warn("[WebRTC] Local video play error:", err);
      });
    }
  }, [hasJoined, inSession, isCameraOn]);

  // 12. Bind Remote Stream to Remote Video Element
  useEffect(() => {
    const activeRemoteUser = presenceUsers.find(p => p.id !== user?.id);
    if (remoteStream && remoteVideoRef.current && activeRemoteUser) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(err => {
        console.warn("[WebRTC] Remote video play error:", err);
        if (err.name === 'NotAllowedError') {
          setShowAutoplayPrompt(true);
        }
      });
    }
  }, [remoteStream, presenceUsers, user, remoteTracksCount]);

  // 13. Start Media Session (Acquires Camera & Mic)
  const startSession = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedAudioDeviceId ? { deviceId: { exact: selectedAudioDeviceId } } : true,
        video: selectedVideoDeviceId ? { deviceId: { exact: selectedVideoDeviceId } } : { width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      cameraTrackRef.current = stream.getVideoTracks()[0] || null;
      micTrackRef.current = stream.getAudioTracks()[0] || null;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setInSession(true);
      toast.success('Camera & Microphone connected');
    } catch (err: any) {
      console.error("[WebRTC] getUserMedia error:", err);
      toast.error(formatWebRtcError(err));
      setIsMicOn(false);
      setIsCameraOn(false);
      setInSession(true); // Allow join with avatar preview fallback
    }
  };

  useEffect(() => {
    startSession();
    return () => cleanupWebRTC();
  }, []);

  // 14. Toggle Microphone / Camera (Track enable without renegotiation)
  const toggleTrack = (kind: 'audio' | 'video') => {
    const stream = localStreamRef.current;
    if (stream) {
      const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
      tracks.forEach(track => {
        track.enabled = !track.enabled;
      });
    }

    if (kind === 'audio') {
      const newMicState = !isMicOn;
      setIsMicOn(newMicState);
      if (micTrackRef.current) micTrackRef.current.enabled = newMicState;
    }
    if (kind === 'video') {
      const newCameraState = !isCameraOn;
      setIsCameraOn(newCameraState);
      if (cameraTrackRef.current) cameraTrackRef.current.enabled = newCameraState;
    }
  };

  // 15. Screen Sharing with RTCRtpSender.replaceTrack() & Native Stop Handler
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // 1. Stop screen share stream
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }

      // 2. Restore camera track on PeerConnection sender
      if (pcRef.current && cameraTrackRef.current) {
        const videoSender = pcRef.current.getSenders().find(s => s.track?.kind === 'video' || s.track === null);
        if (videoSender) {
          try {
            await videoSender.replaceTrack(cameraTrackRef.current);
            console.log("[WebRTC] Restored camera track on video sender");
          } catch (err) {
            console.warn("[WebRTC] Error restoring camera track on sender:", err);
          }
        }
      }

      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setIsScreenSharing(false);
      toast.success('Screen sharing stopped');
    } else {
      try {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          toast.error('Screen sharing is not supported on this browser.');
          return;
        }

        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStreamRef.current = stream;
        const screenTrack = stream.getVideoTracks()[0];

        // Replace video track on existing peer connection
        if (pcRef.current) {
          const videoSender = pcRef.current.getSenders().find(s => s.track?.kind === 'video' || s.track === null);
          if (videoSender) {
            await videoSender.replaceTrack(screenTrack);
            console.log("[WebRTC] Replaced video track with screen share track");
          }
        }

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }

        setIsScreenSharing(true);
        toast.success('Screen sharing active');

        // Handle Browser Native "Stop Sharing" Floating Bar
        screenTrack.onended = async () => {
          console.log("[WebRTC] Browser native stop sharing triggered");
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
          }

          if (pcRef.current && cameraTrackRef.current) {
            const videoSender = pcRef.current.getSenders().find(s => s.track?.kind === 'video' || s.track === null);
            if (videoSender) {
              try {
                await videoSender.replaceTrack(cameraTrackRef.current);
                console.log("[WebRTC] Restored camera track on video sender after native stop");
              } catch (err) {
                console.warn("[WebRTC] Error restoring camera track on sender:", err);
              }
            }
          }

          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }

          setIsScreenSharing(false);
          toast.info('Screen sharing stopped');
        };
      } catch (err: any) {
        if (err.name !== 'NotAllowedError') {
          console.error("[WebRTC] Screen sharing error:", err);
          toast.error(formatWebRtcError(err));
        }
      }
    }
  };

  // Safe ref assignment for screen sharing video element
  useEffect(() => {
    if (isScreenSharing && screenStreamRef.current && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [isScreenSharing]);

  // 16. In-Call Device Switching (Camera & Microphone)
  const handleSwitchCamera = async (deviceId: string) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      const newVideoTrack = newStream.getVideoTracks()[0];

      if (cameraTrackRef.current) {
        cameraTrackRef.current.stop();
      }
      cameraTrackRef.current = newVideoTrack;
      newVideoTrack.enabled = isCameraOn;

      if (localStreamRef.current) {
        const oldTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldTrack) localStreamRef.current.removeTrack(oldTrack);
        localStreamRef.current.addTrack(newVideoTrack);
      }

      if (!isScreenSharing && pcRef.current) {
        const videoSender = pcRef.current.getSenders().find(s => s.track?.kind === 'video' || s.track === null);
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }

      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setSelectedVideoDeviceId(deviceId);
      toast.success('Camera switched');
    } catch (err) {
      toast.error(formatWebRtcError(err));
    }
  };

  const handleSwitchMic = async (deviceId: string) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } }
      });
      const newAudioTrack = newStream.getAudioTracks()[0];

      if (micTrackRef.current) {
        micTrackRef.current.stop();
      }
      micTrackRef.current = newAudioTrack;
      newAudioTrack.enabled = isMicOn;

      if (localStreamRef.current) {
        const oldTrack = localStreamRef.current.getAudioTracks()[0];
        if (oldTrack) localStreamRef.current.removeTrack(oldTrack);
        localStreamRef.current.addTrack(newAudioTrack);
      }

      if (pcRef.current) {
        const audioSender = pcRef.current.getSenders().find(s => s.track?.kind === 'audio' || s.track === null);
        if (audioSender) {
          await audioSender.replaceTrack(newAudioTrack);
        }
      }

      setSelectedAudioDeviceId(deviceId);
      toast.success('Microphone switched');
    } catch (err) {
      toast.error(formatWebRtcError(err));
    }
  };

  const handleSwitchSpeaker = async (deviceId: string) => {
    if (remoteVideoRef.current && 'setSinkId' in (remoteVideoRef.current as any)) {
      try {
        await (remoteVideoRef.current as any).setSinkId(deviceId);
        setSelectedAudioOutputId(deviceId);
        toast.success('Speaker output switched');
      } catch (err) {
        toast.error('Could not switch audio output device.');
      }
    } else {
      toast.info('Audio output switching is not supported by your browser.');
    }
  };

  // 17. Manual Reconnect Handler
  const handleManualReconnect = () => {
    if (webrtcChannelRef.current) {
      setCallState('reconnecting');
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      const pc = getOrCreatePeerConnection(webrtcChannelRef.current);
      webrtcChannelRef.current.send({
        type: 'broadcast',
        event: 'webrtc-signal',
        payload: { join: true, sender: user?.id }
      });
      toast.info('Re-initiating WebRTC connection...');
    }
  };

  // 18. Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // 19. Leave / Exit Meeting Room
  const handleExitMeeting = () => {
    cleanupWebRTC();
    toast.success('Disconnected from Live Session.');
    navigate(-1);
  };

  // 20. Chat Sender
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
          console.error("[WebRTC] Error inserting chat message:", error);
          toast.error("Message delivery failed.");
        }
      }
    } catch (e) {
      console.error("[WebRTC] Error sending chat message:", e);
    }
    
    setChatMessage('');
  };

  // 21. Hand Raise
  const handleRaiseHand = () => {
    setHasHandRaised(prev => !prev);
    const text = !hasHandRaised ? 'raised hand ✋' : 'lowered hand';
    setChatList(prev => [...prev, {
      id: `chat-sys-${Date.now()}`,
      sender: 'System',
      avatar: 'SYS',
      text: `${myName} ${text}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // 22. HTML5 Drawing Canvas
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

  const activeRemoteUser = presenceUsers.find(p => p.id !== user?.id);
  const isCurrentUserHost = user?.id === sessionOwnerId;
  const myName = user?.user_metadata?.full_name || (isCurrentUserHost ? 'Host' : 'Student');
  const myInitials = myName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  const dynamicRoster = participantsList.map(member => {
    const isOnline = presenceUsers.some(p => p.id === member.id);
    const presenceInfo = presenceUsers.find(p => p.id === member.id);
    return {
      ...member,
      active: member.id === user?.id || isOnline,
      isMicOn: member.id === user?.id ? isMicOn : (presenceInfo ? presenceInfo.isMicOn : true),
      isCameraOn: member.id === user?.id ? isCameraOn : (presenceInfo ? presenceInfo.isCameraOn : true)
    };
  });

  // Pre-join Lobby View
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
              {meetingDesc && <p className="text-xs text-slate-500 italic mt-1">{meetingDesc}</p>}
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setHasJoined(true)}
                className="w-full lg:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                Join now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Session View
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-sans select-none text-slate-100 overflow-hidden">
      
      {/* Autoplay blocked banner */}
      {showAutoplayPrompt && (
        <div className="bg-amber-500 text-black px-4 py-2 text-xs font-bold flex items-center justify-between z-50">
          <span>Audio playback requires interaction. Click to enable remote sound.</span>
          <button 
            onClick={() => {
              if (remoteVideoRef.current) remoteVideoRef.current.play();
              setShowAutoplayPrompt(false);
            }}
            className="px-3 py-1 bg-black text-white rounded font-black text-[11px] cursor-pointer"
          >
            ENABLE AUDIO
          </button>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-white">{meetingTopic}</span>
              
              {/* Call State Badge */}
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border flex items-center gap-1 ${
                callState === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                callState === 'connecting' || callState === 'reconnecting' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse' :
                callState === 'failed' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  callState === 'connected' ? 'bg-emerald-400' :
                  callState === 'connecting' || callState === 'reconnecting' ? 'bg-amber-400' :
                  callState === 'failed' ? 'bg-rose-400' : 'bg-slate-400'
                }`} />
                {callState === 'connected' ? `LIVE · ${formatCallDuration(callDuration)}` : callState.toUpperCase()}
              </span>

              {/* Quality Indicator */}
              {callState === 'connected' && (
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-semibold" title="Connection Quality">
                  Quality: <span className={connectionQuality === 'excellent' || connectionQuality === 'good' ? 'text-emerald-400 font-bold' : connectionQuality === 'fair' ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>{connectionQuality}</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Room: {roomId}</p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2">
          {/* Reconnect button if disconnected or failed */}
          {(callState === 'failed' || callState === 'reconnecting') && (
            <button 
              onClick={handleManualReconnect}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reconnect
            </button>
          )}

          {/* Device Settings Button */}
          <button 
            onClick={() => setIsDeviceSettingsOpen(true)}
            className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all cursor-pointer"
            title="Media Device Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button 
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Active Roster Toggle */}
          <button 
            onClick={() => { setIsParticipantsOpen(prev => !prev); setIsChatOpen(false); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${isParticipantsOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}
          >
            <Users className="w-4 h-4" />
            {participantsList.length} Active
          </button>
          
          {/* Chat Toggle */}
          <button 
            onClick={() => { setIsChatOpen(prev => !prev); setIsParticipantsOpen(false); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${isChatOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Live Chat
          </button>
        </div>
      </div>

      {/* 2. Main Workstation Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Core Video Frame */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 items-center justify-center relative overflow-hidden bg-slate-950">
          
          <div className="w-full h-full max-w-5xl max-h-[85vh] relative flex gap-4 items-center justify-center">
            
            {/* Main Stage (Local Video / Whiteboard / Remote Screen) */}
            <div className={`flex-1 h-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative group flex items-center justify-center ${isScreenSharing ? 'hidden lg:flex' : 'flex'}`}>
              
              {/* Whiteboard Overlay */}
              {isWhiteboardOpen && (
                <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-300 flex flex-col">
                  <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-indigo-400" /> Interactive Whiteboard Canvas
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ffffff'].map(c => (
                          <button 
                            key={c}
                            onClick={() => setDrawColor(c)}
                            className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${drawColor === c ? 'scale-125 border-white' : 'border-slate-800'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="h-4 w-[1px] bg-slate-800"></div>
                      <button 
                        onClick={clearCanvasBoard}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eraser className="w-4 h-4" /> Clear Board
                      </button>
                    </div>
                  </div>
                  
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

              {/* Avatar Fallback */}
              {(!isCameraOn || !inSession) && !isWhiteboardOpen && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 space-y-4 animate-in fade-in duration-300">
                  <div className="w-24 h-24 rounded-full bg-indigo-600/20 text-indigo-400 border-2 border-indigo-500/30 flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-indigo-600/10 animate-bounce">
                    {myInitials}
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-white text-base">{myName} (You)</h4>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">Camera is paused</p>
                  </div>
                </div>
              )}

              {/* Tag Overlay */}
              <div className="absolute bottom-4 left-4 z-30 bg-slate-950/70 border border-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isCurrentUserHost ? 'bg-indigo-500' : 'bg-emerald-500'} animate-ping`}></div>
                <span className="text-xs font-bold text-white">
                  {isCurrentUserHost ? 'Host (Instructor)' : 'Student'} · {myName}
                </span>
              </div>
            </div>

            {/* Screen Sharing Stage */}
            {isScreenSharing && (
              <div className="flex-1 h-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative flex items-center justify-center z-10 animate-in zoom-in-95 duration-300">
                <video ref={screenVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 border border-white/10">
                  <Tv className="w-4.5 h-4.5 text-amber-500" />
                  <span className="text-xs font-bold text-white">Broadcasting Screen Space</span>
                </div>
              </div>
            )}

            {/* Remote Peer Video Card */}
            {activeRemoteUser && (
              <div className="absolute top-4 right-4 w-48 sm:w-56 aspect-video rounded-2xl overflow-hidden bg-slate-950/80 border border-white/10 shadow-2xl z-30 pointer-events-auto animate-in zoom-in-95 duration-300">
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative">
                  
                  {/* Remote Stream Video */}
                  <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover z-10 ${isRemoteVideoActive && activeRemoteUser.isCameraOn !== false ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`} 
                  />

                  {/* Fallback avatar if remote camera is paused */}
                  {(!isRemoteVideoActive || activeRemoteUser.isCameraOn === false) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20 space-y-2 animate-in fade-in duration-300">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/25 flex items-center justify-center text-xs font-bold shadow-md shadow-purple-600/10 animate-pulse">
                        {activeRemoteUser.avatar}
                      </div>
                      <span className="text-[9px] font-bold text-slate-300">{activeRemoteUser.name}</span>
                      <p className="text-[8px] text-slate-500">Camera is paused</p>
                    </div>
                  )}

                  {/* Remote mic & status badge */}
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded border border-white/5 flex items-center gap-1.5 z-30">
                    {activeRemoteUser.isMicOn === false ? (
                      <MicOff className="w-2.5 h-2.5 text-rose-400" />
                    ) : (
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-2 bg-emerald-500 animate-pulse"></div>
                        <div className="w-0.5 h-3 bg-emerald-500 animate-pulse"></div>
                        <div className="w-0.5 h-1.5 bg-emerald-500 animate-pulse"></div>
                      </div>
                    )}
                    <span className="text-[8px] text-emerald-400 font-extrabold uppercase">
                      {activeRemoteUser.isMicOn === false ? 'Muted' : 'Live'}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 3. Live Chat Panel */}
        {isChatOpen && (
          <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-400" /> Live Chat Space
              </h3>
            </div>
            
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

            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Send a chat message..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-xs text-white focus:border-indigo-500 outline-none"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                />
                <button 
                  onClick={handleSendChat}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Active Roster Panel */}
        {isParticipantsOpen && (
          <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" /> Active Roster
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {dynamicRoster.map(member => (
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

      {/* 5. Bottom Control Toolbar */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        
        {/* Left segment */}
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-medium">
          <span className="font-bold text-white">Topic:</span> {meetingTopic}
        </div>

        {/* Center Segment: Core WebRTC Media Switches */}
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          
          {/* Microphone Switch */}
          <button 
            onClick={() => toggleTrack('audio')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${isMicOn ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' : 'bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30'}`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Switch */}
          <button 
            onClick={() => toggleTrack('video')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${isCameraOn ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white' : 'bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30'}`}
            title={isCameraOn ? 'Pause Camera' : 'Start Camera'}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share Switch */}
          <button 
            onClick={handleToggleScreenShare}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${isScreenSharing ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white'}`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <MonitorPlay className="w-5 h-5" />
          </button>

          {/* Whiteboard Toggle */}
          <button 
            onClick={() => setIsWhiteboardOpen(prev => !prev)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${isWhiteboardOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white'}`}
            title="Toggle Whiteboard Canvas"
          >
            <PenTool className="w-5 h-5" />
          </button>

          {/* Raise Hand Toggle */}
          <button 
            onClick={handleRaiseHand}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${hasHandRaised ? 'bg-indigo-600 border-indigo-500 text-white animate-bounce' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white'}`}
            title="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </button>

        </div>

        {/* Right Segment: End Session Action */}
        <div>
          <button 
            onClick={handleExitMeeting}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4 animate-pulse" />
            End Session
          </button>
        </div>

      </div>

      {/* 6. Device Settings Modal Dialog */}
      {isDeviceSettingsOpen && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" /> Media Device Settings
              </h3>
              <button 
                onClick={() => setIsDeviceSettingsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Camera Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-indigo-400" /> Camera
                </label>
                <select 
                  value={selectedVideoDeviceId}
                  onChange={e => handleSwitchCamera(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  {devices.videoInputs.map(dev => (
                    <option key={dev.deviceId} value={dev.deviceId}>
                      {dev.label || `Camera (${dev.deviceId.substring(0, 5)})`}
                    </option>
                  ))}
                  {devices.videoInputs.length === 0 && <option value="">No cameras detected</option>}
                </select>
              </div>

              {/* Microphone Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-indigo-400" /> Microphone
                </label>
                <select 
                  value={selectedAudioDeviceId}
                  onChange={e => handleSwitchMic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  {devices.audioInputs.map(dev => (
                    <option key={dev.deviceId} value={dev.deviceId}>
                      {dev.label || `Microphone (${dev.deviceId.substring(0, 5)})`}
                    </option>
                  ))}
                  {devices.audioInputs.length === 0 && <option value="">No microphones detected</option>}
                </select>
              </div>

              {/* Speaker Selection */}
              {devices.audioOutputs.length > 0 && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Speakers / Output
                  </label>
                  <select 
                    value={selectedAudioOutputId}
                    onChange={e => handleSwitchSpeaker(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    {devices.audioOutputs.map(dev => (
                      <option key={dev.deviceId} value={dev.deviceId}>
                        {dev.label || `Speaker (${dev.deviceId.substring(0, 5)})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setIsDeviceSettingsOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default LiveSessionPage;
