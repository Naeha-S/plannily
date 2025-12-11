interface WeatherData {
    latitude: number;
    longitude: number;
    current_weather: {
        temperature: number;
        windspeed: number;
        winddirection: number;
        weathercode: number;
        time: string;
    }
}

export const getWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
};

export const getWeatherCondition = (code: number): string => {
    // WMO Weather interpretation codes (WW)
    if (code === 0) return 'Clear sky';
    if (code >= 1 && code <= 3) return 'Mainly clear, partly cloudy, and overcast';
    if (code >= 45 && code <= 48) return 'Fog and depositing rime fog';
    if (code >= 51 && code <= 55) return 'Drizzle: Light, moderate, and dense intensity';
    if (code >= 56 && code <= 57) return 'Freezing Drizzle: Light and dense intensity';
    if (code >= 61 && code <= 65) return 'Rain: Slight, moderate and heavy intensity';
    if (code >= 66 && code <= 67) return 'Freezing Rain: Light and heavy intensity';
    if (code >= 71 && code <= 75) return 'Snow fall: Slight, moderate, and heavy intensity';
    if (code === 77) return 'Snow grains';
    if (code >= 80 && code <= 82) return 'Rain showers: Slight, moderate, and violent';
    if (code >= 85 && code <= 86) return 'Snow showers slight and heavy';
    if (code === 95) return 'Thunderstorm: Slight or moderate';
    if (code >= 96 && code <= 99) return 'Thunderstorm with slight and heavy hail';
    return 'Unknown';
};
