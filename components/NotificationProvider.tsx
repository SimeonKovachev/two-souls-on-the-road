"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface NotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission | "default";
  isSubscribed: boolean;
  requestPermission: () => Promise<boolean>;
  sendLocalNotification: (title: string, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  isSupported: false,
  permission: "default",
  isSubscribed: false,
  requestPermission: async () => false,
  sendLocalNotification: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "default">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register service worker and check notification support
  useEffect(() => {
    const init = async () => {
      // Check if notifications are supported
      if (!("Notification" in window)) {
        console.log("Notifications not supported");
        return;
      }

      setIsSupported(true);
      setPermission(Notification.permission);

      // Register service worker
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          setSwRegistration(registration);
          console.log("Service Worker registered");

          // Check if already subscribed to push
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      }
    };

    init();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted" && swRegistration) {
        // For now, we just track that permission was granted
        // In a production app, you'd subscribe to push notifications here
        setIsSubscribed(true);
        return true;
      }

      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported, swRegistration]);

  // Send a local notification (doesn't require push subscription)
  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== "granted") return;

    // Use service worker to show notification if available
    if (swRegistration) {
      swRegistration.showNotification(title, {
        icon: "/icon.svg",
        badge: "/icon.svg",
        ...options,
      });
    } else {
      // Fallback to regular notification
      new Notification(title, {
        icon: "/icon.svg",
        ...options,
      });
    }
  }, [isSupported, permission, swRegistration]);

  return (
    <NotificationContext.Provider
      value={{
        isSupported,
        permission,
        isSubscribed,
        requestPermission,
        sendLocalNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
