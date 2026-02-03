"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Activity, Award, Loader2, AlertCircle } from "lucide-react";
import { supabase, WeeklyStats } from "@/lib/supabaseClient";

export function WeeklyReview() {
    const [stats, setStats] = useState<WeeklyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchWeeklyStats();
    }, []);

    const fetchWeeklyStats = async () => {
        try {
            setLoading(true);
            const mockUserId = "00000000-0000-0000-0000-000000000000";

            const { data, error: rpcError } = await supabase
                .rpc('get_weekly_stats', { p_user_id: mockUserId });

            if (rpcError) throw rpcError;

            setStats(data);
            setError(false);
        } catch (err) {
            console.error("Error fetching weekly stats:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-slate-500 animate-spin" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-slate-400" />
                    <h2 className="text-lg font-semibold text-slate-50">Haftalık Özet</h2>
                </div>
                <div className="flex flex-col items-center justify-center h-32 text-center">
                    <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
                    <p className="text-sm text-slate-400">İstatistikler yüklenemedi</p>
                    <button
                        onClick={fetchWeeklyStats}
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                        Tekrar dene
                    </button>
                </div>
            </div>
        );
    }

    const hasStreakAchievement = stats.streak_days > 3;
    const hasCompletionAchievement = stats.completion_rate > 80;
    const hasAnyAchievement = hasStreakAchievement || hasCompletionAchievement;

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-50">Haftalık Özet</h2>
            </div>

            <div className="space-y-6">
                {/* Completed Tasks */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Tamamlanan Görevler</span>
                        <span className="text-xs font-medium text-emerald-400">
                            +{stats.completion_rate.toFixed(0)}%
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-50">
                            {stats.completed_tasks_count}
                        </span>
                        {stats.completed_tasks_count > 0 && (
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                        )}
                    </div>
                </div>

                {/* Focus Hours */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Odaklanma Saatleri</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-50">
                            {stats.focus_hours}
                        </span>
                        {stats.focus_hours > 0 && (
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                        )}
                    </div>
                </div>

                {/* Streak Days */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Seri Günleri</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-50">
                            {stats.streak_days}
                        </span>
                        {stats.streak_days > 0 && (
                            <span className="text-xs text-slate-500">gün</span>
                        )}
                    </div>
                </div>

                {/* Achievements */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <h3 className="text-sm font-medium text-slate-300">Başarılar</h3>
                    </div>

                    {hasAnyAchievement ? (
                        <div className="space-y-2">
                            {hasStreakAchievement && (
                                <div className="p-2 rounded bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                                    <p className="text-xs text-orange-400">
                                        🔥 {stats.streak_days} günlük seri devam ediyor
                                    </p>
                                </div>
                            )}
                            {hasCompletionAchievement && (
                                <div className="p-2 rounded bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                                    <p className="text-xs text-blue-400">
                                        ⚡ En verimli hafta ({stats.completion_rate.toFixed(0)}% tamamlama)
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-3 rounded bg-slate-800/30 border border-slate-800 text-center">
                            <p className="text-xs text-slate-500">
                                Henüz başarı kazanılmadı
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                                3+ gün seri veya %80+ tamamlama hedefle!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
