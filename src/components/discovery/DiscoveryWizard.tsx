import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface DiscoveryData {
    vibes: string[];
    companions: string;
    budget: string;
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

const COMPANIONS = [
    { id: 'solo', label: 'Solo', emoji: '👤' },
    { id: 'couple', label: 'Couple', emoji: '💑' },
    { id: 'friends', label: 'Friends', emoji: '👯' },
    { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
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
        companions: '',
        budget: '',
        duration: 5,
    });

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

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 min-h-[500px] flex flex-col">
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
                        className="flex-grow"
                    >
                        <h2 className="text-2xl font-bold mb-2">What's your vibe?</h2>
                        <p className="text-slate-600 mb-6">Select all that apply to your dream trip.</p>

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
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow"
                    >
                        <h2 className="text-2xl font-bold mb-2">Who's coming with you?</h2>
                        <p className="text-slate-600 mb-6">We'll tailor the pace and activities accordingly.</p>

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
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow"
                    >
                        <h2 className="text-2xl font-bold mb-2">Budget & Duration</h2>
                        <p className="text-slate-600 mb-6">Help us find the right fit for your wallet and time.</p>

                        <div className="space-y-8">
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

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    How many days? ({data.duration} days)
                                </label>
                                <input
                                    type="range"
                                    min="3"
                                    max="14"
                                    value={data.duration}
                                    onChange={(e) => setData({ ...data, duration: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-2">
                                    <span>3 days</span>
                                    <span>14 days</span>
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
                        (step === 2 && !data.companions)
                    }>
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={() => onComplete(data)} disabled={!data.budget}>
                        Find Destinations <Check className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
};
