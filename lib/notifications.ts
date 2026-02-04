type NotificationType =
  | "time_capsule_ready"
  | "new_letter"
  | "anniversary"
  | "birthday"
  | "secret_note"
  | "memory_reminder"
  | "daily_prompt";

interface NotificationConfig {
  title: string;
  body: string;
  tag: string;
  data?: Record<string, string>;
}

const NOTIFICATION_MESSAGES: Record<NotificationType, (data?: Record<string, string>) => NotificationConfig> = {
  time_capsule_ready: (data) => ({
    title: "Time Capsule Unlocked!",
    body: data?.title
      ? `Your memory "${data.title}" is ready to open`
      : "A special memory is waiting for you",
    tag: "time-capsule",
    data,
  }),

  new_letter: (data) => ({
    title: "You have a love letter",
    body: data?.from
      ? `${data.from} wrote you something special`
      : "Someone special left you a message",
    tag: "letter",
    data,
  }),

  anniversary: (data) => ({
    title: "Happy Anniversary!",
    body: data?.days
      ? `${data.days} days of love and counting`
      : "Another beautiful milestone together",
    tag: "anniversary",
    data,
  }),

  birthday: (data) => ({
    title: `Happy Birthday${data?.name ? `, ${data.name}` : ""}!`,
    body: "Your partner has something special waiting",
    tag: "birthday",
    data,
  }),

  secret_note: (data) => ({
    title: "A Secret Message Awaits",
    body: data?.title || "Open the app to discover it",
    tag: "secret-note",
    data,
  }),

  memory_reminder: (data) => ({
    title: "Remember This?",
    body: data?.preview || "A beautiful memory from your journey",
    tag: "memory-reminder",
    data,
  }),

  daily_prompt: () => ({
    title: "Capture Today's Moment",
    body: "What made today special? Write it down together",
    tag: "daily-prompt",
  }),
};

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;

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

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;

    const result = await Notification.requestPermission();
    return result === "granted";
  }

  hasPermission(): boolean {
    return "Notification" in window && Notification.permission === "granted";
  }

  async send(type: NotificationType, data?: Record<string, string>): Promise<void> {
    if (!this.hasPermission()) return;

    const config = NOTIFICATION_MESSAGES[type](data);

    if (this.registration) {
      await this.registration.showNotification(config.title, {
        body: config.body,
        tag: config.tag,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: config.data,
        requireInteraction: type === "time_capsule_ready" || type === "new_letter",
      });
    } else {
      new Notification(config.title, {
        body: config.body,
        tag: config.tag,
        icon: "/icon-192.png",
      });
    }
  }

  async scheduleTimeCapsuleCheck(capsules: { id: string; title: string; unlockDate: string }[]): Promise<void> {
    const today = new Date().toISOString().split("T")[0];

    for (const capsule of capsules) {
      if (capsule.unlockDate === today) {
        await this.send("time_capsule_ready", {
          title: capsule.title,
          capsuleId: capsule.id,
        });
      }
    }
  }

  async checkAnniversary(anniversaryDate: string): Promise<void> {
    const today = new Date();
    const anniversary = new Date(anniversaryDate);

    if (
      today.getMonth() === anniversary.getMonth() &&
      today.getDate() === anniversary.getDate()
    ) {
      const years = today.getFullYear() - anniversary.getFullYear();
      const days = Math.floor((today.getTime() - anniversary.getTime()) / (1000 * 60 * 60 * 24));

      await this.send("anniversary", {
        years: years.toString(),
        days: days.toString(),
      });
    }
  }

  async checkBirthday(birthday: string, name: string): Promise<void> {
    const today = new Date();
    const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (birthday === todayMD) {
      await this.send("birthday", { name });
    }
  }

  async notifyNewLetter(from: string): Promise<void> {
    await this.send("new_letter", { from });
  }

  async notifySecretNote(title: string): Promise<void> {
    await this.send("secret_note", { title });
  }

  async notifyMemoryReminder(preview: string, chapterId: string): Promise<void> {
    await this.send("memory_reminder", { preview, chapterId });
  }
}

export const notificationService = new NotificationService();
