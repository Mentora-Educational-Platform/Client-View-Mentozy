import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Search, Send, Paperclip,
    AtSign, Smile, Phone, Video,
    Info, Users,
    Circle, Loader2, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Contact, getContacts, Message, getMessages, sendMessage, markAllAsRead } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { getSupabase } from '../../lib/supabase';

export function MessagesPage() {
    const { user } = useAuth();
    const [activeContactId, setActiveContactId] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    const location = useLocation();
    const isMentorView = location.pathname.includes('mentor');

    // 1. Initial Contact Load & Unread Counts
    const loadContactsAndUnread = async () => {
        if (!user) return;
        setLoading(true);
        const role = isMentorView ? 'mentor' : 'student';
        const data = await getContacts(user.id, role);
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
    }, [user, isMentorView]);

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
                async (payload) => {
                    const newMessage = payload.new as Message;

                    if (newMessage.sender_id === activeContactId) {
                        // In active chat: add to list and mark as read immediately
                        setChatMessages(prev => [...prev, newMessage]);
                        await markAllAsRead(activeContactId, user.id);
                    } else {
                        // Not in active chat: increment unread count
                        setUnreadCounts(prev => ({
                            ...prev,
                            [newMessage.sender_id]: (prev[newMessage.sender_id] || 0) + 1
                        }));

                        const sender = contacts.find(c => c.id === newMessage.sender_id);
                        toast.info(`New message from ${sender?.name || 'someone'}`);
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

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !user || !activeContactId) return;

        const textToSend = messageInput;
        setMessageInput('');

        const sentMessage = await sendMessage(user.id, activeContactId, textToSend);
        if (sentMessage) {
            setChatMessages(prev => [...prev, sentMessage]);
        } else {
            toast.error("Failed to send message");
            setMessageInput(textToSend); // Restore input on failure
        }
    };

    const activeContact = contacts.find(c => c.id === activeContactId);

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-160px)] bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl">

                {/* Conversations Sidebar */}
                <div className="w-80 border-r border-gray-50 flex flex-col bg-gray-50/50">
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
                                placeholder="Search contacts..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 space-y-1">
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {isMentorView ? 'Mentor Peers' : 'Student Peers'}
                        </div>

                        {loading ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                            </div>
                        ) : contacts.length > 0 ? (
                            contacts.map(contact => (
                                <button
                                    key={contact.id}
                                    onClick={() => setActiveContactId(contact.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group relative ${activeContactId === contact.id ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-white/50'
                                        }`}
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
                                            {/* Unread Indicator */}
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

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {activeContactId ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${activeContact?.role === 'mentor' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {activeContact?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{activeContact?.name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <Circle className={`w-2 h-2 ${activeContact?.status === 'online' ? 'fill-emerald-500 text-emerald-500' : 'fill-gray-300 text-gray-300'}`} />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeContact?.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toast.success("Starting audio call...")} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all"><Phone className="w-5 h-5" /></button>
                                    <button onClick={() => toast.success("Starting video call...")} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all"><Video className="w-5 h-5" /></button>
                                    <button onClick={() => toast.info("Contact info")} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all"><Info className="w-5 h-5" /></button>
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
                                    chatMessages.map((message) => (
                                        <div key={message.id} id={`msg-${message.id}`} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] ${message.sender_id === user?.id ? 'order-2' : ''}`}>
                                                <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed ${message.sender_id === user?.id
                                                    ? 'bg-gray-900 text-white rounded-tr-none shadow-lg shadow-gray-200'
                                                    : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100/50'
                                                    }`}>
                                                    {message.content}
                                                </div>
                                                <span className={`text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1 ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {message.sender_id === user?.id && (
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
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-50 grayscale">
                                        <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
                                            <Smile className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400">No messages yet. Say hello!</p>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-8 pt-0">
                                <div className="bg-gray-50 rounded-[2rem] p-3 flex items-center gap-2 border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all">
                                    <button onClick={() => toast.info("Attachments coming soon")} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Paperclip className="w-5 h-5" /></button>
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={`Message ${activeContact?.name}...`}
                                        className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 font-medium"
                                    />
                                    <div className="flex items-center gap-1 pr-1">
                                        <button onClick={() => toast.info("Emoji picker coming soon")} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Smile className="w-5 h-5" /></button>
                                        <button onClick={() => toast.info("Mentions coming soon")} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><AtSign className="w-5 h-5" /></button>
                                        <button
                                            onClick={handleSendMessage}
                                            className="ml-1 p-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                        >
                                            <Send className="w-4 h-4" />
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
