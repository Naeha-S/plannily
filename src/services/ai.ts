import { GeminiService } from './gemini';
import { getUnsplashImage } from './unsplash';

import { OpenAIService } from './openai';

// Smart Fallback Generator: Gemini -> OpenAI
const generateSmartAI = async (prompt: string) => {
  // 1. Try Gemini
  try {
    return await GeminiService.generate(prompt);
  } catch (geminiError) {
    console.warn('Gemini failed, switching to OpenAI 🟢', geminiError);

    // 2. Try OpenAI
    try {
      return await OpenAIService.generate(prompt);
    } catch (openAIError) {
      console.error('All AI models failed 🔴', openAIError);
      throw new Error('All AI services are currently unavailable. Please check your connection or API keys.');
    }
  }
};

const extractJson = (text: string) => {
  try {
    // Try parsing assuming it's clean
    return JSON.parse(text);
  } catch (e) {
    // Try finding JSON block
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        let cleanMatch = jsonMatch[0];
        // Attempt to fix common standard json issues if parse fails
        // Remove trailing commas
        cleanMatch = cleanMatch.replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(cleanMatch);
      } catch (e2) {
        console.error('Failed to parse extracted JSON:', e2);
      }
    }
    // Fallback: simple cleanup
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // Remove potential comments
    cleanText = cleanText.replace(/\/\/.*$/gm, '');
    try {
      return JSON.parse(cleanText);
    } catch (e3) {
      // Last ditch effort: relaxed json parse (e.g. using Function, unsafe but usually ok for AI output in this context if careful)
      // Or just fail. Let's try to remove control chars.
      cleanText = cleanText.replace(/[\u0000-\u0019]+/g, "");
      try {
        return JSON.parse(cleanText);
      } catch (e4) {
        console.error('Final JSON parse attempt failed:', e4);
        throw new Error('Failed to parse AI response');
      }
    }
  }
};

import { STANDARD_DESTINATIONS } from '../data/standardDestinations';

export const generateDestinations = async (preferences: any) => {
  const nationalityClause = preferences.nationality
    ? `User Nationality: ${preferences.nationality}. IMPORTANT: Prioritize destinations that are VISA-FREE or have EASY VISA access for this nationality.`
    : '';

  const prompt = `
    Suggest 15 personalized travel destinations based on:
    Vibes: ${preferences.vibes.join(', ')}
    Companions: ${preferences.companions}
    Budget: ${preferences.budget} (User's approx max budget/person)
    Duration: ${preferences.duration} days
    Origin: ${preferences.origin}
    ${nationalityClause}

    Make sure the 15 suggestions are diverse, covering different types of trips fitting the vibes.
    Provide an ACCURATE cost estimate (including flight) based on the Origin.

    Return strictly valid JSON (no markdown, no backticks):
    {
      "destinations": [
        {
          "id": "unique_string",
          "name": "City, Country",
          "country": "Country Name",
          "countryCode": "ISO 2-letter code (e.g. US, FR, JP)",
          "description": "1 sentence reason matching user vibe.",
          "imageQuery": "Simple 2-3 word search term for Unsplash (e.g. 'Paris Eiffel')",
          "matchScore": number (60-100),
          "tags": ["tag1", "tag2", "tag3"],
          "weather": { "temp": number, "condition": "String" },
          "costEstimate": number,
          "visaInfo": "Short note on visa (e.g. 'Visa-free' or 'E-Visa needed')"
        }
      ]
    }
  `;

  try {
    const text = await generateSmartAI(prompt);
    const data = extractJson(text);

    // 1. Hydrate AI results with Unsplash images
    const aiDestinations = await Promise.all(data.destinations.map(async (dest: any) => ({
      ...dest,
      imageUrl: await getUnsplashImage(dest.imageQuery || dest.name)
    })));

    // 2. Hydrate Standard Destinations with Unsplash images (if not already simulated or cached)
    // We can simulate or fetch. To be safe, let's fetch real images for them too or use placeholders?
    // Let's assume we fetch them once or lazily. For now, fetch.
    const standardDestinations = await Promise.all(STANDARD_DESTINATIONS.map(async (std: any) => ({
      ...std,
      imageUrl: await getUnsplashImage(std.imageQuery || std.name),
      isStandard: true // flag to differentiate in UI if needed
    })));

    // 3. Combine: 15 AI + 15 Standard
    return { destinations: [...aiDestinations, ...standardDestinations] };
  } catch (error) {
    console.error('Error generating destinations:', error);
    throw error;
  }
};

export const generateItinerary = async (request: any) => {
  const profileContext = request.userProfile ? `
    User Profile:
    - Origin: ${request.userProfile.country_of_origin || 'Unknown'}
    - Currency Preference: ${request.userProfile.currency || 'USD'}
    - Language: ${request.userProfile.language || 'en'}
    - Interests: ${request.userProfile.travel_preferences?.interests?.join(', ') || 'General'}
    - Visas: ${request.userProfile.visas?.join(', ') || 'None'}
    - Citizenships: ${request.userProfile.citizenships?.join(', ') || 'None'}
    
    IMPORTANT: Consider visa requirements if applicable. Quote costs in ${request.userProfile.currency || 'USD'}.
  ` : '';

  const prompt = `
    Act as a luxury travel planner. Create a detailed ${request.days}-day itinerary for ${request.travelers} people to ${request.destination}.
    
    ${profileContext}
    
    Preferences:
    - Budget: ${request.budget}
    - Pace: ${request.pace} (Important: ${request.pace === 'relaxed' ? 'Include ample breaks and leisure time' : 'Maximize sightseeing'})
    - Interests: ${request.interests.join(', ')}
    
    Constraints & Logic:
    1. **Cohesion**: Group activities by neighborhood to minimize travel time. Don't jump across the city unnecessarily.
    2. **Realism**: Include realistic travel times between locations (e.g., "20 mins Metro").
    3. **Schedule**: 
       - Morning: 1-2 activities
       - Lunch: Specific restaurant recommendation
       - Afternoon: 1-2 activities
       - Evening: Dinner + Night activity (if applicable)
    4. **Variety**: Mix sightseeing, food, and relaxation based on interests.
    5. **Events**: Identify 1-2 unique seasonal events if possible.
    
    Return strictly valid JSON (no markdown):
    {
      "destination": "${request.destination}",
      "countryCode": "ISO 2-letter code",
      "events": [
        {
          "id": "evt_1",
          "name": "Event Name",
          "date": "YYYY-MM-DD (approximate)",
          "description": "Short description",
          "location": "Venue/Area",
          "type": "festival|concert|exhibition|sports|other",
          "imageQuery": "Search term"
        }
      ],
      "days": [
        {
          "day": number,
          "theme": "Day Theme (e.g., 'Historic Old Town')",
          "activities": [
            {
              "id": "unique_string",
              "name": "Activity Name",
              "type": "sightseeing|food|relaxation|travel|activity",
              "startTime": "HH:MM",
              "endTime": "HH:MM",
              "description": "Engaging description. Mention why it fits the user.",
              "location": "Address or Area",
              "cost": number (per person estimate in ${request.userProfile?.currency || 'USD'}),
              "travelTime": "e.g. 15 mins walk from previous",
              "travelCost": number (estimate in ${request.userProfile?.currency || 'USD'}),
              "imageQuery": "Search term"
            }
          ]
        }
      ]
    }
  `;

  try {
    const text = await generateSmartAI(prompt);
    const data = extractJson(text);

    // Hydrate Events with Images
    if (data.events) {
      data.events = await Promise.all(data.events.map(async (evt: any) => ({
        ...evt,
        imageUrl: await getUnsplashImage(evt.imageQuery || evt.name + ' ' + data.destination)
      })));
    }

    // Hydrate Activities with Images
    if (data.days) {
      data.days = await Promise.all(data.days.map(async (day: any) => ({
        ...day,
        activities: await Promise.all(day.activities.map(async (act: any) => ({
          ...act,
          imageUrl: await getUnsplashImage(act.imageQuery || act.name + ' ' + data.destination)
        })))
      })));
    }

    return data;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw error;
  }
};

export const regenerateDay = async (currentItinerary: any, dayIndex: number) => {
  const day = currentItinerary.days[dayIndex];
  const prompt = `
        Regenerate Day ${day.day} for a trip to ${currentItinerary.destination}.
        Previous plan was: ${JSON.stringify(day.activities.map((a: any) => a.name))}.
        
        Goal: Create a COMPLETELY DIFFERENT set of activities for this day, maintaining logical routing and the user's original preferences.
        
        Return strictly valid JSON for a single day object:
        {
          "day": ${day.day},
          "theme": "New Theme",
          "activities": [ ... (same structure as before with cost, travelTime, travelCost, imageQuery) ]
        }
    `;

  try {
    const text = await generateSmartAI(prompt);
    const newDay = extractJson(text);

    // Hydrate images
    newDay.activities = await Promise.all(newDay.activities.map(async (act: any) => ({
      ...act,
      imageUrl: await getUnsplashImage(act.imageQuery || act.name + ' ' + currentItinerary.destination)
    })));

    return newDay;
  } catch (error) {
    console.error('Error regenerating day:', error);
    throw error;
  }
};

export const generateMoreEvents = async (destination: string, date: string) => {
  const prompt = `
      Find 4 unique special events, concerts, or festivals in ${destination} around ${date}.
      Focus on unique, local, or high-profile events.
      
      Return strictly valid JSON:
      [
        {
          "id": "unique_id",
          "name": "Event Name",
          "date": "YYYY-MM-DD",
          "description": "Short description",
          "location": "Venue",
          "type": "concert|festival|exhibition|other",
          "imageQuery": "Search term"
        }
      ]
    `;

  try {
    const text = await generateSmartAI(prompt);
    const events = extractJson(text);

    // Hydrate with images
    const eventsWithImages = await Promise.all(events.map(async (evt: any) => ({
      ...evt,
      imageUrl: await getUnsplashImage(evt.imageQuery || evt.name + ' ' + destination)
    })));

    return eventsWithImages;
  } catch (error) {
    console.error('Error generating more events:', error);
    throw error;
  }
};

export const findLocalPlaces = async (city: string, context?: { savedTrip?: any }) => {
  let contextPrompt = '';
  if (context?.savedTrip) {
    // Extract activity names to exclude
    const existingActivities = context.savedTrip.days?.flatMap((d: any) => d.activities?.map((a: any) => a.name)) || [];
    contextPrompt = `
      CONTEXT: The user has already planned: ${existingActivities.join(', ')}.
      Do NOT suggest these again.
      Suggest 4 NEW hidden gems, unique cafes, or viral spots that a seasoned traveler would know.
      Focus on "aesthetic" and "authentic" vibes.
      `;
  } else {
    contextPrompt = `
      Focus on 4 unique, aesthetic, and authentic places (hidden gems, local favorites).
      Avoid generic tourist traps unless they are absolute must-sees (e.g. Eiffel Tower) but try to find a unique angle.
      `;
  }

  const prompt = `
      Find 4 unique places in ${city} for a local travel guide.
      ${contextPrompt}
      
      Return strictly valid JSON (no markdown):
      [
        {
          "id": "unique_id",
          "name": "Place Name",
          "description": "Short alluring description (1 sentence).",
          "type": "photo|food|gem|scenic|experience",
          "rating": number (4.0-5.0),
          "imageQuery": "Simple 2-3 word visual search term (e.g. 'Coffee Shop Paris')",
          "timings": "e.g. 9AM - 6PM",
          "viral_factor": "Why is this place viral/special? (e.g. 'Famous for pink walls')",
          "tips": "One local insider tip."
        }
      ]
    `;

  try {
    const text = await generateSmartAI(prompt);
    // Robust JSON cleanup
    const places = extractJson(text);

    // Hydrate with images
    const placesWithImages = await Promise.all(places.map(async (place: any) => ({
      ...place,
      image: await getUnsplashImage(place.imageQuery || place.name + ' ' + city)
    })));

    return placesWithImages;
  } catch (error) {
    console.error('Error finding local places:', error);
    throw error;
  }
};

export const chatWithAI = async (message: string, context: any) => {
  // Minimize context to save tokens
  const minimalContext = context.days?.map((d: any) => ({
    day: d.day,
    activities: d.activities.map((a: any) => `${a.startTime}-${a.endTime}: ${a.name}`)
  }));

  const prompt = `
    Context: ${JSON.stringify(minimalContext)}
    User: ${message}
    
    Reply concisely as a travel assistant for ${context.destination}.
  `;

  try {
    return await generateSmartAI(prompt);
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
};
