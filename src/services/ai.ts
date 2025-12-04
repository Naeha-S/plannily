import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Missing Gemini API Key');
}

if (!GROQ_API_KEY) {
  console.error('Missing Groq API Key');
}

const GEMINI_MODELS = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro'];

const callGroqAPI = async (prompt: string) => {
  if (!GROQ_API_KEY) throw new Error('Groq API Key not found');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

const generateWithFallback = async (prompt: string) => {
  // Try Gemini models first
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`Attempting generation with ${modelName}...`);
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn(`Failed with ${modelName}:`, error);
      continue;
    }
  }

  // Fallback to Groq
  try {
    console.log('All Gemini models failed. Falling back to Groq...');
    return await callGroqAPI(prompt);
  } catch (error) {
    console.error('Groq fallback failed:', error);
    throw new Error('All AI models failed to generate content');
  }
};

import { getUnsplashImage } from './unsplash';

// ... (imports)

export const generateDestinations = async (preferences: any) => {
  const prompt = `
    Suggest 3 destinations + 2 alternatives based on:
    Vibes: ${preferences.vibes.join(', ')}
    Companions: ${preferences.companions}
    Budget: ${preferences.budget}
    Duration: ${preferences.duration} days

    Return strictly valid JSON (no markdown):
    {
      "destinations": [
        {
          "id": "unique_string",
          "name": "City, Country",
          "country": "Country Name",
          "description": "1 sentence reason.",
          "imageQuery": "Search term for Unsplash (e.g. 'Paris Eiffel Tower')",
          "matchScore": number (0-100),
          "tags": ["tag1", "tag2", "tag3"],
          "weather": { "temp": number, "condition": "String" },
          "costEstimate": number
        }
      ]
    }
  `;

  try {
    const text = await generateWithFallback(prompt);
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanText);

    // Hydrate with Unsplash images
    const destinationsWithImages = await Promise.all(data.destinations.map(async (dest: any) => ({
      ...dest,
      imageUrl: await getUnsplashImage(dest.imageQuery || dest.name)
    })));

    return { destinations: destinationsWithImages };
  } catch (error) {
    console.error('Error generating destinations:', error);
    throw error;
  }
};

export const generateItinerary = async (request: any) => {
  const prompt = `
    Create a ${request.days} day itinerary for ${request.destination}. Budget: ${request.budget}.
    
    CRITICAL: Identify 1-2 unique seasonal events/festivals occurring in ${request.destination} (assume current season if date not specified) that would be special to attend.
    
    Return strictly valid JSON (no markdown):
    {
      "destination": "${request.destination}",
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
          "activities": [
            {
              "id": "unique_string",
              "name": "Activity Name",
              "type": "sightseeing|food|relaxation|travel|activity",
              "startTime": "HH:MM",
              "endTime": "HH:MM",
              "description": "Very short description",
              "location": "Place",
              "imageQuery": "Search term"
            }
          ]
        }
      ]
    }
  `;

  try {
    const text = await generateWithFallback(prompt);
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanText);

    // Hydrate Events with Images
    if (data.events) {
      data.events = await Promise.all(data.events.map(async (evt: any) => ({
        ...evt,
        imageUrl: await getUnsplashImage(evt.imageQuery || evt.name + ' ' + data.destination)
      })));
    }

    // Hydrate Activities with Images
    data.days = await Promise.all(data.days.map(async (day: any) => ({
      ...day,
      activities: await Promise.all(day.activities.map(async (act: any) => ({
        ...act,
        imageUrl: await getUnsplashImage(act.imageQuery || act.name + ' ' + data.destination)
      })))
    })));

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
        Create a COMPLETELY DIFFERENT set of activities for this day.
        
        Return strictly valid JSON for a single day object:
        {
          "day": ${day.day},
          "activities": [ ... (same structure as before with imageQuery) ]
        }
    `;

  try {
    const text = await generateWithFallback(prompt);
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const newDay = JSON.parse(cleanText);

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
    return await generateWithFallback(prompt);
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
};
