import { useState, useEffect, useRef } from 'react';
import { supabase, getProfile, updateProfile } from '../services/supabase';
import { Button } from '../components/common/Button';
import { User, Globe, CreditCard, Loader2, Save, Camera, Upload } from 'lucide-react';
import { useLocalization } from '../context/LocalizationContext';

const ProfilePage = () => {
    const { setLanguage, setCurrency } = useLocalization();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>({
        full_name: '',
        avatar_url: '',
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

                    // Check metadata for interests if profile is empty (first time login)
                    let interestsFromMeta = [];
                    if (user.user_metadata?.travel_preferences?.interests) {
                        interestsFromMeta = user.user_metadata.travel_preferences.interests;
                    }

                    if (data) {
                        setProfile({
                            ...data,
                            // Ensure defaults if null
                            travel_preferences: data.travel_preferences || { pace: 'balanced', interests: interestsFromMeta },
                            visas: data.visas || [],
                            citizenships: data.citizenships || [],
                            avatar_url: data.avatar_url || ''
                        });
                        if (data.language) setLanguage(data.language);
                        if (data.currency) setCurrency(data.currency);
                        if (data.avatar_url) setAvatarPreview(data.avatar_url);
                    } else if (interestsFromMeta.length > 0) {
                        // Profile doesn't exist but metadata does (e.g. fresh signup)
                        setProfile((prev: { travel_preferences: any; }) => ({
                            ...prev,
                            travel_preferences: { ...prev.travel_preferences, interests: interestsFromMeta }
                        }));
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
                // avatar_url: profile.avatar_url,
                country_of_origin: profile.country_of_origin,
                currency: profile.currency,
                language: profile.language,
                travel_preferences: profile.travel_preferences,
                visas: profile.visas,
                citizenships: profile.citizenships,
                updated_at: new Date().toISOString()
            });
            // Update Global Context
            setLanguage(profile.language);
            setCurrency(profile.currency);

            alert('Profile updated successfully! (Avatar is local-only)');
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

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500000) { // 500kb limit
                alert("Image is too large. Please use an image under 500KB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setAvatarPreview(base64String);
                setProfile({ ...profile, avatar_url: base64String });
            };
            reader.readAsDataURL(file);
        }
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

            <form onSubmit={handleSave} className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-border)] p-8 space-y-8 transition-colors duration-300">

                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-surface)] shadow-lg ${!avatarPreview ? 'bg-[var(--color-secondary)] flex items-center justify-center' : ''}`}>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-[var(--color-text-muted)]" />
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[var(--color-primary)] p-2 rounded-full text-white shadow-md">
                            <Upload className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">Click to update profile picture</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        className="hidden"
                        accept="image/*"
                    />
                </div>

                <hr className="border-[var(--color-border)]" />

                {/* Personal Info */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
                        <User className="w-5 h-5 text-[var(--color-primary)]" />
                        <h2>Personal Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Full Name</label>
                            <input
                                type="text"
                                value={profile.full_name || ''}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none bg-[var(--color-input)] text-[var(--color-text)]"
                                placeholder="e.g. Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Country of Origin</label>
                            <input
                                type="text"
                                value={profile.country_of_origin || ''}
                                onChange={(e) => setProfile({ ...profile, country_of_origin: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none bg-[var(--color-input)] text-[var(--color-text)]"
                                placeholder="e.g. United States"
                            />
                        </div>
                    </div>
                </section>

                <hr className="border-[var(--color-border)]" />

                {/* Preferences */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
                        <Globe className="w-5 h-5 text-[var(--color-primary)]" />
                        <h2>Travel Preferences</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Preferred Currency</label>
                            <select
                                value={profile.currency}
                                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none bg-[var(--color-input)] text-[var(--color-text)]"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="JPY">JPY (¥)</option>
                                <option value="AUD">AUD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Language</label>
                            <select
                                value={profile.language}
                                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none bg-[var(--color-input)] text-[var(--color-text)]"
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
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-3">Interests</label>
                        <div className="flex flex-wrap gap-2">
                            {['History', 'Art', 'Food', 'Nature', 'Adventure', 'Relaxation', 'Nightlife', 'Shopping'].map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => toggleInterest(interest)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${profile.travel_preferences.interests?.includes(interest)
                                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                                        : 'bg-[var(--color-background)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                        }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <hr className="border-[var(--color-border)]" />

                {/* Legal / Visas */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
                        <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                        <h2>Visas & Citizenship</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Citizenships (Comma separated)</label>
                            <input
                                type="text"
                                value={profile.citizenships?.join(', ') || ''}
                                onChange={(e) => setProfile({ ...profile, citizenships: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none bg-[var(--color-input)] text-[var(--color-text)]"
                                placeholder="e.g. USA, Canada"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Active Visas (Comma separated)</label>
                            <input
                                type="text"
                                value={profile.visas?.join(', ') || ''}
                                onChange={(e) => setProfile({ ...profile, visas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none bg-[var(--color-input)] text-[var(--color-text)]"
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
        </div >
    );
};

export default ProfilePage;
