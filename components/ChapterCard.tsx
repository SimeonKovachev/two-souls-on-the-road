"use client";

import Link from "next/link";
import { Chapter, formatDateRange } from "@/lib/types";
import { MOOD_ICONS, Star, Camera } from "@/components/ui";

interface ChapterCardProps {
  chapter: Chapter;
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  const dateRange = formatDateRange(chapter.dateFrom, chapter.dateTo);
  const momentCount = chapter.moments.length;
  const moodList = chapter.moods
    .filter((m) => MOOD_ICONS[m])
    .slice(0, 3);

  return (
    <Link href={`/chapter/${chapter.id}`}>
      <article className="book-card book-spine p-5 pl-7 hover:scale-[1.01] transition-transform cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display text-xl text-plum leading-tight">
            {chapter.destination}
          </h3>
          {chapter.sealed && (
            <span className="sealed-badge shrink-0 inline-flex items-center gap-1">
              <Star className="w-3 h-3" /> Sealed
            </span>
          )}
        </div>

        {dateRange && (
          <p className="text-sm text-midnight-soft mb-3">
            {dateRange}
          </p>
        )}

        {chapter.coverLine && (
          <p className="font-body italic text-midnight/80 text-sm mb-3 line-clamp-2">
            &ldquo;{chapter.coverLine}&rdquo;
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-parchment-dark">
          <div className="flex items-center gap-2">
            {moodList.length > 0 ? (
              <span className="flex items-center gap-1 text-plum/70">
                {moodList.map((moodId) => {
                  const Icon = MOOD_ICONS[moodId];
                  return <Icon key={moodId} className="w-4 h-4" />;
                })}
              </span>
            ) : (
              <span className="text-xs text-midnight-soft italic">No moods yet</span>
            )}
          </div>
          <span className="text-xs text-midnight-soft inline-flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {momentCount} {momentCount === 1 ? "moment" : "moments"}
          </span>
        </div>
      </article>
    </Link>
  );
}
