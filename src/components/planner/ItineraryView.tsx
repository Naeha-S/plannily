import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Navigation,
    Utensils,
    ChevronRight,
    AlertCircle,
    Sparkles,
    Play,
    X,
    CheckCircle2,
    MapPin,
    DollarSign,
    MoreHorizontal
} from 'lucide-react';
import type { ItineraryDay } from '../../types';
import { Button } from '../common/Button';

interface ItineraryViewProps {
    destination: string;
    days: ItineraryDay[];
    onReplaceActivity?: (activityId: string, dayIndex: number) => void;
}

export const ItineraryView = ({ destination, days, onReplaceActivity }: ItineraryViewProps) => {
    const [selectedDay, setSelectedDay] = useState(0);
    const [viewMode, setViewMode] = useState<'planning' | 'trip'>('planning');
    const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

    // Trip Mode State
    const [currentStep, setCurrentStep] = useState(0);

    // Reset step when day changes
    useEffect(() => {
        setCurrentStep(0);
    }, [selectedDay]);

    const currentDay = days[selectedDay];
    const activities = currentDay?.activities || [];

    // ----------- TRIP MODE LOGIC -----------
    const nowActivity = activities[currentStep];

    const handleOpenMaps = (loc: string) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`, '_blank');
    };

    const handleSuggestFood = () => {
        window.open(`https://www.google.com/maps/search/food+near+${encodeURIComponent(nowActivity?.location || destination)}`, '_blank');
    };

    const handleSomethingElse = () => {
        if (onReplaceActivity && nowActivity) {
            onReplaceActivity(nowActivity.id, selectedDay);
        } else {
            window.open(`https://www.google.com/search?q=top+hidden+gems+in+${encodeURIComponent(destination)}`, '_blank');
        }
    };

    // ----------- RENDER: TRIP MODE (COPILOT) -----------
    if (viewMode === 'trip') {
        return (
            <div className="fixed inset-0 z-50 bg-[#F8F9FA] flex flex-col overflow-auto animate-in fade-in duration-300">
                {/* Top Navigation */}
                <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center transition-all">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <h2 className="text-sm font-bold font-serif uppercase tracking-widest text-stone-900">Live Copilot</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setViewMode('planning')} className="rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex-1 max-w-lg mx-auto w-full p-6 mt-4 pb-20">
                    <AnimatePresence mode="wait">
                        {nowActivity ? (
                            <motion.div
                                key={nowActivity.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* MAIN CARD */}
                                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-100 relative group">
                                    <div className="h-96 relative">
                                        <img src={nowActivity.imageUrl} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                                    Current Step
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-bold font-mono tracking-tighter">{nowActivity.startTime}</p>
                                                </div>
                                            </div>

                                            <h1 className="text-4xl font-serif font-bold leading-tight mb-2 text-balance">{nowActivity.name}</h1>
                                            <p className="opacity-80 flex items-center gap-2 text-sm font-medium">
                                                <MapPin size={14} className="text-emerald-400" /> {nowActivity.location}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Grid */}
                                    <div className="p-4 grid grid-cols-2 gap-3 bg-stone-50/50">
                                        <Button onClick={() => handleOpenMaps(nowActivity.location)} variant="outline" className="h-auto py-5 flex-col gap-2 rounded-2xl bg-white border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/50 group/btn transition-all">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full group-hover/btn:scale-110 transition-transform">
                                                <Navigation size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-stone-600">Navigate</span>
                                        </Button>

                                        <Button onClick={handleSuggestFood} variant="outline" className="h-auto py-5 flex-col gap-2 rounded-2xl bg-white border-stone-100 hover:border-orange-200 hover:bg-orange-50/50 group/btn transition-all">
                                            <div className="p-2 bg-orange-100 text-orange-600 rounded-full group-hover/btn:scale-110 transition-transform">
                                                <Utensils size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-stone-600">Food Nearby</span>
                                        </Button>

                                        <Button onClick={handleSomethingElse} variant="outline" className="h-auto py-5 flex-col gap-2 rounded-2xl bg-white border-stone-100 hover:border-purple-200 hover:bg-purple-50/50 group/btn transition-all">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-full group-hover/btn:scale-110 transition-transform">
                                                <Sparkles size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-stone-600">Swap Activity</span>
                                        </Button>

                                        <Button variant="outline" className="h-auto py-5 flex-col gap-2 rounded-2xl bg-white border-stone-100 hover:border-red-200 hover:bg-red-50/50 group/btn transition-all">
                                            <div className="p-2 bg-red-100 text-red-600 rounded-full group-hover/btn:scale-110 transition-transform">
                                                <AlertCircle size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-stone-600">Running Late</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* PRIMARY ACTION */}
                                <Button
                                    className="w-full py-6 rounded-[2rem] bg-stone-900 text-white shadow-xl shadow-stone-900/30 text-lg group/next hover:scale-[1.02] transition-all"
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                >
                                    Complete & Next <ChevronRight className="ml-2 w-5 h-5 group-hover/next:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="text-center py-32 text-stone-400">
                                <CheckCircle2 size={64} className="mx-auto mb-6 text-emerald-500 opacity-50" />
                                <h2 className="text-2xl font-bold text-stone-800 mb-2">Day Complete!</h2>
                                <p className="mb-8">You've finished all arranged activities.</p>
                                <Button onClick={() => setViewMode('planning')} variant="outline">Back to Planning</Button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        )
    }

    // ----------- RENDER: PLANNING (DASHBOARD) MODE -----------
    return (
        <div className="relative h-full flex flex-col">

            {/* Top Bar: Floating Tabs & Actions */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">

                {/* Day Tabs */}
                <div className="flex bg-white/40 backdrop-blur-md p-1 rounded-full border border-white/60 w-fit">
                    {days.slice(0, 5).map((day, index) => (
                        <button
                            key={day.day}
                            onClick={() => setSelectedDay(index)}
                            className={`
                                px-5 py-2 rounded-full text-xs font-bold transition-all duration-300
                                ${selectedDay === index
                                    ? 'bg-stone-900 text-white shadow-lg'
                                    : 'text-stone-500 hover:text-stone-900 hover:bg-white/50'}
                            `}
                        >
                            Day {day.day}
                        </button>
                    ))}
                    {days.length > 5 && <div className="px-4 flex items-center text-stone-400 text-xs">...</div>}
                </div>

                {/* Floating "Start Trip" Pill */}
                <Button
                    onClick={() => setViewMode('trip')}
                    className="
                        bg-stone-900 text-white hover:bg-black border-none shadow-xl shadow-stone-900/20 
                        rounded-full py-2 px-6 text-xs font-bold uppercase tracking-widest
                        flex items-center gap-2 group transition-all hover:scale-105 active:scale-95
                    "
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Mode
                    <Play className="w-3 h-3 fill-current ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            {/* Vertical Scrollable Timeline */}
            <div className="flex-grow relative pr-2">

                {/* Timeline Line */}
                <div className="absolute left-[39px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-stone-200 via-stone-200 to-transparent z-0" />

                <div className="space-y-6 pb-12">
                    <AnimatePresence mode="wait">
                        {days[selectedDay]?.activities.map((activity, index) => {
                            const isExpanded = expandedActivityId === activity.id;

                            return (
                                <motion.div
                                    key={activity.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative pl-20 group"
                                >
                                    {/* Timestamp on Left */}
                                    <div className="absolute left-0 top-3 w-16 text-right pr-6">
                                        <span className="block text-xs font-bold text-stone-900">{activity.startTime}</span>
                                        <span className="block text-[10px] text-stone-400 font-medium opacity-60">{activity.type}</span>
                                    </div>

                                    {/* Timeline Node */}
                                    <div className={`absolute left-[34px] top-4 w-3 h-3 rounded-full border-2 z-10 transition-all ${isExpanded ? 'bg-stone-900 border-stone-900 scale-125' : 'bg-stone-100 border-stone-300 group-hover:border-stone-500'}`} />

                                    {/* Card */}
                                    <motion.div
                                        className={`
                                        bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-1 border hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300
                                        ${isExpanded ? 'border-stone-900/10 ring-1 ring-stone-900/5 shadow-xl scale-[1.02]' : 'border-white/60'}
                                    `}
                                        onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)}
                                    >
                                        <div className="flex items-start gap-4 p-3 pr-6 cursor-pointer">
                                            <div className="w-20 h-20 rounded-2xl bg-stone-200 overflow-hidden flex-shrink-0 shadow-inner relative">
                                                <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-grow min-w-0 py-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-base font-bold text-stone-800 truncate">{activity.name}</h3>
                                                    {activity.cost && (
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                            ${activity.cost}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className={`text-xs text-stone-500 mb-2 transition-all ${isExpanded ? '' : 'line-clamp-1'}`}>{activity.description}</p>

                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                                                        <MapPin size={10} /> {activity.location}
                                                    </span>
                                                </div>

                                                {/* EXPANDED CONTENT ACTIONS */}
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-4 gap-2"
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-[10px] font-bold text-stone-500 flex flex-col items-center gap-1 h-auto py-2 hover:bg-stone-50 rounded-xl"
                                                            onClick={(e) => { e.stopPropagation(); handleOpenMaps(activity.location); }}
                                                        >
                                                            <Navigation size={14} className="text-blue-500" /> Map
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-[10px] font-bold text-stone-500 flex flex-col items-center gap-1 h-auto py-2 hover:bg-stone-50 rounded-xl"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <CheckCircle2 size={14} className="text-emerald-500" /> Done
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-[10px] font-bold text-stone-500 flex flex-col items-center gap-1 h-auto py-2 hover:bg-stone-50 rounded-xl"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <DollarSign size={14} className="text-orange-500" /> Edit Cost
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-[10px] font-bold text-stone-500 flex flex-col items-center gap-1 h-auto py-2 hover:bg-stone-50 rounded-xl"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreHorizontal size={14} /> More
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {!isExpanded && (
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 p-0">
                                                    <ChevronRight className="w-4 h-4 text-stone-400" />
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Add Event Placeholder */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        className="ml-20 w-[calc(100%-5rem)] py-4 rounded-[1.5rem] border-2 border-dashed border-stone-200 hover:border-stone-300 text-stone-400 hover:text-stone-600 text-xs font-bold uppercase tracking-widest flex items-center justify-center bg-white/30"
                    >
                        + Add Activity
                    </motion.button>
                </div>
            </div>

            {/* Quick Stats Footer */}
            <div className="mt-4 pt-4 border-t border-stone-200/50 flex justify-between text-xs text-stone-400 font-medium px-4">
                <span>{days[selectedDay]?.activities.length || 0} Activities</span>
                <span>{days[selectedDay]?.theme}</span>
            </div>
        </div>
    );
};
