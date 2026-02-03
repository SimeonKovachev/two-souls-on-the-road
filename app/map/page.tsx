"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Chapter } from "@/lib/types";
import { getAllChapters } from "@/lib/storage";
import { Ornament } from "@/components/Ornament";
import { TravelMap } from "@/components/TravelMap";
import { BottomNavSpacer } from "@/components/BottomNav";

export default function MapPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getAllChapters();
      setChapters(data);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen px-4 py-8 pb-24 md:pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <Ornament className="mb-4" />
          <h1 className="font-display text-2xl text-plum mb-2">Our Travel Map</h1>
          <p className="text-midnight-soft text-sm italic">All the places our souls have wandered</p>
        </header>

        {/* Map */}
        {!isLoaded ? (
          <p className="text-center text-midnight-soft italic animate-pulse">Loading...</p>
        ) : (
          <TravelMap chapters={chapters} />
        )}

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
