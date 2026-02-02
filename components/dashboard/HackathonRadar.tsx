import { Radar, Calendar, MapPin } from "lucide-react";

export function HackathonRadar() {
    const hackathons = [
        { name: "Yapay Zeka İnovasyon Yarışması", date: "15-17 Şub", location: "Online" },
        { name: "Web3 Geliştirici Zirvesi", date: "2-4 Mar", location: "San Francisco" },
        { name: "İklim Teknolojileri Hackathon", date: "20-22 Mar", location: "Berlin" },
    ];

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
                <Radar className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-50">Hackathon Radarı</h2>
            </div>

            <div className="space-y-3">
                {hackathons.map((hackathon, index) => (
                    <div
                        key={index}
                        className="p-3 rounded-md bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                        <h3 className="text-sm font-medium text-slate-200 mb-2">
                            {hackathon.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{hackathon.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{hackathon.location}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
