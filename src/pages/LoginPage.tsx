import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Button } from '../components/common/Button';
import { Mail, Lock, Loader2 } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Assuming password login for now
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Check if profile exists, if not redirect to profile page to complete it
            // For now, let's just default to /plan, but maybe /profile is better for first timers
            navigate('/plan');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            alert('Check your email for the confirmation link!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-stone-100">
                <h2 className="text-[var(--text-h2)] font-bold text-center text-[var(--color-text)] mb-2 font-serif">Welcome Back</h2>
                <p className="text-center text-stone-500 mb-8">Sign in to save and access your trips.</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleSignUp} disabled={loading} className="flex-1">
                            Sign Up
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
