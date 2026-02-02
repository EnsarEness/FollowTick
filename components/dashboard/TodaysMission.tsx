import { Target, CheckCircle2, Circle, Clock } from "lucide-react";

export function TodaysMission() {
    const tasks = [
        { id: 1, title: "Pull request'leri incele", status: "completed", priority: "yüksek" },
        { id: 2, title: "Dashboard v2.0'ı yayınla", status: "in-progress", priority: "yüksek" },
        { id: 3, title: "Saat 14:00'te takım toplantısı", status: "pending", priority: "orta" },
        { id: 4, title: "Dokümantasyonu güncelle", status: "pending", priority: "düşük" },
        { id: 5, title: "Sprint hedeflerini planla", status: "pending", priority: "orta" },
    ];

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
                <Target className="h-5 w-5 text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-50">Bugünün Görevi</h2>
            </div>

            <div className="space-y-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center gap-3 p-4 rounded-md bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors group"
                    >
                        {task.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        ) : task.status === "in-progress" ? (
                            <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                        ) : (
                            <Circle className="h-5 w-5 text-slate-600 flex-shrink-0 group-hover:text-slate-500" />
                        )}

                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.status === "completed"
                                ? "text-slate-500 line-through"
                                : "text-slate-200"
                                }`}>
                                {task.title}
                            </p>
                        </div>

                        <span className={`text-xs px-2 py-1 rounded-full ${task.priority === "yüksek"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : task.priority === "orta"
                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                : "bg-slate-700/50 text-slate-400 border border-slate-700"
                            }`}>
                            {task.priority}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">İlerleme</span>
                    <span className="text-slate-300 font-medium">1/5 tamamlandı</span>
                </div>
                <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[20%] rounded-full" />
                </div>
            </div>
        </div>
    );
}
