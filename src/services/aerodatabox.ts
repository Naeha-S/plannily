const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'aerodatabox.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
    console.warn('Missing RapidAPI Key for Aerodatabox');
}

const HEADERS = {
    'x-rapidapi-host': RAPIDAPI_HOST,
    'x-rapidapi-key': RAPIDAPI_KEY,
};

export interface Flight {
    number: string;
    status: string;
    airline: string;
    departure: {
        airport: string;
        scheduledTime: string;
    };
    arrival: {
        airport: string;
        scheduledTime: string;
    };
}

export const getAirportFlights = async (
    airportCode: string,
    direction: 'Arrival' | 'Departure' | 'Both' = 'Both'
) => {
    // URL: https://aerodatabox.p.rapidapi.com/flights/airports/{codeType}/{code}?offsetMinutes=-120&durationMinutes=720&withLeg=true&direction=Both...
    const url = `https://${RAPIDAPI_HOST}/flights/airports/iata/${airportCode}?offsetMinutes=-120&durationMinutes=720&withLeg=true&direction=${direction}&withCancelled=true&withCodeshared=true&withCargo=false&withPrivate=false&withLocation=false`;

    try {
        const response = await fetch(url, { headers: HEADERS });
        if (!response.ok) {
            throw new Error(`Aerodatabox API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching airport flights:', error);
        throw error;
    }
};
