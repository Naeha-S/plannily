import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Button } from '../components/common/Button';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    // Signup specific state
    const [interests, setInterests] = useState<string[]>([]);
    const INTEREST_OPTIONS = ['History', 'Art', 'Food', 'Nature', 'Adventure', 'Relaxation', 'Nightlife', 'Shopping'];

    const toggleInterest = (interest: string) => {
        setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
    };

    const validateForm = () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return false;
        }
        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }
        return true;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/plan');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            travel_preferences: {
                                interests: interests
                            }
                        }
                    }
                });
                if (error) throw error;
                setSuccessMsg('Account created! Please check your email to confirm.');
                setIsLogin(true);
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            // Handle specific Supabase errors
            if (err.message.includes('secret API key')) {
                setError('Configuration Error: Invalid API Key. Please contact support.');
            } else if (err.message.includes('Invalid login credentials')) {
                setError('Invalid email or password.');
            } else {
                setError(err.message || 'An error occurred during authentication.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4 py-12 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-[var(--color-surface)] rounded-3xl shadow-xl overflow-hidden border border-[var(--color-border)]"
            >
                <div className="p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[var(--color-text)] font-serif mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-[var(--color-text-muted)]">
                            {isLogin ? 'Enter your details to access your trips.' : 'Start your journey with Plannily today.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-[var(--color-text)] ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                                <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all bg-[var(--color-input)] text-[var(--color-text)]"
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-[var(--color-text)] ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                                <motion.input
                                    whileFocus={{ scale: 1.01 }}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all bg-[var(--color-input)] text-[var(--color-text)]"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                            {!isLogin && (
                                <>
                                    <p className="text-xs text-[var(--color-text-muted)] ml-1">Must be at least 6 characters</p>

                                    <div className="mt-4 space-y-2">
                                        <label className="block text-sm font-medium text-[var(--color-text)] ml-1">Tell us what you love (Interests)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {INTEREST_OPTIONS.map(interest => (
                                                <button
                                                    key={interest}
                                                    type="button"
                                                    onClick={() => toggleInterest(interest)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${interests.includes(interest)
                                                            ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                                            : 'bg-[var(--color-background)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                                        }`}
                                                >
                                                    {interest}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg"
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-2 p-3 bg-green-50 text-green-600 text-sm rounded-lg"
                                >
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button type="submit" className="w-full py-4 text-lg" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        {isLogin ? 'Sign In' : 'Sign Up'}
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                        <p className="text-[var(--color-text-muted)] text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                    setSuccessMsg('');
                                }}
                                className="ml-2 font-semibold text-[var(--color-primary)] hover:underline focus:outline-none"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
