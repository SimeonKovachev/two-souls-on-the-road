// Supabase Edge Function to send push notifications
// This runs as a cron job every minute to check for pending notifications

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

// VAPID keys for Web Push
const VAPID_PUBLIC_KEY = "BKIdbuT3Iowr_UmuAfYhvJfADaVGfACgam6aQe1VNAVpX2gNRApG3Khf7lYflr-dKXZ76wHlGQL6K7wgBTaSXto";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_EMAIL = "mailto:twosouls@love.com";

// Configure web-push
webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

interface Notification {
  id: string;
  user_target: "ива" | "мео" | "both";
  notification_type: string;
  title: string;
  body: string;
  scheduled_for: string;
  chapter_id?: string;
}

interface PushSubscription {
  id: string;
  user_target: "ива" | "мео";
  endpoint: string;
  p256dh: string;
  auth: string;
}

Deno.serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();

    // Get pending notifications that should be sent
    const { data: notifications, error: notifError } = await supabase
      .from("scheduled_notifications")
      .select("*")
      .eq("is_sent", false)
      .lte("scheduled_for", now)
      .limit(50);

    if (notifError) {
      console.error("Error fetching notifications:", notifError);
      return new Response(JSON.stringify({ error: notifError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({ message: "No pending notifications" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${notifications.length} pending notifications`);

    // Get all push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(JSON.stringify({ error: subError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No push subscriptions found");
      // Mark notifications as sent anyway to prevent re-processing
      const ids = notifications.map((n: Notification) => n.id);
      await supabase
        .from("scheduled_notifications")
        .update({ is_sent: true })
        .in("id", ids);

      return new Response(JSON.stringify({ message: "No subscriptions, marked as sent" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    let failed = 0;

    // Process each notification
    for (const notification of notifications as Notification[]) {
      // Find relevant subscriptions based on user_target
      const targetSubscriptions = subscriptions.filter((sub: PushSubscription) => {
        if (notification.user_target === "both") return true;
        return sub.user_target === notification.user_target;
      });

      // Send to each subscription
      for (const sub of targetSubscriptions as PushSubscription[]) {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const payload = JSON.stringify({
          title: notification.title,
          body: notification.body,
          url: notification.chapter_id ? `/chapter/${notification.chapter_id}` : "/",
        });

        try {
          await webpush.sendNotification(pushSubscription, payload);
          sent++;
          console.log(`Sent notification to ${sub.user_target}`);
        } catch (error: unknown) {
          failed++;
          console.error(`Failed to send to ${sub.endpoint}:`, error);

          // Remove invalid subscriptions (410 Gone or 404 Not Found)
          const err = error as { statusCode?: number };
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
            console.log(`Removed invalid subscription ${sub.id}`);
          }
        }
      }

      // Mark notification as sent
      await supabase
        .from("scheduled_notifications")
        .update({ is_sent: true })
        .eq("id", notification.id);
    }

    // Also check for secret notes that should be shown
    const { data: secretNotes, error: secretError } = await supabase
      .from("secret_notes")
      .select("*")
      .eq("is_shown", false)
      .lte("show_at", now);

    if (!secretError && secretNotes && secretNotes.length > 0) {
      for (const note of secretNotes) {
        // Find subscriptions for the recipient
        const targetSubs = subscriptions.filter(
          (sub: PushSubscription) => sub.user_target === note.recipient
        );

        for (const sub of targetSubs as PushSubscription[]) {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          const payload = JSON.stringify({
            title: `Secret Note from ${note.author === "ива" ? "Ива" : "Мео"}`,
            body: note.title,
            url: "/settings",
          });

          try {
            await webpush.sendNotification(pushSubscription, payload);
            sent++;
          } catch (error) {
            failed++;
            console.error("Failed to send secret note notification:", error);
          }
        }

        // Mark as shown
        await supabase
          .from("secret_notes")
          .update({ is_shown: true })
          .eq("id", note.id);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Notifications processed",
        sent,
        failed,
        processed: notifications.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
