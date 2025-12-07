export const ElevenLabsService = {
    // Use the Flash v2.5 model as requested
    // Model ID for "Eleven Flash v2.5" is often "eleven_flash_v2_5"
    async textToSpeech(text: string): Promise<ArrayBuffer> {
        const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
        const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // Cova / standard voice

        if (!API_KEY) throw new Error("Missing ElevenLabs API Key");

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_flash_v2_5', // Using Flash v2.5 as requested
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5,
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("ElevenLabs Error:", errorText);
            throw new Error(`ElevenLabs API Error: ${response.status} ${response.statusText}`);
        }

        return await response.arrayBuffer();
    }
};
