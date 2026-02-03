"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppSettings, SpecialDate, generateId, Author } from "@/lib/types";
import { Ornament, PageDivider } from "@/components/Ornament";
import { BottomNavSpacer } from "@/components/BottomNav";

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  welcomeShown: false,
  specialDates: [],
};

function getSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const stored = localStorage.getItem("two-souls-settings");
  if (!stored) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem("two-souls-settings", JSON.stringify(settings));
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Secret love note form
  const [newNote, setNewNote] = useState({
    date: "",
    title: "",
    message: "",
    author: "мео" as Author,
    isSecret: true,
  });
  const [showNoteForm, setShowNoteForm] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    setIsLoaded(true);
  }, []);

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const addSpecialDate = () => {
    if (!newNote.date || !newNote.title || !newNote.message) return;

    const specialDate: SpecialDate = {
      id: generateId(),
      date: newNote.date,
      title: newNote.title,
      message: newNote.message,
      author: newNote.author,
      isSecret: newNote.isSecret,
    };

    updateSettings({
      specialDates: [...settings.specialDates, specialDate],
    });

    setNewNote({
      date: "",
      title: "",
      message: "",
      author: "мео",
      isSecret: true,
    });
    setShowNoteForm(false);
  };

  const removeSpecialDate = (id: string) => {
    updateSettings({
      specialDates: settings.specialDates.filter((d) => d.id !== id),
    });
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-midnight-soft italic animate-pulse">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 pb-24 md:pb-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <Ornament className="mb-4" />
          <h1 className="font-display text-2xl text-plum mb-2">Settings</h1>
          <p className="text-midnight-soft text-sm italic">Customize your memory book</p>
        </header>

        <div className="space-y-8">
          {/* Dark Mode */}
          <section className="book-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-plum">🌙 Dark Mode</h3>
                <p className="text-xs text-midnight-soft">Switch to a darker theme</p>
              </div>
              <button
                onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                className={`
                  w-14 h-8 rounded-full transition-all relative
                  ${settings.darkMode ? "bg-plum" : "bg-silver-light"}
                `}
              >
                <span
                  className={`
                    absolute top-1 w-6 h-6 rounded-full bg-parchment transition-all shadow
                    ${settings.darkMode ? "left-7" : "left-1"}
                  `}
                />
              </button>
            </div>
          </section>

          <PageDivider />

          {/* Anniversary Date */}
          <section className="book-card p-4">
            <h3 className="font-display text-plum mb-2">💕 Anniversary Date</h3>
            <p className="text-xs text-midnight-soft mb-3">
              When did your story begin? This will show a counter on the home page.
            </p>
            <input
              type="date"
              value={settings.anniversaryDate || ""}
              onChange={(e) => updateSettings({ anniversaryDate: e.target.value })}
              className="input-field"
            />
          </section>

          {/* Birthdays */}
          <section className="book-card p-4">
            <h3 className="font-display text-plum mb-2">🎂 Birthdays</h3>
            <p className="text-xs text-midnight-soft mb-3">
              Get special birthday messages on these dates.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-plum-light block mb-1">Ива&apos;s Birthday</label>
                <input
                  type="text"
                  placeholder="MM-DD (e.g., 02-14)"
                  value={settings.ivaBirthday || ""}
                  onChange={(e) => updateSettings({ ivaBirthday: e.target.value })}
                  className="input-field text-sm"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="text-xs text-plum-light block mb-1">Мео&apos;s Birthday</label>
                <input
                  type="text"
                  placeholder="MM-DD (e.g., 07-23)"
                  value={settings.meoBirthday || ""}
                  onChange={(e) => updateSettings({ meoBirthday: e.target.value })}
                  className="input-field text-sm"
                  maxLength={5}
                />
              </div>
            </div>
          </section>

          <PageDivider />

          {/* Secret Love Notes */}
          <section className="book-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-plum">💝 Secret Love Notes</h3>
                <p className="text-xs text-midnight-soft">
                  Hidden messages that appear on special dates
                </p>
              </div>
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="btn-secondary text-sm py-1 px-3"
              >
                {showNoteForm ? "Cancel" : "+ Add"}
              </button>
            </div>

            {/* Add note form */}
            {showNoteForm && (
              <div className="space-y-3 p-3 bg-moonlight/50 rounded-lg mb-4 animate-fade-in">
                <input
                  type="text"
                  placeholder="Date (MM-DD or YYYY-MM-DD)"
                  value={newNote.date}
                  onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                  className="input-field text-sm"
                />
                <input
                  type="text"
                  placeholder="Title (e.g., 'Our First Kiss')"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="input-field text-sm"
                />
                <textarea
                  placeholder="Your secret message..."
                  value={newNote.message}
                  onChange={(e) => setNewNote({ ...newNote, message: e.target.value })}
                  className="textarea-field text-sm"
                  rows={3}
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-midnight-soft">
                    <input
                      type="checkbox"
                      checked={newNote.isSecret}
                      onChange={(e) => setNewNote({ ...newNote, isSecret: e.target.checked })}
                      className="rounded"
                    />
                    Secret (only shown on this date)
                  </label>
                </div>
                <div className="flex gap-2">
                  <select
                    value={newNote.author}
                    onChange={(e) => setNewNote({ ...newNote, author: e.target.value as Author })}
                    className="input-field text-sm flex-1"
                  >
                    <option value="ива">🌸 From Ива</option>
                    <option value="мео">🌙 From Мео</option>
                  </select>
                  <button
                    onClick={addSpecialDate}
                    disabled={!newNote.date || !newNote.title || !newNote.message}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}

            {/* List of notes */}
            {settings.specialDates.length === 0 ? (
              <p className="text-center text-midnight-soft italic text-sm py-4">
                No secret notes yet. Add one for a special surprise!
              </p>
            ) : (
              <div className="space-y-2">
                {settings.specialDates.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-2 bg-cream rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display text-plum">{note.title}</p>
                      <p className="text-xs text-midnight-soft">
                        {note.date} • {note.author === "ива" ? "🌸 Ива" : "🌙 Мео"}
                        {note.isSecret && " • 🔒 Secret"}
                      </p>
                    </div>
                    <button
                      onClick={() => removeSpecialDate(note.id)}
                      className="text-red-600 hover:text-red-700 text-sm px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <PageDivider />

          {/* Reset Welcome */}
          <section className="text-center">
            <button
              onClick={() => updateSettings({ welcomeShown: false })}
              className="text-sm text-midnight-soft hover:text-plum transition-colors"
            >
              Show Birthday Welcome Again
            </button>
          </section>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-plum hover:text-plum-light transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <BottomNavSpacer />
    </main>
  );
}
