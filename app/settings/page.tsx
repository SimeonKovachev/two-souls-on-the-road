"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppSettings, Author } from "@/lib/types";
import { loadSettings, saveSettings } from "@/lib/settings";
import { createSecretNote, getAllSecretNotes, deleteSecretNote, SecretNote } from "@/lib/notifications";
import { subscribeToPush, unsubscribeFromPush, isSubscribedToPush, isPushSupported } from "@/lib/push-notifications";
import { Ornament, PageDivider } from "@/components/Ornament";
import { BottomNavSpacer } from "@/components/BottomNav";
import { useDarkMode } from "@/components/DarkModeProvider";
import { useNotifications } from "@/components/NotificationProvider";
import { useAuth } from "@/components/AuthProvider";
import { Moon, Bell, Heart, Cake, Gift, Flower2, ArrowLeft, X, Check, Plus, LogOut, User, Loader2, Calendar, Clock, BellRing, BellOff } from "lucide-react";

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  welcomeShown: false,
  specialDates: [],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [secretNotes, setSecretNotes] = useState<SecretNote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isSupported: notificationsSupported, permission, requestPermission, sendLocalNotification } = useNotifications();
  const { currentUser, logout } = useAuth();

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    message: "",
    recipient: (currentUser === "ива" ? "мео" : "ива") as Author,
    showDate: "",
    showTime: "12:00",
  });

  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    Promise.all([loadSettings(), getAllSecretNotes()]).then(([loaded, notes]) => {
      setSettings(loaded);
      setSecretNotes(notes);
      setIsLoaded(true);
    });
    // Check push subscription status
    isSubscribedToPush().then(setPushSubscribed);
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    setIsSaving(true);
    await saveSettings(newSettings);
    setIsSaving(false);
  }, [settings]);

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    updateSettings({ darkMode: !isDarkMode });
  };

  const handleAddSecretNote = async () => {
    if (!newNote.title || !newNote.message || !newNote.showDate || !currentUser) return;

    const showAt = new Date(`${newNote.showDate}T${newNote.showTime}`);

    const success = await createSecretNote(
      newNote.title,
      newNote.message,
      currentUser,
      newNote.recipient,
      showAt
    );

    if (success) {
      const notes = await getAllSecretNotes();
      setSecretNotes(notes);
      setNewNote({
        title: "",
        message: "",
        recipient: currentUser === "ива" ? "мео" : "ива",
        showDate: "",
        showTime: "12:00",
      });
      setShowNoteForm(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteSecretNote(noteId);
    setSecretNotes(secretNotes.filter(n => n.id !== noteId));
  };

  const handleTestNotification = () => {
    sendLocalNotification("Test Notification", {
      body: `Тест от ${currentUser === "ива" ? "Ива" : "Мео"}! Нотификациите работят!`,
    });
  };

  const handlePushToggle = async () => {
    if (!currentUser) return;
    setPushLoading(true);

    if (pushSubscribed) {
      const success = await unsubscribeFromPush();
      if (success) setPushSubscribed(false);
    } else {
      const success = await subscribeToPush(currentUser);
      if (success) setPushSubscribed(true);
    }

    setPushLoading(false);
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
        <header className="text-center mb-8">
          <Ornament className="mb-4" />
          <h1 className="font-display text-2xl text-plum mb-2">Settings</h1>
          <p className="text-midnight-soft text-sm italic">
            {isSaving ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            ) : (
              "Customize your memory book"
            )}
          </p>
        </header>

        <div className="space-y-6">
          {/* Dark Mode */}
          <section className="book-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-plum" />
                <div>
                  <h3 className="font-display text-plum">Dark Mode</h3>
                  <p className="text-xs text-midnight-soft">Switch to a darker theme</p>
                </div>
              </div>
              <button
                onClick={handleDarkModeToggle}
                className={`w-14 h-8 rounded-full transition-all relative ${isDarkMode ? "bg-plum" : "bg-silver-light"}`}
              >
                <span className={`absolute top-1 w-6 h-6 rounded-full bg-parchment transition-all shadow ${isDarkMode ? "left-7" : "left-1"}`} />
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="book-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-plum" />
                <div>
                  <h3 className="font-display text-plum">Notifications</h3>
                  <p className="text-xs text-midnight-soft">
                    {!notificationsSupported
                      ? "Not supported on this device"
                      : permission === "granted"
                      ? "Journal reminders, letters, time capsules"
                      : permission === "denied"
                      ? "Notifications are blocked"
                      : "Enable for reminders and messages"
                    }
                  </p>
                </div>
              </div>
              {notificationsSupported && permission !== "granted" && permission !== "denied" && (
                <button onClick={requestPermission} className="btn-secondary text-sm py-2 px-4">
                  Enable
                </button>
              )}
              {permission === "granted" && (
                <button onClick={handleTestNotification} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Test
                </button>
              )}
              {permission === "denied" && (
                <span className="text-red-500 text-sm">Blocked</span>
              )}
            </div>
          </section>

          {/* Push Notifications - Background */}
          {isPushSupported() && permission === "granted" && (
            <section className="book-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {pushSubscribed ? (
                    <BellRing className="w-5 h-5 text-green-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-plum" />
                  )}
                  <div>
                    <h3 className="font-display text-plum">Background Notifications</h3>
                    <p className="text-xs text-midnight-soft">
                      {pushSubscribed
                        ? "Receive notifications even when app is closed"
                        : "Enable to get notifications when app is closed"
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePushToggle}
                  disabled={pushLoading}
                  className={`w-14 h-8 rounded-full transition-all relative ${pushSubscribed ? "bg-green-500" : "bg-silver-light"}`}
                >
                  {pushLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin absolute top-1.5 left-1/2 -translate-x-1/2 text-white" />
                  ) : (
                    <span className={`absolute top-1 w-6 h-6 rounded-full bg-parchment transition-all shadow ${pushSubscribed ? "left-7" : "left-1"}`} />
                  )}
                </button>
              </div>
            </section>
          )}

          {/* Current User & Logout */}
          <section className="book-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-plum" />
                <div>
                  <h3 className="font-display text-plum">
                    Logged in as {currentUser === "ива" ? "Ива" : "Мео"}
                  </h3>
                  <p className="text-xs text-midnight-soft">Your journal is password protected</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="btn-ghost text-sm py-2 px-4 text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </section>

          <PageDivider />

          {/* Anniversary Date */}
          <section className="book-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-5 h-5 text-plum" />
              <div>
                <h3 className="font-display text-plum">Anniversary Date</h3>
                <p className="text-xs text-midnight-soft">When did your story begin?</p>
              </div>
            </div>
            <input
              type="date"
              value={settings.anniversaryDate || ""}
              onChange={(e) => updateSettings({ anniversaryDate: e.target.value })}
              className="input-field"
            />
          </section>

          {/* Birthdays */}
          <section className="book-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <Cake className="w-5 h-5 text-plum" />
              <div>
                <h3 className="font-display text-plum">Birthdays</h3>
                <p className="text-xs text-midnight-soft">Get special birthday messages</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-plum-light block mb-1">Ива&apos;s Birthday</label>
                <input
                  type="date"
                  value={settings.ivaBirthday || ""}
                  onChange={(e) => updateSettings({ ivaBirthday: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-plum-light block mb-1">Мео&apos;s Birthday</label>
                <input
                  type="date"
                  value={settings.meoBirthday || ""}
                  onChange={(e) => updateSettings({ meoBirthday: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </section>

          <PageDivider />

          {/* Secret Love Notes */}
          <section className="book-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-plum" />
                <div>
                  <h3 className="font-display text-plum">Secret Love Notes</h3>
                  <p className="text-xs text-midnight-soft">Schedule surprise messages</p>
                </div>
              </div>
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="btn-secondary text-sm py-1 px-3 flex items-center gap-1"
              >
                {showNoteForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add</>}
              </button>
            </div>

            {showNoteForm && (
              <div className="space-y-3 p-3 bg-moonlight/50 rounded-lg mb-4 animate-fade-in">
                <input
                  type="text"
                  placeholder="Title (e.g., 'I Love You')"
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-midnight-soft flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" /> Show on date
                    </label>
                    <input
                      type="date"
                      value={newNote.showDate}
                      onChange={(e) => setNewNote({ ...newNote, showDate: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-midnight-soft flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" /> At time
                    </label>
                    <input
                      type="time"
                      value={newNote.showTime}
                      onChange={(e) => setNewNote({ ...newNote, showTime: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={newNote.recipient}
                    onChange={(e) => setNewNote({ ...newNote, recipient: e.target.value as Author })}
                    className="input-field text-sm flex-1"
                  >
                    <option value="ива">Send to Ива</option>
                    <option value="мео">Send to Мео</option>
                  </select>
                  <button
                    onClick={handleAddSecretNote}
                    disabled={!newNote.title || !newNote.message || !newNote.showDate}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            )}

            {secretNotes.length === 0 ? (
              <p className="text-center text-midnight-soft italic text-sm py-4">
                No secret notes yet. Surprise your partner!
              </p>
            ) : (
              <div className="space-y-2">
                {secretNotes.map((note) => (
                  <div key={note.id} className="flex items-center justify-between p-2 bg-cream rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display text-plum">{note.title}</p>
                      <p className="text-xs text-midnight-soft flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(note.show_at).toLocaleDateString()} at {new Date(note.show_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        <span className="mx-1">•</span>
                        <Flower2 className="w-3 h-3" />
                        From {note.author === "ива" ? "Ива" : "Мео"} to {note.recipient === "ива" ? "Ива" : "Мео"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-600 hover:text-red-700 text-sm px-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <PageDivider />

          <section className="text-center">
            <button
              onClick={() => updateSettings({ welcomeShown: false })}
              className="text-sm text-midnight-soft hover:text-plum transition-colors"
            >
              Show Birthday Welcome Again
            </button>
          </section>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-plum hover:text-plum-light transition-colors text-sm inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>

      <BottomNavSpacer />
    </main>
  );
}
