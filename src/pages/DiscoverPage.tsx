import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiscoveryWizard } from '../components/discovery/DiscoveryWizard';
import { DestinationCard } from '../components/discovery/DestinationCard';
import type { Destination } from '../types';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { generateDestinations } from '../services/ai';

const DiscoverPage = () => {
    const navigate = useNavigate();
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [error, setError] = useState('');
    const [discoveryData, setDiscoveryData] = useState<any>(null);

    const handleDiscoveryComplete = async (data: any) => {
        setLoading(true);
        setError('');
        setDiscoveryData(data);
        try {
            const result = await generateDestinations(data);
            if (result && result.destinations) {
                setDestinations(result.destinations);
                setShowResults(true);
            } else {
                setError('Failed to generate recommendations. Please try again.');
            }
        } catch (err) {
            setError('Something went wrong. Please check your connection and try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setShowResults(false);
        setDestinations([]);
        setError('');
        setDiscoveryData(null);
    };

    const handleSelectDestination = (id: string) => {
        const selectedDest = destinations.find(d => d.id === id);
        if (selectedDest && discoveryData) {
            navigate('/plan', {
                state: {
                    destination: selectedDest.name,
                    preferences: discoveryData,
                    preSelectedDestination: selectedDest // Pass full object if needed
                }
            });
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
                <h2 className="mt-8 text-[var(--text-h2)] font-bold text-[var(--color-text)] font-serif">Consulting our AI travel experts...</h2>
                <p className="text-[var(--text-body)] text-stone-500 mt-2">Analyzing your vibes, checking weather, and finding hidden gems.</p>
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

    if (showResults) {
        return (
            <div className="container mx-auto px-6 max-w-7xl py-12 bg-[var(--color-background)]">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-[var(--text-h2)] font-bold text-[var(--color-text)] font-serif">Top Picks for You</h1>
                        <p className="text-[var(--text-body)] text-stone-600 mt-2">Based on your unique travel profile.</p>
                    </div>
                    <Button variant="outline" onClick={handleReset}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {destinations.map((dest, index) => (
                        <DestinationCard
                            key={dest.id}
                            destination={dest}
                            rank={index + 1}
                            onSelect={handleSelectDestination}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 max-w-7xl py-12 bg-[var(--color-background)]">
            <div className="text-center mb-16">
                <h1 className="text-[var(--text-h1)] font-bold text-[var(--color-text)] mb-6 font-serif">Let's find your next trip</h1>
                <p className="text-[var(--text-h3)] text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
                    Answer a few quick questions and our AI will match you with the perfect destinations.
                </p>
            </div>

            <DiscoveryWizard onComplete={handleDiscoveryComplete} />
        </div>
    );
};

export default DiscoverPage;
