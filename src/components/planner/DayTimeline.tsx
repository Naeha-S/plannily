
import { motion } from 'framer-motion';
import { Clock, MapPin, Coffee, Camera, Utensils } from 'lucide-react';
import type { ItineraryDay, Activity } from '../../types';

interface DayTimelineProps {
    day: ItineraryDay;
}

const ActivityIcon = ({ type }: { type: Activity['type'] }) => {
    switch (type) {
        case 'food': return <Utensils className="w-4 h-4" />;
        case 'sightseeing': return <Camera className="w-4 h-4" />;
        case 'relaxation': return <Coffee className="w-4 h-4" />;
        default: return <MapPin className="w-4 h-4" />;
    }
};

export const DayTimeline = ({ day }: DayTimelineProps) => {
    return (
        <div className="mb-8 last:mb-0">
            <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">
                    {day.day}
                </span>
                Day {day.day}
            </h3>

            <div className="space-y-4 pl-4 border-l-2 border-slate-100 ml-4">
                {day.activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-8 pb-8 last:pb-0"
                    >
                        <div className="absolute -left-[41px] top-0 bg-white border-2 border-slate-200 rounded-full p-2 z-10">
                            <ActivityIcon type={activity.type} />
                        </div>

                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-900">{activity.name}</h4>
                                <div className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {activity.startTime} - {activity.endTime}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{activity.description}</p>
                            {activity.imageUrl && (
                                <img
                                    src={activity.imageUrl}
                                    alt={activity.name}
                                    className="w-full h-32 object-cover rounded-xl mb-3"
                                />
                            )}
                            <div className="flex items-center text-xs text-slate-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                {activity.location}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
