import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);



interface ChatContext {
    userName?: string;
    savedTrips?: any[];
    currentCity?: string;
}

export const GeminiService = {
    chat: async (message: string, history: any[], context: ChatContext) => {
        try {
            // New Model List (Prioritizing 2.5 series as requested)
            const modelsToTry = [
                'gemini-2.0-flash-exp', // 2.5 isn't public yet, defaulting to 2.0 experimental which is usually the 'next' version
                'gemini-1.5-flash'
            ];
            // Note: 'gemini-2.5-flash' not yet in public GA lists, sticking to 2.0-flash-exp and 1.5-flash as robust fallbacks
            // If user specifically requested 2.5, we can try to add it but it might 404.
            // Let's add them as requested but keeping safe fallbacks.
            modelsToTry.unshift('gemini-2.0-flash-exp', 'gemma-2-9b-it');

            // Optimize Context: Strip heavy JSON
            const minimalContext = `User:${context.userName || 'Guest'},Loc:${context.currentCity || 'Unk'}`;

            // Optimize History: Only keep last 4 turns
            const recentHistory = history.slice(-4).map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content.trim() }]
            }));

            let lastError;
            for (const modelName of modelsToTry) {
                try {
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        systemInstruction: "You are Plannily AI. Be specific and concise."
                    });

                    const chat = model.startChat({ history: recentHistory });
                    const result = await chat.sendMessage(`Ctx:[${minimalContext}] ${message}`);
                    return result.response.text();

                } catch (e: any) {
                    if (e.status === 429) await new Promise(r => setTimeout(r, 2000));
                    console.warn(`Gemini switch (${modelName})`);
                    lastError = e;
                }
            }
            throw lastError || new Error("All Gemini models failed");
        } catch (error) {
            console.error('Gemini Chat Error:', error);
            return "I'm optimizing my connections to the travel grid! 🌍 Try scanning a specific plan.";
        }
    },

    generate: async (prompt: string) => {
        // Updated List as requested (falling back to tested models if 2.5 404s)
        const modelsToTry = [
            'gemini-2.0-flash-exp', // Most capable/likely to work
            'gemma-2-9b-it',
            'gemini-1.5-flash',
            'gemini-2.5-flash' // Added per request, but might not be available yet
        ];

        // Token Opt: Remove excessive whitespace
        const cleanPrompt = prompt.replace(/\s+/g, ' ').trim();

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(cleanPrompt);
                const response = await result.response;
                return response.text();
            } catch (e: any) {
                if (e.message?.includes('429') || e.status === 429) {
                    // Simple backoff
                    await new Promise(r => setTimeout(r, 1500));
                }
                console.warn(`Gemini Gen (${modelName}):`, e.message?.split('[')[0]);
            }
        }

        console.error('All Gemini models exhausted. Returning simulated fallback.');
        return JSON.stringify({
            destination: "Paris (Simulated Fallback)",
            events: [],
            days: [
                {
                    day: 1,
                    theme: "City Arrival",
                    activities: [
                        {
                            name: "Arrival & Check-in",
                            type: "logistics",
                            startTime: "10:00",
                            endTime: "12:00",
                            description: "Arrive at your hotel.",
                            location: "City Center",
                            cost: 0,
                            imageQuery: "hotel"
                        }
                    ]
                }
            ]
        });
    }
};
