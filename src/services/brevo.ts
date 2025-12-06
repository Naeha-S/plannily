const API_KEY = import.meta.env.VITE_BREVO_API_KEY; // Ideally move to import.meta.env.VITE_BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export interface EmailData {
    to: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
    sender?: { email: string; name: string };
}

/**
 * Sends a transactional email using Brevo API.
 * NOTE: For Auth emails (Signup/Reset), configure SMTP in Supabase Dashboard instead.
 * This function is for other app notifications (e.g. Booking Confirmation, Share Trip).
 */
export const sendEmail = async (data: EmailData) => {
    try {
        const response = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: data.sender || { name: 'Plannily', email: 'no-reply@plannily.com' },
                to: data.to,
                subject: data.subject,
                htmlContent: data.htmlContent
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Brevo API Error: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to send email via Brevo:', error);
        throw error;
    }
};
