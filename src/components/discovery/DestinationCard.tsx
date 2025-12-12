import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, DollarSign, Users, Info, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';
import type { Destination } from '../../types';
import { checkHolidaysForDateRange, type PublicHoliday } from '../../services/holidays';

interface DestinationCardProps {
    destination: Destination;
    rank: number;
    onSelect: (id: string) => void;
    startDate?: string;
}

export const DestinationCard = ({ destination, rank, onSelect, startDate }: DestinationCardProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
    const [loadingHolidays, setLoadingHolidays] = useState(false);

    useEffect(() => {
        if (showInfo && startDate && destination.countryCode && holidays.length === 0) {
            setLoadingHolidays(true);
            checkHolidaysForDateRange(destination.countryCode, startDate, 7) // Checking for first 7 days
                .then(setHolidays)
                .catch(err => console.error(err))
                .finally(() => setLoadingHolidays(false));
        }
    }, [showInfo, startDate, destination.countryCode]);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.1 }}
            className="group relative bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
        >
            <div className="relative h-64 overflow-hidden">
                <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                    #{rank} Recommendation
                </div>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm h-16 w-16 rounded-full flex flex-col items-center justify-center shadow-sm">
                    <div className="text-center">
                        <span className="block text-sm font-bold text-secondary">{destination.matchScore}%</span>
                        <span className="block text-[10px] text-slate-500 leading-none">Match</span>
                    </div>
                </div>

                {/* Reason Tag */}
                {destination.matchReason && (
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-3xl font-bold mb-1 drop-shadow-md">{destination.name}</h3>
                        <p className="text-white/90 font-medium drop-shadow-md mb-2">{destination.country}</p>
                        <p className="text-xs font-medium bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg inline-block border border-white/20">
                            ✨ {destination.matchReason}
                        </p>
                    </div>
                )}

                {!destination.matchReason && (
                    <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-3xl font-bold mb-1 drop-shadow-md">{destination.name}</h3>
                        <p className="text-white/90 font-medium drop-shadow-md">{destination.country}</p>
                    </div>
                )}
            </div>

            <div className="p-6">
                <p className="text-slate-600 mb-6 line-clamp-2">{destination.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                        <Cloud className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <div className="text-sm font-semibold">{destination.weather?.temp ?? '--'}°C</div>
                        <div className="text-xs text-slate-500">{destination.weather?.condition ?? 'Unknown'}</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                        <DollarSign className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <div className="text-sm font-semibold">${destination.costEstimate}</div>
                        <div className="text-xs text-slate-500">Est. Cost</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                        <Users className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <div className="text-sm font-semibold">Med</div>
                        <div className="text-xs text-slate-500">Crowds</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {destination.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Info Toggle */}
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="flex items-center text-sm text-[var(--color-primary)] font-medium mb-4 hover:underline"
                >
                    <Info className="w-4 h-4 mr-1" />
                    {showInfo ? 'Hide Details' : 'View Travel Info (Visa & Holidays)'}
                </button>

                {showInfo && (
                    <div className="mb-4 p-4 bg-stone-50 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                        {/* Visa Info */}
                        {destination.visaInfo && (
                            <div className="text-sm">
                                <span className="font-semibold block text-stone-700">🛂 Visa Check:</span>
                                <span className="text-stone-600">{destination.visaInfo}</span>
                            </div>
                        )}

                        {/* Holidays */}
                        <div className="text-sm">
                            <span className="font-semibold block text-stone-700 mb-1">📅 Public Holidays:</span>
                            {!startDate ? (
                                <span className="text-stone-400 italic">Select dates to check holidays.</span>
                            ) : loadingHolidays ? (
                                <span className="text-stone-500">Checking local calendar...</span>
                            ) : holidays.length > 0 ? (
                                <div className="space-y-1">
                                    <div className="flex items-center text-amber-600 font-medium">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        <span>Heads up! Holidays found:</span>
                                    </div>
                                    <ul className="list-disc list-inside text-stone-600 pl-1">
                                        {holidays.map(h => (
                                            <li key={h.uuid || h.name}>{h.date}: {h.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <span className="text-green-600 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" /> No public holidays during your trip.
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <Button className="w-full" onClick={() => onSelect(destination.id)}>
                    View Itinerary
                </Button>
            </div>
        </motion.div >
    );
};
