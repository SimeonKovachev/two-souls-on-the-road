"use client";

import { supabase, isSupabaseConfigured } from "./supabase";
import { AppSettings, SpecialDate } from "./types";

const LOCAL_KEY = "two-souls-settings";

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  welcomeShown: false,
  specialDates: [],
};

function getLocalSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const stored = localStorage.getItem(LOCAL_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveLocalSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(settings));
}

export async function loadSettings(): Promise<AppSettings> {
  const localSettings = getLocalSettings();

  if (!isSupabaseConfigured()) {
    return localSettings;
  }

  try {
    const { data } = await supabase.from("app_settings").select("*").limit(1).single();

    if (data) {
      const settings: AppSettings = {
        darkMode: localSettings.darkMode,
        welcomeShown: localSettings.welcomeShown,
        specialDates: localSettings.specialDates,
        anniversaryDate: data.anniversary_date || undefined,
        ivaBirthday: data.iva_birthday ? formatDateForDisplay(data.iva_birthday) : undefined,
        meoBirthday: data.meo_birthday ? formatDateForDisplay(data.meo_birthday) : undefined,
      };
      saveLocalSettings(settings);
      return settings;
    }
  } catch (error) {
    console.error("Error loading settings from Supabase:", error);
  }

  return localSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  saveLocalSettings(settings);

  if (!isSupabaseConfigured()) return;

  try {
    const { data: existing } = await supabase.from("app_settings").select("id").limit(1);

    const updateData = {
      anniversary_date: settings.anniversaryDate || null,
      iva_birthday: settings.ivaBirthday ? parseBirthdayToDate(settings.ivaBirthday) : null,
      meo_birthday: settings.meoBirthday ? parseBirthdayToDate(settings.meoBirthday) : null,
      updated_at: new Date().toISOString(),
    };

    if (existing && existing.length > 0) {
      await supabase.from("app_settings").update(updateData).eq("id", existing[0].id);
    } else {
      await supabase.from("app_settings").insert(updateData);
    }
  } catch (error) {
    console.error("Error saving settings to Supabase:", error);
  }
}

function parseBirthdayToDate(mmdd: string): string | null {
  if (!mmdd || !mmdd.includes("-")) return null;
  const [month, day] = mmdd.split("-");
  if (!month || !day) return null;
  return `2000-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function formatDateForDisplay(date: string): string {
  if (!date) return "";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

export async function addSpecialDate(date: SpecialDate): Promise<void> {
  const settings = await loadSettings();
  settings.specialDates = [...settings.specialDates, date];
  await saveSettings(settings);
}

export async function removeSpecialDate(id: string): Promise<void> {
  const settings = await loadSettings();
  settings.specialDates = settings.specialDates.filter((d) => d.id !== id);
  await saveSettings(settings);
}
