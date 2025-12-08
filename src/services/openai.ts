const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const SYSTEM_INSTRUCTION = `
You are Plannily AI 🌏, a friendly, expert travel assistant.
Goal: Help users plan trips, find destinations, and get local advice.
Format: Return JSON only when requested. Use consistent Markdown for chat.
`;

export const OpenAIService = {
    chat: async (message: string, history: any[], context: any) => {
        if (!API_KEY) throw new Error("OpenAI API Key missing");

        const messages = [
            { role: "system", content: SYSTEM_INSTRUCTION },
            ...history.map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.content
            })),
            {
                role: "user",
                content: `Context: User=${context.userName}, Saved=${JSON.stringify(context.savedTrips)}\nRequest: ${message}`
            }
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Cost-effective and fast
                messages: messages,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
    },

    generate: async (prompt: string) => {
        if (!API_KEY) throw new Error("OpenAI API Key missing");

        const makeRequest = async (retries = 1) => {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are a JSON generator. Output only valid JSON." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                if (response.status === 429 && retries > 0) {
                    // Simple exponential backoff or fixed wait
                    console.warn("OpenAI Rate limited. Retrying in 3s...");
                    await new Promise(r => setTimeout(r, 3000));
                    return makeRequest(retries - 1);
                }
                throw new Error(`OpenAI API Error: ${response.statusText} (${response.status})`);
            }
            return response.json();
        };

        const data = await makeRequest();
        return data.choices[0]?.message?.content || "";
    }
};
