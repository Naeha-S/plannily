import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);

// 2. Define System Persona & Guardrails
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
`;

interface ChatContext {
    userName?: string;
    savedTrips?: any[];
    currentCity?: string;
}

export const GeminiService = {
    chat: async (message: string, history: any[], context: ChatContext) => {
        try {
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: SYSTEM_INSTRUCTION
            });

            // Injection / Safety Pre-Check (Simple regex)
            const forbiddenPatterns = [
                /drop table/i, /select \* from/i, /<script>/i,
                /how to make bomb/i, /kill/i
            ];

            if (forbiddenPatterns.some(p => p.test(message))) {
                return "Sorry, I cannot process that request for safety reasons. Can I help you with travel plans instead?";
            }

            // Construct Chat History
            // Gemini expects { role: 'user' | 'model', parts: [{ text: ... }] }
            const chatHistory = history.map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            // Context Injection into the active prompt
            const contextPrompt = `
[User Context]
Name: ${context.userName || 'Traveler'}
Saved Trips: ${context.savedTrips ? JSON.stringify(context.savedTrips) : 'None'}
[User Request]
${message}
            `;

            const chat = model.startChat({ history: chatHistory });
            const result = await chat.sendMessage(contextPrompt);
            const response = result.response.text();

            return response;

        } catch (error) {
            console.error('Gemini Chat Error:', error);
            return "I'm having a little trouble connecting to the travel grid right now. 🌩️ Please try again in a moment.";
        }
    },

    generate: async (prompt: string) => {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini Generation Error:', error);
            throw new Error('Gemini generation failed');
        }
    }
};
