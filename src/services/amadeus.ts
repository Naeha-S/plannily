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

export const searchFlights = async (origin: string, destination: string, date: string) => {
    try {
        const token = await getAccessToken();
        const url = `${BASE_URL}/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&adults=1&max=5`;

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
