"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CheckCircle2, XCircle, Calendar, Clock, FileText, ChevronDown, ChevronUp, Send, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Application, supabase } from "@/lib/supabaseClient";

interface ApplicationCardProps {
    app: Application;
    onUpdate: () => void;
}

export function ApplicationCard({ app, onUpdate }: ApplicationCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Modals state
    const [showDatePrompt, setShowDatePrompt] = useState(false); // For approval
    const [showAppliedPrompt, setShowAppliedPrompt] = useState(false); // For moving from planned to pending

    const [eventDate, setEventDate] = useState("");
    const [announcementDate, setAnnouncementDate] = useState("");

    const getTypeColor = (type: string) => {
        switch (type) {
            case "hackathon": return "border-red-500/20 bg-red-500/5 text-red-500";
            case "internship": return "border-blue-500/20 bg-blue-500/5 text-blue-500";
            case "ideathon": return "border-yellow-500/20 bg-yellow-500/5 text-yellow-500";
            case "career_day": return "border-emerald-500/20 bg-emerald-500/5 text-emerald-500";
            case "course": return "border-purple-500/20 bg-purple-500/5 text-purple-500";
            default: return "border-slate-500/20 bg-slate-500/5 text-slate-500";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "hackathon": return "🏆";
            case "internship": return "💼";
            case "ideathon": return "💡";
            case "career_day": return "🤝";
            case "course": return "🎓";
            default: return "📅";
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case "hackathon": return "Hackathon";
            case "internship": return "Staj";
            case "ideathon": return "İdeathon";
            case "career_day": return "Career Day";
            case "course": return "Eğitim";
            default: return "Diğer";
        }
    };

    const handleReject = async () => {
        if (!confirm("Başvuruyu reddedilmiş olarak işaretlemek istediğine emin misin?")) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from("applications")
                .update({ status: "rejected" })
                .eq("id", app.id);

            if (error) throw error;
            onUpdate();
        } catch (err) {
            console.error("Error rejecting:", err);
            alert("Hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleApproveConfirm = async () => {
        try {
            setLoading(true);
            const mockUserId = "00000000-0000-0000-0000-000000000000";

            const { error: appError } = await supabase
                .from("applications")
                .update({
                    status: "approved",
                    event_date: eventDate ? new Date(eventDate).toISOString() : null
                })
                .eq("id", app.id);

            if (appError) throw appError;

            if (eventDate) {
                const { error: eventError } = await supabase
                    .from("events")
                    .insert([{
                        user_id: mockUserId,
                        name: `${app.title} (${getTypeName(app.type)})`,
                        deadline: new Date(eventDate).toISOString(),
                        type: app.type,
                        location: "Online/Yerinde"
                    }]);

                if (eventError) console.error("Error creating event:", eventError);
            }

            setShowDatePrompt(false);
            onUpdate();
        } catch (err) {
            console.error("Error approving:", err);
            alert("Hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyConfirm = async () => {
        // announcementDate opsiyonel artık
        try {
            setLoading(true);
            const updatePayload: any = {
                status: "pending"
            };

            if (announcementDate) {
                updatePayload.announcement_date = new Date(announcementDate).toISOString();
            }

            const { error } = await supabase
                .from("applications")
                .update(updatePayload)
                .eq("id", app.id);

            if (error) throw error;
            setShowAppliedPrompt(false);
            onUpdate();
        } catch (err) {
            console.error("Error applying:", err);
            alert("Hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`rounded-lg border bg-slate-900/50 transition-all ${app.status === 'approved' ? 'border-emerald-500/30' :
                app.status === 'rejected' ? 'border-red-500/30 opacity-60' :
                    app.status === 'planned' ? 'border-yellow-500/30 bg-yellow-500/5' :
                        'border-slate-800'
            }`}>
            {/* Main Content */}
            <div className="p-4 flex items-start gap-4">
                {/* Icon */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl ${getTypeColor(app.type)}`}>
                    {getTypeIcon(app.type)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className={`font-medium text-slate-200 truncate ${app.status === 'rejected' ? 'line-through text-slate-500' : ''}`}>
                                {app.title}
                            </h3>
                            <p className="text-sm text-slate-500">{getTypeName(app.type)}</p>
                        </div>

                        {/* Status Badge or Actions */}
                        <div className="flex items-center gap-2">
                            {/* Planned Actions */}
                            {app.status === 'planned' && (
                                <button
                                    onClick={() => setShowAppliedPrompt(true)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-xs font-medium border border-blue-600/20 hover:border-blue-600"
                                    title="Başvuruyu Tamamla"
                                >
                                    <Send className="h-3 w-3" />
                                    Başvur
                                </button>
                            )}

                            {/* Pending Actions */}
                            {app.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => setShowDatePrompt(true)}
                                        disabled={loading}
                                        className="p-2 rounded-full hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 transition-colors"
                                        title="Onayla"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={loading}
                                        className="p-2 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Reddet"
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </>
                            )}

                            {/* Status Badges */}
                            {app.status === 'approved' && (
                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                                    Onaylandı
                                </span>
                            )}
                            {app.status === 'rejected' && (
                                <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500 ring-1 ring-inset ring-red-500/20">
                                    Reddedildi
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                        {app.status === 'planned' && app.deadline && (
                            <div className="flex items-center gap-1 text-yellow-500">
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span>Son Başvuru: {format(new Date(app.deadline), 'd MMM yyyy', { locale: tr })}</span>
                            </div>
                        )}

                        {(app.status === 'pending' || app.status === 'approved' || app.status === 'rejected') && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                    Açıklanma: {app.announcement_date ? format(new Date(app.announcement_date), 'd MMM yyyy', { locale: tr }) : 'Belirsiz'}
                                </span>
                            </div>
                        )}

                        {app.event_date && (
                            <div className="flex items-center gap-1 text-emerald-500">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Etkinlik: {format(new Date(app.event_date), 'd MMM yyyy', { locale: tr })}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Expandable Notes */}
            {app.notes && (
                <div className="border-t border-slate-800/50">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex w-full items-center justify-between px-4 py-2 text-xs text-slate-500 hover:bg-slate-800/50 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" />
                            Notlar
                        </span>
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    {expanded && (
                        <div className="px-4 pb-4 pt-2 text-sm text-slate-400 bg-slate-900/30">
                            {app.notes}
                        </div>
                    )}
                </div>
            )}

            {/* Date Prompt for Approval */}
            {showDatePrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-slate-50 mb-2">Başvuru Onaylandı! 🎉</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Harika! Peki bu etkinlik/program ne zaman başlıyor? Takvimine ekleyelim.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Başlangıç Tarihi (Opsiyonel)</label>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                                />
                                <p className="text-xs text-slate-500 mt-1">Belli değilse boş bırakabilirsin.</p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowDatePrompt(false)}
                                    className="px-3 py-1.5 text-sm text-slate-400 hover:text-white"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleApproveConfirm}
                                    className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Applied Confirmation Modal */}
            {showAppliedPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-slate-50 mb-2">Başvurunu Yaptın mı? 🚀</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Süper! Peki sonuçlar ne zaman açıklanır? Bunu takip edelim.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Açıklanma Tarihi (Opsiyonel)</label>
                                <input
                                    type="date"
                                    value={announcementDate}
                                    onChange={(e) => setAnnouncementDate(e.target.value)}
                                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                                />
                                <p className="text-xs text-slate-500 mt-1">Belli değilse boş bırakabilirsin.</p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowAppliedPrompt(false)}
                                    className="px-3 py-1.5 text-sm text-slate-400 hover:text-white"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleApplyConfirm}
                                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
