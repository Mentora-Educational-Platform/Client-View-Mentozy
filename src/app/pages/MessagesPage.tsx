import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Search, Send, Paperclip,
    AtSign, Smile, Phone, Video,
    Info, Users, GraduationCap,
    Circle
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
    isAdmin?: boolean;
}

import { Contact, getContacts } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

// ... (interfaces)

export function MessagesPage() {
    const { user } = useAuth();
    const [activeContactId, setActiveContactId] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const location = useLocation();
    const isMentorView = location.pathname.includes('mentor');

    useEffect(() => {
        async function loadContacts() {
            if (!user) return;
            setLoading(true);
            // If viewing as mentor, load students. If viewing as student, load mentors.
            const role = isMentorView ? 'mentor' : 'student';
            const data = await getContacts(user.id, role);
            setContacts(data);

            // Auto-select first contact
            if (data.length > 0 && !activeContactId) {
                setActiveContactId(data[0].id);
            }
            setLoading(false);
        }
        loadContacts();
    }, [user, isMentorView]);

    const [conversations, setConversations] = useState<Record<string, Message[]>>({
        // Placeholder for now - in real app would fetch per contact
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeContactId, conversations]);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: 'me',
            senderName: 'Me',
            text: messageInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversations({
            ...conversations,
            [activeContactId]: [...(conversations[activeContactId] || []), newMessage]
        });
        setMessageInput('');
    };

    const activeChat = conversations[activeContactId] || [];
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
                                placeholder="Search messages..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 space-y-1">
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {isMentorView ? 'Students' : 'Mentors'}
                        </div>

                        {loading ? (
                            <div className="p-4 text-center text-gray-400 text-xs">Loading contacts...</div>
                        ) : contacts.length > 0 ? (
                            contacts.map(contact => (
                                <button
                                    key={contact.id}
                                    onClick={() => setActiveContactId(contact.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${activeContactId === contact.id ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-white/50'
                                        }`}
                                >
                                    <div className="relative">
                                        {contact.avatar ? (
                                            <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-xl object-cover" />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isMentorView ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {contact.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm text-gray-900 truncate">{contact.name}</span>
                                            {/* <span className="text-[10px] text-gray-400">Now</span> */}
                                        </div>
                                        <p className="text-[11px] text-gray-500 truncate">{contact.lastMessage}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-xs">
                                No contacts found.<br />
                                {isMentorView ? "Accept bookings to see students." : "Book a mentor to start chatting."}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Chat Header */}
                    <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center font-bold text-indigo-600">
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
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
                        {activeChat.map((message) => (
                            <div key={message.id} className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] ${message.senderId === 'me' ? 'order-2' : ''}`}>
                                    <div className={`p-4 rounded-[1.5rem] text-sm ${message.senderId === 'me'
                                        ? 'bg-gray-900 text-white rounded-tr-none'
                                        : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100/50'
                                        }`}>
                                        {message.text}
                                    </div>
                                    <span className={`text-[10px] font-bold text-gray-400 mt-1.5 block ${message.senderId === 'me' ? 'text-right' : ''}`}>
                                        {message.timestamp}
                                    </span>
                                </div>
                            </div>
                        ))}
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
                                    className="ml-1 p-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
