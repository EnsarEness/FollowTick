"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Filter } from "lucide-react";
import { Application, supabase } from "@/lib/supabaseClient";
import { AddApplicationDialog } from "@/components/applications/AddApplicationDialog";
import { ApplicationCard } from "@/components/applications/ApplicationCard";

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'planned' | 'pending' | 'approved' | 'rejected'>('all');

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("applications")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (err) {
            console.error("Error fetching applications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const filteredApps = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    const plannedCount = applications.filter(a => a.status === 'planned').length;
    const pendingCount = applications.filter(a => a.status === 'pending').length;
    const approvedCount = applications.filter(a => a.status === 'approved').length;
    const rejectedCount = applications.filter(a => a.status === 'rejected').length;

    return (
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
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
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-50">
                                Başvurularım
                            </h1>
                            <p className="mt-1 text-slate-400">
                                Staj, Hackathon ve diğer programları planla ve takip et.
                            </p>
                        </div>

                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Yeni Ekle
                        </button>
                    </div>
                </header>

                {/* Stats / Filters */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`p-3 rounded-lg border text-left transition-colors ${filter === 'all' ? 'bg-slate-800 border-blue-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                    >
                        <p className="text-xs text-slate-500 mb-1">Toplam</p>
                        <p className="text-xl font-semibold text-slate-200">{applications.length}</p>
                    </button>

                    <button
                        onClick={() => setFilter('planned')}
                        className={`p-3 rounded-lg border text-left transition-colors ${filter === 'planned' ? 'bg-slate-800 border-yellow-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                    >
                        <p className="text-xs text-yellow-500/80 mb-1">Başvurulacak</p>
                        <p className="text-xl font-semibold text-yellow-500">{plannedCount}</p>
                    </button>

                    <button
                        onClick={() => setFilter('pending')}
                        className={`p-3 rounded-lg border text-left transition-colors ${filter === 'pending' ? 'bg-slate-800 border-blue-400/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                    >
                        <p className="text-xs text-blue-400/80 mb-1">Beklenen</p>
                        <p className="text-xl font-semibold text-blue-400">{pendingCount}</p>
                    </button>

                    <button
                        onClick={() => setFilter('approved')}
                        className={`p-3 rounded-lg border text-left transition-colors ${filter === 'approved' ? 'bg-slate-800 border-emerald-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                    >
                        <p className="text-xs text-emerald-500/80 mb-1">Onaylanan</p>
                        <p className="text-xl font-semibold text-emerald-500">{approvedCount}</p>
                    </button>

                    <button
                        onClick={() => setFilter('rejected')}
                        className={`col-span-2 lg:col-span-1 p-3 rounded-lg border text-left transition-colors ${filter === 'rejected' ? 'bg-slate-800 border-red-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                    >
                        <p className="text-xs text-red-500/80 mb-1">Reddedilen</p>
                        <p className="text-xl font-semibold text-red-500">{rejectedCount}</p>
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-400 pb-2 border-b border-slate-800">
                        <span>Listelenen: {
                            filter === 'all' ? 'Tümü' :
                                filter === 'planned' ? 'Başvurulacaklar' :
                                    filter === 'pending' ? 'Bekleyenler' :
                                        filter === 'approved' ? 'Onaylananlar' : 'Reddedilenler'}
                        </span>
                        <Filter className="h-4 w-4 opacity-50" />
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-slate-500">
                            Yükleniyor...
                        </div>
                    ) : filteredApps.length === 0 ? (
                        <div className="py-12 text-center rounded-lg border border-dashed border-slate-800 bg-slate-900/30">
                            <p className="text-slate-500">Bu filtredede kayıt bulunamadı.</p>
                            {filter !== 'all' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className="mt-2 text-sm text-blue-500 hover:underline"
                                >
                                    Tümünü göster
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredApps.map(app => (
                            <ApplicationCard
                                key={app.id}
                                app={app}
                                onUpdate={fetchApplications}
                            />
                        ))
                    )}
                </div>
            </div>

            <AddApplicationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onAdded={fetchApplications}
            />
        </main>
    );
}
