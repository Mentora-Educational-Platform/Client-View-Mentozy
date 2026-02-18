import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Loader2 } from 'lucide-react';
import { generateSanjayaResponse } from '../../lib/ai';

const PeacockFeatherIcon = () => (
    <svg viewBox="0 0 100 100" className="w-10 h-10 transform group-hover:rotate-12 transition-transform duration-500">
        <defs>
            <linearGradient id="featherGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0D9488" />
                <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <radialGradient id="eyeOuter" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#EAB308" />
            </radialGradient>
            <radialGradient id="eyeCenter" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#1E1B4B" />
            </radialGradient>
        </defs>

        {/* Stylized Plume Shape */}
        <path
            d="M50 90 C70 70 80 40 50 10 C20 40 30 70 50 90"
            fill="url(#featherGradient)"
            className="opacity-90"
        />

        {/* The 'Eye' */}
        <g transform="translate(50, 35)">
            <circle r="18" fill="url(#eyeOuter)" />
            <circle r="12" fill="#14B8A6" />
            <circle r="8" fill="url(#eyeCenter)" />
            {/* Small highlight */}
            <circle cx="-3" cy="-3" r="2" fill="white" opacity="0.4" />
        </g>

        {/* Stem line */}
        <path
            d="M50 90 L50 98"
            stroke="#71717a"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AssistantBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Namaste! I am **Sanjaya**, your Mentozy assistant. How can I guide you on your learning journey today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        const newUserMessage: Message = { role: 'user', content: userMsg };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            const response = await generateSanjayaResponse(userMsg, [...messages, newUserMessage]);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Chat Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-20 right-0 w-[350px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Sanjaya</h3>
                                        <p className="text-xs text-white/80">Active Assistant</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Content */}
                        <div className="h-[400px] p-6 bg-gray-50 overflow-y-auto space-y-4">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm border ${msg.role === 'user'
                                            ? 'bg-emerald-600 text-white rounded-br-none border-emerald-500'
                                            : 'bg-white text-gray-700 rounded-bl-none border-gray-100'
                                            }`}
                                    >
                                        {msg.content.split('\n').map((line, index) => (
                                            <p key={index} className={index > 0 ? 'mt-2' : ''}>
                                                {line.split('**').map((part, pIndex) =>
                                                    pIndex % 2 === 1 ? <strong key={pIndex}>{part}</strong> : part
                                                )}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                        <div className="flex gap-1">
                                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form
                            className="p-4 bg-white border-t border-gray-100"
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 rounded-xl text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:shadow-none transition-colors shadow-lg hover:shadow-emerald-600/20"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-blue-400/30 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center border border-gray-50 overflow-hidden">
                    <PeacockFeatherIcon />
                </div>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                    >
                        1
                    </motion.div>
                )}
            </motion.button>
        </div>
    );
}
