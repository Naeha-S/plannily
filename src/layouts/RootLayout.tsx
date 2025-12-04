import { Outlet, Link } from 'react-router-dom';
import { Map, User, Menu } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                    <Map className="h-6 w-6" />
                    <span>Plannily</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/discover" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                        Discover
                    </Link>
                    <Link to="/plan" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                        Plan
                    </Link>
                    <Link to="/saved" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                        Saved Trips
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <button className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors">
                        <User className="h-5 w-5" />
                    </button>
                    <button className="md:hidden rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors">
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

const RootLayout = () => {
    return (
        <div className="min-h-screen bg-background text-text font-sans">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <footer className="border-t border-slate-200 bg-white py-8 mt-20">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} Plannily. AI-First Travel Planning.</p>
                </div>
            </footer>
        </div>
    );
};

export default RootLayout;
