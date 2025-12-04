import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

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
