"use client";

import { useState } from "react";
import { X, Calendar, MapPin, Type } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface AddEventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onEventAdded: () => void;
}

export function AddEventDialog({ isOpen, onClose, onEventAdded }: AddEventDialogProps) {
    const [name, setName] = useState("");
    const [deadline, setDeadline] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // For now, we'll use a mock user_id since auth isn't set up yet
            // In production, you'd get this from auth.user()
            const mockUserId = "00000000-0000-0000-0000-000000000000";

            const { error: insertError } = await supabase
                .from("events")
                .insert([
                    {
                        user_id: mockUserId,
                        name,
                        deadline: new Date(deadline).toISOString(),
                        location,
                    },
                ]);

            if (insertError) throw insertError;

            // Reset form
            setName("");
            setDeadline("");
            setLocation("");
            onEventAdded();
            onClose();
        } catch (err) {
            console.error("Error adding event:", err);
            setError("Failed to add event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <h2 className="text-xl font-semibold text-slate-50 mb-6">
                    Add New Event
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Event Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <Type className="h-4 w-4" />
                            Event Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., AI Innovation Hackathon"
                        />
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <Calendar className="h-4 w-4" />
                            Deadline
                        </label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            required
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <MapPin className="h-4 w-4" />
                            Location
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., Online or San Francisco"
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-2">
                            {error}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Adding..." : "Add Event"}
                    </button>
                </form>
            </div>
        </div>
    );
}
