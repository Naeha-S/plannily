import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import {
    ArrowRight, ArrowLeft, Check, Calendar, Plane,
    Globe, Users, Heart, Sparkles, AlertCircle
} from 'lucide-react';

interface DiscoveryData {
    vibes: string[];
    interests: string[];
    companions: string;
    travelStyle: string;
    budget: number;
    origin: string;
    startDate: string;
    endDate: string;
    duration: number;
    isMulticity: boolean;
}

// --- Data Definitions ---

const VIBES_DATA = [
    {
        id: 'adventure', label: 'Adventure', emoji: '🧗', color: 'text-orange-500',
        subVibes: [
            { id: 'hiking', label: 'Hiking', emoji: '🥾' },
            { id: 'surfing', label: 'Surfing', emoji: '🏄' },
            { id: 'climbing', label: 'Rock Climbing', emoji: '🧗' },
            { id: 'skiing', label: 'Skiing', emoji: '⛷️' }
        ]
    },
    {
        id: 'beach', label: 'Beach & Sun', emoji: '🏖️', color: 'text-blue-500',
        subVibes: [
            { id: 'swimming', label: 'Swimming', emoji: '🏊' },
            { id: 'sunbathing', label: 'Sunbathing', emoji: '☀️' },
            { id: 'diving', label: 'Diving', emoji: '🤿' },
            { id: 'islands', label: 'Island Hopping', emoji: '🏝️' }
        ]
    },
    {
        id: 'culture', label: 'Culture', emoji: '🏛️', color: 'text-amber-600',
        subVibes: [
            { id: 'history', label: 'History', emoji: '📜' },
            { id: 'art', label: 'Art', emoji: '🎨' },
            { id: 'traditions', label: 'Traditions', emoji: '👘' },
            { id: 'architecture', label: 'Architecture', emoji: '🏰' }
        ]
    },
    {
        id: 'food', label: 'Food', emoji: '🍜', color: 'text-red-500',
        subVibes: [
            { id: 'street_food', label: 'Street Food', emoji: '🌮' },
            { id: 'fine_dining', label: 'Fine Dining', emoji: '🍷' },
            { id: 'wine', label: 'Wine Tasting', emoji: '🍇' },
            { id: 'cooking', label: 'Cooking Class', emoji: '👨‍🍳' }
        ]
    },
    {
        id: 'nature', label: 'Nature', emoji: '🌲', color: 'text-green-600',
        subVibes: [
            { id: 'mountains', label: 'Mountains', emoji: '⛰️' },
            { id: 'forests', label: 'Forests', emoji: '🌳' },
            { id: 'wildlife', label: 'Wildlife', emoji: '🦁' },
            { id: 'stargazing', label: 'Stargazing', emoji: '✨' }
        ]
    },
    {
        id: 'city', label: 'City Break', emoji: '🏙️', color: 'text-indigo-500',
        subVibes: [
            { id: 'sightseeing', label: 'Sightseeing', emoji: '👀' },
            { id: 'shopping_city', label: 'Shopping', emoji: '🛍️' },
            { id: 'cafes', label: 'Café Hopping', emoji: '☕' },
            { id: 'rooftops', label: 'Rooftop Bars', emoji: '🍸' }
        ]
    },
    {
        id: 'relax', label: 'Relaxation', emoji: '💆', color: 'text-teal-500',
        subVibes: [
            { id: 'spa', label: 'Spa & Wellness', emoji: '🧖' },
            { id: 'yoga', label: 'Yoga', emoji: '🧘' },
            { id: 'reading', label: 'Reading', emoji: '📖' },
            { id: 'digital_detox', label: 'Detox', emoji: '📵' }
        ]
    },
    {
        id: 'party', label: 'Nightlife', emoji: '🎉', color: 'text-purple-500',
        subVibes: [
            { id: 'clubs', label: 'Clubs', emoji: '🕺' },
            { id: 'bars', label: 'Bars', emoji: '🍻' },
            { id: 'live_music', label: 'Live Music', emoji: '🎸' },
            { id: 'comedy', label: 'Comedy', emoji: '🎭' }
        ]
    },
];

const INTEREST_CATEGORIES = [
    {
        title: 'Culture',
        items: [
            { id: 'museums', label: 'Museums', emoji: '🖼️' },
            { id: 'history', label: 'History', emoji: '📜' }
        ]
    },
    {
        title: 'Activities',
        items: [
            { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
            { id: 'photography', label: 'Photography', emoji: '📸' }
        ]
    },
    {
        title: 'Food & Relaxation',
        items: [
            { id: 'wellness', label: 'Wellness', emoji: '🧘' },
            { id: 'cafes', label: 'Coffee Culture', emoji: '☕' }
        ]
    },
    {
        title: 'Social',
        items: [
            { id: 'music', label: 'Live Music', emoji: '🎵' },
            { id: 'local_life', label: 'Local Life', emoji: '🏘️' }
        ]
    }
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

const DURATION_OPTIONS = [
    { label: 'Weekend', days: 3 },
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
    { label: 'Month', days: 30 },
];

// --- Components ---

export const DiscoveryWizard = ({ onComplete }: { onComplete: (data: DiscoveryData) => void }) => {
    const [step, setStep] = useState(1);
    const [activeVibeId, setActiveVibeId] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Default 500ms delay for visual validation feedback
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    const [data, setData] = useState<DiscoveryData>({
        vibes: [],
        interests: [],
        companions: '',
        travelStyle: '',
        budget: 3000,
        origin: '',
        startDate: '',
        endDate: '',
        duration: 0,
        isMulticity: false,
    });

    // Calculate duration
    useEffect(() => {
        if (data.startDate && data.endDate) {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start date

            // Only update if valuable
            if (!isNaN(diffDays)) {
                setData(prev => ({ ...prev, duration: diffDays > 0 ? diffDays : 0 }));
            }
        }
    }, [data.startDate, data.endDate]);

    useEffect(() => {
        // Find if any selected vibe is from sub vibes of active one
        // Not needed for logic but maybe for UI
    }, [activeVibeId]);

    const validateStep = (currentStep: number) => {
        const newErrors: { [key: string]: string } = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!data.origin.trim()) { newErrors.origin = 'Please enter a departure city'; isValid = false; }
            if (!data.startDate) { newErrors.startDate = 'Start date required'; isValid = false; }
            if (!data.endDate) { newErrors.endDate = 'End date required'; isValid = false; }
            if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
                newErrors.endDate = 'End date cannot be before start date'; isValid = false;
            }
        } else if (currentStep === 2) {
            if (!data.companions) { newErrors.companions = 'Please select who is coming'; isValid = false; }
            if (!data.travelStyle) { newErrors.travelStyle = 'Please select a travel style'; isValid = false; }
        } else if (currentStep === 3) {
            if (data.vibes.length === 0) { newErrors.vibes = 'Please select at least one vibe'; isValid = false; }
        }

        setErrors(newErrors);
        return isValid;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep((s) => s + 1);
            // Scroll to top
            window.scrollTo(0, 0);
        } else {
            // Mark all fields as touched to show errors
            if (step === 1) setTouched({ origin: true, startDate: true, endDate: true });
            if (step === 2) setTouched({ companions: true, travelStyle: true });
        }
    };

    const prevStep = () => setStep((s) => s - 1);

    const toggleVibe = (id: string, isSub = false) => {
        setData((prev) => {
            const list = prev.vibes;
            const exists = list.includes(id);
            let newList;

            if (exists) {
                newList = list.filter(v => v !== id);
            } else {
                newList = [...list, id];
            }
            return { ...prev, vibes: newList };
        });

        if (!isSub) {
            setActiveVibeId(id);
        }
    };

    const toggleInterest = (id: string) => {
        setData((prev) => ({
            ...prev,
            interests: prev.interests.includes(id)
                ? prev.interests.filter((i) => i !== id)
                : [...prev.interests, id],
        }));
    };

    const applyDuration = (days: number) => {
        if (!data.startDate) return;
        const start = new Date(data.startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + days - 1); // -1 because start date counts as day 1
        setData(prev => ({
            ...prev,
            endDate: end.toISOString().split('T')[0]
        }));
    };

    const getActiveSubVibes = () => {
        if (!activeVibeId) return [];
        const vibe = VIBES_DATA.find(v => v.id === activeVibeId);
        return vibe ? vibe.subVibes : [];
    };

    const handleSurpriseMe = () => {
        // Balanced defaults
        setData(prev => ({
            ...prev,
            vibes: ['culture', 'food', 'nature'],
            interests: ['museums', 'local_life'],
            travelStyle: 'balanced',
            companions: prev.companions || 'couple',
        }));
        // We can't auto-advance if logistics are missing, so we just set defaults for preferences
        if (step === 1 && data.origin && data.startDate && data.endDate) {
            // If logistics are filled, jump to end? No, just prefill.
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-10 min-h-[600px] flex flex-col relative overflow-hidden">
            {/* Progress Header */}
            <div className="mb-10 relative z-10">
                <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-3">
                    <span className="flex items-center gap-2">
                        {step === 1 && <Plane className="w-4 h-4" />}
                        {step === 2 && <Users className="w-4 h-4" />}
                        {step === 3 && <Sparkles className="w-4 h-4" />}
                        {step === 4 && <Heart className="w-4 h-4" />}
                        {step === 1 ? 'Logistics' : step === 2 ? 'Companions' : step === 3 ? 'Vibes' : 'Interests'}
                    </span>
                    <span>Step {step} of 4</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[var(--color-primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
                {Object.keys(errors).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-0 right-0 mx-auto w-max px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium flex items-center shadow-sm z-50"
                    >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Please fix the highlighted fields
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {/* STEP 1: LOGISTICS */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow space-y-8"
                    >
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">First things first</h2>
                            <p className="text-slate-600">Where are you starting your journey?</p>
                        </div>

                        {/* Multi-city Toggle */}
                        <div
                            onClick={() => setData({ ...data, isMulticity: !data.isMulticity })}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${data.isMulticity
                                    ? 'border-[var(--color-primary)] bg-blue-50/50'
                                    : 'border-slate-100 hover:border-slate-200'
                                }`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${data.isMulticity ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Multi-city Adventure</h3>
                                    <p className="text-sm text-slate-500">Enable this to find a route covering multiple destinations</p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className={`w-12 h-6 rounded-full transition-colors ${data.isMulticity ? 'bg-[var(--color-primary)]' : 'bg-slate-200'}`}></div>
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.isMulticity ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </div>

                        {/* Origin Input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Flying from <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Plane className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.origin ? 'text-red-400' : 'text-slate-400'}`} />
                                <input
                                    type="text"
                                    placeholder="e.g. New York, London, Dubai"
                                    value={data.origin}
                                    onChange={(e) => {
                                        setData({ ...data, origin: e.target.value });
                                        if (errors.origin) setErrors({ ...errors, origin: '' });
                                    }}
                                    onBlur={() => setTouched({ ...touched, origin: true })}
                                    className={`w-full p-4 pl-12 rounded-xl border-2 transition-all outline-none font-medium text-lg ${errors.origin && touched.origin
                                            ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                                            : 'border-slate-100 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10'
                                        }`}
                                />
                            </div>
                            {errors.origin && touched.origin && <p className="text-red-500 text-xs mt-1 ml-1">{errors.origin}</p>}
                        </div>

                        {/* Dates Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={data.startDate}
                                        onChange={(e) => {
                                            const newDate = e.target.value;
                                            setData(p => ({ ...p, startDate: newDate }));
                                            if (errors.startDate) setErrors({ ...errors, startDate: '' });
                                        }}
                                        className={`w-full p-4 pl-4 rounded-xl border-2 outline-none font-medium ${errors.startDate
                                                ? 'border-red-300'
                                                : 'border-slate-100 focus:border-[var(--color-primary)]'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">End Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    min={data.startDate || new Date().toISOString().split('T')[0]}
                                    value={data.endDate}
                                    onChange={(e) => {
                                        const newDate = e.target.value;
                                        setData(p => ({ ...p, endDate: newDate }));
                                        if (errors.endDate) setErrors({ ...errors, endDate: '' });
                                    }}
                                    className={`w-full p-4 pl-4 rounded-xl border-2 outline-none font-medium ${errors.endDate
                                            ? 'border-red-300'
                                            : 'border-slate-100 focus:border-[var(--color-primary)]'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Quick Duration Select */}
                        {data.startDate && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {DURATION_OPTIONS.map(opt => (
                                    <button
                                        key={opt.label}
                                        onClick={() => applyDuration(opt.days)}
                                        className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-200 text-sm font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors text-slate-600"
                                    >
                                        + {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {data.duration > 0 && (
                            <div className="flex items-center justify-center p-3 bg-blue-50 text-[var(--color-primary)] rounded-lg text-sm font-medium">
                                <Calendar className="w-4 h-4 mr-2" />
                                Trip Duration: {data.duration} Days
                            </div>
                        )}

                        {/* Budget */}
                        <div>
                            <label className="flex justify-between text-sm font-bold text-slate-700 mb-4">
                                <span>Budget (per person)</span>
                                <span className="text-[var(--color-primary)]">${data.budget}</span>
                            </label>
                            <input
                                type="range"
                                min="500"
                                max="10000"
                                step="100"
                                value={data.budget}
                                onChange={(e) => setData({ ...data, budget: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                                <span>$500 (Budget)</span>
                                <span>$10k+ (Luxury)</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: COMPANIONS */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow space-y-10"
                    >
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">Who's coming?</h2>
                            <p className="text-slate-600">Select your travel crew.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {COMPANIONS.map((comp) => (
                                <button
                                    key={comp.id}
                                    onClick={() => setData({ ...data, companions: comp.id })}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${data.companions === comp.id
                                            ? 'border-[var(--color-primary)] bg-blue-50/30 shadow-md ring-2 ring-blue-100'
                                            : 'border-slate-100 hover:border-slate-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">{comp.emoji}</div>
                                    <div className="font-bold text-lg text-slate-800">{comp.label}</div>
                                    {data.companions === comp.id && (
                                        <div className="absolute top-4 right-4 text-[var(--color-primary)]">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                Travel Pace
                                <span className="text-xs font-normal text-slate-400 px-2 py-0.5 border rounded-full">Required</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {TRAVEL_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setData({ ...data, travelStyle: style.id })}
                                        className={`p-5 rounded-2xl border-2 text-left transition-all ${data.travelStyle === style.id
                                                ? 'border-[var(--color-primary)] bg-blue-50/30 shadow-md'
                                                : 'border-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{style.emoji}</div>
                                        <div className="font-bold text-slate-800">{style.label}</div>
                                        <div className="text-sm text-slate-500 mt-1 leading-snug">{style.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {data.companions && data.travelStyle && (
                            <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium animate-fade-in">
                                <Check className="w-3 h-3 mr-1.5" /> 2 sections completed
                            </div>
                        )}
                    </motion.div>
                )}

                {/* STEP 3: VIBES */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow flex flex-col h-full"
                    >
                        <div className="mb-6">
                            <h2 className="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">What's the vibe?</h2>
                            <p className="text-slate-600">Select what matches your mood. Click a vibe to see more options.</p>
                        </div>

                        <div className="flex-grow flex flex-col md:flex-row gap-6 md:h-[400px]">
                            {/* LEFT: Main Vibes Grid */}
                            <div className="md:w-1/2 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-3">
                                    {VIBES_DATA.map((vibe) => (
                                        <button
                                            key={vibe.id}
                                            onClick={() => toggleVibe(vibe.id)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all relative ${data.vibes.includes(vibe.id)
                                                    ? 'border-teal-500 bg-teal-50 shadow-md'
                                                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                                } ${activeVibeId === vibe.id ? 'ring-2 ring-teal-500 ring-offset-2' : ''}`}
                                        >
                                            <div className="text-2xl mb-1">{vibe.emoji}</div>
                                            <div className="font-bold text-sm text-slate-800">{vibe.label}</div>
                                            {data.vibes.includes(vibe.id) && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT: Sub-Vibes Carousel area */}
                            <div className="md:w-1/2 bg-slate-50 rounded-2xl p-6 flex flex-col justify-center relative border border-slate-100">
                                {!activeVibeId ? (
                                    <div className="text-center text-slate-400">
                                        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Click a vibe on the left to explore specific activities</p>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                                {VIBES_DATA.find(v => v.id === activeVibeId)?.emoji}
                                                {VIBES_DATA.find(v => v.id === activeVibeId)?.label} Options
                                            </h3>
                                            <span className="text-xs text-slate-400">Select multiple</span>
                                        </div>

                                        <div className="grid gap-3 flex-grow content-start overflow-y-auto custom-scrollbar">
                                            {getActiveSubVibes().map((sub) => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => toggleVibe(sub.id, true)}
                                                    className={`flex items-center p-3 rounded-xl border transition-all ${data.vibes.includes(sub.id)
                                                            ? 'bg-teal-500 text-white border-teal-500 shadow-md transform scale-[1.02]'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                                                        }`}
                                                >
                                                    <span className="text-xl mr-3">{sub.emoji}</span>
                                                    <span className="font-medium">{sub.label}</span>
                                                    {data.vibes.includes(sub.id) && <Check className="w-4 h-4 ml-auto" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selection Summary for Step 3 */}
                        {data.vibes.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="font-bold text-teal-600 mr-1">Selected:</span>
                                {data.vibes.slice(0, 5).map(vId => {
                                    // Find label
                                    let label = '';
                                    VIBES_DATA.forEach(v => {
                                        if (v.id === vId) label = v.label;
                                        v.subVibes.forEach(s => { if (s.id === vId) label = s.label; });
                                    });
                                    return label ? <span key={vId} className="bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">{label}</span> : null;
                                })}
                                {data.vibes.length > 5 && <span className="text-slate-400">+{data.vibes.length - 5} more</span>}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* STEP 4: INTERESTS */}
                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-grow space-y-8"
                    >
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-serif font-bold text-[var(--color-text)] mb-2">Specific Interests</h2>
                            <p className="text-slate-600">The cherry on top of your perfect trip.</p>
                        </div>

                        <div className="space-y-8 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {INTEREST_CATEGORIES.map((cat, idx) => (
                                <div key={idx} className="bg-white">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">{cat.title}</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {cat.items.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleInterest(item.id)}
                                                className={`p-3 rounded-xl border text-left transition-all hover:-translate-y-1 ${data.interests.includes(item.id)
                                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className="text-xl mb-1">{item.emoji}</div>
                                                <div className="font-semibold text-sm">{item.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {data.interests.length > 0 && (
                            <div className="text-center">
                                <span className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                                    {data.interests.length} interests selected
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation & Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={step === 1}
                    className={`text-slate-500 hover:text-slate-800 ${step === 1 ? 'invisible' : ''}`}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {step === 1 && (
                    <button onClick={handleSurpriseMe} className="text-sm text-[var(--color-primary)] font-medium hover:underline">
                        I'm flexible, surprise me!
                    </button>
                )}

                {step < 4 ? (
                    <Button
                        onClick={nextStep}
                        className="px-8"
                    >
                        Next Step <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={() => onComplete(data)}
                        disabled={data.vibes.length === 0}
                        className="px-8 bg-green-600 hover:bg-green-700 text-white"
                    >
                        Confirm & Search <Check className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};
