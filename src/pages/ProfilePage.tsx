import { useState, useEffect } from 'react';
import { supabase, getProfile, updateProfile } from '../services/supabase';
import { Button } from '../components/common/Button';
import { User, Globe, CreditCard, Loader2, Save } from 'lucide-react';

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>({
        full_name: '',
        country_of_origin: '',
        currency: 'USD',
        language: 'en',
        visas: [],
        citizenships: [],
        travel_preferences: {
            pace: 'balanced',
            interests: []
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                try {
                    const data = await getProfile(user.id);
                    if (data) {
                        setProfile({
                            ...data,
                            // Ensure defaults if null
                            travel_preferences: data.travel_preferences || { pace: 'balanced', interests: [] },
                            visas: data.visas || [],
                            citizenships: data.citizenships || []
                        });
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(user.id, {
                full_name: profile.full_name,
                country_of_origin: profile.country_of_origin,
                currency: profile.currency,
                language: profile.language,
                travel_preferences: profile.travel_preferences,
                visas: profile.visas,
                citizenships: profile.citizenships,
                updated_at: new Date().toISOString()
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const toggleInterest = (interest: string) => {
        const current = profile.travel_preferences.interests || [];
        const updated = current.includes(interest)
            ? current.filter((i: string) => i !== interest)
            : [...current, interest];

        setProfile({
            ...profile,
            travel_preferences: { ...profile.travel_preferences, interests: updated }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 max-w-4xl py-12">
            <h1 className="text-[var(--text-h2)] font-bold text-[var(--color-text)] mb-8 font-serif">Your Profile</h1>

            <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 space-y-8">

                {/* Personal Info */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xl font-bold text-stone-800">
                        <User className="w-5 h-5 text-[var(--color-primary)]" />
                        <h2>Personal Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={profile.full_name || ''}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] outline-none"
                                placeholder="e.g. Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-2">Country of Origin</label>
                            <input
                                type="text"
                                value={profile.country_of_origin || ''}
                                onChange={(e) => setProfile({ ...profile, country_of_origin: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] outline-none"
                                placeholder="e.g. United States"
                            />
                        </div>
                    </div>
                </section>

                <hr className="border-stone-100" />

                {/* Preferences */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xl font-bold text-stone-800">
                        <Globe className="w-5 h-5 text-[var(--color-primary)]" />
                        <h2>Travel Preferences</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-2">Preferred Currency</label>
                            <select
                                value={profile.currency}
                                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] outline-none bg-white"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="JPY">JPY (¥)</option>
                                <option value="AUD">AUD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-2">Language</label>
                            <select
                                value={profile.language}
                                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] outline-none bg-white"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="ja">Japanese</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-3">Interests</label>
                        <div className="flex flex-wrap gap-2">
                            {['History', 'Art', 'Food', 'Nature', 'Adventure', 'Relaxation', 'Nightlife', 'Shopping'].map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => toggleInterest(interest)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${profile.travel_preferences.interests?.includes(interest)
                                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <hr className="border-stone-100" />

                {/* Legal / Visas */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xl font-bold text-stone-800">
                        <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                        <h2>Visas & Citizenship</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-2">Citizenships (Comma separated)</label>
                            <input
                                type="text"
                                value={profile.citizenships?.join(', ') || ''}
                                onChange={(e) => setProfile({ ...profile, citizenships: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] outline-none"
                                placeholder="e.g. USA, Canada"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-2">Active Visas (Comma separated)</label>
                            <input
                                type="text"
                                value={profile.visas?.join(', ') || ''}
                                onChange={(e) => setProfile({ ...profile, visas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-[var(--color-primary)] outline-none"
                                placeholder="e.g. Schengen, Japan Tourist"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-stone-400">
                        * This information helps us provide better travel advice regarding entry requirements.
                    </p>
                </section>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving} className="w-full md:w-auto">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Profile
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
