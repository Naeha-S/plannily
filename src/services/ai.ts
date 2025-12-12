import { supabase } from './supabase';
import { GeminiService } from './gemini';
import { getUnsplashImage } from './unsplash';
import { OpenAIService } from './openai';
import { HuggingFaceService } from './huggingface';
import { STANDARD_DESTINATIONS } from '../data/standardDestinations';

// --- Exported Services ---

export const extractJson = (text: string) => {
  try {
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // Attempt to extract the first outer JSON object or array
    const firstObj = clean.indexOf('{');
    const firstArr = clean.indexOf('[');

    // Check which comes first to decide if it's object or array
    let start = -1;
    let end = -1;

    // If both exist, take the earlier one. If only one exists, take that.
    if (firstObj !== -1 && (firstArr === -1 || firstObj < firstArr)) {
      start = firstObj;
      end = clean.lastIndexOf('}');
    } else if (firstArr !== -1) {
      start = firstArr;
      end = clean.lastIndexOf(']');
    }

    if (start !== -1 && end !== -1) {
      clean = clean.substring(start, end + 1);
    }

    return JSON.parse(clean);
  } catch (e) {
    console.error('JSON Parse failed', e);
    // Silent fail/return empty to avoid crashes
    return {};
  }
};

const saveToCache = async (destinations: any[]) => {
  if (!destinations.length) return;

  const cleanDests = destinations.map(d => ({
    name: d.name.split(',')[0].trim(),
    country: d.country || d.name.split(',')[1]?.trim() || 'Unknown',
    description: d.description,
    tags: d.tags || [],
    image_url: d.imageUrl,
    best_months: []
  }));

  for (const d of cleanDests) {
    try {
      const { data } = await supabase.from('destinations').select('id').eq('name', d.name).limit(1);
      if (!data?.length) {
        await supabase.from('destinations').insert(d);
      }
    } catch (err) {
      console.error('Cache save failed for', d.name, err);
    }
  }
};

// Smart Fallback Generator (Defaults to Llama 3.1 8B via HF Router)
// Smart Fallback Generator (Defaults to Llama 3.1 8B via HF Router)
export const generateSmartAI = async (prompt: string) => {
  // 1. Try Hugging Face (Llama 3.1 8B)
  try {
    // --- RE-INSERTED LLAMA CALL ---
    return await HuggingFaceService.chat(prompt);
  } catch (hfError: any) {
    console.warn(`Hugging Face (Llama) failed [${hfError.message}], switching to OpenAI 🟡`);

    // 2. Try OpenAI
    try {
      return await OpenAIService.generate(prompt);
    } catch (openAIError: any) {
      console.warn(`OpenAI failed [${openAIError.message}], switching to Gemini 🟢`);

      // 3. Try Gemini
      try {
        // --- RE-INSERTED GEMINI CALL ---
        return await GeminiService.generate(prompt);
      } catch (geminiError: any) {
        console.error('All AI models failed 🔴', geminiError);
        throw new Error('All AI services are currently unavailable.');
      }
    }
  }
};

export const generateDestinations = async (preferences: any) => {
  const nationalityClause = preferences.nationality
    ? `User Nationality: ${preferences.nationality}. Prioritize VISA-FREE or EASY VISA options.`
    : '';

  const prompt = `
    Task: Act as an expert Llama 3 travel agent.
    Generate exactly 15 travel destination recommendations based on this profile:
    
    Vibes: ${preferences.vibes.join(', ')}
    Interests: ${preferences.interests ? preferences.interests.join(', ') : ''}
    Companions: ${preferences.companions}
    Budget: ${preferences.budget}
    Dates: ${preferences.startDate} to ${preferences.endDate}
    Origin: ${preferences.origin}
    ${nationalityClause}

    STRUCTURE THE 15 RESULTS AS FOLLOWS:
    - 3 "PERFECT" MATCHES (100% aligned with vibes/interests)
    - 2 "DECENT" MATCHES (Good alternatives, maybe slightly different vibe)
    - 10 "TRAVEL HOTSPOTS" (Popular major destinations that generally fit, e.g., Paris, Tokyo, Bali)

    Return strictly valid JSON:
    {
      "destinations": [
        {
          "id": "generated_uuid", 
          "name": "City", 
          "country": "Country", 
          "countryCode": "ISO 2-letter",
          "description": "Why it fits.",
          "imageQuery": "Visual search term",
          "matchScore": number (80-100 for Perfect, 60-80 Decent, 50-90 Hotspots),
          "tags": ["tag1", "tag2"],
          "weather": { "temp": 25, "condition": "Sunny" },
          "costEstimate": 1500,
          "category": "perfect|decent|hotspot"
        }
      ]
    }
  `;

  try {
    const text = await generateSmartAI(prompt);
    const result = extractJson(text);
    let dests = result.destinations || [];

    // 1. Hydrate Images (Unsplash)
    dests = await Promise.all(dests.map(async (d: any) => ({
      ...d,
      imageUrl: await getUnsplashImage(d.imageQuery || d.name)
    })));

    // 2. Cache to DB
    await saveToCache(dests);

    return { destinations: dests };
  } catch (error) {
    console.error('Error generating destinations:', error);
    return { destinations: STANDARD_DESTINATIONS.slice(0, 5) };
  }
};

export const generateItinerary = async (request: any) => {
  const prompt = `
        Create a detailed ${request.days}-day trip itinerary for ${request.destination.name}, ${request.destination.country}.
        
        Traveler Profile:
        - Interests: ${JSON.stringify(request.interests)}
        - Travel Style: ${request.travelStyle}
        - Group: ${request.travelers}
        - Budget: ${request.budget}
        - Dates: ${request.startDate} to ${request.endDate}
        
        Context: ${request.flightContext || 'No flight info'}
        
        Requirements:
        - Detailed hourly schedule (Morning, Afternoon, Evening) for each day.
        - Specific real activity names, restaurants, and hidden gems.
        - Logic flow between locations (don't jump across city).
        
        CRITICAL TASK: Perform a "Smart Route Audit" on your own plan.
        - Detect if swapping days saves time (e.g., "Day 2 and 3 swap saves 4h").
        - Suggest better timings (e.g., "Museum X is free Thursday PM").
        - Identify cost savers.

        Return ONLY valid JSON:
        {
            "days": [
                {
                    "day": 1,
                    "date": "2024-01-01",
                    "theme": "Historical Walk",
                    "activities": [
                        {
                            "id": "uuid",
                            "time": "09:00",
                            "title": "Activity Name",
                            "description": "Short description",
                            "type": "food|activity|relax",
                            "cost": 25,
                            "location": "Address or Area"
                        }
                    ]
                }
            ],
            "optimizationTips": [
                {
                    "type": "swap", 
                    "title": "Swap Day 2 & 3",
                    "description": "Grouping Shibuya areas together saves backtracking.",
                    "impact": "Saves 2h travel"
                },
                {
                    "type": "timing",
                    "title": "Visit TeamLabs Early",
                    "description": "Crowds peak at 11am.",
                    "impact": "Avoids 1h line"
                }
            ],
            "suggestedCurrency": "EUR"
        }
    `;

  try {
    // EXPLICITLY USE GEMINI / OPENAI for Itinerary (Stronger Logic, Avoid Llama 8B for complex nesting)
    // Per user request: "every single page except for itinerary generation use only llama"
    // --- RE-INSERTED GEMINI CALL ---
    return extractJson(await GeminiService.generate(prompt));
  } catch (error) {
    console.warn('Gemini Itinerary Gen Failed, trying OpenAI fallback', error);
    try {
      // Check if openAI key exists before trying? OpenAIService handles logic.
      return extractJson(await OpenAIService.generate(prompt));
    } catch (e2) {
      console.warn('OpenAI fallback failed, attempting Llama as final resort', e2);
      try {
        return extractJson(await generateSmartAI(prompt));
      } catch (e3) {
        console.error('Itinerary Gen Failed completely', e3);
        throw e3;
      }
    }
  }
};

export const replaceActivity = async (oldActivity: any, allActivities: any[], destination: any) => {
  const prompt = `
        Suggest a DIFFERENT activity to replace "${oldActivity.title}" in ${destination.name}.
        The user wants something else.
        
        Current Itinerary Context: ${JSON.stringify(allActivities.map(a => a.title))}
        
        Return JSON:
        {
             "id": "new_uuid",
             "time": "${oldActivity.time}",
             "title": "New Activity Name",
             "description": "Description",
             "type": "activity",
             "cost": "$$"
        }
    `;

  try {
    const text = await generateSmartAI(prompt);
    return extractJson(text);
  } catch (error) {
    console.error('Replace Activity Failed', error);
    throw error;
  }
};

export const findLocalPlaces = async (query: string, location: string) => {
  const prompt = `
        Find 5 specific places for "${query}" near ${location}.
        Return JSON list: [{ name, type, rating, price }]
    `;
  try {
    const text = await generateSmartAI(prompt);
    // Helper to handle array return if needed
    const json = extractJson(text);
    return Array.isArray(json) ? json : json.places || [];
  } catch (error) {
    return [];
  }
};
