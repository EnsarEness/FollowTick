"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface Event {
    id: string;
    name: string;
    deadline: string;
    location?: string;
    type: string;
}

export function TodaysSchedule() {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        fetchTodaysEvents();
    }, []);

    const fetchTodaysEvents = async () => {
        try {
            const mockUserId = "00000000-0000-0000-0000-000000000000";
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("user_id", mockUserId)
                .gte("deadline", today.toISOString())
                .lt("deadline", tomorrow.toISOString())
                .order("deadline", { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error("Error fetching today's events:", err);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "hackathon":
                return "🏆";
            case "internship":
                return "💼";
            case "course":
                return "🎓";
            default:
                return "📅";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "hackathon":
                return "bg-red-500/10 border-red-500/20";
            case "internship":
                return "bg-blue-500/10 border-blue-500/20";
            case "course":
                return "bg-purple-500/10 border-purple-500/20";
            default:
                return "bg-slate-500/10 border-slate-500/20";
        }
    };

    return (
        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-slate-50">Today's Schedule</h2>
                </div>
                <span className="text-xs text-slate-400">
                    {format(new Date(), "EEEE, MMM d")}
                </span>
            </div>

            {events.length === 0 ? (
                <div className="py-8 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                    <p className="text-sm text-slate-400">No events scheduled for today</p>
                    <p className="text-xs text-slate-500 mt-1">Enjoy your free day! 🎉</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className={`p-3 rounded-lg border ${getTypeColor(event.type)} transition-all hover:scale-[1.02]`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{getTypeIcon(event.type)}</span>
                                        <h3 className="font-medium text-slate-200 text-sm">
                                            {event.name}
                                        </h3>
                                    </div>
                                    {event.location && (
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Clock className="h-3 w-3" />
                                            <span>{event.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 text-center">
                    {events.length} event{events.length !== 1 ? "s" : ""} today
                </p>
            </div>
        </div>
    );
}
