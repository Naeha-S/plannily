import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Sparkles, ArrowRight, Square } from 'lucide-react';
import { ElevenLabsService } from '../../services/elevenlabs';
import { HuggingFaceService } from '../../services/huggingface';

// Data types
interface ActionData {
    label: string;
    type: string;
    data: any;
}

// Sleek Orb Component
const VoiceOrb = ({ state }: { state: 'idle' | 'listening' | 'thinking' | 'speaking' }) => {
    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Core Orb */}
            <motion.div
                animate={{
                    scale: state === 'listening' ? [1, 1.1, 1] : state === 'speaking' ? [1, 1.2, 0.9, 1.1, 1] : 1,
                    filter: state === 'thinking' ? "hue-rotate(90deg) blur(5px)" : "blur(0px)",
                }}
                transition={{
                    scale: { repeat: Infinity, duration: state === 'speaking' ? 0.5 : 2, ease: "easeInOut" },
                    filter: { duration: 1 }
                }}
                className={`w-20 h-20 rounded-full bg-gradient-to-br transition-all duration-700 shadow-[0_0_50px_rgba(0,0,0,0.3)]
                    ${state === 'idle' ? 'from-stone-300 to-stone-400' : ''}
                    ${state === 'listening' ? 'from-red-400 to-pink-500 shadow-red-500/50' : ''}
                    ${state === 'thinking' ? 'from-indigo-400 to-cyan-500 animate-pulse' : ''}
                    ${state === 'speaking' ? 'from-purple-500 to-indigo-600 shadow-indigo-500/50' : ''}
                `}
            />

            {/* Outer Rings */}
            {state !== 'idle' && (
                <>
                    <motion.div
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`absolute inset-0 rounded-full border-2 border-current opacity-30
                        ${state === 'listening' ? 'text-red-400' : 'text-indigo-400'}
                    `}
                    />
                    <motion.div
                        animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                        className={`absolute inset-0 rounded-full border border-current opacity-20
                        ${state === 'listening' ? 'text-red-400' : 'text-indigo-400'}
                    `}
                    />
                </>
            )}
        </div>
    );
};

export const VoiceAssistant = ({ onAction }: { onAction: (action: any) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [state, setState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const [transcript, setTranscript] = useState('');
    const [aiText, setAiText] = useState("I'm listening...");
    const [action, setAction] = useState<ActionData | null>(null);

    // Web Speech API Refs
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const stateRef = useRef(state); // Keep track of state in effect

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.lang = navigator.language || 'en-US';
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onstart = () => {
                setState('listening');
                setTranscript('');
            };

            recognition.onresult = (event: any) => {
                if (event.results && event.results.length > 0) {
                    const text = event.results[0][0].transcript;
                    setTranscript(text);
                    if (event.results[0].isFinal) {
                        handleUserMessage(text);
                    }
                }
            };

            recognition.onerror = (event: any) => {
                console.log("Speech Error:", event.error);
                if (event.error === 'no-speech') {
                    setAiText("Timed out. Tap mic to try again.");
                } else if (event.error !== 'aborted') {
                    setAiText("Microphone error: " + event.error);
                }
                // Always reset to idle on error to allow retry
                setState('idle');
            };

            recognition.onend = () => {
                // Check latest state using ref
                if (stateRef.current === 'listening') {
                    setState('idle');
                }
            };

            return () => {
                recognition.abort();
            };
        }
    }, []); // Empty dependency array = Initialize ONCE

    const handleUserMessage = async (message: string) => {
        if (!message || message.trim() === "") return;

        setState('thinking');
        setAction(null);

        try {
            const aiResponse = await HuggingFaceService.chat(
                `Acting as Cova, a clear, concise, and professional personalized travel assistant.
                
                Your Goal: Provide a helpful, VERY brief response (max 2 sentences) to the user's voice input.
                If actionable (like finding flights, hotels, or planning a trip), confirm you can do it and output the JSON Action block.

                Context: ${JSON.stringify({ userName: 'Traveler', savedTrips: [] })}
                
                User Input: "${message}"`,
                [],
                { userName: 'Traveler', savedTrips: [] }
            );

            const actionRegex = /<<<ACTION:\s*([^|]+)\s*\|\s*([^>]+)>>>/;
            const match = aiResponse.match(actionRegex);

            let spokenText = aiResponse.replace(actionRegex, '').trim();
            spokenText = spokenText.replace(/<<<ACTION:.*?>>>/g, '').trim();

            if (match) {
                try {
                    const label = match[1].trim();
                    const rawData = match[2].trim();
                    let type = 'OTHER';
                    if (label.toLowerCase().includes('itinerary')) type = 'GENERATE_ITINERARY';
                    else if (label.toLowerCase().includes('flight')) type = 'FIND_FLIGHTS';
                    else if (label.toLowerCase().includes('explore')) type = 'EXPLORE';
                    const data = JSON.parse(rawData);
                    setAction({ label, type, data });
                } catch (e) {
                    console.error("Failed to parse action", e);
                }
            }

            setAiText(spokenText);

            setState('speaking');
            const audioBuffer = await ElevenLabsService.textToSpeech(spokenText.substring(0, 400));

            const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);

            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
                audioRef.current.onended = () => setState('idle');
            }
        } catch (error) {
            console.error("Voice Error", error);
            setAiText("Connection interrupted.");
            setState('idle');
        }
    };

    const handleInteraction = () => {
        if (state === 'speaking') {
            audioRef.current?.pause();
            setState('idle');
        } else if (state === 'listening') {
            recognitionRef.current?.stop();
        } else {
            // Start Listening
            try {
                recognitionRef.current?.start();
            } catch (e: any) {
                console.warn("Speech recognition busy/error:", e);
                // If it's already started, we just sync our state
                if (e.name === 'InvalidStateError' || e.message?.includes('already started')) {
                    setState('listening');
                } else {
                    // Try to reset
                    recognitionRef.current?.abort();
                    setTimeout(() => {
                        try { recognitionRef.current?.start(); } catch (err) { console.error("Retry failed", err); }
                    }, 200);
                }
            }
        }
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setState('idle');
        } else {
            recognitionRef.current?.abort(); // Abort is safer on close
            audioRef.current?.pause();
        }
    };

    return (
        <>
            <audio ref={audioRef} className="hidden" />

            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleOpen}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-indigo-500/30 transition-shadow border border-white/10"
                >
                    <Sparkles size={20} className="text-indigo-400" />
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-6 right-6 w-[360px] bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 z-50 overflow-hidden flex flex-col items-center"
                    >
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                        <div className="w-full p-4 flex justify-between items-start">
                            <div className="flex flex-col">
                                <h3 className="text-white font-bold text-lg tracking-tight">Cova</h3>
                                <span className="text-xs text-stone-400 font-medium tracking-wide uppercase">
                                    {state === 'idle' ? 'Ready' : state}
                                </span>
                            </div>
                            <button onClick={toggleOpen} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="py-8">
                            <VoiceOrb state={state} />
                        </div>

                        <div className="w-full px-8 mb-6 min-h-[80px] flex items-center justify-center text-center">
                            <AnimatePresence mode='wait'>
                                <motion.p
                                    key={transcript + aiText}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-stone-300 text-lg font-medium leading-relaxed"
                                >
                                    {state === 'listening' ? (transcript || "Listening...") : aiText}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        <div className="w-full px-6 pb-6 space-y-4">
                            {action && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => onAction(action)}
                                    className="w-full py-3 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors"
                                >
                                    <Sparkles size={16} />
                                    {action.label} <ArrowRight size={16} />
                                </motion.button>
                            )}

                            <div className="flex justify-center">
                                <button
                                    onClick={handleInteraction}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl
                                        ${state === 'listening' ? 'bg-red-500 hover:bg-red-600 text-white' :
                                            state === 'speaking' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' :
                                                'bg-white text-black hover:scale-105'}
                                    `}
                                >
                                    {state === 'listening' ? <Square fill="currentColor" size={20} /> :
                                        state === 'speaking' ? <X size={24} /> :
                                            <Mic size={24} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
