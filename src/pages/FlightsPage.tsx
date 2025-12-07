import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, MapPin, Calendar, Tag, Globe, Settings, ArrowRight, ClipboardCheck as Passport } from 'lucide-react';
import { Button } from '../components/common/Button';
import { searchSmartLayovers, type FlightOffer } from '../services/amadeus';
import { isVisaFreeOrEasy } from '../services/visa';

const FlightsPage = () => {
    // Search State
    const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
    const [searchParams, setSearchParams] = useState({
        origin: '',
        destination: new URLSearchParams(window.location.search).get('destination') || '',
        departureDate: '',
        returnDate: '',
        adults: 1,
        children: 0,
        travelClass: 'ECONOMY' as const,
        passportCountry: 'IN' // Default to Indian as user example
    });

    // Data State
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<FlightOffer[]>([]);
    const [searched, setSearched] = useState(false);
    const [selectedFlightID, setSelectedFlightID] = useState<string | null>(null);

    // Filter State
    const [filters, setFilters] = useState({
        maxPrice: 10000,
        stops: 'all', // all, direct, 1stop
        airlines: [] as string[]
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        setResults([]);
        setSelectedFlightID(null);

        try {
            const offers = await searchSmartLayovers(
                searchParams.origin.toUpperCase(),
                searchParams.destination.toUpperCase(),
                searchParams.departureDate,
                tripType === 'roundtrip' ? searchParams.returnDate : undefined,
                {
                    adults: searchParams.adults,
                    children: searchParams.children,
                    travelClass: searchParams.travelClass,
                    passportCountry: searchParams.passportCountry.toUpperCase()
                }
            );
            setResults(offers);
        } catch (error) {
            console.error('Search failed', error);
            alert('Failed to search flights. Please check your inputs and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Derived State: Filtered Results
    const filteredResults = results.filter(offset => {
        const price = parseFloat(offset.price.total);
        if (price > filters.maxPrice) return false;

        const segments = offset.itineraries[0].segments;
        const stops = segments.length - 1;
        if (filters.stops === 'direct' && stops > 0) return false;
        if (filters.stops === '1stop' && stops > 1) return false;

        return true;
    });

    return (
        <div className="min-h-screen bg-[var(--color-background)] selection:bg-[var(--color-primary)] selection:text-white">

            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] rounded-full bg-[var(--color-primary)]/5 blur-3xl opacity-50" />
                <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-400/5 blur-3xl opacity-50" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto pt-24 pb-12 px-4 md:px-8">

                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-5xl md:text-6xl font-black text-stone-900 mb-6 font-serif tracking-tight leading-tight">
                        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-indigo-600">Wings</span>
                    </h1>
                    <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        Discover flights that match your rhythm. We check visas and find smart layovers so you can explore more for less.
                    </p>
                </motion.div>

                {/* Search Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 md:p-8 mb-12 ring-1 ring-stone-900/5 relative overflow-hidden"
                >
                    {/* Panel Glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />

                    {/* Trip Type Tabs */}
                    <div className="flex gap-6 mb-8 border-b border-stone-100 pb-2">
                        <button
                            onClick={() => setTripType('oneway')}
                            className={`pb-4 text-sm font-bold transition-all relative ${tripType === 'oneway' ? 'text-[var(--color-primary)]' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            One Way
                            {tripType === 'oneway' && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--color-primary)]" />}
                        </button>
                        <button
                            onClick={() => setTripType('roundtrip')}
                            className={`pb-4 text-sm font-bold transition-all relative ${tripType === 'roundtrip' ? 'text-[var(--color-primary)]' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            Round Trip
                            {tripType === 'roundtrip' && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--color-primary)]" />}
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Wrapper for nice grid alignment */}

                        {/* Row 1: Route & Passport */}
                        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-1.5 relative group">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">From</label>
                                <div className="flex items-center px-4 py-3.5 bg-stone-50/50 rounded-2xl border border-stone-200 transition-all group-focus-within:ring-2 group-focus-within:ring-[var(--color-primary)] group-focus-within:border-transparent group-focus-within:bg-white shadow-sm">
                                    <MapPin className="text-stone-400 w-5 h-5 mr-3" />
                                    <input
                                        type="text"
                                        placeholder="Origin (e.g. MAA)"
                                        className="bg-transparent w-full outline-none uppercase font-bold text-stone-900 placeholder:font-normal placeholder:text-stone-400"
                                        value={searchParams.origin}
                                        onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
                                        maxLength={3}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 relative group">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">To</label>
                                <div className="flex items-center px-4 py-3.5 bg-stone-50/50 rounded-2xl border border-stone-200 transition-all group-focus-within:ring-2 group-focus-within:ring-[var(--color-primary)] group-focus-within:border-transparent group-focus-within:bg-white shadow-sm">
                                    <MapPin className="text-stone-400 w-5 h-5 mr-3" />
                                    <input
                                        type="text"
                                        placeholder="Dest (e.g. KUL)"
                                        className="bg-transparent w-full outline-none uppercase font-bold text-stone-900 placeholder:font-normal placeholder:text-stone-400"
                                        value={searchParams.destination}
                                        onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                                        maxLength={3}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 relative group">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Your Passport</label>
                                <div className="flex items-center px-4 py-3.5 bg-stone-50/50 rounded-2xl border border-stone-200 transition-all group-focus-within:ring-2 group-focus-within:ring-[var(--color-primary)] group-focus-within:border-transparent group-focus-within:bg-white shadow-sm">
                                    <Passport className="text-stone-400 w-5 h-5 mr-3" />
                                    <input
                                        type="text"
                                        placeholder="Country Code (e.g. IN)"
                                        className="bg-transparent w-full outline-none uppercase font-bold text-stone-900 placeholder:font-normal placeholder:text-stone-400"
                                        value={searchParams.passportCountry}
                                        onChange={(e) => setSearchParams({ ...searchParams, passportCountry: e.target.value })}
                                        maxLength={2}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Dates, Travelers, Class, Button */}
                        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-5 items-end">

                            <div className={`space-y-1.5 ${tripType === 'roundtrip' ? 'md:col-span-2' : 'md:col-span-1'}`}>
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Dates</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 flex items-center px-4 py-3.5 bg-stone-50/50 rounded-2xl border border-stone-200 transition-all focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:bg-white shadow-sm">
                                        <Calendar className="text-stone-400 w-4 h-4 mr-2" />
                                        <input
                                            type="date"
                                            className="bg-transparent w-full outline-none font-medium text-stone-900 text-sm"
                                            value={searchParams.departureDate}
                                            onChange={(e) => setSearchParams({ ...searchParams, departureDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    {tripType === 'roundtrip' && (
                                        <div className="flex-1 flex items-center px-4 py-3.5 bg-stone-50/50 rounded-2xl border border-stone-200 transition-all focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:bg-white shadow-sm">
                                            <input
                                                type="date"
                                                className="bg-transparent w-full outline-none font-medium text-stone-900 text-sm"
                                                value={searchParams.returnDate}
                                                onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-1 space-y-1.5">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Travelers</label>
                                <div className="flex items-center px-4 py-3.5 bg-stone-50/50 rounded-2xl border border-stone-200 transition-all focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:bg-white shadow-sm">
                                    <input
                                        type="number"
                                        min="1"
                                        max="9"
                                        className="bg-transparent w-full outline-none font-bold text-stone-900"
                                        value={searchParams.adults}
                                        onChange={(e) => setSearchParams({ ...searchParams, adults: parseInt(e.target.value) })}
                                    />
                                    <span className="text-xs font-medium text-stone-500 ml-1">Adults</span>
                                </div>
                            </div>

                            <div className="md:col-span-1 space-y-1.5">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Class</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-[52px] px-4 bg-stone-50/50 rounded-2xl border border-stone-200 outline-none font-bold text-stone-900 text-sm appearance-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white shadow-sm transition-all"
                                        value={searchParams.travelClass}
                                        onChange={(e) => setSearchParams({ ...searchParams, travelClass: e.target.value as any })}
                                    >
                                        <option value="ECONOMY">Economy</option>
                                        <option value="PREMIUM_ECONOMY">Premium Eco</option>
                                        <option value="BUSINESS">Business</option>
                                        <option value="FIRST">First Class</option>
                                    </select>
                                    <Settings className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <Button type="submit" className="w-full h-[52px] text-lg font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-lg shadow-stone-900/20 rounded-2xl transition-transform active:scale-[0.98]" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Start
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Find Flights <Plane className="w-5 h-5 -rotate-45" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </motion.div>

                {/* Main Content Area: Sidebar + Results */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Sidebar Filters */}
                    {searched && (
                        <div className="md:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-5 sticky top-24"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-stone-900 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-[var(--color-primary)]" /> Filters
                                    </h3>
                                    <button
                                        onClick={() => setFilters({ maxPrice: 10000, stops: 'all', airlines: [] })}
                                        className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                                    >
                                        Reset
                                    </button>
                                </div>

                                {/* Stops */}
                                <div className="mb-8">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Stops</h4>
                                    <div className="space-y-2.5">
                                        {['all', 'direct', '1stop'].map((opt) => (
                                            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${filters.stops === opt ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-stone-300 bg-white group-hover:border-[var(--color-primary)]'}`}>
                                                    {filters.stops === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="stops"
                                                    checked={filters.stops === opt}
                                                    onChange={() => setFilters({ ...filters, stops: opt })}
                                                    className="hidden"
                                                />
                                                <span className="text-sm font-medium text-stone-700 capitalize">
                                                    {opt === '1stop' ? 'Up to 1 stop' : opt}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-2">
                                    <div className="flex justify-between mb-3">
                                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Max Price</h4>
                                        <span className="text-sm font-bold text-stone-900">${filters.maxPrice}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="100"
                                        max="5000"
                                        step="50"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                                        className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Results System */}
                    <div className={searched ? "md:col-span-3" : "md:col-span-4"}>
                        {searched && filteredResults.length === 0 && !loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 text-stone-400 bg-white/50 rounded-3xl border border-stone-100 backdrop-blur-sm"
                            >
                                <Plane className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-medium">No flights found matching your criteria.</p>
                                <button onClick={() => setFilters({ maxPrice: 10000, stops: 'all', airlines: [] })} className="text-[var(--color-primary)] font-bold mt-2 hover:underline">Clear Filters</button>
                            </motion.div>
                        )}

                        <div className="space-y-5">
                            <AnimatePresence>
                                {filteredResults.map((offer, index) => {
                                    const isVisaEasy = offer.visaInfo ? isVisaFreeOrEasy(offer.visaInfo.requirement) : false;

                                    return (
                                        <motion.div
                                            key={offer.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`rounded-3xl border transition-all overflow-hidden ${selectedFlightID === offer.id
                                                ? 'bg-white ring-2 ring-[var(--color-primary)] shadow-xl z-10'
                                                : 'bg-white/80 hover:bg-white border-stone-100 hover:shadow-lg backdrop-blur-sm'
                                                }`}
                                        >
                                            {/* Main Card */}
                                            <div
                                                className="p-6 flex flex-col md:flex-row gap-6 cursor-pointer relative"
                                                onClick={() => setSelectedFlightID(selectedFlightID === offer.id ? null : offer.id)}
                                            >
                                                {/* Smart Badge */}
                                                {(offer.isSmartLayover) && (
                                                    // Animated gradient background
                                                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-[length:200%_100%] animate-shimmer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                                                )}

                                                <div className="flex-grow space-y-5">
                                                    {/* Header Badges */}
                                                    <div className="flex gap-2">
                                                        {offer.isSmartLayover && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                                                <Globe size={12} /> Smart Layover: {offer.layoverCity}
                                                            </span>
                                                        )}
                                                        {offer.visaInfo && (
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isVisaEasy
                                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                                : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                                }`}>
                                                                <Passport size={12} />
                                                                {offer.visaInfo.requirement} in {offer.visaInfo.country}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Itineraries Summary */}
                                                    {offer.itineraries.map((itinerary, i) => {
                                                        const segments = itinerary.segments;
                                                        const dep = segments[0].departure;
                                                        const arr = segments[segments.length - 1].arrival;
                                                        const stops = segments.length - 1;
                                                        const carrier = segments[0].carrierCode;

                                                        return (
                                                            <div key={i} className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 flex-shrink-0 p-2">
                                                                    <img
                                                                        src={`https://assets.duffel.com/img/airlines/for-light-background/${carrier}.svg`}
                                                                        alt={carrier}
                                                                        className="w-full h-full object-contain opacity-80"
                                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                                    />
                                                                </div>
                                                                <div className="flex-grow grid grid-cols-4 gap-4 items-center">
                                                                    <div className="col-span-1">
                                                                        <p className="text-2xl font-black text-stone-900 tracking-tight">{dep.iataCode}</p>
                                                                        <p className="text-xs font-bold text-stone-400">{new Date(dep.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                    </div>

                                                                    <div className="col-span-2 flex flex-col items-center px-2">
                                                                        <p className="text-xs font-bold text-stone-400 mb-1">{itinerary.duration.replace('PT', '').toLowerCase()}</p>
                                                                        <div className="w-full h-0.5 bg-stone-200 relative flex justify-center items-center">
                                                                            {/* Dots for stops */}
                                                                            {segments.length > 1 && <div className="w-2 h-2 bg-white border-2 border-stone-300 rounded-full z-10" />}
                                                                            <div className="absolute right-0 -mr-1">
                                                                                <Plane size={14} className="text-stone-300 rotate-90" />
                                                                            </div>
                                                                        </div>
                                                                        <p className={`text-xs mt-1 font-bold ${stops === 0 ? 'text-green-600' : 'text-stone-500'}`}>
                                                                            {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
                                                                        </p>
                                                                    </div>

                                                                    <div className="col-span-1 text-right">
                                                                        <p className="text-2xl font-black text-stone-900 tracking-tight">{arr.iataCode}</p>
                                                                        <p className="text-xs font-bold text-stone-400">{new Date(arr.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Price & Action */}
                                                <div className="flex flex-col justify-end items-end border-l border-stone-100 pl-6 border-dashed min-w-[140px]">
                                                    <div className="text-right mb-4">
                                                        <p className="text-xs font-bold text-stone-400 uppercase">Total Price</p>
                                                        <p className="text-3xl font-black text-stone-900 tracking-tight">{offer.price.currency} {offer.price.total}</p>
                                                    </div>
                                                    <Button className={`w-full text-sm h-10 shadow-lg ${selectedFlightID === offer.id ? 'bg-[var(--color-primary)]' : 'bg-stone-900 hover:bg-stone-800'}`}>
                                                        {selectedFlightID === offer.id ? 'Close Details' : 'View Deal'}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* EXPANDED DETAILS */}
                                            <AnimatePresence>
                                                {selectedFlightID === offer.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-stone-100 bg-stone-50/80 p-6 md:p-8"
                                                    >
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="text-lg font-bold text-stone-900">Flight Details</h4>
                                                            {offer.visaInfo && (
                                                                <div className="text-right">
                                                                    <p className="text-xs font-bold text-stone-500 uppercase">Visa Requirement</p>
                                                                    <p className="text-sm font-medium text-stone-800">{offer.visaInfo.description || offer.visaInfo.requirement}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-8">
                                                            {offer.itineraries.map((itinerary, i) => (
                                                                <div key={i} className="space-y-4">
                                                                    <p className="text-xs font-bold text-white bg-stone-900 inline-block px-2 py-1 rounded uppercase tracking-wider">
                                                                        {i === 0 ? 'Outbound' : 'Return'} • {itinerary.duration.replace('PT', '').toLowerCase()}
                                                                    </p>
                                                                    <div className="space-y-0">
                                                                        {itinerary.segments.map((seg, j) => (
                                                                            <div key={j} className="relative pl-8 pb-8 last:pb-0 border-l mb-0 last:border-l-0 border-stone-300 ml-2">
                                                                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-stone-300 border-2 border-white" />

                                                                                <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
                                                                                    <div className="flex-1">
                                                                                        <div className="flex items-center gap-3 mb-2">
                                                                                            <img src={`https://assets.duffel.com/img/airlines/for-light-background/${seg.carrierCode}.svg`} className="h-4 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                                                            <span className="text-xs font-bold text-stone-500">{seg.carrierCode} {seg.number}</span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-8">
                                                                                            <div>
                                                                                                <span className="text-2xl font-bold text-stone-900">{new Date(seg.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                                                <p className="text-xs font-bold text-stone-500">{seg.departure.iataCode}</p>
                                                                                            </div>
                                                                                            <ArrowRight className="text-stone-300 w-5 h-5" />
                                                                                            <div>
                                                                                                <span className="text-2xl font-bold text-stone-900">{new Date(seg.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                                                <p className="text-xs font-bold text-stone-500">{seg.arrival.iataCode}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-xs text-stone-500 font-medium bg-stone-50 px-3 py-2 rounded-lg">
                                                                                        {seg.cabin || 'Economy'} Class
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightsPage;
