import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Camera, Coffee, Mountain, Star, Plus, Check, ArrowRight, Sparkles, AlertCircle, X, Clock, Lightbulb, Zap, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { findLocalPlaces } from '../services/ai';

// --- Types ---
interface Place {
    id: string;
    name: string;
    description: string;
    type: 'photo' | 'food' | 'experience' | 'scenic' | 'gem';
    rating: number;
    image: string;
    saved?: boolean;
    timings?: string;
    viral_factor?: string;
    tips?: string;
}

interface SavedTrip {
    id: string;
    destination: string;
    days?: any[];
}

// --- Mock Data (Fallback) ---
const FALLBACK_PLACES: Place[] = [
    { id: '1', name: 'Rue Crémieux', description: 'Pastel-colored houses perfect for that dreamy shot.', type: 'photo', rating: 4.8, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800', viral_factor: 'Instagram favorite', timings: 'Open 24/7' },
    { id: '2', name: 'Le Consulat', description: 'Historic café in Montmartre. Iconic and cozy.', type: 'food', rating: 4.5, image: 'https://images.unsplash.com/photo-1550355191-aa8a80b41353?auto=format&fit=crop&q=80&w=800', tips: 'Go early to avoid crowds.' },
    { id: '3', name: 'Parc des Buttes-Chaumont', description: 'A hidden suspension bridge and temple with views.', type: 'gem', rating: 4.7, image: 'https://images.unsplash.com/photo-1596525934533-33983a3f5a5e?auto=format&fit=crop&q=80&w=800' },
    { id: '4', name: 'Sainte-Chapelle', description: 'Stained glass windows that take your breath away.', type: 'experience', rating: 4.9, image: 'https://images.unsplash.com/photo-1558257002-3cb5230bf866?auto=format&fit=crop&q=80&w=800' }
];

// --- Mock Saved Trips (Replace with real fetch if available) ---
const MOCK_TRIPS: SavedTrip[] = [
    { id: 't1', destination: 'Paris', days: [{ activities: [{ name: 'Eiffel Tower' }, { name: 'Louvre Museum' }] }] },
    { id: 't2', destination: 'Tokyo', days: [] },
    { id: 't3', destination: 'New York', days: [] }
];

// --- Components ---
const Card = ({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div onClick={onClick} className={`bg-white rounded-xl border border-stone-200 shadow-sm transition-all hover:shadow-md cursor-pointer ${className}`}>
        {children}
    </div>
);

const Badge = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${className}`}>
        {children}
    </span>
);

const PlaceModal = ({ place, onClose, onGenerateItinerary }: { place: Place, onClose: () => void, onGenerateItinerary: (placeName: string) => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center catch-click p-4">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-10"
        >
            <div className="relative h-64">
                <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors">
                    <X size={20} />
                </button>
                <div className="absolute bottom-4 left-4">
                    <h2 className="text-3xl font-black text-white drop-shadow-md">{place.name}</h2>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-indigo-100 text-indigo-700 capitalize">{place.type}</Badge>
                        <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm bg-yellow-50 px-2 py-0.5 rounded-full">
                            <Star size={12} fill="currentColor" /> {place.rating}
                        </div>
                    </div>
                    <p className="text-stone-600 leading-relaxed text-lg">{place.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {place.timings && (
                        <div className="bg-stone-50 p-3 rounded-xl flex items-start gap-3">
                            <Clock className="text-stone-400 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-stone-700 text-sm">Timings</h4>
                                <p className="text-stone-500 text-sm">{place.timings}</p>
                            </div>
                        </div>
                    )}
                    {place.viral_factor && (
                        <div className="bg-pink-50 p-3 rounded-xl flex items-start gap-3">
                            <Zap className="text-pink-500 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-pink-700 text-sm">Vital Factor</h4>
                                <p className="text-pink-600 text-sm">{place.viral_factor}</p>
                            </div>
                        </div>
                    )}
                </div>

                {place.tips && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                        <Lightbulb className="text-yellow-600 flex-shrink-0" size={20} />
                        <p className="text-yellow-800 text-sm italic">"{place.tips}"</p>
                    </div>
                )}

                <button
                    onClick={() => onGenerateItinerary(place.name)}
                    className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
                >
                    <Map size={18} />
                    Build Itinerary around this
                </button>
            </div>
        </motion.div>
    </div>
);

const LocalGuidePage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 800);
    const [results, setResults] = useState<Place[]>(FALLBACK_PLACES);
    const [savedIDs, setSavedIDs] = useState<Set<string>>(new Set());
    const [savedTrips] = useState<SavedTrip[]>(MOCK_TRIPS);
    const [selectedTripId, setSelectedTripId] = useState<string>('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

    // Initial Search if trip selected
    useEffect(() => {
        if (selectedTripId) {
            const trip = savedTrips.find(t => t.id === selectedTripId);
            if (trip) {
                setSearchTerm(trip.destination); // Pre-fill search
                // handleSearch(trip.destination, trip); // Trigger search immediately? Or wait for debounce?
                // Debounce will pick it up if we set searchTerm.
            }
        }
    }, [selectedTripId]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            const trip = savedTrips.find(t => t.id === selectedTripId);
            // Only use trip context if destination matches (sanity check)
            const contextTrip = (trip && trip.destination.toLowerCase() === debouncedSearchTerm.toLowerCase()) ? trip : undefined;
            handleSearch(debouncedSearchTerm, contextTrip);
        }
    }, [debouncedSearchTerm, selectedTripId]); // Re-run if trip changes too

    const handleSearch = async (term: string, tripContext?: SavedTrip) => {
        setIsSearching(true);
        setError('');
        try {
            const context = { savedTrip: tripContext };
            const data = await findLocalPlaces(term, context);
            if (data && data.length > 0) {
                setResults(data as Place[]);
            } else {
                setResults([]);
            }
        } catch (err) {
            console.error("AI Search Failed", err);
            setError("Couldn't connect to the travel mind. Showing some inspiration instead.");
            setResults(FALLBACK_PLACES);
        } finally {
            setIsSearching(false);
        }
    };

    const toggleSave = (id: string) => {
        const next = new Set(savedIDs);
        if (next.has(id)) {
            next.delete(id);
            // Maybe notification?
        } else {
            next.add(id);
            // Notification could replace console.log
        }
        setSavedIDs(next);
    };

    const handleGenerateItinerary = (destination: string) => {
        navigate('/plan', {
            state: {
                destination: destination,
                preferences: { /* Default prefs or let user fill? */ },
                step: 1 // Force user to fill details
            }
        });
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'photo': return { icon: Camera, color: 'bg-purple-100 text-purple-700 border-purple-200' };
            case 'food': return { icon: Coffee, color: 'bg-orange-100 text-orange-700 border-orange-200' };
            case 'scenic': return { icon: Mountain, color: 'bg-blue-100 text-blue-700 border-blue-200' };
            case 'gem': return { icon: Star, color: 'bg-pink-100 text-pink-700 border-pink-200' };
            default: return { icon: MapPin, color: 'bg-stone-100 text-stone-700 border-stone-200' };
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Modal */}
            <AnimatePresence>
                {selectedPlace && (
                    <PlaceModal
                        place={selectedPlace}
                        onClose={() => setSelectedPlace(null)}
                        onGenerateItinerary={handleGenerateItinerary}
                    />
                )}
            </AnimatePresence>

            {/* --- Hero Section --- */}
            <div className="relative h-[50vh] min-h-[500px] flex flex-col items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-200/30 rounded-full blur-[120px] mix-blend-multiply" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-200/30 rounded-full blur-[120px] mix-blend-multiply" />
                </div>

                <div className="relative z-10 max-w-3xl w-full text-center space-y-8">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <Badge className="bg-white/50 backdrop-blur-md border border-white/60 mb-6 text-stone-600 shadow-sm">
                            <Sparkles size={12} className="inline mr-1 text-indigo-500" />
                            AI-Powered Local Guide
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black text-stone-900 tracking-tight leading-tight mb-4 font-serif">
                            Discover the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Unseen World</span>
                        </h1>
                        <p className="text-lg text-stone-600 max-w-xl mx-auto font-medium leading-relaxed">
                            Find hidden gems not in your itinerary.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="relative max-w-2xl mx-auto space-y-4">
                        {/* Search Bar */}
                        <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2 border border-stone-100 z-20">
                            <Search className="ml-4 text-stone-400" size={20} />
                            <input
                                type="text"
                                placeholder="Where are you going?"
                                className="flex-1 h-12 px-4 bg-transparent outline-none text-lg text-stone-800 placeholder:text-stone-400 font-medium"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (selectedTripId) setSelectedTripId(''); // Clear selection if typing manually
                                }}
                            />
                            <button className="h-12 px-6 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2" disabled={isSearching}>
                                {isSearching ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                            </button>
                        </div>

                        {/* Saved Trips Selector */}
                        {savedTrips.length > 0 && (
                            <div className="flex gap-2 justify-center items-center flex-wrap">
                                <span className="text-stone-400 text-sm font-medium">Or explore based on a trip:</span>
                                {savedTrips.map(trip => (
                                    <button
                                        key={trip.id}
                                        onClick={() => setSelectedTripId(trip.id === selectedTripId ? '' : trip.id)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${selectedTripId === trip.id
                                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm'
                                            : 'bg-white/50 text-stone-600 border-stone-200 hover:bg-white'
                                            }`}
                                    >
                                        {trip.destination}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* --- Results Section --- */}
            <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                        {isSearching ? <Loader2 className="animate-spin text-indigo-500" /> : <MapPin className="text-stone-400" />}
                        {searchTerm ? `Hidden Gems in ${searchTerm}` : 'Curated Inspiration'}
                    </h2>
                    {!isSearching && searchTerm && results.length > 0 && (
                        <button onClick={() => handleGenerateItinerary(searchTerm)} className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                            <Plus size={16} /> Create full itinerary for {searchTerm}
                        </button>
                    )}
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                        <AlertCircle size={20} />
                        <p className="font-medium text-sm">{error}</p>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {results.map((place, index) => {
                            const typeConfig = getTypeConfig(place.type);
                            const TypeIcon = typeConfig.icon;
                            const isSaved = savedIDs.has(place.id);

                            return (
                                <motion.div
                                    key={place.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card onClick={() => setSelectedPlace(place)} className="h-full flex flex-col overflow-hidden group hover:-translate-y-1 duration-300">
                                        <div className="relative h-60 overflow-hidden bg-stone-100">
                                            <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-60" />
                                            <div className="absolute top-3 left-3">
                                                <Badge className={`${typeConfig.color} shadow-sm backdrop-blur-md bg-white/90`}>
                                                    <TypeIcon size={10} className="inline mr-1" />
                                                    {place.type}
                                                </Badge>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleSave(place.id); }}
                                                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md ${isSaved ? 'bg-green-500 text-white scale-110' : 'bg-white/30 text-white hover:bg-white/50'}`}
                                            >
                                                {isSaved ? <Check size={14} /> : <Plus size={16} />}
                                            </button>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-stone-900 leading-snug">{place.name}</h3>
                                                <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-yellow-50 px-2 py-0.5 rounded-md">
                                                    <Star size={10} className="fill-current" />
                                                    {place.rating}
                                                </div>
                                            </div>
                                            <p className="text-stone-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                                                {place.description}
                                            </p>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {!isSearching && results.length === 0 && !error && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 mb-2">No hidden gems found here</h3>
                        <p className="text-stone-500 mb-6">Try searching for a different city or check your spelling.</p>
                        <button onClick={() => handleGenerateItinerary(searchTerm || 'New Trip')} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                            Start Planning a Trip Here
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple loader component
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default LocalGuidePage;
