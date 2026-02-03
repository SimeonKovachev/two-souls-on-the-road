"use client";

import { useState } from "react";
import { TimeCapsule, Author, canOpenTimeCapsule, getAuthorInfo, formatDate } from "@/lib/types";
import { AuthorSelector } from "./AuthorSelector";
import { GoldLine } from "./Ornament";

interface TimeCapsuleSectionProps {
  capsules: TimeCapsule[];
  currentUser: Author;
  onCreateCapsule: (title: string, content: string, author: Author, unlockDate: string) => void;
  onUnlockCapsule: (capsuleId: string) => void;
  disabled?: boolean;
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

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-plum flex items-center gap-2">
          ⏳ Time Capsules
          {readyToOpen.length > 0 && (
            <span className="bg-gold text-midnight text-xs px-2 py-0.5 rounded-full animate-pulse">
              {readyToOpen.length} ready!
            </span>
          )}
        </h3>
        {!disabled && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-secondary text-sm"
          >
            Create capsule
          </button>
        )}
      </div>

      {/* Creating mode */}
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
            <button
              onClick={() => {
                setIsCreating(false);
                setTitle("");
                setContent("");
                setUnlockDate("");
              }}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!title.trim() || !content.trim() || !unlockDate}
              className="btn-primary text-sm disabled:opacity-50"
            >
              Seal the capsule ⏳
            </button>
          </div>
        </div>
      )}

      {/* Locked capsules */}
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
                  ${canOpen ? "border-2 border-gold cursor-pointer hover:scale-[1.01]" : "opacity-70"}
                `}
                onClick={() => canOpen && handleTryOpen(capsule)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-plum">{capsule.title}</h4>
                    <p className="text-xs text-midnight-soft">
                      By {getAuthorInfo(capsule.author).icon} {getAuthorInfo(capsule.author).name}
                    </p>
                  </div>
                  <div className="text-right">
                    {canOpen ? (
                      <span className="text-gold font-display animate-pulse">
                        ✨ Ready to open!
                      </span>
                    ) : (
                      <>
                        <p className="text-sm text-midnight-soft">
                          🔒 {formatDate(capsule.unlockDate)}
                        </p>
                        <p className="text-xs text-gold">
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

      {/* Unlocked capsules */}
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
                <span className="text-gold">✨</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {capsules.length === 0 && !isCreating && (
        <div className="text-center py-6">
          <p className="text-4xl mb-2">⏳</p>
          <p className="text-midnight-soft italic text-sm">
            No time capsules yet. Create one to send a message to your future selves!
          </p>
        </div>
      )}

      {/* Viewing modal */}
      {viewingCapsule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-midnight/50 backdrop-blur-sm"
            onClick={() => setViewingCapsule(null)}
          />
          <div className="relative book-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in">
            <div className="text-center mb-4">
              <p className="text-3xl mb-2">✨</p>
              <h3 className="font-display text-xl text-plum">{viewingCapsule.title}</h3>
              <p className="text-xs text-midnight-soft mt-1">
                Created by {getAuthorInfo(viewingCapsule.author).icon} {getAuthorInfo(viewingCapsule.author).name}
              </p>
              <p className="text-xs text-gold">
                {formatDate(viewingCapsule.createdAt)}
              </p>
            </div>

            <GoldLine />

            <p className="font-body text-midnight leading-relaxed whitespace-pre-wrap py-4">
              {viewingCapsule.content}
            </p>

            <GoldLine />

            <button
              onClick={() => setViewingCapsule(null)}
              className="btn-secondary w-full mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
