"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Chapter, formatDateRange, formatDate, MOOD_OPTIONS, getAuthorInfo } from "@/lib/types";
import { getChapterById } from "@/lib/storage";

export default function PrintChapterPage() {
  const params = useParams();
  const chapterId = params.id as string;
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadChapter = useCallback(async () => {
    const data = await getChapterById(chapterId);
    setChapter(data);
    setIsLoaded(true);
  }, [chapterId]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  const handlePrint = () => {
    window.print();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-midnight-soft italic">Loading...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-midnight-soft italic">Chapter not found</p>
      </div>
    );
  }

  const dateRange = formatDateRange(chapter.dateFrom, chapter.dateTo);
  const moodIcons = chapter.moods.map(m => MOOD_OPTIONS.find(o => o.id === m)?.icon).filter(Boolean);

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-after: always;
          }
          .print-page:last-child {
            page-break-after: avoid;
          }
        }
      `}</style>

      {/* Controls (hidden when printing) */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handlePrint}
          className="bg-plum text-parchment px-4 py-2 rounded-lg shadow-lg hover:bg-plum-light transition-colors"
        >
          🖨️ Print / Save PDF
        </button>
        <Link
          href={`/chapter/${chapterId}`}
          className="bg-cream text-plum px-4 py-2 rounded-lg shadow-lg border border-plum hover:bg-moonlight transition-colors"
        >
          ← Back
        </Link>
      </div>

      {/* Printable content */}
      <div className="max-w-3xl mx-auto p-8 bg-white min-h-screen">
        {/* Cover Page */}
        <div className="print-page text-center py-16">
          <div className="mb-8">
            <p className="text-lavender text-2xl mb-4">✦ ✧ ✦</p>
            <h1 className="font-display text-4xl text-plum mb-4">
              {chapter.destination}
            </h1>
            {chapter.subtitle && (
              <p className="font-body italic text-lavender text-lg mb-4">
                {chapter.subtitle}
              </p>
            )}
            {dateRange && (
              <p className="text-midnight-soft">{dateRange}</p>
            )}
          </div>

          {chapter.coverLine && (
            <div className="my-12 px-8">
              <p className="font-body italic text-xl text-midnight leading-relaxed">
                &ldquo;{chapter.coverLine}&rdquo;
              </p>
            </div>
          )}

          <div className="mt-16">
            <p className="text-lavender text-sm tracking-widest">
              Ива ✧ Мео
            </p>
            <p className="text-xs text-midnight-soft mt-4">
              Two Souls on the Road
            </p>
          </div>

          {moodIcons.length > 0 && (
            <div className="mt-8">
              <p className="text-2xl">{moodIcons.join(" ")}</p>
            </div>
          )}
        </div>

        {/* First Impression */}
        {chapter.firstImpression && (
          <div className="print-page py-8 border-t border-parchment-dark">
            <h2 className="font-display text-xl text-plum mb-4 text-center">
              🌅 First Impression
            </h2>
            <div className="bg-parchment p-6 rounded-lg">
              <p className="font-body text-midnight italic leading-relaxed">
                &ldquo;{chapter.firstImpression.text}&rdquo;
              </p>
              <p className="text-sm text-lavender mt-4 text-right">
                — {getAuthorInfo(chapter.firstImpression.author).icon} {getAuthorInfo(chapter.firstImpression.author).name}
              </p>
            </div>
          </div>
        )}

        {/* Daily Entries */}
        {chapter.dayEntries.length > 0 && (
          <div className="py-8 border-t border-parchment-dark">
            <h2 className="font-display text-xl text-plum mb-6 text-center">
              📖 Daily Journal
            </h2>
            {chapter.dayEntries.map((entry) => (
              <div key={entry.id} className="mb-8 print-page">
                <h3 className="font-display text-lg text-plum mb-3">
                  {formatDate(entry.date)}
                </h3>

                {/* Moods */}
                {(entry.morningMood || entry.eveningMood) && (
                  <p className="text-sm mb-3">
                    {entry.morningMood && (
                      <span>Morning: {MOOD_OPTIONS.find(m => m.id === entry.morningMood)?.icon} </span>
                    )}
                    {entry.eveningMood && (
                      <span>Evening: {MOOD_OPTIONS.find(m => m.id === entry.eveningMood)?.icon}</span>
                    )}
                  </p>
                )}

                {/* Gratitude */}
                {entry.gratitude && (
                  <div className="mb-4">
                    <p className="text-sm text-plum font-display">🙏 Gratitude</p>
                    <p className="font-body italic text-midnight">&ldquo;{entry.gratitude}&rdquo;</p>
                  </div>
                )}

                {/* Word of the day */}
                {entry.wordOfTheDay && (
                  <p className="text-center text-xl font-display text-lavender my-4">
                    ✨ {entry.wordOfTheDay}
                  </p>
                )}

                {/* Thoughts */}
                {entry.thoughts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-plum font-display mb-2">💭 Thoughts</p>
                    {entry.thoughts.map((thought) => (
                      <div key={thought.id} className="mb-2 pl-4 border-l-2 border-lavender">
                        <p className="font-body italic text-midnight text-sm">
                          &ldquo;{thought.text}&rdquo;
                        </p>
                        <p className="text-xs text-midnight-soft">
                          — {getAuthorInfo(thought.author).name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prompts */}
                {entry.prompts.length > 0 && (
                  <div className="mb-4">
                    {entry.prompts.map((prompt, i) => (
                      <div key={i} className="mb-3">
                        <p className="text-sm text-midnight-soft italic">{prompt.question}</p>
                        <p className="font-body text-midnight pl-4">
                          &ldquo;{prompt.answer}&rdquo;
                          <span className="text-xs text-lavender ml-2">
                            — {getAuthorInfo(prompt.author).name}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Moments */}
        {chapter.moments.length > 0 && (
          <div className="py-8 border-t border-parchment-dark print-page">
            <h2 className="font-display text-xl text-plum mb-6 text-center">
              ✨ Moments
            </h2>
            <div className="space-y-4">
              {chapter.moments.map((moment) => (
                <div key={moment.id} className="bg-parchment p-4 rounded-lg">
                  {moment.photoDataUrl && (
                    <img
                      src={moment.photoDataUrl}
                      alt="Moment"
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                  )}
                  <p className="font-body text-midnight italic">
                    &ldquo;{moment.text}&rdquo;
                  </p>
                  {moment.author && (
                    <p className="text-xs text-lavender mt-2">
                      — {getAuthorInfo(moment.author).name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Night Thoughts */}
        {chapter.lastNightThoughts && (
          <div className="py-8 border-t border-parchment-dark print-page">
            <h2 className="font-display text-xl text-plum mb-4 text-center">
              🌙 Last Night Thoughts
            </h2>
            <div className="bg-parchment p-6 rounded-lg">
              <p className="font-body text-midnight italic leading-relaxed">
                &ldquo;{chapter.lastNightThoughts.text}&rdquo;
              </p>
              <p className="text-sm text-lavender mt-4 text-right">
                — {getAuthorInfo(chapter.lastNightThoughts.author).icon} {getAuthorInfo(chapter.lastNightThoughts.author).name}
              </p>
            </div>
          </div>
        )}

        {/* Final Reflection */}
        {chapter.reflection && (
          <div className="py-8 border-t border-parchment-dark print-page">
            <h2 className="font-display text-xl text-plum mb-2 text-center">
              Final Reflection
            </h2>
            <p className="text-center text-midnight-soft italic text-sm mb-4">
              {chapter.reflectionPrompt}
            </p>
            <div className="bg-parchment p-6 rounded-lg">
              <p className="font-body text-midnight italic leading-relaxed text-lg">
                &ldquo;{chapter.reflection}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="py-8 text-center border-t border-parchment-dark">
          <p className="text-lavender mb-2">✦ ✧ ✦</p>
          <p className="text-xs text-midnight-soft italic">
            Created with Two Souls on the Road
          </p>
          <p className="text-xs text-midnight-soft">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </>
  );
}
