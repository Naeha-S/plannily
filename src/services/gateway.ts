
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

// Initialize the Gateway Provider
// In a real Vercel AI Gateway setup, you might point baseURL to the gateway URL
// and use the AI_GATEWAY_API_KEY.
// For standard Vercel AI SDK usage (as per snippet instructions which seem to imply using the SDK):

const openai = createOpenAI({
    // apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY, 
    // If using Vercel AI Gateway, you might need specific headers or baseURL:
    // baseURL: "https://gateway.ai.cloudflare.com/..." or Vercel's specific endpoint if publicly released.
    // However, based on the user provided snippet "Install the AI SDK ... AI_GATEWAY_API_KEY", 
    // we will try to use the environment variable as the key.
    apiKey: import.meta.env.VITE_AI_GATEWAY_API_KEY || import.meta.env.VITE_OPENAI_API_KEY,
});

export const GatewayService = {
    async chat(prompt: string, model: string = 'gpt-4-turbo') {
        try {
            const { text } = await generateText({
                model: openai(model),
                prompt: prompt,
            });
            return text;
        } catch (error) {
            console.error("Gateway Error:", error);
            throw error; // Let the caller fallback
        }
    },

    async streamChat(prompt: string, model: string = 'gpt-4-turbo') {
        // Returns the stream objects
        try {
            const result = await streamText({
                model: openai(model),
                prompt: prompt,
            });
            return result;
        } catch (error) {
            console.error("Gateway Stream Error:", error);
            throw error;
        }
    }
};
