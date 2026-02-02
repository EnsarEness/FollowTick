"use client";

import { useState } from "react";
import { X, Target } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface AddTodoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onTodoAdded: () => void;
    defaultType?: 'big' | 'medium' | 'small';
}

export function AddTodoDialog({ isOpen, onClose, onTodoAdded, defaultType = 'medium' }: AddTodoDialogProps) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<'big' | 'medium' | 'small'>(defaultType);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const mockUserId = "00000000-0000-0000-0000-000000000000";

            const { error: insertError } = await supabase
                .from("todos")
                .insert([
                    {
                        user_id: mockUserId,
                        title,
                        type,
                        completed: false,
                    },
                ]);

            if (insertError) throw insertError;

            setTitle("");
            setType(defaultType);
            onTodoAdded();
            onClose();
        } catch (err) {
            console.error("Error adding todo:", err);
            setError("Failed to add task. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-semibold text-slate-50 mb-6">
                    Add New Task
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <Target className="h-4 w-4" />
                            Task Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                            Task Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('big')}
                                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${type === 'big'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                Big One
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('medium')}
                                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${type === 'medium'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                Medium
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('small')}
                                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${type === 'small'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                Small
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Adding..." : "Add Task"}
                    </button>
                </form>
            </div>
        </div>
    );
}
