import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Sun,
    Battery,
    Coffee,
    Camera,
    Map as MapIcon,
    Moon,
    Activity,
    Wallet,
    Sparkles,
    Zap,
    Wind,
    Droplets,
    ArrowRight,
    Check,
    CreditCard,
    Scale,
    Globe,
    ShieldAlert,
    Coins,
    Info,
    Shirt,
    Utensils,
    Volume2
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ItineraryView } from '../components/planner/ItineraryView';
import { motion, AnimatePresence } from 'framer-motion';
import type { ItineraryDay, Activity as ActivityType } from '../types';
import { getCoordinates, getPlacesNearby } from '../services/opentripmap';
import { getWeather, getWeatherCondition } from '../services/openmeteo';

// Fallback Mock Data
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
                imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000',
                cost: 0
            },
            {
                id: '2',
                name: 'City Walk',
                type: 'sightseeing',
                startTime: '16:00',
                endTime: '18:00',
                location: 'City Center',
                description: 'Walk around the main square.',
                imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1000',
                cost: 0
            }
        ] as ActivityType[]
    }
];

const DashboardPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State
    const [selectedVibe, setSelectedVibe] = useState('chill');
    const [weather, setWeather] = useState({ temp: 24, condition: 'Sunny', windspeed: 12 });
    const [status, setStatus] = useState<string[]>([]);

    // Trip Data State
    const [tripData, setTripData] = useState<{
        destination: string;
        days: ItineraryDay[];
    } | null>(null);

    const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lon: number } | null>(null);

    // Dynamic Alerts
    const [alerts, setAlerts] = useState<any[]>([
        { id: 'golden', title: "Golden Hour", desc: "Perfect light at 4:30 PM", icon: Sun, color: "text-orange-500", border: 'border-l-orange-400' },
        { id: 'activity', title: "High Activity", desc: "15k steps projected tomorrow", icon: Activity, color: "text-blue-500", border: 'border-l-blue-400' }
    ]);

    // Data for new features (Mock for Tokyo context)
    const fairPrices = [
        { item: "Coffee (Latte)", price: "¥450 - ¥600", icon: Coffee },
        { item: "Taxi Start", price: "¥500", icon: Activity }, // Activity as generic car/motion
        { item: "Ramen Meal", price: "¥800 - ¥1200", icon: Utensils },
        { item: "Water (Bottle)", price: "¥110 - ¥150", icon: Droplets },
    ];

    const cultureTips = [
        { id: 'tip', title: "No Tipping", desc: "Service is included. Tipping is considered rude/confusing.", icon: Coins, color: 'text-red-500' },
        { id: 'quiet', title: "Quiet Trains", desc: "Silence phones. Talking loudly is frowned upon.", icon: Volume2, color: 'text-blue-500' }, // Need Volume icon or similar
        { id: 'shoes', title: "Shoes Off", desc: "Remove shoes at homes, ryokans, and some izakayas.", icon: Shirt, color: 'text-amber-500' },
    ];

    // Initialize Trip Data
    useEffect(() => {
        if (location.state && location.state.days) {
            setTripData({
                destination: location.state.destination || 'Your Trip',
                days: location.state.days
            });
            fetchCoords(location.state.destination);

            // Inject Smart Optimizations if available
            if (location.state.optimizationTips) {
                const smartAlerts = location.state.optimizationTips.map((tip: any, i: number) => ({
                    id: `ai-opt-${i}`,
                    title: tip.title,
                    desc: `${tip.description} (${tip.impact})`,
                    icon: tip.type === 'timing' ? Activity : (tip.type === 'saving' ? Wallet : Sparkles),
                    color: tip.type === 'timing' ? "text-amber-500" : (tip.type === 'saving' ? "text-emerald-500" : "text-blue-500"),
                    border: tip.type === 'timing' ? 'border-l-amber-500' : (tip.type === 'saving' ? 'border-l-emerald-500' : 'border-l-blue-500'),
                    action: "Apply"
                }));
                // Prepend to existing mock alerts
                setAlerts(prev => [...smartAlerts, ...prev]);
            }

        } else {
            setTripData({
                destination: 'Tokyo, Japan (Preview)',
                days: MOCK_DAYS
            });
            fetchCoords('Tokyo, Japan');
        }
    }, [location.state]);

    const fetchCoords = async (dest: string) => {
        const coords = await getCoordinates(dest);
        if (coords) {
            setDestinationCoords(coords);
            const weatherData = await getWeather(coords.lat, coords.lon);
            if (weatherData) {
                setWeather({
                    temp: Math.round(weatherData.current_weather.temperature),
                    condition: getWeatherCondition(weatherData.current_weather.weathercode),
                    windspeed: weatherData.current_weather.windspeed
                });
            }
        }
    };

    // Calculate Budget dynamically
    const totalBudget = 2000; // This could be a prop or state
    const spentBudget = tripData?.days.flatMap(d => d.activities).reduce((acc, act) => acc + (act.cost || 0), 0) || 0;

    const addSmartAlert = (alert: any) => {
        setAlerts(prev => [alert, ...prev]);
    };

    const toggleStatus = async (s: string) => {
        const isActive = status.includes(s);
        setStatus(prev => isActive ? prev.filter(i => i !== s) : [...prev, s]);

        if (!isActive) {
            // Trigger Smart Suggestions with OpenTripMap
            if (s === 'hungry' && destinationCoords) {
                const places = await getPlacesNearby(destinationCoords.lat, destinationCoords.lon, 2000, 1, 'foods');
                const place = places[0];
                addSmartAlert({
                    id: 'hungry-alert',
                    title: place ? `Eat at ${place.name}` : "Food Nearby",
                    desc: place ? `Top rated food spot nearby.` : "It's time to eat. Tap to find top-rated spots nearby.",
                    icon: Coffee,
                    color: "text-orange-500",
                    border: 'border-l-orange-500',
                    action: "Find Food"
                });
            } else if (s === 'tired') {
                addSmartAlert({
                    id: 'tired-alert',
                    title: "Need a Break?",
                    desc: "High intensity detected. Suggesting a coffee stop next.",
                    icon: Battery,
                    color: "text-amber-500",
                    border: 'border-l-amber-500',
                    action: "Adjust Plan"
                });
            } else if (s === 'aesthetic' && destinationCoords) {
                const places = await getPlacesNearby(destinationCoords.lat, destinationCoords.lon, 5000, 1, 'architecture,view_points');
                const place = places[0];
                if (place) {
                    addSmartAlert({
                        id: 'vibey-alert',
                        title: place.name,
                        desc: "Perfect spot for photos detected nearby.",
                        icon: Camera,
                        color: "text-purple-500",
                        border: 'border-l-purple-500',
                        action: "View Map"
                    });
                }
            }
        } else {
            // Remove alert if status toggled off
            setAlerts(prev => prev.filter(a => !a.id.includes(s)));
        }
    };

    // Custom Colors from prompts
    const COLOR_EMBER = '#fb923c'; // Ember Gold (Orange-400)

    if (!tripData) return null;

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-stone-800 font-sans selection:bg-stone-200">
            {/* Subtle Grain Texture Overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Cinematic Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-stone-100 via-[#F8F9FA] to-stone-200/50 pointer-events-none z-[-1]" />
            <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-sky-100/40 rounded-full blur-[120px] pointer-events-none z-[-1]" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-50/40 rounded-full blur-[120px] pointer-events-none z-[-1]" />

            <div className="max-w-[1600px] mx-auto px-6 py-8 relative z-10 transition-all duration-500">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-stone-200/50 pb-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mb-2"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Travel OS 2.4</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-none">
                            {tripData.destination}
                        </h1>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-stone-400 hover:text-stone-900 transition-colors uppercase text-xs font-bold tracking-widest"
                        onClick={() => navigate('/saved')}
                    >
                        Switch Trip <ArrowRight size={14} className="ml-2" />
                    </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Widgets (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Weather Widget */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Local Weather</span>
                                    <Sun className="w-5 h-5 text-orange-400 animate-[spin_10s_linear_infinite]" />
                                </div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-5xl font-bold text-stone-800 tracking-tighter">{weather.temp}°</span>
                                    <span className="text-sm font-medium text-stone-400 uppercase">Celsius</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-600 font-medium text-sm mb-6">
                                    {weather.condition}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-stone-500 border-t border-stone-200/50 pt-4">
                                    <div className="flex items-center gap-2">
                                        <Wind size={12} /> <span>{weather.windspeed} km/h</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Droplets size={12} /> <span>--%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Budget Widget */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Budget</span>
                                <Wallet size={14} className="text-stone-400" />
                            </div>
                            <div className="flex flex-col items-center justify-center py-2">
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="64" cy="64" r="58" stroke="#e5e5e5" strokeWidth="6" fill="transparent" />
                                        <circle
                                            cx="64" cy="64" r="58"
                                            stroke={COLOR_EMBER}
                                            strokeWidth="6"
                                            fill="transparent"
                                            strokeDasharray={364}
                                            strokeDashoffset={364 - (364 * Math.min(spentBudget / totalBudget, 1))}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-stone-800">${spentBudget}</span>
                                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">of ${totalBudget}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button className="flex-1 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-600 transition-colors flex items-center justify-center gap-2">
                                    <Zap size={12} /> Add
                                </button>
                                <button className="flex-1 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-600 transition-colors">
                                    Report
                                </button>
                            </div>
                        </motion.div>

                        {/* Status Check Widget */}
                        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 block">Status Check</span>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'tired', label: 'Tired', icon: Battery },
                                    { id: 'hungry', label: 'Hungry', icon: Coffee },
                                    { id: 'aesthetic', label: 'Vibey', icon: Camera },
                                    { id: 'budget', label: 'Thrifty', icon: CreditCard },
                                ].map((item) => {
                                    const active = status.includes(item.id);
                                    return (
                                        <motion.button
                                            key={item.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleStatus(item.id)}
                                            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border ${active ? 'bg-stone-800 text-white border-stone-800 shadow-lg' : 'bg-white border-stone-100 text-stone-500 hover:border-stone-200'}`}
                                        >
                                            <item.icon size={16} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Fair Price Index Widget */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <Scale size={12} /> Fair Price Index
                                </span>
                                <Info size={12} className="text-stone-300" />
                            </div>
                            <div className="space-y-3">
                                {fairPrices.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-stone-100 last:border-0 pb-2 last:pb-0">
                                        <div className="flex items-center gap-3 text-stone-600 font-medium">
                                            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                                <item.icon size={12} />
                                            </div>
                                            {item.item}
                                        </div>
                                        <div className="text-stone-800 font-bold font-mono">
                                            {item.price}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </div>


                    {/* CENTER COLUMN: Itinerary Timeline (6 cols) */}
                    <div className="lg:col-span-6">
                        <div className="h-full">
                            <ItineraryView
                                destination={tripData.destination}
                                days={tripData.days}
                            />
                        </div>
                    </div>


                    {/* RIGHT COLUMN: Modes & Alerts (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Daily Mode Selector */}
                        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                            <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Sparkles size={12} className="text-purple-400" /> Daily Mode
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { id: 'chill', label: 'Chill & Relax', desc: 'Low tempo, high comfort', icon: Coffee },
                                    { id: 'explore', label: 'Heavy Explore', desc: 'Maximum sights, high steps', icon: MapIcon },
                                    { id: 'photo', label: 'Photo Focus', desc: 'Golden hour & aesthetics', icon: Camera },
                                    { id: 'night', label: 'Nightlife', desc: 'Evening venues & dining', icon: Moon },
                                ].map((mode) => {
                                    const isActive = selectedVibe === mode.id;
                                    return (
                                        <motion.button
                                            key={mode.id}
                                            onClick={() => setSelectedVibe(mode.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left transition-all duration-300 border ${isActive ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' : 'bg-transparent border-transparent hover:bg-stone-50'}`}
                                        >
                                            <div className={`p-3 rounded-xl ${isActive ? 'bg-[#94b8a3] text-white shadow-lg shadow-emerald-200' : 'bg-stone-100 text-stone-400'}`}>
                                                <mode.icon size={18} />
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${isActive ? 'text-stone-800' : 'text-stone-500'}`}>{mode.label}</h4>
                                                <p className="text-[10px] text-stone-400 font-medium">{mode.desc}</p>
                                            </div>
                                            {isActive && <Check size={16} className="ml-auto text-emerald-500" />}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Culture Lens Widget */}
                        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                            <h3 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Globe size={12} /> Culture Lens
                            </h3>
                            <div className="space-y-3">
                                {cultureTips.map((tip) => (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        key={tip.id}
                                        className="bg-white/50 p-3 rounded-2xl border border-stone-100 hover:border-indigo-100 transition-colors cursor-help"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <tip.icon size={14} className={tip.color} />
                                            <span className="text-xs font-bold text-stone-800">{tip.title}</span>
                                        </div>
                                        <p className="text-[10px] text-stone-500 leading-tight pl-6">
                                            {tip.desc}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full mt-2 text-[10px] text-stone-400 hover:text-indigo-500">
                                <ShieldAlert size={12} className="mr-2" /> View Scam Alerts
                            </Button>
                        </div>

                        {/* Smart Alerts */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Smart Alerts</span>
                                <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md border border-sky-100">{alerts.length} Active</span>
                            </div>

                            <AnimatePresence>
                                {alerts.map((alert, i) => (
                                    <motion.div
                                        key={alert.id || i}
                                        initial={{ x: 20, opacity: 0, height: 0 }}
                                        animate={{ x: 0, opacity: 1, height: 'auto' }}
                                        exit={{ x: 20, opacity: 0, height: 0 }}
                                        className={`bg-white/80 backdrop-blur-md p-4 rounded-xl border border-stone-100 shadow-sm border-l-4 ${alert.border} flex items-start gap-4 mb-2`}
                                    >
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-stone-800 mb-1 flex items-center gap-2">
                                                {alert.title} <alert.icon size={12} className={alert.color} />
                                            </h4>
                                            <p className="text-[10px] text-stone-500 leading-relaxed font-medium">
                                                {alert.desc}
                                            </p>
                                        </div>
                                        <button className="text-[10px] font-bold text-stone-400 hover:text-stone-800 transition-colors uppercase tracking-wider mt-1 whitespace-nowrap">
                                            {alert.action || "View"}
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
