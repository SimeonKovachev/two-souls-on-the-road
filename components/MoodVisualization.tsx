"use client";

import { DayEntry, Mood, MOOD_OPTIONS, getMoodColor, getMoodIcon, formatDateShort } from "@/lib/types";

interface MoodVisualizationProps {
  dayEntries: DayEntry[];
  overallMoods: Mood[];
}

export function MoodVisualization({ dayEntries, overallMoods }: MoodVisualizationProps) {
  // Collect all moods from day entries
  const allMoods: { date: string; mood: Mood; time: "morning" | "evening" }[] = [];

  dayEntries.forEach((entry) => {
    if (entry.morningMood) {
      allMoods.push({ date: entry.date, mood: entry.morningMood, time: "morning" });
    }
    if (entry.eveningMood) {
      allMoods.push({ date: entry.date, mood: entry.eveningMood, time: "evening" });
    }
  });

  // Count mood frequencies
  const moodCounts: Record<Mood, number> = {} as Record<Mood, number>;
  MOOD_OPTIONS.forEach((m) => (moodCounts[m.id] = 0));

  allMoods.forEach(({ mood }) => {
    moodCounts[mood]++;
  });

  overallMoods.forEach((mood) => {
    moodCounts[mood] += 2; // Overall moods count more
  });

  // Sort by frequency
  const sortedMoods = Object.entries(moodCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([mood]) => mood as Mood);

  const totalMoods = Object.values(moodCounts).reduce((a, b) => a + b, 0);

  if (sortedMoods.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-midnight-soft italic text-sm">
          No moods recorded yet. Start filling in your daily moods!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mood constellation */}
      <div className="relative h-48 flex items-center justify-center">
        <div className="relative">
          {sortedMoods.slice(0, 6).map((mood, index) => {
            const option = MOOD_OPTIONS.find((m) => m.id === mood)!;
            const count = moodCounts[mood];
            const percentage = (count / totalMoods) * 100;
            const size = Math.max(32, Math.min(64, percentage * 1.5));

            // Position in a circle/constellation pattern
            const angle = (index * 60 - 90) * (Math.PI / 180);
            const radius = index === 0 ? 0 : 60 + (index % 2) * 20;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={mood}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-500 hover:scale-110"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
                title={`${option.label}: ${count} time${count !== 1 ? "s" : ""}`}
              >
                <span
                  style={{ fontSize: `${size}px` }}
                  className="drop-shadow-lg"
                >
                  {option.icon}
                </span>
                {index < 3 && (
                  <span className="text-xs text-midnight-soft mt-1">
                    {option.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline view */}
      {dayEntries.length > 1 && (
        <div>
          <p className="text-xs text-midnight-soft mb-2 text-center">Mood Timeline</p>
          <div className="flex items-end justify-center gap-1 h-24">
            {dayEntries.map((entry) => {
              const morningColor = entry.morningMood ? getMoodColor(entry.morningMood) : "#E0E0E0";
              const eveningColor = entry.eveningMood ? getMoodColor(entry.eveningMood) : "#E0E0E0";

              return (
                <div
                  key={entry.id}
                  className="flex flex-col items-center group"
                  title={formatDateShort(entry.date)}
                >
                  {/* Morning mood */}
                  <div
                    className="w-4 h-8 rounded-t transition-all group-hover:scale-110"
                    style={{ backgroundColor: morningColor }}
                    title={entry.morningMood ? `Morning: ${getMoodIcon(entry.morningMood)}` : "No morning mood"}
                  />
                  {/* Evening mood */}
                  <div
                    className="w-4 h-8 rounded-b transition-all group-hover:scale-110"
                    style={{ backgroundColor: eveningColor }}
                    title={entry.eveningMood ? `Evening: ${getMoodIcon(entry.eveningMood)}` : "No evening mood"}
                  />
                  <span className="text-[8px] text-midnight-soft mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(entry.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mood breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {sortedMoods.map((mood) => {
          const option = MOOD_OPTIONS.find((m) => m.id === mood)!;
          const count = moodCounts[mood];
          const percentage = Math.round((count / totalMoods) * 100);

          return (
            <div
              key={mood}
              className="flex items-center gap-2 p-2 bg-cream rounded"
            >
              <span className="text-lg">{option.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs">
                  <span className="text-midnight">{option.label}</span>
                  <span className="text-midnight-soft">{percentage}%</span>
                </div>
                <div className="h-1 bg-parchment-dark rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: option.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
