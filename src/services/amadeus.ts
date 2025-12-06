import { checkVisaRequirement, type VisaRequirement } from './visa';

const CLIENT_ID = import.meta.env.VITE_AMADEUS_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_AMADEUS_CLIENT_SECRET;
const BASE_URL = 'https://test.api.amadeus.com';

let accessToken: string | null = null;
let tokenExpiration: number = 0;

const getAccessToken = async () => {
    const now = Date.now();
    if (accessToken && now < tokenExpiration) {
        return accessToken;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    try {
        const response = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        if (!response.ok) {
            throw new Error(`Amadeus Auth Error: ${response.statusText}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        // Set expiration slightly before actual expiry (expires_in is in seconds)
        tokenExpiration = now + (data.expires_in - 60) * 1000;
        return accessToken;
    } catch (error) {
        console.error('Error getting Amadeus token:', error);
        throw error;
    }
};

export interface SearchOptions {
    adults?: number;
    children?: number;
    infants?: number;
    travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    nonStop?: boolean;
    currency?: string;
    passportCountry?: string; // ISO Code e.g. 'IN', 'US'
}

export const searchFlights = async (origin: string, destination: string, departureDate: string, returnDate?: string, options: SearchOptions = {}) => {
    try {
        const token = await getAccessToken();
        const {
            adults = 1,
            children = 0,
            infants = 0,
            travelClass,
            nonStop = false,
            currency = 'USD'
        } = options;

        let url = `${BASE_URL}/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}&children=${children}&infants=${infants}&nonStop=${nonStop}&currencyCode=${currency}&max=50`;

        if (returnDate) {
            url += `&returnDate=${returnDate}`;
        }

        if (travelClass) {
            url += `&travelClass=${travelClass}`;
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Amadeus Flight Search Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error searching flights:', error);
        throw error;
    }
};

export const searchHotels = async (cityCode: string) => {
    try {
        const token = await getAccessToken();
        // First get hotels in city
        const url = `${BASE_URL}/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=5&radiusUnit=KM&hotelSource=ALL`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Amadeus Hotel Search Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error searching hotels:', error);
        throw error;
    }
};

// Helper to calculate date + days
const addDays = (dateStr: string, days: number) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

export interface FlightOffer {
    id: string;
    type: string;
    price: { total: string; currency: string };
    itineraries: {
        duration: string;
        segments: {
            cabin: string;
            departure: { iataCode: string; at: string };
            arrival: { iataCode: string; at: string };
            carrierCode: string;
            number: string;
        }[];
    }[];
    validatingAirlineCodes: string[];
    travelerPricings: {
        fareOption: string;
        travelerType: string;
        price: { currency: string; total: string };
        fareDetailsBySegment: {
            segmentId: string;
            cabin: string;
            includedCheckedBags: { quantity: number };
        }[];
    }[];
    isSmartLayover?: boolean;
    layoverCity?: string;
    layoverDuration?: string;
    savings?: string;
    visaInfo?: VisaRequirement;
}

const HUB_COUNTRY_MAP: Record<string, string> = {
    'DXB': 'AE', 'DOH': 'QA', 'SIN': 'SG', 'BKK': 'TH', 'IST': 'TR',
    'LHR': 'GB', 'FRA': 'DE', 'AMS': 'NL', 'HKG': 'HK', 'NRT': 'JP',
    'JFK': 'US', 'LAX': 'US', 'KUL': 'MY'
};

export const searchSmartLayovers = async (origin: string, destination: string, departureDate: string, returnDate?: string, options: SearchOptions = {}) => {
    try {
        console.log(`Searching flights (smart) for ${origin} -> ${destination} on ${departureDate}`);

        const directSearchPromise = searchFlights(origin, destination, departureDate, returnDate, options);

        let layoverPromises: Promise<FlightOffer | null>[] = [];

        if (!returnDate) {
            // Priority list of hubs to check for smart connections
            // Middle East & SE Asia are great connectors for visa-free stopovers (e.g. Dubai, Singapore, Bangkok, Istanbul)
            const priorityHubs = ['DXB', 'DOH', 'SIN', 'BKK', 'IST', 'LHR', 'FRA', 'HKG'];

            // Filter out origin/dest and take top 5
            const hubsToCheck = priorityHubs.filter(h => h !== origin && h !== destination).slice(0, 5);

            layoverPromises = hubsToCheck.map(async (hub) => {
                try {
                    // Check Visa first if passport is provided
                    let visaInfo: VisaRequirement | null = null;
                    if (options.passportCountry) {
                        const hubCountry = HUB_COUNTRY_MAP[hub];
                        if (hubCountry) {
                            visaInfo = await checkVisaRequirement(options.passportCountry, hubCountry);
                        }
                    }

                    // Leg 1: Origin -> Hub
                    const leg1 = await searchFlights(origin, hub, departureDate, undefined, options);
                    if (!leg1.data || leg1.data.length === 0) return null;

                    // Leg 2: Hub -> Destination (Next Day)
                    const nextDay = addDays(departureDate, 1);
                    const leg2 = await searchFlights(hub, destination, nextDay, undefined, options);
                    if (!leg2.data || leg2.data.length === 0) return null;

                    const bestLeg1 = leg1.data[0];
                    const bestLeg2 = leg2.data[0];
                    const totalPrice = parseFloat(bestLeg1.price.total) + parseFloat(bestLeg2.price.total);

                    return {
                        id: `smart-${hub}-${Date.now()}`,
                        type: 'smart-layover',
                        price: {
                            total: totalPrice.toFixed(2),
                            currency: bestLeg1.price.currency
                        },
                        itineraries: [
                            ...bestLeg1.itineraries,
                            ...bestLeg2.itineraries
                        ],
                        validatingAirlineCodes: bestLeg1.validatingAirlineCodes,
                        isSmartLayover: true,
                        layoverCity: hub,
                        layoverDuration: '24h+',
                        visaInfo: visaInfo || undefined,
                        travelerPricings: [] // Mock
                    } as FlightOffer;

                } catch (e) {
                    // console.warn(`Failed to check hub ${hub}`, e);
                    return null;
                }
            });
        }

        const [directResults, ...layoverResults] = await Promise.all([
            directSearchPromise,
            ...layoverPromises
        ]);

        const validLayovers = layoverResults.filter(r => r !== null) as FlightOffer[];
        const standardOffers = (directResults.data || []) as FlightOffer[];

        // Combine and sort by price
        const allOffers = [...standardOffers, ...validLayovers].sort((a, b) =>
            parseFloat(a.price.total) - parseFloat(b.price.total)
        );

        return allOffers;

    } catch (error) {
        console.error('Error in smart layover search:', error);
        throw error;
    }
};
