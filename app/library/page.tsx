"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Filter, BookOpen, Video, Code2, PenTool, Link as LinkIcon, ExternalLink, Trash2, Heart, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Resource {
    id: string;
    title: string;
    url: string;
    description?: string;
    type: 'article' | 'video' | 'documentation' | 'tool' | 'repo' | 'other';
    tags?: string[];
    is_favorite: boolean;
    status: 'to_read' | 'reading' | 'finished';
    created_at: string;
}

export default function LibraryPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'article' | 'video' | 'documentation' | 'tool' | 'repo'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'to_read' | 'reading' | 'finished'>('all');
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newTitle, setNewTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newType, setNewType] = useState<Resource['type']>('article');
    const [adding, setAdding] = useState(false);

    const mockUserId = "00000000-0000-0000-0000-000000000000";

    const fetchResources = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from("resources")
                .select("*")
                .order("is_favorite", { ascending: false }) // Favorites first
                .order("created_at", { ascending: false });

            if (filter !== 'all') {
                query = query.eq('type', filter);
            }

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setResources(data || []);
        } catch (err) {
            console.error("Error fetching resources:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [filter, statusFilter]);

    const handleAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newUrl.trim()) return;

        try {
            setAdding(true);
            const { error } = await supabase
                .from("resources")
                .insert([{
                    user_id: mockUserId,
                    title: newTitle,
                    url: newUrl,
                    description: newDesc,
                    type: newType,
                    status: 'to_read',
                    is_favorite: false
                }]);

            if (error) throw error;

            setNewTitle("");
            setNewUrl("");
            setNewDesc("");
            setNewType('article');
            setShowAddModal(false);
            fetchResources();
        } catch (err) {
            console.error("Error adding resource:", err);
            alert("Hata oluştu.");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu kaynağı silmek istediğine emin misin?")) return;
        try {
            const { error } = await supabase.from("resources").delete().eq("id", id);
            if (error) throw error;
            setResources(resources.filter(r => r.id !== id));
        } catch (err) {
            console.error("Error deleting:", err);
        }
    };

    const toggleFavorite = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setResources(resources.map(r => r.id === id ? { ...r, is_favorite: !currentStatus } : r));

            const { error } = await supabase
                .from("resources")
                .update({ is_favorite: !currentStatus })
                .eq("id", id);

            if (error) throw error;
        } catch (err) {
            console.error("Error toggling favorite:", err);
            fetchResources(); // Revert on error
        }
    };

    const toggleStatus = async (id: string, currentStatus: Resource['status']) => {
        const nextStatus: Resource['status'] =
            currentStatus === 'to_read' ? 'reading' :
                currentStatus === 'reading' ? 'finished' : 'to_read';

        try {
            setResources(resources.map(r => r.id === id ? { ...r, status: nextStatus } : r));

            const { error } = await supabase
                .from("resources")
                .update({ status: nextStatus })
                .eq("id", id);

            if (error) throw error;
        } catch (err) {
            console.error("Error updating status:", err);
            fetchResources();
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'repo': return <Code2 className="h-4 w-4" />;
            case 'tool': return <PenTool className="h-4 w-4" />;
            case 'documentation': return <BookOpen className="h-4 w-4" />;
            default: return <LinkIcon className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'video': return "text-red-400 bg-red-400/10 border-red-400/20";
            case 'repo': return "text-slate-200 bg-slate-700/50 border-slate-600";
            case 'tool': return "text-orange-400 bg-orange-400/10 border-orange-400/20";
            case 'documentation': return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            default: return "text-purple-400 bg-purple-400/10 border-purple-400/20";
        }
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Link
                            href="/"
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kokpite Dön
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-50">
                                    Second Brain
                                </h1>
                                <p className="mt-1 text-slate-400">
                                    Kaynak kütüphanesi ve bilgi havuzu.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            <Plus className="h-4 w-4" />
                            Kaynak Ekle
                        </button>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md py-4 border-b border-slate-800/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Kütüphanede ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 placeholder:text-slate-600"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        {(['all', 'article', 'video', 'documentation', 'repo', 'tool'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${filter === type
                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 rounded-xl bg-slate-900 animate-pulse border border-slate-800" />
                        ))}
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                        <BookOpen className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                        <h3 className="text-lg font-medium text-slate-300">Henüz kaynak yok</h3>
                        <p className="text-slate-500 text-sm mt-1">İlgini çeken linkleri buraya eklemeye başla.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResources.map((resource) => (
                            <div
                                key={resource.id}
                                className="group relative rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col"
                            >
                                <div className="p-5 flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                                            {getTypeIcon(resource.type)}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => toggleFavorite(resource.id, resource.is_favorite)}
                                                className={`p-1.5 rounded-md transition-colors ${resource.is_favorite ? 'text-pink-500 bg-pink-500/10' : 'text-slate-600 hover:text-pink-400 hover:bg-slate-800'}`}
                                            >
                                                <Heart className={`h-4 w-4 ${resource.is_favorite ? 'fill-current' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(resource.id)}
                                                className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-slate-200 mb-1 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                                            <span className="absolute inset-0 z-0" />
                                            {resource.title}
                                        </a>
                                    </h3>

                                    {resource.description && (
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                                            {resource.description}
                                        </p>
                                    )}
                                </div>

                                <div className="px-5 py-3 border-t border-slate-800/50 bg-slate-900/30 flex items-center justify-between text-xs relative z-10">
                                    <span className="text-slate-500 font-mono truncate max-w-[150px] opacity-60">
                                        {new URL(resource.url).hostname.replace('www.', '')}
                                    </span>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Link click engellemek için
                                            toggleStatus(resource.id, resource.status);
                                        }}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${resource.status === 'finished' ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' :
                                            resource.status === 'reading' ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' :
                                                'text-slate-500 bg-slate-800 hover:bg-slate-700 hover:text-slate-300'
                                            }`}
                                    >
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span>
                                            {resource.status === 'finished' ? 'Tamamlandı' :
                                                resource.status === 'reading' ? 'Okunuyor' : 'Sıraya Ekle'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Resource Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Yeni Kaynak Ekle</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddResource} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Başlık</label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                                    placeholder="Örn: React 19 Yenilikleri"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">URL</label>
                                <input
                                    type="url"
                                    required
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Açıklama (Opsiyonel)</label>
                                <textarea
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none resize-none h-20"
                                    placeholder="Kısa bir not..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Tür</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['article', 'video', 'documentation', 'repo', 'tool', 'other'] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setNewType(type)}
                                            className={`px-2 py-2 text-xs font-medium rounded-lg border transition-colors ${newType === type
                                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="px-6 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {adding ? 'Ekleniyor...' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
