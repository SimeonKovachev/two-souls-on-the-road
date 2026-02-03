"use client";

import { Mood, MOOD_OPTIONS } from "@/lib/types";

interface MoodPickerProps {
  selected: Mood[];
  onToggle: (mood: Mood) => void;
  disabled?: boolean;
}

export function MoodPicker({ selected, onToggle, disabled = false }: MoodPickerProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-midnight-soft font-body italic">
        How did this journey feel?
      </p>
      <div className="flex flex-wrap gap-2">
        {MOOD_OPTIONS.map((mood) => {
          const isActive = selected.includes(mood.id);
          return (
            <button
              key={mood.id}
              onClick={() => onToggle(mood.id)}
              disabled={disabled}
              title={mood.tooltip}
              className={`
                mood-pill
                ${isActive ? "active" : ""}
                ${disabled ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              <span>{mood.icon}</span>
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
