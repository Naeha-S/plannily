import { useState } from 'react';
import { Calendar, MapPin, DollarSign, Users, ArrowRight, ArrowLeft, Plane } from 'lucide-react';
import { Button } from '../common/Button';

interface PlannerInputProps {
    onPlan: (data: any) => void;
}

export const PlannerInput = ({ onPlan }: PlannerInputProps) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        destination: '',
        origin: '', // Optional now
        days: 3,
        travelers: 2,
        budget: 'medium',
        interests: [] as string[],
        pace: 'balanced',
        isMulticity: false
    });

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onPlan(formData);
    };

    const toggleInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-stone-100">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-8 px-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-[var(--color-primary)] text-white' : 'bg-stone-100 text-stone-400'
                            }`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`w-16 h-1 mx-2 rounded-full transition-colors ${step > s ? 'bg-[var(--color-primary)]' : 'bg-stone-100'}`} />}
                    </div>
                ))}
            </div>

            <form onSubmit={step === 3 ? handleSubmit : handleNext}>
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-[var(--text-h3)] font-bold text-center text-[var(--color-text)] font-serif">Trip Basics</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-2">Where to? (City)</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.destination}
                                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        placeholder="e.g. Tokyo, Paris, New York"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center space-x-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.isMulticity}
                                        onChange={(e) => setFormData({ ...formData, isMulticity: e.target.checked })}
                                        className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                                    />
                                    <div>
                                        <span className="font-medium text-stone-700">Multi-city Trip</span>
                                        <p className="text-xs text-stone-500">Plan a route with multiple stops.</p>
                                    </div>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 mb-2">Duration (Days)</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                        <input
                                            type="number"
                                            min="1"
                                            max="14"
                                            value={formData.days}
                                            onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-600 mb-2">Origin (Optional)</label>
                                    <div className="relative group">
                                        <Plane className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                        <input
                                            type="text"
                                            value={formData.origin}
                                            onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
                                            placeholder="e.g. JFK"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-[var(--text-h3)] font-bold text-center text-[var(--color-text)] font-serif">Style & Budget</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-2">Travelers</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.travelers}
                                        onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-2">Budget</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                                    <select
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="low">Budget</option>
                                        <option value="medium">Moderate</option>
                                        <option value="high">Luxury</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-2">Pace</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['relaxed', 'balanced', 'packed'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, pace: p })}
                                        className={`py-2 px-4 rounded-xl border capitalize transition-all ${formData.pace === p
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-medium'
                                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-[var(--text-h3)] font-bold text-center text-[var(--color-text)] font-serif">Interests</h2>
                        <p className="text-center text-stone-500 text-sm">Select at least 3 things you love.</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['History', 'Art', 'Food', 'Nature', 'Shopping', 'Nightlife', 'Relaxation', 'Adventure', 'Photography'].map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => toggleInterest(interest)}
                                    className={`py-3 px-4 rounded-xl border text-sm transition-all flex items-center justify-center gap-2 ${formData.interests.includes(interest)
                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-medium shadow-sm'
                                        : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mt-8">
                    {step > 1 && (
                        <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    )}
                    <Button type="submit" className="flex-1" disabled={step === 1 && !formData.destination}>
                        {step === 3 ? (
                            <>Generate Itinerary <Sparkles className="w-4 h-4 ml-2" /></>
                        ) : (
                            <>Next Step <ArrowRight className="w-4 h-4 ml-2" /></>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

// Helper icon component
const Sparkles = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
);
