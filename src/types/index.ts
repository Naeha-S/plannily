export interface UserProfile {
    name: string;
    travelVibe: 'beach' | 'shopping' | 'food' | 'cultural' | 'relaxation' | 'party' | 'adventure';
    budget: 'low' | 'medium' | 'high' | 'luxury';
}

export interface Destination {
    id: string;
    name: string;
    country: string;
    description: string;
    imageUrl: string;
    matchScore: number;
    tags: string[];
    weather: {
        temp: number;
        condition: string;
    };
    costEstimate: number;
}

export interface ItineraryDay {
    day: number;
    date?: string;
    activities: Activity[];
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
}
