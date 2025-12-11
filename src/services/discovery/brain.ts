import { supabase } from '../supabase';
import { generateSmartAI } from '../ai';

export interface DestinationNode {
    id: string;
    name: string;
    country: string;
    region: string;
    type: string;
    tags: string[];
    best_months: string[];
    description: string;
    image_url: string;
}

// "Librarian" Logic: 1. Filter DB -> 2. AI Rank -> 3. Return
export const matchDestinations = async (preferences: any): Promise<DestinationNode[]> => {
    console.log('Brain: Starting retrieval for', preferences);

    // Step 1: Broad Filter from Supabase (The "Shelf Search")
    // If user has specific constraints like "Asia" or "Budget < 2000", apply them here.
    // For now, we fetch a broader set to let AI refine, or strictly if filters are hard.
    let query = supabase.from('destinations').select('*');

    // Example strict filters if present in preferences
    // if (preferences.region) query = query.eq('region', preferences.region);

    // We can also filter by month if we calculated it
    // const month = new Date(preferences.startDate).toLocaleString('default', { month: 'short' });
    // if (month) query = query.contains('best_months', [month]);

    const { data: candidates, error } = await query.limit(50); // Get top 50 candidates

    if (error) {
        console.error('Brain: DB Error', error);
        // Fallback or throw
        return [];
    }

    if (!candidates || candidates.length === 0) {
        console.warn('Brain: No candidates found in DB. Fallback to generative?');
        return [];
    }

    // Step 2: AI Ranking (The "Librarian Choice")
    // We pass the candidates (minified) to the AI to rank based on VIBE which DB can't fully query.

    // Minify for context window
    const shelf = candidates.map(d => ({
        id: d.id,
        name: `${d.name}, ${d.country}`,
        tags: d.tags,
        type: d.type,
        desc: d.description
    }));

    const prompt = `
    User Vibe: ${preferences.vibes.join(', ')}
    Interests: ${preferences.interests ? preferences.interests.join(', ') : ''}
    Travel Style: ${preferences.travelStyle}
    Budget: ${preferences.budget}
    Companions: ${preferences.companions}
    
    Here is the list of available destinations (candidates):
    ${JSON.stringify(shelf)}

    Task: Select the top 4-6 matches for this user.
    Rank them by relevance.
    
    Return ONLY a JSON array of the IDs:
    ["uuid1", "uuid2", ...]
    `;

    try {
        const aiResponse = await generateSmartAI(prompt);
        // Extract IDs
        const ids = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, '').trim());

        if (!Array.isArray(ids)) throw new Error('AI did not return array');

        // Step 3: Hydrate & Return
        // Map back to full objects in order
        const results = ids
            .map(id => candidates.find(c => c.id === id))
            .filter(Boolean) as DestinationNode[];

        return results;

    } catch (aiError) {
        console.error('Brain: AI Ranking failed', aiError);
        // Fallback: Just return first 4 of candidates
        return candidates.slice(0, 4) as DestinationNode[];
    }
};
