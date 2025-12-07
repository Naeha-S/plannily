import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, Suspense, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import {
    Compass,
    MapPin,
    ArrowRight,
    Sparkles,
    Bot,
    Send,
    Camera,
    Coffee,
    Map as MapIcon,
    ArrowDown,
    User
} from 'lucide-react';

// Preload the model
useGLTF.preload('/models/plane.glb');

// --- PLANE CONFIGURATION ---
// Adjust these values to control the plane's dimensions and base angles.
const CONFIG = {
    SCALE_DESKTOP: 0.25, // 10% smaller than previous 0.28
    SCALE_MOBILE: 0.12,
    BASE_PITCH: 0.1,    // Nose up angle (~31.5 degrees)
    BASE_YAW: Math.PI / 2 + 0.1, // Facing right with slight angle
    BASE_ROLL: 0.1,      // Banking angle
};

function Model({ scrollY, isMobile }: { scrollY: React.MutableRefObject<number>, isMobile: boolean }) {
    const { scene } = useGLTF('/models/plane.glb');
    const modelRef = useRef<THREE.Group>(null);
    const [scrolling, setScrolling] = useState(false);

    useFrame((state) => {
        if (!modelRef.current) return;
        const currentScroll = scrollY.current;
        const viewportHeight = window.innerHeight;
        const scrollProgress = Math.min(currentScroll / viewportHeight, 1);

        // Update local state for interaction logic
        if (scrollProgress > 0.05 && !scrolling) setScrolling(true);
        if (scrollProgress <= 0.05 && scrolling) setScrolling(false);

        const time = state.clock.getElapsedTime();
        const entranceDuration = 3.5;
        const entranceProgress = Math.min(time / entranceDuration, 1);
        const easeOut = 1 - Math.pow(1 - entranceProgress, 3);

        let startPos, centerPos, exitPos;

        if (isMobile) {
            startPos = new THREE.Vector3(-3, -1, 0);
            centerPos = new THREE.Vector3(0.2, 0.4, 0);
            exitPos = new THREE.Vector3(4, 8, -2);
        } else {
            // User's Custom Path (Preserved)
            startPos = new THREE.Vector3(-21, -25, 5);
            centerPos = new THREE.Vector3(0.2, .25, 1);
            exitPos = new THREE.Vector3(22, 17, -5);
        }

        const currentPos = new THREE.Vector3().lerpVectors(startPos, centerPos, easeOut);

        // --- SCROLL EXIT LOGIC ---
        if (scrollProgress > 0) {
            let exitProgress = 0;
            if (scrollProgress > 0.05) {
                exitProgress = (scrollProgress - 0.05) / 0.95;
            }
            // Lerp from the "center" (held position) to the "exit" position
            currentPos.lerp(exitPos, exitProgress);

            if (modelRef.current) {
                if (isMobile) {
                    modelRef.current.rotation.x = -exitProgress * 0.5;
                    modelRef.current.rotation.y = Math.PI / 2;
                } else {
                    // Stable scroll exit - Lock to base angles
                    modelRef.current.rotation.x = CONFIG.BASE_PITCH;
                    modelRef.current.rotation.y = CONFIG.BASE_YAW;
                    modelRef.current.rotation.z = CONFIG.BASE_ROLL;
                }
            }
        } else {
            // Static / Entrance Phase
            if (modelRef.current && !isMobile) {
                // If the user isn't interacting (PresentationControls handles its own rotation),
                // we set the base rotation on the primitive.
                // However, PresentationControls wraps this. 
                // To ensure the "base" is correct inside the wrapper, we set it here.
                modelRef.current.rotation.set(CONFIG.BASE_PITCH, CONFIG.BASE_YAW, CONFIG.BASE_ROLL);
            }
            if (modelRef.current && isMobile) {
                modelRef.current.rotation.set(0, Math.PI / 2, 0);
            }
        }

        // Position is applied to the primitive (the plane itself)
        modelRef.current.position.copy(currentPos);
    });

    return (
        <PresentationControls
            enabled={!scrolling && !isMobile} // Disable interaction when scrolling
            global={false} // Only interact with the plane
            cursor={true}
            snap={true} // Snap back to original angle when released
            speed={1.5}
            zoom={0.8}
            rotation={[0, 0, 0]} // Initial rotation offset
            polar={[-Math.PI / 4, Math.PI / 4]} // Limit vertical rotation
            azimuth={[-Math.PI / 4, Math.PI / 4]} // Limit horizontal rotation
        >
            <primitive
                ref={modelRef}
                object={scene}
                scale={isMobile ? CONFIG.SCALE_MOBILE : CONFIG.SCALE_DESKTOP}
            />
        </PresentationControls>
    );
}

function Scene({ scrollY, isMobile }: { scrollY: React.MutableRefObject<number>, isMobile: boolean }) {
    return (
        <>
            <ambientLight intensity={1} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <Environment preset="city" />
            <Model scrollY={scrollY} isMobile={isMobile} />
        </>
    );
}

const LandingPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const scrollRef = useRef(0);
    const [isMobile, setIsMobile] = useState(false);

    // Framer Motion scroll hooks
    const { scrollY } = useScroll();
    const canvasOpacity = useTransform(scrollY, [0, 500], [1, 0]);
    const canvasPointerEvents = useTransform(scrollY, (y) => y > 500 ? 'none' : 'auto');

    useEffect(() => {
        const handleScroll = () => { scrollRef.current = window.scrollY; };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, []);

    const handleAction = (path: string) => {
        console.log("Navigating to:", path); // Debug log
        if (!user && path !== '/login') navigate('/login');
        else navigate(path);
    };

    const scrollToContent = () => {
        const featuresSection = document.getElementById('features-section');
        featuresSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="relative min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-sans selection:bg-[var(--color-primary)] selection:text-white">

            {/* GLOBAL NOISE TEXTURE */}
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* FLOATING PILL NAVIGATION (ONLY ONE) */}
            <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <nav className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl shadow-stone-900/5 rounded-full px-2 py-1.5 flex items-center gap-1 max-w-2xl mx-4">
                    <div className="pl-4 pr-6 flex items-center gap-2 cursor-pointer border-r border-stone-200 mr-2" onClick={() => navigate('/')}>
                        <img src="/plannily_logo.png" alt="Plannily" className="h-6 w-auto object-contain" />
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        {['Discover', 'Plan', 'Flights'].map((item) => (
                            <button
                                key={item}
                                onClick={() => navigate(`/${item.toLowerCase()}`)}
                                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all"
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="ml-2 flex items-center gap-2 pl-2 border-l border-stone-200">
                        {user ? (
                            <button
                                onClick={() => navigate('/profile')}
                                className="h-9 w-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                            >
                                <User size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-stone-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-stone-900/20 hover:scale-105 transition-transform active:scale-95"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </nav>
            </div>

            {/* 3D BACKGROUND */}
            <motion.div
                style={{ opacity: canvasOpacity, pointerEvents: canvasPointerEvents as any }}
                className="fixed inset-0 z-10"
            >
                <Canvas dpr={[1, 2]} camera={{ fov: 45, position: [0, 0, 10] }}>
                    <Suspense fallback={null}>
                        <Scene scrollY={scrollRef} isMobile={isMobile} />
                    </Suspense>
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} enabled={false} />
                </Canvas>
            </motion.div>

            {/* HERO SECTION */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden z-0">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="mt-32"
                    >
                        <h1 className="text-[12vw] md:text-[14vw] font-sans font-black text-stone-300/60 tracking-tighter leading-none text-center mix-blend-multiply">
                            TAKE<br />FLIGHT
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="mt-6 text-stone-500 font-medium tracking-widest uppercase text-sm"
                    >
                        The Art of Modern Travel
                    </motion.p>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce text-stone-400 cursor-pointer" onClick={scrollToContent}>
                    <ArrowDown size={24} />
                </div>
            </section>

            {/* SELECTION SECTION: Choose Your Path */}
            <section id="features-section" className="relative py-32 bg-[var(--color-background)] z-20">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-24 max-w-3xl mx-auto">
                        <span className="text-[var(--color-primary)] font-bold tracking-widest uppercase text-xs">Begin Your Journey</span>
                        <h2 className="font-serif text-5xl md:text-6xl font-bold text-stone-900 mt-4 leading-tight">
                            How do you want to <br />
                            <span className="italic relative inline-block">
                                explore?
                                <motion.span
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '100%' }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className="absolute bottom-1 left-0 h-3 bg-[var(--color-primary)]/20 -z-10"
                                />
                            </span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* DISCOVERY CARD (White) */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            onClick={() => handleAction('/discover')}
                            className="group relative cursor-pointer rounded-[2.5rem] bg-white border border-stone-100 p-10 flex flex-col items-start shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:shadow-stone-200/80 transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute -right-10 -top-10 h-64 w-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="mb-8 h-16 w-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-500">
                                <Compass size={32} />
                            </div>

                            <h3 className="font-serif text-4xl font-bold text-stone-900 mb-4 z-10">Wanderlust</h3>
                            <p className="text-stone-500 text-lg leading-relaxed mb-10 flex-grow max-w-sm z-10">
                                "I don't know where to go." <br />
                                Discover curated destinations tailored to your vibe.
                            </p>

                            <div className="flex items-center gap-3 text-[var(--color-primary)] font-bold group-hover:translate-x-2 transition-transform">
                                Get Inspired <ArrowRight size={20} />
                            </div>
                        </motion.div>

                        {/* PLANNER CARD WITH ITINERARY VISUAL */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            onClick={() => handleAction('/plan')}
                            className="group relative cursor-pointer rounded-[2.5rem] bg-white border border-stone-100 p-0 flex flex-col shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:shadow-stone-200/80 transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-stone-50/50 rounded-l-[2.5rem] -z-10 group-hover:w-full transition-all duration-500" />

                            <div className="p-10 pb-0 z-10">
                                <div className="mb-8 h-16 w-16 rounded-2xl bg-stone-900 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                                    <MapPin size={32} />
                                </div>
                                <h3 className="font-serif text-4xl font-bold text-stone-900 mb-4">Architect</h3>
                                <p className="text-stone-500 text-lg leading-relaxed mb-8 max-w-sm">
                                    "I know where to go." <br />
                                    Build a detailed itinerary.
                                </p>
                            </div>

                            {/* MINI ITINERARY VISUAL AT BOTTOM/RIGHT */}
                            <div className="mt-auto w-full px-6 pb-6 lg:absolute lg:bottom-6 lg:right-6 lg:w-48 lg:p-0">
                                <div className="bg-white rounded-2xl border border-stone-200 shadow-lg p-4 space-y-3 opacity-90 scale-95 group-hover:scale-100 transition-all duration-500">
                                    <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">
                                        Today
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center">
                                            <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-stone-900">09:00 AM</div>
                                            <div className="text-[10px] text-stone-500">Morning Coffee</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 opacity-50">
                                        <div className="h-4 w-4 rounded-full border-2 border-stone-300" />
                                        <div>
                                            <div className="text-xs font-bold text-stone-900">11:30 AM</div>
                                            <div className="text-[10px] text-stone-500">Art Museum</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* AI ASSISTANT SECTION - Sleeker & Cleaner */}
            <section className="relative py-32 bg-white text-stone-900 overflow-hidden z-20">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-stone-50 to-transparent pointer-events-none" />

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">

                        {/* INTERACTIVE CHAT COMPONENT (Sleeker) */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <div className="relative rounded-[2rem] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-stone-100 p-8 overflow-hidden">
                                {/* Decorative Blur */}
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />

                                {/* Chat Header */}
                                <div className="relative flex items-center justify-between pb-6 mb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-2xl bg-stone-900 flex items-center justify-center shadow-lg shadow-stone-900/20">
                                                <Bot size={24} className="text-white" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-xl text-stone-900">Cova AI</h4>
                                            <p className="text-xs text-stone-500 font-medium">Always Active</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Body */}
                                <div className="space-y-6 text-[15px] relative z-10">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-stone-50 rounded-2xl rounded-tl-none p-5 text-stone-600 max-w-[90%]"
                                    >
                                        Find me a quiet cafe in Tokyo with a garden view. 🌿
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="ml-auto bg-stone-900 text-white rounded-2xl rounded-tr-none p-5 max-w-[90%] shadow-xl shadow-stone-900/10"
                                    >
                                        <p className="mb-4 leading-relaxed">
                                            You'll love <strong>Nezu Museum Cafe</strong>. Floor-to-ceiling glass windows overlooking a traditional Japanese garden. Pure zen.
                                        </p>
                                        <div className="aspect-[16/9] w-full bg-stone-800 rounded-xl overflow-hidden relative group cursor-pointer">
                                            <img src="https://images.unsplash.com/photo-1557313063-488f780e340a?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt="Cafe" />
                                            <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md border border-white/20 px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                                                <Sparkles size={10} /> Top Pick
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Input Field */}
                                <div className="mt-8 relative z-10">
                                    <div className="h-14 w-full bg-white rounded-full border border-stone-200 shadow-sm flex items-center px-2 pl-6 gap-3 focus-within:ring-2 focus-within:ring-stone-900/5 transition-shadow">
                                        <span className="text-stone-400 font-medium">Ask anything...</span>
                                        <button className="ml-auto h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center text-white hover:scale-105 transition-transform">
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* TEXT CONTENT */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2 space-y-8"
                        >
                            <span className="text-[var(--color-primary)] font-bold tracking-widest uppercase text-xs">Voice & Chat Enabled</span>
                            <h2 className="font-serif text-5xl md:text-6xl text-stone-900 leading-[1.1]">
                                Your Intelligent <br />
                                <span className="italic relative inline-block text-stone-400">
                                    Travel Companion.
                                    <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-stone-200"></div>
                                </span>
                            </h2>
                            <p className="text-lg text-stone-500 leading-relaxed max-w-md">
                                Stop browsing 50 tabs. Chat with Cova to brainstorm, refine plans, or ask for specific vibes. It's like texting your most well-traveled friend.
                            </p>
                            <button
                                onClick={() => handleAction('/ask-ai')}
                                className="inline-flex items-center gap-3 bg-white border border-stone-200 text-stone-900 hover:bg-stone-50 px-8 py-4 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl group"
                            >
                                Start Chatting <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* LOCAL GUIDE SECTION - Editorial Layout (RESTORED) */}
            <section className="relative py-32 bg-stone-50 z-20 overflow-hidden">
                {/* Decorative Text Texture */}
                <div className="absolute top-20 left-10 text-[10rem] font-serif opacity-[0.03] pointer-events-none select-none">
                    LOCAL
                </div>

                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <span className="text-stone-500 font-bold tracking-widest uppercase text-xs line-through decoration-[var(--color-primary)]">Tourist Traps</span>
                            <h2 className="font-serif text-5xl md:text-6xl text-stone-900 leading-[1.1]">
                                Live Like a <br />
                                <span className="italic text-[var(--color-primary)]">Local.</span>
                            </h2>
                            <p className="text-lg text-stone-600 leading-relaxed">
                                Discover authentic eats, aesthetic photo spots, and hidden corners. Real-time, location-based suggestions that actually pass the vibe check.
                            </p>

                            <div className="flex gap-6 pt-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <Sparkles size={16} />
                                    </div>
                                    <span>Hidden Gems</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <MapIcon size={16} />
                                    </div>
                                    <span>Interactive Map</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAction('/local-guide')}
                                className="mt-8 bg-stone-900 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-stone-900/10 hover:-translate-y-1 transition-transform"
                            >
                                Explore Guide
                            </button>
                        </motion.div>

                        {/* POLAROID STACK */}
                        <div className="relative h-[600px] w-full flex items-center justify-center">
                            {/* Back Photo */}
                            <motion.div
                                whileHover={{ rotate: -8, scale: 1.05 }}
                                className="absolute w-72 bg-white p-3 pb-8 shadow-xl shadow-stone-200/50 rotate-[-6deg] z-10 transition-all duration-500 group cursor-pointer"
                            >
                                <div className="aspect-[4/5] bg-stone-200 overflow-hidden mb-3 relative">
                                    <img src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Camera size={16} />
                                    </div>
                                </div>
                                <div className="font-serif text-center font-bold text-stone-900 italic">Secret Alleyways</div>
                            </motion.div>

                            {/* Front Photo */}
                            <motion.div
                                whileHover={{ rotate: 8, scale: 1.05 }}
                                className="absolute w-72 bg-white p-3 pb-8 shadow-2xl shadow-stone-300/50 rotate-[6deg] z-20 transition-all duration-500 group cursor-pointer"
                            >
                                <div className="aspect-[4/5] bg-stone-200 overflow-hidden mb-3 relative">
                                    <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover" />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Coffee size={16} />
                                    </div>
                                </div>
                                <div className="font-serif text-center font-bold text-stone-900 italic">Hidden Matcha</div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* REMOVED EXTRA FEATURES SECTION */}

            {/* FOOTER */}
            <footer className="bg-stone-950 text-stone-500 py-16 z-20 relative">
                <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <img src="/plannily_logo.png" alt="Plannily" className="h-8 w-auto opacity-50 grayscale" />
                        <span className="font-serif text-stone-400">© 2025 Plannily</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium">
                        <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
                        <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms</button>
                        <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact</button>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;
