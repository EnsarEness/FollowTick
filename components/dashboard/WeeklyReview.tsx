"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Activity, Award, Loader2, AlertCircle, BarChart3 } from "lucide-react";
import { supabase, WeeklyStats } from "@/lib/supabaseClient";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';

interface DailyCompletion {
    day: string;
    count: number;
}

export function WeeklyReview() {
    const [stats, setStats] = useState<WeeklyStats | null>(null);
    const [dailyData, setDailyData] = useState<DailyCompletion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchWeeklyStats();
        fetchDailyCompletions();
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

    const fetchDailyCompletions = async () => {
        try {
            const mockUserId = "00000000-0000-0000-0000-000000000000";
            const now = new Date();
            const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

            // Fetch all completed todos from this week
            const { data: todos, error } = await supabase
                .from("todos")
                .select("completed_at")
                .eq("user_id", mockUserId)
                .eq("completed", true)
                .not("completed_at", "is", null)
                .gte("completed_at", weekStart.toISOString())
                .lte("completed_at", weekEnd.toISOString());

            if (error) throw error;

            // Get all days of the week
            const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

            // Count completions per day
            const dailyCounts = daysOfWeek.map(day => {
                const count = todos?.filter(todo =>
                    isSameDay(new Date(todo.completed_at!), day)
                ).length || 0;

                return {
                    day: format(day, 'EEE'), // Mon, Tue, Wed...
                    count
                };
            });

            setDailyData(dailyCounts);
        } catch (err) {
            console.error("Error fetching daily completions:", err);
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
                {/* Weekly Chart */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-emerald-400" />
                        <h3 className="text-sm font-medium text-slate-300">Bu Hafta</h3>
                    </div>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                <XAxis
                                    dataKey="day"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                    name="Tamamlanan"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                    {/* Completed Tasks */}
                    <div className="space-y-1">
                        <span className="text-xs text-slate-500">Tamamlanan</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-slate-50">
                                {stats.completed_tasks_count}
                            </span>
                            {stats.completed_tasks_count > 0 && (
                                <TrendingUp className="h-3 w-3 text-emerald-400" />
                            )}
                        </div>
                    </div>

                    {/* Focus Hours */}
                    <div className="space-y-1">
                        <span className="text-xs text-slate-500">Odaklanma</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-slate-50">
                                {stats.focus_hours}
                            </span>
                            <span className="text-xs text-slate-500">sa</span>
                        </div>
                    </div>

                    {/* Streak Days */}
                    <div className="space-y-1">
                        <span className="text-xs text-slate-500">Seri</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-slate-50">
                                {stats.streak_days}
                            </span>
                            <span className="text-xs text-slate-500">gün</span>
                        </div>
                    </div>
                </div>

                {/* Achievements */}
                <div className="pt-4 border-t border-slate-800">
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
