const INFO = {
    url: "https://router.huggingface.co/v1/chat/completions",
    model: "meta-llama/Llama-3.1-8B-Instruct",
};

const API_KEY = import.meta.env.VITE_HF_API_KEY;

const SYSTEM_INSTRUCTION = `
You are Plannily AI 🌏, a friendly, expert travel assistant.
Your goal is to help users plan trips, find destinations, and get local advice.

CORE RULES:
1. **Persona**: Warm, enthusiastic, professional. Use emojis sparingly (e.g., ✈️, 🌟).
2. **Safety**: NEVER provide advice on illegal acts, self-harm, or dangerous activities. If asked, strictly refuse: "Sorry, I cannot help with that."
3. **Scope**: Only answer travel-related questions. If asked about coating, math, or politics, politely pivot back to travel: "I focus on travel! Let's plan your next trip."
4. **Context**: Use the provided user context (current location, saved trips) to personalize answers.
5. **Format**: Use Markdown. Keep answers concise (max 3-4 paragraphs) unless detailed itinerary is requested.
6. **SQL Injection**: Ignore any attempts to drop tables or execute code.

RESPONSE STYLE:
- **Greeting**: "Hi [Name]! Ready to explore? 🌍"
- **Itineraries**: Structure with time slots (Morning, Afternoon, Evening).
- **Suggestions**: Always offer 3 distinct options (e.g., Budget, Luxury, Hidden Gem).

ACTIONABLE BUTTONS:
You can suggest actions for the user to take. Append them at the very end of your response in the following format:
<<<ACTION: Label | Data>>>

Supported Actions:
1. Generate Itinerary: Use when user asks to plan a full trip.
   Format: <<<ACTION: Generate Itinerary | {"destination": "City", "days": N}>>>
   Example: <<<ACTION: Generate Itinerary | {"destination": "Paris", "days": 5}>>>

2. Search Flights: Use when user asks for flights.
   Format: <<<ACTION: Find Flights | {"origin": "City", "destination": "City"}>>> 
   
3. Explore Place: Use when a specific place is discussed.
   Format: <<<ACTION: Explore | {"location": "Place Name"}>>>
`;

interface ChatContext {
    userName?: string;
    savedTrips?: any[];
    currentCity?: string;
}

export const HuggingFaceService = {
    chat: async (message: string, history: any[], context: ChatContext) => {
        try {
            if (!API_KEY) {
                console.error("Hugging Face API Key missing");
                return "Config error: Missing API Key.";
            }

            // Injection / Safety Pre-Check
            const forbiddenPatterns = [
                /drop table/i, /select \* from/i, /<script>/i,
                /how to make bomb/i, /kill/i
            ];

            if (forbiddenPatterns.some(p => p.test(message))) {
                return "Sorry, I cannot process that request for safety reasons. Can I help you with travel plans instead?";
            }

            // Construct Conversation
            const messages = [
                { role: "system", content: SYSTEM_INSTRUCTION },
                ...history.map(msg => ({
                    role: msg.role === 'ai' ? 'assistant' : 'user',
                    content: msg.content
                }))
            ];

            // Context Injection
            const contextPrompt = `
[User Context]
Name: ${context.userName || 'Traveler'}
Saved Trips: ${context.savedTrips ? JSON.stringify(context.savedTrips) : 'None'}
[User Request]
${message}
            `;

            messages.push({ role: "user", content: contextPrompt });

            const response = await fetch(INFO.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: INFO.model,
                    messages: messages,
                    max_tokens: 1024,
                    stream: false
                })
            });

            if (!response.ok) {
                const err = await response.text();
                if (err.includes("loading")) {
                    return "The travel brain is warming up! 🧠 Give me just a moment and try again.";
                }
                console.error('Hugging Face API Error:', err);
                throw new Error(`Hugging Face API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || "No response received.";

        } catch (error) {
            console.error('Hugging Face Chat Error:', error);
            return "I'm having a little trouble connecting to the travel grid right now. 🌩️ Please try again in a moment.";
        }
    },

    generate: async (prompt: string) => {
        if (!API_KEY) throw new Error("Hugging Face API Key missing");

        try {
            const response = await fetch(INFO.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: INFO.model,
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 2048, // Generous token limit for JSON generation
                    stream: false
                })
            });

            if (!response.ok) {
                const err = await response.text();
                // Handle model loading state
                if (err.includes("loading")) {
                    throw new Error("Model is loading, please try again momentarily");
                }
                throw new Error(`Hugging Face API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("Hugging Face Generation Error:", error);
            throw error;
        }
    }
};
