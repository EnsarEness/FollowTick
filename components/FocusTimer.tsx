"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, Timer } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface FocusTimerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FocusTimer({ isOpen, onClose }: FocusTimerProps) {
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [completedToday, setCompletedToday] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            fetchCompletedSessions();
        }
    }, [isOpen]);

    const fetchCompletedSessions = async () => {
        try {
            const mockUserId = "00000000-0000-0000-0000-000000000000";
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from("focus_sessions")
                .select("*")
                .eq("user_id", mockUserId)
                .gte("started_at", today.toISOString());

            if (error) throw error;
            setCompletedToday(data?.length || 0);
        } catch (err) {
            console.error("Error fetching completed sessions:", err);
        }
    };

    const handleTimerComplete = async () => {
        setIsRunning(false);

        // Play notification sound
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.volume = 0.5;
        audio.play().catch(err => console.log("Audio play failed:", err));

        // Save to Supabase
        if (startTime) {
            try {
                const mockUserId = "00000000-0000-0000-0000-000000000000";
                const { error } = await supabase
                    .from("focus_sessions")
                    .insert({
                        user_id: mockUserId,
                        duration_minutes: 30,
                        started_at: startTime.toISOString(),
                    });

                if (error) throw error;
                console.log("Focus session saved!");
                fetchCompletedSessions();
            } catch (err) {
                console.error("Error saving focus session:", err);
            }
        }
    };

    const handleStart = () => {
        if (!isRunning && !startTime) {
            setStartTime(new Date());
        }
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(30 * 60);
        setStartTime(null);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (!isOpen) return null;

    const progress = ((30 * 60 - timeLeft) / (30 * 60)) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Timer className="h-6 w-6 text-purple-400" />
                        <h2 className="text-2xl font-bold text-slate-50">Focus Mode</h2>
                    </div>
                    <p className="text-sm text-slate-400">Stay focused for 30 minutes</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                        <span className="text-xs text-purple-400 font-medium">🍅 Today: {completedToday} sessions</span>
                    </div>
                </div>

                {/* Timer Display */}
                <div className="relative mb-8">
                    <div className="text-center">
                        <div className="text-7xl font-bold text-slate-50 mb-4 font-mono">
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* Progress Ring */}
                    <div className="relative w-48 h-48 mx-auto">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-slate-700"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 88}`}
                                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                                className="text-purple-500 transition-all duration-1000"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                    {!isRunning ? (
                        <button
                            onClick={handleStart}
                            className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                        >
                            <Play className="h-4 w-4" />
                            {timeLeft === 30 * 60 ? "Start" : "Resume"}
                        </button>
                    ) : (
                        <button
                            onClick={handlePause}
                            className="flex items-center gap-2 rounded-lg bg-slate-700 px-6 py-3 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
                        >
                            <Pause className="h-4 w-4" />
                            Pause
                        </button>
                    )}

                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-lg bg-slate-800 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                </div>

                {/* Status */}
                {timeLeft === 0 && (
                    <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <p className="text-sm text-emerald-400 font-medium">
                            🎉 Focus session complete! Great work!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
