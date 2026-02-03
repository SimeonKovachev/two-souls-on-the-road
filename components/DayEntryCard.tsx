"use client";

import { useState } from "react";
import { DayEntry, Mood, Author, formatDateShort, MOOD_OPTIONS, getRandomDailyPrompts } from "@/lib/types";
import { AuthorSelector, AuthorBadge } from "./AuthorSelector";
import { GoldLine } from "./Ornament";

interface DayEntryCardProps {
  entry: DayEntry;
  onUpdateMood: (type: "morning" | "evening", mood: Mood) => void;
  onAddThought: (text: string, author: Author) => void;
  onAnswerPrompt: (question: string, answer: string, author: Author) => void;
  onUpdateGratitude: (text: string, author: Author) => void;
  onUpdateWordOfDay: (word: string) => void;
  onAddPhoto: (file: File, author: Author) => void;
  disabled?: boolean;
}

export function DayEntryCard({
  entry,
  onUpdateMood,
  onAddThought,
  onAnswerPrompt,
  onUpdateGratitude,
  onUpdateWordOfDay,
  onAddPhoto,
  disabled = false,
}: DayEntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState<Author>("ива");
  const [thoughtText, setThoughtText] = useState("");
  const [gratitudeText, setGratitudeText] = useState(entry.gratitude || "");
  const [wordText, setWordText] = useState(entry.wordOfTheDay || "");
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({});

  // Get some prompts for this day (use 3 random ones if none answered yet)
  const availablePrompts = entry.prompts.length > 0
    ? entry.prompts.map(p => p.question)
    : getRandomDailyPrompts(3);

  const handleAddThought = () => {
    if (!thoughtText.trim()) return;
    onAddThought(thoughtText.trim(), currentAuthor);
    setThoughtText("");
  };

  const handleSaveGratitude = () => {
    if (!gratitudeText.trim()) return;
    onUpdateGratitude(gratitudeText.trim(), currentAuthor);
  };

  const handleSaveWord = () => {
    if (!wordText.trim()) return;
    onUpdateWordOfDay(wordText.trim());
  };

  const handleAnswerPrompt = (question: string) => {
    const answer = promptAnswers[question];
    if (!answer?.trim()) return;
    onAnswerPrompt(question, answer.trim(), currentAuthor);
    setPromptAnswers((prev) => ({ ...prev, [question]: "" }));
  };

  return (
    <div className="book-card book-spine overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 pl-6 flex items-center justify-between text-left hover:bg-parchment-dark/30 transition-colors"
      >
        <div>
          <h3 className="font-display text-lg text-plum">
            {formatDateShort(entry.date)}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {entry.morningMood && (
              <span className="text-sm" title="Morning mood">
                ☀️ {MOOD_OPTIONS.find(m => m.id === entry.morningMood)?.icon}
              </span>
            )}
            {entry.eveningMood && (
              <span className="text-sm" title="Evening mood">
                🌙 {MOOD_OPTIONS.find(m => m.id === entry.eveningMood)?.icon}
              </span>
            )}
            {entry.thoughts.length > 0 && (
              <span className="text-xs text-midnight-soft">
                {entry.thoughts.length} thought{entry.thoughts.length !== 1 ? "s" : ""}
              </span>
            )}
            {entry.photos.length > 0 && (
              <span className="text-xs text-midnight-soft">
                📷 {entry.photos.length}
              </span>
            )}
          </div>
        </div>
        <span className="text-gold text-xl">
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pl-6 space-y-6 animate-fade-in">
          <GoldLine className="!my-2" />

          {/* Author selector */}
          {!disabled && (
            <AuthorSelector
              selected={currentAuthor}
              onChange={setCurrentAuthor}
              label="Who's writing?"
              disabled={disabled}
            />
          )}

          {/* Morning & Evening Mood */}
          <div className="grid grid-cols-2 gap-4">
            <MoodSelector
              label="Morning"
              icon="☀️"
              selected={entry.morningMood}
              onSelect={(mood) => onUpdateMood("morning", mood)}
              disabled={disabled}
            />
            <MoodSelector
              label="Evening"
              icon="🌙"
              selected={entry.eveningMood}
              onSelect={(mood) => onUpdateMood("evening", mood)}
              disabled={disabled}
            />
          </div>

          {/* Photos */}
          <div>
            <h4 className="font-display text-sm text-plum mb-2">Photos</h4>
            {entry.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {entry.photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Memory"}
                      className="w-full h-32 object-cover rounded"
                    />
                    <AuthorBadge author={photo.author} size="sm" />
                  </div>
                ))}
              </div>
            )}
            {!disabled && (
              <label className="flex items-center justify-center h-20 border-2 border-dashed border-parchment-dark rounded cursor-pointer hover:border-gold transition-colors">
                <span className="text-sm text-midnight-soft">📷 Add a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onAddPhoto(file, currentAuthor);
                  }}
                />
              </label>
            )}
          </div>

          {/* Thoughts */}
          <div>
            <h4 className="font-display text-sm text-plum mb-2">Quick thoughts</h4>
            {entry.thoughts.length > 0 && (
              <div className="space-y-2 mb-3">
                {entry.thoughts.map((thought) => (
                  <div key={thought.id} className="bg-cream p-3 rounded">
                    <p className="text-sm text-midnight italic">&ldquo;{thought.text}&rdquo;</p>
                    <div className="flex justify-between items-center mt-1">
                      <AuthorBadge author={thought.author} size="sm" />
                      <span className="text-xs text-midnight-soft">
                        {new Date(thought.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!disabled && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={thoughtText}
                  onChange={(e) => setThoughtText(e.target.value)}
                  placeholder="A fleeting thought..."
                  className="input-field flex-1 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleAddThought()}
                />
                <button
                  onClick={handleAddThought}
                  disabled={!thoughtText.trim()}
                  className="btn-primary text-sm px-3 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Journal Prompts */}
          <div>
            <h4 className="font-display text-sm text-plum mb-2">Today&apos;s prompts</h4>
            <div className="space-y-3">
              {availablePrompts.map((question, idx) => {
                const answered = entry.prompts.find((p) => p.question === question);
                return (
                  <div key={idx} className="bg-cream p-3 rounded">
                    <p className="text-sm text-midnight-soft italic mb-2">{question}</p>
                    {answered ? (
                      <div>
                        <p className="text-sm text-midnight">&ldquo;{answered.answer}&rdquo;</p>
                        <AuthorBadge author={answered.author} size="sm" />
                      </div>
                    ) : !disabled ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promptAnswers[question] || ""}
                          onChange={(e) => setPromptAnswers((prev) => ({ ...prev, [question]: e.target.value }))}
                          placeholder="Your answer..."
                          className="input-field flex-1 text-sm"
                        />
                        <button
                          onClick={() => handleAnswerPrompt(question)}
                          disabled={!promptAnswers[question]?.trim()}
                          className="btn-secondary text-xs px-2 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-midnight-soft italic">Not answered</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gratitude */}
          <div>
            <h4 className="font-display text-sm text-plum mb-2">🙏 Gratitude</h4>
            {entry.gratitude ? (
              <div className="bg-cream p-3 rounded">
                <p className="text-sm text-midnight italic">&ldquo;{entry.gratitude}&rdquo;</p>
                {entry.gratitudeAuthor && <AuthorBadge author={entry.gratitudeAuthor} size="sm" />}
              </div>
            ) : !disabled ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value)}
                  placeholder="What are you grateful for today?"
                  className="input-field flex-1 text-sm"
                />
                <button
                  onClick={handleSaveGratitude}
                  disabled={!gratitudeText.trim()}
                  className="btn-secondary text-xs px-2 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-xs text-midnight-soft italic">Not filled</p>
            )}
          </div>

          {/* Word of the day */}
          <div>
            <h4 className="font-display text-sm text-plum mb-2">✨ One word for today</h4>
            {entry.wordOfTheDay ? (
              <p className="font-display text-2xl text-gold text-center py-2">
                {entry.wordOfTheDay}
              </p>
            ) : !disabled ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  placeholder="One word..."
                  className="input-field flex-1 text-sm text-center"
                  maxLength={30}
                />
                <button
                  onClick={handleSaveWord}
                  disabled={!wordText.trim()}
                  className="btn-secondary text-xs px-2 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-xs text-midnight-soft italic text-center">Not chosen</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Mini mood selector for morning/evening
interface MoodSelectorProps {
  label: string;
  icon: string;
  selected?: Mood;
  onSelect: (mood: Mood) => void;
  disabled?: boolean;
}

function MoodSelector({ label, icon, selected, onSelect, disabled }: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full p-3 rounded border text-center transition-colors
          ${selected ? "bg-cream border-gold" : "bg-parchment-dark/30 border-parchment-dark"}
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-gold cursor-pointer"}
        `}
      >
        <span className="text-sm text-midnight-soft">{icon} {label}</span>
        {selected && (
          <p className="text-2xl mt-1">
            {MOOD_OPTIONS.find(m => m.id === selected)?.icon}
          </p>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-cream border border-parchment-dark rounded shadow-lg z-10 p-2 grid grid-cols-5 gap-1">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => {
                onSelect(mood.id);
                setIsOpen(false);
              }}
              title={mood.tooltip}
              className={`
                p-2 rounded text-xl hover:bg-parchment-dark transition-colors
                ${selected === mood.id ? "bg-gold/20" : ""}
              `}
            >
              {mood.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
