// Two Souls on the Road - Enhanced Type Definitions

// ============================================
// AUTHORS
// ============================================

export type Author = "ива" | "мео";

export const AUTHORS: { id: Author; name: string; icon: string }[] = [
  { id: "ива", name: "Ива", icon: "🌸" },
  { id: "мео", name: "Мео", icon: "🌙" },
];

// ============================================
// MOODS
// ============================================

export type Mood = "calm" | "warm" | "inspired" | "free" | "grounded" | "dreamy" | "adventurous" | "melancholic" | "grateful" | "playful";

export interface MoodOption {
  id: Mood;
  label: string;
  icon: string;
  tooltip: string;
  color: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: "calm", label: "Calm", icon: "🌊", tooltip: "Peaceful and serene", color: "#7BA3C9" },
  { id: "warm", label: "Warm", icon: "🕯️", tooltip: "Cozy and tender", color: "#D4A574" },
  { id: "inspired", label: "Inspired", icon: "✨", tooltip: "Creative and alive", color: "#E8B86D" },
  { id: "free", label: "Free", icon: "🦋", tooltip: "Light and unbounded", color: "#9BC4CB" },
  { id: "grounded", label: "Grounded", icon: "🌿", tooltip: "Rooted and present", color: "#8BA888" },
  { id: "dreamy", label: "Dreamy", icon: "🌙", tooltip: "Soft and ethereal", color: "#A78BBA" },
  { id: "adventurous", label: "Adventurous", icon: "🗺️", tooltip: "Bold and curious", color: "#C9896D" },
  { id: "melancholic", label: "Melancholic", icon: "🍂", tooltip: "Beautifully bittersweet", color: "#9A8478" },
  { id: "grateful", label: "Grateful", icon: "🙏", tooltip: "Full of appreciation", color: "#C9A962" },
  { id: "playful", label: "Playful", icon: "🎈", tooltip: "Light-hearted joy", color: "#D4899A" },
];

// ============================================
// PHOTOS
// ============================================

export interface Photo {
  id: string;
  url: string; // Supabase storage URL or data URL
  caption?: string;
  author: Author;
  createdAt: string;
}

// ============================================
// DAILY ENTRIES
// ============================================

export interface DayEntry {
  id: string;
  chapterId: string;
  date: string; // YYYY-MM-DD

  // Mood tracking
  morningMood?: Mood;
  eveningMood?: Mood;

  // The day's story
  photos: Photo[];

  // Journaling prompts (answered)
  prompts: {
    promptId: string;
    question: string;
    answer: string;
    author: Author;
    answeredAt: string;
  }[];

  // Quick thoughts throughout the day
  thoughts: {
    id: string;
    text: string;
    author: Author;
    createdAt: string;
  }[];

  // Gratitude
  gratitude?: string;
  gratitudeAuthor?: Author;

  // One word for the day
  wordOfTheDay?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================
// LETTERS (Private notes to each other)
// ============================================

export interface Letter {
  id: string;
  chapterId: string;
  from: Author;
  to: Author;
  content: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

// ============================================
// TIME CAPSULES
// ============================================

export interface TimeCapsule {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  photos: Photo[];
  author: Author;
  unlockDate: string; // YYYY-MM-DD - when it can be opened
  isUnlocked: boolean;
  createdAt: string;
  unlockedAt?: string;
}

// ============================================
// LEGACY MOMENT TYPE (for backwards compatibility)
// ============================================

export interface Moment {
  id: string;
  text: string;
  photoDataUrl?: string;
  author?: Author;
  createdAt: number;
}

// ============================================
// CHAPTERS (Enhanced)
// ============================================

export interface Chapter {
  id: string;
  destination: string;
  subtitle?: string; // A poetic subtitle
  dateFrom?: string;
  dateTo?: string;
  coverLine?: string;
  coverPhotoUrl?: string;

  // Overall trip moods (summary)
  moods: Mood[];

  // Legacy moments (keeping for backwards compatibility)
  moments: Moment[];

  // Daily entries (the main content now)
  dayEntries: DayEntry[];

  // Letters between partners
  letters: Letter[];

  // Time capsules
  timeCapsules: TimeCapsule[];

  // First & Last impressions
  firstImpression?: {
    text: string;
    author: Author;
    createdAt: string;
  };
  lastNightThoughts?: {
    text: string;
    author: Author;
    createdAt: string;
  };

  // The unexpected - things you didn't plan
  unexpectedMoments: {
    id: string;
    text: string;
    author: Author;
    createdAt: string;
  }[];

  // Final reflection
  reflection?: string;
  reflectionPrompt: string;

  // Status
  sealed: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DAILY PROMPTS POOL
// ============================================

export const DAILY_PROMPTS: string[] = [
  // Sensory
  "What scent will you remember from today?",
  "What sound defined this day?",
  "Describe the light you saw today.",
  "What taste will stay with you?",
  "What did your hands touch today that felt meaningful?",

  // Emotional
  "What surprised you today?",
  "A small moment that made you smile",
  "What are you grateful for right now?",
  "What felt difficult today?",
  "When did you feel most alive today?",

  // Connection
  "What did you learn about each other today?",
  "A moment you shared without words",
  "Something your partner did that touched you",
  "A laugh you shared today",

  // Reflection
  "If this day were a color, what would it be?",
  "A song that would soundtrack this day",
  "What would you tell your past self about today?",
  "What do you want to remember most?",
  "How did this place change you today?",

  // Curiosity
  "A stranger you noticed today",
  "Something you ate that touched your soul",
  "A detail others might have missed",
  "What story would you tell about today?",
  "What remains a mystery from today?",
];

// Get random prompts for a day
export function getRandomDailyPrompts(count: number = 3): string[] {
  const shuffled = [...DAILY_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ============================================
// REFLECTION PROMPTS
// ============================================

export const REFLECTION_PROMPTS: string[] = [
  "What did this place awaken in you?",
  "Which moment would you return to if you could?",
  "What will you carry with you from this journey?",
  "How did this place change you, even slightly?",
  "What did you learn about each other here?",
  "What secret did this place whisper to you?",
  "If this trip were a chapter title, what would it be?",
  "What scent or sound will forever remind you of this place?",
  "What surprised you about traveling together this time?",
  "What do you hope to remember in ten years?",
];

export function getRandomReflectionPrompt(): string {
  const index = Math.floor(Math.random() * REFLECTION_PROMPTS.length);
  return REFLECTION_PROMPTS[index];
}

// ============================================
// UTILITIES
// ============================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateRange(from?: string, to?: string): string {
  if (!from && !to) return "";
  if (from && !to) return formatDate(from);
  if (!from && to) return formatDate(to);

  const fromDate = new Date(from!);
  const toDate = new Date(to!);

  if (fromDate.getFullYear() === toDate.getFullYear()) {
    if (fromDate.getMonth() === toDate.getMonth()) {
      return `${fromDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${toDate.getDate()}, ${toDate.getFullYear()}`;
    }
    return `${fromDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${toDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${toDate.getFullYear()}`;
  }

  return `${formatDate(from)} – ${formatDate(to)}`;
}

// Get days between two dates
export function getDaysBetween(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from);
  const end = new Date(to);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Check if a time capsule can be opened
export function canOpenTimeCapsule(capsule: TimeCapsule): boolean {
  if (capsule.isUnlocked) return true;
  const today = new Date().toISOString().split("T")[0];
  return today >= capsule.unlockDate;
}

// Get mood color
export function getMoodColor(mood: Mood): string {
  return MOOD_OPTIONS.find(m => m.id === mood)?.color || "#C9A962";
}

// Get mood icon
export function getMoodIcon(mood: Mood): string {
  return MOOD_OPTIONS.find(m => m.id === mood)?.icon || "✨";
}

// Get author info
export function getAuthorInfo(author: Author) {
  return AUTHORS.find(a => a.id === author) || AUTHORS[0];
}
