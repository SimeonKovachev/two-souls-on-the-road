export type Author = "ива" | "мео";

export const AUTHORS: { id: Author; name: string }[] = [
  { id: "ива", name: "Ива" },
  { id: "мео", name: "Мео" },
];

export type Mood = "calm" | "warm" | "inspired" | "free" | "grounded" | "dreamy" | "adventurous" | "melancholic" | "grateful" | "playful";

export interface MoodOption {
  id: Mood;
  label: string;
  tooltip: string;
  color: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: "calm", label: "Calm", tooltip: "Peaceful and serene", color: "#8B9DC3" },
  { id: "warm", label: "Warm", tooltip: "Cozy and tender", color: "#C4A4B5" },
  { id: "inspired", label: "Inspired", tooltip: "Creative and alive", color: "#B8A5D6" },
  { id: "free", label: "Free", tooltip: "Light and unbounded", color: "#A8C5D9" },
  { id: "grounded", label: "Grounded", tooltip: "Rooted and present", color: "#9EB5A8" },
  { id: "dreamy", label: "Dreamy", tooltip: "Soft and ethereal", color: "#9D8EC2" },
  { id: "adventurous", label: "Adventurous", tooltip: "Bold and curious", color: "#7B6B8D" },
  { id: "melancholic", label: "Melancholic", tooltip: "Beautifully bittersweet", color: "#8E7B94" },
  { id: "grateful", label: "Grateful", tooltip: "Full of appreciation", color: "#A699C1" },
  { id: "playful", label: "Playful", tooltip: "Light-hearted joy", color: "#C9A4C5" },
];

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  author: Author;
  createdAt: string;
}

export interface DayEntry {
  id: string;
  chapterId: string;
  date: string;
  morningMood?: Mood;
  eveningMood?: Mood;
  photos: Photo[];
  prompts: {
    promptId: string;
    question: string;
    answer: string;
    author: Author;
    answeredAt: string;
  }[];
  thoughts: {
    id: string;
    text: string;
    author: Author;
    createdAt: string;
  }[];
  gratitude?: string;
  gratitudeAuthor?: Author;
  wordOfTheDay?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface TimeCapsule {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  photos: Photo[];
  author: Author;
  unlockDate: string;
  isUnlocked: boolean;
  createdAt: string;
  unlockedAt?: string;
}

export interface Moment {
  id: string;
  text: string;
  photoDataUrl?: string;
  author?: Author;
  createdAt: number;
  isFavorite?: boolean;
}

export interface SpecialDate {
  id: string;
  date: string;
  title: string;
  message: string;
  author: Author;
  isSecret: boolean;
}

export interface AppSettings {
  anniversaryDate?: string;
  darkMode: boolean;
  ivaBirthday?: string;
  meoBirthday?: string;
  welcomeShown: boolean;
  specialDates: SpecialDate[];
}

export interface MapLocation {
  lat: number;
  lng: number;
  name: string;
}

export interface Chapter {
  id: string;
  destination: string;
  subtitle?: string;
  dateFrom?: string;
  dateTo?: string;
  coverLine?: string;
  coverPhotoUrl?: string;
  location?: MapLocation;
  moods: Mood[];
  moments: Moment[];
  dayEntries: DayEntry[];
  letters: Letter[];
  timeCapsules: TimeCapsule[];
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
  unexpectedMoments: {
    id: string;
    text: string;
    author: Author;
    createdAt: string;
  }[];
  reflection?: string;
  reflectionPrompt: string;
  sealed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DAILY_PROMPTS: string[] = [
  "What scent will you remember from today?",
  "What sound defined this day?",
  "Describe the light you saw today.",
  "What taste will stay with you?",
  "What did your hands touch today that felt meaningful?",
  "What surprised you today?",
  "A small moment that made you smile",
  "What are you grateful for right now?",
  "What felt difficult today?",
  "When did you feel most alive today?",
  "What did you learn about each other today?",
  "A moment you shared without words",
  "Something your partner did that touched you",
  "A laugh you shared today",
  "If this day were a color, what would it be?",
  "A song that would soundtrack this day",
  "What would you tell your past self about today?",
  "What do you want to remember most?",
  "How did this place change you today?",
  "A stranger you noticed today",
  "Something you ate that touched your soul",
  "A detail others might have missed",
  "What story would you tell about today?",
  "What remains a mystery from today?",
];

export function getRandomDailyPrompts(count: number = 3): string[] {
  const shuffled = [...DAILY_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

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

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

export function canOpenTimeCapsule(capsule: TimeCapsule): boolean {
  if (capsule.isUnlocked) return true;
  const today = new Date().toISOString().split("T")[0];
  return today >= capsule.unlockDate;
}

export function getMoodColor(mood: Mood): string {
  return MOOD_OPTIONS.find(m => m.id === mood)?.color || "#C9A962";
}

export function getAuthorInfo(author: Author) {
  return AUTHORS.find(a => a.id === author) || AUTHORS[0];
}
