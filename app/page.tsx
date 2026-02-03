"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Chapter, AppSettings } from "@/lib/types";
import { getAllChapters } from "@/lib/storage";
import { ChapterCard } from "@/components/ChapterCard";
import { BackupManager } from "@/components/BackupManager";
import { Ornament, PageDivider } from "@/components/Ornament";
import { BottomNavSpacer } from "@/components/BottomNav";
import { BirthdayWelcome } from "@/components/BirthdayWelcome";
import { AnniversaryCounter, isAnniversary } from "@/components/AnniversaryCounter";
import { RandomMemory } from "@/components/RandomMemory";
import { SecretLoveNote, getTodaysNote, isTodayBirthday } from "@/components/SecretLoveNote";

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  welcomeShown: false,
  specialDates: [],
};

function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const stored = localStorage.getItem("two-souls-settings");
  if (!stored) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem("two-souls-settings", JSON.stringify(settings));
}

export default function HomePage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Special displays
  const [showBirthdayWelcome, setShowBirthdayWelcome] = useState(false);
  const [birthdayPerson, setBirthdayPerson] = useState<{ name: string; age: number } | null>(null);
  const [showLoveNote, setShowLoveNote] = useState(false);
  const [todaysNote, setTodaysNote] = useState<AppSettings["specialDates"][0] | null>(null);

  const loadChapters = async () => {
    const data = await getAllChapters();
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setChapters(data);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadChapters();

    // Load settings
    const loadedSettings = getSettings();
    setSettings(loadedSettings);

    // Check for birthday
    const birthday = isTodayBirthday(loadedSettings);
    if (birthday && !loadedSettings.welcomeShown) {
      const age = 23; // Ива's 23rd birthday!
      setBirthdayPerson({ name: birthday.name, age });
      setShowBirthdayWelcome(true);
    }

    // Check for special love note
    const note = getTodaysNote(loadedSettings);
    if (note) {
      const shownKey = `note-shown-${note.id}-${new Date().toDateString()}`;
      if (!localStorage.getItem(shownKey)) {
        setTodaysNote(note);
        setShowLoveNote(true);
        localStorage.setItem(shownKey, "true");
      }
    }
  }, []);

  const handleBirthdayClose = () => {
    setShowBirthdayWelcome(false);
    const newSettings = { ...settings, welcomeShown: true };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleLoveNoteClose = () => {
    setShowLoveNote(false);
  };

  // Calculate total stats
  const totalMoments = chapters.reduce((sum, ch) => sum + ch.moments.length, 0);
  const totalDays = chapters.reduce((sum, ch) => sum + (ch.dayEntries?.length || 0), 0);

  return (
    <>
      {/* Birthday Welcome Modal */}
      {showBirthdayWelcome && birthdayPerson && (
        <BirthdayWelcome
          name={birthdayPerson.name}
          age={birthdayPerson.age}
          partnerName={birthdayPerson.name === "Ива" ? "Мео" : "Ива"}
          onClose={handleBirthdayClose}
        />
      )}

      {/* Secret Love Note Modal */}
      {showLoveNote && todaysNote && (
        <SecretLoveNote note={todaysNote} onClose={handleLoveNoteClose} />
      )}

      <main className="min-h-screen px-4 py-8 pb-24 md:py-12 md:pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8 animate-fade-in">
            <Ornament className="mb-4" />

            <h1 className="font-display text-3xl md:text-4xl text-plum mb-2">
              Two Souls on the Road
            </h1>

            <p className="font-body text-midnight-soft italic text-sm md:text-base mb-3">
              A living book of our journeys
            </p>

            <p className="text-lavender text-sm tracking-widest">
              Ива ✧ Мео
            </p>
          </header>

          {/* Anniversary Counter */}
          {settings.anniversaryDate && (
            <div className="mb-6 animate-fade-in-delay-1">
              <AnniversaryCounter startDate={settings.anniversaryDate} />
              {isAnniversary(settings.anniversaryDate) && (
                <p className="text-center text-lavender animate-pulse mt-2">
                  ✨ Happy Anniversary! ✨
                </p>
              )}
            </div>
          )}

          <PageDivider />

          {/* Quick Stats */}
          {chapters.length > 0 && (
            <div className="flex justify-center gap-8 mb-6 text-center animate-fade-in-delay-1">
              <div>
                <p className="text-2xl font-display text-plum">{chapters.length}</p>
                <p className="text-xs text-midnight-soft">chapter{chapters.length !== 1 ? "s" : ""}</p>
              </div>
              <div>
                <p className="text-2xl font-display text-plum">{totalDays}</p>
                <p className="text-xs text-midnight-soft">day{totalDays !== 1 ? "s" : ""}</p>
              </div>
              <div>
                <p className="text-2xl font-display text-plum">{totalMoments}</p>
                <p className="text-xs text-midnight-soft">moment{totalMoments !== 1 ? "s" : ""}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in-delay-1">
            <Link href="/new-chapter" className="btn-primary">
              Begin a new chapter
            </Link>

            {/* Random Memory Surprise */}
            {chapters.length > 0 && totalMoments > 0 && (
              <RandomMemory chapters={chapters} />
            )}

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
                <p className="text-sm text-lavender">
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

        <BottomNavSpacer />
      </main>
    </>
  );
}
