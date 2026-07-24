"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!pin.trim()) return;

        // In a real app we'd verify this server-side securely. 
        // For a simple personal dashboard, we just set the cookie and let middleware handle it.
        document.cookie = `followtick_auth=${pin}; path=/; max-age=31536000; SameSite=Strict`;

        setError(false);
        // Force refresh to trigger middleware evaluation
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                        <ShieldCheck className="h-8 w-8 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-50">Kokpitim'e Giriş</h1>
                    <p className="text-slate-400 text-sm mt-2 text-center">
                        Bu alan yetkisiz erişime karşı korunmaktadır. Devam etmek için PIN kodunuzu girin.
                    </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">PIN Kodu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all transition-colors"
                                    placeholder="•••••"
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Geçersiz PIN
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                        >
                            Giriş Yap
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
