import { Sun } from "lucide-react";
import { WeatherWidget } from "./WeatherWidget";
import { DailyMotto } from "./DailyMotto";

export function MorningBriefing() {
    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
                <Sun className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-50">Sabah Brifing</h2>
            </div>

            <div className="space-y-4">
                <WeatherWidget />

                <DailyMotto />

                <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500">
                        3 toplantı planlandı • Bugün 5 görev var
                    </p>
                </div>
            </div>
        </div>
    );
}
