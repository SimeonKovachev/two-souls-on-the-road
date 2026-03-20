"use client";

import { supabase, isSupabaseConfigured } from "./supabase";
import { Author } from "./types";

// VAPID public key - this is safe to expose in client code
const VAPID_PUBLIC_KEY = "BKIdbuT3Iowr_UmuAfYhvJfADaVGfACgam6aQe1VNAVpX2gNRApG3Khf7lYflr-dKXZ76wHlGQL6K7wgBTaSXto";

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Get the current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported");
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(user: Author): Promise<boolean> {
  console.log("[PUSH] Starting subscription for user:", user);

  if (!isPushSupported()) {
    console.error("[PUSH] Not supported - serviceWorker:", "serviceWorker" in navigator, "PushManager:", "PushManager" in window);
    alert("Push notifications are not supported on this device/browser");
    return false;
  }

  if (!isSupabaseConfigured()) {
    console.error("[PUSH] Supabase not configured");
    alert("Database not configured");
    return false;
  }

  try {
    // Request permission if not granted
    console.log("[PUSH] Requesting permission...");
    const permission = await requestNotificationPermission();
    console.log("[PUSH] Permission result:", permission);
    if (permission !== "granted") {
      alert("Notification permission denied");
      return false;
    }

    // Get service worker registration
    console.log("[PUSH] Getting service worker...");
    const registration = await navigator.serviceWorker.ready;
    console.log("[PUSH] Service worker ready:", registration.scope);

    // Subscribe to push
    console.log("[PUSH] Subscribing to push manager...");
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    console.log("[PUSH] Got subscription:", subscription.endpoint);

    // Extract keys from subscription
    const subscriptionJson = subscription.toJSON();
    const keys = subscriptionJson.keys as { p256dh: string; auth: string };
    console.log("[PUSH] Keys extracted, saving to database...");

    // Check if subscription already exists
    const { data: existing, error: selectError } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", subscription.endpoint)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("[PUSH] Select error:", selectError);
    }

    if (existing) {
      // Update existing subscription
      console.log("[PUSH] Updating existing subscription...");
      const { error: updateError } = await supabase
        .from("push_subscriptions")
        .update({
          user_target: user,
          p256dh: keys.p256dh,
          auth: keys.auth,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("[PUSH] Update error:", updateError);
        alert("Failed to update subscription: " + updateError.message);
        return false;
      }
    } else {
      // Insert new subscription
      console.log("[PUSH] Inserting new subscription...");
      const { error: insertError } = await supabase.from("push_subscriptions").insert({
        user_target: user,
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });

      if (insertError) {
        console.error("[PUSH] Insert error:", insertError);
        alert("Failed to save subscription: " + insertError.message);
        return false;
      }
    }

    console.log("[PUSH] Subscription saved successfully!");
    return true;
  } catch (error) {
    console.error("[PUSH] Error:", error);
    alert("Error subscribing: " + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Remove from Supabase
      if (isSupabaseConfigured()) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);
      }

      // Unsubscribe from browser
      await subscription.unsubscribe();
    }

    return true;
  } catch (error) {
    console.error("Error unsubscribing from push:", error);
    return false;
  }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer as ArrayBuffer;
}
