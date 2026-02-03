"use client";

import { useState, useEffect } from "react";
import { SpecialDate, AppSettings } from "@/lib/types";
import { Ornament } from "./Ornament";

interface SecretLoveNoteProps {
  onClose: () => void;
  note: SpecialDate;
}

export function SecretLoveNote({ onClose, note }: SecretLoveNoteProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/90 backdrop-blur-md p-4">
      {/* Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <span
            key={i}
            className="absolute text-lavender animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${Math.random() * 12 + 8}px`,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      <div
        className={`
          relative book-card p-8 max-w-md w-full text-center
          transition-all duration-500
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      >
        <Ornament className="mb-4" />

        <p className="text-4xl mb-4">💝</p>

        <h2 className="font-display text-xl text-plum mb-2">{note.title}</h2>

        <div className="my-6 mx-4">
          <p className="font-body text-midnight italic leading-relaxed">
            &ldquo;{note.message}&rdquo;
          </p>
        </div>

        <p className="text-sm text-lavender mb-6">
          — {note.author === "ива" ? "🌸 Ива" : "🌙 Мео"}
        </p>

        <button onClick={onClose} className="btn-primary">
          Close with Love ✨
        </button>
      </div>
    </div>
  );
}

// Check if there's a note for today
export function getTodaysNote(settings: AppSettings): SpecialDate | null {
  if (!settings.specialDates || settings.specialDates.length === 0) {
    return null;
  }

  const today = new Date();
  const todayMMDD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayFull = today.toISOString().split("T")[0];

  return (
    settings.specialDates.find(
      (note) =>
        note.date === todayMMDD || // MM-DD format (annual)
        note.date === todayFull // YYYY-MM-DD format (specific year)
    ) || null
  );
}

// Check if it's birthday
export function isTodayBirthday(settings: AppSettings): { name: string; birthday: string } | null {
  const today = new Date();
  const todayMMDD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (settings.ivaBirthday === todayMMDD) {
    return { name: "Ива", birthday: settings.ivaBirthday };
  }
  if (settings.meoBirthday === todayMMDD) {
    return { name: "Мео", birthday: settings.meoBirthday };
  }
  return null;
}
