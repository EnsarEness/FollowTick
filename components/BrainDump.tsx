"use client";

import { useEffect, useState, useRef } from "react";
import { Brain, X, Plus, Trash2, Pin, PinOff, Loader2, Wand2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Note {
    id: string;
    content: string;
    is_pinned: boolean;
    created_at: string;
}

export function BrainDump() {
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const mockUserId = "00000000-0000-0000-0000-000000000000";

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("notes")
                .select("*")
                .order("is_pinned", { ascending: false })
                .order("created_at", { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (err) {
            console.error("Error fetching notes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotes();
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleAddNote = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newNote.trim() || isSubmitting) return;

        const optimisitcNote: Note = {
            id: 'temp-' + Date.now(),
            content: newNote.trim(),
            is_pinned: false,
            created_at: new Date().toISOString()
        };

        // Optimistic Update
        setNotes(prev => [optimisitcNote, ...prev]);
        setNewNote(""); // Clear immediately
        setIsSubmitting(true);

        // Keep focus
        inputRef.current?.focus();

        try {
            const { error } = await supabase
                .from("notes")
                .insert([{
                    user_id: mockUserId,
                    content: optimisitcNote.content,
                    is_pinned: false
                }]);

            if (error) throw error;
            // Real fetch to get actual ID and order
            fetchNotes();
        } catch (err) {
            console.error("Error adding note:", err);
            // Revert on error
            setNotes(prev => prev.filter(n => n.id !== optimisitcNote.id));
            setNewNote(optimisitcNote.content); // Restore content
            alert("Not eklenirken hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddNote();
        }
    };

    const [magicLoadingId, setMagicLoadingId] = useState<string | null>(null);

    const handleMagic = async (note: Note) => {
        try {
            console.log("Sihirli Asistan başlatıldı:", note.id);
            setMagicLoadingId(note.id);
            const response = await fetch('/api/magic-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: note.content, noteId: note.id }),
            });

            const data = await response.json();
            console.log("API Cevabı:", data);

            if (!response.ok) throw new Error(data.error || 'Failed to process');

            // Success feedback
            const totalAction = data.results.events + data.results.todos + data.results.resources;

            if (totalAction === 0) {
                alert("🤔 AI bu nottan eyleme dönüştürülebilir bir şey çıkaramadı.\n\nLütfen 'toplantı', 'yarın', 'şunu yap' gibi daha net ifadeler kullanmayı dene.");
            } else {
                let summary = "Sihir Tamamlandı! ✨\n";
                if (data.results.events > 0) summary += `📅 ${data.results.events} Etkinlik\n`;
                if (data.results.todos > 0) summary += `✅ ${data.results.todos} Görev\n`;
                if (data.results.resources > 0) summary += `📚 ${data.results.resources} Kaynak\n`;
                alert(summary);
                fetchNotes();
            }

        } catch (err: any) {
            console.error("Magic Error:", err);
            alert("Sihir başarısız oldu: " + err.message);
        } finally {
            setMagicLoadingId(null);
        }
    };

    const togglePin = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("notes")
                .update({ is_pinned: !currentStatus })
                .eq("id", id);

            if (error) throw error;
            fetchNotes();
        } catch (err) {
            console.error("Error toggling pin:", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("notes")
                .delete()
                .eq("id", id);

            if (error) throw error;
            setNotes(notes.filter(n => n.id !== id));
        } catch (err) {
            console.error("Error deleting note:", err);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg hover:shadow-purple-500/25 text-white transition-all hover:scale-105 active:scale-95 group"
                title="Brain Dump"
            >
                <Brain className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar / Drawer */}
            <div
                className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[450px] bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full bg-slate-900/95">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                                <Brain className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Brain Dump</h2>
                                <p className="text-xs text-slate-400 font-medium">Hızlı notlar & fikirler</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* New Input Design */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl opacity-20 group-hover:opacity-60 transition duration-500 blur-sm group-focus-within:opacity-100 group-focus-within:blur-md"></div>
                            <div className="relative bg-slate-950 rounded-xl p-1 shadow-xl">
                                <textarea
                                    ref={inputRef}
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Aklına ne geldi?"
                                    className="w-full bg-slate-900/50 rounded-lg p-4 text-slate-200 placeholder:text-slate-600 text-sm resize-none focus:outline-none min-h-[100px] transition-colors focus:bg-slate-900/80"
                                />
                                <div className="flex items-center justify-between px-2 pb-1 bg-slate-950 rounded-b-lg">
                                    <span className="text-[10px] text-slate-600 font-medium ml-2 uppercase tracking-wider">↵ Enter ile gönder</span>
                                    <button
                                        onClick={() => handleAddNote()}
                                        disabled={!newNote.trim() || isSubmitting}
                                        className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${newNote.trim()
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/20 transform hover:-translate-y-0.5'
                                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                    >
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Notes List */}
                        {loading && notes.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                                <div className="h-20 w-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-800 border-dashed">
                                    <Brain className="h-10 w-10 opacity-20" />
                                </div>
                                <p className="text-sm font-medium text-slate-400">Henüz bir not yok</p>
                                <p className="text-xs mt-1 opacity-60 max-w-[200px]">Zihnini boşaltmak için yukarı kaydetmeye başla!</p>
                            </div>
                        ) : (
                            <div className="space-y-3 pb-safe">
                                {notes.map((note) => (
                                    <div
                                        key={note.id}
                                        className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${note.is_pinned
                                            ? 'bg-purple-500/5 border-purple-500/30 shadow-md shadow-purple-500/5'
                                            : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'}`}
                                    >
                                        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed break-words">
                                            {note.content}
                                        </p>

                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-950/90 rounded-lg p-1 border border-slate-800 shadow-xl z-20">
                                            <button
                                                onClick={() => handleMagic(note)}
                                                disabled={!!magicLoadingId}
                                                className={`p-1.5 rounded-md transition-colors text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 ${magicLoadingId === note.id ? 'animate-pulse' : ''}`}
                                                title="Sihirli Asistan: Bunu Yapılacaklar/Takvim'e dönüştür"
                                            >
                                                {magicLoadingId === note.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => togglePin(note.id, note.is_pinned)}
                                                className={`p-1.5 rounded-md transition-colors ${note.is_pinned
                                                    ? 'text-purple-400 hover:bg-purple-500/20'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                                                title={note.is_pinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
                                            >
                                                {note.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(note.id)}
                                                className="p-1.5 rounded-md text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-600 font-medium">
                                                {new Date(note.created_at).toLocaleDateString() === new Date().toLocaleDateString()
                                                    ? 'Bugün'
                                                    : new Date(note.created_at).toLocaleDateString()}
                                            </span>
                                            {note.is_pinned && <Pin className="h-3 w-3 text-purple-500/50" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
