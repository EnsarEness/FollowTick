"use client";

import { useEffect, useState } from "react";
import { Radar, Calendar, MapPin, Plus, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { supabase, Event } from "@/lib/supabaseClient";
import { AddEventDialog } from "./AddEventDialog";

export function HackathonRadar() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from("events")
                .select("*")
                .in("type", ["hackathon", "internship"]) // Only show hackathon/internship
                .order("deadline", { ascending: true });

            if (fetchError) throw fetchError;
            setEvents(data || []);
            setError(false);
        } catch (err) {
            console.error("Error fetching events:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (id: string, name: string) => {
        if (!confirm(`"${name}" etkinliğini silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", id);

            if (error) throw error;
            fetchEvents(); // Refresh list
        } catch (err) {
            console.error("Error deleting event:", err);
            alert("Etkinlik silinirken hata oluştu");
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const getDaysUntilDeadline = (deadline: string): number => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getCountdownColor = (daysLeft: number): string => {
        if (daysLeft <= 3) return "bg-red-500";
        if (daysLeft <= 7) return "bg-amber-500";
        return "bg-emerald-500";
    };

    const getCountdownTextColor = (daysLeft: number): string => {
        if (daysLeft <= 3) return "text-red-400";
        if (daysLeft <= 7) return "text-amber-400";
        return "text-emerald-400";
    };

    const formatDeadline = (deadline: string): string => {
        const date = new Date(deadline);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Radar className="h-5 w-5 text-slate-400" />
                    <h2 className="text-lg font-semibold text-slate-50">Hackathon Radarı</h2>
                </div>
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Event
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                        <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
                        <p className="text-sm text-slate-400">Failed to load events</p>
                        <button
                            onClick={fetchEvents}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                        >
                            Try again
                        </button>
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                        <p className="text-sm text-slate-400 mb-2">No events yet</p>
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                        >
                            Add your first event
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {events.map((event) => {
                            const daysLeft = getDaysUntilDeadline(event.deadline);
                            const isUrgent = daysLeft <= 3;

                            return (
                                <div
                                    key={event.id}
                                    className="p-3 rounded-md bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-sm font-medium text-slate-200 flex-1">
                                            {event.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {isUrgent && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                                                    Urgent
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteEvent(event.id, event.name);
                                                }}
                                                className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDeadline(event.deadline)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>

                                    {/* Countdown progress bar */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className={getCountdownTextColor(daysLeft)}>
                                                {daysLeft > 0 ? `${daysLeft} gün kaldı` : daysLeft === 0 ? "Bugün!" : "Süresi doldu"}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getCountdownColor(daysLeft)} rounded-full transition-all`}
                                                style={{
                                                    width: daysLeft > 0 ? `${Math.min((daysLeft / 30) * 100, 100)}%` : "0%"
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <AddEventDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onEventAdded={fetchEvents}
            />
        </div>
    );
}

