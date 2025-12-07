import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LegalLayout = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-stone-50 py-12 px-6 font-sans">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={16} /> Back to Home
                </button>
                <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-stone-900 mb-8 border-b border-stone-100 pb-4">{title}</h1>
                    <div className="prose prose-stone prose-headings:font-bold prose-a:text-indigo-600">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PrivacyPage = () => (
    <LegalLayout title="Privacy Policy">
        <h3>1. Introduction</h3>
        <p>Welcome to Plannily ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website plannily.com.</p>

        <h3>2. Information We Collect</h3>
        <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.</p>

        <h3>3. Use of Information</h3>
        <p>We use the information we collect or receive to:</p>
        <ul>
            <li>Facilitate account creation and logon process.</li>
            <li>Send you administrative information.</li>
            <li>Fulfill and manage your orders.</li>
            <li>Post testimonials.</li>
            <li>Request feedback.</li>
            <li>Administer prize draws and competitions.</li>
        </ul>

        <h3>4. Disclosure of Information</h3>
        <p>We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, or Legal Obligations.</p>

        <h3>5. Contact Us</h3>
        <p>If you have questions or comments about this policy, you may email us at privacy@plannily.com.</p>
    </LegalLayout>
);

export const TermsPage = () => (
    <LegalLayout title="Terms of Use">
        <h3>1. Agreement to Terms</h3>
        <p>These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Plannily (“we,” “us” or “our”), concerning your access to and use of the plannily.com website.</p>

        <h3>2. Intellectual Property Rights</h3>
        <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us.</p>

        <h3>3. User Representations</h3>
        <p>By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.</p>

        <h3>4. Prohibited Activities</h3>
        <p>You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>

        <h3>5. Third-Party Services & Credits</h3>
        <p>Our service utilizes various third-party APIs and resources to provide travel data and features. We acknowledge and credit the following providers:</p>
        <ul>
            <li><strong>Amadeus API:</strong> For flight and hotel search capabilities.</li>
            <li><strong>RapidAPI (Visa Requirements):</strong> For visa information data.</li>
            <li><strong>Unsplash:</strong> For placeholder and destination images.</li>
            <li><strong>ElevenLabs:</strong> For text-to-speech voice synthesis.</li>
            <li><strong>HuggingFace:</strong> For AI language model processing.</li>
            <li><strong>Supabase:</strong> For authentication and database services.</li>
        </ul>
    </LegalLayout>
);

export const ContactPage = () => (
    <LegalLayout title="Contact Us">
        <p>We'd love to hear from you! Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.</p>

        <h3>Get in Touch</h3>
        <p><strong>Email:</strong> support@plannily.com</p>
        <p><strong>Phone:</strong> +1 (555) 123-4567</p>
        <p><strong>Address:</strong><br />
            123 Innovation Dr,<br />
            Tech City, TC 94043</p>

        <h3>Support Hours</h3>
        <p>Monday - Friday: 9:00 AM - 6:00 PM (EST)</p>
    </LegalLayout>
);
