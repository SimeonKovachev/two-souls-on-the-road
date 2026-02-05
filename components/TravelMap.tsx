"use client";

import { useState } from "react";
import { Chapter, MapLocation } from "@/lib/types";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface TravelMapProps {
  chapters: Chapter[];
}

// Get static map image URL from OpenStreetMap (no API key needed)
function getStaticMapUrl(locations: { lat: number; lng: number; name: string }[]): string {
  if (locations.length === 0) return "";

  // Calculate center and zoom
  const lats = locations.map(l => l.lat);
  const lngs = locations.map(l => l.lng);
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

  // Use OpenStreetMap static map service
  const zoom = locations.length === 1 ? 10 : 5;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${centerLat},${centerLng}&zoom=${zoom}&size=600x400&maptype=mapnik`;
}

export function TravelMap({ chapters }: TravelMapProps) {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Get chapters with locations
  const chaptersWithLocations = chapters.filter(ch => ch.location);

  if (chaptersWithLocations.length === 0) {
    return (
      <div className="text-center py-8">
        <img
          src="/images/empty-map.png"
          alt="No locations yet"
          className="w-40 h-40 mx-auto mb-4 opacity-70"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
                <p className="text-midnight-soft italic">
          No locations added yet.
        </p>
        <p className="text-xs text-midnight-soft mt-2">
          Add coordinates to your chapters to see them on the map!
        </p>
      </div>
    );
  }

  const locations = chaptersWithLocations.map(ch => ({
    ...ch.location!,
    chapter: ch,
  }));

  const centerLat = locations.reduce((sum, l) => sum + l.lat, 0) / locations.length;
  const centerLng = locations.reduce((sum, l) => sum + l.lng, 0) / locations.length;
  const zoom = locations.length === 1 ? 12 : 6;

  const markers = locations.map(l => `${l.lat},${l.lng}`).join("~");

  return (
    <div className="space-y-4">
      <div className="book-card p-4">
        <h3 className="font-display text-plum mb-4 text-center">Places We&apos;ve Been</h3>

        <div className="mb-4 rounded-lg overflow-hidden border border-silver-light">
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 1.5},${centerLat - 0.8},${centerLng + 1.5},${centerLat + 0.8}&layer=mapnik&marker=${locations[0].lat},${locations[0].lng}`}
            className="w-full h-64 border-0"
            loading="lazy"
            title="Travel Map"
          />
          <a
            href={`https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}#map=${zoom}/${centerLat}/${centerLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center py-2 text-xs text-lavender hover:text-plum bg-cream transition-colors"
          >
            View larger map
          </a>
        </div>

        {/* Location list */}
        <div className="space-y-2">
          {locations.map((loc) => (
            <div
              key={loc.chapter.id}
              className="flex items-center gap-3 p-3 bg-cream rounded-lg"
            >
              <MapPin className="w-5 h-5 text-plum flex-shrink-0" />
              <Link
                href={`/chapter/${loc.chapter.id}`}
                className="flex-1 min-w-0 hover:opacity-70 transition-opacity"
              >
                <p className="font-display text-plum text-sm truncate">
                  {loc.chapter.destination}
                </p>
                <p className="text-xs text-midnight-soft">
                  {loc.name}
                </p>
              </Link>
              <a
                href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-lavender hover:text-plum px-2 py-1 rounded bg-parchment-dark flex-shrink-0"
              >
                View
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Info about adding locations */}
      <p className="text-xs text-midnight-soft text-center italic">
        Add locations when creating a new chapter to see them here!
      </p>
    </div>
  );
}

// Location search component (for adding to chapters)
interface LocationPickerProps {
  value?: MapLocation;
  onChange: (location: MapLocation | undefined) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value?.name || "");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<MapLocation[]>([]);

  // Search for location using Nominatim (free, no API key)
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await response.json();

      setSuggestions(
        data.map((item: { lat: string; lon: string; display_name: string }) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.display_name.split(",").slice(0, 2).join(", "),
        }))
      );
    } catch (error) {
      console.error("Location search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = (loc: MapLocation) => {
    onChange(loc);
    setSearchQuery(loc.name);
    setSuggestions([]);
  };

  const clearLocation = () => {
    onChange(undefined);
    setSearchQuery("");
    setSuggestions([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a place..."
          className="input-field flex-1"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchLocation())}
        />
        <button
          type="button"
          onClick={searchLocation}
          disabled={isSearching}
          className="btn-secondary px-3"
        >
          {isSearching ? "..." : "🔍"}
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-cream border border-silver-light rounded-lg overflow-hidden">
          {suggestions.map((loc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectLocation(loc)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-moonlight transition-colors border-b border-parchment-dark last:border-b-0"
            >
              <span className="mr-2">📍</span>
              {loc.name}
            </button>
          ))}
        </div>
      )}

      {/* Selected location */}
      {value && (
        <div className="flex items-center justify-between p-2 bg-moonlight rounded-lg text-sm">
          <span>
            <span className="mr-2">✓</span>
            {value.name}
          </span>
          <button
            type="button"
            onClick={clearLocation}
            className="text-red-600 hover:text-red-700 text-xs"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
