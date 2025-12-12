export interface UserProfile {
    name: string;
    travelVibe: 'beach' | 'shopping' | 'food' | 'cultural' | 'relaxation' | 'party' | 'adventure';
    budget: 'low' | 'medium' | 'high' | 'luxury';
}

export interface Destination {
    id: string;
    name: string;
    country: string;
    countryCode?: string;
    description: string;
    imageUrl: string;
    matchScore: number;
    matchReason?: string;
    tags: string[];
    weather: {
        temp: number;
        condition: string;
    };
    costEstimate: number;
    visaInfo?: string;
}

export interface Activity {
    id: string;
    name: string;
    type: 'sightseeing' | 'food' | 'relaxation' | 'travel' | 'activity';
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    cost?: number;
    imageUrl?: string;
    travelTime?: string; // e.g., "15 mins walk"
    travelCost?: number; // e.g., 5 (USD)
    bookingRequired?: boolean;
}

export interface ItineraryDay {
    day: number;
    date?: string;
    theme?: string; // e.g., "Historical Deep Dive"
    activities: Activity[];
    totalCost?: number;
}

export interface TripEvent {
    id: string;
    name: string;
    date: string;
    description: string;
    location: string;
    type: 'festival' | 'concert' | 'exhibition' | 'sports' | 'other';
    imageUrl?: string;
}

export interface Itinerary {
    destination: string;
    days: ItineraryDay[];
    events?: TripEvent[];
    optimizationTips?: {
        type: 'swap' | 'timing' | 'saving' | 'alert';
        title: string;
        description: string;
        impact: string; // e.g., "Saves 2h travel"
    }[];
}
