import { useState, useEffect } from 'react';
import {
    CreditCard,
    Sun,
    Battery,
    Coffee,
    Camera,
    Map as MapIcon,
    Moon,
    Activity,
    Thermometer,
    Wallet,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ItineraryView } from '../components/planner/ItineraryView';
import { motion } from 'framer-motion';
import type { ItineraryDay, Activity as ActivityType } from '../types';

// Mock Data for Dashboard Preview
const MOCK_DAYS: ItineraryDay[] = [
    {
        day: 1,
        theme: "Arrival & Exploration",
        activities: [
            {
                id: '1',
                name: 'Hotel Check-in',
                type: 'travel',
                startTime: '14:00',
                endTime: '15:00',
                location: 'Grand Hotel',
                description: 'Check in and freshen up.',
                imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000'
            },
            {
                id: '2',
                name: 'City Walk',
                type: 'sightseeing',
                startTime: '16:00',
                endTime: '18:00',
                location: 'City Center',
                description: 'Walk around the main square.',
                imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000'
            }
        ] as ActivityType[]
    },
    {
        day: 2,
        theme: "Cultural Deep Dive",
        activities: []
    }
];

const DashboardPage = () => {
    // State
    const [budget] = useState({ total: 2000, spent: 450 });
    const [selectedVibe, setSelectedVibe] = useState('chill');
    const [weather] = useState({ temp: 24, condition: 'Sunny' });
    const [status, setStatus] = useState<string[]>([]);

    // Mock API call for weather
    useEffect(() => {
        // In real app: fetch(`https://api.open-meteo.com/v1/forecast?latitude=...`)
    }, []);

    const toggleStatus = (s: string) => {
        setStatus(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]);
    };

    return (
        <div className="min-h-screen bg-stone-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-stone-900">Travel Command Center</h1>
                        <p className="text-stone-500">Your unified operating system for this trip.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-stone-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-stone-600">Travel OS Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: Status & Context (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* 1. Mini Weather Tab */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Tokyo, Next 24h</h3>
                                <div className="text-3xl font-bold text-stone-900 flex items-center gap-2">
                                    {weather.temp}° <span className="text-lg font-normal text-stone-400">C</span>
                                </div>
                                <p className="text-sm text-stone-600">{weather.condition}</p>
                            </div>
                            <Sun className="w-10 h-10 text-orange-400" />
                        </div>

                        {/* 2. Budget Tracker (Static) */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> Budget Control
                                </h3>
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-500">Edit</Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-stone-600">Spent Today</span>
                                        <span className="font-bold text-stone-900">${budget.spent}</span>
                                    </div>
                                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${(budget.spent / budget.total) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-stone-400 mt-1">
                                        <span>0</span>
                                        <span>Total: ${budget.total}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="bg-stone-50 hover:bg-stone-100 p-2 rounded-xl text-xs font-medium text-stone-600 transition-colors border border-stone-100">
                                        + Log Expense
                                    </button>
                                    <button className="bg-stone-50 hover:bg-stone-100 p-2 rounded-xl text-xs font-medium text-stone-600 transition-colors border border-stone-100">
                                        View History
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Check-in Panel */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100">
                            <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Status Check-in
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'tired', label: 'Tired', icon: Battery },
                                    { id: 'hungry', label: 'Hungry', icon: Coffee },
                                    { id: 'aesthetic', label: 'Aesthetic', icon: Camera },
                                    { id: 'budget', label: 'Save $', icon: CreditCard },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleStatus(item.id)}
                                        className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all ${status.includes(item.id)
                                                ? 'bg-stone-900 text-white shadow-md scale-105'
                                                : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-xs font-medium">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                            {status.length > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs">
                                    AI adjusting suggestions based on your status...
                                </div>
                            )}
                        </div>

                    </div>


                    {/* CENTER COLUMN: Itinerary Manager (6 cols) */}
                    <div className="lg:col-span-6">
                        <div className="bg-white rounded-3xl shadow-lg shadow-stone-200/50 border border-stone-200 overflow-hidden min-h-[800px]">
                            {/* Reuse existing component in default Planning mode, but configured for Dashboard */}
                            <ItineraryView
                                destination="Tokyo, Japan"
                                days={MOCK_DAYS}
                                onEdit={() => { }}
                                onRegenerateDay={() => console.log("Regen")}
                            />
                        </div>
                    </div>


                    {/* RIGHT COLUMN: Vibes & Notifications (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* 1. Daily Vibe Selector */}
                        <div className="bg-gradient-to-br from-[var(--color-primary)] to-purple-600 p-1 rounded-3xl shadow-lg shadow-purple-200">
                            <div className="bg-white rounded-[1.4rem] p-5">
                                <h3 className="text-stone-900 font-bold mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-500" /> Daily Vibe
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { id: 'chill', label: 'Chill & Relax', icon: Coffee },
                                        { id: 'explore', label: 'Heavy Explore', icon: MapIcon },
                                        { id: 'photo', label: 'Photo Focus', icon: Camera },
                                        { id: 'night', label: 'Nightlife', icon: Moon },
                                    ].map((vibe) => (
                                        <button
                                            key={vibe.id}
                                            onClick={() => setSelectedVibe(vibe.id)}
                                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${selectedVibe === vibe.id
                                                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                                    : 'hover:bg-stone-50 text-stone-600'
                                                }`}
                                        >
                                            <vibe.icon className={`w-4 h-4 ${selectedVibe === vibe.id ? 'fill-current' : ''}`} />
                                            <span className="text-sm font-medium">{vibe.label}</span>
                                            {selectedVibe === vibe.id && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. Smart Notifications */}
                        <div className="space-y-3">
                            <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider px-2">Smart Alerts</h3>

                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-3 relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                <div className="bg-blue-50 p-2 rounded-full h-fit flex-shrink-0 text-blue-600">
                                    <Thermometer className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-900 text-sm">Perfect Weather!</h4>
                                    <p className="text-xs text-stone-500 mt-1">It's 24°C perfectly sunny. Great time for that Photo Walk?</p>
                                    <button className="text-[10px] font-bold text-blue-600 mt-2 hover:underline">Adjust Plan</button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-3 relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                                <div className="bg-amber-50 p-2 rounded-full h-fit flex-shrink-0 text-amber-600">
                                    <Battery className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-900 text-sm">Packed schedule</h4>
                                    <p className="text-xs text-stone-500 mt-1">Tomorrow is walk-heavy. Want a coffee break added?</p>
                                    <button className="text-[10px] font-bold text-amber-600 mt-2 hover:underline">Add Break</button>
                                </div>
                            </motion.div>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
