import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini SDK
// If API key is missing, subsequent calls will fail gracefully.
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

interface ChatContext {
    userName?: string;
    savedTrips?: any[];
    currentCity?: string;
}

export const GeminiService = {
    chat: async (message: string, history: any[], context: ChatContext) => {
        if (!genAI) {
            console.error("Gemini Service: Missing API Key");
            throw new Error("Gemini API Key missing");
        }

        try {
            console.log("Gemini Chat: Re-initialized.");

            // Prioritize fast, stable models
            const modelName = 'gemini-1.5-flash';
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: "You are Plannily AI. Be specific, concise, and helpful."
            });

            // Context Formatting
            const minimalContext = `User:${context.userName || 'Guest'},Loc:${context.currentCity || 'Unk'}`;

            // History Formatting (Last 4 messages)
            const recentHistory = history.slice(-4).map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content.trim() }]
            }));

            const chat = model.startChat({
                history: recentHistory,
                generationConfig: {
                    maxOutputTokens: 500,
                }
            });

            const result = await chat.sendMessage(`Ctx:[${minimalContext}] ${message}`);
            return result.response.text();

        } catch (error: any) {
            console.error('Gemini Chat Error:', error);
            if (error.status === 503) console.warn("Gemini Service Overloaded (503)");
            throw error;
        }
    },

    generate: async (prompt: string) => {
        if (!genAI) {
            console.error("Gemini Service: Missing API Key");
            throw new Error("Gemini API Key missing");
        }

        // Robust Fallback List
        const modelsToTry = [
            'gemini-1.5-flash', // Fast, cheap, reliable
            'gemini-1.5-pro',   // Higher reasoning
            'gemini-pro'        // Legacy stable
        ];

        const cleanPrompt = prompt.replace(/\s+/g, ' ').trim();
        let lastError;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Gemini Gen: Trying ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const result = await model.generateContent(cleanPrompt);
                const response = await result.response;
                const text = response.text();

                if (text) return text;

            } catch (e: any) {
                console.warn(`Gemini Gen (${modelName}) failed:`, e.message?.split('[')[0]);
                lastError = e;

                // Backoff slightly on 429
                if (e.status === 429) await new Promise(r => setTimeout(r, 1000));
            }
        }

        console.error('All Gemini models exhausted.');
        throw lastError || new Error('All Gemini models exhausted');
    }
};
