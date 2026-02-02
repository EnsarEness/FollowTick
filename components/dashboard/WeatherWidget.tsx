"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, CloudSnow, CloudDrizzle, Loader2 } from "lucide-react";

interface WeatherData {
    temperature: number;
    weatherCode: number;
    description: string;
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchWeather() {
            try {
                const response = await fetch(
                    "https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code&timezone=Europe/Istanbul"
                );

                if (!response.ok) throw new Error("Failed to fetch weather");

                const data = await response.json();
                const weatherCode = data.current.weather_code;

                setWeather({
                    temperature: Math.round(data.current.temperature_2m),
                    weatherCode,
                    description: getWeatherDescription(weatherCode),
                });
                setLoading(false);
            } catch (err) {
                console.error("Weather fetch error:", err);
                setError(true);
                setLoading(false);
            }
        }

        fetchWeather();
    }, []);

    function getWeatherDescription(code: number): string {
        if (code === 0) return "Açık";
        if (code <= 3) return "Parçalı Bulutlu";
        if (code <= 48) return "Sisli";
        if (code <= 67) return "Yağmurlu";
        if (code <= 77) return "Karlı";
        if (code <= 82) return "Sağanak Yağışlı";
        return "Fırtınalı";
    }

    function getWeatherIcon(code: number) {
        const iconClass = "h-5 w-5";

        if (code === 0) return <Sun className={`${iconClass} text-yellow-400`} />;
        if (code <= 3) return <Cloud className={`${iconClass} text-slate-400`} />;
        if (code <= 48) return <Cloud className={`${iconClass} text-slate-500`} />;
        if (code <= 67) return <CloudRain className={`${iconClass} text-blue-400`} />;
        if (code <= 77) return <CloudSnow className={`${iconClass} text-blue-300`} />;
        if (code <= 82) return <CloudDrizzle className={`${iconClass} text-blue-500`} />;
        return <CloudRain className={`${iconClass} text-slate-600`} />;
    }

    if (loading) {
        return (
            <div className="flex items-start gap-3">
                <Loader2 className="h-4 w-4 text-slate-500 mt-1 animate-spin" />
                <div>
                    <p className="text-sm font-medium text-slate-300">Hava Durumu</p>
                    <p className="text-xs text-slate-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className="flex items-start gap-3">
                <Cloud className="h-4 w-4 text-slate-500 mt-1" />
                <div>
                    <p className="text-sm font-medium text-slate-300">Hava Durumu</p>
                    <p className="text-xs text-slate-500">Veri alınamadı</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3">
            {getWeatherIcon(weather.weatherCode)}
            <div>
                <p className="text-sm font-medium text-slate-300">Hava Durumu</p>
                <p className="text-xs text-slate-500">
                    {weather.description}, {weather.temperature}°C
                </p>
            </div>
        </div>
    );
}
