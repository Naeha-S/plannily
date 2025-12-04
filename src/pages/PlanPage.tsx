import { useState } from 'react';
import { PlannerInput } from '../components/planner/PlannerInput';
import { ItineraryView } from '../components/planner/ItineraryView';
import type { ItineraryDay } from '../types';
import { Sparkles, AlertCircle, Plane } from 'lucide-react';
import { generateItinerary, regenerateDay } from '../services/ai';
import { searchFlights } from '../services/amadeus';
import { Button } from '../components/common/Button';

const PlanPage = () => {
    const [planData, setPlanData] = useState<any>(null);
    const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [flightStatus, setFlightStatus] = useState<string>('');

    const handlePlan = async (data: any) => {
        setLoading(true);
        setError('');
        setFlightStatus('Searching for flights...');

        try {
            // 1. Search for flights
            const today = new Date().toISOString().split('T')[0];
            let flightData = null;
            try {
                flightData = await searchFlights(data.origin, data.destination, today);
                setFlightStatus('Flights found! Generating itinerary...');
            } catch (flightError) {
                console.warn('Flight search failed, proceeding with itinerary only:', flightError);
                setFlightStatus('Flight search unavailable. Generating itinerary...');
            }

            // 2. Generate Itinerary (passing flight info context if available)
            const aiRequest = {
                ...data,
                flightContext: flightData ? JSON.stringify(flightData.data?.slice(0, 3)) : 'No flight data available'
            };

            const result = await generateItinerary(aiRequest);

            if (result && result.days) {
                setPlanData(result);
                setItinerary(result.days);
            } else {
                setError('Failed to generate itinerary. Please try again.');
            }
        } catch (err) {
            setError('Something went wrong. Please check your connection and try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateDay = async (dayIndex: number) => {
        if (!planData) return;

        // Optimistic UI update or loading state could go here
        // For now, let's just show a loading toast or similar if we had one.
        // We'll use a simple alert or just rely on the UI updating eventually.
        // Better: Set a local loading state for that day if possible, but for now global loading is safer.
        setLoading(true);

        try {
            const newDay = await regenerateDay(planData, dayIndex);

            const newDays = [...itinerary];
            newDays[dayIndex] = newDay;

            setItinerary(newDays);
            setPlanData({ ...planData, days: newDays });
        } catch (err) {
            console.error('Failed to regenerate day', err);
            alert('Failed to regenerate day. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[var(--color-background)]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-stone-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[var(--color-primary)] animate-pulse" />
                    </div>
                </div>
                <h2 className="mt-8 text-[var(--text-h2)] font-bold text-[var(--color-text)] font-serif">Crafting your itinerary...</h2>
                <p className="text-[var(--text-body)] text-stone-500 mt-2">Optimizing routes, checking opening times, and finding hidden gems.</p>
                {flightStatus && (
                    <div className="mt-4 flex items-center text-sm text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-2 rounded-full">
                        <Plane className="w-4 h-4 mr-2 animate-bounce" />
                        {flightStatus}
                    </div>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-[var(--color-background)]">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-[var(--text-h2)] font-bold text-[var(--color-text)] mb-2 font-serif">Oops! Hiccup in the plan.</h2>
                <p className="text-[var(--text-body)] text-stone-600 mb-8">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        );
    }

    if (planData) {
        return (
            <div className="container mx-auto px-6 max-w-7xl py-12 bg-[var(--color-background)]">
                <ItineraryView
                    destination={planData.destination}
                    days={itinerary}
                    events={planData.events}
                    onEdit={() => console.log('Edit')}
                    onRegenerateDay={handleRegenerateDay}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 max-w-7xl py-12 bg-[var(--color-background)]">
            <div className="text-center mb-16">
                <h1 className="text-[var(--text-h1)] font-bold text-[var(--color-text)] mb-6 font-serif">Plan your perfect trip</h1>
                <p className="text-[var(--text-h3)] text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
                    Tell us where and when, and we'll handle the details.
                </p>
            </div>

            <PlannerInput onPlan={handlePlan} />
        </div>
    );
};

export default PlanPage;
