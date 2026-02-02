import { MorningBriefing } from "@/components/dashboard/MorningBriefing";
import { HackathonRadar } from "@/components/dashboard/HackathonRadar";
import { TodaysMission } from "@/components/dashboard/TodaysMission";
import { WeeklyReview } from "@/components/dashboard/WeeklyReview";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px]">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-50">
            Kokpitim
          </h1>
          <p className="mt-2 text-slate-400">
            Komuta Merkezi • {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min">
          {/* Column 1: Morning Briefing (top) + Hackathon Radar (bottom) */}
          <div className="flex flex-col gap-4 md:gap-6 lg:row-span-2">
            <MorningBriefing />
            <HackathonRadar />
          </div>

          {/* Column 2-3: Today's Mission (spans 2 columns) */}
          <div className="md:col-span-2 lg:row-span-2">
            <TodaysMission />
          </div>

          {/* Column 4: Weekly Review */}
          <div className="lg:row-span-2">
            <WeeklyReview />
          </div>
        </div>
      </div>
    </main>
  );
}
