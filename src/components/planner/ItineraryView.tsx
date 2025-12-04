import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Navigation, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import type { ItineraryDay, TripEvent } from '../../types';
import { Button } from '../common/Button';

interface ItineraryViewProps {
    destination: string;
    days: ItineraryDay[];
    events?: TripEvent[];
    onEdit: () => void;
    onRegenerateDay?: (dayIndex: number) => void;
}

export const ItineraryView = ({ destination, days, events, onEdit, onRegenerateDay }: ItineraryViewProps) => {
    const [selectedDay, setSelectedDay] = useState(0);

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar: Days & Events */}
            <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
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
                                <div key={evt.id} className="group cursor-pointer">
                                    <div className="aspect-video rounded-lg overflow-hidden mb-2 relative">
                                        <img src={evt.imageUrl} alt={evt.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                            {evt.type}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-stone-900 text-sm leading-tight">{evt.name}</h4>
                                    <p className="text-xs text-stone-500 mt-1">{evt.date} • {evt.location}</p>
                                </div>
                            ))}
                        </div>
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
                            {onRegenerateDay && (
                                <Button variant="outline" size="sm" onClick={() => onRegenerateDay(selectedDay)}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Regenerate Day
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={onEdit}>
                                Edit Plan
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
