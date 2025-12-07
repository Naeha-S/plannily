import { CacheService } from './cache';

const API_HOST = 'visa-requirement.p.rapidapi.com';
const BASE_URL = 'https://visa-requirement.p.rapidapi.com/v2/visa/check';

export interface VisaRequirement {
    country: string;
    requirement: string; // e.g. "Visa Required", "Visa Free", "e-Visa"
    days?: number;
    description?: string;
}

// Rate Limit Handling: Rotate keys to avoid 429s (Too Many Requests)
const API_KEYS = [
    import.meta.env.VITE_RAPIDAPI_KEY,                    // Key 1 (Primary)
    'ce172d82ffmsh54af2d86b07ed83p13f22bjsnd1dc8b41dd36', // Key 2 (Secondary)
    // Add any other keys here
].filter(Boolean); // Remove undefined/nulls

let currentKeyIndex = 0;

const getNextApiKey = () => {
    if (API_KEYS.length === 0) return '';
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
};

export const checkVisaRequirement = async (passportCountryCode: string, destinationCountryCode: string): Promise<VisaRequirement | null> => {
    // Generate a unique cache key
    const cacheKey = `visa_req_${passportCountryCode}_${destinationCountryCode}`;

    // 1. Check Cache
    const cached = CacheService.get<VisaRequirement>(cacheKey);
    if (cached) {
        // console.log(`[Visa] Serving from cache: ${passportCountryCode} -> ${destinationCountryCode}`);
        return cached;
    }

    try {
        const apiKey = getNextApiKey();
        console.log(`[Visa] Checking ${passportCountryCode}->${destinationCountryCode} using Key: ...${apiKey.slice(-4)}`);

        // Use FormData for application/x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('from', passportCountryCode);
        formData.append('to', destinationCountryCode);

        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': API_HOST,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        if (response.status === 429) {
            console.warn(`[Visa] 429 Rate Limit hit on key ...${apiKey.slice(-4)}. Suggest adding more keys.`);
            return null; // Fail gracefully for this request to not block UI
        }

        if (!response.ok) {
            console.warn(`[Visa API Error] ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        // Map new API response structure if needed (assuming similar structure for now)
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
        return null; // Return null on error so the UI can proceed without visa info
    }
};



export const isVisaFreeOrEasy = (requirement: string): boolean => {
    const req = requirement.toLowerCase();
    return req.includes('free') || req.includes('on arrival') || req.includes('eta') || req.includes('exempt') || req.includes('not required');
};
