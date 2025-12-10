import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, Calendar, Loader2, Play } from 'lucide-react';
import { Button } from '../components/common/Button';
import { supabase, getItineraries } from '../services/supabase';
import { ItineraryView } from '../components/planner/ItineraryView';

const SavedTripsPage = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            fetchTrips(user.id);
        };
        checkUser();
    }, [navigate]);

    const fetchTrips = async (userId: string) => {
        try {
            const data = await getItineraries(userId);
            setTrips(data || []);
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (selectedTrip) {
        return (
            <div className="container mx-auto px-6 max-w-7xl py-12">
                <Button variant="outline" onClick={() => setSelectedTrip(null)} className="mb-6">
                    <ArrowRight className="rotate-180 mr-2 h-4 w-4" /> Back to Trips
                </Button>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-serif font-bold">{selectedTrip.destination}</h2>
                    <Button
                        className="bg-stone-900 text-white hover:bg-black"
                        onClick={() => navigate('/dashboard', {
                            state: {
                                destination: selectedTrip.destination,
                                days: selectedTrip.data.days,
                                events: selectedTrip.data.events
                            }
                        })}
                    >
                        <Play className="w-4 h-4 mr-2 fill-current" /> Start Trip Mode
                    </Button>
                </div>
                <ItineraryView
                    destination={selectedTrip.destination}
                    days={selectedTrip.data.days}
                    events={selectedTrip.data.events}
                    onEdit={() => { }}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 max-w-7xl py-12">
            <h1 className="text-[var(--text-h2)] font-bold text-[var(--color-text)] mb-8 font-serif">Saved Trips</h1>

            {trips.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50">
                    <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center mb-6">
                        <Briefcase className="h-8 w-8 text-stone-400" />
                    </div>
                    <h2 className="text-[var(--text-h3)] font-semibold text-[var(--color-text)] mb-3">No trips saved yet</h2>
                    <p className="text-[var(--text-body)] text-stone-500 max-w-md text-center mb-8">
                        Create your first trip by clicking 'Start planning' to get started. Your itineraries will appear here.
                    </p>
                    <Button onClick={() => navigate('/plan')}>
                        Start planning <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                        <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTrip(trip)}>
                            <div className="h-48 bg-stone-200 relative">
                                {trip.data.days[0]?.activities[0]?.imageUrl && (
                                    <img src={trip.data.days[0].activities[0].imageUrl} alt={trip.destination} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                                    {trip.data.days.length} Days
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-stone-900 mb-2">{trip.destination}</h3>
                                <div className="flex items-center text-stone-500 text-sm mb-4">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date(trip.created_at).toLocaleDateString()}
                                </div>
                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full">View Itinerary</Button>
                                    <Button
                                        className="w-full bg-stone-900 text-white hover:bg-black"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/dashboard', {
                                                state: {
                                                    destination: trip.destination,
                                                    days: trip.data.days,
                                                    events: trip.data.events
                                                }
                                            });
                                        }}
                                    >
                                        <Play className="w-4 h-4 mr-2 fill-current" /> Open Dashboard
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedTripsPage;
