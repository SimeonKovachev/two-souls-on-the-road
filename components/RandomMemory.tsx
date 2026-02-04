"use client";

import { useState } from "react";
import { Chapter, Moment, formatDate } from "@/lib/types";
import { Sparkles, MessageCircle, Heart, Mail, FileText, BookOpen, Wand2, RefreshCw, Flower2 } from "lucide-react";

interface RandomMemoryProps {
  chapters: Chapter[];
}

interface MemoryItem {
  type: "moment" | "thought" | "gratitude" | "letter" | "reflection";
  text: string;
  chapterName: string;
  chapterId: string;
  date?: string;
  author?: string;
  photoUrl?: string;
}

export function RandomMemory({ chapters }: RandomMemoryProps) {
  const [memory, setMemory] = useState<MemoryItem | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const getAllMemories = (): MemoryItem[] => {
    const memories: MemoryItem[] = [];

    chapters.forEach((chapter) => {
      // Moments
      chapter.moments.forEach((moment) => {
        memories.push({
          type: "moment",
          text: moment.text,
          chapterName: chapter.destination,
          chapterId: chapter.id,
          date: new Date(moment.createdAt).toISOString(),
          author: moment.author,
          photoUrl: moment.photoDataUrl,
        });
      });

      // Day entries
      chapter.dayEntries.forEach((entry) => {
        // Thoughts
        entry.thoughts.forEach((thought) => {
          memories.push({
            type: "thought",
            text: thought.text,
            chapterName: chapter.destination,
            chapterId: chapter.id,
            date: thought.createdAt,
            author: thought.author,
          });
        });

        // Gratitude
        if (entry.gratitude) {
          memories.push({
            type: "gratitude",
            text: entry.gratitude,
            chapterName: chapter.destination,
            chapterId: chapter.id,
            date: entry.date,
            author: entry.gratitudeAuthor,
          });
        }
      });

      // Letters (only non-secret)
      chapter.letters.forEach((letter) => {
        if (letter.isRead) {
          memories.push({
            type: "letter",
            text: letter.content,
            chapterName: chapter.destination,
            chapterId: chapter.id,
            date: letter.createdAt,
            author: letter.from,
          });
        }
      });

      // Reflection
      if (chapter.reflection) {
        memories.push({
          type: "reflection",
          text: chapter.reflection,
          chapterName: chapter.destination,
          chapterId: chapter.id,
          date: chapter.dateTo,
        });
      }
    });

    return memories;
  };

  const revealRandomMemory = () => {
    setIsRevealing(true);
    setMemory(null);

    // Animation delay
    setTimeout(() => {
      const allMemories = getAllMemories();
      if (allMemories.length > 0) {
        const randomIndex = Math.floor(Math.random() * allMemories.length);
        setMemory(allMemories[randomIndex]);
      }
      setIsRevealing(false);
    }, 1000);
  };

  const typeIcons: Record<string, React.ReactNode> = {
    moment: <Sparkles className="w-5 h-5" />,
    thought: <MessageCircle className="w-5 h-5" />,
    gratitude: <Heart className="w-5 h-5" />,
    letter: <Mail className="w-5 h-5" />,
    reflection: <FileText className="w-5 h-5" />,
  };

  const typeLabels: Record<string, string> = {
    moment: "A Moment",
    thought: "A Thought",
    gratitude: "A Gratitude",
    letter: "A Letter",
    reflection: "A Reflection",
  };

  return (
    <div className="text-center">
      <button
        onClick={revealRandomMemory}
        disabled={isRevealing}
        className="btn-secondary group relative overflow-hidden inline-flex items-center gap-2"
      >
        {isRevealing && (
          <img
            src="/images/random-magic.png"
            alt=""
            className="absolute inset-0 w-full h-full object-contain opacity-30 animate-pulse"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <span className={`relative inline-flex items-center gap-2 ${isRevealing ? "animate-pulse" : ""}`}>
          {isRevealing ? <Wand2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isRevealing ? "Revealing..." : "Surprise Me!"}
        </span>
      </button>

      {/* Memory reveal */}
      {memory && (
        <div className="mt-6 animate-fade-in">
          <div className="book-card p-6 text-left max-w-md mx-auto">
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-3 text-lavender">
              {typeIcons[memory.type]}
              <span className="text-xs font-display uppercase tracking-wide">
                {typeLabels[memory.type]}
              </span>
            </div>

            {/* Photo if exists */}
            {memory.photoUrl && (
              <img
                src={memory.photoUrl}
                alt="Memory"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            {/* Text */}
            <p className="font-body text-midnight italic leading-relaxed mb-4">
              &ldquo;{memory.text.length > 300 ? memory.text.slice(0, 300) + "..." : memory.text}&rdquo;
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-midnight-soft">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {memory.chapterName}
                {memory.date && ` • ${formatDate(memory.date)}`}
              </span>
              {memory.author && (
                <span className="bg-parchment-dark px-2 py-0.5 rounded inline-flex items-center gap-1">
                  <Flower2 className="w-3 h-3" /> {memory.author === "ива" ? "Ива" : "Мео"}
                </span>
              )}
            </div>

            {/* Link to chapter */}
            <a
              href={`/chapter/${memory.chapterId}`}
              className="block mt-4 text-center text-sm text-plum hover:text-plum-light transition-colors"
            >
              Visit this chapter →
            </a>
          </div>

          {/* Try again */}
          <button
            onClick={revealRandomMemory}
            className="mt-4 text-sm text-lavender hover:text-plum transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Show another memory
          </button>
        </div>
      )}
    </div>
  );
}
