import { motion } from 'framer-motion';
import { Cloud, DollarSign, Users } from 'lucide-react';
import { Button } from '../common/Button';
import type { Destination } from '../../types';

interface DestinationCardProps {
    destination: Destination;
    rank: number;
    onSelect: (id: string) => void;
}

export const DestinationCard = ({ destination, rank, onSelect }: DestinationCardProps) => {
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

                <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-3xl font-bold mb-1">{destination.name}</h3>
                    <p className="text-white/90 font-medium">{destination.country}</p>
                </div>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm h-12 w-12 rounded-full flex items-center justify-center shadow-sm">
                    <div className="text-center">
                        <span className="block text-xs font-bold text-secondary">{destination.matchScore}%</span>
                        <span className="block text-[10px] text-slate-500 leading-none">Match</span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <p className="text-slate-600 mb-6 line-clamp-2">{destination.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                        <Cloud className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <div className="text-sm font-semibold">{destination.weather.temp}°C</div>
                        <div className="text-xs text-slate-500">{destination.weather.condition}</div>
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

                <Button className="w-full" onClick={() => onSelect(destination.id)}>
                    View Itinerary
                </Button>
            </div>
        </motion.div>
    );
};
