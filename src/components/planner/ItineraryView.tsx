import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    MapPin,
    Navigation,
    Utensils,
    RefreshCw,
    MessageCircle,
    Compass,
    Calendar,
    ChevronRight,
    AlertCircle,
    Sparkles,
    Play,
    Plane,
    X,
    Calendar as CalendarIcon
} from 'lucide-react';
import type { ItineraryDay, TripEvent } from '../../types';
import { Button } from '../common/Button';

interface ItineraryViewProps {
    destination: string;
    days: ItineraryDay[];
    events?: TripEvent[];
    onEdit: () => void;
    onRegenerateDay?: (dayIndex: number) => void;
    onLoadMoreEvents?: () => void;
    onAddEvent?: (event: TripEvent, dayIndex: number) => void;
}

export const ItineraryView = ({ destination, days, events, onEdit, onRegenerateDay, onLoadMoreEvents, onAddEvent }: ItineraryViewProps) => {
    const [selectedDay, setSelectedDay] = useState(0);
    const [viewMode, setViewMode] = useState<'planning' | 'trip'>('planning');

    // Trip Mode State
    const [currentStep, setCurrentStep] = useState(0);

    // Reset step when day changes
    useEffect(() => {
        setCurrentStep(0);
    }, [selectedDay]);

    const currentDay = days[selectedDay];
    const activities = currentDay?.activities || [];

    // ----------- TRIP MODE (Card UI) LOGIC -----------
    const nowActivity = activities[currentStep];
    const nextActivity = activities[currentStep + 1];
    const laterActivities = activities.slice(currentStep + 2);

    const handleOpenMaps = () => {
        if (nowActivity) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nowActivity.location)}`, '_blank');
        }
    };

    const handleReplace = () => {
        if (onRegenerateDay) {
            if (confirm("Regenerate the entire day to find new options?")) {
                onRegenerateDay(selectedDay);
            }
        }
    };

    const handleRunningLate = () => {
        alert("Updating schedule for delays...");
    };

    const handleSuggestFood = () => {
        window.open(`https://www.google.com/maps/search/food+near+${encodeURIComponent(nowActivity?.location || destination)}`, '_blank');
    };

    const handleSomethingElse = () => {
        alert("Opening discovery options...");
    };

    // ----------- RENDER: TRIP MODE -----------
    if (viewMode === 'trip') {
        return (
            <div className="relative min-h-screen pb-24 bg-stone-50/50">
                {/* Header with Back Button */}
                <div className="px-4 pt-4 flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={() => setViewMode('planning')} className="text-stone-400 hover:text-stone-900">
                        <X className="w-5 h-5 mr-1" /> Exit Trip Mode
                    </Button>
                </div>

                {/* Top Day Selector (Pills) */}
                <div className="overflow-x-auto pb-4 mb-4 no-scrollbar">
                    <div className="flex gap-3 px-4">
                        {days.map((day, index) => (
                            <button
                                key={day.day}
                                onClick={() => setSelectedDay(index)}
                                className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium transition-all ${selectedDay === index
                                    ? 'bg-stone-900 text-white shadow-md transform scale-105'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-900'
                                    }`}
                            >
                                Day {day.day}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="px-4 max-w-md mx-auto space-y-8">

                    {/* Header Info */}
                    <div className="text-center space-y-1">
                        <h2 className="text-sm font-medium text-stone-500 uppercase tracking-widest">{destination}</h2>
                        <h1 className="text-2xl font-serif font-bold text-stone-900">
                            {currentDay?.theme || `Day ${currentDay?.day}`}
                        </h1>
                    </div>

                    <AnimatePresence mode="wait">
                        {nowActivity ? (
                            <motion.div
                                key={nowActivity.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100"
                            >
                                {/* NOW Card Image */}
                                <div className="h-64 relative bg-stone-200">
                                    <img
                                        src={nowActivity.imageUrl || "/placeholder-activity.jpg"}
                                        alt={nowActivity.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Now
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20 text-white">
                                        <h2 className="text-3xl font-bold leading-none mb-2">{nowActivity.name}</h2>
                                        <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                                            <span className="flex items-center gap-1"><Clock size={16} /> {nowActivity.startTime}</span>
                                            <span className="flex items-center gap-1"><MapPin size={16} /> {nowActivity.location}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Grid */}
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="justify-start h-auto py-3 px-4 text-stone-700 bg-stone-50 border-stone-100 hover:bg-stone-100"
                                        onClick={handleOpenMaps}
                                    >
                                        <Navigation className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="text-left font-semibold">Open in Maps</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="justify-start h-auto py-3 px-4 text-stone-700 bg-stone-50 border-stone-100 hover:bg-stone-100"
                                        onClick={handleReplace}
                                    >
                                        <RefreshCw className="w-5 h-5 mr-3 text-orange-500" />
                                        <span className="text-left font-semibold">Replace this</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="justify-start h-auto py-3 px-4 text-stone-700 bg-stone-50 border-stone-100 hover:bg-stone-100"
                                        onClick={handleSuggestFood}
                                    >
                                        <Utensils className="w-5 h-5 mr-3 text-green-500" />
                                        <span className="text-left font-semibold">Food nearby</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="justify-start h-auto py-3 px-4 text-stone-700 bg-stone-50 border-stone-100 hover:bg-stone-100"
                                        onClick={handleSomethingElse}
                                    >
                                        <Sparkles className="w-5 h-5 mr-3 text-purple-500" />
                                        <span className="text-left font-semibold">Something else</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="col-span-2 justify-start h-auto py-3 px-4 text-stone-700 bg-stone-50 border-stone-100 hover:bg-stone-100"
                                        onClick={handleRunningLate}
                                    >
                                        <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
                                        <span className="text-left font-semibold">Running late?</span>
                                    </Button>

                                    <Button
                                        className="col-span-2 mt-2 bg-stone-900 hover:bg-black text-white w-full py-4 rounded-xl"
                                        onClick={() => setCurrentStep(prev => Math.min(prev + 1, activities.length - 1))}
                                    >
                                        Done! Show Next <ChevronRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-[2rem] p-12 text-center text-stone-400">
                                <p>No activity selected for now.</p>
                                <Button variant="outline" className="mt-4" onClick={() => setCurrentStep(0)}>Reset Day</Button>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* NEXT Section */}
                    {nextActivity && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/50 backdrop-blur-sm border border-stone-100 rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
                            onClick={() => setCurrentStep(prev => prev + 1)}
                        >
                            <div className="absolute top-0 bottom-0 left-0 w-1 bg-stone-200 group-hover:bg-[var(--color-primary)] transition-colors" />
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Up Next</div>
                                <div className="text-xs font-medium text-stone-500">{nextActivity.startTime}</div>
                            </div>
                            <h3 className="text-lg font-bold text-stone-800">{nextActivity.name}</h3>
                            <p className="text-sm text-stone-500 truncate">{nextActivity.location}</p>
                        </motion.div>
                    )}

                    {/* LATER Section */}
                    {laterActivities.length > 0 && (
                        <div className="pt-2">
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 px-2">Later Today</h3>
                            <div className="space-y-3">
                                {laterActivities.slice(0, 3).map((act) => (
                                    <div key={act.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white transition-colors cursor-pointer opacity-70 hover:opacity-100">
                                        <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
                                            {act.imageUrl && <img src={act.imageUrl} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-medium text-stone-900 truncate">{act.name}</h4>
                                            <p className="text-xs text-stone-500">{act.startTime}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-stone-300" />
                                    </div>
                                ))}
                                {laterActivities.length > 3 && (
                                    <div className="text-center text-xs text-stone-400 py-2">
                                        + {laterActivities.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation Bar */}
                <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 z-50">
                    <div className="bg-stone-900/90 backdrop-blur-lg text-stone-400 rounded-full shadow-2xl shadow-stone-900/40 p-1.5 flex justify-between items-center px-6 border border-white/10">
                        <button className="flex flex-col items-center gap-1 p-2 text-white">
                            <Calendar size={20} className="fill-current" />
                            <span className="text-[10px] font-medium">Today</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 p-2 hover:text-white transition-colors">
                            <Compass size={20} />
                            <span className="text-[10px] font-medium">Explore</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 p-2 hover:text-white transition-colors">
                            <Utensils size={20} />
                            <span className="text-[10px] font-medium">Food</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 p-2 hover:text-white transition-colors">
                            <MapPin size={20} />
                            <span className="text-[10px] font-medium">Spots</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 p-2 hover:text-white transition-colors">
                            <MessageCircle size={20} />
                            <span className="text-[10px] font-medium">Chat</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ----------- RENDER: PLANNING MODE (Original UI) -----------
    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar: Days & Events */}
            <div className="w-full lg:w-80 flex-shrink-0 space-y-6">

                {/* START TRIP BUTTON (Moved here for visibility) */}
                <Button
                    onClick={() => setViewMode('trip')}
                    className="w-full bg-stone-900 text-white hover:bg-black border-none shadow-xl shadow-stone-900/20 py-6 text-lg rounded-2xl"
                >
                    <Play className="w-5 h-5 mr-3 fill-current" /> Start Trip Mode
                </Button>

                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <h2 className="text-xl font-bold text-stone-900 mb-4 font-serif">{destination}</h2>
                    <div className="space-y-2">
                        {days.map((day, index) => (
                            <button
                                key={day.day}
                                onClick={() => setSelectedDay(index)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${selectedDay === index
                                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                                    : 'hover:bg-stone-50 text-stone-600'
                                    }`}
                            >
                                <span className="font-medium">Day {day.day}</span>
                                {selectedDay === index && <div className="w-2 h-2 bg-white rounded-full" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Events Section */}
                {events && events.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                        <div className="flex items-center gap-2 mb-4 text-[var(--color-accent)]">
                            <CalendarIcon size={20} />
                            <h3 className="font-bold text-stone-900">Special Events</h3>
                        </div>
                        <div className="space-y-4">
                            {events.map((evt) => (
                                <div key={evt.id} className="group cursor-pointer relative">
                                    <div className="aspect-video rounded-lg overflow-hidden mb-2 relative">
                                        <img src={evt.imageUrl} alt={evt.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                            {evt.type}
                                        </div>
                                        {onAddEvent && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onAddEvent(evt, selectedDay); }}
                                                className="absolute bottom-2 right-2 bg-white text-[var(--color-primary)] text-xs px-2 py-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity font-medium hover:bg-stone-50"
                                            >
                                                + Add
                                            </button>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-stone-900 text-sm leading-tight">{evt.name}</h4>
                                    <p className="text-xs text-stone-500 mt-1">{evt.date} • {evt.location}</p>
                                </div>
                            ))}
                        </div>
                        {onLoadMoreEvents && (
                            <Button variant="outline" size="sm" className="w-full mt-4" onClick={onLoadMoreEvents}>
                                Load More Events
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content: Activities */}
            <div className="flex-grow">
                <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 min-h-[600px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-stone-900 font-serif">Day {days[selectedDay]?.day}</h2>
                            {days[selectedDay]?.theme && (
                                <p className="text-[var(--color-primary)] font-medium mt-1">{days[selectedDay].theme}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {/* Removed duplicate Start Trip button from here */}

                            {onRegenerateDay && (
                                <Button variant="outline" size="sm" onClick={() => onRegenerateDay(selectedDay)}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Regenerate Day
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={onEdit}>
                                Edit Plan
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/flights?destination=${destination}`}
                                className="text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                            >
                                <Plane className="w-4 h-4 mr-2" /> Find Flights
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-8 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-100 before:z-0">
                        <AnimatePresence mode="wait">
                            {days[selectedDay]?.activities.map((activity, index) => (
                                <div key={activity.id}>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative pl-12 z-10"
                                    >
                                        {/* Timeline Dot */}
                                        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-primary)] flex items-center justify-center z-10">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                                        </div>

                                        <div className="bg-stone-50 rounded-2xl p-6 hover:shadow-md transition-shadow border border-stone-100">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Image */}
                                                <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                                                    <img
                                                        src={activity.imageUrl}
                                                        alt={activity.name}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-grow">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className="text-xl font-bold text-stone-900">{activity.name}</h3>
                                                        <div className="flex gap-2">
                                                            {activity.cost && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    ${activity.cost}
                                                                </span>
                                                            )}
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                                                {activity.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-stone-600 mb-4 leading-relaxed text-sm">
                                                        {activity.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={16} className="text-[var(--color-primary)]" />
                                                            {activity.startTime} - {activity.endTime}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={16} className="text-[var(--color-primary)]" />
                                                            {activity.location}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--color-primary)] transition-colors">
                                                            <Navigation size={16} className="text-[var(--color-primary)]" />
                                                            Get Directions
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Travel Info (if present) */}
                                    {activity.travelTime && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.1 + 0.05 }}
                                            className="pl-12 py-4 flex items-center gap-3 text-sm text-stone-400 relative"
                                        >
                                            <div className="w-0.5 h-full bg-stone-200 absolute left-4 top-0" />
                                            <Navigation size={14} />
                                            <span>{activity.travelTime}</span>
                                            {activity.travelCost && (
                                                <span className="bg-stone-100 px-2 py-0.5 rounded text-xs text-stone-500">
                                                    ~${activity.travelCost}
                                                </span>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
