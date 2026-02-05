"use client";

import { supabase, isSupabaseConfigured } from "./supabase";
import { Author } from "./types";

export type NotificationType =
  | "morning_journal"
  | "evening_journal"
  | "secret_note"
  | "time_capsule"
  | "new_letter"
  | "memory_1month"
  | "memory_3months"
  | "memory_6months"
  | "memory_1year"
  | "birthday"
  | "anniversary";

export interface ScheduledNotification {
  id: string;
  user_target: Author | "both";
  notification_type: NotificationType;
  title: string;
  body: string;
  scheduled_for: string;
  is_sent: boolean;
  chapter_id?: string;
  created_at: string;
}

export interface SecretNote {
  id: string;
  title: string;
  message: string;
  author: Author;
  recipient: Author;
  show_at: string;
  is_shown: boolean;
  created_at: string;
}

const NOTIFICATION_MESSAGES: Record<NotificationType, { title: string; body: string }> = {
  morning_journal: {
    title: "Good morning!",
    body: "How are you feeling today? Take a moment to write in your journal.",
  },
  evening_journal: {
    title: "Good evening!",
    body: "How was your day? Share your evening thoughts before bed.",
  },
  secret_note: {
    title: "You have a secret message!",
    body: "Someone left you a love note. Open the app to read it!",
  },
  time_capsule: {
    title: "Time Capsule Ready!",
    body: "A memory from the past is waiting to be unlocked!",
  },
  new_letter: {
    title: "New Letter!",
    body: "Your partner wrote you a letter. Open it with love!",
  },
  memory_1month: {
    title: "1 Month Ago...",
    body: "Remember what you were doing a month ago? Take a look!",
  },
  memory_3months: {
    title: "3 Months Ago...",
    body: "A beautiful memory from 3 months ago is waiting for you!",
  },
  memory_6months: {
    title: "6 Months Ago...",
    body: "Half a year ago you created a special memory!",
  },
  memory_1year: {
    title: "1 Year Ago Today!",
    body: "Exactly one year ago... do you remember?",
  },
  birthday: {
    title: "Happy Birthday!",
    body: "Wishing you all the love in the world today!",
  },
  anniversary: {
    title: "Happy Anniversary!",
    body: "Celebrating another year of your beautiful journey together!",
  },
};

export async function scheduleNotification(
  userTarget: Author | "both",
  type: NotificationType,
  scheduledFor: Date,
  chapterId?: string,
  customTitle?: string,
  customBody?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const message = NOTIFICATION_MESSAGES[type];

  try {
    await supabase.from("scheduled_notifications").insert({
      user_target: userTarget,
      notification_type: type,
      title: customTitle || message.title,
      body: customBody || message.body,
      scheduled_for: scheduledFor.toISOString(),
      chapter_id: chapterId,
    });
    return true;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return false;
  }
}

export async function scheduleChapterNotifications(
  chapterId: string,
  dateFrom: string,
  dateTo: string,
  destination: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const start = new Date(dateFrom);
  const end = new Date(dateTo);

  const notifications: Array<{ date: Date; type: NotificationType; title?: string; body?: string }> = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const morning = new Date(d);
    morning.setHours(10, 0, 0, 0);
    notifications.push({
      date: new Date(morning),
      type: "morning_journal",
      title: "Good morning from " + destination + "!",
      body: "How are you feeling this morning? Write it down!"
    });

    const evening = new Date(d);
    evening.setHours(21, 0, 0, 0);
    notifications.push({
      date: new Date(evening),
      type: "evening_journal",
      title: "Good evening!",
      body: "How was your day in " + destination + "? Share your thoughts!"
    });
  }

  const oneMonth = new Date(end);
  oneMonth.setMonth(oneMonth.getMonth() + 1);
  oneMonth.setHours(12, 0, 0, 0);
  notifications.push({
    date: oneMonth,
    type: "memory_1month",
    title: "1 Month Since " + destination,
    body: "Remember your adventure? Take a look back!"
  });

  const threeMonths = new Date(end);
  threeMonths.setMonth(threeMonths.getMonth() + 3);
  threeMonths.setHours(12, 0, 0, 0);
  notifications.push({
    date: threeMonths,
    type: "memory_3months",
    title: "3 Months Since " + destination,
    body: "A beautiful memory from 3 months ago!"
  });

  const sixMonths = new Date(end);
  sixMonths.setMonth(sixMonths.getMonth() + 6);
  sixMonths.setHours(12, 0, 0, 0);
  notifications.push({
    date: sixMonths,
    type: "memory_6months",
    title: "6 Months Since " + destination,
    body: "Half a year since your special trip!"
  });

  const oneYear = new Date(end);
  oneYear.setFullYear(oneYear.getFullYear() + 1);
  oneYear.setHours(12, 0, 0, 0);
  notifications.push({
    date: oneYear,
    type: "memory_1year",
    title: "1 Year Since " + destination + "!",
    body: "Exactly one year ago you were there!"
  });

  for (const n of notifications) {
    if (n.date > new Date()) {
      await scheduleNotification("both", n.type, n.date, chapterId, n.title, n.body);
    }
  }
}

export async function createSecretNote(
  title: string,
  message: string,
  author: Author,
  recipient: Author,
  showAt: Date
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { data } = await supabase.from("secret_notes").insert({
      title,
      message,
      author,
      recipient,
      show_at: showAt.toISOString(),
    }).select().single();

    if (data) {
      await scheduleNotification(
        recipient,
        "secret_note",
        showAt,
        undefined,
        "You have a secret message!",
        `${author === "ива" ? "Ива" : "Мео"} left you a love note!`
      );
    }

    return true;
  } catch (error) {
    console.error("Error creating secret note:", error);
    return false;
  }
}

export async function getSecretNotesForUser(user: Author): Promise<SecretNote[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("secret_notes")
      .select("*")
      .eq("recipient", user)
      .lte("show_at", now)
      .order("show_at", { ascending: false });

    return data || [];
  } catch (error) {
    console.error("Error fetching secret notes:", error);
    return [];
  }
}

export async function getAllSecretNotes(): Promise<SecretNote[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data } = await supabase
      .from("secret_notes")
      .select("*")
      .order("show_at", { ascending: true });

    return data || [];
  } catch (error) {
    console.error("Error fetching all secret notes:", error);
    return [];
  }
}

export async function deleteSecretNote(noteId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    await supabase.from("secret_notes").delete().eq("id", noteId);
    return true;
  } catch (error) {
    console.error("Error deleting secret note:", error);
    return false;
  }
}

export async function markSecretNoteShown(noteId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    await supabase.from("secret_notes").update({ is_shown: true }).eq("id", noteId);
  } catch (error) {
    console.error("Error marking note as shown:", error);
  }
}

export async function getPendingNotifications(user: Author): Promise<ScheduledNotification[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("scheduled_notifications")
      .select("*")
      .or(`user_target.eq.${user},user_target.eq.both`)
      .lte("scheduled_for", now)
      .eq("is_sent", false)
      .order("scheduled_for", { ascending: true });

    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationSent(notificationId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    await supabase.from("scheduled_notifications").update({ is_sent: true }).eq("id", notificationId);
  } catch (error) {
    console.error("Error marking notification as sent:", error);
  }
}

export async function deleteChapterNotifications(chapterId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    await supabase
      .from("scheduled_notifications")
      .delete()
      .eq("chapter_id", chapterId)
      .eq("is_sent", false);
  } catch (error) {
    console.error("Error deleting chapter notifications:", error);
  }
}

class NotificationChecker {
  private registration: ServiceWorkerRegistration | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  async init(): Promise<boolean> {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      return true;
    } catch {
      return false;
    }
  }

  hasPermission(): boolean {
    return "Notification" in window && Notification.permission === "granted";
  }

  async showNotification(title: string, body: string, tag?: string): Promise<void> {
    if (!this.hasPermission()) return;

    if (this.registration) {
      await this.registration.showNotification(title, {
        body,
        tag: tag || "two-souls",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    } else {
      new Notification(title, {
        body,
        tag: tag || "two-souls",
        icon: "/favicon.ico",
      });
    }
  }

  async checkAndSendPending(user: Author): Promise<void> {
    const pending = await getPendingNotifications(user);

    for (const notification of pending) {
      await this.showNotification(
        notification.title,
        notification.body,
        notification.notification_type
      );
      await markNotificationSent(notification.id);
    }
  }

  startChecking(user: Author, intervalMs: number = 60000): void {
    this.stopChecking();
    this.checkAndSendPending(user);
    this.checkInterval = setInterval(() => {
      this.checkAndSendPending(user);
    }, intervalMs);
  }

  stopChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const notificationChecker = new NotificationChecker();
