import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Camera, Coffee, Mountain, Star, Plus, Check } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useDebounce } from '../hooks/useDebounce';

// Types
interface Place {
    id: string;
    name: string;
    description: string;
    type: 'photo' | 'food' | 'experience' | 'scenic' | 'gem';
    rating: number;
    image: string;
    saved?: boolean;
}

interface MockData {
    [city: string]: Place[];
}

// Mock Data specialized for visual vibes
const MOCK_PLACES: MockData = {
    'PARIS': [
        { id: '1', name: 'Rue Crémieux', description: 'Pastel-colored houses perfect for that dreamy shot.', type: 'photo', rating: 4.8, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800' },
        { id: '2', name: 'Le Consulat', description: 'Historic café in Montmartre. Iconic and cozy.', type: 'food', rating: 4.5, image: 'https://images.unsplash.com/photo-1550355191-aa8a80b41353?auto=format&fit=crop&q=80&w=800' },
        { id: '3', name: 'Parc des Buttes-Chaumont', description: 'A hidden suspension bridge and temple with views.', type: 'gem', rating: 4.7, image: 'https://images.unsplash.com/photo-1596525934533-33983a3f5a5e?auto=format&fit=crop&q=80&w=800' },
        { id: '4', name: 'Sainte-Chapelle', description: 'Stained glass windows that take your breath away.', type: 'experience', rating: 4.9, image: 'https://images.unsplash.com/photo-1558257002-3cb5230bf866?auto=format&fit=crop&q=80&w=800' }
    ],
    'TOKYO': [
        { id: '11', name: 'Omoide Yokocho', description: 'Atmospheric "Memory Lane" filled with yakitori stalls.', type: 'food', rating: 4.6, image: 'https://images.unsplash.com/photo-1551641506-ee5bf4cb4d21?auto=format&fit=crop&q=80&w=800' },
        { id: '12', name: 'Gotokuji Temple', description: 'The hidden temple filled with thousands of lucky cats.', type: 'gem', rating: 4.8, image: 'https://images.unsplash.com/photo-1583921727750-f8d9c22d7d78?auto=format&fit=crop&q=80&w=800' },
        { id: '13', name: 'Shibuya Sky', description: 'Glass-walled observation deck for epic city views.', type: 'scenic', rating: 4.9, image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=800' }
    ]
};

const DEFAULT_PLACES = MOCK_PLACES['PARIS'];

const LocalGuidePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 800);
    const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
    const [results, setResults] = useState<Place[]>(DEFAULT_PLACES);
    const [savedIDs, setSavedIDs] = useState<Set<string>>(new Set());
    const [isSearching, setIsSearching] = useState(false);

    // Effect to trigger search when debounced term changes
    useEffect(() => {
        if (debouncedSearchTerm) {
            performSearch(debouncedSearchTerm);
        } else if (debouncedSearchTerm === '') {
            // Optional: reset or show default? 
            // setResults(DEFAULT_PLACES);
        }
    }, [debouncedSearchTerm]);

    const performSearch = (term: string) => {
        setIsSearching(true);
        // Simulate search delay (or API call in future)
        setTimeout(() => {
            const key = term.toUpperCase();
            if (MOCK_PLACES[key]) {
                setResults(MOCK_PLACES[key]);
            } else {
                setResults(DEFAULT_PLACES);
            }
            setIsSearching(false);
        }, 500);
    };

    const handleManualSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchTerm);
    };

    const toggleSave = (id: string) => {
        const next = new Set(savedIDs);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSavedIDs(next);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'photo': return <Camera size={14} />;
            case 'food': return <Coffee size={14} />;
            case 'scenic': return <Mountain size={14} />;
            case 'gem': return <Star size={14} />;
            default: return <MapPin size={14} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'photo': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'food': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'scenic': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'gem': return 'text-pink-600 bg-pink-50 border-pink-100';
            default: return 'text-stone-600 bg-stone-50 border-stone-100';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            {/* Hero / Search Section */}
            <div className="relative bg-stone-900 pt-32 pb-24 px-4 overflow-hidden">
                {/* Abstract Background */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-serif">
                            Unlock the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-400">Local Magic</span>
                        </h1>
                        <p className="text-lg text-stone-300 max-w-2xl mx-auto">
                            Find hidden gems, aesthetic spots, and authentic eats in any city.
                            Curated by AI, verified by locals.
                        </p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleManualSearch}
                        className="max-w-xl mx-auto relative group"
                    >
                        <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-2 transition-all group-focus-within:bg-white/20 group-focus-within:ring-2 group-focus-within:ring-white/30">
                            <Search className="text-stone-300 ml-3 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Where are you right now? (e.g. Paris)"
                                className="w-full bg-transparent border-none outline-none text-white placeholder:text-stone-400 font-medium px-4 py-3"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button type="submit" className="bg-white text-stone-900 hover:bg-stone-100 font-bold rounded-xl px-6 py-3">
                                {isSearching ? 'Searching...' : 'Explore'}
                            </Button>
                        </div>
                    </motion.form>

                    {/* Quick Chips */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 flex flex-wrap justify-center gap-2"
                    >
                        {['My Trips', 'Paris', 'Tokyo', 'London', 'New York'].map((city) => (
                            <button
                                key={city}
                                onClick={() => {
                                    if (city === 'My Trips') return; // Logic for saved trips shortcut
                                    setSearchTerm(city);
                                    // Trigger mocked search immediately for UX
                                }}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${city === 'My Trips' ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/30' : 'bg-white/5 text-stone-300 border border-white/10 hover:bg-white/10'}`}
                            >
                                {city}
                            </button>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-12 -mt-10 relative z-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                        {isSearching ? 'Scouting the best spots...' : `Top Picks ${searchTerm ? `for ${searchTerm}` : ''}`}
                    </h2>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg p-1 shadow-sm border border-stone-100 hidden md:flex">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            Curated
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'saved' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            Saved Items
                        </button>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {results.map((place, index) => (
                            <motion.div
                                key={place.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                {/* Image */}
                                <div className="h-64 w-full relative overflow-hidden">
                                    <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-60" />

                                    {/* Rating Badge */}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                        <Star size={12} className="text-yellow-500 fill-yellow-500" /> {place.rating}
                                    </div>

                                    {/* Type Badge */}
                                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm ${getTypeColor(place.type)} bg-white`}>
                                        {getTypeIcon(place.type)} {place.type}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-stone-900 mb-2 leading-tight">{place.name}</h3>
                                    <p className="text-sm text-stone-500 leading-relaxed mb-6 line-clamp-2">
                                        {place.description}
                                    </p>

                                    {/* Action */}
                                    <button
                                        onClick={() => toggleSave(place.id)}
                                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${savedIDs.has(place.id)
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                            : 'bg-stone-900 text-white hover:bg-stone-800'
                                            }`}
                                    >
                                        {savedIDs.has(place.id) ? (
                                            <> <Check size={16} /> Added to Itinerary </>
                                        ) : (
                                            <> <Plus size={16} /> Save to Itinerary </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {results.length === 0 && (
                    <div className="text-center py-20 text-stone-400">
                        <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No spots found. Try searching for Paris or Tokyo.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocalGuidePage;
