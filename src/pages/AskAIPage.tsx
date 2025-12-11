import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Bot, User, Loader2, Plane, MapPin, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { runAgent } from '../services/agent/core';
import { supabase } from '../services/supabase';
import { VoiceAssistant } from '../components/voice/VoiceAssistant';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    action?: {
        label: string;
        type: 'GENERATE_ITINERARY' | 'FIND_FLIGHTS' | 'EXPLORE' | 'ADD_TO_SAVED' | 'UPDATE_ITINERARY' | 'OTHER';
        data: any;
        status?: 'pending' | 'success' | 'failed';
    };
}

const QUICK_ACTIONS = [
    { label: "Plan a trip to Paris", icon: MapPin },
    { label: "Find cheap flights", icon: Plane },
    { label: "Add 'Buy SIM Card' to my trip", icon: Sparkles }, // New command example
];

const AskAIPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: "Hi! I'm your Plannily AI assistant 🌏. Ready to explore your next adventure? I can help you discover destinations, plan itineraries, and find the best spots to visit. Where should we start today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [userContext, setUserContext] = useState<{ userName?: string; savedTrips?: any[] }>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Context
    useEffect(() => {
        const fetchContext = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            // Mock saved trips for now or fetch real ones if table exists
            const savedTrips = [
                { id: '1', city: 'Paris', dates: 'Oct 12-18' },
                { id: '2', city: 'Tokyo', dates: 'Nov 5-12' }
            ];
            setUserContext({
                userName: user?.user_metadata?.full_name || 'Traveler',
                savedTrips
            });
        };
        fetchContext();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
        e?.preventDefault();
        const textToSend = overrideInput || input;
        if (!textToSend.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Call Agent Brain (Layer 2)
            const agentResponse = await runAgent(
                textToSend,
                { ...userContext, recentMessages: messages.slice(-3) }
            );

            let action = undefined;
            if (agentResponse.toolCall) {
                const { name, arguments: args } = agentResponse.toolCall;

                // Map Core Tools to UI Actions
                let type: any = 'OTHER';
                if (name === 'updateItinerary') type = 'UPDATE_ITINERARY';
                else if (name === 'getFlights') type = 'FIND_FLIGHTS';
                else if (name === 'getNearbyPlaces') type = 'EXPLORE';
                else if (name === 'addToSaved') type = 'ADD_TO_SAVED';

                action = {
                    label: `Agent: ${name}`,
                    type,
                    data: args,
                    status: 'pending' as const
                };
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: agentResponse.message || "I've processed that request.",
                timestamp: new Date(),
                action
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error('Agent Error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: "I'm having trouble connecting to the Agent Brain right now.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleActionClick = async (action: Exclude<Message['action'], undefined>, msgId: string) => {
        // Toggle status to processing? (Local state handling required if we want to show spinner on button)

        if (action.type === 'GENERATE_ITINERARY') {
            navigate('/plan', {
                state: {
                    destination: action.data.destination,
                    preferences: {
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + (action.data.days || 5) * 86400000).toISOString().split('T')[0],
                        budget: 'medium',
                        companions: '2',
                        vibes: [],
                        interests: [],
                        travelStyle: 'balanced',
                        duration: action.data.days || 5
                    }
                }
            });
        } else if (action.type === 'FIND_FLIGHTS') {
            navigate('/flights', { state: { from: action.data.origin, to: action.data.destination } });
        } else if (action.type === 'EXPLORE') {
            navigate('/local-guide');
        } else if (action.type === 'ADD_TO_SAVED') {
            // Agentic Action: Write directly to DB
            try {
                // Determine user ID
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    alert("Please login to save items.");
                    return;
                }

                // Simulate "Adding to Trip"
                // In a real app, we'd insert into a 'trip_items' table.
                // For now, let's just simulate success and maybe update a context.

                // Update message to show success
                setMessages(prev => prev.map(m =>
                    m.id === msgId
                        ? { ...m, action: { ...m.action!, status: 'success', label: 'Added to Trip!' } }
                        : m
                ));

                // Optional: Toast notification
                // toast.success("Agent added item to your trip.");

            } catch (err) {
                console.error("Agent failed to save", err);
                setMessages(prev => prev.map(m =>
                    m.id === msgId
                        ? { ...m, action: { ...m.action!, status: 'failed', label: 'Failed to add' } }
                        : m
                ));
            }
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-stone-50 flex flex-col items-center py-8 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden flex flex-col h-[85vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-stone-100 bg-white/50 backdrop-blur-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-stone-900">Ask AI Planner</h1>
                        <p className="text-sm text-stone-500 font-medium">Your personal travel genius</p>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/50 scroll-smooth">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-white border border-stone-200 text-indigo-600' : 'bg-stone-900 text-white'}`}>
                                {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'ai' ? 'bg-white border border-stone-100 text-stone-700' : 'bg-stone-900 text-white'}`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                {msg.action && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => handleActionClick(msg.action!, msg.id)}
                                        disabled={msg.action.status === 'success'}
                                        className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all ${msg.action.status === 'success'
                                            ? 'bg-emerald-100 text-emerald-700 shadow-none cursor-default'
                                            : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                                            }`}
                                    >
                                        {msg.action.status === 'success' ? <Check size={16} /> : <Sparkles size={16} />}
                                        {msg.action.label}
                                        {msg.action.status !== 'success' && <ArrowRight size={16} className="ml-1" />}
                                    </motion.button>
                                )}

                                <span className={`text-[10px] font-bold mt-2 block opacity-50 ${msg.role === 'ai' ? 'text-stone-400' : 'text-stone-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-indigo-600">
                                <Bot size={20} />
                            </div>
                            <div className="bg-white border border-stone-100 rounded-2xl p-4 flex gap-1 items-center shadow-sm">
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-stone-100">
                    {/* Quick Actions */}
                    {messages.length < 3 && !isTyping && (
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 hide-scrollbar">
                            {QUICK_ACTIONS.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(undefined, action.label)}
                                    className="flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-sm font-bold text-stone-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors whitespace-nowrap"
                                >
                                    <action.icon size={14} />
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={(e) => handleSend(e)} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Ask about destinations, itineraries, or travel tips..."
                            className="w-full h-14 pl-6 pr-14 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-stone-700 placeholder:text-stone-400"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-stone-800 disabled:opacity-50 disabled:hover:bg-stone-900 transition-all active:scale-95"
                        >
                            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            </motion.div>
            <VoiceAssistant onAction={(action) => handleActionClick(action, 'voice')} />
        </div>
    );
};

export default AskAIPage;
