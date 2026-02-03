"use client";

import Link from "next/link";
import { Chapter, formatDateRange, MOOD_OPTIONS } from "@/lib/types";

interface ChapterCardProps {
  chapter: Chapter;
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  const dateRange = formatDateRange(chapter.dateFrom, chapter.dateTo);
  const momentCount = chapter.moments.length;
  const moodIcons = chapter.moods
    .map((m) => MOOD_OPTIONS.find((o) => o.id === m)?.icon)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link href={`/chapter/${chapter.id}`}>
      <article className="book-card book-spine p-5 pl-7 hover:scale-[1.01] transition-transform cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display text-xl text-plum leading-tight">
            {chapter.destination}
          </h3>
          {chapter.sealed && (
            <span className="sealed-badge shrink-0">
              ✧ Sealed
            </span>
          )}
        </div>

        {/* Date */}
        {dateRange && (
          <p className="text-sm text-midnight-soft mb-3">
            {dateRange}
          </p>
        )}

        {/* Cover line */}
        {chapter.coverLine && (
          <p className="font-body italic text-midnight/80 text-sm mb-3 line-clamp-2">
            &ldquo;{chapter.coverLine}&rdquo;
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-parchment-dark">
          <div className="flex items-center gap-2">
            {moodIcons.length > 0 ? (
              <span className="text-sm">{moodIcons.join(" ")}</span>
            ) : (
              <span className="text-xs text-midnight-soft italic">No moods yet</span>
            )}
          </div>
          <span className="text-xs text-midnight-soft">
            {momentCount} {momentCount === 1 ? "moment" : "moments"}
          </span>
        </div>
      </article>
    </Link>
  );
}
