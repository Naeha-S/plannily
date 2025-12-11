
export interface AgentTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
}

export const AGENT_TOOLS: Record<string, AgentTool> = {
    updateItinerary: {
        name: 'updateItinerary',
        description: 'Modify the current itinerary based on user request (e.g., reorder, replace activity).',
        parameters: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['reorder', 'replace', 'add', 'regenerate_day'] },
                dayIndex: { type: 'number', description: 'The day index to modify (0-based)' },
                details: { type: 'string', description: 'Context or specific instructions for the update' }
            },
            required: ['action', 'dayIndex']
        }
    },
    getFlights: {
        name: 'getFlights',
        description: 'Search for flights between two locations.',
        parameters: {
            type: 'object',
            properties: {
                origin: { type: 'string', description: 'IATA code or city name for origin' },
                destination: { type: 'string', description: 'IATA code or city name for destination' },
                date: { type: 'string', description: 'Departure date YYYY-MM-DD' }
            },
            required: ['origin', 'destination']
        }
    },
    addToSaved: {
        name: 'addToSaved',
        description: 'Save a specific item (place, event, or note) to the user\'s saved items or current trip.',
        parameters: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['place', 'flight', 'note', 'event'] },
                data: { type: 'object', description: 'The data to save' }
            },
            required: ['type', 'data']
        }
    },
    getNearbyPlaces: {
        name: 'getNearbyPlaces',
        description: 'Find places of interest nearby a location or based on a specific category/vibe.',
        parameters: {
            type: 'object',
            properties: {
                category: { type: 'string', description: 'food, cafe, museum, park, etc.' },
                location: { type: 'string', description: 'City or specific area' },
                vibe: { type: 'string', description: 'aesthetic, quiet, lively, etc.' }
            },
            required: ['location']
        }
    },
    monitorPrices: {
        name: 'monitorPrices',
        description: 'Set up a price alert for a flight or activity.',
        parameters: {
            type: 'object',
            properties: {
                targetPrice: { type: 'number' },
                itemId: { type: 'string' },
                type: { type: 'string', enum: ['flight', 'hotel'] }
            },
            required: ['targetPrice']
        }
    }
};
