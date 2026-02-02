"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";

const QUOTES = [
    "Kod yazmak sanat değil, zanaat değil. Düşünce biçimidir.",
    "Basitlik, nihai sofistikeliktir. - Leonardo da Vinci",
    "Önce çalışır hale getir, sonra doğru hale getir, sonra hızlı hale getir.",
    "Bugünün programcısı, dünün kullanıcısının sorunlarını çözer.",
    "Engel yol değildir. Engel yoldur. - Marcus Aurelius",
    "Mükemmellik bir hedef değil, bir alışkanlıktır. - Aristotle",
    "Kod, insanların okuması için yazılır. Tesadüfen bilgisayarlar da çalıştırır.",
    "Odaklandığın şey büyür. Enerjini akıllıca kullan.",
    "Başarısızlık bir seçenek değil. Öğrenme sürecinin parçasıdır.",
    "En iyi kod, yazılmayan koddur.",
    "Sabır ve sebat, her şeyin üstesinden gelir. - Seneca",
    "Bugün dünden daha iyi ol. Yarın bugünden daha iyi olacak.",
];

export function DailyMotto() {
    // Use date as seed for daily quote rotation
    const quote = useMemo(() => {
        const today = new Date();
        const dayOfYear = Math.floor(
            (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
        );
        return QUOTES[dayOfYear % QUOTES.length];
    }, []);

    return (
        <div className="relative overflow-hidden rounded-lg border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-5 backdrop-blur-sm">
            {/* Glassmorphism glow effect */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-yellow-400/80" />
                    <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Günün Sözü
                    </h3>
                </div>

                <blockquote className="text-sm leading-relaxed text-slate-200 font-medium italic">
                    "{quote}"
                </blockquote>
            </div>
        </div>
    );
}
