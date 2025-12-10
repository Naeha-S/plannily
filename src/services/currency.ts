
const CURRENCY_API_KEY = import.meta.env.VITE_CURRENCY_API_KEY;
const BASE_URL = 'https://api.currencyapi.com/v3/latest';

export interface ExchangeRate {
    rate: number;
    base: string;
    target: string;
    lastUpdated: string;
}

export const getExchangeRate = async (targetCurrency: string, baseCurrency: string = 'USD'): Promise<ExchangeRate | null> => {
    try {
        if (!CURRENCY_API_KEY) {
            console.warn('Missing Currency API Key');
            // Return mock data if key missing to prevent crash
            return { rate: 1, base: 'USD', target: targetCurrency, lastUpdated: new Date().toISOString() };
        }

        // Note: Free tier usually locks base_currency to USD.
        // We will fetch USD -> Target and USD -> Base (if not USD), then calculate Base -> Target.

        // 1. Fetch Rates (Getting all or specific to save bandwidth? Free tier usually returns all or allows comma separation)
        // Let's try to fetch specific symbols to minimize response
        const url = `${BASE_URL}?apikey=${CURRENCY_API_KEY}&currencies=${targetCurrency},${baseCurrency}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Currency API Failed');

        const data = await response.json();
        // data structure: { meta: {...}, data: { "EUR": { "code": "EUR", "value": 0.9 }, "USD": { ... } } }

        const rates = data.data;
        const targetRate = rates[targetCurrency]?.value;
        const baseRate = rates[baseCurrency]?.value;

        if (!targetRate) return null;

        // Calculate Cross Rate: (USD -> Target) / (USD -> Base)
        // If Base is USD, baseRate should be 1.

        // If base currency is not in response (e.g. invalid), assume 1 if it was USD, else optional fail.
        const safeBaseRate = baseRate || (baseCurrency === 'USD' ? 1 : null);

        if (!safeBaseRate) return null;

        const crossRate = targetRate / safeBaseRate;

        return {
            rate: crossRate,
            base: baseCurrency,
            target: targetCurrency,
            lastUpdated: data.meta.last_updated_at
        };
    } catch (error) {
        console.error('Exchange Rate Error:', error);
        return null;
    }
};
