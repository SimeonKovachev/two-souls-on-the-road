"use client";

import { useState } from "react";
import { Letter, Author, AUTHORS, getAuthorInfo } from "@/lib/types";
import { GoldLine } from "./Ornament";
import { Button, Mail, Send, Flower2, Moon, Check, Plus } from "./ui";

interface LettersSectionProps {
  letters: Letter[];
  currentUser: Author;
  onCreateLetter: (from: Author, to: Author, content: string) => void;
  onMarkRead: (letterId: string) => void;
  disabled?: boolean;
}

function AuthorIcon({ author, className = "w-4 h-4" }: { author: Author; className?: string }) {
  const Icon = author === "ива" ? Flower2 : Moon;
  return <Icon className={className} />;
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
          <Mail className="w-5 h-5" /> Letters
          {unreadCount > 0 && (
            <span className="bg-plum text-parchment text-xs px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h3>
        {!disabled && !isWriting && (
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsWriting(true)}>
            Write
          </Button>
        )}
      </div>

      {isWriting && (
        <div className="book-card p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-midnight-soft italic inline-flex items-center gap-1">
              From <AuthorIcon author={currentUser} className="w-3 h-3" /> {getAuthorInfo(currentUser).name}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-midnight-soft">To:</span>
              {AUTHORS.filter((a) => a.id !== currentUser).map((author) => (
                <button
                  key={author.id}
                  onClick={() => setSelectedRecipient(author.id)}
                  className={`
                    flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors
                    ${selectedRecipient === author.id
                      ? "bg-plum text-parchment"
                      : "bg-cream border border-parchment-dark hover:border-plum"
                    }
                  `}
                >
                  <AuthorIcon author={author.id} className="w-3 h-3" /> {author.name}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsWriting(false);
                setContent("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              icon={Send}
              onClick={handleSend}
              disabled={!content.trim()}
            >
              Send letter
            </Button>
          </div>
        </div>
      )}

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
                  ${!letter.isRead ? "border-l-4 border-l-lavender" : ""}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm inline-flex items-center gap-1">
                    From <AuthorIcon author={letter.from} className="w-3 h-3" /> {getAuthorInfo(letter.from).name}
                  </span>
                  {!letter.isRead && (
                    <span className="text-xs bg-lavender text-midnight px-2 py-0.5 rounded">
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
                  <span className="text-sm inline-flex items-center gap-1">
                    To <AuthorIcon author={letter.to} className="w-3 h-3" /> {getAuthorInfo(letter.to).name}
                  </span>
                  <span className="text-xs text-midnight-soft inline-flex items-center gap-1">
                    {letter.isRead ? <><Check className="w-3 h-3" /> Read</> : "Unread"}
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
        <div className="text-center py-6">
          <Mail className="w-10 h-10 text-plum/50 mx-auto mb-2" />
          <p className="text-midnight-soft italic text-sm">
            No letters yet. Write one to your partner!
          </p>
        </div>
      )}

      {readingLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/50 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setReadingLetter(null)}
          />
          <div className="relative book-card p-6 max-w-lg w-full animate-fade-in flex flex-col" style={{ maxHeight: "80vh" }}>
            <button
              onClick={() => setReadingLetter(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-parchment-dark transition-colors text-midnight-soft hover:text-midnight"
              aria-label="Close"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>

            <div className="text-center mb-4 flex-shrink-0">
              <p className="text-sm text-midnight-soft inline-flex items-center justify-center gap-1">
                From <AuthorIcon author={readingLetter.from} className="w-3 h-3" /> {getAuthorInfo(readingLetter.from).name}
              </p>
              <p className="text-sm text-midnight-soft inline-flex items-center justify-center gap-1 ml-3">
                To <AuthorIcon author={readingLetter.to} className="w-3 h-3" /> {getAuthorInfo(readingLetter.to).name}
              </p>
              <p className="text-xs text-lavender mt-1">
                {new Date(readingLetter.createdAt).toLocaleDateString()}
              </p>
            </div>

            <GoldLine />

            <div className="flex-1 overflow-y-auto py-4 min-h-0">
              <p className="font-body text-midnight leading-relaxed whitespace-pre-wrap">
                {readingLetter.content}
              </p>
            </div>

            <GoldLine />

            <Button variant="secondary" fullWidth className="mt-4 flex-shrink-0" onClick={() => setReadingLetter(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
