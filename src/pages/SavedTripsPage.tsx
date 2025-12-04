import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';

const SavedTripsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-6 max-w-7xl py-12">
            <h1 className="text-[var(--text-h2)] font-bold text-[var(--color-text)] mb-8 font-serif">Saved Trips</h1>

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
        </div>
    );
};

export default SavedTripsPage;
