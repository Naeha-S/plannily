import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { ArrowRight, ArrowLeft, Check, Calendar } from 'lucide-react';

interface DiscoveryData {
    vibes: string[];
    interests: string[];
    companions: string;
    travelStyle: string;
    budget: string;
    startDate: string;
    endDate: string;
    duration: number;
}

const VIBES = [
    { id: 'beach', label: 'Beach & Sun', emoji: '🏖️' },
    { id: 'culture', label: 'Culture & History', emoji: '🏛️' },
    { id: 'food', label: 'Food & Drink', emoji: '🍜' },
    { id: 'nature', label: 'Nature & Hiking', emoji: '🌲' },
    { id: 'city', label: 'City Break', emoji: '🏙️' },
    { id: 'relax', label: 'Relaxation', emoji: '💆' },
    { id: 'adventure', label: 'Adventure', emoji: '🧗' },
    { id: 'party', label: 'Nightlife', emoji: '🎉' },
];

const INTERESTS = [
    { id: 'museums', label: 'Museums', emoji: '🖼️' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'photography', label: 'Photography', emoji: '📸' },
    { id: 'music', label: 'Live Music', emoji: '🎵' },
    { id: 'wellness', label: 'Wellness', emoji: '🧘' },
    { id: 'local_life', label: 'Local Life', emoji: '🏘️' },
];

const COMPANIONS = [
    { id: 'solo', label: 'Solo', emoji: '👤' },
    { id: 'couple', label: 'Couple', emoji: '💑' },
    { id: 'friends', label: 'Friends', emoji: '👯' },
    { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
];

const TRAVEL_STYLES = [
    { id: 'relaxed', label: 'Relaxed', emoji: '🐢', desc: 'Take it easy, no rush.' },
    { id: 'balanced', label: 'Balanced', emoji: '⚖️', desc: 'Mix of sights and chill.' },
    { id: 'packed', label: 'Packed', emoji: '🐇', desc: 'See everything possible.' },
];

const BUDGETS = [
    { id: 'low', label: 'Budget', emoji: '💸' },
    { id: 'medium', label: 'Standard', emoji: '💰' },
    { id: 'high', label: 'Luxury', emoji: '💎' },
];

export const DiscoveryWizard = ({ onComplete }: { onComplete: (data: DiscoveryData) => void }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<DiscoveryData>({
        vibes: [],
        interests: [],
        companions: '',
        travelStyle: '',
        budget: '',
        startDate: '',
        endDate: '',
        duration: 0,
    });

    // Calculate duration whenever dates change
    useEffect(() => {
        if (data.startDate && data.endDate) {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setData(prev => ({ ...prev, duration: diffDays > 0 ? diffDays : 0 }));
        }
    }, [data.startDate, data.endDate]);

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    const toggleVibe = (id: string) => {
        setData((prev) => ({
            ...prev,
            vibes: prev.vibes.includes(id)
                ? prev.vibes.filter((v) => v !== id)
                : [...prev.vibes, id],
        }));
    };

    const toggleInterest = (id: string) => {
        setData((prev) => ({
            ...prev,
            interests: prev.interests.includes(id)
                ? prev.interests.filter((i) => i !== id)
                : [...prev.interests, id],
        }));
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 min-h-[600px] flex flex-col">
            <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                    <span>Step {step} of 3</span>
                    <span>{Math.round((step / 3) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow space-y-8"
                    >
                        <div>
                            <h2 className="text-2xl font-bold mb-2">What's your vibe?</h2>
                            <p className="text-slate-600 mb-4">Select all that apply to your dream trip.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {VIBES.map((vibe) => (
                                    <button
                                        key={vibe.id}
                                        onClick={() => toggleVibe(vibe.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${data.vibes.includes(vibe.id)
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-md scale-[1.02]'
                                            : 'border-slate-100 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{vibe.emoji}</div>
                                        <div className="font-medium text-sm">{vibe.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-2">Specific Interests?</h3>
                            <div className="flex flex-wrap gap-2">
                                {INTERESTS.map((interest) => (
                                    <button
                                        key={interest.id}
                                        onClick={() => toggleInterest(interest.id)}
                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${data.interests.includes(interest.id)
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                            }`}
                                    >
                                        {interest.emoji} {interest.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow space-y-8"
                    >
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Who's coming with you?</h2>
                            <p className="text-slate-600 mb-4">We'll tailor the activities accordingly.</p>
                            <div className="grid grid-cols-2 gap-4">
                                {COMPANIONS.map((comp) => (
                                    <button
                                        key={comp.id}
                                        onClick={() => setData({ ...data, companions: comp.id })}
                                        className={`p-6 rounded-xl border-2 text-left transition-all flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${data.companions === comp.id
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-md scale-[1.02]'
                                            : 'border-slate-100 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5'
                                            }`}
                                    >
                                        <div className="text-3xl">{comp.emoji}</div>
                                        <div className="font-medium text-lg">{comp.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-2">Travel Pace</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {TRAVEL_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setData({ ...data, travelStyle: style.id })}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${data.travelStyle === style.id
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                            : 'border-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">{style.emoji}</div>
                                        <div className="font-bold text-sm">{style.label}</div>
                                        <div className="text-xs text-slate-500 mt-1">{style.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow space-y-8"
                    >
                        <div>
                            <h2 className="text-2xl font-bold mb-2">When & How much?</h2>
                            <p className="text-slate-600 mb-6">Final details to find your perfect match.</p>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={data.startDate}
                                            onChange={(e) => setData({ ...data, startDate: e.target.value })}
                                            className="w-full p-3 pl-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            min={data.startDate || new Date().toISOString().split('T')[0]}
                                            value={data.endDate}
                                            onChange={(e) => setData({ ...data, endDate: e.target.value })}
                                            className="w-full p-3 pl-10 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {data.duration > 0 && (
                                <div className="text-center mb-8 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                    Trip Duration: {data.duration} Days
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Budget Level
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {BUDGETS.map((b) => (
                                        <button
                                            key={b.id}
                                            onClick={() => setData({ ...data, budget: b.id })}
                                            className={`p-4 rounded-xl border-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${data.budget === b.id
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-md scale-[1.02]'
                                                : 'border-slate-100 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{b.emoji}</div>
                                            <div className="font-medium">{b.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={step === 1}
                    className={step === 1 ? 'invisible' : ''}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {step < 3 ? (
                    <Button onClick={nextStep} disabled={
                        (step === 1 && data.vibes.length === 0) ||
                        (step === 2 && (!data.companions || !data.travelStyle))
                    }>
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={() => onComplete(data)} disabled={!data.budget || !data.startDate || !data.endDate}>
                        Find Destinations <Check className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
};
