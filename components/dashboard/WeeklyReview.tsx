import { TrendingUp, Activity, Award } from "lucide-react";

export function WeeklyReview() {
    const stats = [
        { label: "Tamamlanan Görevler", value: "24", change: "+12%", trend: "up" },
        { label: "Odaklanma Saatleri", value: "32", change: "+8%", trend: "up" },
        { label: "Seri Günleri", value: "7", change: "0%", trend: "neutral" },
    ];

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-50">Haftalık Özet</h2>
            </div>

            <div className="space-y-6">
                {stats.map((stat, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">{stat.label}</span>
                            <span className={`text-xs font-medium ${stat.trend === "up"
                                ? "text-emerald-400"
                                : "text-slate-500"
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-50">{stat.value}</span>
                            {stat.trend === "up" && (
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            )}
                        </div>
                    </div>
                ))}

                <div className="mt-8 pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <h3 className="text-sm font-medium text-slate-300">Başarılar</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="p-2 rounded bg-slate-800/30 border border-slate-800">
                            <p className="text-xs text-slate-400">🔥 7 günlük seri devam ediyor</p>
                        </div>
                        <div className="p-2 rounded bg-slate-800/30 border border-slate-800">
                            <p className="text-xs text-slate-400">⚡ En verimli hafta</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
