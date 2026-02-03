"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapLocation } from "@/lib/types";
import { createChapter } from "@/lib/storage";
import { Ornament, PageDivider } from "@/components/Ornament";
import { LocationPicker } from "@/components/TravelMap";
import { BottomNavSpacer } from "@/components/BottomNav";

export default function NewChapterPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [coverLine, setCoverLine] = useState("");
  const [location, setLocation] = useState<MapLocation | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsCreating(true);

    try {
      const chapter = await createChapter(
        destination.trim(),
        dateFrom || undefined,
        dateTo || undefined,
        coverLine.trim() || undefined,
        location
      );

      // Navigate to the new chapter
      router.push(`/chapter/${chapter.id}`);
    } catch (error) {
      console.error("Error creating chapter:", error);
      setIsCreating(false);
    }
  };

  // Calculate number of days if both dates are set
  const getDayCount = () => {
    if (!dateFrom || !dateTo) return null;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : null;
  };

  const dayCount = getDayCount();

  return (
    <main className="min-h-screen px-4 py-8 pb-24 md:py-12 md:pb-12">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-plum hover:text-plum-light transition-colors mb-8"
        >
          ← Back to the Grimoire
        </Link>

        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <Ornament className="mb-4" />
          <h1 className="font-display text-2xl md:text-3xl text-plum mb-2">
            Begin a New Chapter
          </h1>
          <p className="font-body text-midnight-soft italic text-sm">
            Where will this journey take you?
          </p>
        </header>

        <PageDivider />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-delay-1">
          {/* Destination */}
          <div>
            <label htmlFor="destination" className="block font-display text-sm text-plum mb-2">
              Destination *
            </label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where are you going?"
              className="input-field"
              required
              autoFocus
            />
          </div>

          {/* Location picker */}
          <div>
            <label className="block font-display text-sm text-plum mb-2">
              📍 Map Location
              <span className="font-body text-midnight-soft italic ml-2">(optional)</span>
            </label>
            <LocationPicker value={location} onChange={setLocation} />
            <p className="text-xs text-midnight-soft mt-1 italic">
              Add to see this place on your travel map
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateFrom" className="block font-display text-sm text-plum mb-2">
                From
              </label>
              <input
                type="date"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block font-display text-sm text-plum mb-2">
                To
              </label>
              <input
                type="date"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom}
                className="input-field"
              />
            </div>
          </div>

          {/* Day count info */}
          {dayCount && (
            <p className="text-center text-sm text-lavender animate-fade-in">
              ✨ {dayCount} day{dayCount !== 1 ? "s" : ""} of adventure — you&apos;ll get a daily journal for each!
            </p>
          )}

          {/* Cover line */}
          <div>
            <label htmlFor="coverLine" className="block font-display text-sm text-plum mb-2">
              Opening line
              <span className="font-body text-midnight-soft italic ml-2">(optional)</span>
            </label>
            <textarea
              id="coverLine"
              value={coverLine}
              onChange={(e) => setCoverLine(e.target.value)}
              placeholder="A poetic thought to set the mood..."
              className="textarea-field"
              rows={2}
            />
            <p className="text-xs text-midnight-soft mt-1 italic">
              Something to capture the spirit of this journey
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!destination.trim() || isCreating}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating your chapter..." : "Open this chapter"}
            </button>
          </div>
        </form>

        {/* Info about features */}
        <div className="mt-8 p-4 bg-cream rounded-lg border border-parchment-dark animate-fade-in-delay-2">
          <h3 className="font-display text-sm text-plum mb-2 text-center">What awaits in each chapter:</h3>
          <ul className="text-xs text-midnight-soft space-y-1">
            <li>📖 Daily journal with mood tracking & prompts</li>
            <li>💌 Private letters to each other</li>
            <li>⏳ Time capsules to unlock in the future</li>
            <li>🌙 Mood visualization & constellation</li>
            <li>🗺️ Map location tracking</li>
            <li>✨ Moments, photos, and reflections</li>
          </ul>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center animate-fade-in-delay-3">
          <Ornament />
        </footer>
      </div>

      <BottomNavSpacer />
    </main>
  );
}
