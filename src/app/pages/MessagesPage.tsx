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

interface Contact {
    id: string;
    name: string;
    type: 'teacher' | 'friend';
    status: 'online' | 'offline' | 'away';
    avatar?: string;
    role?: string;
    lastMessage?: string;
}

export function MessagesPage() {
    const [activeContactId, setActiveContactId] = useState('c1');
    const [messageInput, setMessageInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const location = useLocation();
    const isMentorView = location.pathname.includes('mentor');

    // Student Contacts (Teachers & Friends)
    const studentContacts: Contact[] = [
        { id: 'c1', name: 'Dr. Aris Thorne', type: 'teacher', status: 'online', role: 'AI Mentor', lastMessage: 'Great work on the GANs project!' },
        { id: 'c2', name: 'Sarah Chen', type: 'friend', status: 'online', lastMessage: 'Coming for the study session?' },
        { id: 'c3', name: 'Prof. Marcus Vane', type: 'teacher', status: 'offline', role: 'Computer Science Head', lastMessage: 'The report is due tomorrow.' },
        { id: 'c4', name: 'Alex Rivera', type: 'friend', status: 'away', lastMessage: 'Did you see the new module?' },
        { id: 'c5', name: 'Department Announcements', type: 'teacher', status: 'online', role: 'System', lastMessage: 'New workshop scheduled for Friday.' }
    ];

    // Mentor Contacts (Students)
    const mentorContacts: Contact[] = [
        { id: 's1', name: 'Alex Chen', type: 'friend', status: 'online', role: 'Student', lastMessage: 'I have a question about the assignment.' },
        { id: 's2', name: 'Jordan Lee', type: 'friend', status: 'offline', role: 'Student', lastMessage: 'Thanks for the session!' },
        { id: 's3', name: 'Sarah Miller', type: 'friend', status: 'online', role: 'Student', lastMessage: 'Can we reschedule?' },
        { id: 's4', name: 'Mike Ross', type: 'friend', status: 'away', role: 'Student', lastMessage: 'Review submitted.' }
    ];

    const contacts = isMentorView ? mentorContacts : studentContacts;

    const [conversations, setConversations] = useState<Record<string, Message[]>>({
        'c1': [
            { id: 'm1', senderId: 'c1', senderName: 'Dr. Aris Thorne', text: 'Hello! I reviewed your implementation of the attention mechanism.', timestamp: '10:30 AM' },
            { id: 'm2', senderId: 'me', senderName: 'Me', text: 'Thanks, Doctor! I was a bit unsure about the scaling factor.', timestamp: '10:32 AM' },
            { id: 'm3', senderId: 'c1', senderName: 'Dr. Aris Thorne', text: 'It looks correct. Great work on the GANs project!', timestamp: '10:35 AM' }
        ],
        'c2': [
            { id: 'm4', senderId: 'c2', senderName: 'Sarah Chen', text: 'Hey, are you coming for the study session later?', timestamp: '09:15 AM' },
            { id: 'm5', senderId: 'me', senderName: 'Me', text: 'Yeah, definitely. Library at 5?', timestamp: '09:20 AM' },
            { id: 'm6', senderId: 'c2', senderName: 'Sarah Chen', text: 'Perfect, see you there!', timestamp: '09:21 AM' }
        ],
        'c3': [{ id: 'm7', senderId: 'c3', senderName: 'Prof. Marcus Vane', text: 'The report is due tomorrow. Please ensure all citations are included.', timestamp: 'Yesterday' }],
        'c4': [{ id: 'm8', senderId: 'c4', senderName: 'Alex Rivera', text: 'Did you see the new module on Quantum Computing? It looks intense!', timestamp: 'Monday' }],
        'c5': [{ id: 'm9', senderId: 'c5', senderName: 'Department Announcements', text: 'New workshop scheduled for Friday: "The Future of AI Ethics".', timestamp: '11:00 AM', isAdmin: true }]
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
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Teachers</div>
                        {contacts.filter(c => c.type === 'teacher').map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => setActiveContactId(contact.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${activeContactId === contact.id ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-white/50'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : contact.status === 'away' ? 'bg-amber-500' : 'bg-gray-300'
                                        }`}></div>
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-gray-900 truncate">{contact.name}</span>
                                        <span className="text-[10px] text-gray-400">2h</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 truncate">{contact.lastMessage}</p>
                                </div>
                            </button>
                        ))}

                        <div className="px-3 py-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Friends</div>
                        {contacts.filter(c => c.type === 'friend').map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => setActiveContactId(contact.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${activeContactId === contact.id ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-white/50'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold text-sm">
                                        {contact.name.charAt(0)}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-emerald-500' : contact.status === 'away' ? 'bg-amber-500' : 'bg-gray-300'
                                        }`}></div>
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-gray-900 truncate">{contact.name}</span>
                                        <span className="text-[10px] text-gray-400">5m</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 truncate">{contact.lastMessage}</p>
                                </div>
                            </button>
                        ))}
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
