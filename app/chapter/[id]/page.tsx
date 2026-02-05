"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { DayEntryCard } from "@/components/DayEntryCard";
import { LettersSection } from "@/components/LettersSection";
import { TimeCapsuleSection } from "@/components/TimeCapsuleSection";
import { MoodVisualization } from "@/components/MoodVisualization";
import { useAutoSave, AutoSaveIndicator } from "@/lib/useAutoSave";
import { Button } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";
import {
  BookOpen,
  Sparkles,
  Mail,
  Timer,
  Moon,
  Sunrise,
  Sunset,
  Star,
  Printer,
  ArrowLeft,
  Flower2,
  Trash2,
  Lock,
  Unlock,
  type LucideIcon,
} from "lucide-react";

type TabType = "days" | "moments" | "letters" | "capsules" | "moods";

interface TabConfig {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

const TABS: TabConfig[] = [
  { id: "days", label: "Daily Journal", icon: BookOpen },
  { id: "moments", label: "Moments", icon: Sparkles },
  { id: "letters", label: "Letters", icon: Mail },
  { id: "capsules", label: "Time Capsules", icon: Timer },
  { id: "moods", label: "Mood Map", icon: Moon },
];

function AuthorBadge({ author }: { author: Author }) {
  const Icon = author === "ива" ? Flower2 : Moon;
  const name = author === "ива" ? "Ива" : "Мео";
  return (
    <span className="inline-flex items-center gap-1 text-lavender">
      <Icon className="w-3 h-3" /> {name}
    </span>
  );
}

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.id as string;
  const { currentUser } = useAuth();
  const currentAuthor: Author = currentUser || "мео";

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("days");
  const [reflection, setReflection] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMomentId, setDeletingMomentId] = useState<string | null>(null);
  const [firstImpression, setFirstImpression] = useState("");
  const [lastNightThoughts, setLastNightThoughts] = useState("");

  const initialLoadedRef = useRef(false);

  const loadChapter = useCallback(async () => {
    const data = await getChapterById(chapterId);
    setChapter(data);
    if (data) {
      setReflection(data.reflection || "");
      setFirstImpression(data.firstImpression?.text || "");
      setLastNightThoughts(data.lastNightThoughts?.text || "");
    }
    setIsLoaded(true);
    setTimeout(() => {
      initialLoadedRef.current = true;
    }, 100);
  }, [chapterId]);

  useEffect(() => {
    loadChapter();
  }, [loadChapter]);

  const { status: reflectionStatus, triggerSave: triggerReflectionSave } = useAutoSave({
    delay: 1000,
    onSave: useCallback(async () => {
      if (!chapter || chapter.sealed) return;
      if (reflection.trim() !== (chapter.reflection || "")) {
        const updated = await updateChapter(chapterId, { reflection: reflection.trim() });
        if (updated) setChapter(updated);
      }
    }, [chapter, chapterId, reflection]),
  });

  const { status: firstImpressionStatus, triggerSave: triggerFirstImpressionSave } = useAutoSave({
    delay: 1000,
    onSave: useCallback(async () => {
      if (!chapter || chapter.sealed || chapter.firstImpression) return;
      if (firstImpression.trim()) {
        const updated = await updateChapter(chapterId, {
          firstImpression: {
            text: firstImpression.trim(),
            author: currentAuthor,
            createdAt: new Date().toISOString(),
          },
        });
        if (updated) setChapter(updated);
      }
    }, [chapter, chapterId, firstImpression, currentAuthor]),
  });

  const { status: lastNightStatus, triggerSave: triggerLastNightSave } = useAutoSave({
    delay: 1000,
    onSave: useCallback(async () => {
      if (!chapter || chapter.sealed || chapter.lastNightThoughts) return;
      if (lastNightThoughts.trim()) {
        const updated = await updateChapter(chapterId, {
          lastNightThoughts: {
            text: lastNightThoughts.trim(),
            author: currentAuthor,
            createdAt: new Date().toISOString(),
          },
        });
        if (updated) setChapter(updated);
      }
    }, [chapter, chapterId, lastNightThoughts, currentAuthor]),
  });

  useEffect(() => {
    if (initialLoadedRef.current && reflection !== (chapter?.reflection || "")) {
      triggerReflectionSave();
    }
  }, [reflection, chapter?.reflection, triggerReflectionSave]);

  useEffect(() => {
    if (initialLoadedRef.current && !chapter?.firstImpression && firstImpression.trim()) {
      triggerFirstImpressionSave();
    }
  }, [firstImpression, chapter?.firstImpression, triggerFirstImpressionSave]);

  useEffect(() => {
    if (initialLoadedRef.current && !chapter?.lastNightThoughts && lastNightThoughts.trim()) {
      triggerLastNightSave();
    }
  }, [lastNightThoughts, chapter?.lastNightThoughts, triggerLastNightSave]);

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

  const handleDeleteChapter = async () => {
    await deleteChapter(chapterId);
    router.push("/");
  };

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
        <Button variant="secondary" onClick={() => router.push("/")}>
          Return to Home
        </Button>
      </main>
    );
  }

  const dateRange = formatDateRange(chapter.dateFrom, chapter.dateTo);
  const isSealed = chapter.sealed;
  const hasDayEntries = chapter.dayEntries && chapter.dayEntries.length > 0;

  return (
    <main className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-plum hover:text-plum-light transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <header className="text-center mb-8 animate-fade-in">
          <Ornament className="mb-4" />

          {isSealed && (
            <div className="mb-4">
              <span className="sealed-badge inline-flex items-center gap-1">
                <Star className="w-3 h-3" /> Sealed
              </span>
            </div>
          )}

          <h1 className="font-display text-3xl md:text-4xl text-plum mb-2">
            {chapter.destination}
          </h1>

          {chapter.subtitle && (
            <p className="font-body italic text-lavender text-sm mb-2">{chapter.subtitle}</p>
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

        {!isSealed && (
          <div className="mb-6 animate-fade-in-delay-1 text-center">
            <p className="text-sm text-midnight-soft italic">
              Writing as <AuthorBadge author={currentAuthor} />
            </p>
          </div>
        )}

        <PageDivider />

        <section className="mb-8 animate-fade-in-delay-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sunrise className="w-5 h-5 text-plum" />
            <h3 className="font-display text-lg text-plum">First Impression</h3>
            {!chapter.firstImpression && !isSealed && <AutoSaveIndicator status={firstImpressionStatus} />}
          </div>
          <p className="text-xs text-midnight-soft text-center mb-3 italic">
            What struck you when you first arrived?
          </p>
          {chapter.firstImpression ? (
            <div className="book-card p-4">
              <p className="font-body text-midnight italic">&ldquo;{chapter.firstImpression.text}&rdquo;</p>
              <p className="text-xs mt-2">— <AuthorBadge author={chapter.firstImpression.author} /></p>
            </div>
          ) : !isSealed ? (
            <div className="space-y-2">
              <textarea
                value={firstImpression}
                onChange={(e) => setFirstImpression(e.target.value)}
                placeholder="Describe your first impression... (auto-saves)"
                className="textarea-field text-sm"
                rows={3}
              />
              <p className="text-xs text-midnight-soft italic text-center">Auto-saves as you type</p>
            </div>
          ) : (
            <p className="text-center text-midnight-soft italic text-sm">Not written</p>
          )}
        </section>

        <GoldLine />

        <nav className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all
                    ${activeTab === tab.id
                      ? "bg-plum text-parchment"
                      : "bg-cream border border-parchment-dark text-midnight-soft hover:border-lavender"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <section className="mb-10 min-h-[300px]">
          {activeTab === "days" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-xl text-plum text-center mb-4 flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" /> Daily Journal
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

          {activeTab === "moments" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-xl text-plum text-center mb-4 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" /> Moments
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

          {activeTab === "moods" && (
            <div className="animate-fade-in">
              <h2 className="font-display text-xl text-plum text-center mb-4 flex items-center justify-center gap-2">
                <Moon className="w-5 h-5" /> Mood Constellation
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

        <section className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sunset className="w-5 h-5 text-plum" />
            <h3 className="font-display text-lg text-plum">Last Night Thoughts</h3>
            {!chapter.lastNightThoughts && !isSealed && <AutoSaveIndicator status={lastNightStatus} />}
          </div>
          <p className="text-xs text-midnight-soft text-center mb-3 italic">
            Before you leave, what do you want to remember?
          </p>
          {chapter.lastNightThoughts ? (
            <div className="book-card p-4">
              <p className="font-body text-midnight italic">&ldquo;{chapter.lastNightThoughts.text}&rdquo;</p>
              <p className="text-xs mt-2">— <AuthorBadge author={chapter.lastNightThoughts.author} /></p>
            </div>
          ) : !isSealed ? (
            <div className="space-y-2">
              <textarea
                value={lastNightThoughts}
                onChange={(e) => setLastNightThoughts(e.target.value)}
                placeholder="Your thoughts before leaving... (auto-saves)"
                className="textarea-field text-sm"
                rows={3}
              />
              <p className="text-xs text-midnight-soft italic text-center">Auto-saves as you type</p>
            </div>
          ) : (
            <p className="text-center text-midnight-soft italic text-sm">Not written</p>
          )}
        </section>

        <GoldLine />

        <section className="mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="font-display text-xl text-plum">Final Reflection</h2>
            {!isSealed && <AutoSaveIndicator status={reflectionStatus} />}
          </div>
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
                placeholder="Take a moment to reflect... (auto-saves)"
                className="textarea-field"
                rows={4}
              />
              <p className="text-xs text-midnight-soft italic text-center">Auto-saves as you type</p>
            </div>
          )}
        </section>

        <PageDivider />

        <section className="text-center space-y-6">
          <div>
            <Button
              onClick={handleSealToggle}
              icon={isSealed ? Unlock : Lock}
              variant={isSealed ? "secondary" : "primary"}
            >
              {isSealed ? "Unseal this chapter" : "Seal this chapter"}
            </Button>
            <p className="text-xs text-midnight-soft mt-2 italic">
              {isSealed
                ? "Unsealing allows you to edit again"
                : "Sealing marks this chapter as complete"}
            </p>
          </div>

          <div>
            <Link href={`/chapter/${chapterId}/print`}>
              <Button variant="secondary" icon={Printer}>
                Print / Export PDF
              </Button>
            </Link>
            <p className="text-xs text-midnight-soft mt-2 italic">
              Create a beautiful printable version of this chapter
            </p>
          </div>

          <div>
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={() => setShowDeleteModal(true)}
              className="text-red-700 hover:text-red-800"
            >
              Delete this chapter
            </Button>
          </div>
        </section>

        <footer className="mt-16 text-center">
          <Ornament />
        </footer>
      </div>

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
