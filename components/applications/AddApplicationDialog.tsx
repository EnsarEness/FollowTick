"use client";

import { useState } from "react";
import { X, Loader2, Calendar, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Simple Dialog implementation
function CustomDialog({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

interface AddApplicationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdded: () => void;
}

export function AddApplicationDialog({ isOpen, onClose, onAdded }: AddApplicationDialogProps) {
    const [loading, setLoading] = useState(false);

    // Form fields
    const [mode, setMode] = useState<'planned' | 'applied'>('applied'); // "Başvuracağım" vs "Başvurdum"
    const [title, setTitle] = useState("");
    const [type, setType] = useState<string>("internship");
    const [date, setDate] = useState(""); // announcement_date OR deadline
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!title || !type) return;
        // Deadline is required for planned, but announcement date is optional for applied
        if (mode === 'planned' && !date) {
            alert("Lütfen son başvuru tarihini giriniz.");
            return;
        }

        try {
            setLoading(true);
            const mockUserId = "00000000-0000-0000-0000-000000000000";

            const payload: any = {
                user_id: mockUserId,
                title,
                type,
                notes: notes || null,
                status: mode === 'planned' ? 'planned' : 'pending',
            };

            if (mode === 'planned') {
                payload.deadline = new Date(date).toISOString();
            } else if (date) {
                payload.announcement_date = new Date(date).toISOString();
            }

            const { error } = await supabase
                .from("applications")
                .insert([payload]);

            if (error) throw error;

            // Reset and close
            setTitle("");
            setType("internship");
            setDate("");
            setNotes("");
            setMode("applied");
            onAdded();
            onClose();
        } catch (err) {
            console.error("Error adding application:", err);
            alert("Başvuru eklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomDialog isOpen={isOpen} onClose={onClose} title="Yeni Başvuru Ekle">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Mode Selection */}
                <div className="flex p-1 bg-slate-800 rounded-lg mb-4">
                    <button
                        type="button"
                        onClick={() => setMode('applied')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'applied'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Başvurdum
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('planned')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'planned'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Başvuracağım
                    </button>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Başvuru Adı</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: Google Yaz Stajı"
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                        required
                    />
                </div>

                {/* Type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Tür</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                    >
                        <option value="internship">💼 Staj</option>
                        <option value="hackathon">🏆 Hackathon</option>
                        <option value="ideathon">💡 İdeathon</option>
                        <option value="career_day">🤝 Career Day</option>
                        <option value="course">🎓 Eğitim</option>
                    </select>
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">
                        {mode === 'planned' ? 'Son Başvuru Tarihi' : 'Açıklanma Tarihi (Opsiyonel)'}
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                            required={mode === 'planned'}
                        />
                    </div>
                    {mode === 'applied' && (
                        <p className="text-xs text-slate-500">Belli değilse boş bırakabilirsiniz.</p>
                    )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Notlar (Opsiyonel)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ek bilgiler..."
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none min-h-[80px]"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
                        disabled={loading}
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Kaydet
                    </button>
                </div>
            </form>
        </CustomDialog>
    );
}
