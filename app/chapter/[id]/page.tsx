"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Chapter, Mood, Author, formatDateRange } from "@/lib/types";
import {
  getChapterById,
  toggleMood,
  toggleSeal,
  updateChapter,
  deleteChapter,
  addMoment,
  deleteMoment,
  updateDayEntry,
  addThought,
  answerPrompt,
  createLetter,
  markLetterRead,
  createTimeCapsule,
  unlockTimeCapsule,
  uploadPhoto,
} from "@/lib/storage";
import { MoodPicker } from "@/components/MoodPicker";
import { MomentCard } from "@/components/MomentCard";
import { AddMomentForm } from "@/components/AddMomentForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Ornament, PageDivider, GoldLine } from "@/components/Ornament";
import { AuthorSelector } from "@/components/AuthorSelector";
import { DayEntryCard } from "@/components/DayEntryCard";
import { LettersSection } from "@/components/LettersSection";
import { TimeCapsuleSection } from "@/components/TimeCapsuleSection";
import { MoodVisualization } from "@/components/MoodVisualization";

type TabType = "days" | "moments" | "letters" | "capsules" | "moods";

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.id as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState<Author>("ива");
  const [activeTab, setActiveTab] = useState<TabType>("days");
  const [reflection, setReflection] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMomentId, setDeletingMomentId] = useState<string | null>(null);
  const [firstImpression, setFirstImpression] = useState("");
  const [lastNightThoughts, setLastNightThoughts] = useState("");

  const loadChapter = useCallback(async () => {
    const data = await getChapterById(chapterId);
    setChapter(data);
    if (data) {
      setReflection(data.reflection || "");
      setFirstImpression(data.firstImpression?.text || "");
      setLastNightThoughts(data.lastNightThoughts?.text || "");
    }
    setIsLoaded(true);
  }, [chapterId]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleMoodToggle = async (mood: Mood) => {
    if (!chapter || chapter.sealed) return;
    const updated = await toggleMood(chapterId, mood);
    if (updated) setChapter(updated);
  };

  const handleSealToggle = async () => {
    if (!chapter) return;
    const updated = await toggleSeal(chapterId);
    if (updated) setChapter(updated);
  };

  const handleReflectionSave = async () => {
    if (!chapter || chapter.sealed) return;
    const updated = await updateChapter(chapterId, { reflection: reflection.trim() });
    if (updated) setChapter(updated);
  };

  const handleFirstImpressionSave = async () => {
    if (!chapter || chapter.sealed) return;
    const updated = await updateChapter(chapterId, {
      firstImpression: {
        text: firstImpression.trim(),
        author: currentAuthor,
        createdAt: new Date().toISOString(),
      },
    });
    if (updated) setChapter(updated);
  };

  const handleLastNightSave = async () => {
    if (!chapter || chapter.sealed) return;
    const updated = await updateChapter(chapterId, {
      lastNightThoughts: {
        text: lastNightThoughts.trim(),
        author: currentAuthor,
        createdAt: new Date().toISOString(),
      },
    });
    if (updated) setChapter(updated);
  };

  // Moments
  const handleAddMoment = async (text: string, photoDataUrl?: string) => {
    if (!chapter || chapter.sealed) return;
    await addMoment(chapterId, text, photoDataUrl, currentAuthor);
    loadChapter();
  };

  const handleDeleteMoment = async (momentId: string) => {
    if (!chapter || chapter.sealed) return;
    await deleteMoment(chapterId, momentId);
    loadChapter();
    setDeletingMomentId(null);
  };

  // Day entries
  const handleUpdateDayMood = async (dayEntryId: string, type: "morning" | "evening", mood: Mood) => {
    if (!chapter || chapter.sealed) return;
    await updateDayEntry(chapterId, dayEntryId, {
      [type === "morning" ? "morningMood" : "eveningMood"]: mood,
    });
    loadChapter();
  };

  const handleAddThought = async (dayEntryId: string, text: string, author: Author) => {
    if (!chapter || chapter.sealed) return;
    await addThought(chapterId, dayEntryId, text, author);
    loadChapter();
  };

  const handleAnswerPrompt = async (dayEntryId: string, question: string, answer: string, author: Author) => {
    if (!chapter || chapter.sealed) return;
    await answerPrompt(chapterId, dayEntryId, question, answer, author);
    loadChapter();
  };

  const handleUpdateGratitude = async (dayEntryId: string, text: string, author: Author) => {
    if (!chapter || chapter.sealed) return;
    await updateDayEntry(chapterId, dayEntryId, { gratitude: text, gratitudeAuthor: author });
    loadChapter();
  };

  const handleUpdateWordOfDay = async (dayEntryId: string, word: string) => {
    if (!chapter || chapter.sealed) return;
    await updateDayEntry(chapterId, dayEntryId, { wordOfTheDay: word });
    loadChapter();
  };

  const handleAddPhoto = async (dayEntryId: string, file: File, author: Author) => {
    if (!chapter || chapter.sealed) return;
    await uploadPhoto(file, chapterId, dayEntryId, author);
    loadChapter();
  };

  // Letters
  const handleCreateLetter = async (from: Author, to: Author, content: string) => {
    if (!chapter) return;
    await createLetter(chapterId, from, to, content);
    loadChapter();
  };

  const handleMarkLetterRead = async (letterId: string) => {
    if (!chapter) return;
    await markLetterRead(chapterId, letterId);
    loadChapter();
  };

  // Time capsules
  const handleCreateCapsule = async (title: string, content: string, author: Author, unlockDate: string) => {
    if (!chapter) return;
    await createTimeCapsule(chapterId, title, content, author, unlockDate);
    loadChapter();
  };

  const handleUnlockCapsule = async (capsuleId: string) => {
    if (!chapter) return;
    await unlockTimeCapsule(chapterId, capsuleId);
    loadChapter();
  };

  // Delete chapter
  const handleDeleteChapter = async () => {
    await deleteChapter(chapterId);
    router.push("/");
  };

  // ============================================
  // RENDER
  // ============================================

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-midnight-soft italic animate-pulse">Opening chapter...</p>
      </main>
    );
  }

  if (!chapter) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-midnight-soft italic mb-4">This chapter was not found.</p>
        <Link href="/" className="btn-secondary">
          Return to the Grimoire
        </Link>
      </main>
    );
  }

  const dateRange = formatDateRange(chapter.dateFrom, chapter.dateTo);
  const isSealed = chapter.sealed;
  const hasDayEntries = chapter.dayEntries && chapter.dayEntries.length > 0;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "days", label: "Daily Journal", icon: "📖" },
    { id: "moments", label: "Moments", icon: "✨" },
    { id: "letters", label: "Letters", icon: "💌" },
    { id: "capsules", label: "Time Capsules", icon: "⏳" },
    { id: "moods", label: "Mood Map", icon: "🌙" },
  ];

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-plum hover:text-plum-light transition-colors mb-8"
        >
          ← Back to the Grimoire
        </Link>

        {/* ======================================== */}
        {/* HEADER */}
        {/* ======================================== */}
        <header className="text-center mb-8 animate-fade-in">
          <Ornament className="mb-4" />

          {isSealed && (
            <div className="mb-4">
              <span className="sealed-badge">✧ Sealed ✧</span>
            </div>
          )}

          <h1 className="font-display text-3xl md:text-4xl text-plum mb-2">
            {chapter.destination}
          </h1>

          {chapter.subtitle && (
            <p className="font-body italic text-gold text-sm mb-2">{chapter.subtitle}</p>
          )}

          {dateRange && (
            <p className="text-midnight-soft text-sm mb-3">{dateRange}</p>
          )}

          {chapter.coverLine && (
            <p className="font-body italic text-midnight/80 max-w-md mx-auto">
              &ldquo;{chapter.coverLine}&rdquo;
            </p>
          )}
        </header>

        {/* Author selector */}
        {!isSealed && (
          <div className="mb-6 animate-fade-in-delay-1">
            <AuthorSelector
              selected={currentAuthor}
              onChange={setCurrentAuthor}
              label="Who's writing?"
            />
          </div>
        )}

        <PageDivider />

        {/* ======================================== */}
        {/* FIRST IMPRESSION */}
        {/* ======================================== */}
        <section className="mb-8 animate-fade-in-delay-1">
          <h3 className="font-display text-lg text-plum mb-2 text-center">🌅 First Impression</h3>
          <p className="text-xs text-midnight-soft text-center mb-3 italic">
            What struck you when you first arrived?
          </p>
          {chapter.firstImpression ? (
            <div className="book-card p-4">
              <p className="font-body text-midnight italic">&ldquo;{chapter.firstImpression.text}&rdquo;</p>
              <p className="text-xs text-gold mt-2">
                — {chapter.firstImpression.author === "ива" ? "🌸 Ива" : "🌙 Мео"}
              </p>
            </div>
          ) : !isSealed ? (
            <div className="space-y-2">
              <textarea
                value={firstImpression}
                onChange={(e) => setFirstImpression(e.target.value)}
                placeholder="Describe your first impression..."
                className="textarea-field text-sm"
                rows={3}
              />
              <button
                onClick={handleFirstImpressionSave}
                disabled={!firstImpression.trim()}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-center text-midnight-soft italic text-sm">Not written</p>
          )}
        </section>

        <GoldLine />

        {/* ======================================== */}
        {/* TABS */}
        {/* ======================================== */}
        <nav className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-3 py-2 rounded-full text-sm transition-all
                  ${activeTab === tab.id
                    ? "bg-plum text-parchment"
                    : "bg-cream border border-parchment-dark text-midnight-soft hover:border-gold"
                  }
                `}
              >
                <span className="mr-1">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ======================================== */}
        {/* TAB CONTENT */}
        {/* ======================================== */}
        <section className="mb-10 min-h-[300px]">
          {/* Daily Journal Tab */}
          {activeTab === "days" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-xl text-plum text-center mb-4">
                📖 Daily Journal
              </h2>
              {hasDayEntries ? (
                chapter.dayEntries.map((entry) => (
                  <DayEntryCard
                    key={entry.id}
                    entry={entry}
                    onUpdateMood={(type, mood) => handleUpdateDayMood(entry.id, type, mood)}
                    onAddThought={(text, author) => handleAddThought(entry.id, text, author)}
                    onAnswerPrompt={(q, a, author) => handleAnswerPrompt(entry.id, q, a, author)}
                    onUpdateGratitude={(text, author) => handleUpdateGratitude(entry.id, text, author)}
                    onUpdateWordOfDay={(word) => handleUpdateWordOfDay(entry.id, word)}
                    onAddPhoto={(file, author) => handleAddPhoto(entry.id, file, author)}
                    disabled={isSealed}
                  />
                ))
              ) : (
                <p className="text-center text-midnight-soft italic py-8">
                  Set dates for this chapter to enable the daily journal.
                </p>
              )}
            </div>
          )}

          {/* Moments Tab */}
          {activeTab === "moments" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-xl text-plum text-center mb-4">
                ✨ Moments
              </h2>
              {!isSealed && (
                <AddMomentForm onAdd={handleAddMoment} disabled={isSealed} />
              )}
              {chapter.moments.length === 0 ? (
                <p className="text-center text-midnight-soft italic py-6">
                  No moments captured yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {chapter.moments
                    .slice()
                    .sort((a, b) => a.createdAt - b.createdAt)
                    .map((moment) => (
                      <MomentCard
                        key={moment.id}
                        moment={moment}
                        onDelete={() => setDeletingMomentId(moment.id)}
                        disabled={isSealed}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Letters Tab */}
          {activeTab === "letters" && (
            <div className="animate-fade-in">
              <LettersSection
                letters={chapter.letters}
                currentUser={currentAuthor}
                onCreateLetter={handleCreateLetter}
                onMarkRead={handleMarkLetterRead}
                disabled={isSealed}
              />
            </div>
          )}

          {/* Time Capsules Tab */}
          {activeTab === "capsules" && (
            <div className="animate-fade-in">
              <TimeCapsuleSection
                capsules={chapter.timeCapsules}
                currentUser={currentAuthor}
                onCreateCapsule={handleCreateCapsule}
                onUnlockCapsule={handleUnlockCapsule}
                disabled={isSealed}
              />
            </div>
          )}

          {/* Mood Map Tab */}
          {activeTab === "moods" && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl text-plum text-center mb-4">
                🌙 Mood Constellation
              </h2>
              <MoodVisualization
                dayEntries={chapter.dayEntries}
                overallMoods={chapter.moods}
              />

              <GoldLine className="my-6" />

              <h3 className="font-display text-lg text-plum mb-3 text-center">Overall Trip Moods</h3>
              <MoodPicker
                selected={chapter.moods}
                onToggle={handleMoodToggle}
                disabled={isSealed}
              />
            </div>
          )}
        </section>

        <GoldLine />

        {/* ======================================== */}
        {/* LAST NIGHT THOUGHTS */}
        {/* ======================================== */}
        <section className="mb-8">
          <h3 className="font-display text-lg text-plum mb-2 text-center">🌙 Last Night Thoughts</h3>
          <p className="text-xs text-midnight-soft text-center mb-3 italic">
            Before you leave, what do you want to remember?
          </p>
          {chapter.lastNightThoughts ? (
            <div className="book-card p-4">
              <p className="font-body text-midnight italic">&ldquo;{chapter.lastNightThoughts.text}&rdquo;</p>
              <p className="text-xs text-gold mt-2">
                — {chapter.lastNightThoughts.author === "ива" ? "🌸 Ива" : "🌙 Мео"}
              </p>
            </div>
          ) : !isSealed ? (
            <div className="space-y-2">
              <textarea
                value={lastNightThoughts}
                onChange={(e) => setLastNightThoughts(e.target.value)}
                placeholder="Your thoughts before leaving..."
                className="textarea-field text-sm"
                rows={3}
              />
              <button
                onClick={handleLastNightSave}
                disabled={!lastNightThoughts.trim()}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-center text-midnight-soft italic text-sm">Not written</p>
          )}
        </section>

        <GoldLine />

        {/* ======================================== */}
        {/* REFLECTION */}
        {/* ======================================== */}
        <section className="mb-10">
          <h2 className="font-display text-xl text-plum mb-2 text-center">
            Final Reflection
          </h2>
          <p className="text-center font-body italic text-midnight-soft text-sm mb-4">
            {chapter.reflectionPrompt}
          </p>

          {isSealed ? (
            chapter.reflection ? (
              <div className="book-card p-4">
                <p className="font-body text-midnight italic leading-relaxed">
                  &ldquo;{chapter.reflection}&rdquo;
                </p>
              </div>
            ) : (
              <p className="text-center text-midnight-soft italic text-sm">
                No reflection was written.
              </p>
            )
          ) : (
            <div className="space-y-3">
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Take a moment to reflect..."
                className="textarea-field"
                rows={4}
              />
              <button
                onClick={handleReflectionSave}
                disabled={reflection === (chapter.reflection || "")}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Save reflection
              </button>
            </div>
          )}
        </section>

        <PageDivider />

        {/* ======================================== */}
        {/* CLOSING ACTIONS */}
        {/* ======================================== */}
        <section className="text-center space-y-6">
          <div>
            <button
              onClick={handleSealToggle}
              className={`btn-primary ${isSealed ? "!bg-gold !text-midnight hover:!bg-gold-muted" : ""}`}
            >
              {isSealed ? "✧ Unseal this chapter" : "✧ Seal this chapter"}
            </button>
            <p className="text-xs text-midnight-soft mt-2 italic">
              {isSealed
                ? "Unsealing allows you to edit again"
                : "Sealing marks this chapter as complete"}
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-sm text-red-700 hover:text-red-800 transition-colors"
            >
              Delete this chapter
            </button>
          </div>
        </section>

        <footer className="mt-16 text-center">
          <Ornament />
        </footer>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Chapter"
        message={`Are you sure you want to delete "${chapter.destination}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteChapter}
        onCancel={() => setShowDeleteModal(false)}
        danger
      />

      <ConfirmModal
        isOpen={!!deletingMomentId}
        title="Remove Moment"
        message="Are you sure you want to remove this moment?"
        confirmLabel="Remove"
        onConfirm={() => deletingMomentId && handleDeleteMoment(deletingMomentId)}
        onCancel={() => setDeletingMomentId(null)}
        danger
      />
    </main>
  );
}
