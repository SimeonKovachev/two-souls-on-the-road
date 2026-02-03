"use client";

import { supabase, isSupabaseConfigured } from "./supabase";
import {
  Chapter,
  DayEntry,
  Letter,
  TimeCapsule,
  Photo,
  Moment,
  Author,
  Mood,
  MapLocation,
  generateId,
  getRandomReflectionPrompt,
  getRandomDailyPrompts,
} from "./types";

const STORAGE_KEY = "two-souls-chapters";
const isBrowser = typeof window !== "undefined";

// ============================================
// HYBRID STORAGE: Supabase + localStorage fallback
// ============================================

// ============================================
// CHAPTER OPERATIONS
// ============================================

export async function getAllChapters(): Promise<Chapter[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform from DB format to app format
      return (data || []).map(transformChapterFromDB);
    } catch (error) {
      console.error("Supabase error, falling back to localStorage:", error);
    }
  }

  // Fallback to localStorage
  return getAllChaptersLocal();
}

export function getAllChaptersLocal(): Chapter[] {
  if (!isBrowser) return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const chapters = JSON.parse(data) as Chapter[];
    // Ensure backwards compatibility
    return chapters.map(ensureChapterDefaults);
  } catch (error) {
    console.error("Error reading chapters:", error);
    return [];
  }
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  if (isSupabaseConfigured()) {
    try {
      // Get chapter with all related data
      const { data: chapter, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!chapter) return null;

      // Get day entries
      const { data: dayEntries } = await supabase
        .from("day_entries")
        .select("*")
        .eq("chapter_id", id)
        .order("date", { ascending: true });

      // Get letters
      const { data: letters } = await supabase
        .from("letters")
        .select("*")
        .eq("chapter_id", id)
        .order("created_at", { ascending: true });

      // Get time capsules
      const { data: timeCapsules } = await supabase
        .from("time_capsules")
        .select("*")
        .eq("chapter_id", id);

      // Get unexpected moments
      const { data: unexpectedMoments } = await supabase
        .from("unexpected_moments")
        .select("*")
        .eq("chapter_id", id);

      // Get legacy moments
      const { data: moments } = await supabase
        .from("moments")
        .select("*")
        .eq("chapter_id", id);

      // For each day entry, get photos, thoughts, prompts
      const enrichedDayEntries = await Promise.all(
        (dayEntries || []).map(async (entry) => {
          const [photos, thoughts, prompts] = await Promise.all([
            supabase.from("photos").select("*").eq("day_entry_id", entry.id),
            supabase.from("thoughts").select("*").eq("day_entry_id", entry.id),
            supabase.from("prompts").select("*").eq("day_entry_id", entry.id),
          ]);

          return transformDayEntryFromDB(entry, photos.data || [], thoughts.data || [], prompts.data || []);
        })
      );

      return {
        ...transformChapterFromDB(chapter),
        dayEntries: enrichedDayEntries,
        letters: (letters || []).map(transformLetterFromDB),
        timeCapsules: (timeCapsules || []).map(transformTimeCapsuleFromDB),
        unexpectedMoments: (unexpectedMoments || []).map((m) => ({
          id: m.id,
          text: m.text,
          author: m.author as Author,
          createdAt: m.created_at,
        })),
        moments: (moments || []).map(transformMomentFromDB),
      };
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  // Fallback to localStorage
  return getChapterByIdLocal(id);
}

export function getChapterByIdLocal(id: string): Chapter | null {
  const chapters = getAllChaptersLocal();
  const chapter = chapters.find((c) => c.id === id);
  return chapter ? ensureChapterDefaults(chapter) : null;
}

export async function createChapter(
  destination: string,
  dateFrom?: string,
  dateTo?: string,
  coverLine?: string,
  location?: MapLocation
): Promise<Chapter> {
  const now = new Date().toISOString();
  const reflectionPrompt = getRandomReflectionPrompt();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .insert({
          destination,
          date_from: dateFrom || null,
          date_to: dateTo || null,
          cover_line: coverLine || null,
          location: location || null,
          moods: [],
          reflection_prompt: reflectionPrompt,
          sealed: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Create day entries if dates are provided
      if (dateFrom && dateTo && data) {
        await createDayEntriesForChapter(data.id, dateFrom, dateTo);
      }

      return transformChapterFromDB(data);
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  // Fallback to localStorage
  return createChapterLocal(destination, dateFrom, dateTo, coverLine, location);
}

export function createChapterLocal(
  destination: string,
  dateFrom?: string,
  dateTo?: string,
  coverLine?: string,
  location?: MapLocation
): Chapter {
  const now = new Date().toISOString();
  const chapter: Chapter = {
    id: generateId(),
    destination,
    dateFrom,
    dateTo,
    coverLine,
    location,
    moods: [],
    moments: [],
    dayEntries: [],
    letters: [],
    timeCapsules: [],
    unexpectedMoments: [],
    reflectionPrompt: getRandomReflectionPrompt(),
    sealed: false,
    createdAt: now,
    updatedAt: now,
  };

  // Create day entries if dates are provided
  if (dateFrom && dateTo) {
    chapter.dayEntries = createDayEntriesLocal(chapter.id, dateFrom, dateTo);
  }

  saveChapterLocal(chapter);
  return chapter;
}

async function createDayEntriesForChapter(chapterId: string, dateFrom: string, dateTo: string) {
  const dates = getDaysBetween(dateFrom, dateTo);

  for (const date of dates) {
    await supabase.from("day_entries").insert({
      chapter_id: chapterId,
      date,
    });
  }
}

function createDayEntriesLocal(chapterId: string, dateFrom: string, dateTo: string): DayEntry[] {
  const dates = getDaysBetween(dateFrom, dateTo);
  const now = new Date().toISOString();

  return dates.map((date) => ({
    id: generateId(),
    chapterId,
    date,
    photos: [],
    prompts: [],
    thoughts: [],
    createdAt: now,
    updatedAt: now,
  }));
}

function getDaysBetween(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from);
  const end = new Date(to);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export async function updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | null> {
  if (isSupabaseConfigured()) {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
      if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
      if (updates.dateFrom !== undefined) dbUpdates.date_from = updates.dateFrom;
      if (updates.dateTo !== undefined) dbUpdates.date_to = updates.dateTo;
      if (updates.coverLine !== undefined) dbUpdates.cover_line = updates.coverLine;
      if (updates.coverPhotoUrl !== undefined) dbUpdates.cover_photo_url = updates.coverPhotoUrl;
      if (updates.moods !== undefined) dbUpdates.moods = updates.moods;
      if (updates.reflection !== undefined) dbUpdates.reflection = updates.reflection;
      if (updates.sealed !== undefined) dbUpdates.sealed = updates.sealed;
      if (updates.firstImpression !== undefined) dbUpdates.first_impression = updates.firstImpression;
      if (updates.lastNightThoughts !== undefined) dbUpdates.last_night_thoughts = updates.lastNightThoughts;

      const { data, error } = await supabase
        .from("chapters")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return getChapterById(id);
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  return updateChapterLocal(id, updates);
}

export function updateChapterLocal(id: string, updates: Partial<Chapter>): Chapter | null {
  const chapter = getChapterByIdLocal(id);
  if (!chapter) return null;

  const updated = { ...chapter, ...updates, updatedAt: new Date().toISOString() };
  saveChapterLocal(updated);
  return updated;
}

export async function deleteChapter(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      if (error) throw error;
      return;
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  deleteChapterLocal(id);
}

export function deleteChapterLocal(id: string): void {
  if (!isBrowser) return;
  const chapters = getAllChaptersLocal().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
}

export function saveChapterLocal(chapter: Chapter): void {
  if (!isBrowser) return;

  const chapters = getAllChaptersLocal();
  const existingIndex = chapters.findIndex((c) => c.id === chapter.id);

  if (existingIndex >= 0) {
    chapters[existingIndex] = { ...chapter, updatedAt: new Date().toISOString() };
  } else {
    chapters.push(chapter);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
}

// ============================================
// DAY ENTRY OPERATIONS
// ============================================

export async function updateDayEntry(
  chapterId: string,
  dayEntryId: string,
  updates: Partial<DayEntry>
): Promise<DayEntry | null> {
  if (isSupabaseConfigured()) {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.morningMood !== undefined) dbUpdates.morning_mood = updates.morningMood;
      if (updates.eveningMood !== undefined) dbUpdates.evening_mood = updates.eveningMood;
      if (updates.gratitude !== undefined) dbUpdates.gratitude = updates.gratitude;
      if (updates.gratitudeAuthor !== undefined) dbUpdates.gratitude_author = updates.gratitudeAuthor;
      if (updates.wordOfTheDay !== undefined) dbUpdates.word_of_the_day = updates.wordOfTheDay;

      const { error } = await supabase
        .from("day_entries")
        .update(dbUpdates)
        .eq("id", dayEntryId);

      if (error) throw error;

      const chapter = await getChapterById(chapterId);
      return chapter?.dayEntries.find((d) => d.id === dayEntryId) || null;
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  return updateDayEntryLocal(chapterId, dayEntryId, updates);
}

export function updateDayEntryLocal(
  chapterId: string,
  dayEntryId: string,
  updates: Partial<DayEntry>
): DayEntry | null {
  const chapter = getChapterByIdLocal(chapterId);
  if (!chapter) return null;

  const entryIndex = chapter.dayEntries.findIndex((d) => d.id === dayEntryId);
  if (entryIndex === -1) return null;

  chapter.dayEntries[entryIndex] = {
    ...chapter.dayEntries[entryIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveChapterLocal(chapter);
  return chapter.dayEntries[entryIndex];
}

// ============================================
// THOUGHT OPERATIONS
// ============================================

export async function addThought(
  chapterId: string,
  dayEntryId: string,
  text: string,
  author: Author
): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("thoughts").insert({
        day_entry_id: dayEntryId,
        text,
        author,
      });

      if (error) throw error;
      return;
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  addThoughtLocal(chapterId, dayEntryId, text, author);
}

export function addThoughtLocal(
  chapterId: string,
  dayEntryId: string,
  text: string,
  author: Author
): void {
  const chapter = getChapterByIdLocal(chapterId);
  if (!chapter) return;

  const entryIndex = chapter.dayEntries.findIndex((d) => d.id === dayEntryId);
  if (entryIndex === -1) return;

  chapter.dayEntries[entryIndex].thoughts.push({
    id: generateId(),
    text,
    author,
    createdAt: new Date().toISOString(),
  });

  saveChapterLocal(chapter);
}

// ============================================
// PROMPT ANSWER OPERATIONS
// ============================================

export async function answerPrompt(
  chapterId: string,
  dayEntryId: string,
  question: string,
  answer: string,
  author: Author
): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("prompts").insert({
        day_entry_id: dayEntryId,
        question,
        answer,
        author,
      });

      if (error) throw error;
      return;
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  answerPromptLocal(chapterId, dayEntryId, question, answer, author);
}

export function answerPromptLocal(
  chapterId: string,
  dayEntryId: string,
  question: string,
  answer: string,
  author: Author
): void {
  const chapter = getChapterByIdLocal(chapterId);
  if (!chapter) return;

  const entryIndex = chapter.dayEntries.findIndex((d) => d.id === dayEntryId);
  if (entryIndex === -1) return;

  chapter.dayEntries[entryIndex].prompts.push({
    promptId: generateId(),
    question,
    answer,
    author,
    answeredAt: new Date().toISOString(),
  });

  saveChapterLocal(chapter);
}

// ============================================
// LETTER OPERATIONS
// ============================================

export async function createLetter(
  chapterId: string,
  from: Author,
  to: Author,
  content: string
): Promise<Letter | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("letters")
        .insert({
          chapter_id: chapterId,
          from_author: from,
          to_author: to,
          content,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;
      return transformLetterFromDB(data);
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  return createLetterLocal(chapterId, from, to, content);
}

export function createLetterLocal(
  chapterId: string,
  from: Author,
  to: Author,
  content: string
): Letter | null {
  const chapter = getChapterByIdLocal(chapterId);
  if (!chapter) return null;

  const letter: Letter = {
    id: generateId(),
    chapterId,
    from,
    to,
    content,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  chapter.letters.push(letter);
  saveChapterLocal(chapter);
  return letter;
}

export async function markLetterRead(chapterId: string, letterId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from("letters")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", letterId);

      if (error) throw error;
      return;
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  markLetterReadLocal(chapterId, letterId);
}

export function markLetterReadLocal(chapterId: string, letterId: string): void {
  const chapter = getChapterByIdLocal(chapterId);
  if (!chapter) return;

  const letterIndex = chapter.letters.findIndex((l) => l.id === letterId);
  if (letterIndex === -1) return;

  chapter.letters[letterIndex].isRead = true;
  chapter.letters[letterIndex].readAt = new Date().toISOString();
  saveChapterLocal(chapter);
}

// ============================================
// TIME CAPSULE OPERATIONS
// ============================================

export async function createTimeCapsule(
  chapterId: string,
  title: string,
  content: string,
  author: Author,
  unlockDate: string
): Promise<TimeCapsule | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("time_capsules")
        .insert({
          chapter_id: chapterId,
          title,
          content,
          author,
          unlock_date: unlockDate,
          is_unlocked: false,
        })
        .select()
        .single();

      if (error) throw error;
      return transformTimeCapsuleFromDB(data);
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  return createTimeCapsuleLocal(chapterId, title, content, author, unlockDate);
}

export function createTimeCapsuleLocal(
  chapterId: string,
  title: string,
  content: string,
  author: Author,
  unlockDate: string
): TimeCapsule | null {
  const chapter = getChapterByIdLocal(chapterId);
  if (!chapter) return null;

  const capsule: TimeCapsule = {
    id: generateId(),
    chapterId,
    title,
    content,
    photos: [],
    author,
    unlockDate,
    isUnlocked: false,
    createdAt: new Date().toISOString(),
  };

  chapter.timeCapsules.push(capsule);
  saveChapterLocal(chapter);
  return capsule;
}

export async function unlockTimeCapsule(chapterId: string, capsuleId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from("time_capsules")
        .update({ is_unlocked: true, unlocked_at: new Date().toISOString() })
        .eq("id", capsuleId);

      if (error) throw error;
      return;
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  unlockTimeCapsuleLocal(chapterId, capsuleId);
}

export function unlockTimeCapsuleLocal(chapterId: string, capsuleId: string): void {
  const chapter = getChapterByIdLocal(chapterId);
  if (!chapter) return;

  const capsuleIndex = chapter.timeCapsules.findIndex((c) => c.id === capsuleId);
  if (capsuleIndex === -1) return;

  chapter.timeCapsules[capsuleIndex].isUnlocked = true;
  chapter.timeCapsules[capsuleIndex].unlockedAt = new Date().toISOString();
  saveChapterLocal(chapter);
}

// ============================================
// MOOD OPERATIONS
// ============================================

export async function toggleMood(chapterId: string, mood: Mood): Promise<Chapter | null> {
  const chapter = await getChapterById(chapterId);
  if (!chapter) return null;

  const moodIndex = chapter.moods.indexOf(mood);
  const newMoods = [...chapter.moods];

  if (moodIndex >= 0) {
    newMoods.splice(moodIndex, 1);
  } else {
    newMoods.push(mood);
  }

  return updateChapter(chapterId, { moods: newMoods });
}

// ============================================
// SEAL OPERATIONS
// ============================================

export async function toggleSeal(chapterId: string): Promise<Chapter | null> {
  const chapter = await getChapterById(chapterId);
  if (!chapter) return null;

  return updateChapter(chapterId, { sealed: !chapter.sealed });
}

// ============================================
// PHOTO UPLOAD
// ============================================

export async function uploadPhoto(
  file: File,
  chapterId: string,
  dayEntryId?: string,
  author: Author = "ива"
): Promise<Photo | null> {
  if (isSupabaseConfigured()) {
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${chapterId}/${generateId()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      // Save to database
      const { data, error } = await supabase
        .from("photos")
        .insert({
          day_entry_id: dayEntryId || null,
          chapter_id: chapterId,
          url: urlData.publicUrl,
          author,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        url: data.url,
        caption: data.caption,
        author: data.author as Author,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  // Fallback: convert to data URL and store locally
  const dataUrl = await fileToDataUrl(file);
  const compressed = await compressImage(dataUrl, 1200, 0.7);

  return {
    id: generateId(),
    url: compressed,
    author,
    createdAt: new Date().toISOString(),
  };
}

// ============================================
// LEGACY MOMENT OPERATIONS (backwards compatibility)
// ============================================

export async function addMoment(
  chapterId: string,
  text: string,
  photoDataUrl?: string,
  author?: Author
): Promise<Moment | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("moments")
        .insert({
          chapter_id: chapterId,
          text,
          photo_data_url: photoDataUrl,
          author,
        })
        .select()
        .single();

      if (error) throw error;
      return transformMomentFromDB(data);
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  return addMomentLocal(chapterId, text, photoDataUrl, author);
}

export function addMomentLocal(
  chapterId: string,
  text: string,
  photoDataUrl?: string,
  author?: Author
): Moment | null {
  const chapter = getChapterByIdLocal(chapterId);
  if (!chapter) return null;

  const moment: Moment = {
    id: generateId(),
    text,
    photoDataUrl,
    author,
    createdAt: Date.now(),
  };

  chapter.moments.push(moment);
  saveChapterLocal(chapter);
  return moment;
}

export async function deleteMoment(chapterId: string, momentId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("moments").delete().eq("id", momentId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Supabase error:", error);
    }
  }

  return deleteMomentLocal(chapterId, momentId);
}

export function deleteMomentLocal(chapterId: string, momentId: string): boolean {
  const chapter = getChapterByIdLocal(chapterId);
  if (!chapter) return false;

  const initialLength = chapter.moments.length;
  chapter.moments = chapter.moments.filter((m) => m.id !== momentId);

  if (chapter.moments.length !== initialLength) {
    saveChapterLocal(chapter);
    return true;
  }
  return false;
}

// ============================================
// EXPORT / IMPORT
// ============================================

export interface ExportData {
  version: string;
  exportedAt: string;
  chapters: Chapter[];
}

export async function exportData(): Promise<ExportData> {
  const chapters = await getAllChapters();
  return {
    version: "2.0.0",
    exportedAt: new Date().toISOString(),
    chapters,
  };
}

export async function downloadExport(): Promise<void> {
  const data = await exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `two-souls-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString) as ExportData;

    if (!data.chapters || !Array.isArray(data.chapters)) {
      return { success: false, message: "Invalid backup file format" };
    }

    let imported = 0;

    for (const chapter of data.chapters) {
      if (!chapter.id || !chapter.destination) continue;

      // For now, just save to localStorage
      // TODO: Import to Supabase if configured
      saveChapterLocal(ensureChapterDefaults(chapter));
      imported++;
    }

    return {
      success: true,
      message: `Imported ${imported} chapter(s)`,
    };
  } catch {
    return { success: false, message: "Failed to parse backup file" };
  }
}

// ============================================
// PHOTO HANDLING UTILITIES
// ============================================

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function compressImage(
  dataUrl: string,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

// ============================================
// STORAGE INFO
// ============================================

export function getStorageInfo(): { used: string; warning: boolean } {
  if (!isBrowser) return { used: "0 KB", warning: false };

  const data = localStorage.getItem(STORAGE_KEY) || "";
  const bytes = new Blob([data]).size;
  const kb = bytes / 1024;
  const mb = kb / 1024;

  const warning = mb > 4;

  if (mb >= 1) {
    return { used: `${mb.toFixed(2)} MB`, warning };
  }
  return { used: `${kb.toFixed(0)} KB`, warning };
}

// ============================================
// TRANSFORMATION HELPERS
// ============================================

function transformChapterFromDB(data: Record<string, unknown>): Chapter {
  return {
    id: data.id as string,
    destination: data.destination as string,
    subtitle: data.subtitle as string | undefined,
    dateFrom: data.date_from as string | undefined,
    dateTo: data.date_to as string | undefined,
    coverLine: data.cover_line as string | undefined,
    coverPhotoUrl: data.cover_photo_url as string | undefined,
    location: data.location as MapLocation | undefined,
    moods: (data.moods as Mood[]) || [],
    moments: [],
    dayEntries: [],
    letters: [],
    timeCapsules: [],
    unexpectedMoments: [],
    firstImpression: data.first_impression as Chapter["firstImpression"],
    lastNightThoughts: data.last_night_thoughts as Chapter["lastNightThoughts"],
    reflection: data.reflection as string | undefined,
    reflectionPrompt: data.reflection_prompt as string,
    sealed: data.sealed as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

function transformDayEntryFromDB(
  entry: Record<string, unknown>,
  photos: Record<string, unknown>[],
  thoughts: Record<string, unknown>[],
  prompts: Record<string, unknown>[]
): DayEntry {
  return {
    id: entry.id as string,
    chapterId: entry.chapter_id as string,
    date: entry.date as string,
    morningMood: entry.morning_mood as Mood | undefined,
    eveningMood: entry.evening_mood as Mood | undefined,
    photos: photos.map((p) => ({
      id: p.id as string,
      url: p.url as string,
      caption: p.caption as string | undefined,
      author: p.author as Author,
      createdAt: p.created_at as string,
    })),
    prompts: prompts.map((p) => ({
      promptId: p.id as string,
      question: p.question as string,
      answer: p.answer as string,
      author: p.author as Author,
      answeredAt: p.answered_at as string,
    })),
    thoughts: thoughts.map((t) => ({
      id: t.id as string,
      text: t.text as string,
      author: t.author as Author,
      createdAt: t.created_at as string,
    })),
    gratitude: entry.gratitude as string | undefined,
    gratitudeAuthor: entry.gratitude_author as Author | undefined,
    wordOfTheDay: entry.word_of_the_day as string | undefined,
    createdAt: entry.created_at as string,
    updatedAt: entry.updated_at as string,
  };
}

function transformLetterFromDB(data: Record<string, unknown>): Letter {
  return {
    id: data.id as string,
    chapterId: data.chapter_id as string,
    from: data.from_author as Author,
    to: data.to_author as Author,
    content: data.content as string,
    isRead: data.is_read as boolean,
    createdAt: data.created_at as string,
    readAt: data.read_at as string | undefined,
  };
}

function transformTimeCapsuleFromDB(data: Record<string, unknown>): TimeCapsule {
  return {
    id: data.id as string,
    chapterId: data.chapter_id as string,
    title: data.title as string,
    content: data.content as string,
    photos: [],
    author: data.author as Author,
    unlockDate: data.unlock_date as string,
    isUnlocked: data.is_unlocked as boolean,
    createdAt: data.created_at as string,
    unlockedAt: data.unlocked_at as string | undefined,
  };
}

function transformMomentFromDB(data: Record<string, unknown>): Moment {
  return {
    id: data.id as string,
    text: data.text as string,
    photoDataUrl: data.photo_data_url as string | undefined,
    author: data.author as Author | undefined,
    createdAt: new Date(data.created_at as string).getTime(),
    isFavorite: data.is_favorite as boolean | undefined,
  };
}

function ensureChapterDefaults(chapter: Chapter): Chapter {
  return {
    ...chapter,
    dayEntries: chapter.dayEntries || [],
    letters: chapter.letters || [],
    timeCapsules: chapter.timeCapsules || [],
    unexpectedMoments: chapter.unexpectedMoments || [],
    moments: chapter.moments || [],
    moods: chapter.moods || [],
    createdAt: chapter.createdAt || new Date().toISOString(),
    updatedAt: chapter.updatedAt || new Date().toISOString(),
  };
}
