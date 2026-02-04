"use client";

import { useState, useEffect, useCallback } from "react";
import { DayEntry, Mood, Author, formatDateShort, MOOD_OPTIONS, getRandomDailyPrompts } from "@/lib/types";
import { AuthorSelector, AuthorBadge } from "./AuthorSelector";
import { GoldLine } from "./Ornament";
import { useAutoSave, AutoSaveIndicator } from "@/lib/useAutoSave";
import { Button, MOOD_ICONS, Sun, Moon, Camera, HandHeart, Sparkles, Plus, ChevronDown, ChevronUp, MessageCircle } from "./ui";

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

  const [availablePrompts] = useState(() =>
    entry.prompts.length > 0
      ? entry.prompts.map(p => p.question)
      : getRandomDailyPrompts(3)
  );

  const { status: gratitudeStatus, triggerSave: triggerGratitudeSave } = useAutoSave({
    delay: 800,
    onSave: useCallback(() => {
      if (gratitudeText.trim() && gratitudeText !== entry.gratitude) {
        onUpdateGratitude(gratitudeText.trim(), currentAuthor);
      }
    }, [gratitudeText, entry.gratitude, currentAuthor, onUpdateGratitude]),
  });

  const { status: wordStatus, triggerSave: triggerWordSave } = useAutoSave({
    delay: 800,
    onSave: useCallback(() => {
      if (wordText.trim() && wordText !== entry.wordOfTheDay) {
        onUpdateWordOfDay(wordText.trim());
      }
    }, [wordText, entry.wordOfTheDay, onUpdateWordOfDay]),
  });

  useEffect(() => {
    if (gratitudeText && gratitudeText !== entry.gratitude) {
      triggerGratitudeSave();
    }
  }, [gratitudeText, entry.gratitude, triggerGratitudeSave]);

  useEffect(() => {
    if (wordText && wordText !== entry.wordOfTheDay) {
      triggerWordSave();
    }
  }, [wordText, entry.wordOfTheDay, triggerWordSave]);

  useEffect(() => {
    setGratitudeText(entry.gratitude || "");
    setWordText(entry.wordOfTheDay || "");
  }, [entry.gratitude, entry.wordOfTheDay]);

  const handleAddThought = () => {
    if (!thoughtText.trim()) return;
    onAddThought(thoughtText.trim(), currentAuthor);
    setThoughtText("");
  };

  const handleAnswerPrompt = (question: string) => {
    const answer = promptAnswers[question];
    if (!answer?.trim()) return;
    onAnswerPrompt(question, answer.trim(), currentAuthor);
    setPromptAnswers((prev) => ({ ...prev, [question]: "" }));
  };

  const handleMoodSelect = (type: "morning" | "evening", mood: Mood) => {
    onUpdateMood(type, mood);
  };

  const MorningMoodIcon = entry.morningMood ? MOOD_ICONS[entry.morningMood] : null;
  const EveningMoodIcon = entry.eveningMood ? MOOD_ICONS[entry.eveningMood] : null;

  return (
    <div className="book-card book-spine overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 pl-6 flex items-center justify-between text-left hover:bg-moonlight/50 transition-colors active:bg-moonlight"
      >
        <div>
          <h3 className="font-display text-lg text-plum">
            {formatDateShort(entry.date)}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            {entry.morningMood && MorningMoodIcon && (
              <span className="inline-flex items-center gap-1 text-sm text-midnight-soft" title="Morning mood">
                <Sun className="w-3 h-3" />
                <MorningMoodIcon className="w-4 h-4" style={{ color: MOOD_OPTIONS.find(m => m.id === entry.morningMood)?.color }} />
              </span>
            )}
            {entry.eveningMood && EveningMoodIcon && (
              <span className="inline-flex items-center gap-1 text-sm text-midnight-soft" title="Evening mood">
                <Moon className="w-3 h-3" />
                <EveningMoodIcon className="w-4 h-4" style={{ color: MOOD_OPTIONS.find(m => m.id === entry.eveningMood)?.color }} />
              </span>
            )}
            {entry.thoughts.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-midnight-soft">
                <MessageCircle className="w-3 h-3" />
                {entry.thoughts.length}
              </span>
            )}
            {entry.photos.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-midnight-soft">
                <Camera className="w-3 h-3" />
                {entry.photos.length}
              </span>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-lavender" /> : <ChevronDown className="w-5 h-5 text-lavender" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pl-6 space-y-6 animate-fade-in">
          <GoldLine className="!my-2" />

          {!disabled && (
            <AuthorSelector
              selected={currentAuthor}
              onChange={setCurrentAuthor}
              label="Who's writing?"
              disabled={disabled}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <MoodSelector
              label="Morning"
              icon={Sun}
              selected={entry.morningMood}
              onSelect={(mood) => handleMoodSelect("morning", mood)}
              disabled={disabled}
            />
            <MoodSelector
              label="Evening"
              icon={Moon}
              selected={entry.eveningMood}
              onSelect={(mood) => handleMoodSelect("evening", mood)}
              disabled={disabled}
            />
          </div>

          <div>
            <h4 className="font-display text-sm text-plum mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Photos
            </h4>
            {entry.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {entry.photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Memory"}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-1 left-1">
                      <AuthorBadge author={photo.author} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!disabled && (
              <label className="flex items-center justify-center gap-2 h-20 border-2 border-dashed border-silver-light rounded-lg cursor-pointer hover:border-lavender hover:bg-moonlight/30 transition-all active:bg-moonlight/50">
                <Camera className="w-4 h-4 text-midnight-soft" />
                <span className="text-sm text-midnight-soft">Add a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onAddPhoto(file, currentAuthor);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          <div>
            <h4 className="font-display text-sm text-plum mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Quick thoughts
            </h4>
            {entry.thoughts.length > 0 && (
              <div className="space-y-2 mb-3">
                {entry.thoughts.map((thought) => (
                  <div key={thought.id} className="bg-moonlight/50 p-3 rounded-lg">
                    <p className="text-sm text-midnight italic">&ldquo;{thought.text}&rdquo;</p>
                    <div className="flex justify-between items-center mt-2">
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
                  className="input-field flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddThought()}
                />
                <Button
                  onClick={handleAddThought}
                  disabled={!thoughtText.trim()}
                  icon={Plus}
                  size="sm"
                />
              </div>
            )}
          </div>

          <div>
            <h4 className="font-display text-sm text-plum mb-2">Today&apos;s prompts</h4>
            <div className="space-y-3">
              {availablePrompts.map((question, idx) => {
                const answered = entry.prompts.find((p) => p.question === question);
                return (
                  <div key={idx} className="bg-moonlight/50 p-3 rounded-lg">
                    <p className="text-sm text-midnight-soft italic mb-2">{question}</p>
                    {answered ? (
                      <div>
                        <p className="text-sm text-midnight">&ldquo;{answered.answer}&rdquo;</p>
                        <div className="mt-1">
                          <AuthorBadge author={answered.author} size="sm" />
                        </div>
                      </div>
                    ) : !disabled ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promptAnswers[question] || ""}
                          onChange={(e) => setPromptAnswers((prev) => ({ ...prev, [question]: e.target.value }))}
                          placeholder="Your answer..."
                          className="input-field flex-1"
                          onKeyDown={(e) => e.key === "Enter" && handleAnswerPrompt(question)}
                        />
                        <Button
                          onClick={() => handleAnswerPrompt(question)}
                          disabled={!promptAnswers[question]?.trim()}
                          variant="secondary"
                          size="sm"
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-midnight-soft italic">Not answered</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display text-sm text-plum flex items-center gap-2">
                <HandHeart className="w-4 h-4" /> Gratitude
              </h4>
              <AutoSaveIndicator status={gratitudeStatus} />
            </div>
            {entry.gratitude && !gratitudeText ? (
              <div className="bg-moonlight/50 p-3 rounded-lg">
                <p className="text-sm text-midnight italic">&ldquo;{entry.gratitude}&rdquo;</p>
                {entry.gratitudeAuthor && <AuthorBadge author={entry.gratitudeAuthor} size="sm" />}
              </div>
            ) : !disabled ? (
              <input
                type="text"
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="What are you grateful for today?"
                className="input-field"
              />
            ) : entry.gratitude ? (
              <div className="bg-moonlight/50 p-3 rounded-lg">
                <p className="text-sm text-midnight italic">&ldquo;{entry.gratitude}&rdquo;</p>
                {entry.gratitudeAuthor && <AuthorBadge author={entry.gratitudeAuthor} size="sm" />}
              </div>
            ) : (
              <p className="text-xs text-midnight-soft italic">Not filled</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display text-sm text-plum flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> One word for today
              </h4>
              <AutoSaveIndicator status={wordStatus} />
            </div>
            {entry.wordOfTheDay && !wordText ? (
              <p className="font-display text-2xl text-lavender text-center py-2">
                {entry.wordOfTheDay}
              </p>
            ) : !disabled ? (
              <input
                type="text"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                placeholder="One word..."
                className="input-field text-center"
                maxLength={30}
              />
            ) : entry.wordOfTheDay ? (
              <p className="font-display text-2xl text-lavender text-center py-2">
                {entry.wordOfTheDay}
              </p>
            ) : (
              <p className="text-xs text-midnight-soft italic text-center">Not chosen</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface MoodSelectorProps {
  label: string;
  icon: typeof Sun;
  selected?: Mood;
  onSelect: (mood: Mood) => void;
  disabled?: boolean;
}

function MoodSelector({ label, icon: Icon, selected, onSelect, disabled }: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const SelectedMoodIcon = selected ? MOOD_ICONS[selected] : null;
  const selectedMood = selected ? MOOD_OPTIONS.find(m => m.id === selected) : null;

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full p-3 rounded-lg border text-center transition-all
          ${selected ? "bg-moonlight border-lavender" : "bg-cream border-silver-light"}
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-lavender active:bg-moonlight cursor-pointer"}
        `}
      >
        <span className="text-sm text-midnight-soft flex items-center justify-center gap-1">
          <Icon className="w-4 h-4" /> {label}
        </span>
        {SelectedMoodIcon && selectedMood && (
          <div className="mt-2 flex items-center justify-center">
            <SelectedMoodIcon className="w-6 h-6" style={{ color: selectedMood.color }} />
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-cream border border-silver-light rounded-lg shadow-lg z-20 p-2 grid grid-cols-5 gap-1">
            {MOOD_OPTIONS.map((mood) => {
              const MoodIcon = MOOD_ICONS[mood.id];
              return (
                <button
                  key={mood.id}
                  onClick={() => {
                    onSelect(mood.id);
                    setIsOpen(false);
                  }}
                  title={mood.tooltip}
                  className={`
                    p-2 rounded-lg hover:bg-moonlight transition-colors active:scale-95 flex items-center justify-center
                    ${selected === mood.id ? "bg-lavender/30" : ""}
                  `}
                >
                  <MoodIcon className="w-5 h-5" style={{ color: mood.color }} />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
