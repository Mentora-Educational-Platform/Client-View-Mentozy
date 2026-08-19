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
            <div className="flex h-[calc(100vh-100px)] md:h-[calc(100vh-120px)] w-full bg-[#FAF9F6] rounded-2xl border-4 border-gray-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden font-mono text-gray-900">

                {/* Conversations Sidebar — Hidden on mobile when contact is active */}
                <div className={`w-full md:w-80 lg:w-96 border-r-4 border-gray-900 flex flex-col bg-[#FAF9F6] flex-shrink-0 ${activeContactId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 sm:p-5 border-b-4 border-gray-900 bg-[#eff3ff] space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-gray-900" />
                                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">MESSAGES</h2>
                            </div>
                            <button className="p-2 bg-white border-2 border-gray-900 rounded-xl text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#FAF9F6] active:translate-x-[1px] active:translate-y-[1px] transition-all">
                                <Users className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                                type="text"
                                placeholder="Search organisation contacts..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-900 rounded-xl font-bold text-xs text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-[#eff3ff]"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {loading ? (
                            <div className="p-8 flex flex-col items-center justify-center space-y-3">
                                <Loader2 className="w-6 h-6 text-gray-900 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Loading Contacts...</p>
                            </div>
                        ) : isOrgMode ? (
                            <>
                                {/* Students Section */}
                                <div className="space-y-2">
                                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-gray-900 flex justify-between items-center">
                                        <span>Students</span>
                                        <span className="bg-[#eff3ff] border border-gray-900 px-2 py-0.5 rounded text-[10px] font-black text-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                            {orgStudents.length}
                                        </span>
                                    </div>
                                    {orgStudents.length > 0 ? (
                                        orgStudents.map(contact => (
                                            <button
                                                key={contact.id}
                                                onClick={() => setActiveContactId(contact.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-900 transition-all group relative text-left cursor-pointer ${
                                                    activeContactId === contact.id
                                                        ? 'bg-gray-900 text-white shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                                                        : 'bg-white hover:bg-[#eff3ff] shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] text-gray-900'
                                                }`}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    {contact.avatar ? (
                                                        <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-xl border-2 border-gray-900 object-cover shadow-[1px_1px_0px_rgba(0,0,0,1)]" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl border-2 border-gray-900 flex items-center justify-center font-black text-sm bg-[#818CF8] text-white shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                            {contact.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${contact.status === 'online' ? 'bg-[#06D6A0]' : 'bg-gray-400'}`}></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="font-black text-xs sm:text-sm truncate">{contact.name}</span>
                                                        {unreadCounts[contact.id] > 0 && (
                                                            <div className="w-2.5 h-2.5 bg-[#FF6B6B] border border-gray-900 rounded-full shadow-[1px_1px_0px_rgba(0,0,0,1)] animate-pulse flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className={`text-[11px] font-bold truncate mt-0.5 ${activeContactId === contact.id ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        {unreadCounts[contact.id] > 0 ? `${unreadCounts[contact.id]} new messages` : (contact.lastMessage || 'Organisation Student')}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-3 py-2 text-[11px] text-gray-500 font-bold italic bg-white border border-gray-900 rounded-lg">
                                            No students in this organisation.
                                        </p>
                                    )}
                                </div>

                                {/* Teachers Section */}
                                <div className="space-y-2 mt-3">
                                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-gray-900 flex justify-between items-center">
                                        <span>Teachers</span>
                                        <span className="bg-[#FFD166] border border-gray-900 px-2 py-0.5 rounded text-[10px] font-black text-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                            {orgTeachers.length}
                                        </span>
                                    </div>
                                    {orgTeachers.length > 0 ? (
                                        orgTeachers.map(contact => (
                                            <button
                                                key={contact.id}
                                                onClick={() => setActiveContactId(contact.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-900 transition-all group relative text-left cursor-pointer ${
                                                    activeContactId === contact.id
                                                        ? 'bg-gray-900 text-white shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                                                        : 'bg-white hover:bg-[#eff3ff] shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] text-gray-900'
                                                }`}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    {contact.avatar ? (
                                                        <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-xl border-2 border-gray-900 object-cover shadow-[1px_1px_0px_rgba(0,0,0,1)]" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl border-2 border-gray-900 flex items-center justify-center font-black text-sm bg-[#FFD166] text-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                            {contact.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${contact.status === 'online' ? 'bg-[#06D6A0]' : 'bg-gray-400'}`}></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="font-black text-xs sm:text-sm truncate">{contact.name}</span>
                                                        {unreadCounts[contact.id] > 0 && (
                                                            <div className="w-2.5 h-2.5 bg-[#FF6B6B] border border-gray-900 rounded-full shadow-[1px_1px_0px_rgba(0,0,0,1)] animate-pulse flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className={`text-[11px] font-bold truncate mt-0.5 ${activeContactId === contact.id ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        {unreadCounts[contact.id] > 0 ? `${unreadCounts[contact.id]} new messages` : (contact.lastMessage || 'Organisation Teacher')}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-3 py-2 text-[11px] text-gray-500 font-bold italic bg-white border border-gray-900 rounded-lg">
                                            No teachers in this organisation.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : filteredContacts.length > 0 ? (
                            filteredContacts.map(contact => (
                                <button
                                    key={contact.id}
                                    onClick={() => setActiveContactId(contact.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-900 transition-all group relative text-left cursor-pointer ${
                                        activeContactId === contact.id
                                            ? 'bg-gray-900 text-white shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                                            : 'bg-white hover:bg-[#eff3ff] shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] text-gray-900'
                                    }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        {contact.avatar ? (
                                            <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-xl border-2 border-gray-900 object-cover shadow-[1px_1px_0px_rgba(0,0,0,1)]" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-xl border-2 border-gray-900 flex items-center justify-center font-black text-sm shadow-[1px_1px_0px_rgba(0,0,0,1)] ${contact.role === 'mentor' ? 'bg-[#FFD166] text-gray-900' : 'bg-[#818CF8] text-white'}`}>
                                                {contact.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${contact.status === 'online' ? 'bg-[#06D6A0]' : 'bg-gray-400'}`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="font-black text-xs sm:text-sm truncate">{contact.name}</span>
                                            {unreadCounts[contact.id] > 0 && (
                                                <div className="w-2.5 h-2.5 bg-[#FF6B6B] border border-gray-900 rounded-full shadow-[1px_1px_0px_rgba(0,0,0,1)] animate-pulse flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className={`text-[11px] font-bold truncate mt-0.5 ${activeContactId === contact.id ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {unreadCounts[contact.id] > 0 ? `${unreadCounts[contact.id]} new messages` : (contact.lastMessage || 'Click to chat')}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500 text-xs font-bold border-2 border-dashed border-gray-900 rounded-xl bg-white">
                                No peer contacts found.<br />
                                Add {isMentorView ? 'mentors' : 'students'} to your network!
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area — Takes full width on mobile when contact is selected */}
                <div className={`flex-1 flex flex-col bg-[#FAF9F6] min-w-0 overflow-hidden ${!activeContactId ? 'hidden md:flex' : 'flex'}`}>
                    {activeContactId ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-5 sm:px-6 py-4 border-b-4 border-gray-900 bg-[#eff3ff] flex items-center justify-between min-w-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <button
                                        onClick={() => setActiveContactId('')}
                                        className="md:hidden p-2 bg-white text-gray-900 border-2 border-gray-900 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all flex-shrink-0"
                                        title="Back to contacts"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 border-gray-900 flex items-center justify-center font-black text-sm flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)] ${activeContact?.role === 'mentor' ? 'bg-[#FFD166] text-gray-900' : 'bg-[#818CF8] text-white'}`}>
                                        {activeContact?.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-base sm:text-lg text-gray-900 uppercase tracking-tight truncate">{activeContact?.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-gray-900 bg-white shadow-[1px_1px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase text-gray-900">
                                                <Circle className={`w-2 h-2 ${activeContact?.status === 'online' ? 'fill-[#06D6A0] text-[#06D6A0]' : 'fill-gray-400 text-gray-400'}`} />
                                                {activeContact?.status || 'offline'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => toast.info("Contact info")}
                                        className="p-2.5 bg-white text-gray-900 border-2 border-gray-900 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#FAF9F6] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                                        title="Contact info"
                                    >
                                        <Info className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF9F6] scroll-smooth focus:outline-none">
                                {messagesLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                                        <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
                                        <p className="text-xs text-gray-700 font-black uppercase tracking-widest">Loading Conversation...</p>
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
                                                <div className={`${isImageMsg ? 'w-full max-w-[90%] md:max-w-[680px]' : 'max-w-[85%] md:max-w-[540px]'} ${isMine ? 'order-2' : ''}`}>
                                                    <div className={`p-4 rounded-2xl border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs sm:text-sm font-semibold leading-relaxed space-y-2 ${
                                                        isMine
                                                            ? 'bg-gray-900 text-white rounded-tr-none'
                                                            : 'bg-white text-gray-900 rounded-tl-none'
                                                    }`}>
                                                        
                                                        {/* Text Content */}
                                                        {text && <p className="whitespace-pre-wrap font-bold leading-relaxed">{text}</p>}

                                                        {/* Attachment Content */}
                                                        {attachment && (
                                                            <div className="mt-2 min-w-0 max-w-full">
                                                                {isImageMsg ? (
                                                                    /* Image Attachment */
                                                                    <div className="rounded-xl overflow-hidden border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-black/40 group relative w-full">
                                                                        <div className="flex items-center justify-center bg-black/20 p-1 w-full">
                                                                            <img
                                                                                src={attachment.url}
                                                                                alt={attachment.name}
                                                                                className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                                                                            />
                                                                        </div>
                                                                        <div className="p-3 flex items-center justify-between bg-black/80 text-white text-xs border-t-2 border-gray-900">
                                                                            <span className="truncate font-black max-w-[240px]" title={attachment.name}>{attachment.name}</span>
                                                                            <a
                                                                                href={attachment.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="px-3 py-1.5 rounded-lg bg-[#818CF8] hover:bg-[#6366F1] text-white border border-gray-900 text-xs font-black shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5 flex-shrink-0"
                                                                                title="Open full size image"
                                                                            >
                                                                                <span>FULL VIEW</span>
                                                                                <ExternalLink className="w-3.5 h-3.5 text-white" />
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* Document Attachment */
                                                                    <div className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border-2 ${
                                                                        isMine
                                                                            ? 'bg-gray-800 border-gray-700 text-white'
                                                                            : 'bg-[#FAF9F6] border-gray-900 text-gray-900'
                                                                    } shadow-[2px_2px_0px_rgba(0,0,0,1)]`}>
                                                                        <div className="flex items-center gap-3 min-w-0 truncate">
                                                                            <div className={`p-2.5 rounded-lg border border-gray-900 ${isMine ? 'bg-gray-700 text-white' : 'bg-[#eff3ff] text-gray-900'}`}>
                                                                                <FileText className="w-5 h-5" />
                                                                            </div>
                                                                            <div className="truncate min-w-0">
                                                                                <p className="font-black text-xs truncate" title={attachment.name}>{attachment.name}</p>
                                                                                <p className={`text-[10px] font-bold mt-0.5 ${isMine ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                                    {formatFileSize(attachment.size)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <a
                                                                            href={attachment.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            download={attachment.name}
                                                                            className="px-3.5 py-1.5 bg-[#818CF8] hover:bg-[#6366F1] text-white border-2 border-gray-900 rounded-lg text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                                                                        >
                                                                            <Download className="w-3.5 h-3.5" />
                                                                            <span>OPEN</span>
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`text-[10px] font-bold text-gray-500 mt-1.5 flex items-center gap-1.5 uppercase ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMine && (
                                                            message.is_read ? (
                                                                <div className="flex items-center -space-x-1">
                                                                    <Circle className="w-1.5 h-1.5 fill-[#818CF8] text-[#818CF8]" />
                                                                    <Circle className="w-1.5 h-1.5 fill-[#818CF8] text-[#818CF8]" />
                                                                </div>
                                                            ) : (
                                                                <Circle className="w-1.5 h-1.5 text-gray-400" />
                                                            )
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
                                        <div className="w-14 h-14 bg-white border-2 border-gray-900 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                                            <Smile className="w-7 h-7 text-gray-900" />
                                        </div>
                                        <p className="text-xs font-black uppercase text-gray-700">No messages yet. Say hello!</p>
                                    </div>
                                )}
                            </div>

                            {/* Attachment Selected Preview Box */}
                            {selectedFile && (
                                <div className="px-4 sm:px-6 pb-2 min-w-0 max-w-full">
                                    <div className="p-3 bg-[#eff3ff] border-2 border-gray-900 rounded-xl flex items-center justify-between gap-3 min-w-0 max-w-full shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            {filePreviewUrl ? (
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={filePreviewUrl}
                                                        alt="Preview"
                                                        className="w-12 h-12 rounded-lg object-cover border-2 border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-[#818CF8] text-white border-2 border-gray-900 rounded-lg flex items-center justify-center font-black flex-shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-black text-gray-900 truncate" title={selectedFile.name}>
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-[10px] text-gray-600 font-bold mt-0.5">
                                                    {formatFileSize(selectedFile.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeAttachment}
                                            aria-label="Remove attachment"
                                            className="flex-shrink-0 p-2 bg-[#FF6B6B] text-white border-2 border-gray-900 rounded-lg shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                                            title="Remove attachment"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Chat Input Bar */}
                            <div className="p-4 sm:p-5 bg-white border-t-4 border-gray-900 min-w-0 max-w-full">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                />
                                <div className="bg-[#FAF9F6] rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] focus-within:bg-white focus-within:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all min-w-0 max-w-full">
                                    {/* Attachment Button */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        aria-label="Attach file"
                                        className={`flex-shrink-0 p-2 transition-all rounded-xl border border-gray-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ${
                                            selectedFile ? 'bg-[#818CF8] text-white' : 'bg-white text-gray-900 hover:bg-[#eff3ff]'
                                        }`}
                                        title="Attach educational file or image"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </button>

                                    {/* Text Input */}
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={selectedFile ? `Add a caption...` : `Message ${activeContact?.name || ''}...`}
                                        className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-xs sm:text-sm px-2 font-bold text-gray-900 placeholder:text-gray-500"
                                    />

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            onClick={() => toast.info("Emoji picker coming soon")}
                                            className="p-2 text-gray-500 hover:text-gray-900 transition-colors hidden sm:block cursor-pointer"
                                            title="Add Emoji"
                                        >
                                            <Smile className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toast.info("Mentions coming soon")}
                                            className="p-2 text-gray-500 hover:text-gray-900 transition-colors hidden sm:block cursor-pointer"
                                            title="Mention contact"
                                        >
                                            <AtSign className="w-4 h-4" />
                                        </button>

                                        {/* Send Button */}
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={uploading || (!messageInput.trim() && !selectedFile)}
                                            aria-label="Send message"
                                            className="flex-shrink-0 px-4 py-2.5 bg-[#818CF8] hover:bg-[#6366F1] text-white border-2 border-gray-900 rounded-xl font-black text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center min-w-[42px] h-[42px] disabled:opacity-50 cursor-pointer"
                                            title="Send message"
                                        >
                                            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF9F6] p-8 sm:p-12 text-center space-y-4">
                            <div className="w-20 h-20 bg-[#eff3ff] border-4 border-gray-900 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-2">
                                <MessageSquare className="w-10 h-10 text-gray-900" />
                            </div>
                            <h3 className="text-2xl font-black uppercase text-gray-900 tracking-tight">YOUR CONVERSATIONS</h3>
                            <p className="text-xs font-bold text-gray-600 max-w-sm leading-relaxed">
                                Select a contact from the sidebar to start real-time direct messaging or file sharing.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}

export default MessagesPage;
