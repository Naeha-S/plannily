import { useState } from 'react';
import { Calendar, MapPin, DollarSign, Plane } from 'lucide-react';
import { Button } from '../common/Button';

interface PlannerInputProps {
    onPlan: (data: { destination: string; origin: string; days: number; budget: string }) => void;
}

export const PlannerInput = ({ onPlan }: PlannerInputProps) => {
    const [destination, setDestination] = useState('');
    const [origin, setOrigin] = useState('');
    const [days, setDays] = useState(3);
    const [budget, setBudget] = useState('medium');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onPlan({ destination, origin, days, budget });
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-stone-100">
            <h2 className="text-[var(--text-h3)] font-bold mb-8 text-center text-[var(--color-text)] font-serif">Where are you heading?</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Origin (Airport Code)</label>
                        <div className="relative group">
                            <Plane className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <input
                                type="text"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                                placeholder="e.g. JFK, LHR"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all placeholder:text-stone-300"
                                maxLength={3}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Destination (City Code)</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                                placeholder="e.g. TYO, PAR"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all placeholder:text-stone-300"
                                maxLength={3}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-2">Duration</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                <input
                                    type="number"
                                    min="1"
                                    max="14"
                                    value={days}
                                    onChange={(e) => setDays(parseInt(e.target.value))}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-2">Budget</label>
                            <div className="relative group">
                                <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                <select
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all appearance-none bg-white cursor-pointer"
                                >
                                    <option value="low">Budget</option>
                                    <option value="medium">Moderate</option>
                                    <option value="high">Luxury</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <Button type="submit" className="w-full text-lg h-12 mt-4" disabled={!destination || !origin}>
                    Find Flights & Plan Trip
                </Button>
            </form>
        </div>
    );
};
