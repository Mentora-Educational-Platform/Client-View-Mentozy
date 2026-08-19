import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Search, Send, Paperclip,
    AtSign, Smile,
    Info, Users, ArrowLeft,
    Circle, Loader2, MessageSquare,
    FileText, X, Download, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import {
    Contact, getContacts, getOrgContacts,
    Message, getMessages, sendMessage, markAllAsRead,
    uploadMessageAttachment, parseMessageAttachment, MessageAttachment,
    ALLOWED_ATTACHMENT_EXTENSIONS, BLOCKED_ATTACHMENT_EXTENSIONS, MAX_ATTACHMENT_SIZE_BYTES
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useOrganizationMode } from '../../context/OrganizationModeContext';
import { getSupabase } from '../../lib/supabase';

export function MessagesPage() {
    const { user } = useAuth();
    const { mode, activeOrganization } = useOrganizationMode();
    const [activeContactId, setActiveContactId] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    
    // Attachment State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const location = useLocation();
    const isMentorView = location.pathname.includes('mentor');
    const isOrgMode = mode === 'organization' && Boolean(activeOrganization?.id);

    // 1. Initial Contact Load & Unread Counts
    const loadContactsAndUnread = async () => {
        if (!user) return;
        setLoading(true);
        let data: Contact[] = [];
        
        if (isOrgMode && activeOrganization?.id) {
            data = await getOrgContacts(activeOrganization.id, user.id);
        } else {
            const role = isMentorView ? 'mentor' : 'student';
            data = await getContacts(user.id, role);
        }
        setContacts(data);

        // Fetch unread counts for all potential contacts
        const supabase = getSupabase();
        if (supabase) {
            const { data: unreadData } = await supabase
                .from('messages')
                .select('sender_id')
                .eq('receiver_id', user.id)
                .eq('is_read', false);

            if (unreadData) {
                const counts: Record<string, number> = {};
                unreadData.forEach(msg => {
                    counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
                });
                setUnreadCounts(counts);
            }
        }

        if (data.length > 0 && !activeContactId) {
            setActiveContactId(data[0].id);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadContactsAndUnread();
    }, [user, isMentorView, isOrgMode, activeOrganization?.id]);

    // 2. Load Chat History & Mark as Read
    useEffect(() => {
        async function loadChatHistory() {
            if (!user || !activeContactId) return;
            setMessagesLoading(true);
            const history = await getMessages(user.id, activeContactId);
            setChatMessages(history);

            // Mark all as read when opening conversation
            await markAllAsRead(activeContactId, user.id);
            setUnreadCounts(prev => ({ ...prev, [activeContactId]: 0 }));

            setMessagesLoading(false);
        }
        loadChatHistory();
    }, [user, activeContactId]);

    // 3. Setup Real-time Subscription
    useEffect(() => {
        if (!user || !activeContactId) return;

        const supabase = getSupabase();
        if (!supabase) return;

        const channel = supabase
            .channel('realtime_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${user.id}`
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    if (newMsg.sender_id === activeContactId) {
                        setChatMessages(prev => [...prev, newMsg]);
                        markAllAsRead(activeContactId, user.id);
                    } else {
                        setUnreadCounts(prev => ({
                            ...prev,
                            [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, activeContactId, contacts]);

    // 4. Handle Scroll to Bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages, activeContactId]);

    // Handle File Selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase() || '';

        // Validate Extension
        if (BLOCKED_ATTACHMENT_EXTENSIONS.includes(ext) || !ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
            toast.error("This file type isn't supported.");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Validate Size (10MB)
        if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
            toast.error("File is too large. Maximum attachment size is 10 MB.");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setSelectedFile(file);

        // Preview for images
        if (file.type.startsWith('image/')) {
            setFilePreviewUrl(URL.createObjectURL(file));
        } else {
            setFilePreviewUrl(null);
        }
    };

    const removeAttachment = () => {
        setSelectedFile(null);
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async () => {
        if ((!messageInput.trim() && !selectedFile) || !user || !activeContactId || uploading) return;

        const textToSend = messageInput.trim();
        let uploadedAttachment: MessageAttachment | undefined = undefined;

        if (selectedFile) {
            setUploading(true);
            const uploaded = await uploadMessageAttachment(
                selectedFile,
                user.id,
                isOrgMode ? activeOrganization?.id : undefined
            );

            if (!uploaded) {
                setUploading(false);
                return;
            }
            uploadedAttachment = uploaded;
        }

        setMessageInput('');
        removeAttachment();

        const sentMessage = await sendMessage(
            user.id,
            activeContactId,
            textToSend,
            isOrgMode ? activeOrganization?.id : undefined,
            uploadedAttachment
        );

        setUploading(false);

        if (sentMessage) {
            setChatMessages(prev => [...prev, sentMessage]);
        } else {
            toast.error("Failed to send message. Recipient must belong to this organisation.");
            setMessageInput(textToSend); // Restore input on failure
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const activeContact = contacts.find(c => c.id === activeContactId);

    const filteredContacts = contacts.filter(c => 
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const orgStudents = filteredContacts.filter(c => c.role === 'student');
    const orgTeachers = filteredContacts.filter(c => c.role === 'teacher' || c.role === 'mentor' || c.role === 'admin');

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-160px)] bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl max-w-full">

                {/* Conversations Sidebar — Hidden on mobile when contact is active */}
                <div className={`w-full md:w-80 border-r border-gray-50 flex flex-col bg-gray-50/50 flex-shrink-0 ${activeContactId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                                <Users className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search organisation contacts..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 space-y-3">
                        {loading ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                            </div>
                        ) : isOrgMode ? (
                            <>
                                {/* Students Section */}
                                <div>
                                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600 flex justify-between items-center">
                                        <span>Students</span>
                                        <span className="bg-indigo-50 px-1.5 py-0.5 rounded text-[9px] font-black">{orgStudents.length}</span>
                                    </div>
                                    {orgStudents.length > 0 ? (
                                        orgStudents.map(contact => (
                                            <button
                                                key={contact.id}
                                                onClick={() => setActiveContactId(contact.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group relative ${activeContactId === contact.id ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-white/50'}`}
                                            >
                                                <div className="relative">
                                                    {contact.avatar ? (
                                                        <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-xl object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-indigo-100 text-indigo-600">
                                                            {contact.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-sm text-gray-900 truncate">{contact.name}</span>
                                                        {unreadCounts[contact.id] > 0 && (
                                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-200" />
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 truncate">{unreadCounts[contact.id] > 0 ? `${unreadCounts[contact.id]} new messages` : (contact.lastMessage || 'Organisation Student')}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-3 py-2 text-[11px] text-gray-400 font-bold italic">No students in this organisation.</p>
                                    )}
                                </div>

                                {/* Teachers Section */}
                                <div>
                                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 flex justify-between items-center mt-2">
                                        <span>Teachers</span>
                                        <span className="bg-amber-50 px-1.5 py-0.5 rounded text-[9px] font-black text-amber-700">{orgTeachers.length}</span>
                                    </div>
                                    {orgTeachers.length > 0 ? (
                                        orgTeachers.map(contact => (
                                            <button
                                                key={contact.id}
                                                onClick={() => setActiveContactId(contact.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group relative ${activeContactId === contact.id ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-white/50'}`}
                                            >
                                                <div className="relative">
                                                    {contact.avatar ? (
                                                        <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-xl object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-amber-100 text-amber-600">
                                                            {contact.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-sm text-gray-900 truncate">{contact.name}</span>
                                                        {unreadCounts[contact.id] > 0 && (
                                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-200" />
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 truncate">{unreadCounts[contact.id] > 0 ? `${unreadCounts[contact.id]} new messages` : (contact.lastMessage || 'Organisation Teacher')}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-3 py-2 text-[11px] text-gray-400 font-bold italic">No teachers in this organisation.</p>
                                    )}
                                </div>
                            </>
                        ) : filteredContacts.length > 0 ? (
                            filteredContacts.map(contact => (
                                <button
                                    key={contact.id}
                                    onClick={() => setActiveContactId(contact.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group relative ${activeContactId === contact.id ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-white/50'}`}
                                >
                                    <div className="relative">
                                        {contact.avatar ? (
                                            <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-xl object-cover" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${contact.role === 'mentor' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {contact.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm text-gray-900 truncate">{contact.name}</span>
                                            {unreadCounts[contact.id] > 0 && (
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-200" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 truncate">{unreadCounts[contact.id] > 0 ? `${unreadCounts[contact.id]} new messages` : (contact.lastMessage || 'Click to chat')}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-xs">
                                No peer contacts found.<br />
                                Add {isMentorView ? 'mentors' : 'students'} to your network!
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area — Takes full width on mobile when contact is selected */}
                <div className={`flex-1 flex flex-col bg-white min-w-0 overflow-hidden ${!activeContactId ? 'hidden md:flex' : 'flex'}`}>
                    {activeContactId ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-50 flex items-center justify-between min-w-0">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <button
                                        onClick={() => setActiveContactId('')}
                                        className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
                                        title="Back to contacts"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 ${activeContact?.role === 'mentor' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {activeContact?.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{activeContact?.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <Circle className={`w-2 h-2 ${activeContact?.status === 'online' ? 'fill-emerald-500 text-emerald-500' : 'fill-gray-300 text-gray-300'}`} />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeContact?.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => toast.info("Contact info")} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all">
                                        <Info className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-white scroll-smooth focus:outline-none">
                                {messagesLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                                        <Loader2 className="w-8 h-8 text-indigo-200 animate-spin" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading Conversation</p>
                                    </div>
                                ) : chatMessages.length > 0 ? (
                                    chatMessages.map((message) => {
                                        const { text, attachment } = parseMessageAttachment(message);
                                        const isMine = message.sender_id === user?.id;
                                        const isImageMsg = attachment && (
                                            attachment.type.startsWith('image/') ||
                                            ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(attachment.name.split('.').pop()?.toLowerCase() || '')
                                        );

                                        return (
                                            <div key={message.id} id={`msg-${message.id}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`${isImageMsg ? 'w-full max-w-[90%] md:max-w-[680px]' : 'max-w-[75%] md:max-w-[520px]'} ${isMine ? 'order-2' : ''}`}>
                                                    <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed space-y-3 ${isMine
                                                        ? 'bg-gray-900 text-white rounded-tr-none shadow-lg shadow-gray-200'
                                                        : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100/50'
                                                        }`}>
                                                        
                                                        {/* Text Content */}
                                                        {text && <p className="whitespace-pre-wrap font-medium">{text}</p>}

                                                        {/* Attachment Content */}
                                                        {attachment && (
                                                            <div className="mt-2 min-w-0 max-w-full">
                                                                {isImageMsg ? (
                                                                    /* Image Attachment — Full width display like WhatsApp web */
                                                                    <div className="rounded-2xl overflow-hidden border border-white/20 shadow-md bg-black/30 group relative w-full">
                                                                        <div className="flex items-center justify-center bg-black/20 p-1 w-full">
                                                                            <img
                                                                                src={attachment.url}
                                                                                alt={attachment.name}
                                                                                className="w-full h-auto max-h-[550px] object-contain rounded-xl"
                                                                            />
                                                                        </div>
                                                                        <div className="p-2.5 flex items-center justify-between bg-black/60 text-white backdrop-blur-md text-xs border-t border-white/10">
                                                                            <span className="truncate font-semibold max-w-[280px]" title={attachment.name}>{attachment.name}</span>
                                                                            <a
                                                                                href={attachment.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1 text-[11px] font-bold text-white flex-shrink-0"
                                                                                title="Open full size image"
                                                                            >
                                                                                <span>Full View</span>
                                                                                <ExternalLink className="w-3.5 h-3.5 text-white" />
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* Document Attachment */
                                                                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${isMine ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'} shadow-sm`}>
                                                                        <div className={`p-2.5 rounded-lg ${isMine ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                                                            <FileText className="w-6 h-6" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-bold text-xs truncate">{attachment.name}</p>
                                                                            <p className={`text-[10px] ${isMine ? 'text-gray-300' : 'text-gray-500'}`}>
                                                                                {formatFileSize(attachment.size)}
                                                                            </p>
                                                                        </div>
                                                                        <a
                                                                            href={attachment.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            download={attachment.name}
                                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${isMine ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                                                        >
                                                                            <Download className="w-3.5 h-3.5" />
                                                                            <span>Open</span>
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMine && (
                                                            message.is_read ? (
                                                                <div className="flex items-center -space-x-1">
                                                                    <Circle className="w-1.5 h-1.5 fill-indigo-500 text-indigo-500" />
                                                                    <Circle className="w-1.5 h-1.5 fill-indigo-500 text-indigo-500" />
                                                                </div>
                                                            ) : (
                                                                <Circle className="w-1.5 h-1.5 text-gray-300" />
                                                            )
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-50 grayscale">
                                        <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
                                            <Smile className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400">No messages yet. Say hello!</p>
                                    </div>
                                )}
                            </div>

                            {/* Attachment Selected Preview Box — Placed above composer controls with strict constraints */}
                            {selectedFile && (
                                <div className="px-4 sm:px-8 pb-3 min-w-0 max-w-full">
                                    <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 min-w-0 max-w-full shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            {filePreviewUrl ? (
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={filePreviewUrl}
                                                        alt="Preview"
                                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-indigo-200 shadow-sm"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-900 truncate max-w-[180px] sm:max-w-xs md:max-w-md" title={selectedFile.name}>
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-medium">
                                                    {formatFileSize(selectedFile.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeAttachment}
                                            aria-label="Remove attachment"
                                            className="flex-shrink-0 p-2 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl shadow-sm border border-gray-100 transition-colors"
                                            title="Remove attachment"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Chat Input Bar */}
                            <div className="p-4 sm:p-8 pt-0 min-w-0 max-w-full">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                />
                                <div className="bg-gray-50 rounded-[2rem] p-2.5 sm:p-3 flex items-center gap-2 border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all min-w-0 max-w-full">
                                    {/* Attachment Button */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        aria-label="Attach file"
                                        className={`flex-shrink-0 p-2 transition-colors rounded-xl ${selectedFile ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600'}`}
                                        title="Attach educational file or image"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>

                                    {/* Text Input — Shrinks properly when space is tight */}
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={selectedFile ? `Add a caption...` : `Message ${activeContact?.name || ''}...`}
                                        className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-sm px-2 font-medium text-gray-900 placeholder:text-gray-400"
                                    />

                                    {/* Action Buttons — Always flex-shrink-0 to prevent Send button clipping */}
                                    <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                                        <button onClick={() => toast.info("Emoji picker coming soon")} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors hidden sm:block" title="Add Emoji">
                                            <Smile className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => toast.info("Mentions coming soon")} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors hidden sm:block" title="Mention contact">
                                            <AtSign className="w-5 h-5" />
                                        </button>

                                        {/* Send Button — GUARANTEED flex-shrink-0 and visible */}
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={uploading || (!messageInput.trim() && !selectedFile)}
                                            aria-label="Send message"
                                            className="flex-shrink-0 ml-1 p-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[42px] h-[42px]"
                                            title="Send message"
                                        >
                                            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30 p-12 text-center">
                            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-indigo-200" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Conversations</h3>
                            <p className="text-gray-500 max-w-sm mb-8 font-medium">
                                Select a contact from the sidebar to start a conversation with a peer.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}

export default MessagesPage;
