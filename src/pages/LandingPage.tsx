import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Compass,
    MapPin,
    ArrowRight,
    Sparkles,
    Target,
    Zap,
    Scale,
    Map as MapIcon
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-sans selection:bg-[var(--color-primary)] selection:text-white">

            {/* Navigation Shell */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200 bg-[var(--color-background)]/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-6 max-w-7xl">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-stone-900 font-serif">Plannily</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => navigate('/discover')} className="text-sm font-medium text-stone-600 hover:text-[var(--color-primary)] hover:underline decoration-2 underline-offset-4 transition-all">
                            Discover
                        </button>
                        <button onClick={() => navigate('/plan')} className="text-sm font-medium text-stone-600 hover:text-[var(--color-primary)] hover:underline decoration-2 underline-offset-4 transition-all">
                            Plan
                        </button>
                        <button onClick={() => navigate('/saved')} className="text-sm font-medium text-stone-600 hover:text-[var(--color-primary)] hover:underline decoration-2 underline-offset-4 transition-all">
                            Saved Trips
                        </button>
                        <button
                            onClick={() => navigate('/plan')}
                            className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary)]/90 transition-colors"
                        >
                            Start planning
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
                {/* Background Gradient Blob */}
                <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-[var(--color-primary)]/5 blur-3xl" />

                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Left Column: Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-xl"
                        >
                            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1] mb-6">
                                AI-first trips,<br />
                                tailored to you.
                            </h1>
                            <p className="text-lg text-stone-600 mb-10 leading-relaxed">
                                Experience travel planning that feels human. Whether you're exploring the unknown or optimizing a dream trip, we handle the details.
                            </p>

                            {/* Two Primary Path Cards */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* Discovery Card */}
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    onClick={() => navigate('/discover')}
                                    className="group cursor-pointer rounded-xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-start"
                                >
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                        <Compass size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-stone-900 mb-2">I don't know where to go</h3>
                                    <p className="text-sm text-stone-500 mb-6 leading-relaxed flex-grow">
                                        Discover destinations that actually match your vibe, budget, and pace.
                                    </p>
                                    <div className="w-full mt-auto">
                                        <button className="w-full rounded-lg bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary)]/90 transition-colors flex items-center justify-center gap-2">
                                            Inspire me <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Planning Card */}
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    onClick={() => navigate('/plan')}
                                    className="group cursor-pointer rounded-xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col items-start"
                                >
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                                        <MapPin size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-stone-900 mb-2">I know where to go</h3>
                                    <p className="text-sm text-stone-500 mb-6 leading-relaxed flex-grow">
                                        Turn your city and dates into a human-paced, optimized plan.
                                    </p>
                                    <div className="w-full mt-auto">
                                        <button className="w-full rounded-lg border border-stone-300 bg-white py-2.5 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                                            Start planning <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Right Column: Visual */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            {/* Glassmorphism Card */}
                            <div className="relative z-10 w-full max-w-md mx-auto rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl shadow-2xl p-6">
                                {/* Mock Header */}
                                <div className="flex items-center justify-between mb-6 border-b border-stone-200/50 pb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-stone-900">Kyoto, Japan</h3>
                                        <p className="text-sm text-stone-500">Oct 12 - Oct 18 • 2 Travelers</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center">
                                        <MapIcon size={18} className="text-stone-500" />
                                    </div>
                                </div>

                                {/* Mock Timeline */}
                                <div className="space-y-6">
                                    {[
                                        { time: '09:00 AM', title: 'Fushimi Inari Taisha', type: 'Sightseeing' },
                                        { time: '12:30 PM', title: 'Nishiki Market Lunch', type: 'Food' },
                                        { time: '03:00 PM', title: 'Tea Ceremony', type: 'Culture' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="h-3 w-3 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/10" />
                                                {i !== 2 && <div className="w-0.5 h-full bg-stone-200 my-1" />}
                                            </div>
                                            <div>
                                                <span className="text-xs font-medium text-stone-400">{item.time}</span>
                                                <h4 className="text-sm font-semibold text-stone-800">{item.title}</h4>
                                                <span className="text-xs text-[var(--color-primary)] bg-[var(--color-primary)]/5 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                    {item.type}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Floating Badge */}
                                <div className="absolute -bottom-6 -right-6 rounded-xl bg-white p-4 shadow-lg border border-stone-100 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-500">Match Score</p>
                                        <p className="text-lg font-bold text-stone-900">98%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[var(--color-primary)]/10 to-transparent rounded-full blur-3xl -z-10" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Feature Strip */}
            <section className="py-24 bg-[var(--color-primary)]/5 border-y border-[var(--color-primary)]/10">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Target,
                                title: "Hyper-Personalized",
                                desc: "Your vibes, rhythm, and budget drive every suggestion. No generic lists."
                            },
                            {
                                icon: Zap,
                                title: "Live & Dynamic",
                                desc: "Plans update with real-time weather, events, and fares."
                            },
                            {
                                icon: Scale,
                                title: "Transparent",
                                desc: "Clear trade-offs for every choice. No hidden bias or ads."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="flex flex-col items-start">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-stone-200 text-stone-700 shadow-sm">
                                    <feature.icon size={24} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-bold text-stone-900 mb-2">{feature.title}</h3>
                                <p className="text-stone-600 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
                <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <span className="text-stone-100 font-bold font-serif text-lg">Plannily</span>
                        <span className="hidden md:inline text-stone-700">|</span>
                        <span className="text-sm">© 2025 Plannily. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
