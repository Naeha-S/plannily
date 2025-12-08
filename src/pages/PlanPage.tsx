import { useState, useEffect } from 'react';
import { PlannerInput } from '../components/planner/PlannerInput';
import { ItineraryView } from '../components/planner/ItineraryView';
import type { ItineraryDay } from '../types';
import { Sparkles, AlertCircle, Plane, Save } from 'lucide-react';
import { generateItinerary, regenerateDay, generateMoreEvents } from '../services/ai';
import { checkHolidaysForDateRange } from '../services/holidays';
import { Button } from '../components/common/Button';
import { supabase, saveItinerary, getProfile } from '../services/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

const PlanPage = () => {
    const [planData, setPlanData] = useState<any>(null);
    const [requestData, setRequestData] = useState<any>(null);
    const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [flightStatus, setFlightStatus] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [hasAutoPlanned, setHasAutoPlanned] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                try {
                    const profileData = await getProfile(user.id);
                    setProfile(profileData);
                } catch (err) {
                    console.error('Error fetching profile', err);
                }
            }
        };
        getUser();
    }, []);

    // Handle auto-planning from Discover page
    useEffect(() => {
        if (location.state && location.state.destination && location.state.preferences && !hasAutoPlanned) {
            const { destination, preferences } = location.state;
            setHasAutoPlanned(true);

            // Construct plan request from discovery data
            const planRequest = {
                destination: destination,
                startDate: preferences.startDate,
                endDate: preferences.endDate,
                budget: preferences.budget,
                travelers: preferences.companions,
                interests: [...preferences.vibes, ...preferences.interests],
                travelStyle: preferences.travelStyle,
                origin: '', // Optional, not collected in Discover
                days: preferences.duration
            };

            handlePlan(planRequest);
        }
    }, [location.state, hasAutoPlanned]);

    // Check holidays when planData changes
    useEffect(() => {
        if (planData && planData.countryCode && requestData?.startDate && requestData?.days) {
            checkHolidaysForDateRange(planData.countryCode, requestData.startDate, requestData.days)
                .then(setHolidays)
                .catch(err => console.error('Error checking holidays:', err));
        }
    }, [planData, requestData]);

    const handlePlan = async (data: any) => {
        setRequestData(data); // Save context
        setLoading(true);
        setError('');
        setFlightStatus('Searching for flights...');

        try {
            // 1. Flight search skipped per user request
            setFlightStatus('Generating itinerary...');

            // 2. Generate Itinerary (passing flight info context if available)
            const aiRequest = {
                ...data,
                flightContext: 'Flight search disabled',
                userProfile: profile // Pass profile data to AI
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

    const handleLoadMoreEvents = async () => {
        if (!planData) return;
        setLoading(true);
        try {
            // Use the first day's date or a default
            const date = planData.days[0]?.date || new Date().toISOString().split('T')[0];
            const newEvents = await generateMoreEvents(planData.destination, date);

            setPlanData((prev: any) => ({
                ...prev,
                events: [...(prev.events || []), ...newEvents]
            }));
        } catch (err) {
            console.error('Failed to load more events', err);
            alert('Failed to load more events.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = (event: any, dayIndex: number) => {
        const newDays = [...itinerary];
        const day = newDays[dayIndex];

        // Create a new activity from the event
        const newActivity = {
            id: `evt-${Date.now()}`,
            name: event.name,
            type: event.type,
            startTime: '18:00', // Default time
            endTime: '20:00',
            description: event.description,
            location: event.location,
            cost: 0,
            imageUrl: event.imageUrl
        };

        day.activities.push(newActivity);
        setItinerary(newDays);
        setPlanData({ ...planData, days: newDays });
        alert(`Added ${event.name} to Day ${day.day}`);
    };

    const handleSaveTrip = async () => {
        if (!user) {
            alert('Please login to save your trip!');
            navigate('/login');
            return;
        }

        setSaving(true);
        try {
            await saveItinerary(planData, user.id);
            alert('Trip saved successfully!');
            navigate('/saved');
        } catch (err) {
            console.error('Error saving trip:', err);
            alert('Failed to save trip. Please try again.');
        } finally {
            setSaving(false);
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
                <div className="flex justify-end mb-4">
                    <Button onClick={handleSaveTrip} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Trip'}
                    </Button>
                </div>

                {holidays.length > 0 && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                        <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900">Public Holidays During Your Trip</h3>
                            <p className="text-sm text-amber-700 mb-2">Some shops or attractions might have different hours.</p>
                            <ul className="text-sm text-amber-800 list-disc list-inside">
                                {holidays.map((h, i) => (
                                    <li key={i}><span className="font-semibold">{h.date}</span>: {h.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <ItineraryView
                    destination={planData.destination}
                    days={itinerary}
                    events={planData.events}
                    onEdit={() => console.log('Edit')}
                    onRegenerateDay={handleRegenerateDay}
                    onLoadMoreEvents={handleLoadMoreEvents}
                    onAddEvent={handleAddEvent}
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
