"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Chapter, Mood, MOOD_OPTIONS, formatDate, Author } from "@/lib/types";
import { getAllChapters } from "@/lib/storage";
import { Ornament } from "@/components/Ornament";
import { BottomNavSpacer } from "@/components/BottomNav";
import {
  Book,
  Sparkles,
  MessageCircle,
  Mail,
  HandHeart,
  Search,
  Wand2,
  ArrowLeft,
  X,
  Flower2,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { Button, MOOD_ICONS } from "@/components/ui";

interface SearchResult {
  type: "chapter" | "moment" | "thought" | "letter" | "gratitude";
  chapterId: string;
  chapterName: string;
  text: string;
  date?: string;
  author?: string;
}

const TYPE_ICONS: Record<string, LucideIcon> = {
  chapter: Book,
  moment: Sparkles,
  thought: MessageCircle,
  letter: Mail,
  gratitude: HandHeart,
};

function AuthorBadge({ author }: { author: Author }) {
  const Icon = author === "ива" ? Flower2 : Moon;
  const name = author === "ива" ? "Ива" : "Мео";
  return (
    <span className="bg-parchment-dark px-2 py-0.5 rounded inline-flex items-center gap-1">
      <Icon className="w-3 h-3" /> {name}
    </span>
  );
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

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && !selectedMood && !dateFilter) {
      return [];
    }

    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase().trim();

    chapters.forEach((chapter) => {
      if (query && chapter.destination.toLowerCase().includes(query)) {
        results.push({
          type: "chapter",
          chapterId: chapter.id,
          chapterName: chapter.destination,
          text: chapter.coverLine || chapter.destination,
          date: chapter.dateFrom,
        });
      }

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

      chapter.dayEntries.forEach((entry) => {
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

        if (dateFilter && entry.date === dateFilter) {
          results.push({
            type: "chapter",
            chapterId: chapter.id,
            chapterName: chapter.destination,
            text: `${chapter.destination} - ${formatDate(entry.date)}`,
            date: entry.date,
          });
        }

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

    const seen = new Set<string>();
    return results.filter((r) => {
      const key = `${r.chapterId}-${r.type}-${r.text.slice(0, 50)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [chapters, searchQuery, selectedMood, dateFilter]);

  return (
    <main className="min-h-screen px-4 py-8 pb-24 md:pb-12">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <Ornament className="mb-4" />
          <h1 className="font-display text-2xl text-plum mb-2 flex items-center justify-center gap-2">
            <Search className="w-6 h-6" /> Search Memories
          </h1>
          <p className="text-midnight-soft text-sm italic">Find your treasured moments</p>
        </header>

        <div className="space-y-4 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for memories, places, thoughts..."
            className="input-field text-lg"
            autoFocus
          />

          <div className="flex flex-wrap gap-3">
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
                    {mood.label}
                  </option>
                ))}
              </select>
            </div>

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

          {(searchQuery || selectedMood || dateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => {
                setSearchQuery("");
                setSelectedMood(null);
                setDateFilter("");
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>

        {!isLoaded ? (
          <p className="text-center text-midnight-soft italic animate-pulse">Loading...</p>
        ) : searchResults.length === 0 && (searchQuery || selectedMood || dateFilter) ? (
          <div className="text-center py-12">
            <Wand2 className="w-12 h-12 text-plum/50 mx-auto mb-4" />
            <p className="text-midnight-soft italic">No memories found</p>
            <p className="text-sm text-midnight-soft mt-2">Try a different search term</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-midnight-soft mb-4">
              Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
            </p>
            {searchResults.map((result, index) => {
              const Icon = TYPE_ICONS[result.type];
              return (
                <Link
                  key={`${result.chapterId}-${index}`}
                  href={`/chapter/${result.chapterId}`}
                  className="block book-card p-4 hover:scale-[1.01] transition-transform"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-plum flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-plum font-display">{result.chapterName}</p>
                      <p className="text-midnight line-clamp-2 text-sm mt-1">{result.text}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-midnight-soft">
                        {result.date && <span>{formatDate(result.date)}</span>}
                        {result.author && <AuthorBadge author={result.author as Author} />}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-plum/50 mx-auto mb-4" />
            <p className="text-midnight-soft italic">Start typing to search your memories</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-plum hover:text-plum-light transition-colors text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>

      <BottomNavSpacer />
    </main>
  );
}
