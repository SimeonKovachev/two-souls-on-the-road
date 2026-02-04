"use client";

import { useState } from "react";
import { TimeCapsule, Author, canOpenTimeCapsule, getAuthorInfo, formatDate } from "@/lib/types";
import { GoldLine } from "./Ornament";
import { Button, Timer, Lock, Unlock, Sparkles, Plus, X, Flower2, Moon } from "./ui";

interface TimeCapsuleSectionProps {
  capsules: TimeCapsule[];
  currentUser: Author;
  onCreateCapsule: (title: string, content: string, author: Author, unlockDate: string) => void;
  onUnlockCapsule: (capsuleId: string) => void;
  disabled?: boolean;
}

function AuthorIcon({ author }: { author: Author }) {
  const Icon = author === "ива" ? Flower2 : Moon;
  return <Icon className="w-3 h-3" />;
}

export function TimeCapsuleSection({
  capsules,
  currentUser,
  onCreateCapsule,
  onUnlockCapsule,
  disabled = false,
}: TimeCapsuleSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [viewingCapsule, setViewingCapsule] = useState<TimeCapsule | null>(null);

  const lockedCapsules = capsules.filter((c) => !c.isUnlocked);
  const unlockedCapsules = capsules.filter((c) => c.isUnlocked);
  const readyToOpen = lockedCapsules.filter((c) => canOpenTimeCapsule(c));

  const handleCreate = () => {
    if (!title.trim() || !content.trim() || !unlockDate) return;
    onCreateCapsule(title.trim(), content.trim(), currentUser, unlockDate);
    setTitle("");
    setContent("");
    setUnlockDate("");
    setIsCreating(false);
  };

  const handleTryOpen = (capsule: TimeCapsule) => {
    if (canOpenTimeCapsule(capsule)) {
      if (!capsule.isUnlocked) {
        onUnlockCapsule(capsule.id);
      }
      setViewingCapsule({ ...capsule, isUnlocked: true });
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-plum flex items-center gap-2">
          <Timer className="w-5 h-5" /> Time Capsules
          {readyToOpen.length > 0 && (
            <span className="bg-lavender text-midnight text-xs px-2 py-0.5 rounded-full animate-pulse">
              {readyToOpen.length} ready!
            </span>
          )}
        </h3>
        {!disabled && !isCreating && (
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsCreating(true)}>
            Create
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="book-card p-4 space-y-4 animate-fade-in">
          <p className="text-sm text-midnight-soft italic text-center">
            Write something to your future selves...
          </p>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this capsule a title..."
            className="input-field"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to remember? What message do you have for the future?"
            className="textarea-field"
            rows={5}
          />

          <div>
            <label className="block text-sm text-plum font-display mb-1">
              Unlock on:
            </label>
            <input
              type="date"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              min={minDate}
              className="input-field"
            />
            <p className="text-xs text-midnight-soft mt-1 italic">
              Choose a meaningful date — maybe your anniversary, or one year from now
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setTitle("");
                setContent("");
                setUnlockDate("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              icon={Timer}
              onClick={handleCreate}
              disabled={!title.trim() || !content.trim() || !unlockDate}
            >
              Seal the capsule
            </Button>
          </div>
        </div>
      )}

      {lockedCapsules.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-midnight-soft">Waiting to be opened...</p>
          {lockedCapsules.map((capsule) => {
            const canOpen = canOpenTimeCapsule(capsule);
            const daysUntil = Math.ceil(
              (new Date(capsule.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={capsule.id}
                className={`
                  book-card p-4 transition-all
                  ${canOpen ? "border-2 border-lavender cursor-pointer hover:scale-[1.01]" : "opacity-70"}
                `}
                onClick={() => canOpen && handleTryOpen(capsule)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-plum">{capsule.title}</h4>
                    <p className="text-xs text-midnight-soft inline-flex items-center gap-1">
                      By <AuthorIcon author={capsule.author} /> {getAuthorInfo(capsule.author).name}
                    </p>
                  </div>
                  <div className="text-right">
                    {canOpen ? (
                      <span className="text-lavender font-display animate-pulse inline-flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> Ready to open!
                      </span>
                    ) : (
                      <>
                        <p className="text-sm text-midnight-soft inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {formatDate(capsule.unlockDate)}
                        </p>
                        <p className="text-xs text-lavender">
                          {daysUntil} day{daysUntil !== 1 ? "s" : ""} left
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {unlockedCapsules.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-midnight-soft">Opened memories</p>
          {unlockedCapsules.map((capsule) => (
            <button
              key={capsule.id}
              onClick={() => setViewingCapsule(capsule)}
              className="w-full book-card p-3 text-left hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-plum">{capsule.title}</h4>
                  <p className="text-xs text-midnight-soft">
                    Opened {capsule.unlockedAt ? formatDate(capsule.unlockedAt) : ""}
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-lavender" />
              </div>
            </button>
          ))}
        </div>
      )}

      {capsules.length === 0 && !isCreating && (
        <div className="text-center py-6">
          <Timer className="w-10 h-10 text-plum/50 mx-auto mb-2" />
          <p className="text-midnight-soft italic text-sm">
            No time capsules yet. Create one to send a message to your future selves!
          </p>
        </div>
      )}

      {viewingCapsule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-midnight/50 backdrop-blur-sm"
            onClick={() => setViewingCapsule(null)}
          />
          <div className="relative book-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in">
            <div className="text-center mb-4">
              <Sparkles className="w-8 h-8 text-lavender mx-auto mb-2" />
              <h3 className="font-display text-xl text-plum">{viewingCapsule.title}</h3>
              <p className="text-xs text-midnight-soft mt-1 inline-flex items-center justify-center gap-1">
                Created by <AuthorIcon author={viewingCapsule.author} /> {getAuthorInfo(viewingCapsule.author).name}
              </p>
              <p className="text-xs text-lavender">
                {formatDate(viewingCapsule.createdAt)}
              </p>
            </div>

            <GoldLine />

            <p className="font-body text-midnight leading-relaxed whitespace-pre-wrap py-4">
              {viewingCapsule.content}
            </p>

            <GoldLine />

            <Button variant="secondary" fullWidth className="mt-4" onClick={() => setViewingCapsule(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
