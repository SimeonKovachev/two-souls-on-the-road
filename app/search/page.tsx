"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Chapter, Mood, MOOD_OPTIONS, formatDate } from "@/lib/types";
import { getAllChapters } from "@/lib/storage";
import { Ornament } from "@/components/Ornament";
import { BottomNavSpacer } from "@/components/BottomNav";

interface SearchResult {
  type: "chapter" | "moment" | "thought" | "letter" | "gratitude";
  chapterId: string;
  chapterName: string;
  text: string;
  date?: string;
  author?: string;
}

export default function SearchPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getAllChapters();
      setChapters(data);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  // Build searchable index
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && !selectedMood && !dateFilter) {
      return [];
    }

    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase().trim();

    chapters.forEach((chapter) => {
      // Search chapter name
      if (query && chapter.destination.toLowerCase().includes(query)) {
        results.push({
          type: "chapter",
          chapterId: chapter.id,
          chapterName: chapter.destination,
          text: chapter.coverLine || chapter.destination,
          date: chapter.dateFrom,
        });
      }

      // Search moments
      chapter.moments.forEach((moment) => {
        if (query && moment.text.toLowerCase().includes(query)) {
          results.push({
            type: "moment",
            chapterId: chapter.id,
            chapterName: chapter.destination,
            text: moment.text,
            date: new Date(moment.createdAt).toISOString(),
            author: moment.author,
          });
        }
      });

      // Search day entries
      chapter.dayEntries.forEach((entry) => {
        // Filter by mood
        if (selectedMood) {
          if (entry.morningMood === selectedMood || entry.eveningMood === selectedMood) {
            results.push({
              type: "chapter",
              chapterId: chapter.id,
              chapterName: chapter.destination,
              text: `${chapter.destination} - Day with ${selectedMood} mood`,
              date: entry.date,
            });
          }
        }

        // Filter by date
        if (dateFilter && entry.date === dateFilter) {
          results.push({
            type: "chapter",
            chapterId: chapter.id,
            chapterName: chapter.destination,
            text: `${chapter.destination} - ${formatDate(entry.date)}`,
            date: entry.date,
          });
        }

        // Search thoughts
        entry.thoughts.forEach((thought) => {
          if (query && thought.text.toLowerCase().includes(query)) {
            results.push({
              type: "thought",
              chapterId: chapter.id,
              chapterName: chapter.destination,
              text: thought.text,
              date: thought.createdAt,
              author: thought.author,
            });
          }
        });

        // Search gratitude
        if (query && entry.gratitude?.toLowerCase().includes(query)) {
          results.push({
            type: "gratitude",
            chapterId: chapter.id,
            chapterName: chapter.destination,
            text: entry.gratitude,
            date: entry.date,
            author: entry.gratitudeAuthor,
          });
        }
      });

      // Search letters
      chapter.letters.forEach((letter) => {
        if (query && letter.content.toLowerCase().includes(query)) {
          results.push({
            type: "letter",
            chapterId: chapter.id,
            chapterName: chapter.destination,
            text: letter.content.slice(0, 100) + (letter.content.length > 100 ? "..." : ""),
            date: letter.createdAt,
            author: letter.from,
          });
        }
      });

      // Search reflection
      if (query && chapter.reflection?.toLowerCase().includes(query)) {
        results.push({
          type: "chapter",
          chapterId: chapter.id,
          chapterName: chapter.destination,
          text: chapter.reflection.slice(0, 100) + (chapter.reflection.length > 100 ? "..." : ""),
          date: chapter.dateTo,
        });
      }
    });

    // Remove duplicates
    const seen = new Set<string>();
    return results.filter((r) => {
      const key = `${r.chapterId}-${r.type}-${r.text.slice(0, 50)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [chapters, searchQuery, selectedMood, dateFilter]);

  const typeIcons: Record<string, string> = {
    chapter: "📖",
    moment: "✨",
    thought: "💭",
    letter: "💌",
    gratitude: "🙏",
  };

  return (
    <main className="min-h-screen px-4 py-8 pb-24 md:pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <Ornament className="mb-4" />
          <h1 className="font-display text-2xl text-plum mb-2">Search Memories</h1>
          <p className="text-midnight-soft text-sm italic">Find your treasured moments</p>
        </header>

        {/* Search Input */}
        <div className="space-y-4 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for memories, places, thoughts..."
            className="input-field text-lg"
            autoFocus
          />

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Mood filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-midnight-soft mb-1 block">Filter by mood</label>
              <select
                value={selectedMood || ""}
                onChange={(e) => setSelectedMood(e.target.value as Mood || null)}
                className="input-field text-sm"
              >
                <option value="">All moods</option>
                {MOOD_OPTIONS.map((mood) => (
                  <option key={mood.id} value={mood.id}>
                    {mood.icon} {mood.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-midnight-soft mb-1 block">Filter by date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Clear filters */}
          {(searchQuery || selectedMood || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedMood(null);
                setDateFilter("");
              }}
              className="text-sm text-lavender hover:text-plum transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results */}
        {!isLoaded ? (
          <p className="text-center text-midnight-soft italic animate-pulse">Loading...</p>
        ) : searchResults.length === 0 && (searchQuery || selectedMood || dateFilter) ? (
          <div className="text-center py-12">
            <img
              src="/images/empty-search.png"
              alt="No results"
              className="w-32 h-32 mx-auto mb-4 opacity-70"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p className="text-4xl mb-4">🔮</p>
            <p className="text-midnight-soft italic">No memories found</p>
            <p className="text-sm text-midnight-soft mt-2">Try a different search term</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-midnight-soft mb-4">
              Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
            </p>
            {searchResults.map((result, index) => (
              <Link
                key={`${result.chapterId}-${index}`}
                href={`/chapter/${result.chapterId}`}
                className="block book-card p-4 hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{typeIcons[result.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-plum font-display">{result.chapterName}</p>
                    <p className="text-midnight line-clamp-2 text-sm mt-1">{result.text}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-midnight-soft">
                      {result.date && <span>{formatDate(result.date)}</span>}
                      {result.author && (
                        <span className="bg-parchment-dark px-2 py-0.5 rounded">
                          {result.author === "ива" ? "🌸 Ива" : "🌙 Мео"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-midnight-soft italic">Start typing to search your memories</p>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-plum hover:text-plum-light transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <BottomNavSpacer />
    </main>
  );
}
