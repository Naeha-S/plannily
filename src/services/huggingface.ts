
const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY || import.meta.env.VITE_AI_GATEWAY_API_KEY;

export const HuggingFaceService = {
    async chat(prompt: string, model: string = 'meta-llama/Meta-Llama-3.1-8B-Instruct') {
        if (!HF_API_KEY) throw new Error("HuggingFace API Key missing");

        try {
            console.log(`HF: Querying ${model} via Router...`);

            // Using the HF Router Endpoint (OpenAI Compatible)
            // This bypasses SDK auto-routing issues with certain key formats
            const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${HF_API_KEY}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 2000,
                    stream: false
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                // Check for common auth errors
                if (response.status === 401) {
                    throw new Error(`HF Unauthorized (401): Check your API Key. Response: ${errText}`);
                }
                throw new Error(`HF Router Error: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "";
        } catch (error) {
            console.error('Hugging Face Router Error:', error);
            throw error;
        }
    }
};
