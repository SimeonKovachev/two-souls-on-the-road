"use client";

import { useState } from "react";
import { Letter, Author, AUTHORS, getAuthorInfo } from "@/lib/types";
import { AuthorSelector } from "./AuthorSelector";
import { GoldLine } from "./Ornament";

interface LettersSectionProps {
  letters: Letter[];
  currentUser: Author;
  onCreateLetter: (from: Author, to: Author, content: string) => void;
  onMarkRead: (letterId: string) => void;
  disabled?: boolean;
}

export function LettersSection({
  letters,
  currentUser,
  onCreateLetter,
  onMarkRead,
  disabled = false,
}: LettersSectionProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Author>(
    currentUser === "ива" ? "мео" : "ива"
  );
  const [content, setContent] = useState("");
  const [readingLetter, setReadingLetter] = useState<Letter | null>(null);

  const myLetters = letters.filter((l) => l.to === currentUser);
  const sentLetters = letters.filter((l) => l.from === currentUser);
  const unreadCount = myLetters.filter((l) => !l.isRead).length;

  const handleSend = () => {
    if (!content.trim()) return;
    onCreateLetter(currentUser, selectedRecipient, content.trim());
    setContent("");
    setIsWriting(false);
  };

  const handleOpenLetter = (letter: Letter) => {
    setReadingLetter(letter);
    if (!letter.isRead) {
      onMarkRead(letter.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-plum flex items-center gap-2">
          💌 Letters
          {unreadCount > 0 && (
            <span className="bg-plum text-parchment text-xs px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h3>
        {!disabled && !isWriting && (
          <button
            onClick={() => setIsWriting(true)}
            className="btn-secondary text-sm"
          >
            Write a letter
          </button>
        )}
      </div>

      {/* Writing mode */}
      {isWriting && (
        <div className="book-card p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-midnight-soft italic">
              From {getAuthorInfo(currentUser).icon} {getAuthorInfo(currentUser).name}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-midnight-soft">To:</span>
              {AUTHORS.filter((a) => a.id !== currentUser).map((author) => (
                <button
                  key={author.id}
                  onClick={() => setSelectedRecipient(author.id)}
                  className={`
                    flex items-center gap-1 px-3 py-1 rounded-full text-sm
                    ${selectedRecipient === author.id
                      ? "bg-plum text-parchment"
                      : "bg-cream border border-parchment-dark"
                    }
                  `}
                >
                  {author.icon} {author.name}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something beautiful..."
            className="textarea-field"
            rows={6}
            autoFocus
          />

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setIsWriting(false);
                setContent("");
              }}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!content.trim()}
              className="btn-primary text-sm disabled:opacity-50"
            >
              Send letter 💌
            </button>
          </div>
        </div>
      )}

      {/* Received letters */}
      {myLetters.length > 0 && (
        <div>
          <p className="text-xs text-midnight-soft mb-2">Received</p>
          <div className="space-y-2">
            {myLetters.map((letter) => (
              <button
                key={letter.id}
                onClick={() => handleOpenLetter(letter)}
                className={`
                  w-full book-card p-3 text-left transition-all hover:scale-[1.01]
                  ${!letter.isRead ? "border-l-4 border-l-gold" : ""}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    From {getAuthorInfo(letter.from).icon} {getAuthorInfo(letter.from).name}
                  </span>
                  {!letter.isRead && (
                    <span className="text-xs bg-gold text-midnight px-2 py-0.5 rounded">
                      New
                    </span>
                  )}
                </div>
                <p className="text-xs text-midnight-soft mt-1">
                  {new Date(letter.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sent letters */}
      {sentLetters.length > 0 && (
        <div>
          <p className="text-xs text-midnight-soft mb-2">Sent</p>
          <div className="space-y-2">
            {sentLetters.map((letter) => (
              <button
                key={letter.id}
                onClick={() => setReadingLetter(letter)}
                className="w-full book-card p-3 text-left opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    To {getAuthorInfo(letter.to).icon} {getAuthorInfo(letter.to).name}
                  </span>
                  <span className="text-xs text-midnight-soft">
                    {letter.isRead ? "Read ✓" : "Unread"}
                  </span>
                </div>
                <p className="text-xs text-midnight-soft mt-1">
                  {new Date(letter.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {letters.length === 0 && !isWriting && (
        <p className="text-center text-midnight-soft italic text-sm py-4">
          No letters yet. Write one to your partner!
        </p>
      )}

      {/* Reading modal */}
      {readingLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-midnight/50 backdrop-blur-sm"
            onClick={() => setReadingLetter(null)}
          />
          <div className="relative book-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in">
            <div className="text-center mb-4">
              <p className="text-sm text-midnight-soft">
                From {getAuthorInfo(readingLetter.from).icon} {getAuthorInfo(readingLetter.from).name}
              </p>
              <p className="text-sm text-midnight-soft">
                To {getAuthorInfo(readingLetter.to).icon} {getAuthorInfo(readingLetter.to).name}
              </p>
              <p className="text-xs text-gold mt-1">
                {new Date(readingLetter.createdAt).toLocaleDateString()}
              </p>
            </div>

            <GoldLine />

            <p className="font-body text-midnight leading-relaxed whitespace-pre-wrap">
              {readingLetter.content}
            </p>

            <GoldLine />

            <button
              onClick={() => setReadingLetter(null)}
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
