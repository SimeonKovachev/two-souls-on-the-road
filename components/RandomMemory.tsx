"use client";

import { useState } from "react";
import { Chapter, Moment, formatDate } from "@/lib/types";

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

  const typeIcons: Record<string, string> = {
    moment: "✨",
    thought: "💭",
    gratitude: "🙏",
    letter: "💌",
    reflection: "📝",
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
        className="btn-secondary group relative overflow-hidden"
      >
        <span className={isRevealing ? "animate-pulse" : ""}>
          {isRevealing ? "🔮 Revealing..." : "✨ Surprise Me!"}
        </span>
      </button>

      {/* Memory reveal */}
      {memory && (
        <div className="mt-6 animate-fade-in">
          <div className="book-card p-6 text-left max-w-md mx-auto">
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{typeIcons[memory.type]}</span>
              <span className="text-xs text-lavender font-display uppercase tracking-wide">
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
              <span>
                📖 {memory.chapterName}
                {memory.date && ` • ${formatDate(memory.date)}`}
              </span>
              {memory.author && (
                <span className="bg-parchment-dark px-2 py-0.5 rounded">
                  {memory.author === "ива" ? "🌸 Ива" : "🌙 Мео"}
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
            className="mt-4 text-sm text-lavender hover:text-plum transition-colors"
          >
            Show another memory
          </button>
        </div>
      )}
    </div>
  );
}
