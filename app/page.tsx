"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Chapter } from "@/lib/types";
import { getAllChapters } from "@/lib/storage";
import { ChapterCard } from "@/components/ChapterCard";
import { BackupManager } from "@/components/BackupManager";
import { Ornament, PageDivider } from "@/components/Ornament";

export default function HomePage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  const loadChapters = async () => {
    const data = await getAllChapters();
    // Sort by createdAt descending (newest first)
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setChapters(data);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadChapters();
  }, []);

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <Ornament className="mb-4" />

          <h1 className="font-display text-3xl md:text-4xl text-plum mb-2">
            Two Souls on the Road
          </h1>

          <p className="font-body text-midnight-soft italic text-sm md:text-base mb-3">
            A living book of our journeys
          </p>

          <p className="text-gold text-sm tracking-widest">
            Ива ✧ Мео
          </p>
        </header>

        <PageDivider />

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 mb-10 animate-fade-in-delay-1">
          <Link href="/new-chapter" className="btn-primary">
            Begin a new chapter
          </Link>

          <button
            onClick={() => setShowBackup(!showBackup)}
            className="text-sm text-midnight-soft hover:text-plum transition-colors"
          >
            {showBackup ? "Hide backup options" : "Backup & restore"}
          </button>

          {showBackup && (
            <div className="w-full max-w-md animate-fade-in">
              <BackupManager onImportSuccess={loadChapters} />
            </div>
          )}
        </div>

        {/* Chapters List */}
        <section className="animate-fade-in-delay-2">
          {!isLoaded ? (
            <div className="text-center py-12">
              <p className="text-midnight-soft italic animate-pulse">Loading your memories...</p>
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">📖</p>
              <p className="font-body text-midnight-soft italic mb-2">
                The pages are empty, waiting for your first story.
              </p>
              <p className="text-sm text-gold">
                Begin your journey together.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-display text-lg text-midnight-soft text-center mb-6">
                Our Chapters
              </h2>
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ChapterCard chapter={chapter} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center animate-fade-in-delay-3">
          <Ornament />
          <p className="text-xs text-midnight-soft mt-4 italic">
            Every journey is a page in our story
          </p>
        </footer>
      </div>
    </main>
  );
}
