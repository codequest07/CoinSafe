import { useState, useEffect, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/services/firebase";
import { toast } from "sonner";

interface UseFCMNotificationsConfig {
  vapidKey: string;
  onTokenReceived?: (token: string) => void;
  onError?: (error: Error) => void;
}

export const useFCMNotifications = (config: UseFCMNotificationsConfig) => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);

        if (Notification.permission === "granted") {
          await retrieveToken();
        }
      }
    };

    checkSupport();
  }, []);

  useEffect(() => {
    // Listen for foreground messages and show as toast
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);

      // Show toast notification
      toast(payload.notification?.title || "Notification", {
        description: payload.notification?.body,
        action: payload.data?.url
          ? {
              label: "View",
              onClick: () => (window.location.href = payload?.data?.url || ""),
            }
          : undefined,
      });
    });

    return () => unsubscribe();
  }, []);

  const retrieveToken = async () => {
    try {
      console.log("Get navigator ready......");
      // Ensure service worker is registered before accessing ready
      let registration: ServiceWorkerRegistration;
      if (navigator.serviceWorker.controller) {
        registration = await navigator.serviceWorker.ready;
      } else {
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        await navigator.serviceWorker.ready;
      }
      console.log("Registration", registration);
      
      const token = await getToken(messaging, {
        vapidKey: config.vapidKey,
        serviceWorkerRegistration: registration,
      });

      console.log("Navigator readyyy...");
      console.log("Registration", registration);
      
      if (token) {
        console.log("FCM Token:", token);
        setFcmToken(token);
        config.onTokenReceived?.(token);
      }
    } catch (err) {
      console.error("Error retrieving FCM token:", err);
    }
  };

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      const errorMsg = "Push notifications are not supported";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);

      if (newPermission !== "granted") {
        const errorMsg = "Notification permission denied";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return false;
      }

      console.log("Get navigator ready......");
      // Ensure service worker is registered before accessing ready
      let registration: ServiceWorkerRegistration;
      if (navigator.serviceWorker.controller) {
        registration = await navigator.serviceWorker.ready;
      } else {
        registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        await navigator.serviceWorker.ready;
      }
      console.log("Navigator readyyy...");
      console.log("Registration", registration);
      const token = await getToken(messaging, {
        vapidKey: config.vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        throw new Error("Failed to get FCM token");
      }

      console.log("FCM Token obtained:", token);
      setFcmToken(token);
      config.onTokenReceived?.(token);

      toast.success("Notifications enabled! You'll receive updates.");

      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to subscribe";
      setError(errorMessage);
      toast.error("Failed to enable notifications");
      console.error("Error subscribing to FCM:", err);
      config.onError?.(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
      return false;
    }
  }, [isSupported, config]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      setFcmToken(null);
      toast.success("Notifications disabled");
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unsubscribe";
      setError(errorMessage);
      toast.error("Failed to disable notifications");
      console.error("Error unsubscribing from FCM:", err);
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Sends a test push notification using the browser Notification API.
   */
  const sendTestNotification = useCallback(() => {
    if (permission !== "granted") {
      toast.error("Notification permission not granted");
      return;
    }

    try {
      new Notification("Test Notification", {
        body: "This is a test notification.",
        icon: "/icon-192.png", // Optional: update with your app icon path
        data: { url: "https://example.com" }, // Optional: custom data
      });
      toast.success("Test notification sent!");
    } catch (err) {
      toast.error("Failed to send test notification.");
      console.error("Notification error:", err);
    }
  }, [permission]);

  /**
   * Sends a custom notification using the browser Notification API.
   * @param title - Notification title
   * @param options - NotificationOptions (body, icon, data, etc.)
   */
  const sendCustomNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== "granted") {
        toast.error("Notification permission not granted");
        return;
      }
      try {
        new Notification(title, options);
        toast.success("Notification sent!");
      } catch (err) {
        toast.error("Failed to send notification.");
        console.error("Notification error:", err);
      }
    },
    [permission]
  );

  /**
   * Template functions for specific notification types.
   */
  const sendPromotionalNotification = useCallback(() => {
    sendCustomNotification("Special Offer!", {
      body: "Check out our latest promotions and deals.",
      icon: "/icon-192.png",
      data: { type: "promotional" },
    });
  }, [sendCustomNotification]);

  const sendMorningNotification = useCallback(() => {
    sendCustomNotification("Good Morning!", {
      body: "Start your day with CoinSafe. Check your daily yield!",
      icon: "/icon-192.png",
      data: { type: "morning" },
    });
  }, [sendCustomNotification]);

  const sendDailyYieldNotification = useCallback(
    (yieldAmount: number) => {
      sendCustomNotification("Daily Yield Accrued", {
        body: `You've earned ${yieldAmount} coins today!`,
        icon: "/icon-192.png",
        data: { type: "daily_yield", yield: yieldAmount },
      });
    },
    [sendCustomNotification]
  );

  const sendStreakUpdateNotification = useCallback(
    (streak: number) => {
      sendCustomNotification("Streak Update", {
        body: `Your current streak is ${streak} days! Keep it up!`,
        icon: "/icon-192.png",
        data: { type: "streak_update", streak },
      });
    },
    [sendCustomNotification]
  );

  /**
   * Automated notification template.
   * Call this function at a scheduled time (e.g., with setTimeout or a scheduler).
   */
  const sendAutomatedNotification = useCallback(
    (title: string, body: string, data?: Record<string, any>) => {
      sendCustomNotification(title, {
        body,
        icon: "/icon-192.png",
        data: { type: "automated", ...data },
      });
    },
    [sendCustomNotification]
  );

  return {
    permission,
    fcmToken,
    isSupported,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
    sendAutomatedNotification,
    sendCustomNotification,
    sendMorningNotification,
    sendDailyYieldNotification,
    sendPromotionalNotification,
    sendStreakUpdateNotification,
  };
};
