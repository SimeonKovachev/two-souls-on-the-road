"use client";

import { Mood, MOOD_OPTIONS } from "@/lib/types";
import { MOOD_ICONS } from "@/components/ui";

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
          const Icon = MOOD_ICONS[mood.id];
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
              {Icon && <Icon className="w-4 h-4" />}
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
