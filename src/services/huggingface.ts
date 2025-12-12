
const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY || import.meta.env.VITE_HF_API_KEY;

export const HuggingFaceService = {
    async chat(prompt: string, model: string = 'meta-llama/Llama-3.1-8B-Instruct') {
        if (!HF_API_KEY) {
            console.error("HuggingFace Service: Missing API Key (VITE_HUGGINGFACE_API_KEY)");
            throw new Error("HuggingFace API Key missing");
        }

        try {
            console.log(`HF: Re-initialized Querying ${model} via Router...`);

            // Re-inserted implementation using HF Router (OpenAI compatible)
            // Endpoint: https://router.huggingface.co/v1/chat/completions
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
                    max_tokens: 1024,
                    stream: false
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                if (response.status === 401) {
                    // 401 Unauthorized
                    throw new Error(`HF Unauthorized (401): Invalid Token? Response: ${errText}`);
                }
                if (response.status === 404) {
                    throw new Error(`HF Model Not Found (404): ${model}. Response: ${errText}`);
                }
                throw new Error(`HF Router Error: ${response.status} - ${errText}`);
            }

            const data = await response.json();

            // Validate response structure
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error("HF: Invalid response format received");
            }

            return data.choices[0].message.content || "";

        } catch (error) {
            console.error('Hugging Face Router Service Error:', error);
            throw error;
        }
    }
};
