import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string) => {
    try {
        return Boolean(new URL(url));
    } catch (e) {
        return false;
    }
};

if (!supabaseUrl || !isValidUrl(supabaseUrl) || !supabaseKey) {
    console.warn('Missing or invalid Supabase URL or Key. Please check your .env file.');
}

// Export a client, but it might fail if used with invalid credentials. 
// However, the specific error "Invalid supabaseUrl" comes from the constructor validation.
// We can pass a fallback URL to avoid the immediate crash, but requests will fail.
// Or better, we can cast a mock object if credentials are bad, to let the UI render.

export const supabase = (supabaseUrl && isValidUrl(supabaseUrl) && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : createClient('https://placeholder.supabase.co', 'placeholder'); // Fallback to avoid crash


export const saveItinerary = async (itinerary: any, userId: string) => {
    const { data, error } = await supabase
        .from('itineraries')
        .insert([
            {
                user_id: userId,
                destination: itinerary.destination,
                data: itinerary,
                created_at: new Date().toISOString()
            }
        ])
        .select();

    if (error) throw error;
    return data;
};

export const getItineraries = async (userId: string) => {
    const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
};

export const updateProfile = async (userId: string, updates: any) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

