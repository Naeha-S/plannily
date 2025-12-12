import { supabase } from '../supabase';
import { generateSmartAI, extractJson } from '../ai';

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
    // Modified to fetch images from 'place_images' table instead of 'image_url' column
    let query = supabase.from('destinations')
        .select(`
            *,
            place_images (
                url
            )
        `);

    const { data: candidates, error } = await query.limit(50); // Get top 50 candidates

    if (error) {
        console.error('Brain: DB Error', error);
        return [];
    }

    if (!candidates || candidates.length === 0) {
        console.warn('Brain: No candidates found in DB.');
        return [];
    }

    // Step 2: AI Ranking (The "Librarian Choice")
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

    Task: Select the top 3-5 matches for this user.
    
    For each selected destination, provide:
    1. "score": A relevance percentage (0-100).
    2. "reason": A single, punchy sentence explaining WHY this suits the user's specific vibe/interests.

    Strictly return ONLY a valid JSON array of objects:
    [
        { "id": "uuid", "score": 95, "reason": "Perfect because..." },
        ...
    ]
    `;

    try {
        const aiResponse = await generateSmartAI(prompt);
        const rankedItems = extractJson(aiResponse);

        if (!Array.isArray(rankedItems)) throw new Error('AI did not return array');

        // Step 3: Hydrate & Return
        const results = rankedItems
            .map((item: any) => {
                const candidate = candidates.find(c => c.id === item.id);
                if (!candidate) return null;

                // Resolve Image: Use place_images if available, else fallback
                let finalImage = candidate.image_url;
                if (candidate.place_images && candidate.place_images.length > 0) {
                    // Try to find a valid URL from the array
                    finalImage = candidate.place_images[0].url || finalImage;
                }

                return {
                    ...candidate,
                    // Inject AI metadata
                    matchScore: item.score || 85,
                    matchReason: item.reason || "Matches your travel vibe.",
                    image_url: finalImage // normalized property for frontend
                };
            })
            .filter(Boolean) as DestinationNode[];

        return results;

    } catch (aiError) {
        console.error('Brain: AI Ranking failed', aiError);
        // Fallback: Just return first 4 of candidates
        return candidates.slice(0, 4).map(c => ({
            ...c,
            // Fallback image logic for error case too
            image_url: (c.place_images && c.place_images.length > 0) ? c.place_images[0].url : c.image_url
        })) as DestinationNode[];
    }
};
