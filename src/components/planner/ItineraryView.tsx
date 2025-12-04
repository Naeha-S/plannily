import { useState } from 'react';
import { DayTimeline } from './DayTimeline';
import type { ItineraryDay } from '../../types';
import { Button } from '../common/Button';
import { Share2, Download, Edit3, Send, Bot } from 'lucide-react';
import { chatWithAI } from '../../services/ai';

interface ItineraryViewProps {
    destination: string;
    days: ItineraryDay[];
    onEdit: () => void;
}

export const ItineraryView = ({ destination, days, onEdit }: ItineraryViewProps) => {
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; message: string }[]>([]);
    const [isChatting, setIsChatting] = useState(false);

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = chatInput;
        setChatInput('');
        setChatHistory((prev) => [...prev, { role: 'user', message: userMessage }]);
        setIsChatting(true);

        try {
            const response = await chatWithAI(userMessage, { destination, days });
            setChatHistory((prev) => [...prev, { role: 'ai', message: response }]);
        } catch (error) {
            setChatHistory((prev) => [...prev, { role: 'ai', message: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsChatting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Your Trip to {destination}</h1>
                    <p className="text-slate-600">Optimized for culture, food, and relaxation.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button onClick={onEdit} size="sm">
                        <Edit3 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {days.map((day) => (
                        <DayTimeline key={day.day} day={day} />
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold mb-4">Trip Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Duration</span>
                                    <span className="font-medium">{days.length} Days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Est. Cost</span>
                                    <span className="font-medium">$2,450</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Pace</span>
                                    <span className="font-medium text-green-600">Balanced</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px]">
                            <div className="p-4 border-b border-slate-100 bg-primary/5 flex items-center gap-2">
                                <Bot className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-slate-900">AI Travel Assistant</h3>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                {chatHistory.length === 0 && (
                                    <p className="text-sm text-slate-500 text-center mt-4">
                                        Ask me anything! I can help you swap days, find restaurants, or check the weather.
                                    </p>
                                )}
                                {chatHistory.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                                ? 'bg-primary text-white rounded-br-none'
                                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                                            }`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                ))}
                                {isChatting && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-100 rounded-2xl px-4 py-2 rounded-bl-none">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-100 bg-slate-50">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Ask for changes..."
                                        className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || isChatting}
                                        className="absolute right-2 top-1.5 p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
