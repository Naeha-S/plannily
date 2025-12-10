const API_KEY = '5ae2e3f221c38a28845f05b6c62ecf36483a830d0039745715f5e95d';
const BASE_URL = 'https://api.opentripmap.com/0.1/en';

interface Coordinates {
    lat: number;
    lon: number;
}

interface Place {
    xid: string;
    name: string;
    rate: number;
    kinds: string;
    point: {
        lon: number;
        lat: number;
    };
    dist?: number;
}

interface PlaceDetails {
    xid: string;
    name: string;
    address: any;
    rate: string;
    kinds: string;
    image?: string;
    preview?: {
        source: string;
    };
    wikipedia_extracts?: {
        text: string;
    };
    point: {
        lon: number;
        lat: number;
    };
}

export const getCoordinates = async (placeName: string): Promise<Coordinates | null> => {
    try {
        const response = await fetch(`${BASE_URL}/places/geoname?name=${encodeURIComponent(placeName)}&apikey=${API_KEY}`);
        const data = await response.json();
        if (data && data.lat && data.lon) {
            return { lat: data.lat, lon: data.lon };
        }
        return null;
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null;
    }
};

export const getPlacesNearby = async (lat: number, lon: number, radius: number = 1000, limit: number = 10, kinds: string = 'interesting_places'): Promise<Place[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=${kinds}&rate=2&format=json&limit=${limit}&apikey=${API_KEY}`
        );
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error fetching nearby places:', error);
        return [];
    }
};

export const getPlaceDetails = async (xid: string): Promise<PlaceDetails | null> => {
    try {
        const response = await fetch(`${BASE_URL}/places/xid/${xid}?apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching place details:', error);
        return null;
    }
};

export const searchAutosuggest = async (query: string, lat?: number, lon?: number): Promise<any[]> => {
    try {
        let url = `${BASE_URL}/places/autosuggest?name=${encodeURIComponent(query)}&radius=5000&apikey=${API_KEY}`;
        if (lat && lon) {
            url += `&lat=${lat}&lon=${lon}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error in autosuggest:', error);
        return [];
    }
};
