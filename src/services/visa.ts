import { CacheService } from './cache';

const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const API_HOST = 'visa-requirement.p.rapidapi.com';
const BASE_URL = 'https://visa-requirement.p.rapidapi.com/v2/visa/check';

export interface VisaRequirement {
    country: string;
    requirement: string; // e.g. "Visa Required", "Visa Free", "e-Visa"
    days?: number;
    description?: string;
}

export const checkVisaRequirement = async (passportCountryCode: string, destinationCountryCode: string): Promise<VisaRequirement | null> => {
    // Generate a unique cache key
    const cacheKey = `visa_req_${passportCountryCode}_${destinationCountryCode}`;

    // 1. Check Cache
    const cached = CacheService.get<VisaRequirement>(cacheKey);
    if (cached) {
        console.log(`[Visa] Serving from cache: ${passportCountryCode} -> ${destinationCountryCode}`);
        return cached;
    }

    try {
        console.log(`[Visa] Fetching from API: ${passportCountryCode} -> ${destinationCountryCode}`);

        const response = await fetch(`${BASE_URL}?from=${passportCountryCode}&to=${destinationCountryCode}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        if (!response.ok) {
            console.warn(`[Visa API Error] ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        const result: VisaRequirement = {
            country: destinationCountryCode,
            requirement: data.status || data.category || 'Unknown',
            days: data.duration ? parseInt(data.duration) : undefined,
            description: data.text || ''
        };

        // 2. Save to Cache (24 hours TTL)
        CacheService.set(cacheKey, result, 1440);

        return result;

    } catch (error) {
        console.error('Failed to check visa requirement:', error);
        return null;
    }
};

export const isVisaFreeOrEasy = (requirement: string): boolean => {
    const req = requirement.toLowerCase();
    return req.includes('free') || req.includes('on arrival') || req.includes('eta') || req.includes('exempt') || req.includes('not required');
};
