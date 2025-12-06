/**
 * Generic Cache Service using localStorage
 * Handles expiration and typed data retrieval.
 */

interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiry: number;
}

export const CacheService = {
    /**
     * Set data in cache with a TTL (in minutes)
     */
    set: <T>(key: string, data: T, ttlMinutes: number = 60): void => {
        try {
            const now = Date.now();
            const item: CacheItem<T> = {
                data,
                timestamp: now,
                expiry: now + (ttlMinutes * 60 * 1000)
            };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (error) {
            console.warn('Cache write failed', error);
        }
    },

    /**
     * Get data from cache. Returns null if missing or expired.
     */
    get: <T>(key: string): T | null => {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;

            const item: CacheItem<T> = JSON.parse(itemStr);
            const now = Date.now();

            if (now > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }

            return item.data;
        } catch (error) {
            console.warn('Cache read failed', error);
            return null;
        }
    },

    /**
     * Clear specific key
     */
    remove: (key: string): void => {
        localStorage.removeItem(key);
    },

    /**
     * Clear all keys starting with prefix
     */
    clearPrefix: (prefix: string): void => {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
};
