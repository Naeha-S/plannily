import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Menu, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { useLocalization } from '../context/LocalizationContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { t } = useLocalization();
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check initial user
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                    <img src="/plannily_logo.png" alt="Plannily Logo" className="h-10 w-auto object-contain" />
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/discover" className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
                        {t('discover')}
                    </Link>
                    <Link to="/plan" className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
                        {t('plan')}
                    </Link>
                    <Link to="/flights" className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
                        {t('flights')}
                    </Link>
                    <Link to="/ask-ai" className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
                        {t('ask_ai')}
                    </Link>
                    <Link to="/local-guide" className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
                        {t('local_guide')}
                    </Link>
                    {user && (
                        <>
                            <Link to="/saved" className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
                                {t('saved_trips')}
                            </Link>
                            <Link to="/dashboard" className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
                                Dashboard
                            </Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-[var(--color-secondary)] transition-colors text-[var(--color-text)]"
                        title={theme === 'dark' ? t('light_mode') : t('dark_mode')}
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile" className="rounded-full bg-[var(--color-secondary)] p-2 text-[var(--color-text)] hover:opacity-80 transition-colors" title={t('profile')}>
                                <User className="h-5 w-5" />
                            </Link>
                            <button onClick={handleSignOut} className="text-sm font-medium text-[var(--color-text)] hover:text-red-500 transition-colors">
                                {t('sign_out')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
                                {t('sign_in')}
                            </Link>
                            <Link to="/login" className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90 transition-colors">
                                {t('get_started')}
                            </Link>
                        </div>
                    )}
                    <button className="md:hidden rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors">
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

const RootLayout = () => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    return (
        <div className="min-h-screen bg-background text-text font-sans">
            {!isLandingPage && <Navbar />}
            <main>
                <Outlet />
            </main>
            {!isLandingPage && (
                <footer className="border-t border-slate-200 bg-white py-8 mt-20">
                    <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                        <p>© {new Date().getFullYear()} Plannily. AI-First Travel Planning.</p>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default RootLayout;
