import { supabase } from './supabase';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const BASE_URL = 'https://api.unsplash.com';

export const getUnsplashImage = async (query: string): Promise<string> => {
    // 1. Check Cache
    try {
        const { data } = await supabase
            .from('place_images')
            .select('image_url')
            .eq('place_name', query.toLowerCase())
            .single();

        if (data && data.image_url) {
            return data.image_url;
        }
    } catch (_) {
        // Ignore cache errors and proceed to fetch
        console.warn('Cache check failed');
    }

    if (!UNSPLASH_ACCESS_KEY) {
        console.warn('Unsplash API Key missing, using placeholder');
        return `https://placehold.co/800x600?text=${encodeURIComponent(query)}`;
    }

    try {
        const response = await fetch(`${BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Unsplash Error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const imageUrl = data.results[0].urls.regular;

            // 2. Save to Cache (Fire and forget)
            supabase.from('place_images').insert({
                place_name: query.toLowerCase(),
                image_url: imageUrl
            }).then(({ error }) => {
                if (error) console.warn('Failed to cache image', error);
            });

            return imageUrl;
        }

        return `https://placehold.co/800x600?text=${encodeURIComponent(query)}`;
    } catch (error) {
        console.error('Error fetching Unsplash image:', error);
        return `https://placehold.co/800x600?text=${encodeURIComponent(query)}`;
    }
};
