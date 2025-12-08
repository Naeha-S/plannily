const HOLIDAY_API_KEY = '73770d86-20d4-47b8-9d33-b0eadca81371';

export interface PublicHoliday {
    name: string;
    date: string;
    observed: string;
    public: boolean;
    country: string;
    uuid: string;
}

// Cache to prevent API spam
const holidayCache: Record<string, PublicHoliday[]> = {};

export const getHolidays = async (countryCode: string, year: number = new Date().getFullYear()): Promise<PublicHoliday[]> => {
    const cacheKey = `${countryCode}-${year}`;
    if (holidayCache[cacheKey]) return holidayCache[cacheKey];

    try {
        // Note: Free tier of holidayapi.com often requires historical data (last year).
        // If this fails for current year, we might need fallback or previous year data.
        const response = await fetch(`https://holidayapi.com/v1/holidays?key=${HOLIDAY_API_KEY}&country=${countryCode}&year=${year}&pretty=true`);

        if (!response.ok) {
            // Fallback: Try previous year if current year fails (common free tier limit)
            if (year === new Date().getFullYear()) {
                console.warn(`Holiday API failed for ${year}, trying ${year - 1}`);
                return getHolidays(countryCode, year - 1);
            }
            throw new Error(`Holiday API Error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.holidays && Array.isArray(data.holidays)) {
            holidayCache[cacheKey] = data.holidays;
            return data.holidays;
        }
        return [];
    } catch (error) {
        console.warn('Failed to fetch holidays:', error);
        return [];
    }
};

// Helper: Check if a date range has holidays
export const checkHolidaysForDateRange = async (countryCode: string, startDate: string, days: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + days);

    const year = start.getFullYear();
    const holidays = await getHolidays(countryCode, year);

    // Also fetch next year if trip spans across years
    if (end.getFullYear() > year) {
        const nextYearHolidays = await getHolidays(countryCode, year + 1);
        holidays.push(...nextYearHolidays);
    }

    return holidays.filter((h: PublicHoliday) => {
        const hDate = new Date(h.date);
        return hDate >= start && hDate <= end;
    });
};
