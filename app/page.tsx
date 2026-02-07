"use client";

import { useState } from "react";
import { Timer, Calendar, Briefcase } from "lucide-react";
import Link from "next/link";
import { MorningBriefing } from "@/components/dashboard/MorningBriefing";
import { HackathonRadar } from "@/components/dashboard/HackathonRadar";
import { TodaysMission } from "@/components/dashboard/TodaysMission";
import { WeeklyReview } from "@/components/dashboard/WeeklyReview";
import { FocusTimer } from "@/components/FocusTimer";
import { CalendarModal } from "@/components/CalendarModal";

export default function Home() {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px]">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
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
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/applications"
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <Briefcase className="h-4 w-4" />
                Başvurularım
              </Link>
              <button
                onClick={() => setShowCalendar(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </button>

              <button
                onClick={() => setShowFocusTimer(true)}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
              >
                <Timer className="h-4 w-4" />
                Focus Mode
              </button>
            </div>
          </div>
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
            <TodaysMission focusMode={isFocusMode} />
          </div>

          {/* Column 4: Weekly Review */}
          <div className="lg:row-span-2">
            <WeeklyReview />
          </div>
        </div>
      </div>

      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />

      <FocusTimer
        isOpen={showFocusTimer}
        onClose={() => setShowFocusTimer(false)}
      />
    </main>
  );
}
